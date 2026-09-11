import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function NutritionLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] pb-24 md:pb-12 animate-fadeIn">
      {/* Header Skeleton */}
      <header className="w-full bg-[#090D16]/90 border-b border-border/60 py-3">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Skeleton variant="rounded" className="h-7 w-28" />
          <Skeleton variant="circle" className="w-10 h-10" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton variant="rounded" className="h-7 w-48" />
            <Skeleton variant="rounded" className="h-4 w-72" />
          </div>
          <Skeleton variant="rounded" className="h-10 w-28 rounded-xl" />
        </div>

        {/* Calorie Card Skeleton */}
        <div className="bg-surface-card border border-border/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
          <div className="space-y-2.5">
            <Skeleton variant="rounded" className="h-4 w-20" />
            <Skeleton variant="rounded" className="h-7 w-36" />
          </div>
          <Skeleton variant="circle" className="w-[78px] h-[78px]" />
        </div>

        {/* 3 Macro Cards Skeleton */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface-card border border-border/80 rounded-2xl p-3.5 sm:p-4 flex flex-col items-center justify-between gap-3"
            >
              <Skeleton variant="rounded" className="h-4 w-14 self-start" />
              <Skeleton variant="rounded" className="h-5 w-16" />
              <Skeleton variant="circle" className="w-[52px] h-[52px]" />
            </div>
          ))}
        </div>

        {/* AI Insight Box Skeleton */}
        <div className="bg-surface-card border border-border/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
          <Skeleton variant="rounded" className="w-8 h-8 rounded-xl flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton variant="rounded" className="h-4 w-40" />
            <Skeleton variant="rounded" className="h-3.5 w-full" />
            <Skeleton variant="rounded" className="h-3.5 w-3/4" />
          </div>
        </div>

        {/* Meal Logs Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <Skeleton variant="rounded" className="h-5 w-36" />
            <Skeleton variant="rounded" className="h-4 w-20" />
          </div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface-card border border-border/80 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <Skeleton variant="rounded" className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton variant="rounded" className="h-3 w-16" />
                  <Skeleton variant="rounded" className="h-4 w-48" />
                  <Skeleton variant="rounded" className="h-3.5 w-32" />
                </div>
              </div>
              <Skeleton variant="circle" className="w-5 h-5 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
