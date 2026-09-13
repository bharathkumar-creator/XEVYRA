'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/navigation/PageContainer';
import { SectionHeader } from '@/components/navigation/SectionHeader';
import { ProgressMetricCard } from '@/components/progress/ProgressMetricCard';
import { WeightTrendCard } from '@/components/progress/WeightTrendCard';
import { StrengthTrendCard, VolumeCard } from '@/components/progress/StrengthTrendCard';
import { PRCard } from '@/components/progress/PRCard';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { MotivationalQuote } from '@/components/ui/MotivationalQuote';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useToast } from '@/components/feedback/Toast';
import { useProgress } from '@/lib/hooks/useProgress';

export default function ProgressPage() {
  const { showToast } = useToast();
  const { progress, isLoading, error, refetch, recordWeight } = useProgress();

  const [activeTab, setActiveTab] = useState<'BODY_METRICS' | 'STRENGTH' | 'RECORDS'>('BODY_METRICS');
  const [isLogWeightOpen, setIsLogWeightOpen] = useState(false);
  const [weightInput, setWeightInput] = useState<string>('');
  const [isSavingWeight, setIsSavingWeight] = useState(false);

  const handleSaveWeight = async () => {
    const val = parseFloat(weightInput);
    if (!val || val < 30 || val > 300) {
      showToast({
        type: 'error',
        title: 'Invalid Weight',
        message: 'Please enter a valid bodyweight between 30 and 300 kg.',
      });
      return;
    }

    setIsSavingWeight(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await recordWeight({
        dateString: today,
        weightKg: val,
      });

      showToast({
        type: 'success',
        title: 'Weigh-In Saved',
        message: `Logged ${val} kg for ${today}. Progressive trend updated.`,
      });
      setIsLogWeightOpen(false);
      setWeightInput('');
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err?.message || 'Could not save bodyweight log.',
      });
    } finally {
      setIsSavingWeight(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer maxWidth="xl" className="flex flex-col gap-6">
        <Skeleton height={36} width="40%" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Skeleton height={100} className="rounded-lg" />
          <Skeleton height={100} className="rounded-lg" />
          <Skeleton height={100} className="rounded-lg" />
          <Skeleton height={100} className="rounded-lg" />
        </div>
        <Skeleton height={240} className="rounded-lg" />
      </PageContainer>
    );
  }

  if (error && !progress) {
    return (
      <PageContainer maxWidth="xl" className="flex flex-col gap-6">
        <ErrorState
          title="Progress Analytics Unavailable"
          message={error}
          onRetry={refetch}
        />
      </PageContainer>
    );
  }

  const currentWeight = progress?.currentWeightKg || 78.2;
  const sevenDayChange = progress?.sevenDayChangeKg || 0;
  const weightDataPoints = progress?.weightHistory && progress.weightHistory.length > 0
    ? progress.weightHistory
    : [
        { label: 'Day 1', value: currentWeight + 0.4 },
        { label: 'Day 2', value: currentWeight + 0.3 },
        { label: 'Day 3', value: currentWeight + 0.2 },
        { label: 'Day 4', value: currentWeight + 0.3 },
        { label: 'Day 5', value: currentWeight + 0.1 },
        { label: 'Day 6', value: currentWeight },
        { label: 'Day 7', value: currentWeight },
      ];

  const volumeDailyData = progress?.volumeHistory && progress.volumeHistory.length > 0
    ? progress.volumeHistory
    : [
        { label: 'Mon', value: 8400 },
        { label: 'Tue', value: 7200 },
        { label: 'Wed', value: 0 },
        { label: 'Thu', value: 9100 },
        { label: 'Fri', value: 8800 },
        { label: 'Sat', value: 6500 },
        { label: 'Sun', value: 0 },
      ];

  const prsList = progress?.topRecords || [];

  return (
    <PageContainer maxWidth="xl" className="flex flex-col gap-6">
      {/* 1. Header & Log Weight CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SectionHeader
          title="Athlete Progression"
          subtitle="Tracking body composition, strength curves, and progressive overload"
        />
        <Button variant="primary" size="sm" onClick={() => setIsLogWeightOpen(true)}>
          ⚖️ Log Morning Weigh-In
        </Button>
      </div>

      {/* 2. Top Key Stat Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ProgressMetricCard
          label="Current Weight"
          value={currentWeight.toFixed(1)}
          unit="kg"
          deltaText={`${sevenDayChange >= 0 ? '+' : ''}${sevenDayChange.toFixed(1)} kg (7d)`}
          deltaType={sevenDayChange <= 0 ? 'positive' : 'neutral'}
        />
        <ProgressMetricCard
          label="Weekly Volume"
          value={(progress?.weeklyVolumeTonnes || 40).toFixed(1)}
          unit="tonnes"
          deltaText="Progressive Overload"
          deltaType="positive"
        />
        <ProgressMetricCard
          label="PRs Smashed"
          value={String(progress?.prsSmashedCount || prsList.length || 0)}
          unit="records"
          deltaText="All Time"
          deltaType="positive"
        />
        <ProgressMetricCard
          label="Trend Status"
          value="ON TRACK"
          unit=""
          deltaText="High Consistency"
          deltaType="positive"
        />
      </div>

      {/* Mindset Banner */}
      <MotivationalQuote category="progress" variant="banner" />

      {/* 3. Navigation Tabs */}
      <Tabs
        tabs={[
          { id: 'BODY_METRICS', label: 'Bodyweight Trend' },
          { id: 'STRENGTH', label: 'Volume & Overload' },
          { id: 'RECORDS', label: 'PR Trophies' },
        ]}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as any)}
        size="sm"
      />

      {/* 4. Tab Contents */}
      {activeTab === 'BODY_METRICS' && (
        <div className="flex flex-col gap-4">
          <WeightTrendCard
            currentWeightKg={currentWeight}
            startingWeightKg={currentWeight + (sevenDayChange * 2)}
            sevenDayChangeKg={sevenDayChange}
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
            dataPoints={[
              { label: 'W1', value: 100 },
              { label: 'W2', value: 102.5 },
              { label: 'W3', value: 105 },
              { label: 'W4', value: 107.5 },
            ]}
          />
          <VolumeCard
            weeklyVolumeTons={(progress?.weeklyVolumeTonnes || 40) * 1000}
            deltaPercent={8}
            dailyData={volumeDailyData}
          />
        </div>
      )}

      {activeTab === 'RECORDS' && (
        <div className="flex flex-col gap-3">
          {prsList.length > 0 ? (
            prsList.map((pr, i) => (
              <PRCard
                key={pr.id || i}
                exerciseName={pr.exerciseName}
                category={pr.category}
                weight={pr.bestWeightKg}
                reps={pr.bestReps}
                estimatedOneRepMax={pr.estimated1RM}
                achievedDate={new Date(pr.achievedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              />
            ))
          ) : (
            <EmptyState
              title="No Personal Records Yet"
              description="Complete workout sessions in the gym to automatically detect and log new PR achievements."
            />
          )}
        </div>
      )}

      {/* Log Bodyweight Modal */}
      {isLogWeightOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-deep/80 backdrop-blur-sm">
          <Card variant="elevated" className="max-w-sm w-full p-6 flex flex-col gap-4 border-border-light">
            <h3 className="text-base font-bold text-text-primary uppercase font-display">
              Log Morning Weigh-In
            </h3>
            <p className="text-xs text-text-secondary">
              Record your bodyweight upon waking for high-precision metabolic tracking.
            </p>

            <Input
              label="Bodyweight (kg)"
              type="number"
              step="0.1"
              placeholder="e.g. 74.8"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              autoFocus
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setIsLogWeightOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isSavingWeight}
                onClick={handleSaveWeight}
              >
                Save Weight
              </Button>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
