import { describe, it, expect } from 'vitest';
import {
  LogFoodEntryRequestSchema,
  MaintenanceCalorieAnalysisResponseSchema,
  GoalCalorieCalculationRequestSchema,
  DietPlanResponseSchema,
} from '../src/index.js';

describe('Nutrition Contracts Validation', () => {
  it('should validate weighted food logging request DTO', () => {
    const validPayload = {
      foodItemId: 'food_123',
      mealType: 'LUNCH',
      quantity: 200,
      unit: 'GRAMS',
      dateString: '2026-09-11',
    };

    const parsed = LogFoodEntryRequestSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
  });

  it('should reject invalid date strings and negative quantities', () => {
    const invalidPayload = {
      foodItemId: 'food_123',
      mealType: 'LUNCH',
      quantity: -50,
      unit: 'GRAMS',
      dateString: 'invalid-date',
    };

    const parsed = LogFoodEntryRequestSchema.safeParse(invalidPayload);
    expect(parsed.success).toBe(false);
  });

  it('should validate 7-day maintenance calorie analysis response DTO', () => {
    const validAnalysis = {
      userId: 'usr_123',
      daysAnalyzed: 7,
      confidence: 'INITIAL',
      averageDailyCalories: 2300,
      estimatedMaintenanceCalories: 2500,
      weightTrendDescription: 'Stable weight trend',
      calculatedAt: new Date().toISOString(),
      recommendations: ['Maintain current caloric intake for 7 more days'],
    };

    const parsed = MaintenanceCalorieAnalysisResponseSchema.safeParse(validAnalysis);
    expect(parsed.success).toBe(true);
  });

  it('should validate goal calorie calculation requests with offset presets', () => {
    const validDeficit = {
      maintenanceCalories: 2500,
      goalMode: 'DEFICIT',
      calorieOffset: -500,
    };

    const parsed = GoalCalorieCalculationRequestSchema.safeParse(validDeficit);
    expect(parsed.success).toBe(true);
  });
});
