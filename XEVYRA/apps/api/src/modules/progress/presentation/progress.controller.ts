import { Request, Response, NextFunction } from 'express';
import { LogBodyweightRequestSchema } from '@xevyra/contracts';
import { MongoProgressRepository, BodyweightLogDocument, PersonalRecordDocument } from '../infrastructure/mongo-progress.repository.js';
import { MongoTrainingRepository, WorkoutSessionDocument } from '../../training/infrastructure/mongo-training.repository.js';
import { MongoProfileRepository } from '../../profile/infrastructure/mongo-profile.repository.js';
import { AppError } from '../../../shared/errors/app-error.js';

export class ProgressController {
  constructor(
    private progressRepository: MongoProgressRepository,
    private trainingRepository: MongoTrainingRepository,
    private profileRepository: MongoProfileRepository
  ) {}

  // 1. Get Progress Summary
  public getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      if (!authUser) throw AppError.unauthorized('Authentication required');

      const [weightLogs, prRecords, sessions, profile] = await Promise.all([
        this.progressRepository.getWeightLogs(authUser.userId, 14),
        this.progressRepository.getPersonalRecords(authUser.userId),
        this.trainingRepository.getSessions(authUser.userId, 14),
        this.profileRepository.findByUserId(authUser.userId),
      ]);

      // Calculate weight metrics
      const currentWeight = weightLogs[0]?.bwlWeightKg || profile?.currentWeightKg || 78.5;
      const lastEntry = weightLogs.length > 1 ? weightLogs[weightLogs.length - 1] : undefined;
      const olderWeight = lastEntry?.bwlWeightKg || currentWeight;
      const sevenDayChangeKg = Math.round((currentWeight - olderWeight) * 10) / 10;

      // Weight history chart points (chronological)
      const weightHistory = [...weightLogs].reverse().map((w: BodyweightLogDocument) => {
        const d = new Date(w.bwlDateString);
        return {
          label: d.toLocaleDateString('en-US', { weekday: 'short' }),
          value: w.bwlWeightKg,
        };
      });

      // If no weight history, seed single point
      if (weightHistory.length === 0) {
        weightHistory.push({ label: 'Today', value: currentWeight });
      }

      // Calculate weekly volume
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const weeklySessions = sessions.filter((s: WorkoutSessionDocument) => new Date(s.wseStartedAt).getTime() >= oneWeekAgo);
      const totalVolumeKg = weeklySessions.reduce((acc: number, s: WorkoutSessionDocument) => acc + (s.wseTotalVolumeKg || 0), 0);
      const weeklyVolumeTonnes = Math.round((totalVolumeKg / 1000) * 10) / 10;

      // Volume history chart (last 6 sessions)
      const volumeHistory = [...sessions]
        .slice(0, 6)
        .reverse()
        .map((s: WorkoutSessionDocument, idx: number) => ({
          label: s.wseRoutineName.slice(0, 4) || `S${idx + 1}`,
          value: Math.round((s.wseTotalVolumeKg || 0) / 1000 * 10) / 10,
        }));

      res.status(200).json({
        currentWeightKg: currentWeight,
        sevenDayChangeKg,
        weightHistory,
        weeklyVolumeTonnes,
        volumeHistory: volumeHistory.length > 0 ? volumeHistory : [{ label: 'W1', value: 0 }],
        prsSmashedCount: prRecords.length,
        topRecords: prRecords.map((pr: PersonalRecordDocument) => ({
          id: pr._id,
          userId: pr.prcUserId,
          exerciseId: pr.prcExerciseId,
          exerciseName: pr.prcExerciseName,
          category: pr.prcCategory,
          bestWeightKg: pr.prcBestWeightKg,
          bestReps: pr.prcBestReps,
          estimated1RM: pr.prcEstimated1RM,
          achievedInSessionId: pr.prcAchievedInSessionId,
          achievedAt: pr.prcAchievedAt.toISOString(),
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  // 2. Log Bodyweight
  public logWeight = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      if (!authUser) throw AppError.unauthorized('Authentication required');

      const validated = LogBodyweightRequestSchema.parse(req.body);

      const bwlDoc: BodyweightLogDocument = {
        _id: `bwl_${authUser.userId.replace(/^usr_/, '')}_${validated.dateString.replace(/-/g, '')}`,
        bwlUserId: authUser.userId,
        bwlDateString: validated.dateString,
        bwlWeightKg: validated.weightKg,
        bwlNotes: validated.notes,
        bwlLoggedAt: new Date(),
        bwlCreatedAt: new Date(),
        bwlUpdatedAt: new Date(),
      };

      await this.progressRepository.logBodyweight(bwlDoc);

      // Update current weight in profile too
      const profile = await this.profileRepository.findByUserId(authUser.userId);
      if (profile) {
        profile.currentWeightKg = validated.weightKg;
        profile.updatedAt = new Date();
        await this.profileRepository.save(profile);
      }

      res.status(201).json({
        id: bwlDoc._id,
        userId: authUser.userId,
        dateString: bwlDoc.bwlDateString,
        weightKg: bwlDoc.bwlWeightKg,
        notes: bwlDoc.bwlNotes,
        loggedAt: bwlDoc.bwlLoggedAt.toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };
}
