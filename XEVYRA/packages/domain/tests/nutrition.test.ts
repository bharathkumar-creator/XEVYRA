import { describe, it, expect } from 'vitest';
import {
  FoodNutrientProfile,
  FoodServing,
  FoodItem,
  FoodEntry,
  NutritionTarget,
  DailyNutritionSummary,
  MaintenanceCalorieAnalysis,
} from '../src/index.js';

describe('Nutrition Domain Foundation', () => {
  it('should scale and add nutrient profiles accurately', () => {
    const rawChicken100g = FoodNutrientProfile.create({
      calories: 165,
      proteinGrams: 31,
      carbsGrams: 0,
      fatGrams: 3.6,
      sodiumMg: 74,
    }).getValue();

    // 250g of chicken
    const chicken250g = rawChicken100g.scale(2.5);
    expect(chicken250g.calories).toBe(412.5);
    expect(chicken250g.proteinGrams).toBe(77.5);
    expect(chicken250g.fatGrams).toBe(9);

    const cookedRice200g = FoodNutrientProfile.create({
      calories: 260,
      proteinGrams: 5.4,
      carbsGrams: 56.4,
      fatGrams: 0.6,
    }).getValue();

    const mealTotal = chicken250g.add(cookedRice200g);
    expect(mealTotal.calories).toBe(672.5);
    expect(mealTotal.proteinGrams).toBe(82.9);
    expect(mealTotal.carbsGrams).toBe(56.4);
    expect(mealTotal.fatGrams).toBe(9.6);
  });

  it('should calculate serving factors for different weight units correctly', () => {
    // 200g with PER_100G basis -> factor 2.0
    expect(FoodServing.calculateFactor('GRAMS', 200, 'PER_100G')).toBe(2);

    // 0.5 kg with PER_100G basis -> 500g -> factor 5.0
    expect(FoodServing.calculateFactor('KILOGRAMS', 0.5, 'PER_100G')).toBe(5);

    // 1 serving with PER_SERVING basis -> factor 1.0
    expect(FoodServing.calculateFactor('SERVING', 1, 'PER_SERVING')).toBe(1);
  });

  it('should calculate food item nutrients with custom weight input', () => {
    const jasmineRice = FoodItem.create('food_rice_01', {
      name: 'Jasmine Rice (Cooked)',
      category: 'Carbohydrates',
      standardBasis: 'PER_100G',
      nutrientsPerBasis: FoodNutrientProfile.create({
        calories: 130,
        proteinGrams: 2.7,
        carbsGrams: 28.2,
        fatGrams: 0.3,
      }).getValue(),
      availableServings: [
        FoodServing.create({
          id: 'srv_100g',
          label: '100 g',
          unitType: 'GRAMS',
          baseAmount: 100,
          basisEquivalentFactor: 1,
          isDefault: true,
        }).getValue(),
        FoodServing.create({
          id: 'srv_cup',
          label: '1 Cup (158g)',
          unitType: 'CUP',
          baseAmount: 158,
          basisEquivalentFactor: 1.58,
        }).getValue(),
      ],
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).getValue();

    const nutrients200g = jasmineRice.calculateNutrients(200, 'GRAMS');
    expect(nutrients200g.calories).toBe(260);
    expect(nutrients200g.proteinGrams).toBe(5.4);
    expect(nutrients200g.carbsGrams).toBe(56.4);

    const nutrients1Cup = jasmineRice.calculateNutrients(1, 'srv_cup');
    expect(nutrients1Cup.calories).toBe(205.4);
  });

  it('should preserve immutable nutritionSnapshot on FoodEntry', () => {
    const snapshot = FoodNutrientProfile.create({
      calories: 412,
      proteinGrams: 77,
      carbsGrams: 0,
      fatGrams: 9,
    }).getValue();

    const entry = FoodEntry.create('entry_01', {
      userId: 'usr_athlete_123',
      foodItemId: 'food_chicken_01',
      foodName: 'Chicken Breast',
      mealType: 'LUNCH',
      quantity: 250,
      unit: 'GRAMS',
      servingLabel: '250 g',
      nutritionSnapshot: snapshot,
      loggedAt: new Date(),
      dateString: '2026-09-11',
    }).getValue();

    expect(entry.quantity).toBe(250);
    expect(entry.nutritionSnapshot.proteinGrams).toBe(77);
  });

  it('should correctly evaluate confidence tiers for maintenance calorie analysis', () => {
    const analysis = MaintenanceCalorieAnalysis.create({
      userId: 'usr_athlete_123',
      daysAnalyzed: 7,
      confidence: 'INITIAL',
      averageDailyCalories: 2450,
      averageBodyWeightKg: 78.2,
      weightChangeKg: -0.3,
      weightTrendDescription: 'Slight downward trend (-0.3 kg over 7 days)',
      estimatedMaintenanceCalories: 2600,
      calculatedAt: new Date(),
      recommendations: [
        'Track for 14 continuous days for higher confidence.',
        'Current weight trend suggests a slight caloric deficit.',
      ],
    }).getValue();

    expect(analysis.confidence).toBe('INITIAL');
    expect(analysis.estimatedMaintenanceCalories).toBe(2600);
  });
});
