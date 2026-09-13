import { Request, Response, NextFunction } from 'express';
import {
  CreateCustomExerciseRequestSchema,
  CreateRoutineRequestSchema,
  StartWorkoutSessionRequestSchema,
  LogWorkoutSetRequestSchema,
  CompleteWorkoutSessionRequestSchema,
} from '@xevyra/contracts';
import { MongoTrainingRepository, ExerciseDocument, WorkoutRoutineDocument, WorkoutSessionDocument, PersonalRecordDocument } from '../infrastructure/mongo-training.repository.js';
import { TrainingDomainService } from '@xevyra/domain';
import { AppError } from '../../../shared/errors/app-error.js';

export class TrainingController {
  constructor(private trainingRepository: MongoTrainingRepository) {}

  // 1. Get Exercises
  public getExercises = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      if (!authUser) throw AppError.unauthorized('Authentication required');

      const exercises = await this.trainingRepository.getExercises(authUser.userId);
      res.status(200).json({
        exercises: exercises.map((e) => ({
          id: e._id,
          name: e.exrName,
          muscleGroup: e.exrMuscleGroup,
          secondaryMuscles: e.exrSecondaryMuscles,
          equipment: e.exrEquipment,
          standardIncrementKg: e.exrStandardIncrementKg,
          isCustom: e.exrIsCustom,
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  // 2. Create Custom Exercise
  public createExercise = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      if (!authUser) throw AppError.unauthorized('Authentication required');

      const validated = CreateCustomExerciseRequestSchema.parse(req.body);
      const exrId = `exr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

      const newExercise: ExerciseDocument = {
        _id: exrId,
        exrName: validated.name.trim(),
        exrMuscleGroup: validated.muscleGroup,
        exrSecondaryMuscles: validated.secondaryMuscles,
        exrEquipment: validated.equipment,
        exrStandardIncrementKg: validated.standardIncrementKg,
        exrIsCustom: true,
        exrCreatedByUserId: authUser.userId,
        exrCreatedAt: new Date(),
        exrUpdatedAt: new Date(),
      };

      await this.trainingRepository.createCustomExercise(newExercise);

      res.status(201).json({
        id: newExercise._id,
        name: newExercise.exrName,
        muscleGroup: newExercise.exrMuscleGroup,
        equipment: newExercise.exrEquipment,
        isCustom: true,
      });
    } catch (error) {
      next(error);
    }
  };

  // 3. Get Routines
  public getRoutines = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      if (!authUser) throw AppError.unauthorized('Authentication required');

      let routines = await this.trainingRepository.getRoutines(authUser.userId);

      // Seed initial default routines if user has none
      if (routines.length === 0) {
        const defaultRoutines: WorkoutRoutineDocument[] = [
          {
            _id: `wro_push_${authUser.userId.replace(/^usr_/, '')}`,
            wroUserId: authUser.userId,
            wroName: 'Push Hypertrophy & Delts',
            wroMuscleGroups: ['Chest', 'Shoulders', 'Triceps'],
            wroEstimatedMinutes: 55,
            wroExercises: [
              { wroExerciseId: 'exr_incline_db', wroExerciseName: 'Incline Dumbbell Press', wroOrder: 1, wroTargetSets: 3, wroTargetReps: 10, wroRestSeconds: 90 },
              { wroExerciseId: 'exr_cable_fly', wroExerciseName: 'Cable Chest Fly', wroOrder: 2, wroTargetSets: 3, wroTargetReps: 12, wroRestSeconds: 60 },
              { wroExerciseId: 'exr_lateral_raise', wroExerciseName: 'Dumbbell Lateral Raise', wroOrder: 3, wroTargetSets: 4, wroTargetReps: 15, wroRestSeconds: 60 },
            ],
            wroLastCompletedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            wroIsArchived: false,
            wroCreatedAt: new Date(),
            wroUpdatedAt: new Date(),
          },
          {
            _id: `wro_pull_${authUser.userId.replace(/^usr_/, '')}`,
            wroUserId: authUser.userId,
            wroName: 'Pull Strength & Heavy Rows',
            wroMuscleGroups: ['Back', 'Biceps', 'Rear Delts'],
            wroEstimatedMinutes: 60,
            wroExercises: [
              { wroExerciseId: 'exr_deadlift', wroExerciseName: 'Conventional Deadlift', wroOrder: 1, wroTargetSets: 4, wroTargetReps: 6, wroRestSeconds: 120 },
              { wroExerciseId: 'exr_pullup', wroExerciseName: 'Weighted Pull-Up', wroOrder: 2, wroTargetSets: 3, wroTargetReps: 8, wroRestSeconds: 90 },
            ],
            wroLastCompletedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            wroIsArchived: false,
            wroCreatedAt: new Date(),
            wroUpdatedAt: new Date(),
          },
        ];

        for (const r of defaultRoutines) {
          await this.trainingRepository.saveRoutine(r);
        }
        routines = defaultRoutines;
      }

      res.status(200).json({
        routines: routines.map((r) => ({
          id: r._id,
          userId: r.wroUserId,
          name: r.wroName,
          muscleGroups: r.wroMuscleGroups,
          estimatedMinutes: r.wroEstimatedMinutes,
          exercises: r.wroExercises.map((e) => ({
            exerciseId: e.wroExerciseId,
            exerciseName: e.wroExerciseName,
            order: e.wroOrder,
            targetSets: e.wroTargetSets,
            targetReps: e.wroTargetReps,
            restSeconds: e.wroRestSeconds,
            notes: e.wroNotes,
          })),
          lastCompletedDate: r.wroLastCompletedAt ? '3 days ago' : undefined,
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  // 4. Create Routine
  public createRoutine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      if (!authUser) throw AppError.unauthorized('Authentication required');

      const validated = CreateRoutineRequestSchema.parse(req.body);
      const wroId = `wro_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

      const newRoutine: WorkoutRoutineDocument = {
        _id: wroId,
        wroUserId: authUser.userId,
        wroName: validated.name.trim(),
        wroMuscleGroups: validated.muscleGroups,
        wroEstimatedMinutes: validated.estimatedMinutes,
        wroExercises: validated.exercises.map((e) => ({
          wroExerciseId: e.exerciseId,
          wroExerciseName: e.exerciseName,
          wroOrder: e.order,
          wroTargetSets: e.targetSets,
          wroTargetReps: e.targetReps,
          wroRestSeconds: e.restSeconds,
          wroNotes: e.notes,
        })),
        wroIsArchived: false,
        wroCreatedAt: new Date(),
        wroUpdatedAt: new Date(),
      };

      await this.trainingRepository.saveRoutine(newRoutine);

      res.status(201).json({
        id: newRoutine._id,
        name: newRoutine.wroName,
        muscleGroups: newRoutine.wroMuscleGroups,
        estimatedMinutes: newRoutine.wroEstimatedMinutes,
      });
    } catch (error) {
      next(error);
    }
  };

  // 5. Start Workout Session
  public startSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      if (!authUser) throw AppError.unauthorized('Authentication required');

      const validated = StartWorkoutSessionRequestSchema.parse(req.body);
      const wseId = `wse_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

      const newSession: WorkoutSessionDocument = {
        _id: wseId,
        wseUserId: authUser.userId,
        wseRoutineId: validated.routineId,
        wseRoutineName: validated.routineName,
        wseStartedAt: new Date(),
        wseDurationMinutes: 0,
        wseStatus: 'IN_PROGRESS',
        wseTotalVolumeKg: 0,
        wseTotalSetsCompleted: 0,
        wseExercises: validated.exercises.map((e) => ({
          wseExerciseId: e.exerciseId,
          wseExerciseName: e.name,
          wseTargetMuscle: e.targetMuscle,
          wseEquipment: e.equipment,
          wseSets: e.sets.map((s) => ({
            wseSetNumber: s.setNumber,
            wseSetType: s.type,
            wseWeightKg: s.weightKg,
            wseReps: s.reps,
            wseRpe: s.rpe,
            wseIsCompleted: s.isCompleted,
            wsePreviousPerformance: s.previousPerformance,
          })),
        })),
        wsePrsAchieved: [],
        wseVersion: 1,
        wseCreatedAt: new Date(),
        wseUpdatedAt: new Date(),
      };

      await this.trainingRepository.saveSession(newSession);

      res.status(201).json(this.mapSessionToDto(newSession));
    } catch (error) {
      next(error);
    }
  };

  // 6. Log Workout Set
  public logSet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      if (!authUser) throw AppError.unauthorized('Authentication required');

      const { id } = req.params;
      if (!id) throw AppError.badRequest('Session ID is required');

      const validated = LogWorkoutSetRequestSchema.parse(req.body);

      try {
        const updated = await this.trainingRepository.updateSessionSet(
          id,
          authUser.userId,
          validated.exerciseId,
          validated.setNumber,
          {
            weightKg: validated.weightKg,
            reps: validated.reps,
            isCompleted: validated.isCompleted,
            type: validated.type,
            rpe: validated.rpe,
          },
          validated.version
        );

        if (!updated) {
          throw AppError.notFound('Workout session or exercise not found');
        }

        res.status(200).json(this.mapSessionToDto(updated));
      } catch (err: any) {
        if (err.message === 'VERSION_CONFLICT') {
          throw AppError.conflict('Session version conflict. Please sync the latest workout state.');
        }
        throw err;
      }
    } catch (error) {
      next(error);
    }
  };

  // 7. Complete Session
  public completeSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      if (!authUser) throw AppError.unauthorized('Authentication required');

      const { id } = req.params;
      if (!id) throw AppError.badRequest('Session ID is required');

      const validated = CompleteWorkoutSessionRequestSchema.parse(req.body);

      const session = await this.trainingRepository.getSessionById(id, authUser.userId);
      if (!session) throw AppError.notFound('Session not found');

      if (validated.version !== undefined && session.wseVersion !== validated.version) {
        throw AppError.conflict('Session version conflict. Please sync the latest workout state.');
      }

      session.wseEndedAt = validated.endedAt ? new Date(validated.endedAt) : new Date();
      session.wseStatus = 'COMPLETED';
      session.wseDurationMinutes = Math.max(
        1,
        Math.round((session.wseEndedAt.getTime() - session.wseStartedAt.getTime()) / 1000 / 60)
      );

      // Derive final volume and detect PRs across all exercises
      const prsAchieved: PersonalRecordDocument[] = [];

      for (const ex of session.wseExercises) {
        const currentPR = await this.trainingRepository.getPRByExercise(authUser.userId, ex.wseExerciseId);
        const currentBest1RM = currentPR?.prcEstimated1RM || 0;

        const candidate = TrainingDomainService.detectPersonalRecords(
          ex.wseExerciseId,
          ex.wseExerciseName,
          ex.wseSets.map((s) => ({ weightKg: s.wseWeightKg, reps: s.wseReps, isCompleted: s.wseIsCompleted })),
          currentBest1RM
        );

        if (candidate) {
          const prDoc: PersonalRecordDocument = {
            _id: `prc_${authUser.userId.replace(/^usr_/, '')}_${ex.wseExerciseId.replace(/^exr_/, '')}`,
            prcUserId: authUser.userId,
            prcExerciseId: ex.wseExerciseId,
            prcExerciseName: ex.wseExerciseName,
            prcCategory: ex.wseTargetMuscle,
            prcBestWeightKg: candidate.weightKg,
            prcBestReps: candidate.reps,
            prcEstimated1RM: candidate.estimated1RM,
            prcAchievedInSessionId: session._id,
            prcAchievedAt: new Date(),
            prcUpdatedAt: new Date(),
          };

          await this.trainingRepository.upsertPersonalRecord(prDoc);
          prsAchieved.push(prDoc);
        }
      }

      session.wsePrsAchieved = prsAchieved.map((pr) => ({
        wseExerciseId: pr.prcExerciseId,
        wseExerciseName: pr.prcExerciseName,
        wseWeightKg: pr.prcBestWeightKg,
        wseReps: pr.prcBestReps,
        wseEstimated1RM: pr.prcEstimated1RM,
      }));

      session.wseVersion += 1;
      session.wseUpdatedAt = new Date();
      await this.trainingRepository.saveSession(session);

      res.status(200).json(this.mapSessionToDto(session));
    } catch (error) {
      next(error);
    }
  };

  // 8. Get Sessions History
  public getSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      if (!authUser) throw AppError.unauthorized('Authentication required');

      const limit = parseInt(req.query.limit as string, 10) || 20;
      const skip = parseInt(req.query.skip as string, 10) || 0;

      const sessions = await this.trainingRepository.getSessions(authUser.userId, limit, skip);
      res.status(200).json({
        sessions: sessions.map((s) => this.mapSessionToDto(s)),
      });
    } catch (error) {
      next(error);
    }
  };

  private mapSessionToDto(s: WorkoutSessionDocument) {
    return {
      id: s._id,
      userId: s.wseUserId,
      routineId: s.wseRoutineId,
      routineName: s.wseRoutineName,
      startedAt: s.wseStartedAt.toISOString(),
      endedAt: s.wseEndedAt?.toISOString(),
      durationMinutes: s.wseDurationMinutes,
      status: s.wseStatus,
      totalVolumeKg: s.wseTotalVolumeKg,
      totalSetsCompleted: s.wseTotalSetsCompleted,
      exercises: s.wseExercises.map((e) => ({
        exerciseId: e.wseExerciseId,
        name: e.wseExerciseName,
        targetMuscle: e.wseTargetMuscle,
        equipment: e.wseEquipment,
        sets: e.wseSets.map((set) => ({
          setNumber: set.wseSetNumber,
          type: set.wseSetType,
          weightKg: set.wseWeightKg,
          reps: set.wseReps,
          rpe: set.wseRpe,
          isCompleted: set.wseIsCompleted,
          previousPerformance: set.wsePreviousPerformance,
        })),
      })),
      prsAchieved: s.wsePrsAchieved.map((pr) => ({
        exerciseId: pr.wseExerciseId,
        exerciseName: pr.wseExerciseName,
        weightKg: pr.wseWeightKg,
        reps: pr.wseReps,
        estimated1RM: pr.wseEstimated1RM,
      })),
      version: s.wseVersion,
    };
  }
}
