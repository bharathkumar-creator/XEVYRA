import { Request, Response, NextFunction } from 'express';
import { IUserRepository } from '@xevyra/domain';
import { MongoProfileRepository } from '../../profile/infrastructure/mongo-profile.repository.js';
import { MongoNutritionRepository } from '../../nutrition/infrastructure/mongo-nutrition.repository.js';
import { MongoTrainingRepository } from '../../training/infrastructure/mongo-training.repository.js';
import { MongoProgressRepository } from '../../progress/infrastructure/mongo-progress.repository.js';
import { AppError } from '../../../shared/errors/app-error.js';

export class DashboardController {
  constructor(
    private userRepository: IUserRepository,
    private profileRepository: MongoProfileRepository,
    private nutritionRepository: MongoNutritionRepository,
    private trainingRepository: MongoTrainingRepository,
    private progressRepository?: MongoProgressRepository
  ) {}

  public getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      if (!authUser) throw AppError.unauthorized('Authentication required');

      const todayDateString = new Date().toISOString().split('T')[0]!;

      const [_profile, dbUser, todayNutrition, routines, sessions, prs] = await Promise.all([
        this.profileRepository.findByUserId(authUser.userId),
        this.userRepository.findById(authUser.userId),
        this.nutritionRepository.getNutritionDay(authUser.userId, todayDateString),
        this.trainingRepository.getRoutines(authUser.userId),
        this.trainingRepository.getSessions(authUser.userId, 5),
        this.progressRepository ? this.progressRepository.getRecentPRs(authUser.userId, 3) : Promise.resolve([]),
      ]);

      const name = dbUser?.displayName || authUser.displayName || 'Athlete';
      const streakDays = 4;

      // Calories & Macros
      const targetCalories = todayNutrition?.ntdTargetDailyCalories || 2400;
      const consumedCalories = todayNutrition?.ntdTotalConsumed.calories || 0;
      const remainingCalories = Math.max(0, targetCalories - consumedCalories);

      const targetProtein = todayNutrition?.ntdTargetProteinGrams || 160;
      const consumedProtein = todayNutrition?.ntdTotalConsumed.proteinGrams || 0;

      const targetCarbs = todayNutrition?.ntdTargetCarbsGrams || 260;
      const consumedCarbs = todayNutrition?.ntdTotalConsumed.carbsGrams || 0;

      const targetFat = todayNutrition?.ntdTargetFatGrams || 75;
      const consumedFat = todayNutrition?.ntdTotalConsumed.fatGrams || 0;

      // Today's workout selection
      interface DashboardWorkoutDto {
        id: string;
        name: string;
        muscleGroups: string[];
        exerciseCount: number;
        estimatedMinutes: number;
        status: 'IN_PROGRESS' | 'READY';
        lastCompletedDate?: string;
      }
      let todayWorkout: DashboardWorkoutDto | undefined = undefined;
      const activeSession = sessions.find((s) => s.wseStatus === 'IN_PROGRESS');

      if (activeSession) {
        todayWorkout = {
          id: activeSession.wseRoutineId || activeSession._id,
          name: activeSession.wseRoutineName,
          muscleGroups: ['Push', 'Shoulders'],
          exerciseCount: activeSession.wseExercises.length,
          estimatedMinutes: activeSession.wseDurationMinutes || 45,
          status: 'IN_PROGRESS',
        };
      } else if (routines.length > 0 && routines[0]) {
        const topRoutine = routines[0];
        todayWorkout = {
          id: topRoutine._id,
          name: topRoutine.wroName,
          muscleGroups: topRoutine.wroMuscleGroups,
          exerciseCount: topRoutine.wroExercises.length,
          estimatedMinutes: topRoutine.wroEstimatedMinutes,
          status: 'READY',
          lastCompletedDate: topRoutine.wroLastCompletedAt ? '3 days ago' : undefined,
        };
      } else {
        todayWorkout = {
          id: 'wro_push_default',
          name: 'Push Hypertrophy & Delts',
          muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
          exerciseCount: 3,
          estimatedMinutes: 50,
          status: 'READY',
        };
      }

      // Recent PRs
      const formattedPRs = prs.map((pr) => ({
        exerciseName: pr.prcExerciseName,
        weight: pr.prcBestWeightKg,
        reps: pr.prcBestReps,
      }));

      // Focus Today title
      const focusToday = todayWorkout?.name
        ? `${todayWorkout.name.split(' ')[0]} Hypertrophy & Density`
        : 'Upper Body Power & Hypertrophy';

      res.status(200).json({
        athlete: {
          name,
          streakDays,
          focusToday,
          dailyCalories: {
            consumed: consumedCalories,
            target: targetCalories,
            remaining: remainingCalories,
          },
          macros: {
            protein: { consumed: consumedProtein, target: targetProtein },
            carbs: { consumed: consumedCarbs, target: targetCarbs },
            fat: { consumed: consumedFat, target: targetFat },
          },
          todayWorkout,
          recentPRs: formattedPRs.length > 0 ? formattedPRs : [
            { exerciseName: 'Incline DB Press', weight: 36, reps: 8 },
            { exerciseName: 'Barbell Squat', weight: 140, reps: 5 },
          ],
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
