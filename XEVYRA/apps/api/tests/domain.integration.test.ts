import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { ApiEnv } from '@xevyra/config';
import { IUserRepository, User, Email } from '@xevyra/domain';
import { IFirebaseAuthService, DecodedFirebaseToken } from '../src/shared/auth/firebase-admin.client.js';

// In-Memory Test User Repository
class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();
  private firebaseIndex: Map<string, string> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const id = this.firebaseIndex.get(firebaseUid);
    return id ? this.users.get(id) || null : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    for (const u of this.users.values()) {
      if (u.email.value === email.value) return u;
    }
    return null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
    this.firebaseIndex.set(user.firebaseUid, user.id);
  }

  async updateLastLogin(id: string): Promise<void> {
    const u = this.users.get(id);
    if (u) u.recordLogin();
  }
}

// Mock Firebase Auth Service
class MockFirebaseAuthService implements IFirebaseAuthService {
  async verifyIdToken(token: string): Promise<DecodedFirebaseToken> {
    if (token === 'expired_token') throw new Error('Token expired');
    if (token === 'valid_token' || token === 'dev_demo_athlete_token') {
      return {
        uid: 'fb_athlete_test_1',
        email: 'athlete@xevyra.fit',
        name: 'Test Athlete',
        email_verified: true,
        auth_time: Math.floor(Date.now() / 1000),
        iss: 'https://securetoken.google.com/xevyra-test',
        sub: 'fb_athlete_test_1',
        aud: 'xevyra-test',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
    }
    throw new Error('Invalid token');
  }
}

describe('Domain Integration & REST API Suite', () => {
  let app: any;
  let userRepo: InMemoryUserRepository;
  let authService: MockFirebaseAuthService;
  const mockConfig: ApiEnv = {
    PORT: 4000,
    NODE_ENV: 'test',
    API_BASE_URL: 'http://localhost:4000',
    CORS_ORIGIN: '*',
    FIREBASE_PROJECT_ID: 'xevyra-test',
    MONGODB_URI: 'mongodb://localhost:27017/xevyra_test',
    MONGODB_DB_NAME: 'xevyra_test',
  };

  const mockProfileRepo: any = {
    findByUserId: async () => null,
    save: async () => {},
  };

  const mockTrainingRepo: any = {
    getExercises: async () => [],
    createCustomExercise: async () => {},
    getRoutines: async () => [],
    saveRoutine: async () => {},
    saveSession: async () => {},
    getSessions: async () => [],
  };

  const mockNutritionRepo: any = {
    getNutritionDay: async () => null,
    saveNutritionDay: async () => {},
    searchFoodItems: async () => [],
    saveFoodItem: async () => {},
    getFoodItemById: async () => ({
      _id: 'foi_test',
      foiName: 'Test Food',
      foiCaloriesPer100Basis: 100,
      foiProteinPer100Basis: 10,
      foiCarbsPer100Basis: 10,
      foiFatPer100Basis: 2,
      foiAvailableServings: [],
    }),
    getActiveDietPlan: async () => null,
    saveDietPlan: async () => {},
    getRecentNutritionDays: async () => [],
    saveMaintenanceAnalysis: async () => {},
  };

  const mockProgressRepo: any = {
    getWeightLogs: async () => [],
    getPersonalRecords: async () => [],
    getRecentPRs: async () => [],
    logBodyweight: async () => {},
  };

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository();
    authService = new MockFirebaseAuthService();

    // Create default test user
    const emailResult = Email.create('athlete@xevyra.fit');
    const user = User.create({
      id: 'usr_test_athlete_01',
      firebaseUid: 'fb_athlete_test_1',
      email: emailResult.getValue(),
      displayName: 'Test Athlete',
      role: 'USER',
    }).getValue();
    await userRepo.save(user);

    app = createApp({
      config: mockConfig,
      db: { getDb: () => { throw new Error('Mock'); } } as any,
      userRepository: userRepo,
      authService,
      profileRepository: mockProfileRepo,
      trainingRepository: mockTrainingRepo,
      nutritionRepository: mockNutritionRepo,
      progressRepository: mockProgressRepo,
    });
  });

  describe('Dashboard Composition (GET /api/v1/dashboard)', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app).get('/api/v1/dashboard');
      expect(res.status).toBe(401);
    });

    it('should return aggregated dashboard with 200 OK for authenticated athlete', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', 'Bearer valid_token');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('athlete');
      expect(res.body.athlete).toHaveProperty('dailyCalories');
      expect(res.body.athlete).toHaveProperty('macros');
    });
  });

  describe('Profile Endpoints (/api/v1/profile)', () => {
    it('should reject unauthenticated requests to GET /profile', async () => {
      const res = await request(app).get('/api/v1/profile');
      expect(res.status).toBe(401);
    });

    it('should return athlete profile with 200 OK', async () => {
      const res = await request(app)
        .get('/api/v1/profile')
        .set('Authorization', 'Bearer valid_token');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('profile');
      expect(res.body.profile.userId).toBe('usr_test_athlete_01');
    });

    it('should reject invalid profile updates with 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .patch('/api/v1/profile')
        .set('Authorization', 'Bearer valid_token')
        .send({ heightCm: -50 }); // Invalid height
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Workouts & Training Endpoints (/api/v1/workouts)', () => {
    it('should reject unauthenticated requests to /exercises', async () => {
      const res = await request(app).get('/api/v1/workouts/exercises');
      expect(res.status).toBe(401);
    });

    it('should return list of exercises for athlete', async () => {
      const res = await request(app)
        .get('/api/v1/workouts/exercises')
        .set('Authorization', 'Bearer valid_token');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('exercises');
    });

    it('should reject malformed workout session starts', async () => {
      const res = await request(app)
        .post('/api/v1/workouts/sessions')
        .set('Authorization', 'Bearer valid_token')
        .send({ routineName: '' });
      expect(res.status).toBe(400);
    });
  });

  describe('Nutrition Endpoints (/api/v1/nutrition)', () => {
    it('should reject unauthenticated requests to /summary', async () => {
      const res = await request(app).get('/api/v1/nutrition/summary');
      expect(res.status).toBe(401);
    });

    it('should return nutrition summary for valid date with 200 OK', async () => {
      const res = await request(app)
        .get('/api/v1/nutrition/summary?date=2026-09-11')
        .set('Authorization', 'Bearer valid_token');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('target');
      expect(res.body).toHaveProperty('entries');
    });

    it('should reject food logging with negative quantities', async () => {
      const res = await request(app)
        .post('/api/v1/nutrition/log')
        .set('Authorization', 'Bearer valid_token')
        .send({
          foodItemId: 'foi_test',
          mealType: 'LUNCH',
          quantity: -100,
          unit: 'GRAMS',
          dateString: '2026-09-11',
        });
      expect(res.status).toBe(400);
    });
  });

  describe('Progress Endpoints (/api/v1/progress)', () => {
    it('should reject unauthenticated requests to /summary', async () => {
      const res = await request(app).get('/api/v1/progress/summary');
      expect(res.status).toBe(401);
    });

    it('should return progress summary with 200 OK', async () => {
      const res = await request(app)
        .get('/api/v1/progress/summary')
        .set('Authorization', 'Bearer valid_token');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('currentWeightKg');
      expect(res.body).toHaveProperty('weightHistory');
    });

    it('should reject bodyweight log with invalid weight range', async () => {
      const res = await request(app)
        .post('/api/v1/progress/bodyweight')
        .set('Authorization', 'Bearer valid_token')
        .send({
          dateString: '2026-09-11',
          weightKg: 5, // Below minimum 20kg
        });
      expect(res.status).toBe(400);
    });
  });
});
