import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Utensils, Plus, ChevronRight } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export interface MealPreviewCardProps {
  meal?: {
    id: string;
    mealType: string;
    description: string;
    calories: number;
    thumbnailUrl: string;
  } | null;
  loading?: boolean;
  onLogMeal?: () => void;
}

export function MealPreviewCard({
  meal,
  loading = false,
  onLogMeal,
}: MealPreviewCardProps) {
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
        <div className="bg-surface-card border border-border/80 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Skeleton variant="rounded" className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2 py-0.5">
              <Skeleton variant="rounded" className="h-4 w-28" />
              <Skeleton variant="rounded" className="h-3.5 w-40" />
              <Skeleton variant="rounded" className="h-3.5 w-20" />
            </div>
          </div>
          <Skeleton variant="rounded" className="h-10 w-24 rounded-xl flex-shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 animate-fadeIn">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
            <Utensils className="w-4 h-4" aria-hidden="true" />
          </span>
          <h2 className="text-sm sm:text-base font-bold text-white font-display">
            Today's Meals
          </h2>
        </div>
        <Link
          href="/nutrition"
          className="text-xs sm:text-sm font-semibold text-text-secondary hover:text-brand transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Card Content */}
      {!meal ? (
        <div className="bg-surface-card border border-border/80 rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center text-text-muted">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Start tracking your first meal</p>
            <p className="text-xs text-text-secondary mt-0.5">
              Log breakfast, lunch, dinner or quick snacks
            </p>
          </div>
          <Link
            href="/nutrition"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-brand bg-brand/10 hover:bg-brand/20 rounded-xl transition-colors min-h-[44px]"
          >
            Log Meal
          </Link>
        </div>
      ) : (
        <div className="bg-surface-card border border-border/80 hover:border-border-light rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 card-interactive">
          <div className="flex items-center gap-3 min-w-0">
            {/* Thumbnail Image */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 bg-surface-elevated border border-border">
              <Image
                src={meal.thumbnailUrl}
                alt={meal.mealType}
                fill
                sizes="64px"
                className="object-cover object-center"
              />
            </div>

            {/* Meal info */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold text-white font-display">
                  {meal.mealType}
                </h3>
                <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
              </div>
              <p className="text-xs text-text-secondary truncate mt-0.5">
                {meal.description}
              </p>
              <p className="text-xs font-semibold text-text-primary mt-1">
                {meal.calories} kcal
              </p>
            </div>
          </div>

          {/* Action */}
          <div className="flex-shrink-0">
            <button
              onClick={() => (onLogMeal ? onLogMeal() : null)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-transparent hover:bg-brand/10 text-brand font-semibold text-xs sm:text-sm rounded-xl border border-brand/40 hover:border-brand transition-colors touch-target"
            >
              <Plus className="w-4 h-4" />
              <span>Log Meal</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
