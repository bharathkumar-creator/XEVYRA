import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] pb-24 md:pb-12 animate-fadeIn">
      {/* Header Skeleton */}
      <header className="w-full bg-[#090D16]/90 border-b border-border/60 py-3">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Skeleton variant="rounded" className="h-7 w-28" />
          <Skeleton variant="circle" className="w-10 h-10" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        {/* User Card Skeleton */}
        <div className="bg-surface-card border border-border/80 rounded-3xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <Skeleton variant="circle" className="w-20 h-20 flex-shrink-0" />
          <div className="flex-1 space-y-3 w-full">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton variant="rounded" className="h-6 w-32" />
                <Skeleton variant="rounded" className="h-4 w-44" />
              </div>
              <Skeleton variant="rounded" className="h-7 w-24 rounded-full" />
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
              <Skeleton variant="rounded" className="h-10 w-full" />
              <Skeleton variant="rounded" className="h-10 w-full" />
              <Skeleton variant="rounded" className="h-10 w-full" />
            </div>
          </div>
        </div>

        {/* Settings Skeleton */}
        <div className="space-y-3">
          <Skeleton variant="rounded" className="h-4 w-40" />
          <div className="bg-surface-card border border-border rounded-2xl divide-y divide-border">
            <div className="p-4 flex items-center justify-between">
              <Skeleton variant="rounded" className="h-5 w-32" />
              <Skeleton variant="rounded" className="h-8 w-24 rounded-xl" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <Skeleton variant="rounded" className="h-5 w-40" />
              <Skeleton variant="circle" className="w-4 h-4" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <Skeleton variant="rounded" className="h-5 w-44" />
              <Skeleton variant="circle" className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
