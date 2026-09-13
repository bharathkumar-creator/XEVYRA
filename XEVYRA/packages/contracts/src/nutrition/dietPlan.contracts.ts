import { z } from 'zod';
import { FoodNutrientProfileSchema } from './food.contracts.js';
import { GoalModeSchema } from './nutrition.contracts.js';

export const DietPlanMealItemSchema = z.object({
  foodItemId: z.string().optional(),
  name: z.string(),
  quantity: z.number().positive(),
  unit: z.string(),
  portionDescription: z.string(),
  nutrients: FoodNutrientProfileSchema,
  notes: z.string().optional(),
});
export type DietPlanMealItemDto = z.infer<typeof DietPlanMealItemSchema>;

export const DietPlanMealSchema = z.object({
  mealType: z.string(),
  title: z.string(),
  targetTime: z.string().optional(),
  items: z.array(DietPlanMealItemSchema),
  totalNutrients: FoodNutrientProfileSchema,
});
export type DietPlanMealDto = z.infer<typeof DietPlanMealSchema>;

export const CuisineTypeSchema = z.enum([
  'AMERICAN',
  'NORTH_INDIAN',
  'SOUTH_INDIAN',
  'MEDITERRANEAN',
  'ASIAN',
  'CUSTOM',
]);
export type CuisineTypeDto = z.infer<typeof CuisineTypeSchema>;

export const DietPlanResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  cuisineType: CuisineTypeSchema.default('AMERICAN'),
  goalMode: GoalModeSchema,
  targetDailyCalories: z.number(),
  targetMacros: FoodNutrientProfileSchema,
  meals: z.array(DietPlanMealSchema),
  dietaryPreferences: z.array(z.string()),
  allergies: z.array(z.string()),
  isActive: z.boolean(),
  generatedBy: z.enum(['AI', 'COACH', 'USER_CUSTOM']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type DietPlanResponseDto = z.infer<typeof DietPlanResponseSchema>;

export const GenerateDietPlanRequestSchema = z.object({
  targetDailyCalories: z.number().min(800).max(8000),
  cuisineType: CuisineTypeSchema.default('AMERICAN'),
  goalMode: GoalModeSchema,
  dietaryPreferences: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  mealsPerDay: z.number().min(2).max(6).default(4),
  macroSplitPreference: z.enum(['HIGH_PROTEIN', 'BALANCED', 'LOW_CARB', 'KETO']).default('HIGH_PROTEIN'),
});
export type GenerateDietPlanRequestDto = z.infer<typeof GenerateDietPlanRequestSchema>;

export const SwapDietMealRequestSchema = z.object({
  dietPlanId: z.string(),
  mealIndex: z.number().min(0),
  swapReason: z.string().optional(),
});
export type SwapDietMealRequestDto = z.infer<typeof SwapDietMealRequestSchema>;
