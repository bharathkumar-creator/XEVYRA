import React from 'react';

export interface FoodEntryRowProps {
  id: string;
  foodName: string;
  quantity: number;
  unit: string; // e.g., "g", "kg", "oz", "ml", "scoop"
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  onRemove?: (id: string) => void;
  className?: string;
}

export const FoodEntryRow: React.FC<FoodEntryRowProps> = ({
  id,
  foodName,
  quantity,
  unit,
  calories,
  proteinGrams,
  carbsGrams,
  fatGrams,
  onRemove,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center justify-between py-2.5 px-3 rounded-md bg-surface-elevated/60 border border-border-subtle hover:border-border-light transition-colors ${className}`}
    >
      <div className="flex flex-col min-w-0 pr-2">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-text-primary truncate">
            {foodName}
          </span>
          <span className="text-[11px] font-black text-primary px-1.5 py-0.2 bg-primary/10 rounded-sm">
            {quantity} {unit}
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-[10px] sm:text-[11px] text-text-tertiary mt-0.5">
          <span className="font-semibold text-text-secondary">{Math.round(calories)} kcal</span>
          <span>•</span>
          <span className="text-macro-protein font-bold">P: {proteinGrams}g</span>
          <span className="text-macro-carbs font-bold">C: {carbsGrams}g</span>
          <span className="text-macro-fat font-bold">F: {fatGrams}g</span>
        </div>
      </div>

      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(id)}
          aria-label={`Remove ${foodName}`}
          className="text-text-muted hover:text-feedback-danger p-1 rounded-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
};
