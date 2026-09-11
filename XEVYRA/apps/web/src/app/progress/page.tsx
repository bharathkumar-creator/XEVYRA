'use client';

import React, { useState } from 'react';
import { Scale, TrendingUp, Trophy, Calendar, Plus } from 'lucide-react';
import { TopHeader } from '@/components/navigation/top-header';
import { WeightTrendCard } from '@/components/dashboard/weight-trend-card';

const PR_RECORDS = [
  { exercise: 'Barbell Bench Press', weight: '105 kg', reps: '3 reps', date: 'Yesterday', diff: '+2.5 kg' },
  { exercise: 'Barbell Back Squat', weight: '140 kg', reps: '5 reps', date: 'Last week', diff: '+5.0 kg' },
  { exercise: 'Conventional Deadlift', weight: '185 kg', reps: '1 rep', date: '2 weeks ago', diff: '+10.0 kg' },
  { exercise: 'Overhead Press', weight: '70 kg', reps: '4 reps', date: '3 weeks ago', diff: '+2.5 kg' },
];

export default function ProgressPage() {
  const [records] = useState(PR_RECORDS);

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] pb-24 md:pb-12">
      <TopHeader />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">
              Body & Strength Progress
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
              Weight trends, estimated 1-Rep Max benchmarks, and training volume.
            </p>
          </div>

          <button
            onClick={() => alert('Log weight check-in')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-hover text-background font-bold text-xs sm:text-sm rounded-xl shadow-glow-brand transition-all touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Log Weigh-In</span>
          </button>
        </div>

        {/* Weight & Composition Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WeightTrendCard />

          <div className="bg-surface-card border border-border/80 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-text-secondary">
                Weekly Summary
              </span>
              <span className="text-xs text-brand font-medium">On Track</span>
            </div>
            <div className="space-y-1 my-3">
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Target Weight</span>
                <span className="text-white font-semibold">68.0 kg</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Average Deficit</span>
                <span className="text-white font-semibold">-400 kcal/day</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Rate of Loss</span>
                <span className="text-brand font-semibold">~0.5 kg/week</span>
              </div>
            </div>
            <div className="w-full bg-surface-elevated rounded-full h-2 overflow-hidden">
              <div className="bg-brand h-full rounded-full w-[65%]" />
            </div>
          </div>
        </div>

        {/* 1RM Strength Milestones */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white font-display">Personal Records (1RM)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {records.map((item) => (
              <div
                key={item.exercise}
                className="bg-surface-card border border-border/80 hover:border-border-light rounded-2xl p-4 flex items-center justify-between card-interactive"
              >
                <div>
                  <h3 className="text-sm font-bold text-white font-display">{item.exercise}</h3>
                  <p className="text-xs text-text-muted mt-0.5">{item.reps} · {item.date}</p>
                </div>

                <div className="text-right">
                  <div className="text-base sm:text-lg font-bold font-display text-white">
                    {item.weight}
                  </div>
                  <span className="text-[11px] font-semibold text-brand">{item.diff}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
