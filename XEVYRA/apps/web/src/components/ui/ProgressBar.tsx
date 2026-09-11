import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100 or current
  max?: number;  // default 100
  colorVariant?: 'primary' | 'protein' | 'carbs' | 'fat' | 'calories' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  colorVariant = 'primary',
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / (max || 1)) * 100));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  }[size];

  const colorStyles = {
    primary: 'bg-primary',
    protein: 'bg-macro-protein',
    carbs: 'bg-macro-carbs',
    fat: 'bg-macro-fat',
    calories: 'bg-macro-calories',
    emerald: 'bg-brand-emerald',
  }[colorVariant];

  return (
    <div className={`w-full flex flex-col gap-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs font-semibold text-text-secondary">
          <span>{Math.round(value)}</span>
          <span>{max}</span>
        </div>
      )}
      <div className={`w-full bg-surface-muted rounded-full overflow-hidden ${heightStyles}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${colorStyles}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
