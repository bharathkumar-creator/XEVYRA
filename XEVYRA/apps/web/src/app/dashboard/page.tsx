'use client';

import React from 'react';
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
import { MotivationalQuote } from '@/components/ui/MotivationalQuote';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useToast } from '@/components/feedback/Toast';
import { useDashboard } from '@/lib/hooks/useDashboard';

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { data, isLoading, error, refetch } = useDashboard();

  const handleStartWorkout = (workoutId: string) => {
    showToast({
      type: 'info',
      title: 'Workout Session Initialized',
      message: 'Entering active training session...',
    });
    router.push('/workouts');
  };

  if (isLoading) {
    return (
      <PageContainer maxWidth="xl" className="flex flex-col gap-6">
        <div className="p-6 rounded-lg bg-surface border border-border-subtle flex flex-col gap-3">
          <Skeleton height={28} width="40%" />
          <Skeleton height={16} width="60%" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Skeleton height={80} className="rounded-lg" />
          <Skeleton height={80} className="rounded-lg" />
          <Skeleton height={80} className="rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <Skeleton height={220} className="md:col-span-5 rounded-lg" />
          <Skeleton height={220} className="md:col-span-7 rounded-lg" />
        </div>
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer maxWidth="xl" className="flex flex-col gap-6">
        <ErrorState
          title="Dashboard Unavailable"
          message={error || 'Failed to connect to XEVYRA API. Please check your network connection.'}
          onRetry={refetch}
        />
      </PageContainer>
    );
  }

  const { athlete } = data;

  return (
    <PageContainer maxWidth="xl" className="flex flex-col gap-6">
      {/* 1. Athlete Greeting & Cockpit Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-lg bg-surface border border-border-subtle shadow-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-feedback-success" />
            <span className="text-[10px] font-extrabold text-text-tertiary uppercase tracking-widest">
              ATHLETE COMMAND • STREAK {athlete.streakDays} DAYS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight font-display uppercase">
            Good day, {athlete.name}
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            {athlete.focusToday || 'Train with intensity. Fuel with precision. Evolve daily.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="md" pulse={athlete.streakDays > 0}>
            🔥 {athlete.streakDays}-DAY STREAK
          </Badge>
        </div>
      </div>

      {/* 2. Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <button
          onClick={() => router.push('/workouts')}
          className="p-3 sm:p-4 rounded-lg bg-surface-elevated border border-border-subtle hover:border-primary/40 transition-colors flex flex-col items-center text-center gap-1.5 focus-visible:outline-none touch-target"
        >
          <span className="text-xl">🏋️</span>
          <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
            Train
          </span>
          <span className="text-[10px] text-text-tertiary hidden sm:inline">Active Gym Session</span>
        </button>

        <button
          onClick={() => router.push('/nutrition')}
          className="p-3 sm:p-4 rounded-lg bg-surface-elevated border border-border-subtle hover:border-primary/40 transition-colors flex flex-col items-center text-center gap-1.5 focus-visible:outline-none touch-target"
        >
          <span className="text-xl">⚖️</span>
          <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
            Fuel
          </span>
          <span className="text-[10px] text-text-tertiary hidden sm:inline">Weight-Based Foods</span>
        </button>

        <button
          onClick={() => router.push('/nutrition/diet-plan')}
          className="p-3 sm:p-4 rounded-lg bg-surface-elevated border border-border-subtle hover:border-primary/40 transition-colors flex flex-col items-center text-center gap-1.5 focus-visible:outline-none touch-target"
        >
          <span className="text-xl">🤖</span>
          <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
            AI Blueprint
          </span>
          <span className="text-[10px] text-text-tertiary hidden sm:inline">Smart Meal Plans</span>
        </button>

        <button
          onClick={() => router.push('/progress')}
          className="p-3 sm:p-4 rounded-lg bg-surface-elevated border border-border-subtle hover:border-primary/40 transition-colors flex flex-col items-center text-center gap-1.5 focus-visible:outline-none touch-target"
        >
          <span className="text-xl">📈</span>
          <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
            Evolve
          </span>
          <span className="text-[10px] text-text-tertiary hidden sm:inline">7d Weight & PRs</span>
        </button>
      </div>

      {/* Motivational Creed */}
      <MotivationalQuote category="discipline" variant="banner" />

      {/* 3. Daily Nutrition & Fuel Progress */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Calorie Ring Card */}
        <Card variant="default" className="md:col-span-5 flex flex-col items-center justify-center p-6 text-center">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-text-tertiary mb-3">
            DAILY CALORIES • {athlete.dailyCalories.remaining >= 0 ? `${athlete.dailyCalories.remaining} KCAL LEFT` : `${Math.abs(athlete.dailyCalories.remaining)} KCAL OVER`}
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
            + Log Food Intake &rarr;
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
          subtitle="Programmed routine for progressive overload"
          actionElement={
            <Link href="/workouts" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">
              All Routines &rarr;
            </Link>
          }
        />
        {athlete.todayWorkout ? (
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
        ) : (
          <EmptyState
            title="No Workout Scheduled Today"
            description="Take a strategic rest day or start a routine from your workout library."
            actionLabel="Browse Workout Routines"
            onAction={() => router.push('/workouts')}
          />
        )}
      </div>

      {/* 5. Recent PR Achievements */}
      {athlete.recentPRs && athlete.recentPRs.length > 0 && (
        <div className="flex flex-col gap-2">
          <SectionHeader
            title="Recent PR Achievements"
            subtitle="Personal records shattered in training"
            actionElement={
              <Link href="/progress" className="text-xs font-bold text-text-tertiary hover:text-text-primary uppercase">
                View All PRs &rarr;
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
