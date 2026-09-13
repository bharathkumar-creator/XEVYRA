'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/navigation/PageContainer';
import { SectionHeader } from '@/components/navigation/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CalorieRing } from '@/components/ui/CalorieRing';
import { MacroSummary } from '@/components/nutrition/MacroSummary';
import { MealCard, MealItemProps } from '@/components/nutrition/MealCard';
import { FoodWeightInput, PredefinedFood } from '@/components/nutrition/FoodWeightInput';
import { MotivationalQuote } from '@/components/ui/MotivationalQuote';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useToast } from '@/components/feedback/Toast';
import { useNutrition } from '@/lib/hooks/useNutrition';

export default function NutritionPage() {
  const { showToast } = useToast();
  const {
    summary,
    isLoading,
    error,
    refetch,
    logFood,
    removeFood,
  } = useNutrition();

  const [isFoodInputOpen, setIsFoodInputOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<string>('BREAKFAST');

  // Predefined default food database with standard 100g basis
  const [availableFoods, setAvailableFoods] = useState<PredefinedFood[]>([
    {
      id: 'food_chicken',
      name: 'Grilled Chicken Breast',
      category: 'Proteins (Western)',
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
      category: 'Carbs (Western/Asian)',
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
      category: 'Proteins (Universal)',
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
      category: 'Carbs (Universal)',
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
      category: 'Proteins (Western)',
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
      category: 'Proteins (Supplements)',
      baseCaloriesPer100g: 370,
      baseProteinPer100g: 82,
      baseCarbsPer100g: 3,
      baseFatPer100g: 1.5,
      standardUnit: 'g',
      defaultServingSize: 30,
    },
    {
      id: 'food_paneer_lowfat',
      name: 'Low-Fat Paneer / Cottage Cheese',
      category: 'Proteins (North Indian)',
      baseCaloriesPer100g: 170,
      baseProteinPer100g: 25,
      baseCarbsPer100g: 4.5,
      baseFatPer100g: 6,
      standardUnit: 'g',
      defaultServingSize: 150,
    },
    {
      id: 'food_roti',
      name: 'Whole Wheat Phulka / Roti',
      category: 'Carbs (North Indian)',
      baseCaloriesPer100g: 264,
      baseProteinPer100g: 9,
      baseCarbsPer100g: 54,
      baseFatPer100g: 1.5,
      standardUnit: 'g',
      defaultServingSize: 80,
    },
    {
      id: 'food_idli',
      name: 'Steamed Idli (Rice & Urad Dal)',
      category: 'Carbs (South Indian)',
      baseCaloriesPer100g: 140,
      baseProteinPer100g: 5,
      baseCarbsPer100g: 28,
      baseFatPer100g: 0.4,
      standardUnit: 'g',
      defaultServingSize: 150,
    },
    {
      id: 'food_ragi_dosa',
      name: 'Ragi Dosa / Finger Millet Crepe',
      category: 'Carbs (South Indian)',
      baseCaloriesPer100g: 175,
      baseProteinPer100g: 5.5,
      baseCarbsPer100g: 34,
      baseFatPer100g: 2.5,
      standardUnit: 'g',
      defaultServingSize: 120,
    },
    {
      id: 'food_salmon',
      name: 'Grilled Atlantic Salmon',
      category: 'Proteins (Mediterranean)',
      baseCaloriesPer100g: 208,
      baseProteinPer100g: 20,
      baseCarbsPer100g: 0,
      baseFatPer100g: 13,
      standardUnit: 'g',
      defaultServingSize: 200,
    },
  ]);

  const handleOpenFoodLogger = (mealType: string) => {
    setActiveMealType(mealType);
    setIsFoodInputOpen(true);
  };

  const handleAddFoodEntry = async (entry: {
    foodId: string;
    foodName: string;
    quantity: number;
    unit: string;
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  }) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await logFood({
        foodItemId: entry.foodId,
        mealType: activeMealType as any,
        quantity: entry.quantity,
        unit: (entry.unit === 'g' ? 'G' : entry.unit === 'ml' ? 'ML' : 'SERVING') as any,
        dateString: today,
      });

      showToast({
        type: 'success',
        title: 'Food Logged',
        message: `${entry.foodName} (${entry.quantity}${entry.unit}) added to ${activeMealType}.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Log Error',
        message: err?.message || 'Could not log food item.',
      });
    }
  };

  const handleRemoveFoodEntry = async (mealType: string, entryId: string) => {
    try {
      const date = summary?.dateString || new Date().toISOString().split('T')[0];
      await removeFood(date, entryId);
      showToast({
        type: 'info',
        title: 'Item Removed',
        message: 'Food entry removed from daily log.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Remove Error',
        message: err?.message || 'Failed to remove entry.',
      });
    }
  };

  if (isLoading) {
    return (
      <PageContainer maxWidth="xl" className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <Skeleton height={200} className="md:col-span-5 rounded-lg" />
          <Skeleton height={200} className="md:col-span-7 rounded-lg" />
        </div>
        <Skeleton height={120} className="rounded-lg" />
        <Skeleton height={120} className="rounded-lg" />
      </PageContainer>
    );
  }

  if (error && !summary) {
    return (
      <PageContainer maxWidth="xl" className="flex flex-col gap-6">
        <ErrorState
          title="Nutrition Data Unavailable"
          message={error}
          onRetry={refetch}
        />
      </PageContainer>
    );
  }

  // Derive meal buckets from backend summary entries
  const entries = summary?.entries || [];
  const target = summary?.target || {
    dailyCalories: 2400,
    proteinGrams: 180,
    carbsGrams: 250,
    fatGrams: 70,
    goalMode: 'DEFICIT' as const,
  };
  const totalConsumed = summary?.totalConsumed || {
    calories: entries.reduce((acc, e) => acc + e.nutritionSnapshot.calories, 0),
    proteinGrams: entries.reduce((acc, e) => acc + e.nutritionSnapshot.proteinGrams, 0),
    carbsGrams: entries.reduce((acc, e) => acc + e.nutritionSnapshot.carbsGrams, 0),
    fatGrams: entries.reduce((acc, e) => acc + e.nutritionSnapshot.fatGrams, 0),
  };

  const getMealItems = (mealType: string): MealItemProps[] => {
    return entries
      .filter((e) => e.mealType === mealType)
      .map((e) => ({
        id: e.id,
        foodName: e.foodName,
        quantity: e.quantity,
        unit: e.unit.toLowerCase(),
        calories: e.nutritionSnapshot.calories,
        proteinGrams: e.nutritionSnapshot.proteinGrams,
        carbsGrams: e.nutritionSnapshot.carbsGrams,
        fatGrams: e.nutritionSnapshot.fatGrams,
      }));
  };

  const breakfastItems = getMealItems('BREAKFAST');
  const lunchItems = getMealItems('LUNCH');
  const dinnerItems = getMealItems('DINNER');
  const snackItems = getMealItems('SNACK');

  return (
    <PageContainer maxWidth="xl" className="flex flex-col gap-6">
      {/* 1. Header & Navigation to Planner & Maintenance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SectionHeader
          title="Daily Fuel & Nutrition"
          subtitle="Precision weight-based macros & immutable daily snapshot logs"
        />

        <div className="flex items-center gap-2">
          <Link href="/nutrition/maintenance">
            <Button variant="secondary" size="sm">
              ⚖️ Maintenance
            </Button>
          </Link>
          <Link href="/nutrition/diet-plan">
            <Button variant="primary" size="sm">
              🤖 AI Diet Blueprint
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Ring & Macros Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <Card variant="default" className="md:col-span-5 flex flex-col items-center justify-center p-6 text-center">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-text-tertiary mb-3">
            ENERGY INTAKE • {target.dailyCalories - totalConsumed.calories >= 0 ? `${target.dailyCalories - totalConsumed.calories} KCAL REMAINING` : `${Math.abs(target.dailyCalories - totalConsumed.calories)} KCAL OVER TARGET`}
          </span>
          <CalorieRing
            consumed={totalConsumed.calories}
            target={target.dailyCalories}
            size={170}
          />
        </Card>

        <div className="md:col-span-7">
          <MacroSummary
            protein={{ consumed: totalConsumed.proteinGrams, target: target.proteinGrams }}
            carbs={{ consumed: totalConsumed.carbsGrams, target: target.carbsGrams }}
            fat={{ consumed: totalConsumed.fatGrams, target: target.fatGrams }}
          />
        </div>
      </div>

      {/* Motivational Fuel Creed */}
      <MotivationalQuote category="nutrition" variant="banner" />

      {/* 3. Meals Breakdown */}
      <div className="flex flex-col gap-4">
        <SectionHeader
          title="Meal Breakdown"
          subtitle="Grams-based tracking (e.g. Chicken 200g, Rice 150g)"
        />

        <div className="flex flex-col gap-4">
          <MealCard
            mealType="BREAKFAST"
            title="Breakfast"
            targetCalories={Math.round(target.dailyCalories * 0.25)}
            loggedCalories={breakfastItems.reduce((acc, item) => acc + item.calories, 0)}
            items={breakfastItems}
            onAddFood={() => handleOpenFoodLogger('BREAKFAST')}
            onRemoveItem={(id) => handleRemoveFoodEntry('BREAKFAST', id)}
          />

          <MealCard
            mealType="LUNCH"
            title="Lunch"
            targetCalories={Math.round(target.dailyCalories * 0.35)}
            loggedCalories={lunchItems.reduce((acc, item) => acc + item.calories, 0)}
            items={lunchItems}
            onAddFood={() => handleOpenFoodLogger('LUNCH')}
            onRemoveItem={(id) => handleRemoveFoodEntry('LUNCH', id)}
          />

          <MealCard
            mealType="DINNER"
            title="Dinner"
            targetCalories={Math.round(target.dailyCalories * 0.30)}
            loggedCalories={dinnerItems.reduce((acc, item) => acc + item.calories, 0)}
            items={dinnerItems}
            onAddFood={() => handleOpenFoodLogger('DINNER')}
            onRemoveItem={(id) => handleRemoveFoodEntry('DINNER', id)}
          />

          <MealCard
            mealType="SNACK"
            title="Snacks & Supplements"
            targetCalories={Math.round(target.dailyCalories * 0.10)}
            loggedCalories={snackItems.reduce((acc, item) => acc + item.calories, 0)}
            items={snackItems}
            onAddFood={() => handleOpenFoodLogger('SNACK')}
            onRemoveItem={(id) => handleRemoveFoodEntry('SNACK', id)}
          />
        </div>
      </div>

      {/* Food Weight Input Modal */}
      <FoodWeightInput
        isOpen={isFoodInputOpen}
        mealType={activeMealType}
        availableFoods={availableFoods}
        onAddFood={handleAddFoodEntry}
        onSaveCustomFood={(food) => setAvailableFoods((prev) => [food, ...prev])}
        onClose={() => setIsFoodInputOpen(false)}
      />
    </PageContainer>
  );
}
