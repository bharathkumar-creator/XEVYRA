import 'dotenv/config';
import { loadApiConfig } from '@xevyra/config';
import { MongoDatabase } from '../shared/database/mongo.client.js';
import { MongoUserRepository } from '../modules/identity/infrastructure/mongo-user.repository.js';
import { MongoProfileRepository } from '../modules/profile/infrastructure/mongo-profile.repository.js';
import { MongoTrainingRepository } from '../modules/training/infrastructure/mongo-training.repository.js';
import { MongoNutritionRepository } from '../modules/nutrition/infrastructure/mongo-nutrition.repository.js';
import { MongoProgressRepository } from '../modules/progress/infrastructure/mongo-progress.repository.js';
import { User, Email } from '@xevyra/domain';

async function runRepositoryLiveTest() {
  const config = loadApiConfig();
  const mongoDb = MongoDatabase.getInstance();
  const db = await mongoDb.connect(config);

  const testSuffix = Date.now().toString();
  const testUserId = `usr_repo_test_${testSuffix}`;
  const testProfileId = `upr_repo_test_${testSuffix}`;
  const testSessionId = `wse_repo_test_${testSuffix}`;
  const testNtdId = `ntd_repo_test_${testSuffix}`;
  const testWeightId = `bwl_repo_test_${testSuffix}`;
  const testExerciseId = `exr_repo_test_${testSuffix}`;

  try {
    const userRepo = new MongoUserRepository(db);
    const profileRepo = new MongoProfileRepository(db);
    const trainingRepo = new MongoTrainingRepository(db);
    const nutritionRepo = new MongoNutritionRepository(db);
    const progressRepo = new MongoProgressRepository(db);

    console.log('Testing Repository Layer against live MongoDB Atlas:');

    // 1. User Domain Entity & Repository
    const emailResult = Email.create(`repo_test_${testSuffix}@xevyra.fit`);
    if (emailResult.isFailure) throw new Error(emailResult.error?.message);

    const userResult = User.create({
      id: testUserId,
      email: emailResult.getValue(),
      firebaseUid: `fb_repo_test_${testSuffix}`,
      displayName: 'Atlas Athlete',
      role: 'USER',
    });
    if (userResult.isFailure) throw new Error(userResult.error?.message);

    const userEntity = userResult.getValue();
    await userRepo.save(userEntity);
    console.log('✓ User persisted via MongoUserRepository.save():', userEntity.id);

    const fetchedUser = await userRepo.findById(testUserId);
    if (!fetchedUser || fetchedUser.displayName !== 'Atlas Athlete') {
      throw new Error('User retrieval failed from MongoDB Atlas');
    }
    console.log('✓ User retrieved and reconstituted via MongoUserRepository.findById()');

    // 2. Profile Repository
    await profileRepo.save({
      id: testProfileId,
      userId: testUserId,
      heightCm: 180,
      currentWeightKg: 82.5,
      birthDate: '1995-06-15',
      gender: 'MALE',
      activityLevel: 'ATHLETE',
      weeklyWorkoutTarget: 5,
      trainingExperience: 'ADVANCED',
      preferredCuisine: 'AMERICAN',
      preferredUnits: 'METRIC',
      timezone: 'UTC',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✓ Profile persisted via MongoProfileRepository.save()');

    const fetchedProfile = await profileRepo.findByUserId(testUserId);
    if (!fetchedProfile || fetchedProfile.heightCm !== 180) {
      throw new Error('Profile retrieval failed from MongoDB Atlas');
    }
    console.log('✓ Profile retrieved via MongoProfileRepository.findByUserId()');

    // 3. Progress / Bodyweight Repository
    await progressRepo.logBodyweight({
      _id: testWeightId,
      bwlUserId: testUserId,
      bwlWeightKg: 82.5,
      bwlDateString: '2026-09-13',
      bwlNotes: 'Atlas Live Test Weight',
      bwlLoggedAt: new Date(),
      bwlCreatedAt: new Date(),
      bwlUpdatedAt: new Date(),
    });
    console.log('✓ Bodyweight log persisted via MongoProgressRepository.logBodyweight()');

    const latestWeight = await progressRepo.getLatestWeightLog(testUserId);
    if (!latestWeight || latestWeight.bwlWeightKg !== 82.5) {
      throw new Error('Bodyweight log retrieval failed from MongoDB Atlas');
    }
    console.log('✓ Bodyweight log retrieved via MongoProgressRepository.getLatestWeightLog()');

    // 4. Training / Workout Session Repository
    await trainingRepo.saveSession({
      _id: testSessionId,
      wseUserId: testUserId,
      wseRoutineId: `wro_dummy_${testSuffix}`,
      wseRoutineName: 'Hypertrophy Upper A',
      wseStartedAt: new Date(),
      wseDurationMinutes: 60,
      wseStatus: 'IN_PROGRESS',
      wseTotalVolumeKg: 12500,
      wseTotalSetsCompleted: 18,
      wseExercises: [
        {
          wseExerciseId: testExerciseId,
          wseExerciseName: 'Barbell Bench Press',
          wseTargetMuscle: 'CHEST',
          wseEquipment: 'BARBELL',
          wseSets: [
            {
              wseSetNumber: 1,
              wseSetType: 'NORMAL',
              wseWeightKg: 100,
              wseReps: 8,
              wseIsCompleted: true,
              wseCompletedAt: new Date(),
            },
          ],
        },
      ],
      wseNotes: 'Atlas live verification session',
      wseVersion: 1,
      wseCreatedAt: new Date(),
      wseUpdatedAt: new Date(),
    });
    console.log('✓ Workout session persisted via MongoTrainingRepository.saveSession()');

    const activeSession = await trainingRepo.getActiveSession(testUserId);
    if (!activeSession || activeSession._id !== testSessionId) {
      throw new Error('Active session retrieval failed from MongoDB Atlas');
    }
    console.log('✓ Active session retrieved via MongoTrainingRepository.getActiveSession()');

    // 5. Nutrition Repository
    await nutritionRepo.saveNutritionDay({
      _id: testNtdId,
      ntdUserId: testUserId,
      ntdDateString: '2026-09-13',
      ntdTargetDailyCalories: 2800,
      ntdTargetProteinGrams: 180,
      ntdTargetCarbsGrams: 320,
      ntdTargetFatGrams: 75,
      ntdLoggedCalories: 2750,
      ntdLoggedProteinGrams: 185,
      ntdLoggedCarbsGrams: 310,
      ntdLoggedFatGrams: 70,
      ntdLoggedWaterMl: 3000,
      ntdMeals: [],
      ntdAdherenceScore: 95,
      ntdIsComplete: true,
      ntdCreatedAt: new Date(),
      ntdUpdatedAt: new Date(),
    });
    console.log('✓ Nutrition Day persisted via MongoNutritionRepository.saveNutritionDay()');

    const nutritionDay = await nutritionRepo.getNutritionDay(testUserId, '2026-09-13');
    if (!nutritionDay || nutritionDay.ntdLoggedCalories !== 2750) {
      throw new Error('Nutrition Day retrieval failed from MongoDB Atlas');
    }
    console.log('✓ Nutrition Day retrieved via MongoNutritionRepository.getNutritionDay()');

    // Clean up all disposable test records
    console.log('Cleaning up all disposable test entities from Atlas...');
    await userRepo.delete(testUserId);
    await db.collection('user_profiles').deleteOne({ uprUserId: testUserId });
    await db.collection('bodyweight_logs').deleteOne({ _id: testWeightId });
    await db.collection('workout_sessions').deleteOne({ _id: testSessionId });
    await db.collection('nutrition_days').deleteOne({ _id: testNtdId });
    console.log('✓ All disposable test records cleanly purged from Atlas.');

    console.log('\n========================================');
    console.log('ALL REPOSITORY LIVE ATLAS PERSISTENCE TESTS PASSED.');
    console.log('========================================');
  } finally {
    await mongoDb.close();
  }
}

runRepositoryLiveTest().catch((err) => {
  console.error('Repository live test failed:', err);
  process.exit(1);
});
