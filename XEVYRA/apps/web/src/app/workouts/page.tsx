'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Dumbbell, Play, Plus, Clock, Flame, ChevronRight, CheckCircle2 } from 'lucide-react';
import { TopHeader } from '@/components/navigation/top-header';

interface Routine {
  id: string;
  name: string;
  category: string;
  exerciseCount: number;
  estimatedMinutes: number;
  thumbnailUrl: string;
  lastPerformed?: string;
  exercises: string[];
}

const SAMPLE_ROUTINES: Routine[] = [
  {
    id: 'push_a',
    name: 'Push Day A (Chest Focus)',
    category: 'Hypertrophy / Strength',
    exerciseCount: 6,
    estimatedMinutes: 45,
    thumbnailUrl: '/images/workout-push.jpg',
    lastPerformed: '3 days ago',
    exercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Dumbbell Lateral Raise', 'Tricep Pushdowns'],
  },
  {
    id: 'pull_a',
    name: 'Pull Day A (Back Focus)',
    category: 'Hypertrophy',
    exerciseCount: 6,
    estimatedMinutes: 50,
    thumbnailUrl: '/images/workout-push.jpg',
    lastPerformed: '5 days ago',
    exercises: ['Barbell Deadlift', 'Lat Pulldowns', 'Seated Cable Rows', 'Incline Bicep Curls'],
  },
  {
    id: 'legs_a',
    name: 'Leg Day A (Quad Focus)',
    category: 'Strength',
    exerciseCount: 5,
    estimatedMinutes: 55,
    thumbnailUrl: '/images/workout-push.jpg',
    lastPerformed: '1 week ago',
    exercises: ['Barbell Back Squat', 'Leg Press', 'Romanian Deadlift', 'Calf Raises'],
  },
];

export default function WorkoutsPage() {
  const [routines] = useState<Routine[]>(SAMPLE_ROUTINES);
  const [activeTab, setActiveTab] = useState<'routines' | 'history' | 'custom'>('routines');

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] pb-24 md:pb-12">
      <TopHeader />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        {/* Page Title & Action */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">
              Workouts & Routines
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
              Select a routine or launch an empty workout session.
            </p>
          </div>

          <button
            onClick={() => alert('Empty workout logger started')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-hover text-background font-bold text-xs sm:text-sm rounded-xl shadow-glow-brand transition-all touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>New Routine</span>
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-border pb-2">
          {(['routines', 'history', 'custom'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-surface-elevated text-brand border border-border'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              {tab === 'routines' ? 'My Routines' : tab === 'history' ? 'Workout History' : 'Custom Templates'}
            </button>
          ))}
        </div>

        {/* Routines List */}
        {activeTab === 'routines' && (
          <div className="space-y-4">
            {routines.map((routine) => (
              <div
                key={routine.id}
                className="bg-surface-card border border-border/80 hover:border-border-light rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-interactive"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-surface-elevated flex-shrink-0 border border-border">
                    <Image
                      src={routine.thumbnailUrl}
                      alt={routine.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-white font-display truncate">
                        {routine.name}
                      </h2>
                    </div>
                    <p className="text-xs text-brand font-medium mt-0.5">{routine.category}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-3.5 h-3.5" />
                        {routine.exerciseCount} exercises
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        ~{routine.estimatedMinutes} min
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t border-border sm:border-0">
                  <button
                    onClick={() => alert(`Starting ${routine.name}`)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-background font-bold text-xs sm:text-sm rounded-xl shadow-glow-brand transition-all active:scale-95 touch-target"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-surface-card border border-border rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center mx-auto text-text-muted">
              <CheckCircle2 className="w-6 h-6 text-brand" />
            </div>
            <h3 className="text-base font-bold text-white">Workout History</h3>
            <p className="text-xs sm:text-sm text-text-secondary max-w-sm mx-auto">
              Your completed workouts will appear here with set-by-set logs, volume charts, and PR notifications.
            </p>
          </div>
        )}

        {/* Custom Tab */}
        {activeTab === 'custom' && (
          <div className="bg-surface-card border border-border rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center mx-auto text-text-muted">
              <Plus className="w-6 h-6 text-brand" />
            </div>
            <h3 className="text-base font-bold text-white">Create Custom Template</h3>
            <p className="text-xs sm:text-sm text-text-secondary max-w-sm mx-auto">
              Build your own routine with custom supersets, dropsets, and target RPE / rest timers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
