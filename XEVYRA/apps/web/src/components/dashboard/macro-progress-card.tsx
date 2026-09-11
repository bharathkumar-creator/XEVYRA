import React from 'react';
import { Dumbbell, Wheat, Droplets } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export type MacroType = 'protein' | 'carbs' | 'fats';

export interface MacroProgressCardProps {
  type: MacroType;
  consumed: number;
  target: number;
  percentage?: number;
  loading?: boolean;
}

const MACRO_CONFIG: Record<
  MacroType,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    glow: string;
    bgColor: string;
  }
> = {
  protein: {
    label: 'Protein',
    icon: Dumbbell,
    color: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.4)',
    bgColor: 'bg-blue-500/10 text-blue-400',
  },
  carbs: {
    label: 'Carbs',
    icon: Wheat,
    color: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.4)',
    bgColor: 'bg-amber-500/10 text-amber-400',
  },
  fats: {
    label: 'Fats',
    icon: Droplets,
    color: '#A855F7',
    glow: 'rgba(168, 85, 247, 0.4)',
    bgColor: 'bg-purple-500/10 text-purple-400',
  },
};

export function MacroProgressCard({
  type,
  consumed,
  target,
  percentage,
  loading = false,
}: MacroProgressCardProps) {
  const config = MACRO_CONFIG[type];
  const Icon = config.icon;

  if (loading) {
    return (
      <div className="bg-surface-card border border-border/80 rounded-2xl p-3.5 sm:p-4 flex flex-col items-center justify-between gap-3 animate-fadeIn">
        <div className="flex items-center gap-1.5 self-start w-full">
          <Skeleton variant="rounded" className="w-5 h-5 rounded-md" />
          <Skeleton variant="rounded" className="h-3.5 w-12" />
        </div>
        <Skeleton variant="rounded" className="h-5 w-16 my-0.5" />
        <Skeleton variant="circle" className="w-[52px] h-[52px]" />
      </div>
    );
  }

  const calculatedPercentage =
    percentage !== undefined
      ? percentage
      : target > 0
        ? Math.min(100, Math.round((consumed / target) * 100))
        : 0;

  // Small circular ring math
  const size = 52;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (calculatedPercentage / 100) * circumference;

  return (
    <div className="bg-surface-card border border-border/80 hover:border-border-light rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-between gap-2.5 card-interactive animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-1.5 self-start w-full">
        <span className={`p-1 rounded-md ${config.bgColor}`}>
          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
        </span>
        <span className="text-xs sm:text-sm font-semibold text-text-secondary truncate">
          {config.label}
        </span>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1 text-center">
        <span className="text-base sm:text-lg font-bold font-display text-white">
          {consumed}
        </span>
        <span className="text-[11px] sm:text-xs text-text-secondary">
          / {target} g
        </span>
      </div>

      {/* Circular Mini-Ring */}
      <div
        className="relative flex items-center justify-center my-0.5"
        style={{ width: size, height: size }}
      >
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
          aria-label={`${config.label} progress ${calculatedPercentage}%`}
          role="progressbar"
          aria-valuenow={calculatedPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1F293D"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={config.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0 0 3px ${config.glow})`,
            }}
          />
        </svg>
        <span className="absolute text-xs font-bold font-display text-white">
          {calculatedPercentage}%
        </span>
      </div>
    </div>
  );
}
