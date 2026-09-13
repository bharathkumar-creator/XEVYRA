import { z } from 'zod';

export const MaintenanceDataConfidenceSchema = z.enum([
  'INSUFFICIENT',
  'PRELIMINARY',
  'INITIAL',
  'MORE_RELIABLE',
  'STRONGER_TREND',
]);
export type MaintenanceDataConfidenceDto = z.infer<typeof MaintenanceDataConfidenceSchema>;

export const DailyLogPointSchema = z.object({
  dateString: z.string(),
  caloriesLogged: z.number(),
  bodyWeightKg: z.number().optional(),
});
export type DailyLogPointDto = z.infer<typeof DailyLogPointSchema>;

export const MaintenanceCalorieAnalysisResponseSchema = z.object({
  userId: z.string(),
  daysAnalyzed: z.number().min(0),
  confidence: MaintenanceDataConfidenceSchema,
  averageDailyCalories: z.number(),
  averageBodyWeightKg: z.number().optional(),
  weightChangeKg: z.number().optional(),
  weightTrendDescription: z.string(),
  estimatedMaintenanceCalories: z.number(),
  calculatedAt: z.string().datetime(),
  recommendations: z.array(z.string()),
  historyPoints: z.array(DailyLogPointSchema).optional(),
});
export type MaintenanceCalorieAnalysisResponseDto = z.infer<typeof MaintenanceCalorieAnalysisResponseSchema>;

export const GoalCalorieCalculationRequestSchema = z.object({
  maintenanceCalories: z.number().min(800).max(8000),
  goalMode: z.enum(['DEFICIT', 'MAINTENANCE', 'SURPLUS']),
  calorieOffset: z.number().min(-1500).max(1500),
});
export type GoalCalorieCalculationRequestDto = z.infer<typeof GoalCalorieCalculationRequestSchema>;
