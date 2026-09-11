'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/navigation/PageContainer';
import { SectionHeader } from '@/components/navigation/SectionHeader';
import { ProgressMetricCard } from '@/components/progress/ProgressMetricCard';
import { WeightTrendCard } from '@/components/progress/WeightTrendCard';
import { StrengthTrendCard, VolumeCard } from '@/components/progress/StrengthTrendCard';
import { PRCard } from '@/components/progress/PRCard';
import { Tabs } from '@/components/ui/Tabs';

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState('BODY_METRICS'); // BODY_METRICS | STRENGTH | RECORDS

  // Mock progress analytics
  const weightDataPoints = [
    { label: 'Day 1', value: 78.8 },
    { label: 'Day 2', value: 78.6 },
    { label: 'Day 3', value: 78.5 },
    { label: 'Day 4', value: 78.7 },
    { label: 'Day 5', value: 78.4 },
    { label: 'Day 6', value: 78.3 },
    { label: 'Day 7', value: 78.2 },
  ];

  const benchStrengthPoints = [
    { label: 'Week 1', value: 100 },
    { label: 'Week 2', value: 102.5 },
    { label: 'Week 3', value: 102.5 },
    { label: 'Week 4', value: 107.5 },
  ];

  const volumeDailyData = [
    { label: 'Mon', value: 8400 },
    { label: 'Tue', value: 7200 },
    { label: 'Wed', value: 0 },
    { label: 'Thu', value: 9100 },
    { label: 'Fri', value: 8800 },
    { label: 'Sat', value: 6500 },
    { label: 'Sun', value: 0 },
  ];

  const prsList = [
    {
      exerciseName: 'Incline Dumbbell Press',
      category: 'Chest',
      weight: 38,
      reps: 6,
      estimatedOneRepMax: 44,
      achievedDate: 'Today',
    },
    {
      exerciseName: 'Barbell Back Squat',
      category: 'Legs',
      weight: 140,
      reps: 5,
      estimatedOneRepMax: 162,
      achievedDate: '3 days ago',
    },
    {
      exerciseName: 'Weighted Pull-Up',
      category: 'Back',
      weight: 25,
      reps: 6,
      estimatedOneRepMax: 30,
      achievedDate: '1 week ago',
    },
  ];

  return (
    <PageContainer maxWidth="xl" className="flex flex-col gap-6">
      {/* 1. Header */}
      <SectionHeader
        title="Athlete Progression"
        subtitle="Tracking body composition, strength curves, and volume overload"
      />

      {/* 2. Top Key Stat Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ProgressMetricCard
          label="Bodyweight"
          value="78.2"
          unit="kg"
          deltaText="-0.6 kg (7d)"
          deltaType="positive"
        />
        <ProgressMetricCard
          label="Calorie Target"
          value="2,400"
          unit="kcal"
          deltaText="Deficit Mode"
          deltaType="neutral"
        />
        <ProgressMetricCard
          label="Weekly Volume"
          value="40.0"
          unit="tonnes"
          deltaText="+8% Overload"
          deltaType="positive"
        />
        <ProgressMetricCard
          label="Smashed PRs"
          value="3"
          unit="this month"
          deltaText="On Track"
          deltaType="positive"
        />
      </div>

      {/* 3. Navigation Tabs */}
      <Tabs
        tabs={[
          { id: 'BODY_METRICS', label: 'Bodyweight & Fat' },
          { id: 'STRENGTH', label: 'Strength & Volume' },
          { id: 'RECORDS', label: 'PR Trophies' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        size="sm"
      />

      {/* Tab Content */}
      {activeTab === 'BODY_METRICS' && (
        <div className="flex flex-col gap-4">
          <WeightTrendCard
            currentWeightKg={78.2}
            startingWeightKg={80.5}
            sevenDayChangeKg={-0.6}
            dataPoints={weightDataPoints}
          />
        </div>
      )}

      {activeTab === 'STRENGTH' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StrengthTrendCard
            exerciseName="Barbell Flat Bench Press"
            currentOneRepMax={107.5}
            deltaPercent={7.5}
            dataPoints={benchStrengthPoints}
          />
          <VolumeCard
            weeklyVolumeTons={40000}
            deltaPercent={8}
            dailyData={volumeDailyData}
          />
        </div>
      )}

      {activeTab === 'RECORDS' && (
        <div className="flex flex-col gap-3">
          {prsList.map((pr, i) => (
            <PRCard
              key={i}
              exerciseName={pr.exerciseName}
              category={pr.category}
              weight={pr.weight}
              reps={pr.reps}
              estimatedOneRepMax={pr.estimatedOneRepMax}
              achievedDate={pr.achievedDate}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
