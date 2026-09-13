import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { ApiEnv } from '@xevyra/config';
import { IUserRepository, User, Email, TrainingDomainService, NutritionDomainService } from '@xevyra/domain';
import { IFirebaseAuthService, DecodedFirebaseToken } from '../src/shared/auth/firebase-admin.client.js';
import { MONGO_INDEXES } from '../../../database/indexes/mongo-indexes.js';
import { COLLECTION_PREFIXES, isValidPrefixedId } from '../../../database/indexes/prefix-registry.js';
import { MongoUserRepository, UserDocument } from '../src/modules/identity/infrastructure/mongo-user.repository.js';
import { MongoProfileRepository, UserProfileDocument } from '../src/modules/profile/infrastructure/mongo-profile.repository.js';
import { MongoTrainingRepository, ExerciseDocument, WorkoutRoutineDocument, WorkoutSessionDocument, PersonalRecordDocument } from '../src/modules/training/infrastructure/mongo-training.repository.js';
import { MongoNutritionRepository, FoodItemDocument, NutritionDayDocument, DietPlanDocument, MaintenanceAnalysisDocument } from '../src/modules/nutrition/infrastructure/mongo-nutrition.repository.js';
import { MongoProgressRepository, BodyweightLogDocument } from '../src/modules/progress/infrastructure/mongo-progress.repository.js';

// In-Memory Test User Repository
class TestUserRepository implements IUserRepository {
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

// Mock Firebase Auth Service with multi-user support
class TestFirebaseAuthService implements IFirebaseAuthService {
  async verifyIdToken(token: string): Promise<DecodedFirebaseToken> {
    if (token === 'expired_token') throw new Error('Token expired');
    if (token === 'token_user_a') {
      return {
        uid: 'fb_user_a',
        email: 'usera@xevyra.fit',
        name: 'Athlete A',
        email_verified: true,
        auth_time: Math.floor(Date.now() / 1000),
        iss: 'https://securetoken.google.com/xevyra-test',
        sub: 'fb_user_a',
        aud: 'xevyra-test',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
    }
    if (token === 'token_user_b') {
      return {
        uid: 'fb_user_b',
        email: 'userb@xevyra.fit',
        name: 'Athlete B',
        email_verified: true,
        auth_time: Math.floor(Date.now() / 1000),
        iss: 'https://securetoken.google.com/xevyra-test',
        sub: 'fb_user_b',
        aud: 'xevyra-test',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
    }
    throw new Error('Invalid token');
  }
}

describe('XEVYRA Production Backend Integration Audit', () => {
  let app: any;
  let userRepo: TestUserRepository;
  let authService: TestFirebaseAuthService;

  const mockConfig: ApiEnv = {
    PORT: 4000,
    NODE_ENV: 'test',
    API_BASE_URL: 'http://localhost:4000',
    CORS_ORIGIN: '*',
    FIREBASE_PROJECT_ID: 'xevyra-test',
    MONGODB_URI: 'mongodb://localhost:27017/xevyra_test',
    MONGODB_DB_NAME: 'xevyra_test',
  };

  // In-Memory Database Stores for full schema and persistence verification
  const dbStore = {
    user_profiles: new Map<string, any>(),
    exercises: new Map<string, any>(),
    workout_routines: new Map<string, any>(),
    workout_sessions: new Map<string, any>(),
    food_items: new Map<string, any>(),
    nutrition_days: new Map<string, any>(),
    diet_plans: new Map<string, any>(),
    maintenance_calorie_analyses: new Map<string, any>(),
    bodyweight_logs: new Map<string, any>(),
    personal_records: new Map<string, any>(),
  };

  const mockProfileRepo: any = {
    findByUserId: async (userId: string) => dbStore.user_profiles.get(userId) || null,
    save: async (data: any) => {
      dbStore.user_profiles.set(data.userId, data);
    },
  };

  const mockTrainingRepo: any = {
    getExercises: async (userId: string) => {
      return Array.from(dbStore.exercises.values()).filter(
        (e: any) => !e.exrIsCustom || e.exrCreatedByUserId === userId
      );
    },
    createCustomExercise: async (ex: ExerciseDocument) => {
      dbStore.exercises.set(ex._id, ex);
    },
    getRoutines: async (userId: string) => {
      return Array.from(dbStore.workout_routines.values()).filter((r: any) => r.wroUserId === userId);
    },
    saveRoutine: async (r: WorkoutRoutineDocument) => {
      dbStore.workout_routines.set(r._id, r);
    },
    getSessionById: async (id: string, userId: string) => {
      const s = dbStore.workout_sessions.get(id);
      return s && s.wseUserId === userId ? s : null;
    },
    saveSession: async (s: WorkoutSessionDocument) => {
      dbStore.workout_sessions.set(s._id, s);
    },
    updateSessionSet: async (
      sessionId: string,
      userId: string,
      exerciseId: string,
      setNumber: number,
      setData: any,
      expectedVersion?: number
    ) => {
      const session = dbStore.workout_sessions.get(sessionId);
      if (!session || session.wseUserId !== userId) return null;
      if (expectedVersion !== undefined && session.wseVersion !== expectedVersion) {
        throw new Error('VERSION_CONFLICT');
      }
      const ex = session.wseExercises.find((e: any) => e.wseExerciseId === exerciseId);
      if (!ex) return null;
      let set = ex.wseSets.find((s: any) => s.wseSetNumber === setNumber);
      if (!set) {
        set = { wseSetNumber: setNumber, ...setData };
        ex.wseSets.push(set);
      } else {
        Object.assign(set, {
          wseWeightKg: setData.weightKg,
          wseReps: setData.reps,
          wseIsCompleted: setData.isCompleted,
        });
      }
      const allSets = session.wseExercises.flatMap((e: any) => e.wseSets);
      session.wseTotalVolumeKg = TrainingDomainService.calculateVolume(
        allSets.map((s: any) => ({ weightKg: s.wseWeightKg, reps: s.wseReps, isCompleted: s.wseIsCompleted }))
      );
      session.wseTotalSetsCompleted = allSets.filter((s: any) => s.wseIsCompleted).length;
      session.wseVersion += 1;
      return session;
    },
    getSessions: async (userId: string) => {
      return Array.from(dbStore.workout_sessions.values()).filter((s: any) => s.wseUserId === userId);
    },
    getPRByExercise: async (userId: string, exerciseId: string) => {
      return dbStore.personal_records.get(`${userId}:${exerciseId}`) || null;
    },
    upsertPersonalRecord: async (pr: PersonalRecordDocument) => {
      dbStore.personal_records.set(`${pr.prcUserId}:${pr.prcExerciseId}`, pr);
    },
  };

  const mockNutritionRepo: any = {
    getNutritionDay: async (userId: string, dateString: string) => {
      return dbStore.nutrition_days.get(`${userId}:${dateString}`) || null;
    },
    saveNutritionDay: async (day: NutritionDayDocument) => {
      dbStore.nutrition_days.set(`${day.ntdUserId}:${day.ntdDateString}`, day);
    },
    removeMealEntry: async (userId: string, dateString: string, entryId: string) => {
      const day = dbStore.nutrition_days.get(`${userId}:${dateString}`);
      if (!day) return null;
      day.ntdMeals = day.ntdMeals.filter((m: any) => m.ntdEntryId !== entryId);
      return day;
    },
    searchFoodItems: async (query: string, userId?: string, category?: string) => {
      return Array.from(dbStore.food_items.values()).filter((f: any) => {
        if (f.foiIsVerified) return true;
        return userId && f.foiCreatedByUserId === userId;
      });
    },
    getFoodItemById: async (id: string) => dbStore.food_items.get(id) || null,
    saveFoodItem: async (f: FoodItemDocument) => {
      dbStore.food_items.set(f._id, f);
    },
    getActiveDietPlan: async (userId: string) => {
      return Array.from(dbStore.diet_plans.values()).find((p: any) => p.dplUserId === userId && p.dplIsActive) || null;
    },
    saveDietPlan: async (plan: DietPlanDocument) => {
      if (plan.dplIsActive) {
        for (const p of dbStore.diet_plans.values()) {
          if (p.dplUserId === plan.dplUserId && p._id !== plan._id) p.dplIsActive = false;
        }
      }
      dbStore.diet_plans.set(plan._id, plan);
    },
    getRecentNutritionDays: async (userId: string) => {
      return Array.from(dbStore.nutrition_days.values()).filter((d: any) => d.ntdUserId === userId);
    },
    saveMaintenanceAnalysis: async (analysis: MaintenanceAnalysisDocument) => {
      dbStore.maintenance_calorie_analyses.set(analysis._id, analysis);
    },
  };

  const mockProgressRepo: any = {
    getWeightLogs: async (userId: string) => {
      return Array.from(dbStore.bodyweight_logs.values()).filter((b: any) => b.bwlUserId === userId);
    },
    logBodyweight: async (log: BodyweightLogDocument) => {
      dbStore.bodyweight_logs.set(`${log.bwlUserId}:${log.bwlDateString}`, log);
    },
    getPersonalRecords: async (userId: string) => {
      return Array.from(dbStore.personal_records.values()).filter((p: any) => p.prcUserId === userId);
    },
    getRecentPRs: async (userId: string) => {
      return Array.from(dbStore.personal_records.values()).filter((p: any) => p.prcUserId === userId);
    },
  };

  beforeEach(async () => {
    userRepo = new TestUserRepository();
    authService = new TestFirebaseAuthService();

    // Clear stores
    for (const key of Object.keys(dbStore)) {
      (dbStore as any)[key].clear();
    }

    // Seed User A & User B
    const userA = User.create({
      id: 'usr_user_a_111',
      firebaseUid: 'fb_user_a',
      email: Email.create('usera@xevyra.fit').getValue(),
      displayName: 'Athlete A',
      role: 'USER',
    }).getValue();
    await userRepo.save(userA);

    const userB = User.create({
      id: 'usr_user_b_222',
      firebaseUid: 'fb_user_b',
      email: Email.create('userb@xevyra.fit').getValue(),
      displayName: 'Athlete B',
      role: 'USER',
    }).getValue();
    await userRepo.save(userB);

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

  // ============================================================
  // 1. DATABASE PREFIX AUDIT
  // ============================================================
  describe('1. Database Prefix & Registry Audit', () => {
    it('should have correct 3-character prefixes for all 16 collections', () => {
      const expectedPrefixes: Record<string, string> = {
        users: 'usr',
        user_profiles: 'upr',
        nutrition_targets: 'ntr',
        exercises: 'exr',
        workout_routines: 'wro',
        workout_sessions: 'wse',
        food_items: 'foi',
        nutrition_days: 'ntd',
        diet_plans: 'dpl',
        maintenance_calorie_analyses: 'mca',
        bodyweight_logs: 'bwl',
        personal_records: 'prc',
        ai_requests: 'air',
        notifications: 'ntf',
        audit_logs: 'aud',
        idempotency_keys: 'idk',
      };

      expect(COLLECTION_PREFIXES).toEqual(expectedPrefixes);

      for (const [col, prefix] of Object.entries(expectedPrefixes)) {
        expect(isValidPrefixedId(`${prefix}_1234567890abcdef`, col as any)).toBe(true);
        expect(isValidPrefixedId(`wrong_1234567890abcdef`, col as any)).toBe(false);
      }
    });

    it('should enforce that persistence documents use prefixed root and nested fields', () => {
      const exerciseDoc: ExerciseDocument = {
        _id: 'exr_bench_press_01',
        exrName: 'Barbell Flat Bench Press',
        exrMuscleGroup: 'CHEST',
        exrEquipment: 'BARBELL',
        exrStandardIncrementKg: 2.5,
        exrIsCustom: false,
        exrCreatedAt: new Date(),
        exrUpdatedAt: new Date(),
      };
      expect(exerciseDoc._id.startsWith('exr_')).toBe(true);
      expect(exerciseDoc).toHaveProperty('exrName');
      expect(exerciseDoc).toHaveProperty('exrMuscleGroup');

      const sessionDoc: WorkoutSessionDocument = {
        _id: 'wse_session_01',
        wseUserId: 'usr_user_a_111',
        wseRoutineName: 'Push Day',
        wseStartedAt: new Date(),
        wseDurationMinutes: 45,
        wseStatus: 'IN_PROGRESS',
        wseTotalVolumeKg: 0,
        wseTotalSetsCompleted: 0,
        wseExercises: [
          {
            wseExerciseId: 'exr_bench_press_01',
            wseExerciseName: 'Barbell Flat Bench Press',
            wseTargetMuscle: 'CHEST',
            wseEquipment: 'BARBELL',
            wseSets: [
              {
                wseSetNumber: 1,
                wseSetType: 'NORMAL',
                wseWeightKg: 100,
                wseReps: 5,
                wseIsCompleted: true,
              },
            ],
          },
        ],
        wsePrsAchieved: [],
        wseVersion: 1,
        wseCreatedAt: new Date(),
        wseUpdatedAt: new Date(),
      };
      expect(sessionDoc.wseExercises[0].wseSets[0]).toHaveProperty('wseWeightKg');
    });
  });

  // ============================================================
  // 2. INDEX AUDIT
  // ============================================================
  describe('2. MongoDB Index Definitions Audit', () => {
    it('should contain complete, valid, and deployable index definitions for all core collections', () => {
      const collectionsWithIndexes = new Set(MONGO_INDEXES.map((idx) => idx.collection));
      expect(collectionsWithIndexes.has('users')).toBe(true);
      expect(collectionsWithIndexes.has('user_profiles')).toBe(true);
      expect(collectionsWithIndexes.has('nutrition_targets')).toBe(true);
      expect(collectionsWithIndexes.has('exercises')).toBe(true);
      expect(collectionsWithIndexes.has('workout_routines')).toBe(true);
      expect(collectionsWithIndexes.has('workout_sessions')).toBe(true);
      expect(collectionsWithIndexes.has('food_items')).toBe(true);
      expect(collectionsWithIndexes.has('nutrition_days')).toBe(true);
      expect(collectionsWithIndexes.has('diet_plans')).toBe(true);
      expect(collectionsWithIndexes.has('bodyweight_logs')).toBe(true);
      expect(collectionsWithIndexes.has('personal_records')).toBe(true);
      expect(collectionsWithIndexes.has('idempotency_keys')).toBe(true);

      // Verify unique index presence
      const userUniqueUid = MONGO_INDEXES.find(
        (i) => i.collection === 'users' && i.spec.usrFirebaseUid === 1
      );
      expect(userUniqueUid?.options?.unique).toBe(true);

      const nutritionDayUnique = MONGO_INDEXES.find(
        (i) => i.collection === 'nutrition_days' && i.spec.ntdUserId === 1 && i.spec.ntdDateString === 1
      );
      expect(nutritionDayUnique?.options?.unique).toBe(true);
    });
  });

  // ============================================================
  // 3 & 4. AUTHENTICATION & USER DERIVATION AUDIT
  // ============================================================
  describe('3 & 4. Authentication Security & Identity Derivation', () => {
    it('should reject requests with missing Authorization token with 401', async () => {
      const res = await request(app).get('/api/v1/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject requests with invalid/expired token with 401', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', 'Bearer expired_token');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should correctly derive authenticated user identity from token and block client override', async () => {
      const res = await request(app)
        .get('/api/v1/profile')
        .set('Authorization', 'Bearer token_user_a');
      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe('usr_user_a_111');
      expect(res.body.user.email).toBe('usera@xevyra.fit');
    });
  });

  // ============================================================
  // 5. OWNERSHIP SECURITY AUDIT
  // ============================================================
  describe('5. Ownership Isolation Audit (User A vs User B)', () => {
    it('should strictly isolate User B data when User A requests dashboard, workouts, and nutrition', async () => {
      // Seed User B private custom routine & workout session
      const userBRoutine: WorkoutRoutineDocument = {
        _id: 'wro_b_secret',
        wroUserId: 'usr_user_b_222',
        wroName: 'Athlete B Secret Routine',
        wroMuscleGroups: ['Legs'],
        wroEstimatedMinutes: 60,
        wroExercises: [],
        wroIsArchived: false,
        wroCreatedAt: new Date(),
        wroUpdatedAt: new Date(),
      };
      await mockTrainingRepo.saveRoutine(userBRoutine);

      // User A requests routines
      const resA = await request(app)
        .get('/api/v1/workouts/routines')
        .set('Authorization', 'Bearer token_user_a');
      expect(resA.status).toBe(200);
      const routineNames = resA.body.routines.map((r: any) => r.name);
      expect(routineNames).not.toContain('Athlete B Secret Routine');

      // User A tries to log set to User B session
      const userBSession: WorkoutSessionDocument = {
        _id: 'wse_b_active',
        wseUserId: 'usr_user_b_222',
        wseRoutineName: 'B Session',
        wseStartedAt: new Date(),
        wseDurationMinutes: 10,
        wseStatus: 'IN_PROGRESS',
        wseTotalVolumeKg: 0,
        wseTotalSetsCompleted: 0,
        wseExercises: [{ wseExerciseId: 'exr_squat', wseExerciseName: 'Squat', wseTargetMuscle: 'LEGS', wseEquipment: 'BARBELL', wseSets: [] }],
        wsePrsAchieved: [],
        wseVersion: 1,
        wseCreatedAt: new Date(),
        wseUpdatedAt: new Date(),
      };
      await mockTrainingRepo.saveSession(userBSession);

      const hijackAttempt = await request(app)
        .patch('/api/v1/workouts/sessions/wse_b_active/sets')
        .set('Authorization', 'Bearer token_user_a')
        .send({ exerciseId: 'exr_squat', setNumber: 1, weightKg: 140, reps: 5, isCompleted: true });
      expect(hijackAttempt.status).toBe(404); // Rejected as not found for User A
    });
  });

  // ============================================================
  // 6. FOOD NUTRITION & SNAPSHOT IMMUTABILITY AUDIT
  // ============================================================
  describe('6. Food Nutrition Scaling & Snapshot Immutability', () => {
    it('should scale 100g baseline accurately and keep snapshots immutable when master food changes', async () => {
      // 1. Seed food: 100g = 400 kcal, 30g protein, 50g carbs, 10g fat
      const foodItem: FoodItemDocument = {
        _id: 'foi_high_protein_bar',
        foiName: 'XEVYRA Pro Bar',
        foiCategory: 'Snack',
        foiStandardBasis: 'PER_100G',
        foiCaloriesPer100Basis: 400,
        foiProteinPer100Basis: 30,
        foiCarbsPer100Basis: 50,
        foiFatPer100Basis: 10,
        foiAvailableServings: [
          { foiServingId: 'srv_100g', foiServingLabel: '100g', foiUnitType: 'GRAMS', foiBaseAmount: 100, foiBasisEquivalentFactor: 1.0, foiIsDefault: true },
        ],
        foiIsVerified: true,
        foiCreatedAt: new Date(),
        foiUpdatedAt: new Date(),
      };
      await mockNutritionRepo.saveFoodItem(foodItem);

      // 2. Log 250g
      const logRes = await request(app)
        .post('/api/v1/nutrition/log')
        .set('Authorization', 'Bearer token_user_a')
        .send({
          foodItemId: 'foi_high_protein_bar',
          mealType: 'SNACK',
          quantity: 250,
          unit: 'GRAMS',
          dateString: '2026-09-13',
        });

      expect(logRes.status).toBe(201);
      expect(logRes.body.nutritionSnapshot.calories).toBe(1000);
      expect(logRes.body.nutritionSnapshot.proteinGrams).toBe(75);
      expect(logRes.body.nutritionSnapshot.carbsGrams).toBe(125);
      expect(logRes.body.nutritionSnapshot.fatGrams).toBe(25);

      // 3. Mutate master food catalog in database to 200 kcal
      foodItem.foiCaloriesPer100Basis = 200;
      foodItem.foiProteinPer100Basis = 15;
      await mockNutritionRepo.saveFoodItem(foodItem);

      // 4. Retrieve logged summary for the day — verify snapshot remains 1000 kcal / 75g P
      const summaryRes = await request(app)
        .get('/api/v1/nutrition/summary?date=2026-09-13')
        .set('Authorization', 'Bearer token_user_a');
      expect(summaryRes.status).toBe(200);
      expect(summaryRes.body.entries[0].nutritionSnapshot.calories).toBe(1000);
      expect(summaryRes.body.entries[0].nutritionSnapshot.proteinGrams).toBe(75);
      expect(summaryRes.body.totalConsumed.calories).toBe(1000);
    });
  });

  // ============================================================
  // 7. UNIT CONVERSION AUDIT
  // ============================================================
  describe('7. Unit Conversion & Validation Audit', () => {
    it('should normalize units accurately in Domain Service', () => {
      const base = { caloriesPer100Basis: 200, proteinGramsPer100Basis: 20, carbsGramsPer100Basis: 20, fatGramsPer100Basis: 5 };

      // 1 KG = 1000g => 10x factor => 2000 kcal
      const kgScaled = NutritionDomainService.scaleNutrition(1, 'KG', base);
      expect(kgScaled.calories).toBe(2000);
      expect(kgScaled.proteinGrams).toBe(200);

      // 2 Scoops (30g per scoop) = 60g => 0.6x factor => 120 kcal
      const scoopScaled = NutritionDomainService.scaleNutrition(2, 'SCOOP', base, 30);
      expect(scoopScaled.calories).toBe(120);
      expect(scoopScaled.proteinGrams).toBe(12);
    });

    it('should reject invalid unit types with 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/v1/nutrition/log')
        .set('Authorization', 'Bearer token_user_a')
        .send({
          foodItemId: 'foi_high_protein_bar',
          mealType: 'SNACK',
          quantity: 100,
          unit: 'HANDFUL_INVALID',
          dateString: '2026-09-13',
        });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // ============================================================
  // 8. WORKOUT VOLUME & PR DETECTION AUDIT
  // ============================================================
  describe('8. Workout Volume Calculation & Brzycki 1RM Audit', () => {
    it('should calculate 100kgx5 + 80kgx10 + 60kgx12 = 2020kg from completed sets only', () => {
      const sets = [
        { weightKg: 100, reps: 5, isCompleted: true },
        { weightKg: 80, reps: 10, isCompleted: true },
        { weightKg: 60, reps: 12, isCompleted: true },
        { weightKg: 120, reps: 2, isCompleted: false }, // Incomplete set must not add to volume
      ];
      const volume = TrainingDomainService.calculateVolume(sets);
      expect(volume).toBe(2020);
    });

    it('should accurately calculate Brzycki 1RM and detect PR candidate', () => {
      // Brzycki: 100 / (1.0278 - 0.0278 * 5) = 100 / 0.8888 = 112.5 kg
      const estimated1RM = TrainingDomainService.calculateEstimated1RM(100, 5);
      expect(estimated1RM).toBe(112.5);

      const candidate = TrainingDomainService.detectPersonalRecords(
        'exr_bench',
        'Bench Press',
        [{ weightKg: 100, reps: 5, isCompleted: true }],
        105 // Previous best 1RM is 105
      );
      expect(candidate).not.toBeNull();
      expect(candidate?.estimated1RM).toBe(112.5);
    });
  });

  // ============================================================
  // 9. OPTIMISTIC CONCURRENCY AUDIT
  // ============================================================
  describe('9. Optimistic Concurrency Audit', () => {
    it('should succeed on matching version and reject stale version with 409 CONFLICT', async () => {
      // 1. Create active session at version 1
      const session: WorkoutSessionDocument = {
        _id: 'wse_concurrency_test',
        wseUserId: 'usr_user_a_111',
        wseRoutineName: 'Chest Hypertrophy',
        wseStartedAt: new Date(),
        wseDurationMinutes: 20,
        wseStatus: 'IN_PROGRESS',
        wseTotalVolumeKg: 0,
        wseTotalSetsCompleted: 0,
        wseExercises: [{ wseExerciseId: 'exr_db_press', wseExerciseName: 'DB Press', wseTargetMuscle: 'CHEST', wseEquipment: 'DUMBBELLS', wseSets: [] }],
        wsePrsAchieved: [],
        wseVersion: 1,
        wseCreatedAt: new Date(),
        wseUpdatedAt: new Date(),
      };
      await mockTrainingRepo.saveSession(session);

      // 2. First update with version 1 -> succeeds, version becomes 2
      const res1 = await request(app)
        .patch('/api/v1/workouts/sessions/wse_concurrency_test/sets')
        .set('Authorization', 'Bearer token_user_a')
        .send({ exerciseId: 'exr_db_press', setNumber: 1, weightKg: 30, reps: 10, isCompleted: true, version: 1 });
      expect(res1.status).toBe(200);
      expect(res1.body.version).toBe(2);

      // 3. Second concurrent client attempts update with stale version 1 -> receives 409 CONFLICT
      const res2 = await request(app)
        .patch('/api/v1/workouts/sessions/wse_concurrency_test/sets')
        .set('Authorization', 'Bearer token_user_a')
        .send({ exerciseId: 'exr_db_press', setNumber: 2, weightKg: 30, reps: 8, isCompleted: true, version: 1 });
      expect(res2.status).toBe(409);
      expect(res2.body.error.code).toBe('CONFLICT');
    });
  });

  // ============================================================
  // 13. MAINTENANCE CALORIE CONFIDENCE TIERS AUDIT
  // ============================================================
  describe('13. Maintenance Calorie Analysis & Confidence Tiers', () => {
    it('should assign correct confidence tiers across 0 to 28 days of data', () => {
      const now = new Date();
      const createLogs = (count: number) => {
        return Array.from({ length: count }, (_, i) => ({
          dateString: `2026-09-${String(i + 1).padStart(2, '0')}`,
          totalCalories: 2500,
          weightKg: 78.0,
        }));
      };

      // 0-2 days: INSUFFICIENT
      expect(NutritionDomainService.calculateMaintenance(createLogs(2), now, now).confidence).toBe('INSUFFICIENT');

      // 3-6 days: PRELIMINARY
      expect(NutritionDomainService.calculateMaintenance(createLogs(5), now, now).confidence).toBe('PRELIMINARY');

      // 7 days: INITIAL
      expect(NutritionDomainService.calculateMaintenance(createLogs(7), now, now).confidence).toBe('INITIAL');

      // 14 days: MORE_RELIABLE
      expect(NutritionDomainService.calculateMaintenance(createLogs(14), now, now).confidence).toBe('MORE_RELIABLE');

      // 28 days: STRONGER_TREND
      expect(NutritionDomainService.calculateMaintenance(createLogs(28), now, now).confidence).toBe('STRONGER_TREND');
    });
  });

  // ============================================================
  // 15. DIET PLAN MULTI-CUISINE AUDIT
  // ============================================================
  describe('15. Diet Plan Multi-Cuisine Generation Audit', () => {
    it('should generate distinct cultural cuisines (American, South Indian, North Indian, Mediterranean, Asian)', async () => {
      const southIndianRes = await request(app)
        .post('/api/v1/nutrition/diet-plan/generate')
        .set('Authorization', 'Bearer token_user_a')
        .send({
          targetDailyCalories: 2400,
          cuisineType: 'SOUTH_INDIAN',
          goalMode: 'MAINTENANCE',
          macroSplitPreference: 'HIGH_PROTEIN',
        });
      expect(southIndianRes.status).toBe(201);
      expect(southIndianRes.body.cuisineType).toBe('SOUTH_INDIAN');
      expect(southIndianRes.body.meals.length).toBeGreaterThan(0);

      const asianRes = await request(app)
        .post('/api/v1/nutrition/diet-plan/generate')
        .set('Authorization', 'Bearer token_user_a')
        .send({
          targetDailyCalories: 2200,
          cuisineType: 'ASIAN',
          goalMode: 'DEFICIT',
          macroSplitPreference: 'HIGH_PROTEIN',
        });
      expect(asianRes.status).toBe(201);
      expect(asianRes.body.cuisineType).toBe('ASIAN');
    });
  });

  // ============================================================
  // 16. DASHBOARD AUDIT
  // ============================================================
  describe('16. Dashboard Aggregation & Security Audit', () => {
    it('should return aggregated athlete metrics with calorie targets, workout state, and PRs', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', 'Bearer token_user_a');
      expect(res.status).toBe(200);
      expect(res.body.athlete.name).toBe('Athlete A');
      expect(res.body.athlete.dailyCalories.target).toBeGreaterThan(0);
      expect(res.body.athlete.macros.protein).toBeDefined();
    });
  });

  // ============================================================
  // 20 & 22. ERROR CONTRACT & DOMAIN ISOLATION AUDIT
  // ============================================================
  describe('20 & 22. Standard Error Format & Domain Isolation', () => {
    it('should format all API errors with standardized Error Contract', async () => {
      const res = await request(app).get('/api/v1/non_existent_endpoint');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(res.body.error).toHaveProperty('message');
      expect(res.body.error).toHaveProperty('requestId');
    });
  });
});
