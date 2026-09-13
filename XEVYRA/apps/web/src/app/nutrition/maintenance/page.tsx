'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/navigation/PageContainer';
import { SectionHeader } from '@/components/navigation/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useToast } from '@/components/feedback/Toast';
import { useMaintenance } from '@/lib/hooks/useMaintenance';
import { MaintenanceDataConfidenceDto } from '@xevyra/contracts';

const confidenceTierCopy: Record<MaintenanceDataConfidenceDto, { label: string; description: string; badgeVariant: 'warning' | 'primary' | 'success' }> = {
  INSUFFICIENT: {
    label: 'Insufficient Data',
    description: 'Log at least 3-7 days of daily nutrition and morning weigh-ins to begin detecting your energy balance.',
    badgeVariant: 'warning',
  },
  PRELIMINARY: {
    label: 'Preliminary Signal',
    description: "We're beginning to detect your energy balance. Continue logging to refine the estimate.",
    badgeVariant: 'warning',
  },
  INITIAL: {
    label: 'Initial Estimate',
    description: 'Your first meaningful maintenance calorie estimate is calculated from 7+ days of consistent tracking.',
    badgeVariant: 'primary',
  },
  MORE_RELIABLE: {
    label: 'Reliable Trend',
    description: 'Your energy balance estimate is highly reliable based on 14+ days of logged metabolic data.',
    badgeVariant: 'success',
  },
  STRONGER_TREND: {
    label: 'Strong Multi-Week Trend',
    description: 'Long-term 28+ day caloric intake and bodyweight trend provides high-precision baseline accuracy.',
    badgeVariant: 'success',
  },
};

export default function MaintenancePage() {
  const { showToast } = useToast();
  const { analysis, isLoading, error, refetch } = useMaintenance();
  const [selectedGoal, setSelectedGoal] = useState<'DEFICIT' | 'MAINTENANCE' | 'SURPLUS'>('DEFICIT');
  const [calorieOffset, setCalorieOffset] = useState<number>(-300);

  if (isLoading) {
    return (
      <PageContainer maxWidth="xl" className="flex flex-col gap-6">
        <Skeleton height={40} width="50%" />
        <Skeleton height={200} className="rounded-lg" />
        <Skeleton height={150} className="rounded-lg" />
      </PageContainer>
    );
  }

  if (error || !analysis) {
    return (
      <PageContainer maxWidth="xl" className="flex flex-col gap-6">
        <ErrorState
          title="Maintenance Analysis Unavailable"
          message={error || 'Failed to compute energy balance data.'}
          onRetry={refetch}
        />
      </PageContainer>
    );
  }

  const confidence = confidenceTierCopy[analysis.confidence] || confidenceTierCopy.INITIAL;
  const maintenance = analysis.estimatedMaintenanceCalories || 2500;
  const calculatedTarget = Math.max(1200, maintenance + calorieOffset);

  const handleApplyGoal = () => {
    showToast({
      type: 'success',
      title: 'Goal Target Updated',
      message: `${selectedGoal} target applied at ${calculatedTarget.toLocaleString()} kcal/day.`,
    });
  };

  return (
    <PageContainer maxWidth="xl" className="flex flex-col gap-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SectionHeader
          title="Maintenance Calorie Engine"
          subtitle="Adaptive energy balance analysis derived from logged intake and weight trend"
        />
        <Link href="/nutrition">
          <Button variant="secondary" size="sm">
            &larr; Back to Fuel
          </Button>
        </Link>
      </div>

      {/* 2. Main Estimated Maintenance Hero Card */}
      <Card variant="elevated" className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-border-light">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
              Calculated Energy Expenditure
            </span>
            <Badge variant={confidence.badgeVariant} size="sm">
              {confidence.label}
            </Badge>
          </div>

          <div className="flex items-baseline justify-center md:justify-start gap-2 mt-1">
            <span className="text-4xl sm:text-5xl font-black text-text-primary tracking-tight font-display">
              {maintenance.toLocaleString()}
            </span>
            <span className="text-base sm:text-lg font-bold text-primary uppercase">
              kcal / day
            </span>
          </div>

          <p className="text-xs sm:text-sm text-text-secondary max-w-md mt-1 leading-relaxed">
            {confidence.description}
          </p>
        </div>

        {/* Metabolic Analytics Meta */}
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto min-w-[240px]">
          <div className="p-3 rounded-md bg-surface border border-border-subtle text-center">
            <span className="text-[10px] font-bold text-text-tertiary uppercase block">
              Days Analyzed
            </span>
            <span className="text-lg font-black text-text-primary font-display">
              {analysis.daysAnalyzed} Days
            </span>
          </div>

          <div className="p-3 rounded-md bg-surface border border-border-subtle text-center">
            <span className="text-[10px] font-bold text-text-tertiary uppercase block">
              Avg Daily Intake
            </span>
            <span className="text-lg font-black text-primary font-display">
              {Math.round(analysis.averageDailyCalories).toLocaleString()} kcal
            </span>
          </div>

          <div className="col-span-2 p-3 rounded-md bg-surface border border-border-subtle text-center">
            <span className="text-[10px] font-bold text-text-tertiary uppercase block">
              Weight Trend
            </span>
            <span className="text-xs font-bold text-text-secondary">
              {analysis.weightTrendDescription || 'Maintaining stable mass'}
            </span>
          </div>
        </div>
      </Card>

      {/* 3. Goal Adjustment Cockpit */}
      <div className="flex flex-col gap-4">
        <SectionHeader
          title="Caloric Goal Adjustment"
          subtitle="Configure your target energy balance deficit, maintenance, or surplus"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Deficit Option */}
          <button
            onClick={() => {
              setSelectedGoal('DEFICIT');
              setCalorieOffset(-400);
            }}
            className={`p-5 rounded-lg text-left flex flex-col justify-between transition-all ${
              selectedGoal === 'DEFICIT'
                ? 'bg-surface-elevated border-2 border-primary shadow-glow-primary'
                : 'bg-surface border border-border-subtle hover:border-border-light'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">🔥</span>
                <Badge variant="primary" size="sm">
                  FAT LOSS
                </Badge>
              </div>
              <h3 className="text-base font-bold text-text-primary uppercase font-display">
                Caloric Deficit
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Optimized for body fat loss while protecting lean athletic muscle mass.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-baseline justify-between">
              <span className="text-xs text-text-tertiary uppercase font-bold">Offset</span>
              <span className="text-sm font-black text-primary">-400 kcal</span>
            </div>
          </button>

          {/* Maintenance Option */}
          <button
            onClick={() => {
              setSelectedGoal('MAINTENANCE');
              setCalorieOffset(0);
            }}
            className={`p-5 rounded-lg text-left flex flex-col justify-between transition-all ${
              selectedGoal === 'MAINTENANCE'
                ? 'bg-surface-elevated border-2 border-primary shadow-glow-primary'
                : 'bg-surface border border-border-subtle hover:border-border-light'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">⚖️</span>
                <Badge variant="neutral" size="sm">
                  BALANCE
                </Badge>
              </div>
              <h3 className="text-base font-bold text-text-primary uppercase font-display">
                Maintenance
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Body recomposition, athletic stamina, and stable bodyweight preservation.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-baseline justify-between">
              <span className="text-xs text-text-tertiary uppercase font-bold">Offset</span>
              <span className="text-sm font-black text-text-primary">0 kcal</span>
            </div>
          </button>

          {/* Surplus Option */}
          <button
            onClick={() => {
              setSelectedGoal('SURPLUS');
              setCalorieOffset(300);
            }}
            className={`p-5 rounded-lg text-left flex flex-col justify-between transition-all ${
              selectedGoal === 'SURPLUS'
                ? 'bg-surface-elevated border-2 border-primary shadow-glow-primary'
                : 'bg-surface border border-border-subtle hover:border-border-light'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">💪</span>
                <Badge variant="success" size="sm">
                  MUSCLE GAIN
                </Badge>
              </div>
              <h3 className="text-base font-bold text-text-primary uppercase font-display">
                Lean Surplus
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Controlled hyper-caloric nutrition to maximize strength overload & hypertrophy.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-baseline justify-between">
              <span className="text-xs text-text-tertiary uppercase font-bold">Offset</span>
              <span className="text-sm font-black text-feedback-success">+300 kcal</span>
            </div>
          </button>
        </div>

        {/* Target Confirmation Bar */}
        <Card variant="default" className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black">
              🎯
            </div>
            <div>
              <span className="text-xs text-text-tertiary uppercase font-bold block">
                Recommended Daily Target ({selectedGoal})
              </span>
              <span className="text-2xl font-black text-text-primary tracking-tight font-display">
                {calculatedTarget.toLocaleString()} kcal / day
              </span>
            </div>
          </div>

          <Button variant="primary" size="md" onClick={handleApplyGoal}>
            Apply Daily Target ⚡
          </Button>
        </Card>
      </div>
    </PageContainer>
  );
}
