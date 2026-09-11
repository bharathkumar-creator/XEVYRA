import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface MealItemProps {
  id: string;
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface MealCardProps {
  mealType: string;
  title: string;
  targetCalories?: number;
  loggedCalories: number;
  items: MealItemProps[];
  onAddFood: () => void;
  onRemoveItem: (id: string) => void;
  className?: string;
}

export const MealCard: React.FC<MealCardProps> = ({
  mealType,
  title,
  targetCalories,
  loggedCalories,
  items,
  onAddFood,
  onRemoveItem,
  className = '',
}) => {
  return (
    <Card variant="default" padding="none" className={`flex flex-col border-border-subtle ${className}`}>
      {/* Header */}
      <div className="p-4 bg-surface-elevated/70 border-b border-border-subtle flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm sm:text-base font-bold text-text-primary uppercase tracking-wide font-display">
              {title}
            </h4>
            <Badge variant="neutral" size="sm">
              {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
            </Badge>
          </div>
          <span className="text-[11px] text-text-tertiary">
            Logged: <strong className="text-primary font-bold">{Math.round(loggedCalories)} kcal</strong>
            {targetCalories ? ` / ${targetCalories} kcal target` : ''}
          </span>
        </div>

        <Button variant="outline" size="sm" onClick={onAddFood}>
          + Add Food
        </Button>
      </div>

      {/* Food Entries List */}
      <div className="p-3 sm:p-4 flex flex-col gap-2">
        {items.length === 0 ? (
          <div className="py-4 text-center text-xs text-text-tertiary">
            No foods logged for {title} yet
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 px-3 rounded-md bg-surface-elevated/50 border border-border-subtle text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">{item.foodName}</span>
                  <span className="text-[10px] font-black text-primary px-1.5 py-0.2 bg-primary/10 rounded-sm">
                    {item.quantity} {item.unit}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-text-tertiary mt-0.5">
                  <span className="text-text-secondary font-semibold">{Math.round(item.calories)} kcal</span>
                  <span>•</span>
                  <span className="text-macro-protein font-bold">P: {item.proteinGrams}g</span>
                  <span className="text-macro-carbs font-bold">C: {item.carbsGrams}g</span>
                  <span className="text-macro-fat font-bold">F: {item.fatGrams}g</span>
                </div>
              </div>

              <button
                onClick={() => onRemoveItem(item.id)}
                className="text-text-muted hover:text-feedback-danger p-1 transition-colors"
                aria-label={`Remove ${item.foodName}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
