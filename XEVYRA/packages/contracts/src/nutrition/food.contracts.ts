import { z } from 'zod';

export const StandardNutritionBasisSchema = z.enum(['PER_100G', 'PER_100ML', 'PER_SERVING']);
export type StandardNutritionBasisDto = z.infer<typeof StandardNutritionBasisSchema>;

export const FoodUnitTypeSchema = z.enum([
  'GRAMS',
  'KILOGRAMS',
  'OUNCES',
  'MILLILITERS',
  'LITERS',
  'SERVING',
  'PIECE',
  'SCOOP',
  'CUP',
]);
export type FoodUnitTypeDto = z.infer<typeof FoodUnitTypeSchema>;

export const FoodNutrientProfileSchema = z.object({
  calories: z.number().min(0),
  proteinGrams: z.number().min(0),
  carbsGrams: z.number().min(0),
  fatGrams: z.number().min(0),
  fiberGrams: z.number().min(0).optional(),
  sugarGrams: z.number().min(0).optional(),
  sodiumMg: z.number().min(0).optional(),
});
export type FoodNutrientProfileDto = z.infer<typeof FoodNutrientProfileSchema>;

export const FoodServingSchema = z.object({
  id: z.string(),
  label: z.string(),
  unitType: FoodUnitTypeSchema,
  baseAmount: z.number().positive(),
  basisEquivalentFactor: z.number().positive(),
  isDefault: z.boolean().optional(),
});
export type FoodServingDto = z.infer<typeof FoodServingSchema>;

export const FoodItemResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string().optional(),
  barcode: z.string().optional(),
  category: z.string(),
  standardBasis: StandardNutritionBasisSchema,
  nutrientsPerBasis: FoodNutrientProfileSchema,
  availableServings: z.array(FoodServingSchema),
  isVerified: z.boolean(),
});
export type FoodItemResponseDto = z.infer<typeof FoodItemResponseSchema>;

export const FoodSearchQuerySchema = z.object({
  query: z.string().min(1),
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});
export type FoodSearchQueryDto = z.infer<typeof FoodSearchQuerySchema>;
