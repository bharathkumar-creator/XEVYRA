'use client';

import React, { useState } from 'react';
import { TopHeader } from '@/components/navigation/top-header';
import { CalorieProgress } from '@/components/dashboard/calorie-progress';
import { MacroProgressCard } from '@/components/dashboard/macro-progress-card';
import { WeightTrendCard } from '@/components/dashboard/weight-trend-card';
import { TrainingStreakCard } from '@/components/dashboard/training-streak-card';
import { WorkoutPreviewCard } from '@/components/dashboard/workout-preview-card';
import { MealPreviewCard } from '@/components/dashboard/meal-preview-card';
import { INITIAL_DASHBOARD_FIXTURE, AthleteDashboardData } from '@/lib/data/fixtures';

export default function DashboardPage() {
  const [data, setData] = useState<AthleteDashboardData>(INITIAL_DASHBOARD_FIXTURE);
  const [isLoading, setIsLoading] = useState(false);

  const handlePrevDate = () => {
    // In full implementation, fetches data for previous day
    console.log('Navigate to previous day');
  };

  const handleNextDate = () => {
    console.log('Navigate to next day');
  };

  const handleStartWorkout = (workoutId: string) => {
    window.location.href = `/workouts?active=${workoutId}`;
  };

  const handleLogMeal = () => {
    window.location.href = '/nutrition?action=log';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] pb-24 md:pb-12">
      {/* Top Header */}
      <TopHeader
        displayName={data.user.displayName}
        avatarUrl={data.user.avatarUrl}
        greeting={data.user.greeting}
        motivationalMessage={data.user.motivationalMessage}
        displayDate={data.date.displayDate}
        onPrevDate={handlePrevDate}
        onNextDate={handleNextDate}
      />

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
        {/* Top Grid: Nutrition Overview (Calories + 3 Macros) */}
        <div className="space-y-3 sm:space-y-4">
          {/* Calorie Card */}
          <CalorieProgress
            consumed={data.calories.consumed}
            target={data.calories.target}
            percentage={data.calories.percentage}
            loading={isLoading}
          />

          {/* 3 Macro Cards Grid */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            <MacroProgressCard
              type="protein"
              consumed={data.macros.protein.consumed}
              target={data.macros.protein.target}
              percentage={data.macros.protein.percentage}
              loading={isLoading}
            />
            <MacroProgressCard
              type="carbs"
              consumed={data.macros.carbs.consumed}
              target={data.macros.carbs.target}
              percentage={data.macros.carbs.percentage}
              loading={isLoading}
            />
            <MacroProgressCard
              type="fats"
              consumed={data.macros.fats.consumed}
              target={data.macros.fats.target}
              percentage={data.macros.fats.percentage}
              loading={isLoading}
            />
          </div>
        </div>

        {/* Middle Grid: Weight Trend + Streak */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <WeightTrendCard
            currentKg={data.weight.currentKg}
            previousWeekDiffKg={data.weight.previousWeekDiffKg}
            weeklyTrend={data.weight.weeklyTrend}
            loading={isLoading}
          />
          <TrainingStreakCard
            days={data.streak.days}
            message={data.streak.message}
            loading={isLoading}
          />
        </div>

        {/* Bottom Grid: Today's Workout & Today's Meals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <WorkoutPreviewCard
            workout={data.todayWorkout}
            loading={isLoading}
            onStart={handleStartWorkout}
          />
          <MealPreviewCard
            meal={data.todayMeal}
            loading={isLoading}
            onLogMeal={handleLogMeal}
          />
        </div>
      </div>
    </div>
  );
}
