import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProgressLoading() {
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
          <Skeleton variant="rounded" className="h-10 w-32 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-card border border-border/80 rounded-2xl p-4 flex flex-col justify-between h-full min-h-[140px]">
            <div className="flex items-center justify-between">
              <Skeleton variant="rounded" className="h-4 w-28" />
              <Skeleton variant="circle" className="w-4 h-4" />
            </div>
            <Skeleton variant="rounded" className="h-8 w-24 my-2" />
            <div className="flex items-center justify-between">
              <Skeleton variant="rounded" className="h-4 w-32" />
              <Skeleton variant="rounded" className="h-6 w-24" />
            </div>
          </div>

          <div className="bg-surface-card border border-border/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton variant="rounded" className="h-4 w-28" />
              <Skeleton variant="rounded" className="h-4 w-16" />
            </div>
            <div className="space-y-2">
              <Skeleton variant="rounded" className="h-3.5 w-full" />
              <Skeleton variant="rounded" className="h-3.5 w-full" />
            </div>
            <Skeleton variant="rounded" className="h-2 w-full rounded-full" />
          </div>
        </div>

        {/* PR Milestones Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Skeleton variant="circle" className="w-4 h-4" />
            <Skeleton variant="rounded" className="h-5 w-44" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-surface-card border border-border/80 rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="space-y-2">
                  <Skeleton variant="rounded" className="h-4 w-36" />
                  <Skeleton variant="rounded" className="h-3 w-24" />
                </div>
                <div className="space-y-1 flex flex-col items-end">
                  <Skeleton variant="rounded" className="h-5 w-16" />
                  <Skeleton variant="rounded" className="h-3.5 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
