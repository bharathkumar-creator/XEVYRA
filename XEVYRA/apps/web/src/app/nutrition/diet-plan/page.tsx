'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/navigation/PageContainer';
import { SectionHeader } from '@/components/navigation/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useToast } from '@/components/feedback/Toast';
import { useDietPlan } from '@/lib/hooks/useDietPlan';
import { CuisineTypeDto, GoalModeDto } from '@xevyra/contracts';

const cuisineOptions: Array<{ value: CuisineTypeDto; label: string; flag: string; desc: string }> = [
  { value: 'AMERICAN', label: 'American / Western', flag: '🇺🇸', desc: 'Chicken breast, rice, oats, sweet potatoes & lean beef' },
  { value: 'SOUTH_INDIAN', label: 'South Indian Fitness', flag: '🥥', desc: 'Idli, ragi mudde, chicken pepper fry, sambar & sundal' },
  { value: 'NORTH_INDIAN', label: 'North Indian / Desi', flag: '🫓', desc: 'Phulka roti, paneer, yellow dal, soya chunks & roasted chana' },
  { value: 'MEDITERRANEAN', label: 'Mediterranean Athletic', flag: '🫒', desc: 'Grilled salmon, Greek yogurt, quinoa, olive oil & veggies' },
  { value: 'ASIAN', label: 'Asian / East Asian', flag: '🥢', desc: 'Tofu, edamame, jasmine rice, lean poultry & bok choy' },
];

export default function DietPlanPage() {
  const { showToast } = useToast();
  const { dietPlan, isLoading, isGenerating, error, generate } = useDietPlan();

  const [selectedCuisine, setSelectedCuisine] = useState<CuisineTypeDto>('AMERICAN');
  const [selectedGoal, setSelectedGoal] = useState<GoalModeDto>('DEFICIT');
  const [selectedMacroMode, setSelectedMacroMode] = useState<'HIGH_PROTEIN' | 'BALANCED' | 'LOW_CARB' | 'KETO'>('HIGH_PROTEIN');
  const [targetCalories, setTargetCalories] = useState<number>(2200);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState<boolean>(false);
  const [swappingMealTitle, setSwappingMealTitle] = useState<string>('');

  const handleGenerate = async () => {
    try {
      showToast({
        type: 'info',
        title: 'Generating Blueprint',
        message: `Building customized ${selectedCuisine} meal plan...`,
      });

      await generate({
        targetDailyCalories: targetCalories,
        cuisineType: selectedCuisine,
        goalMode: selectedGoal,
        macroSplitPreference: selectedMacroMode,
        mealsPerDay: 4,
        dietaryPreferences: [],
        allergies: [],
      });

      showToast({
        type: 'success',
        title: 'Diet Blueprint Generated! ⚡',
        message: `Structured meal plan prepared for ${targetCalories} kcal.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Generation Failed',
        message: err?.message || 'Could not generate diet plan.',
      });
    }
  };

  const handleOpenSwap = (mealTitle: string) => {
    setSwappingMealTitle(mealTitle);
    setIsSwapModalOpen(true);
  };

  const handleConfirmSwap = () => {
    setIsSwapModalOpen(false);
    showToast({
      type: 'success',
      title: 'Meal Swapped',
      message: `Alternative nutritional option applied to ${swappingMealTitle}.`,
    });
  };

  if (isLoading) {
    return (
      <PageContainer maxWidth="xl" className="flex flex-col gap-6">
        <Skeleton height={40} width="40%" />
        <Skeleton height={180} className="rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton height={200} className="rounded-lg" />
          <Skeleton height={200} className="rounded-lg" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="xl" className="flex flex-col gap-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SectionHeader
          title="AI Nutrition Blueprint"
          subtitle="Intelligent structured meal plan with multi-cuisine macro alignment"
        />
        <Link href="/nutrition">
          <Button variant="secondary" size="sm">
            &larr; Back to Nutrition
          </Button>
        </Link>
      </div>

      {/* 2. Generation / Customization Cockpit Card */}
      <Card variant="elevated" className="p-5 sm:p-6 flex flex-col gap-5 border-border-light">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
          <div>
            <h2 className="text-base font-bold text-text-primary uppercase tracking-wide font-display">
              Diet Plan Generator Parameters
            </h2>
            <p className="text-xs text-text-tertiary">
              Configure targets and regional cuisine preferences for automated generation
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            isLoading={isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating ? 'Building Blueprint...' : 'Generate New Plan ⚡'}
          </Button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Target Calories */}
          <Input
            label="Target Calories (kcal)"
            type="number"
            value={targetCalories}
            onChange={(e) => setTargetCalories(parseInt(e.target.value, 10) || 2000)}
          />

          {/* Goal Mode */}
          <Select
            label="Goal Strategy"
            value={selectedGoal}
            onChange={(e) => setSelectedGoal(e.target.value as GoalModeDto)}
            options={[
              { value: 'DEFICIT', label: 'Fat Loss (Deficit)' },
              { value: 'MAINTENANCE', label: 'Maintenance (Recomp)' },
              { value: 'SURPLUS', label: 'Muscle Gain (Surplus)' },
            ]}
          />

          {/* Cuisine Selection */}
          <Select
            label="Cuisine Preference"
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value as CuisineTypeDto)}
            options={cuisineOptions.map((c) => ({
              value: c.value,
              label: `${c.flag} ${c.label}`,
            }))}
          />

          {/* Macro Mode */}
          <Select
            label="Macronutrient Ratio"
            value={selectedMacroMode}
            onChange={(e) => setSelectedMacroMode(e.target.value as any)}
            options={[
              { value: 'HIGH_PROTEIN', label: 'High Protein (40/40/20)' },
              { value: 'BALANCED', label: 'Balanced Athletic (30/45/25)' },
              { value: 'LOW_CARB', label: 'Low Carbohydrate' },
              { value: 'KETO', label: 'Ketogenic (High Fat)' },
            ]}
          />
        </div>
      </Card>

      {/* 3. Generating Loading Indicator */}
      {isGenerating && (
        <Card variant="default" className="p-8 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <div>
            <h3 className="text-base font-bold text-text-primary uppercase font-display">
              BUILDING YOUR NUTRITION BLUEPRINT
            </h3>
            <p className="text-xs text-text-secondary mt-1 max-w-sm">
              Analyzing target calories • Balancing protein-to-carb ratios • Assembling {selectedCuisine} whole foods
            </p>
          </div>
        </Card>
      )}

      {/* 4. Active Diet Plan Presentation */}
      {!isGenerating && dietPlan ? (
        <div className="flex flex-col gap-5">
          {/* Blueprint Overview Header */}
          <Card variant="default" className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="primary" size="sm">
                  ACTIVE BLUEPRINT
                </Badge>
                <Badge variant="neutral" size="sm">
                  {dietPlan.cuisineType}
                </Badge>
              </div>
              <h2 className="text-xl font-black text-text-primary uppercase font-display">
                {dietPlan.title}
              </h2>
              <span className="text-xs text-text-tertiary">
                Target: {dietPlan.targetDailyCalories} kcal • {dietPlan.goalMode} Strategy
              </span>
            </div>

            {/* Target Macro Breakdown */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <span className="text-[10px] font-bold text-macro-protein uppercase block">Protein</span>
                <span className="text-base font-black text-text-primary font-display">{dietPlan.targetMacros.proteinGrams}g</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-bold text-macro-carbs uppercase block">Carbs</span>
                <span className="text-base font-black text-text-primary font-display">{dietPlan.targetMacros.carbsGrams}g</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-bold text-macro-fat uppercase block">Fat</span>
                <span className="text-base font-black text-text-primary font-display">{dietPlan.targetMacros.fatGrams}g</span>
              </div>
            </div>
          </Card>

          {/* Meals List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dietPlan.meals.map((meal, index) => (
              <Card key={index} variant="default" className="p-5 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      {meal.mealType}
                    </span>
                    <span className="text-xs font-extrabold text-text-primary">
                      {meal.totalNutrients.calories} kcal
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-text-primary font-display mb-3">
                    {meal.title}
                  </h3>

                  {/* Food Items */}
                  <div className="flex flex-col gap-2">
                    {meal.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="p-2.5 rounded-md bg-surface border border-border-subtle flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-text-primary block">{item.name}</span>
                          <span className="text-[11px] text-text-tertiary">
                            {item.portionDescription || `${item.quantity} ${item.unit}`}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-text-primary block">{item.nutrients.calories} kcal</span>
                          <span className="text-[10px] text-text-tertiary">
                            P: {item.nutrients.proteinGrams}g • C: {item.nutrients.carbsGrams}g • F: {item.nutrients.fatGrams}g
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border-subtle flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenSwap(meal.title)}
                  >
                    🔄 Swap Meal
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        !isGenerating && (
          <EmptyState
            title="No Active AI Diet Blueprint"
            description="Select your target calories and regional cuisine above to generate your customized high-protein meal blueprint."
            actionLabel="Generate Blueprint ⚡"
            onAction={handleGenerate}
          />
        )
      )}

      {/* Meal Swap Dialog */}
      {isSwapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-deep/80 backdrop-blur-sm">
          <Card variant="elevated" className="max-w-md w-full p-6 flex flex-col gap-4 border-border-light">
            <h3 className="text-base font-bold text-text-primary uppercase font-display">
              Swap Meal Option: {swappingMealTitle}
            </h3>
            <p className="text-xs text-text-secondary">
              Choose a nutrition-equivalent alternative aligned with your current daily macro targets.
            </p>

            <div className="flex flex-col gap-2.5">
              <div
                onClick={handleConfirmSwap}
                className="p-3 rounded-md bg-surface border border-border-subtle hover:border-primary/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-bold text-text-primary">
                  <span>Grilled Chicken & Quinoa Salad</span>
                  <span className="text-primary">540 kcal</span>
                </div>
                <span className="text-[11px] text-text-tertiary">
                  Protein: 48g • Carbs: 52g • Fat: 12g
                </span>
              </div>

              <div
                onClick={handleConfirmSwap}
                className="p-3 rounded-md bg-surface border border-border-subtle hover:border-primary/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-bold text-text-primary">
                  <span>Low-Fat Paneer & Whole Wheat Roti</span>
                  <span className="text-primary">520 kcal</span>
                </div>
                <span className="text-[11px] text-text-tertiary">
                  Protein: 42g • Carbs: 58g • Fat: 14g
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setIsSwapModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
