import React from 'react';
import { Flame } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export interface CalorieProgressProps {
  consumed?: number;
  target?: number;
  percentage?: number;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function CalorieProgress({
  consumed = 0,
  target = 2000,
  percentage,
  loading = false,
  error = null,
  onRetry,
}: CalorieProgressProps) {
  if (loading) {
    return (
      <div className="bg-surface-card border border-border/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between animate-fadeIn">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Skeleton variant="rounded" className="w-5 h-5 rounded-md" />
            <Skeleton variant="rounded" className="h-4 w-20" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <Skeleton variant="rounded" className="h-7 sm:h-8 w-24" />
            <Skeleton variant="rounded" className="h-4 w-16" />
          </div>
        </div>
        <Skeleton variant="circle" className="w-[78px] h-[78px] flex-shrink-0" />
      </div>
    );
  }

  const calculatedPercentage =
    percentage !== undefined
      ? percentage
      : target > 0
        ? Math.min(100, Math.round((consumed / target) * 100))
        : 0;

  // SVG Circular progress math
  const size = 78;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (calculatedPercentage / 100) * circumference;

  if (error) {
    return (
      <div className="bg-surface-card border border-red-500/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-danger">Calorie sync failed</span>
          <p className="text-sm text-text-secondary mt-1">{error}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs text-brand font-medium hover:underline px-3 py-2 border border-brand/30 rounded-lg"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface-card border border-border/80 hover:border-border-light rounded-2xl p-4 sm:p-5 flex items-center justify-between card-interactive shadow-sm animate-fadeIn">
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 text-text-secondary text-xs sm:text-sm font-medium">
          <span className="p-1 rounded-md bg-amber-500/10 text-amber-400">
            <Flame className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          <span>Calories</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
            {consumed.toLocaleString()}
          </span>
          <span className="text-text-secondary text-sm sm:text-base font-normal">
            / {target.toLocaleString()} kcal
          </span>
        </div>
        {consumed === 0 && (
          <span className="text-[11px] text-text-muted mt-0.5">
            No calories logged yet today
          </span>
        )}
      </div>

      {/* Circular Progress Ring */}
      <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
          aria-label={`Calories progress ${calculatedPercentage}%`}
          role="progressbar"
          aria-valuenow={calculatedPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1F293D"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#00E599"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(0, 229, 153, 0.4))',
            }}
          />
        </svg>
        <span className="absolute text-sm font-bold font-display text-white">
          {calculatedPercentage}%
        </span>
      </div>
    </div>
  );
}
