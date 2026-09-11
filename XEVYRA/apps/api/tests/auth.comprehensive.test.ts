import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { Router } from 'express';
import { createApp } from '../src/app.js';
import {
  IUserRepository,
  User,
  Email,
  IAuthAuditRepository,
  AuthAuditEvent,
} from '@xevyra/domain';
import { IFirebaseAuthService, DecodedAuthToken } from '../src/shared/auth/firebase-admin.client.js';
import { MongoDatabase } from '../src/shared/database/mongo.client.js';
import { loadApiConfig } from '@xevyra/config';
import { requireRole, requireOwnership } from '../src/shared/auth/authorization.middleware.js';
import { createAuthMiddleware } from '../src/shared/auth/firebase-auth.middleware.js';

// In-memory User Repository
class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.firebaseUid === firebaseUid) return user;
    }
    return null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email.value === email.toLowerCase()) return user;
    }
    return null;
  }

  async save(user: User): Promise<void> {
    // Enforce Firebase UID uniqueness constraint
    for (const existing of this.users.values()) {
      if (existing.firebaseUid === user.firebaseUid && existing.id !== user.id) {
        throw new Error(`Duplicate key error: firebaseUid '${user.firebaseUid}' already exists`);
      }
    }
    this.users.set(user.id, user);
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  clear(): void {
    this.users.clear();
  }
}

// In-memory Auth Audit Repository
class InMemoryAuthAuditRepository implements IAuthAuditRepository {
  public events: AuthAuditEvent[] = [];

  async recordEvent(event: AuthAuditEvent): Promise<void> {
    this.events.push(event);
  }

  async getRecentEventsByUser(userId: string, limit: number = 20): Promise<AuthAuditEvent[]> {
    return this.events
      .filter((e) => e.userId === userId)
      .slice(-limit);
  }

  clear(): void {
    this.events = [];
  }
}

// Mock Firebase Auth Service with token state simulation
class MockFirebaseAuthService implements IFirebaseAuthService {
  private tokens: Map<string, DecodedAuthToken> = new Map();
  private expiredTokens: Set<string> = new Set();

  constructor() {
    this.tokens.set('valid-athlete-token', {
      uid: 'fb_athlete_123',
      email: 'athlete@xevyra.fit',
      name: 'Test Athlete',
      picture: 'https://example.com/athlete.png',
    });

    this.tokens.set('valid-admin-token', {
      uid: 'fb_admin_999',
      email: 'admin@xevyra.fit',
      name: 'System Admin',
    });

    this.expiredTokens.add('expired-token-xyz');
  }

  isInitialized(): boolean {
    return true;
  }

  async verifyIdToken(token: string): Promise<DecodedAuthToken> {
    if (this.expiredTokens.has(token)) {
      const error: any = new Error('Firebase ID token has expired.');
      error.code = 'auth/id-token-expired';
      throw error;
    }

    const decoded = this.tokens.get(token);
    if (!decoded) {
      const error: any = new Error('Invalid Firebase ID token signature.');
      error.code = 'auth/argument-error';
      throw error;
    }

    return decoded;
  }
}

describe('Phase 2: Authentication, Identity & Session Management', () => {
  let app: any;
  let userRepo: InMemoryUserRepository;
  let auditRepo: InMemoryAuthAuditRepository;
  let authService: MockFirebaseAuthService;

  beforeEach(() => {
    const config = loadApiConfig({
      NODE_ENV: 'test',
      PORT: '4000',
    });
    userRepo = new InMemoryUserRepository();
    auditRepo = new InMemoryAuthAuditRepository();
    authService = new MockFirebaseAuthService();
    const db = MongoDatabase.getInstance();

    // Mount test protected routes for authorization and ownership testing
    const testRouter = Router();
    const authMiddleware = createAuthMiddleware(authService, userRepo);

    testRouter.get(
      '/admin-only',
      authMiddleware,
      requireRole(['ADMIN']),
      (_req, res) => {
        res.json({ secret: 'admin_dashboard_data' });
      }
    );

    testRouter.get(
      '/users/:userId/workouts',
      authMiddleware,
      requireOwnership('userId'),
      (req, res) => {
        res.json({ userId: req.params.userId, workouts: [] });
      }
    );

    app = createApp({
      config,
      db,
      userRepository: userRepo,
      authService,
      auditRepository: auditRepo,
      customRouter: { path: '/api/v1/test', router: testRouter },
    });
  });

  describe('Token Verification & Session Establishment (POST /api/v1/auth/session)', () => {
    it('should create new application user on first login with status 201', async () => {
      const res = await request(app)
        .post('/api/v1/auth/session')
        .set('Authorization', 'Bearer valid-athlete-token')
        .send({
          clientPlatform: 'WEB',
          timezone: 'America/Los_Angeles',
        });

      expect(res.status).toBe(201);
      expect(res.body.isNewUser).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.firebaseUid).toBe('fb_athlete_123');
      expect(res.body.user.email).toBe('athlete@xevyra.fit');
      expect(res.body.user.displayName).toBe('Test Athlete');
      expect(res.body.user.timezone).toBe('America/Los_Angeles');
      expect(res.body.user.role).toBe('USER');

      // Verify audit log
      expect(auditRepo.events.length).toBe(1);
      expect(auditRepo.events[0]?.eventType).toBe('LOGIN_SUCCESS');
      expect(auditRepo.events[0]?.firebaseUid).toBe('fb_athlete_123');

      // Verify cookie
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should authenticate existing user with status 200 on subsequent login', async () => {
      // First login
      await request(app)
        .post('/api/v1/auth/session')
        .set('Authorization', 'Bearer valid-athlete-token')
        .send({ clientPlatform: 'WEB' });

      // Subsequent login
      const res = await request(app)
        .post('/api/v1/auth/session')
        .set('Authorization', 'Bearer valid-athlete-token')
        .send({
          clientPlatform: 'FLUTTER_WEBVIEW',
          displayName: 'Updated Athlete Name',
        });

      expect(res.status).toBe(200);
      expect(res.body.isNewUser).toBe(false);
      expect(res.body.user.displayName).toBe('Updated Athlete Name');
      expect(auditRepo.events.length).toBe(2);
    });

    it('should reject expired Firebase ID tokens with 401 UNAUTHORIZED', async () => {
      const res = await request(app)
        .post('/api/v1/auth/session')
        .set('Authorization', 'Bearer expired-token-xyz')
        .send({ clientPlatform: 'WEB' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toContain('Invalid or expired authentication token');
    });

    it('should reject invalid/unrecognized Firebase tokens with 401 UNAUTHORIZED', async () => {
      const res = await request(app)
        .post('/api/v1/auth/session')
        .set('Authorization', 'Bearer tampered-or-corrupted-token')
        .send({ clientPlatform: 'WEB' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject missing Authorization header with 401 UNAUTHORIZED', async () => {
      const res = await request(app)
        .post('/api/v1/auth/session')
        .send({ clientPlatform: 'WEB' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toContain('Missing or invalid Authorization header');
    });

    it('should validate request body with Zod and return 400 VALIDATION_ERROR on malformed platform', async () => {
      const res = await request(app)
        .post('/api/v1/auth/session')
        .set('Authorization', 'Bearer valid-athlete-token')
        .send({ clientPlatform: 'UNKNOWN_DEVICE_PLATFORM' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details).toBeDefined();
    });
  });

  describe('Current User Profile (GET /api/v1/auth/me)', () => {
    it('should return 404 NOT_FOUND if token is valid but application profile does not exist yet', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer valid-athlete-token');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return authenticated user profile after session creation', async () => {
      // 1. Create session
      await request(app)
        .post('/api/v1/auth/session')
        .set('Authorization', 'Bearer valid-athlete-token')
        .send({ clientPlatform: 'WEB' });

      // 2. Fetch me
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer valid-athlete-token');

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('athlete@xevyra.fit');
      expect(res.body.user.firebaseUid).toBe('fb_athlete_123');
    });
  });

  describe('Session Logout (POST /api/v1/auth/logout)', () => {
    it('should successfully log out and record audit event', async () => {
      // Create session first
      await request(app)
        .post('/api/v1/auth/session')
        .set('Authorization', 'Bearer valid-athlete-token')
        .send({});

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', 'Bearer valid-athlete-token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const logoutEvent = auditRepo.events.find((e) => e.eventType === 'LOGOUT');
      expect(logoutEvent).toBeDefined();
      expect(logoutEvent?.firebaseUid).toBe('fb_athlete_123');
    });
  });

  describe('Role-Based Authorization & Ownership Isolation', () => {
    it('should reject non-admin user accessing admin-only endpoint with 403 FORBIDDEN', async () => {
      // Normal user session
      await request(app)
        .post('/api/v1/auth/session')
        .set('Authorization', 'Bearer valid-athlete-token')
        .send({});

      const res = await request(app)
        .get('/api/v1/test/admin-only')
        .set('Authorization', 'Bearer valid-athlete-token');

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toContain('Insufficient permissions');
    });

    it('should allow admin user accessing admin-only endpoint', async () => {
      // Create admin user with role ADMIN
      const adminEmail = Email.create('admin@xevyra.fit').getValue();
      const adminUser = User.create({
        id: 'usr_admin_999',
        firebaseUid: 'fb_admin_999',
        email: adminEmail,
        displayName: 'System Admin',
        role: 'ADMIN',
      }).getValue();
      await userRepo.save(adminUser);

      const res = await request(app)
        .get('/api/v1/test/admin-only')
        .set('Authorization', 'Bearer valid-admin-token');

      expect(res.status).toBe(200);
      expect(res.body.secret).toBe('admin_dashboard_data');
    });

    it('should allow user accessing their own resource via requireOwnership', async () => {
      const sessionRes = await request(app)
        .post('/api/v1/auth/session')
        .set('Authorization', 'Bearer valid-athlete-token')
        .send({});

      const userId = sessionRes.body.user.id;

      const res = await request(app)
        .get(`/api/v1/test/users/${userId}/workouts`)
        .set('Authorization', 'Bearer valid-athlete-token');

      expect(res.status).toBe(200);
      expect(res.body.userId).toBe(userId);
    });

    it('should block user attempting to access another user resource with 403 FORBIDDEN', async () => {
      await request(app)
        .post('/api/v1/auth/session')
        .set('Authorization', 'Bearer valid-athlete-token')
        .send({});

      // Attempt to access another user's ID
      const res = await request(app)
        .get('/api/v1/test/users/usr_victim_777/workouts')
        .set('Authorization', 'Bearer valid-athlete-token');

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toContain('Forbidden: You do not have ownership permission');
    });
  });
});
