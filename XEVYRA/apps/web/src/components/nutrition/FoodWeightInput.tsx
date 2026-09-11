'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';

export interface PredefinedFood {
  id: string;
  name: string;
  category: string;
  baseCaloriesPer100g: number;
  baseProteinPer100g: number;
  baseCarbsPer100g: number;
  baseFatPer100g: number;
  standardUnit: string;
  defaultServingSize: number;
}

export interface FoodWeightInputProps {
  isOpen: boolean;
  mealType: string;
  availableFoods: PredefinedFood[];
  onAddFood: (entry: {
    foodId: string;
    foodName: string;
    quantity: number;
    unit: string;
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  }) => void;
  onClose: () => void;
}

export const FoodWeightInput: React.FC<FoodWeightInputProps> = ({
  isOpen,
  mealType,
  availableFoods,
  onAddFood,
  onClose,
}) => {
  const [selectedFoodId, setSelectedFoodId] = useState<string>(
    availableFoods[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(200);
  const [unit, setUnit] = useState<string>('g');
  const [customName, setCustomName] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentFood = availableFoods.find((f) => f.id === selectedFoodId) || availableFoods[0];

  // Derive preview macros from scale factor
  const factor = unit === 'kg' ? (quantity * 1000) / 100 : quantity / 100;
  const previewCalories = currentFood ? Math.round(currentFood.baseCaloriesPer100g * factor) : 0;
  const previewProtein = currentFood ? Math.round(currentFood.baseProteinPer100g * factor * 10) / 10 : 0;
  const previewCarbs = currentFood ? Math.round(currentFood.baseCarbsPer100g * factor * 10) / 10 : 0;
  const previewFat = currentFood ? Math.round(currentFood.baseFatPer100g * factor * 10) / 10 : 0;

  const handleSave = () => {
    if (quantity <= 0) return;

    onAddFood({
      foodId: isCustom ? `custom_${Date.now()}` : (currentFood?.id || 'food_01'),
      foodName: isCustom ? (customName || 'Custom Food') : (currentFood?.name || 'Logged Item'),
      quantity,
      unit,
      calories: previewCalories,
      proteinGrams: previewProtein,
      carbsGrams: previewCarbs,
      fatGrams: previewFat,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background-deep/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="w-full sm:max-w-md bg-surface-elevated border border-border-light rounded-t-xl sm:rounded-lg p-5 sm:p-6 shadow-cardElevated flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div>
            <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest block">
              LOG TO {mealType}
            </span>
            <h3 className="text-base font-bold text-text-primary uppercase tracking-wide font-display">
              Weight-Based Food Entry
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary"
            aria-label="Close food input"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick Food Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Select Food
          </label>
          <select
            value={selectedFoodId}
            onChange={(e) => setSelectedFoodId(e.target.value)}
            className="w-full bg-surface-muted text-text-primary text-sm rounded-md border border-border-subtle p-2.5 outline-none focus:border-primary cursor-pointer"
          >
            {availableFoods.map((food) => (
              <option key={food.id} value={food.id} className="bg-surface-elevated">
                {food.name} ({food.category})
              </option>
            ))}
          </select>
        </div>

        {/* Weight & Unit Input */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input
              label="Intake Weight / Amount"
              type="number"
              inputMode="decimal"
              value={quantity || ''}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              placeholder="200"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
              Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-surface-muted text-text-primary text-sm rounded-md border border-border-subtle p-2.5 outline-none focus:border-primary cursor-pointer"
            >
              <option value="g">Grams (g)</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="oz">Ounces (oz)</option>
              <option value="ml">Milliliters (ml)</option>
              <option value="scoop">Scoop</option>
            </select>
          </div>
        </div>

        {/* Live Macro Snapshot Preview */}
        <div className="p-3 rounded-md bg-surface border border-border-subtle flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-tertiary uppercase">Calculated Nutrition</span>
            <span className="text-sm font-black text-primary font-display">{previewCalories} KCAL</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-1.5 rounded bg-macro-protein/10 border border-macro-protein/20">
              <span className="text-[10px] font-bold text-macro-protein uppercase block">PROTEIN</span>
              <span className="font-extrabold text-text-primary">{previewProtein}g</span>
            </div>
            <div className="p-1.5 rounded bg-macro-carbs/10 border border-macro-carbs/20">
              <span className="text-[10px] font-bold text-macro-carbs uppercase block">CARBS</span>
              <span className="font-extrabold text-text-primary">{previewCarbs}g</span>
            </div>
            <div className="p-1.5 rounded bg-macro-fat/10 border border-macro-fat/20">
              <span className="text-[10px] font-bold text-macro-fat uppercase block">FAT</span>
              <span className="font-extrabold text-text-primary">{previewFat}g</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Log {quantity} {unit}
          </Button>
        </div>
      </div>
    </div>
  );
};
