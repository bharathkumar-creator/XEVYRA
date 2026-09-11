import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Dumbbell, Play, Clock, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export interface WorkoutPreviewCardProps {
  workout?: {
    id: string;
    title: string;
    muscles: string;
    exerciseCount: number;
    estimatedMinutes: number;
    thumbnailUrl: string;
    isCompleted?: boolean;
  } | null;
  loading?: boolean;
  onStart?: (workoutId: string) => void;
}

export function WorkoutPreviewCard({
  workout,
  loading = false,
  onStart,
}: WorkoutPreviewCardProps) {
  if (loading) {
    return (
      <div className="space-y-2.5 animate-fadeIn">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <Skeleton variant="rounded" className="w-6 h-6 rounded-md" />
            <Skeleton variant="rounded" className="h-5 w-32" />
          </div>
          <Skeleton variant="rounded" className="h-4 w-16" />
        </div>
        <div className="bg-surface-card border border-border/80 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <Skeleton variant="rounded" className="w-full sm:w-24 h-28 sm:h-24 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <Skeleton variant="rounded" className="h-5 w-3/4" />
            <Skeleton variant="rounded" className="h-4 w-1/2" />
            <div className="flex items-center gap-3 pt-2">
              <Skeleton variant="rounded" className="h-4 w-20" />
              <Skeleton variant="rounded" className="h-4 w-16" />
            </div>
          </div>
          <div className="pt-2 sm:pt-0">
            <Skeleton variant="rounded" className="h-11 w-full sm:w-32 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 animate-fadeIn">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-blue-500/10 text-blue-400">
            <Dumbbell className="w-4 h-4" aria-hidden="true" />
          </span>
          <h2 className="text-sm sm:text-base font-bold text-white font-display">
            Today's Workout
          </h2>
        </div>
        <Link
          href="/workouts"
          className="text-xs sm:text-sm font-semibold text-text-secondary hover:text-brand transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Card Content */}
      {!workout ? (
        <div className="bg-surface-card border border-border/80 rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center text-text-muted">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">No workout planned yet</p>
            <p className="text-xs text-text-secondary mt-0.5">
              Select a routine or create a custom workout
            </p>
          </div>
          <Link
            href="/workouts"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-brand bg-brand/10 hover:bg-brand/20 rounded-xl transition-colors min-h-[44px]"
          >
            Browse Routines
          </Link>
        </div>
      ) : (
        <div className="bg-surface-card border border-border/80 hover:border-border-light rounded-2xl p-3.5 sm:p-4.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 card-interactive">
          {/* Thumbnail Image */}
          <div className="relative w-full sm:w-24 h-32 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-surface-elevated border border-border">
            <Image
              src={workout.thumbnailUrl}
              alt={workout.title}
              fill
              sizes="(max-width: 640px) 100vw, 96px"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent sm:hidden" />
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-display truncate">
                  {workout.title}
                </h3>
                {workout.isCompleted && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Done
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-text-secondary mt-0.5 truncate">
                {workout.muscles}
              </p>
            </div>

            <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5" />
                {workout.exerciseCount} exercises
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                ~{workout.estimatedMinutes} min
              </span>
            </div>
          </div>

          {/* Start Button */}
          <div className="flex items-center justify-end sm:justify-center flex-shrink-0 pt-2 sm:pt-0 border-t border-border sm:border-0">
            <button
              onClick={() => (onStart ? onStart(workout.id) : null)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-background font-bold text-sm rounded-xl shadow-glow-brand transition-all transform active:scale-95 touch-target"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Workout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
