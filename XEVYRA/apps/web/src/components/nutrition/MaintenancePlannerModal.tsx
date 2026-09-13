'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs } from '../ui/Tabs';

export interface MaintenancePlannerModalProps {
  isOpen: boolean;
  currentMaintenanceEstimated: number;
  daysAnalyzed: number;
  confidence: 'INSUFFICIENT' | 'PRELIMINARY' | 'INITIAL' | 'MORE_RELIABLE' | 'STRONGER_TREND';
  initialGoalMode?: 'DEFICIT' | 'MAINTENANCE' | 'SURPLUS';
  initialOffset?: number;
  initialCuisine?: 'AMERICAN' | 'NORTH_INDIAN' | 'SOUTH_INDIAN' | 'MEDITERRANEAN' | 'ASIAN';
  onApplyPlan: (plan: {
    goalMode: 'DEFICIT' | 'MAINTENANCE' | 'SURPLUS';
    cuisineType: 'AMERICAN' | 'NORTH_INDIAN' | 'SOUTH_INDIAN' | 'MEDITERRANEAN' | 'ASIAN';
    calorieOffset: number;
    targetCalories: number;
    macroSplit: { proteinGrams: number; carbsGrams: number; fatGrams: number };
  }) => void;
  onClose: () => void;
}

export type CuisineOption = 'AMERICAN' | 'NORTH_INDIAN' | 'SOUTH_INDIAN' | 'MEDITERRANEAN' | 'ASIAN';

interface CuisineMealData {
  title: string;
  calories: number;
  description: string;
  protein: number;
  carbs: number;
  fat: number;
}

const cuisineDietDatabase: Record<CuisineOption, { name: string; icon: string; tag: string; meals: CuisineMealData[] }> = {
  AMERICAN: {
    name: 'American / Western',
    icon: '🇺🇸',
    tag: 'High-Protein Classic',
    meals: [
      {
        title: 'Meal 1: Scrambled Eggs & Oats',
        calories: 520,
        description: '4 Whole Eggs scrambled in 5g butter, 80g Rolled Oats with 150ml almond milk & 50g fresh blueberries.',
        protein: 38,
        carbs: 54,
        fat: 16,
      },
      {
        title: 'Meal 2: Chicken, Jasmine Rice & Greens',
        calories: 640,
        description: '200g Grilled Chicken Breast, 200g Cooked Jasmine Rice, 120g Steamed Broccoli & 10g Extra Virgin Olive Oil.',
        protein: 66,
        carbs: 58,
        fat: 14,
      },
      {
        title: 'Meal 3: Whey & Energy Snack',
        calories: 340,
        description: '1 Scoop Whey Protein Isolate (30g), 1 Large Banana, 20g Raw Almonds.',
        protein: 30,
        carbs: 36,
        fat: 8,
      },
      {
        title: 'Meal 4: Lean Beef / Salmon & Sweet Potato',
        calories: 500,
        description: '200g Lean Ground Beef (93/7) or Grilled Salmon, 200g Roasted Sweet Potato, Mixed Green Salad with Balsamic.',
        protein: 46,
        carbs: 44,
        fat: 12,
      },
    ],
  },
  NORTH_INDIAN: {
    name: 'North Indian / Desi',
    icon: '🇮🇳',
    tag: 'Roti, Paneer & Tandoori',
    meals: [
      {
        title: 'Meal 1: Paneer Stuffed Phulka & Dahi / Egg Bhurji',
        calories: 510,
        description: '3 Whole Wheat Rotis with 100g Grated Low-Fat Paneer stuffing (or 4 Egg Bhurji with 2 Phulkas) + 150g Low-Fat Curd & Mint Chutney.',
        protein: 34,
        carbs: 52,
        fat: 15,
      },
      {
        title: 'Meal 2: Chicken Tikka / Soya Curry & Jeera Rice',
        calories: 660,
        description: '200g Chicken Tikka Gravy / Chicken Breast Curry (or 180g Low-Fat Paneer & Soya Chunks), 180g Jeera Basmati Rice, 1 Bowl Yellow Dal Tadka & Cucumber Salad.',
        protein: 62,
        carbs: 65,
        fat: 15,
      },
      {
        title: 'Meal 3: Roasted Chana / Sprout Chaat & Whey',
        calories: 320,
        description: '1 Scoop Whey Isolate + 50g Roasted Bengal Gram (Chana) or Sprouted Moong Chaat with lemon & onion.',
        protein: 34,
        carbs: 28,
        fat: 6,
      },
      {
        title: 'Meal 4: Tandoori Chicken / Soya Bhurji & Multigrain Roti',
        calories: 510,
        description: '180g Tandoori Chicken Breast / Grilled Fish (or Soya Bhurji), 2 Multigrain Phulkas, 1 Bowl Palak Dal & Mixed Salad.',
        protein: 48,
        carbs: 45,
        fat: 12,
      },
    ],
  },
  SOUTH_INDIAN: {
    name: 'South Indian Fitness',
    icon: '🌴',
    tag: 'Idli, Ragi & Pepper Chicken',
    meals: [
      {
        title: 'Meal 1: Steamed Idlis with Boiled Eggs & Sambar',
        calories: 490,
        description: '3 Soft Steamed Idlis + 3 Boiled Eggs (2 whole, 1 white) or 2 High-Protein Ragi Dosas with Drumstick Sambar & Chana Dal Chutney.',
        protein: 32,
        carbs: 58,
        fat: 12,
      },
      {
        title: 'Meal 2: South Indian Pepper Chicken & Matta Rice',
        calories: 670,
        description: '200g Pepper Chicken Gravy / Fish Curry (or 150g High-Protein Soya Sundal), 200g Cooked Ponni/Matta Rice, 1 Bowl Tomato Rasam & Cabbage Poriyal.',
        protein: 62,
        carbs: 68,
        fat: 14,
      },
      {
        title: 'Meal 3: Chana Sundal & Protein Fuel',
        calories: 310,
        description: '100g Boiled Chickpea Sundal tempered with curry leaves & mustard seeds + 1 Scoop Whey Isolate shaken in water.',
        protein: 32,
        carbs: 30,
        fat: 5,
      },
      {
        title: 'Meal 4: Ragi Mudde / Dosa & Egg Roast / Fish',
        calories: 530,
        description: '150g Ragi Mudde (Finger Millet Ball) or 2 Millet Dosas + 180g South Indian Egg Roast / Grilled Seer Fish + 150g Low-Fat Curd/Buttermilk.',
        protein: 50,
        carbs: 46,
        fat: 13,
      },
    ],
  },
  MEDITERRANEAN: {
    name: 'Mediterranean Athletic',
    icon: '🥑',
    tag: 'Greek Yogurt, Quinoa & Salmon',
    meals: [
      {
        title: 'Meal 1: Greek Yogurt Power Bowl',
        calories: 480,
        description: '200g Authentic Greek Yogurt (0% fat) topped with 20g Walnuts, 15g Raw Honey, 80g Blueberries + 2 Hard Boiled Eggs.',
        protein: 36,
        carbs: 42,
        fat: 16,
      },
      {
        title: 'Meal 2: Grilled Salmon & Quinoa Salad',
        calories: 650,
        description: '200g Grilled Atlantic Salmon, 180g Cooked Quinoa with diced cucumbers, cherry tomatoes, 30g Feta Cheese & 10g Extra Virgin Olive Oil.',
        protein: 58,
        carbs: 48,
        fat: 20,
      },
      {
        title: 'Meal 3: Whey & Almond Apple Crunch',
        calories: 330,
        description: '1 Scoop Whey Isolate + 1 Crisp Apple sliced with 20g Natural Almond Butter.',
        protein: 28,
        carbs: 32,
        fat: 10,
      },
      {
        title: 'Meal 4: Herb Chicken & Mediterranean Veggies',
        calories: 540,
        description: '200g Rosemary & Herb Grilled Chicken Breast, 150g Whole Wheat Couscous, Roasted Zucchini, Bell Peppers & Eggplant.',
        protein: 52,
        carbs: 45,
        fat: 12,
      },
    ],
  },
  ASIAN: {
    name: 'Asian / East Asian',
    icon: '🥢',
    tag: 'Teriyaki, Tofu & Jasmine',
    meals: [
      {
        title: 'Meal 1: Japanese Tamagoyaki & Jasmine Rice',
        calories: 480,
        description: '3-Egg Tamagoyaki (Rolled Omelette), 150g Warm Jasmine Rice, Miso Soup with 80g Diced Silken Tofu & Spring Onions.',
        protein: 28,
        carbs: 52,
        fat: 14,
      },
      {
        title: 'Meal 2: Teriyaki Chicken Breast & Edamame',
        calories: 640,
        description: '200g Teriyaki Glazed Chicken Breast (low sugar), 200g Jasmine Rice, 100g Steamed Edamame & Garlic Sauteed Bok Choy.',
        protein: 64,
        carbs: 62,
        fat: 12,
      },
      {
        title: 'Meal 3: Edamame Pods & Protein Shake',
        calories: 270,
        description: '100g Salted Steamed Edamame Pods + 1 Scoop Whey Protein Isolate.',
        protein: 34,
        carbs: 16,
        fat: 6,
      },
      {
        title: 'Meal 4: Beef / Tofu Soba Noodle Stir-Fry',
        calories: 560,
        description: '200g Lean Flank Steak (or Firm Tofu), 150g Soba (Buckwheat) Noodles, Shiitake Mushrooms, Snap Peas with Low-Sodium Soy Sauce.',
        protein: 48,
        carbs: 52,
        fat: 14,
      },
    ],
  },
};

export const MaintenancePlannerModal: React.FC<MaintenancePlannerModalProps> = ({
  isOpen,
  currentMaintenanceEstimated = 2500,
  daysAnalyzed = 7,
  confidence = 'INITIAL',
  initialGoalMode = 'DEFICIT',
  initialOffset = -500,
  initialCuisine = 'AMERICAN',
  onApplyPlan,
  onClose,
}) => {
  const [goalMode, setGoalMode] = useState<'DEFICIT' | 'MAINTENANCE' | 'SURPLUS'>(initialGoalMode);
  const [selectedOffset, setSelectedOffset] = useState<number>(initialOffset);
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineOption>(initialCuisine);
  const [activeTab, setActiveTab] = useState<string>('STRATEGY'); // STRATEGY | AI_DIET_CHART

  if (!isOpen) return null;

  // Presets based on selected mode
  const offsetPresets = {
    DEFICIT: [-200, -300, -500, -750],
    MAINTENANCE: [0],
    SURPLUS: [200, 300, 500, 750],
  }[goalMode];

  const calculatedTargetCalories = currentMaintenanceEstimated + selectedOffset;

  // Derived athletic macro split (35% protein, 40% carbs, 25% fat)
  const proteinGrams = Math.round((calculatedTargetCalories * 0.35) / 4);
  const carbsGrams = Math.round((calculatedTargetCalories * 0.40) / 4);
  const fatGrams = Math.round((calculatedTargetCalories * 0.25) / 9);

  const handleModeChange = (mode: 'DEFICIT' | 'MAINTENANCE' | 'SURPLUS') => {
    setGoalMode(mode);
    if (mode === 'DEFICIT') setSelectedOffset(-500);
    else if (mode === 'MAINTENANCE') setSelectedOffset(0);
    else setSelectedOffset(300);
  };

  const handleConfirm = () => {
    onApplyPlan({
      goalMode,
      cuisineType: selectedCuisine,
      calorieOffset: selectedOffset,
      targetCalories: calculatedTargetCalories,
      macroSplit: { proteinGrams, carbsGrams, fatGrams },
    });
    onClose();
  };

  const currentCuisineData = cuisineDietDatabase[selectedCuisine];

  // Scale meals proportionally to the target calories vs baseline ~2000 kcal
  const scalingFactor = calculatedTargetCalories / 2000;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background-deep/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="w-full sm:max-w-xl bg-surface-elevated border border-border-light rounded-t-xl sm:rounded-lg max-h-[90vh] flex flex-col shadow-cardElevated overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest">
                7-DAY CALORIE & DIET INTELLIGENCE
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-text-primary uppercase tracking-wide font-display mt-0.5">
              Maintenance & AI Diet Planner
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary p-1"
            aria-label="Close planner"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-border-subtle">
          <Tabs
            tabs={[
              { id: 'STRATEGY', label: '1. Strategy & Target' },
              { id: 'AI_DIET_CHART', label: '2. Cuisine & AI Diet Chart' },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            size="sm"
            fullWidth
          />
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {activeTab === 'STRATEGY' ? (
            <>
              {/* 7-Day Analysis Card */}
              <div className="p-4 rounded-md bg-surface border border-border-subtle flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-secondary uppercase">
                    7-Day Caloric Baseline
                  </span>
                  <Badge variant="primary" size="sm">
                    {daysAnalyzed} DAYS ANALYZED
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-text-primary font-display">
                    {currentMaintenanceEstimated} kcal
                  </span>
                  <span className="text-xs text-text-tertiary font-semibold">
                    Calculated Maintenance (TDEE)
                  </span>
                </div>
                <p className="text-[11px] text-text-tertiary leading-relaxed">
                  Based on your logged meals and weigh-in stability over the last 7 days. Confidence tier: <strong>{confidence}</strong>.
                </p>
              </div>

              {/* Goal Mode Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Select Caloric Strategy
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleModeChange('DEFICIT')}
                    className={`p-3 rounded-md border text-center transition-all ${
                      goalMode === 'DEFICIT'
                        ? 'bg-feedback-warning/15 border-feedback-warning text-feedback-warning font-bold'
                        : 'bg-surface border-border-subtle text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span className="text-xs font-bold uppercase block">Fat Loss</span>
                    <span className="text-[10px] text-text-tertiary">Deficit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('MAINTENANCE')}
                    className={`p-3 rounded-md border text-center transition-all ${
                      goalMode === 'MAINTENANCE'
                        ? 'bg-primary/15 border-primary text-primary font-bold'
                        : 'bg-surface border-border-subtle text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span className="text-xs font-bold uppercase block">Recomp</span>
                    <span className="text-[10px] text-text-tertiary">Maintain</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('SURPLUS')}
                    className={`p-3 rounded-md border text-center transition-all ${
                      goalMode === 'SURPLUS'
                        ? 'bg-brand-emerald/15 border-brand-emerald text-brand-emerald font-bold'
                        : 'bg-surface border-border-subtle text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span className="text-xs font-bold uppercase block">Lean Bulk</span>
                    <span className="text-[10px] text-text-tertiary">Surplus</span>
                  </button>
                </div>
              </div>

              {/* Calorie Offset Presets */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Calorie Adjustment Offset
                </label>
                <div className="flex gap-2">
                  {offsetPresets.map((offset) => (
                    <button
                      key={offset}
                      type="button"
                      onClick={() => setSelectedOffset(offset)}
                      className={`flex-1 py-2 px-3 rounded-sm border text-xs font-bold transition-all ${
                        selectedOffset === offset
                          ? 'bg-primary text-background-deep border-primary'
                          : 'bg-surface text-text-secondary border-border-subtle hover:text-text-primary'
                      }`}
                    >
                      {offset > 0 ? `+${offset}` : offset} kcal
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Preview Breakdown */}
              <div className="p-4 rounded-md bg-surface-elevated border border-primary/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-secondary uppercase">
                    New Daily Target
                  </span>
                  <span className="text-xl font-black text-primary font-display">
                    {calculatedTargetCalories} KCAL
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-macro-protein/10 border border-macro-protein/20">
                    <span className="text-[10px] font-bold text-macro-protein uppercase block">PROTEIN</span>
                    <span className="font-extrabold text-text-primary">{proteinGrams}g</span>
                  </div>
                  <div className="p-2 rounded bg-macro-carbs/10 border border-macro-carbs/20">
                    <span className="text-[10px] font-bold text-macro-carbs uppercase block">CARBS</span>
                    <span className="font-extrabold text-text-primary">{carbsGrams}g</span>
                  </div>
                  <div className="p-2 rounded bg-macro-fat/10 border border-macro-fat/20">
                    <span className="text-[10px] font-bold text-macro-fat uppercase block">FAT</span>
                    <span className="font-extrabold text-text-primary">{fatGrams}g</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Cuisine Selection & Dynamic AI Diet Chart Preview */
            <div className="flex flex-col gap-4">
              {/* Cuisine Selector Bar */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Select Cuisine Blueprint
                  </label>
                  <span className="text-[11px] font-semibold text-primary">
                    {currentCuisineData.tag}
                  </span>
                </div>

                {/* Horizontal scrollable or wrapped cuisine buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(cuisineDietDatabase) as CuisineOption[]).map((cuisineKey) => {
                    const c = cuisineDietDatabase[cuisineKey];
                    const isSelected = selectedCuisine === cuisineKey;

                    return (
                      <button
                        key={cuisineKey}
                        type="button"
                        onClick={() => setSelectedCuisine(cuisineKey)}
                        className={`p-2.5 rounded-md border flex items-center gap-2 text-left transition-all ${
                          isSelected
                            ? 'bg-primary/15 border-primary text-text-primary shadow-glow-primary/20'
                            : 'bg-surface border-border-subtle text-text-secondary hover:border-primary/40 hover:text-text-primary'
                        }`}
                      >
                        <span className="text-lg">{c.icon}</span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold truncate leading-tight">
                            {c.name}
                          </span>
                          <span className="text-[10px] text-text-tertiary truncate">
                            {c.tag}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Calories and Cuisine Summary Banner */}
              <div className="p-3 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-primary uppercase block">
                    {currentCuisineData.icon} {currentCuisineData.name} Plan
                  </span>
                  <span className="text-[11px] text-text-secondary">
                    Calibrated for {calculatedTargetCalories} kcal / day ({goalMode})
                  </span>
                </div>
                <Badge variant="primary" size="sm">
                  4 MEALS
                </Badge>
              </div>

              {/* Dynamic Cuisine Meal Cards */}
              <div className="flex flex-col gap-2.5">
                {currentCuisineData.meals.map((meal, index) => {
                  const scaledCal = Math.round(meal.calories * scalingFactor);
                  const scaledP = Math.round(meal.protein * scalingFactor);
                  const scaledC = Math.round(meal.carbs * scalingFactor);
                  const scaledF = Math.round(meal.fat * scalingFactor);

                  return (
                    <div
                      key={index}
                      className="p-3.5 rounded-md bg-surface border border-border-subtle hover:border-primary/30 transition-all flex flex-col gap-1.5"
                    >
                      <div className="flex justify-between items-center text-xs font-bold text-text-primary uppercase">
                        <span className="flex items-center gap-1.5">
                          <span className="text-primary font-black">#{index + 1}</span>
                          <span>{meal.title}</span>
                        </span>
                        <span className="text-primary font-extrabold">{scaledCal} kcal</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {meal.description}
                      </p>
                      <div className="flex items-center gap-3 pt-1 border-t border-border-subtle/50 text-[10px] font-bold">
                        <span className="text-macro-protein">PROTEIN: {scaledP}g</span>
                        <span className="text-macro-carbs">CARBS: {scaledC}g</span>
                        <span className="text-macro-fat">FAT: {scaledF}g</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-border-subtle flex items-center justify-end gap-3 bg-surface">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleConfirm}>
            Apply {calculatedTargetCalories} kcal ({cuisineDietDatabase[selectedCuisine].name})
          </Button>
        </div>
      </div>
    </div>
  );
};

