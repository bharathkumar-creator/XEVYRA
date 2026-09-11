import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface NutritionTargetCardProps {
  goalMode: 'DEFICIT' | 'MAINTENANCE' | 'SURPLUS';
  dailyCalorieTarget: number;
  maintenanceCaloriesEstimated: number;
  calorieOffset: number;
  confidence: 'INSUFFICIENT' | 'PRELIMINARY' | 'INITIAL' | 'MORE_RELIABLE' | 'STRONGER_TREND';
  daysAnalyzed: number;
  onOpenPlanner?: () => void;
  className?: string;
}

export const NutritionTargetCard: React.FC<NutritionTargetCardProps> = ({
  goalMode,
  dailyCalorieTarget,
  maintenanceCaloriesEstimated,
  calorieOffset,
  confidence,
  daysAnalyzed,
  onOpenPlanner,
  className = '',
}) => {
  const goalBadge = {
    DEFICIT: <Badge variant="warning" size="sm">CALORIE DEFICIT (FAT LOSS)</Badge>,
    MAINTENANCE: <Badge variant="primary" size="sm">MAINTENANCE (RECOMP)</Badge>,
    SURPLUS: <Badge variant="emerald" size="sm">CALORIE SURPLUS (LEAN BULK)</Badge>,
  }[goalMode];

  const confidenceText = {
    INSUFFICIENT: '0-2 Days (Gathering baseline)',
    PRELIMINARY: '3-6 Days (Preliminary)',
    INITIAL: '7 Days (Initial Calorie Baseline)',
    MORE_RELIABLE: '14+ Days (High Confidence)',
    STRONGER_TREND: '28+ Days (Strong Trend)',
  }[confidence];

  return (
    <Card variant="highlight" className={`flex flex-col gap-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest block mb-0.5">
            ENERGY BALANCE & TARGET
          </span>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-text-primary uppercase tracking-wide font-display">
              {dailyCalorieTarget} KCAL / DAY
            </h3>
            {goalBadge}
          </div>
        </div>

        {onOpenPlanner && (
          <Button variant="outline" size="sm" onClick={onOpenPlanner}>
            ⚡ Adjust Strategy
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-md bg-surface border border-border-subtle text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] text-text-tertiary uppercase font-bold">Estimated TDEE</span>
          <span className="font-extrabold text-text-primary font-display mt-0.5">
            {maintenanceCaloriesEstimated} kcal
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-text-tertiary uppercase font-bold">Strategy Offset</span>
          <span className={`font-extrabold font-display mt-0.5 ${
            calorieOffset < 0 ? 'text-feedback-warning' : calorieOffset > 0 ? 'text-brand-emerald' : 'text-primary'
          }`}>
            {calorieOffset > 0 ? `+${calorieOffset}` : calorieOffset} kcal
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 flex flex-col">
          <span className="text-[10px] text-text-tertiary uppercase font-bold">Data Quality</span>
          <span className="font-semibold text-text-secondary mt-0.5 truncate">
            {confidenceText}
          </span>
        </div>
      </div>
    </Card>
  );
};
