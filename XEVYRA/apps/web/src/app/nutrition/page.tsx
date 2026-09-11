'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/navigation/PageContainer';
import { SectionHeader } from '@/components/navigation/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CalorieRing } from '@/components/ui/CalorieRing';
import { MacroSummary } from '@/components/nutrition/MacroSummary';
import { MealCard, MealItemProps } from '@/components/nutrition/MealCard';
import { NutritionTargetCard } from '@/components/nutrition/NutritionTargetCard';
import { FoodWeightInput, PredefinedFood } from '@/components/nutrition/FoodWeightInput';
import { MaintenancePlannerModal } from '@/components/nutrition/MaintenancePlannerModal';
import { useToast } from '@/components/feedback/Toast';

export default function NutritionPage() {
  const { showToast } = useToast();
  const [isFoodInputOpen, setIsFoodInputOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<string>('BREAKFAST');
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);

  interface NutritionStrategyState {
    goalMode: 'DEFICIT' | 'MAINTENANCE' | 'SURPLUS';
    dailyCalorieTarget: number;
    maintenanceCaloriesEstimated: number;
    calorieOffset: number;
    confidence: 'INSUFFICIENT' | 'PRELIMINARY' | 'INITIAL' | 'MORE_RELIABLE' | 'STRONGER_TREND';
    daysAnalyzed: number;
    macroTargets: {
      protein: number;
      carbs: number;
      fat: number;
    };
  }

  // Target and maintenance state
  const [strategy, setStrategy] = useState<NutritionStrategyState>({
    goalMode: 'DEFICIT',
    dailyCalorieTarget: 2400,
    maintenanceCaloriesEstimated: 2650,
    calorieOffset: -250,
    confidence: 'INITIAL',
    daysAnalyzed: 7,
    macroTargets: {
      protein: 180,
      carbs: 250,
      fat: 70,
    },
  });

  // Predefined food database with standard 100g basis
  const availableFoods: PredefinedFood[] = [
    {
      id: 'food_chicken',
      name: 'Grilled Chicken Breast',
      category: 'Proteins',
      baseCaloriesPer100g: 165,
      baseProteinPer100g: 31,
      baseCarbsPer100g: 0,
      baseFatPer100g: 3.6,
      standardUnit: 'g',
      defaultServingSize: 200,
    },
    {
      id: 'food_rice',
      name: 'Jasmine Rice (Cooked)',
      category: 'Carbs',
      baseCaloriesPer100g: 130,
      baseProteinPer100g: 2.7,
      baseCarbsPer100g: 28.2,
      baseFatPer100g: 0.3,
      standardUnit: 'g',
      defaultServingSize: 200,
    },
    {
      id: 'food_eggs',
      name: 'Whole Eggs (Boiled/Cooked)',
      category: 'Proteins',
      baseCaloriesPer100g: 155,
      baseProteinPer100g: 13,
      baseCarbsPer100g: 1.1,
      baseFatPer100g: 11,
      standardUnit: 'g',
      defaultServingSize: 150,
    },
    {
      id: 'food_oats',
      name: 'Rolled Oats (Raw)',
      category: 'Carbs',
      baseCaloriesPer100g: 389,
      baseProteinPer100g: 16.9,
      baseCarbsPer100g: 66.3,
      baseFatPer100g: 6.9,
      standardUnit: 'g',
      defaultServingSize: 80,
    },
    {
      id: 'food_beef',
      name: 'Lean Ground Beef (90/10)',
      category: 'Proteins',
      baseCaloriesPer100g: 176,
      baseProteinPer100g: 20,
      baseCarbsPer100g: 0,
      baseFatPer100g: 10,
      standardUnit: 'g',
      defaultServingSize: 200,
    },
    {
      id: 'food_whey',
      name: 'Whey Protein Isolate',
      category: 'Proteins',
      baseCaloriesPer100g: 370,
      baseProteinPer100g: 82,
      baseCarbsPer100g: 3,
      baseFatPer100g: 1.5,
      standardUnit: 'g',
      defaultServingSize: 30,
    },
    {
      id: 'food_olive_oil',
      name: 'Extra Virgin Olive Oil',
      category: 'Fats',
      baseCaloriesPer100g: 884,
      baseProteinPer100g: 0,
      baseCarbsPer100g: 0,
      baseFatPer100g: 100,
      standardUnit: 'g',
      defaultServingSize: 15,
    },
  ];

  // Daily logged meals
  const [meals, setMeals] = useState<{ [key: string]: MealItemProps[] }>({
    BREAKFAST: [
      {
        id: 'item_1',
        foodName: 'Whole Eggs (Boiled/Cooked)',
        quantity: 150,
        unit: 'g',
        calories: 232,
        proteinGrams: 19.5,
        carbsGrams: 1.6,
        fatGrams: 16.5,
      },
      {
        id: 'item_2',
        foodName: 'Rolled Oats (Raw)',
        quantity: 80,
        unit: 'g',
        calories: 311,
        proteinGrams: 13.5,
        carbsGrams: 53,
        fatGrams: 5.5,
      },
    ],
    LUNCH: [
      {
        id: 'item_3',
        foodName: 'Grilled Chicken Breast',
        quantity: 200,
        unit: 'g',
        calories: 330,
        proteinGrams: 62,
        carbsGrams: 0,
        fatGrams: 7.2,
      },
      {
        id: 'item_4',
        foodName: 'Jasmine Rice (Cooked)',
        quantity: 200,
        unit: 'g',
        calories: 260,
        proteinGrams: 5.4,
        carbsGrams: 56.4,
        fatGrams: 0.6,
      },
    ],
    DINNER: [
      {
        id: 'item_5',
        foodName: 'Lean Ground Beef (90/10)',
        quantity: 200,
        unit: 'g',
        calories: 352,
        proteinGrams: 40,
        carbsGrams: 0,
        fatGrams: 20,
      },
      {
        id: 'item_6',
        foodName: 'Jasmine Rice (Cooked)',
        quantity: 150,
        unit: 'g',
        calories: 195,
        proteinGrams: 4,
        carbsGrams: 42.3,
        fatGrams: 0.4,
      },
    ],
    SNACKS: [
      {
        id: 'item_7',
        foodName: 'Whey Protein Isolate',
        quantity: 30,
        unit: 'g',
        calories: 111,
        proteinGrams: 24.6,
        carbsGrams: 0.9,
        fatGrams: 0.4,
      },
    ],
  });

  // Calculate totals
  const allItems = Object.values(meals).flat();
  const totalCalories = allItems.reduce((acc, item) => acc + item.calories, 0);
  const totalProtein = allItems.reduce((acc, item) => acc + item.proteinGrams, 0);
  const totalCarbs = allItems.reduce((acc, item) => acc + item.carbsGrams, 0);
  const totalFat = allItems.reduce((acc, item) => acc + item.fatGrams, 0);

  const handleOpenFoodLogger = (mealType: string) => {
    setActiveMealType(mealType);
    setIsFoodInputOpen(true);
  };

  const handleAddFoodEntry = (entry: {
    foodId: string;
    foodName: string;
    quantity: number;
    unit: string;
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  }) => {
    const newItem: MealItemProps = {
      id: `logged_${Date.now()}`,
      ...entry,
    };

    setMeals((prev) => ({
      ...prev,
      [activeMealType]: [...(prev[activeMealType] || []), newItem],
    }));

    showToast({
      type: 'success',
      title: 'Food Logged',
      message: `${entry.foodName} (${entry.quantity}${entry.unit}) added to ${activeMealType}.`,
    });
  };

  const handleRemoveFoodEntry = (mealType: string, id: string) => {
    setMeals((prev) => ({
      ...prev,
      [mealType]: (prev[mealType] || []).filter((item) => item.id !== id),
    }));
    showToast({
      type: 'info',
      title: 'Item Removed',
      message: 'Item removed from daily log.',
    });
  };

  const handleApplyDietPlan = (plan: {
    goalMode: 'DEFICIT' | 'MAINTENANCE' | 'SURPLUS';
    calorieOffset: number;
    targetCalories: number;
    macroSplit: { proteinGrams: number; carbsGrams: number; fatGrams: number };
  }) => {
    setStrategy((prev) => ({
      ...prev,
      goalMode: plan.goalMode,
      calorieOffset: plan.calorieOffset,
      dailyCalorieTarget: plan.targetCalories,
      macroTargets: {
        protein: plan.macroSplit.proteinGrams,
        carbs: plan.macroSplit.carbsGrams,
        fat: plan.macroSplit.fatGrams,
      },
    }));

    showToast({
      type: 'success',
      title: 'Strategy Updated',
      message: `Daily target adjusted to ${plan.targetCalories} kcal (${plan.goalMode}).`,
    });
  };

  const getMealCalories = (mealKey: string) => {
    return (meals[mealKey] || []).reduce((acc, item) => acc + item.calories, 0);
  };

  return (
    <PageContainer maxWidth="xl" className="flex flex-col gap-6">
      {/* 1. Header & Strategy Card */}
      <div className="flex flex-col gap-2">
        <SectionHeader
          title="Daily Fuel & Macros"
          subtitle="Precision weight-based nutrition tracking"
        />
        <NutritionTargetCard
          goalMode={strategy.goalMode}
          dailyCalorieTarget={strategy.dailyCalorieTarget}
          maintenanceCaloriesEstimated={strategy.maintenanceCaloriesEstimated}
          calorieOffset={strategy.calorieOffset}
          confidence={strategy.confidence}
          daysAnalyzed={strategy.daysAnalyzed}
          onOpenPlanner={() => setIsPlannerOpen(true)}
        />
      </div>

      {/* 2. Ring & Macros Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <Card variant="default" className="md:col-span-5 flex flex-col items-center justify-center p-6 text-center">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-text-tertiary mb-3">
            CALORIE PROGRESS
          </span>
          <CalorieRing
            consumed={totalCalories}
            target={strategy.dailyCalorieTarget}
            size={170}
          />
        </Card>

        <div className="md:col-span-7">
          <MacroSummary
            protein={{ consumed: totalProtein, target: strategy.macroTargets.protein }}
            carbs={{ consumed: totalCarbs, target: strategy.macroTargets.carbs }}
            fat={{ consumed: totalFat, target: strategy.macroTargets.fat }}
          />
        </div>
      </div>

      {/* 3. Meals Breakdown (Weight-Based Logs) */}
      <div className="flex flex-col gap-4">
        <SectionHeader
          title="Meal Breakdown"
          subtitle="Log individual grams (e.g. Rice 200g, Chicken 200g)"
        />

        <div className="flex flex-col gap-4">
          <MealCard
            mealType="BREAKFAST"
            title="Breakfast"
            targetCalories={600}
            loggedCalories={getMealCalories('BREAKFAST')}
            items={meals['BREAKFAST'] || []}
            onAddFood={() => handleOpenFoodLogger('BREAKFAST')}
            onRemoveItem={(id) => handleRemoveFoodEntry('BREAKFAST', id)}
          />

          <MealCard
            mealType="LUNCH"
            title="Lunch"
            targetCalories={750}
            loggedCalories={getMealCalories('LUNCH')}
            items={meals['LUNCH'] || []}
            onAddFood={() => handleOpenFoodLogger('LUNCH')}
            onRemoveItem={(id) => handleRemoveFoodEntry('LUNCH', id)}
          />

          <MealCard
            mealType="DINNER"
            title="Dinner"
            targetCalories={750}
            loggedCalories={getMealCalories('DINNER')}
            items={meals['DINNER'] || []}
            onAddFood={() => handleOpenFoodLogger('DINNER')}
            onRemoveItem={(id) => handleRemoveFoodEntry('DINNER', id)}
          />

          <MealCard
            mealType="SNACKS"
            title="Snacks & Post-Workout"
            targetCalories={300}
            loggedCalories={getMealCalories('SNACKS')}
            items={meals['SNACKS'] || []}
            onAddFood={() => handleOpenFoodLogger('SNACKS')}
            onRemoveItem={(id) => handleRemoveFoodEntry('SNACKS', id)}
          />
        </div>
      </div>

      {/* Food Weight Input Modal */}
      <FoodWeightInput
        isOpen={isFoodInputOpen}
        mealType={activeMealType}
        availableFoods={availableFoods}
        onAddFood={handleAddFoodEntry}
        onClose={() => setIsFoodInputOpen(false)}
      />

      {/* 7-Day Maintenance Calorie & AI Diet Planner Modal */}
      <MaintenancePlannerModal
        isOpen={isPlannerOpen}
        currentMaintenanceEstimated={strategy.maintenanceCaloriesEstimated}
        daysAnalyzed={strategy.daysAnalyzed}
        confidence={strategy.confidence}
        initialGoalMode={strategy.goalMode}
        initialOffset={strategy.calorieOffset}
        onApplyPlan={handleApplyDietPlan}
        onClose={() => setIsPlannerOpen(false)}
      />
    </PageContainer>
  );
}
