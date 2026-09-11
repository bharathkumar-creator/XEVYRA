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
  onApplyPlan: (plan: {
    goalMode: 'DEFICIT' | 'MAINTENANCE' | 'SURPLUS';
    calorieOffset: number;
    targetCalories: number;
    macroSplit: { proteinGrams: number; carbsGrams: number; fatGrams: number };
  }) => void;
  onClose: () => void;
}

export const MaintenancePlannerModal: React.FC<MaintenancePlannerModalProps> = ({
  isOpen,
  currentMaintenanceEstimated = 2500,
  daysAnalyzed = 7,
  confidence = 'INITIAL',
  initialGoalMode = 'DEFICIT',
  initialOffset = -500,
  onApplyPlan,
  onClose,
}) => {
  const [goalMode, setGoalMode] = useState<'DEFICIT' | 'MAINTENANCE' | 'SURPLUS'>(initialGoalMode);
  const [selectedOffset, setSelectedOffset] = useState<number>(initialOffset);
  const [activeTab, setActiveTab] = useState<string>('STRATEGY'); // STRATEGY | AI_DIET_CHART

  if (!isOpen) return null;

  // Presets based on selected mode
  const offsetPresets = {
    DEFICIT: [-200, -300, -500, -750],
    MAINTENANCE: [0],
    SURPLUS: [200, 300, 500, 750],
  }[goalMode];

  const calculatedTargetCalories = currentMaintenanceEstimated + selectedOffset;

  // Derived athletic macro split (40% protein, 35% carbs, 25% fat for deficit/athletic)
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
      calorieOffset: selectedOffset,
      targetCalories: calculatedTargetCalories,
      macroSplit: { proteinGrams, carbsGrams, fatGrams },
    });
    onClose();
  };

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
            className="text-text-tertiary hover:text-text-primary"
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
              { id: 'AI_DIET_CHART', label: '2. AI Diet Blueprint' },
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
                        ? 'bg-feedback-warning/15 border-feedback-warning text-feedback-warning'
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
                        ? 'bg-primary/15 border-primary text-primary'
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
                        ? 'bg-brand-emerald/15 border-brand-emerald text-brand-emerald'
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
            /* AI Diet Chart Preview */
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-primary uppercase block">AI Diet Chart Blueprint</span>
                  <span className="text-[11px] text-text-secondary">Optimized for {calculatedTargetCalories} kcal / day ({goalMode})</span>
                </div>
                <Badge variant="primary" size="sm">4 MEALS</Badge>
              </div>

              {/* Sample AI Meals */}
              <div className="flex flex-col gap-2.5">
                <div className="p-3 rounded-md bg-surface border border-border-subtle">
                  <div className="flex justify-between items-center text-xs font-bold text-text-primary uppercase mb-1">
                    <span>Meal 1: High-Protein Breakfast</span>
                    <span className="text-primary">520 kcal</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    4 Whole Eggs scrambled, 80g Rolled Oats with 150ml almond milk & 50g blueberries.
                  </p>
                  <span className="text-[10px] text-text-tertiary mt-1 block">P: 38g • C: 54g • F: 16g</span>
                </div>

                <div className="p-3 rounded-md bg-surface border border-border-subtle">
                  <div className="flex justify-between items-center text-xs font-bold text-text-primary uppercase mb-1">
                    <span>Meal 2: Power Lunch</span>
                    <span className="text-primary">640 kcal</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    200g Grilled Chicken Breast, 200g Cooked Jasmine Rice, 100g Steamed Broccoli & 10g Olive Oil.
                  </p>
                  <span className="text-[10px] text-text-tertiary mt-1 block">P: 66g • C: 58g • F: 14g</span>
                </div>

                <div className="p-3 rounded-md bg-surface border border-border-subtle">
                  <div className="flex justify-between items-center text-xs font-bold text-text-primary uppercase mb-1">
                    <span>Meal 3: Pre/Post-Workout Fuel</span>
                    <span className="text-primary">340 kcal</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    1 Scoop Whey Isolate (30g), 1 Large Banana, 20g Almonds.
                  </p>
                  <span className="text-[10px] text-text-tertiary mt-1 block">P: 30g • C: 36g • F: 8g</span>
                </div>

                <div className="p-3 rounded-md bg-surface border border-border-subtle">
                  <div className="flex justify-between items-center text-xs font-bold text-text-primary uppercase mb-1">
                    <span>Meal 4: Lean Recovery Dinner</span>
                    <span className="text-primary">500 kcal</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    200g Lean Ground Beef (93/7) or Salmon, 200g Sweet Potato, Mixed Green Salad.
                  </p>
                  <span className="text-[10px] text-text-tertiary mt-1 block">P: 46g • C: 44g • F: 12g</span>
                </div>
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
            Apply {calculatedTargetCalories} kcal Target
          </Button>
        </div>
      </div>
    </div>
  );
};
