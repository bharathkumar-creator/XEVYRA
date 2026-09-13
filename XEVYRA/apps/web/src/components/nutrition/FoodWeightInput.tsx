'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Tabs } from '../ui/Tabs';
import { AnimatedCheckbox } from '../ui/AnimatedCheckbox';

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
  isCustom?: boolean;
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
  onSaveCustomFood?: (newFood: PredefinedFood) => void;
  onClose: () => void;
}

export const FoodWeightInput: React.FC<FoodWeightInputProps> = ({
  isOpen,
  mealType,
  availableFoods,
  onAddFood,
  onSaveCustomFood,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<string>('DATABASE'); // DATABASE | CUSTOM
  const [selectedFoodId, setSelectedFoodId] = useState<string>(
    availableFoods[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Intake weight parameters
  const [quantity, setQuantity] = useState<number>(200);
  const [unit, setUnit] = useState<string>('g');

  // Custom food fields
  const [customName, setCustomName] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('Homemade / Custom');
  const [customBaseCalories, setCustomBaseCalories] = useState<number | ''>('');
  const [customBaseProtein, setCustomBaseProtein] = useState<number | ''>('');
  const [customBaseCarbs, setCustomBaseCarbs] = useState<number | ''>('');
  const [customBaseFat, setCustomBaseFat] = useState<number | ''>('');
  const [saveToDatabase, setSaveToDatabase] = useState<boolean>(true);

  if (!isOpen) return null;

  // Filtered available foods
  const filteredFoods = availableFoods.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'ALL' || f.category.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const currentFood = availableFoods.find((f) => f.id === selectedFoodId) || filteredFoods[0] || availableFoods[0];

  // Derive preview macros based on active tab
  const factor = unit === 'kg' ? (quantity * 1000) / 100 : quantity / 100;

  let previewCalories = 0;
  let previewProtein = 0;
  let previewCarbs = 0;
  let previewFat = 0;

  if (activeTab === 'DATABASE') {
    if (currentFood) {
      previewCalories = Math.round(currentFood.baseCaloriesPer100g * factor);
      previewProtein = Math.round(currentFood.baseProteinPer100g * factor * 10) / 10;
      previewCarbs = Math.round(currentFood.baseCarbsPer100g * factor * 10) / 10;
      previewFat = Math.round(currentFood.baseFatPer100g * factor * 10) / 10;
    }
  } else {
    const baseCal = typeof customBaseCalories === 'number' ? customBaseCalories : 0;
    const baseP = typeof customBaseProtein === 'number' ? customBaseProtein : 0;
    const baseC = typeof customBaseCarbs === 'number' ? customBaseCarbs : 0;
    const baseF = typeof customBaseFat === 'number' ? customBaseFat : 0;

    previewCalories = Math.round(baseCal * factor);
    previewProtein = Math.round(baseP * factor * 10) / 10;
    previewCarbs = Math.round(baseC * factor * 10) / 10;
    previewFat = Math.round(baseF * factor * 10) / 10;
  }

  const handleSave = () => {
    if (quantity <= 0) return;

    if (activeTab === 'DATABASE') {
      if (!currentFood) return;
      onAddFood({
        foodId: currentFood.id,
        foodName: currentFood.name,
        quantity,
        unit,
        calories: previewCalories,
        proteinGrams: previewProtein,
        carbsGrams: previewCarbs,
        fatGrams: previewFat,
      });
    } else {
      if (!customName.trim()) return;

      const newCustomFoodId = `custom_${Date.now()}`;
      const newCustomFood: PredefinedFood = {
        id: newCustomFoodId,
        name: customName.trim(),
        category: customCategory,
        baseCaloriesPer100g: typeof customBaseCalories === 'number' ? customBaseCalories : 0,
        baseProteinPer100g: typeof customBaseProtein === 'number' ? customBaseProtein : 0,
        baseCarbsPer100g: typeof customBaseCarbs === 'number' ? customBaseCarbs : 0,
        baseFatPer100g: typeof customBaseFat === 'number' ? customBaseFat : 0,
        standardUnit: 'g',
        defaultServingSize: quantity,
        isCustom: true,
      };

      if (saveToDatabase && onSaveCustomFood) {
        onSaveCustomFood(newCustomFood);
      }

      onAddFood({
        foodId: newCustomFoodId,
        foodName: newCustomFood.name,
        quantity,
        unit,
        calories: previewCalories,
        proteinGrams: previewProtein,
        carbsGrams: previewCarbs,
        fatGrams: previewFat,
      });
    }

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background-deep/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="w-full sm:max-w-lg bg-surface-elevated border border-border-light rounded-t-xl sm:rounded-lg shadow-cardElevated flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle p-4 sm:p-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest block">
                LOGGING TO {mealType}
              </span>
            </div>
            <h3 className="text-base font-bold text-text-primary uppercase tracking-wide font-display mt-0.5">
              Precision Food Intake
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary p-1"
            aria-label="Close food input"
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
              { id: 'DATABASE', label: '1. Select From Library' },
              { id: 'CUSTOM', label: '2. + Add Custom Food' },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            size="sm"
            fullWidth
          />
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {activeTab === 'DATABASE' ? (
            <>
              {/* Search & Category Filter */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-8">
                  <Input
                    placeholder="Search food or cuisine (e.g. Idli, Chicken, Paneer)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-4">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full h-[42px] bg-surface-muted text-text-primary text-xs rounded-md border border-border-subtle px-2.5 outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="ALL">All Cuisines</option>
                    <option value="South Indian">South Indian</option>
                    <option value="North Indian">North Indian</option>
                    <option value="Western">American/Western</option>
                    <option value="Mediterranean">Mediterranean</option>
                    <option value="Asian">Asian</option>
                    <option value="Custom">My Custom Foods</option>
                  </select>
                </div>
              </div>

              {/* Food Selector Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Select Item ({filteredFoods.length} items found)
                </label>
                <select
                  value={selectedFoodId}
                  onChange={(e) => setSelectedFoodId(e.target.value)}
                  className="w-full bg-surface-muted text-text-primary text-sm rounded-md border border-border-subtle p-2.5 outline-none focus:border-primary cursor-pointer"
                >
                  {filteredFoods.map((food) => (
                    <option key={food.id} value={food.id} className="bg-surface-elevated">
                      {food.name} — {food.category} ({food.baseCaloriesPer100g} kcal/100g)
                    </option>
                  ))}
                </select>
              </div>

              {/* Base nutrient label badge */}
              {currentFood && (
                <div className="flex items-center justify-between p-2.5 rounded-md bg-surface border border-border-subtle text-[11px] text-text-secondary">
                  <span>Standard 100g Baseline:</span>
                  <div className="flex items-center gap-2 font-bold">
                    <span className="text-primary">{currentFood.baseCaloriesPer100g} kcal</span>
                    <span className="text-macro-protein">P: {currentFood.baseProteinPer100g}g</span>
                    <span className="text-macro-carbs">C: {currentFood.baseCarbsPer100g}g</span>
                    <span className="text-macro-fat">F: {currentFood.baseFatPer100g}g</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Custom Food Creation Form */
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-md bg-primary/10 border border-primary/20 text-xs text-text-secondary">
                <strong className="text-primary block mb-0.5">Create Individual Food Item:</strong>
                Enter nutrient details per <strong>100g</strong> basis (or 1 serving). It will be scaled automatically according to your portion weight.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Food Item Name *"
                  placeholder="e.g. Mom's Chicken Biryani, Sambar Dosa"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Cuisine / Category
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-surface-muted text-text-primary text-sm rounded-md border border-border-subtle p-2.5 outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="South Indian (Custom)">South Indian</option>
                    <option value="North Indian (Custom)">North Indian</option>
                    <option value="American / Western (Custom)">American / Western</option>
                    <option value="Mediterranean (Custom)">Mediterranean</option>
                    <option value="Asian (Custom)">Asian</option>
                    <option value="Homemade / Custom">Homemade / Custom</option>
                    <option value="Proteins / Supplements">Proteins / Supplements</option>
                  </select>
                </div>
              </div>

              {/* Nutrition per 100g inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Input
                  label="Calories (100g)"
                  type="number"
                  placeholder="165"
                  value={customBaseCalories}
                  onChange={(e) => setCustomBaseCalories(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                />
                <Input
                  label="Protein (g)"
                  type="number"
                  placeholder="31"
                  value={customBaseProtein}
                  onChange={(e) => setCustomBaseProtein(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                />
                <Input
                  label="Carbs (g)"
                  type="number"
                  placeholder="0"
                  value={customBaseCarbs}
                  onChange={(e) => setCustomBaseCarbs(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                />
                <Input
                  label="Fat (g)"
                  type="number"
                  placeholder="3.6"
                  value={customBaseFat}
                  onChange={(e) => setCustomBaseFat(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                />
              </div>

              {/* Save to library checkbox */}
              <div className="pt-1 flex items-center gap-3">
                <AnimatedCheckbox
                  checked={saveToDatabase}
                  onChange={() => setSaveToDatabase((prev) => !prev)}
                  size="sm"
                  ariaLabel="Save custom food to library"
                />
                <label
                  onClick={() => setSaveToDatabase((prev) => !prev)}
                  className="text-xs text-text-secondary cursor-pointer select-none"
                >
                  Save this custom food to my permanent library for future 1-click logging
                </label>
              </div>
            </div>
          )}

          {/* Portion Weight & Unit Input */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border-subtle">
            <div className="col-span-2">
              <Input
                label="Logged Intake Portion"
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
                <option value="serving">Serving</option>
              </select>
            </div>
          </div>

          {/* Live Scaled Macro Snapshot Preview */}
          <div className="p-3.5 rounded-md bg-surface border border-border-subtle flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-tertiary uppercase">
                Calculated Log ({quantity} {unit})
              </span>
              <span className="text-base font-black text-primary font-display">
                {previewCalories} KCAL
              </span>
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
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-border-subtle flex items-center justify-end gap-3 bg-surface">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={activeTab === 'CUSTOM' && !customName.trim()}
          >
            {activeTab === 'CUSTOM' ? `Log Custom "${customName || 'Food'}"` : `Log ${quantity} ${unit}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

