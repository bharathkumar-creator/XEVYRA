import React from 'react';
import Link from 'next/link';
import { Scale, ArrowDownRight, ArrowUpRight, ChevronRight } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export interface WeightTrendCardProps {
  currentKg?: number;
  previousWeekDiffKg?: number;
  weeklyTrend?: Array<{ day: string; weightKg: number }>;
  loading?: boolean;
}

export function WeightTrendCard({
  currentKg = 70.2,
  previousWeekDiffKg = -0.8,
  weeklyTrend = [
    { day: 'Thu', weightKg: 71.0 },
    { day: 'Fri', weightKg: 70.9 },
    { day: 'Sat', weightKg: 70.6 },
    { day: 'Sun', weightKg: 70.7 },
    { day: 'Mon', weightKg: 70.4 },
    { day: 'Tue', weightKg: 70.3 },
    { day: 'Wed', weightKg: 70.2 },
  ],
  loading = false,
}: WeightTrendCardProps) {
  if (loading) {
    return (
      <div className="bg-surface-card border border-border/80 rounded-2xl p-4 flex flex-col justify-between h-full min-h-[125px] animate-fadeIn">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton variant="rounded" className="w-5 h-5 rounded-md" />
            <Skeleton variant="rounded" className="h-4 w-24" />
          </div>
          <Skeleton variant="circle" className="w-4 h-4" />
        </div>
        <div className="my-2">
          <Skeleton variant="rounded" className="h-7 w-20" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton variant="rounded" className="h-4 w-28" />
          <Skeleton variant="rounded" className="h-6 w-20" />
        </div>
      </div>
    );
  }

  // Sparkline coordinates generation
  const weights = weeklyTrend.map((t) => t.weightKg);
  const minW = Math.min(...weights, currentKg - 0.5);
  const maxW = Math.max(...weights, currentKg + 0.5);
  const range = maxW - minW || 1;

  const width = 100;
  const height = 30;
  const points = weeklyTrend
    .map((item, index) => {
      const x = (index / (weeklyTrend.length - 1)) * width;
      const y = height - ((item.weightKg - minW) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const isDecrease = previousWeekDiffKg < 0;

  return (
    <Link
      href="/progress"
      className="bg-surface-card border border-border/80 hover:border-brand/40 rounded-2xl p-4 flex flex-col justify-between card-interactive group block animate-fadeIn"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="p-1 rounded-md bg-blue-500/10 text-blue-400">
            <Scale className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          <span className="text-xs sm:text-sm font-semibold text-text-secondary">
            Current Weight
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-white transition-colors" />
      </div>

      {/* Main Stat */}
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-extrabold font-display text-white">
          {currentKg.toFixed(1)}
        </span>
        <span className="text-xs text-text-secondary font-medium">kg</span>
      </div>

      {/* Footer / Sparkline */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-0.5 text-xs text-brand font-medium">
          {isDecrease ? (
            <ArrowDownRight className="w-3.5 h-3.5 text-brand" />
          ) : (
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>
            {isDecrease ? '' : '+'}
            {previousWeekDiffKg.toFixed(1)} kg
          </span>
          <span className="text-[10px] text-text-muted ml-0.5 hidden sm:inline">
            vs last week
          </span>
        </div>

        {/* Sparkline SVG */}
        <div className="w-20 h-7 flex-shrink-0">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            aria-hidden="true"
          >
            <polyline
              fill="none"
              stroke="#00E599"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
              style={{ filter: 'drop-shadow(0 0 3px rgba(0, 229, 153, 0.4))' }}
            />
            {weeklyTrend.length > 0 && (
              <circle
                cx={width}
                cy={
                  height -
                  ((weeklyTrend[weeklyTrend.length - 1].weightKg - minW) / range) *
                    (height - 6) -
                  3
                }
                r="3"
                fill="#00E599"
              />
            )}
          </svg>
        </div>
      </div>
    </Link>
  );
}
