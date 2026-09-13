import { z } from 'zod';

export const LogBodyweightRequestSchema = z.object({
  dateString: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weightKg: z.number().min(20).max(500),
  notes: z.string().optional(),
});
export type LogBodyweightRequestDto = z.infer<typeof LogBodyweightRequestSchema>;

export const BodyweightLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  dateString: z.string(),
  weightKg: z.number(),
  notes: z.string().optional(),
  loggedAt: z.string().datetime(),
});
export type BodyweightLogDto = z.infer<typeof BodyweightLogSchema>;

export const PersonalRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  exerciseId: z.string(),
  exerciseName: z.string(),
  category: z.string(),
  bestWeightKg: z.number(),
  bestReps: z.number(),
  estimated1RM: z.number(),
  achievedInSessionId: z.string(),
  achievedAt: z.string().datetime(),
});
export type PersonalRecordDto = z.infer<typeof PersonalRecordSchema>;

export const ProgressSummaryResponseSchema = z.object({
  currentWeightKg: z.number(),
  sevenDayChangeKg: z.number(),
  weightHistory: z.array(z.object({ label: z.string(), value: z.number() })),
  weeklyVolumeTonnes: z.number(),
  volumeHistory: z.array(z.object({ label: z.string(), value: z.number() })),
  prsSmashedCount: z.number(),
  topRecords: z.array(PersonalRecordSchema),
});
export type ProgressSummaryResponseDto = z.infer<typeof ProgressSummaryResponseSchema>;
