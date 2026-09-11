import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { IUserRepository, User, Email } from '@xevyra/domain';
import { IFirebaseAuthService, DecodedAuthToken } from '../src/shared/auth/firebase-admin.client.js';
import { MongoDatabase } from '../src/shared/database/mongo.client.js';
import { loadApiConfig } from '@xevyra/config';

// In-memory User Repository for testing
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
    this.users.set(user.id, user);
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  clear(): void {
    this.users.clear();
  }
}

// Mock Firebase Auth Service
class MockFirebaseAuthService implements IFirebaseAuthService {
  private validTokens: Map<string, DecodedAuthToken> = new Map();

  constructor() {
    this.validTokens.set('valid-token-athlete-1', {
      uid: 'firebase-uid-1',
      email: 'athlete1@xevyra.fit',
      name: 'Test Athlete',
      picture: 'https://example.com/avatar.jpg',
    });
  }

  isInitialized(): boolean {
    return true;
  }

  async verifyIdToken(token: string): Promise<DecodedAuthToken> {
    const decoded = this.validTokens.get(token);
    if (!decoded) {
      throw new Error('Invalid token');
    }
    return decoded;
  }
}

describe('XEVYRA API: Foundational Endpoints & Middleware', () => {
  let app: any;
  let userRepo: InMemoryUserRepository;
  let authService: MockFirebaseAuthService;

  beforeEach(() => {
    const config = loadApiConfig({
      NODE_ENV: 'test',
      PORT: '4000',
    });
    userRepo = new InMemoryUserRepository();
    authService = new MockFirebaseAuthService();
    const db = MongoDatabase.getInstance();

    app = createApp({
      config,
      db,
      userRepository: userRepo,
      authService,
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return health payload conforming to contract', async () => {
      const res = await request(app).get('/api/v1/health');
      // DB might be disconnected in unit test environment -> status 503 degraded
      expect([200, 503]).toContain(res.status);
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('services');
      expect(res.body.version).toBe('1.0.0');
    });
  });

  describe('Error Contract & 404 Routing', () => {
    it('should return standardized JSON Error Contract on nonexistent route', async () => {
      const res = await request(app).get('/api/v1/unknown-endpoint');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(res.body.error.requestId).toMatch(/^req_/);
      expect(res.body.error.message).toBeDefined();
    });
  });

  describe('Authentication Middleware', () => {
    it('should reject requests with missing Authorization header with 401 UNAUTHORIZED', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toContain('Missing or invalid Authorization header');
    });

    it('should reject invalid Bearer token with 401 UNAUTHORIZED', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token-123');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toContain('Invalid or expired authentication token');
    });
  });

  describe('POST /api/v1/auth/sync & GET /api/v1/auth/me', () => {
    it('should validate request body with Zod and return 400 VALIDATION_ERROR on invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/auth/sync')
        .set('Authorization', 'Bearer valid-token-athlete-1')
        .send({
          displayName: '', // invalid: empty string
          avatarUrl: 'not-a-url', // invalid url
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details).toBeDefined();
      expect(res.body.error.details.length).toBeGreaterThan(0);
    });

    it('should successfully sync new user and allow subsequent /me retrieval', async () => {
      // 1. Sync new user
      const syncRes = await request(app)
        .post('/api/v1/auth/sync')
        .set('Authorization', 'Bearer valid-token-athlete-1')
        .send({
          displayName: 'Test Athlete',
          avatarUrl: 'https://example.com/avatar.jpg',
          timezone: 'America/New_York',
        });

      expect(syncRes.status).toBe(201);
      expect(syncRes.body.isNewUser).toBe(true);
      expect(syncRes.body.user.displayName).toBe('Test Athlete');
      expect(syncRes.body.user.email).toBe('athlete1@xevyra.fit');

      // 2. Fetch authenticated user profile
      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer valid-token-athlete-1');

      expect(meRes.status).toBe(200);
      expect(meRes.body.user.displayName).toBe('Test Athlete');
      expect(meRes.body.user.firebaseUid).toBe('firebase-uid-1');
    });
  });
});
