import React from 'react';
import Link from 'next/link';
import { Flame, ChevronRight } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export interface TrainingStreakCardProps {
  days?: number;
  message?: string;
  loading?: boolean;
}

export function TrainingStreakCard({
  days = 12,
  message = 'Keep it up! 🔥',
  loading = false,
}: TrainingStreakCardProps) {
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
        <Skeleton variant="rounded" className="h-4 w-28" />
      </div>
    );
  }

  return (
    <Link
      href="/workouts"
      className="bg-surface-card border border-border/80 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between card-interactive group block animate-fadeIn"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="p-1 rounded-md bg-amber-500/10 text-amber-400">
            <Flame className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          <span className="text-xs sm:text-sm font-semibold text-text-secondary">
            Training Streak
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-white transition-colors" />
      </div>

      {/* Main Stat */}
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-extrabold font-display text-white">
          {days}
        </span>
        <span className="text-xs text-text-secondary font-medium">days</span>
      </div>

      {/* Message */}
      <div className="mt-2">
        <span className="text-xs text-amber-400 font-medium">{message}</span>
      </div>
    </Link>
  );
}
