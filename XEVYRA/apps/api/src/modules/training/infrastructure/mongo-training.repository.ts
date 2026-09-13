import { Db, Collection } from 'mongodb';
import { TrainingDomainService } from '@xevyra/domain';

// 1. Exercise Document (exr)
export interface ExerciseDocument {
  _id: string;                         // 'exr_01J...'
  exrName: string;
  exrMuscleGroup: 'CHEST' | 'BACK' | 'LEGS' | 'SHOULDERS' | 'ARMS' | 'CORE';
  exrSecondaryMuscles?: string[];
  exrEquipment: 'BARBELL' | 'DUMBBELLS' | 'CABLE' | 'MACHINE' | 'BODYWEIGHT' | 'KETTLEBELL';
  exrStandardIncrementKg: number;
  exrIsCustom: boolean;
  exrCreatedByUserId?: string;         // 'usr_01J...'
  exrCreatedAt: Date;
  exrUpdatedAt: Date;
}

// 2. Workout Routine Document (wro)
export interface WorkoutRoutineDocument {
  _id: string;                         // 'wro_01J...'
  wroUserId: string;                   // 'usr_01J...'
  wroName: string;
  wroMuscleGroups: string[];
  wroEstimatedMinutes: number;
  wroExercises: Array<{
    wroExerciseId: string;             // 'exr_01J...'
    wroExerciseName: string;
    wroOrder: number;
    wroTargetSets: number;
    wroTargetReps: number;
    wroRestSeconds: number;
    wroNotes?: string;
  }>;
  wroLastCompletedAt?: Date;
  wroIsArchived: boolean;
  wroCreatedAt: Date;
  wroUpdatedAt: Date;
}

// 3. Workout Session Document (wse)
export interface WorkoutSessionDocument {
  _id: string;                         // 'wse_01J...'
  wseUserId: string;                   // 'usr_01J...'
  wseRoutineId?: string;               // 'wro_01J...'
  wseRoutineName: string;
  wseStartedAt: Date;
  wseEndedAt?: Date;
  wseDurationMinutes: number;
  wseStatus: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  wseTotalVolumeKg: number;
  wseTotalSetsCompleted: number;
  wseExercises: Array<{
    wseExerciseId: string;             // 'exr_01J...'
    wseExerciseName: string;
    wseTargetMuscle: string;
    wseEquipment: string;
    wseSets: Array<{
      wseSetNumber: number;
      wseSetType: 'NORMAL' | 'WARMUP' | 'DROPSET' | 'FAILURE';
      wseWeightKg: number;
      wseReps: number;
      wseRpe?: number;
      wseIsCompleted: boolean;
      wsePreviousPerformance?: string;
      wseCompletedAt?: Date;
    }>;
  }>;
  wsePrsAchieved: Array<{
    wseExerciseId: string;             // 'exr_01J...'
    wseExerciseName: string;
    wseWeightKg: number;
    wseReps: number;
    wseEstimated1RM: number;
  }>;
  wseNotes?: string;
  wseVersion: number;
  wseCreatedAt: Date;
  wseUpdatedAt: Date;
}

// 4. Personal Record Document (prc)
export interface PersonalRecordDocument {
  _id: string;                         // 'prc_01J...'
  prcUserId: string;                   // 'usr_01J...'
  prcExerciseId: string;               // 'exr_01J...'
  prcExerciseName: string;
  prcCategory: string;
  prcBestWeightKg: number;
  prcBestReps: number;
  prcEstimated1RM: number;
  prcAchievedInSessionId: string;      // 'wse_01J...'
  prcAchievedAt: Date;
  prcUpdatedAt: Date;
}

export class MongoTrainingRepository {
  private exercisesCollection: Collection<ExerciseDocument>;
  private routinesCollection: Collection<WorkoutRoutineDocument>;
  private sessionsCollection: Collection<WorkoutSessionDocument>;
  private prsCollection: Collection<PersonalRecordDocument>;

  constructor(db: Db) {
    this.exercisesCollection = db.collection<ExerciseDocument>('exercises');
    this.routinesCollection = db.collection<WorkoutRoutineDocument>('workout_routines');
    this.sessionsCollection = db.collection<WorkoutSessionDocument>('workout_sessions');
    this.prsCollection = db.collection<PersonalRecordDocument>('personal_records');
  }

  // Exercises
  public async getExercises(userId: string): Promise<ExerciseDocument[]> {
    return this.exercisesCollection
      .find({
        $or: [{ exrIsCustom: false }, { exrCreatedByUserId: userId }],
      })
      .sort({ exrName: 1 })
      .toArray();
  }

  public async createCustomExercise(doc: ExerciseDocument): Promise<void> {
    await this.exercisesCollection.insertOne(doc);
  }

  // Routines
  public async getRoutines(userId: string): Promise<WorkoutRoutineDocument[]> {
    return this.routinesCollection
      .find({ wroUserId: userId, wroIsArchived: false })
      .sort({ wroCreatedAt: -1 })
      .toArray();
  }

  public async getRoutineById(id: string, userId: string): Promise<WorkoutRoutineDocument | null> {
    return this.routinesCollection.findOne({ _id: id, wroUserId: userId });
  }

  public async saveRoutine(doc: WorkoutRoutineDocument): Promise<void> {
    await this.routinesCollection.updateOne(
      { _id: doc._id },
      { $set: doc },
      { upsert: true }
    );
  }

  // Workout Sessions
  public async getSessions(userId: string, limit: number = 20, skip: number = 0): Promise<WorkoutSessionDocument[]> {
    return this.sessionsCollection
      .find({ wseUserId: userId })
      .sort({ wseStartedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  public async getSessionById(id: string, userId: string): Promise<WorkoutSessionDocument | null> {
    return this.sessionsCollection.findOne({ _id: id, wseUserId: userId });
  }

  public async getActiveSession(userId: string): Promise<WorkoutSessionDocument | null> {
    return this.sessionsCollection.findOne({
      wseUserId: userId,
      wseStatus: 'IN_PROGRESS',
    });
  }

  public async saveSession(doc: WorkoutSessionDocument): Promise<void> {
    await this.sessionsCollection.updateOne(
      { _id: doc._id },
      { $set: doc },
      { upsert: true }
    );
  }

  public async updateSessionSet(
    sessionId: string,
    userId: string,
    exerciseId: string,
    setNumber: number,
    setData: { weightKg: number; reps: number; isCompleted: boolean; type?: string; rpe?: number },
    expectedVersion?: number
  ): Promise<WorkoutSessionDocument | null> {
    const session = await this.getSessionById(sessionId, userId);
    if (!session) return null;

    if (expectedVersion !== undefined && session.wseVersion !== expectedVersion) {
      throw new Error('VERSION_CONFLICT');
    }

    const exercise = session.wseExercises.find((e) => e.wseExerciseId === exerciseId);
    if (!exercise) return null;

    let targetSet = exercise.wseSets.find((s) => s.wseSetNumber === setNumber);
    if (!targetSet) {
      targetSet = {
        wseSetNumber: setNumber,
        wseSetType: (setData.type as any) || 'NORMAL',
        wseWeightKg: setData.weightKg,
        wseReps: setData.reps,
        wseRpe: setData.rpe,
        wseIsCompleted: setData.isCompleted,
        wseCompletedAt: setData.isCompleted ? new Date() : undefined,
      };
      exercise.wseSets.push(targetSet);
    } else {
      targetSet.wseWeightKg = setData.weightKg;
      targetSet.wseReps = setData.reps;
      targetSet.wseIsCompleted = setData.isCompleted;
      if (setData.type) targetSet.wseSetType = setData.type as any;
      if (setData.rpe !== undefined) targetSet.wseRpe = setData.rpe;
      if (setData.isCompleted) targetSet.wseCompletedAt = new Date();
    }

    // Re-derive volume and completed sets
    const allSets = session.wseExercises.flatMap((e) => e.wseSets);
    session.wseTotalVolumeKg = TrainingDomainService.calculateVolume(
      allSets.map((s) => ({ weightKg: s.wseWeightKg, reps: s.wseReps, isCompleted: s.wseIsCompleted }))
    );
    session.wseTotalSetsCompleted = allSets.filter((s) => s.wseIsCompleted).length;
    session.wseVersion += 1;
    session.wseUpdatedAt = new Date();

    await this.saveSession(session);
    return session;
  }

  // Personal Records
  public async getPersonalRecords(userId: string): Promise<PersonalRecordDocument[]> {
    return this.prsCollection
      .find({ prcUserId: userId })
      .sort({ prcAchievedAt: -1 })
      .toArray();
  }

  public async getPRByExercise(userId: string, exerciseId: string): Promise<PersonalRecordDocument | null> {
    return this.prsCollection.findOne({ prcUserId: userId, prcExerciseId: exerciseId });
  }

  public async upsertPersonalRecord(prDoc: PersonalRecordDocument): Promise<void> {
    await this.prsCollection.updateOne(
      { prcUserId: prDoc.prcUserId, prcExerciseId: prDoc.prcExerciseId },
      { $set: prDoc },
      { upsert: true }
    );
  }
}
