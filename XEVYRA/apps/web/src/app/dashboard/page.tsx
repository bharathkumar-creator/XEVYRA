'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/navigation/PageContainer';
import { SectionHeader } from '@/components/navigation/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CalorieRing } from '@/components/ui/CalorieRing';
import { MacroSummary } from '@/components/nutrition/MacroSummary';
import { WorkoutCard } from '@/components/workouts/WorkoutCard';
import { PRBadge } from '@/components/workouts/PRBadge';
import { useToast } from '@/components/feedback/Toast';

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();

  // Mock athlete state (typed to clean presentation)
  const athlete = {
    name: 'Bharath',
    streakDays: 7,
    dailyCalories: {
      consumed: 1850,
      target: 2400,
    },
    macros: {
      protein: { consumed: 145, target: 180 },
      carbs: { consumed: 190, target: 250 },
      fat: { consumed: 52, target: 70 },
    },
    todayWorkout: {
      id: 'wkt_push_01',
      name: 'Push Hypertrophy & Delts',
      muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
      exerciseCount: 5,
      estimatedMinutes: 55,
      status: 'READY' as const,
      lastCompletedDate: '3 days ago',
    },
    recentPRs: [
      { exerciseName: 'Incline Dumbbell Press', weight: 36, reps: 8 },
      { exerciseName: 'Barbell Back Squat', weight: 140, reps: 5 },
    ],
  };

  const handleStartWorkout = (workoutId: string) => {
    showToast({
      type: 'info',
      title: 'Workout Session Initialized',
      message: 'Entering active gym training mode...',
    });
    router.push('/workouts');
  };

  return (
    <PageContainer maxWidth="xl" className="flex flex-col gap-6">
      {/* 1. Athlete Greeting & Today's Focus Cockpit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-lg bg-surface border border-border-subtle shadow-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-feedback-success" />
            <span className="text-[10px] font-extrabold text-text-tertiary uppercase tracking-widest">
              ATHLETE COCKPIT • DAY {athlete.streakDays}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight font-display uppercase">
            Good morning, {athlete.name}
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Focus: Heavy Push Session & Hit 180g Protein Target.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="md" pulse>
            🔥 7-DAY STREAK
          </Badge>
        </div>
      </div>

      {/* 2. Quick Action Shortcuts */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <button
          onClick={() => router.push('/workouts')}
          className="p-3 sm:p-4 rounded-lg bg-surface-elevated border border-border-subtle hover:border-primary/40 transition-colors flex flex-col items-center text-center gap-1.5 focus-visible:outline-none touch-target"
        >
          <span className="text-lg">🏋️</span>
          <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
            Log Workout
          </span>
          <span className="text-[10px] text-text-tertiary hidden sm:inline">Active Gym Session</span>
        </button>

        <button
          onClick={() => router.push('/nutrition')}
          className="p-3 sm:p-4 rounded-lg bg-surface-elevated border border-border-subtle hover:border-primary/40 transition-colors flex flex-col items-center text-center gap-1.5 focus-visible:outline-none touch-target"
        >
          <span className="text-lg">⚖️</span>
          <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
            Log Food
          </span>
          <span className="text-[10px] text-text-tertiary hidden sm:inline">Weight (Grams/Oz)</span>
        </button>

        <button
          onClick={() => router.push('/progress')}
          className="p-3 sm:p-4 rounded-lg bg-surface-elevated border border-border-subtle hover:border-primary/40 transition-colors flex flex-col items-center text-center gap-1.5 focus-visible:outline-none touch-target"
        >
          <span className="text-lg">📈</span>
          <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
            Log Weight
          </span>
          <span className="text-[10px] text-text-tertiary hidden sm:inline">Track 7d Trend</span>
        </button>
      </div>

      {/* 3. Daily Nutrition & Fuel Progress */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Calorie Progress Ring Card */}
        <Card variant="default" className="md:col-span-5 flex flex-col items-center justify-center p-6 text-center">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-text-tertiary mb-3">
            ENERGY INTAKE • CALORIES
          </span>
          <CalorieRing
            consumed={athlete.dailyCalories.consumed}
            target={athlete.dailyCalories.target}
            size={170}
          />
          <Link
            href="/nutrition"
            className="mt-4 text-xs font-bold text-primary hover:underline uppercase tracking-wider"
          >
            + Log Meal Intake &rarr;
          </Link>
        </Card>

        {/* Macro Summary Progress */}
        <div className="md:col-span-7 flex flex-col justify-between">
          <MacroSummary
            protein={athlete.macros.protein}
            carbs={athlete.macros.carbs}
            fat={athlete.macros.fat}
          />
        </div>
      </div>

      {/* 4. Today's Scheduled Workout */}
      <div className="flex flex-col gap-2">
        <SectionHeader
          title="Today's Training"
          subtitle="Programmed routine for peak progressive overload"
          actionElement={
            <Link href="/workouts" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">
              All Routines &rarr;
            </Link>
          }
        />
        <WorkoutCard
          id={athlete.todayWorkout.id}
          name={athlete.todayWorkout.name}
          muscleGroups={athlete.todayWorkout.muscleGroups}
          exerciseCount={athlete.todayWorkout.exerciseCount}
          estimatedMinutes={athlete.todayWorkout.estimatedMinutes}
          status={athlete.todayWorkout.status}
          lastCompletedDate={athlete.todayWorkout.lastCompletedDate}
          onStart={handleStartWorkout}
        />
      </div>

      {/* 5. Recent PR Trophy Highlights */}
      {athlete.recentPRs.length > 0 && (
        <div className="flex flex-col gap-2">
          <SectionHeader
            title="Recent Achievements"
            subtitle="Personal records shattered this week"
            actionElement={
              <Link href="/progress" className="text-xs font-bold text-text-tertiary hover:text-text-primary uppercase">
                View Records
              </Link>
            }
          />
          <div className="flex flex-wrap gap-2.5">
            {athlete.recentPRs.map((pr, i) => (
              <PRBadge
                key={i}
                exerciseName={pr.exerciseName}
                weight={`${pr.weight} kg`}
                reps={pr.reps}
              />
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
