import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function WorkoutsLoading() {
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

        <div className="flex gap-2 border-b border-border pb-2">
          <Skeleton variant="rounded" className="h-8 w-24 rounded-xl" />
          <Skeleton variant="rounded" className="h-8 w-28 rounded-xl" />
          <Skeleton variant="rounded" className="h-8 w-32 rounded-xl" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface-card border border-border/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <Skeleton variant="rounded" className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton variant="rounded" className="h-5 w-48" />
                  <Skeleton variant="rounded" className="h-4 w-32" />
                  <div className="flex gap-3 pt-1">
                    <Skeleton variant="rounded" className="h-3.5 w-20" />
                    <Skeleton variant="rounded" className="h-3.5 w-16" />
                  </div>
                </div>
              </div>
              <Skeleton variant="rounded" className="h-10 w-full sm:w-24 rounded-xl flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
