import { z } from 'zod';
import { FoodNutrientProfileSchema, FoodUnitTypeSchema } from './food.contracts.js';

export const MealTypeSchema = z.enum([
  'BREAKFAST',
  'LUNCH',
  'DINNER',
  'SNACK',
  'PRE_WORKOUT',
  'POST_WORKOUT',
]);
export type MealTypeDto = z.infer<typeof MealTypeSchema>;

export const GoalModeSchema = z.enum(['DEFICIT', 'MAINTENANCE', 'SURPLUS']);
export type GoalModeDto = z.infer<typeof GoalModeSchema>;

export const LogFoodEntryRequestSchema = z.object({
  foodItemId: z.string(),
  mealType: MealTypeSchema,
  quantity: z.number().positive(),
  unit: FoodUnitTypeSchema,
  servingId: z.string().optional(),
  dateString: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
});
export type LogFoodEntryRequestDto = z.infer<typeof LogFoodEntryRequestSchema>;

export const FoodEntryResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  foodItemId: z.string(),
  foodName: z.string(),
  mealType: MealTypeSchema,
  quantity: z.number(),
  unit: FoodUnitTypeSchema,
  servingLabel: z.string(),
  nutritionSnapshot: FoodNutrientProfileSchema,
  loggedAt: z.string().datetime(),
  dateString: z.string(),
});
export type FoodEntryResponseDto = z.infer<typeof FoodEntryResponseSchema>;

export const NutritionTargetSchema = z.object({
  dailyCalories: z.number().min(800).max(8000),
  proteinGrams: z.number().min(0),
  carbsGrams: z.number().min(0),
  fatGrams: z.number().min(0),
  fiberGrams: z.number().min(0).optional(),
  waterMl: z.number().min(0).optional(),
  goalMode: GoalModeSchema,
  calorieOffset: z.number(),
});
export type NutritionTargetDto = z.infer<typeof NutritionTargetSchema>;

export const DailyNutritionSummaryResponseSchema = z.object({
  dateString: z.string(),
  target: NutritionTargetSchema,
  entries: z.array(FoodEntryResponseSchema),
  totalConsumed: FoodNutrientProfileSchema,
  remainingCalories: z.number(),
  waterConsumedMl: z.number(),
});
export type DailyNutritionSummaryResponseDto = z.infer<typeof DailyNutritionSummaryResponseSchema>;
