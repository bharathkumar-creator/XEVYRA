import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] pb-24 md:pb-12 animate-fadeIn">
      {/* Header Skeleton */}
      <header className="w-full bg-[#090D16]/90 border-b border-border/60 py-3">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Skeleton variant="rounded" className="h-7 w-28" />
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col gap-1 items-end">
              <Skeleton variant="rounded" className="h-3 w-16" />
              <Skeleton variant="rounded" className="h-4 w-20" />
            </div>
            <Skeleton variant="circle" className="w-10 h-10" />
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
        {/* Calorie Skeleton */}
        <div className="bg-surface-card border border-border/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
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

        {/* 3 Macro Cards Skeleton */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface-card border border-border/80 rounded-2xl p-3.5 sm:p-4 flex flex-col items-center justify-between gap-3"
            >
              <div className="flex items-center gap-1.5 self-start w-full">
                <Skeleton variant="rounded" className="w-5 h-5 rounded-md" />
                <Skeleton variant="rounded" className="h-3.5 w-12" />
              </div>
              <Skeleton variant="rounded" className="h-5 w-16 my-0.5" />
              <Skeleton variant="circle" className="w-[52px] h-[52px]" />
            </div>
          ))}
        </div>

        {/* Weight + Streak Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-surface-card border border-border/80 rounded-2xl p-4 flex flex-col justify-between h-full min-h-[125px]">
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

          <div className="bg-surface-card border border-border/80 rounded-2xl p-4 flex flex-col justify-between h-full min-h-[125px]">
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
        </div>

        {/* Workout & Meal Previews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2.5">
            <div className="flex justify-between items-center px-1">
              <Skeleton variant="rounded" className="h-5 w-32" />
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

          <div className="space-y-2.5">
            <div className="flex justify-between items-center px-1">
              <Skeleton variant="rounded" className="h-5 w-32" />
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
        </div>
      </div>
    </div>
  );
}
