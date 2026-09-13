'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageContainer } from '@/components/navigation/PageContainer';
import { SectionHeader } from '@/components/navigation/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ConfirmationDialog } from '@/components/feedback/ConfirmationDialog';
import { useToast } from '@/components/feedback/Toast';
import { useProfile } from '@/lib/hooks/useProfile';

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { profileData, isLoading, error, refetch, saveProfile } = useProfile();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    displayName: '',
    heightCm: 178,
    currentWeightKg: 78.2,
    weeklyWorkoutTarget: 4,
    trainingExperience: 'ADVANCED' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    preferredCuisine: 'AMERICAN' as 'AMERICAN' | 'NORTH_INDIAN' | 'SOUTH_INDIAN' | 'MEDITERRANEAN' | 'ASIAN',
    activityLevel: 'HEAVY' as 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'HEAVY' | 'ATHLETE',
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        displayName: profileData.user.displayName || 'Athlete',
        heightCm: profileData.profile.heightCm || 178,
        currentWeightKg: 78.2,
        weeklyWorkoutTarget: profileData.profile.weeklyWorkoutTarget || 4,
        trainingExperience: profileData.profile.trainingExperience || 'ADVANCED',
        preferredCuisine: profileData.profile.preferredCuisine || 'AMERICAN',
        activityLevel: profileData.profile.activityLevel || 'HEAVY',
      });
    }
  }, [profileData]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await saveProfile({
        displayName: formData.displayName,
        heightCm: formData.heightCm,
        currentWeightKg: formData.currentWeightKg,
        weeklyWorkoutTarget: formData.weeklyWorkoutTarget,
        preferredCuisine: formData.preferredCuisine,
        activityLevel: formData.activityLevel,
      });

      showToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Athlete biometric parameters synchronized with server.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err?.message || 'Could not update profile.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('xevyra_auth_token');
    }
    showToast({
      type: 'info',
      title: 'Signed Out',
      message: 'Securely logged out from XEVYRA session.',
    });
    router.push('/login');
  };

  if (isLoading) {
    return (
      <PageContainer maxWidth="xl" className="flex flex-col gap-6">
        <Skeleton height={140} className="rounded-lg" />
        <Skeleton height={260} className="rounded-lg" />
      </PageContainer>
    );
  }

  if (error && !profileData) {
    return (
      <PageContainer maxWidth="xl" className="flex flex-col gap-6">
        <ErrorState
          title="Profile Unavailable"
          message={error}
          onRetry={refetch}
        />
      </PageContainer>
    );
  }

  const user = profileData?.user;

  return (
    <PageContainer maxWidth="xl" className="flex flex-col gap-6">
      {/* 1. Athlete Header Card */}
      <Card variant="elevated" className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 border-border-light">
        <Avatar name={formData.displayName} size="xl" status="online" />
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-text-primary tracking-tight uppercase font-display">
              {formData.displayName}
            </h1>
            <Badge variant="primary" size="sm">
              {user?.role || 'PRO ATHLETE'}
            </Badge>
          </div>
          <span className="text-xs text-text-tertiary">{user?.email || 'athlete@xevyra.fit'}</span>
          <p className="text-xs text-text-secondary mt-2">
            Targeting progressive athletic overload with weight-based macronutrient precision.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => setIsLogoutModalOpen(true)}>
          Sign Out
        </Button>
      </Card>

      {/* 2. Biometric & Training Parameters */}
      <div className="flex flex-col gap-3">
        <SectionHeader
          title="Biometrics & Strategy"
          subtitle="Configure physical markers, activity tier, and nutrition cuisine"
        />

        <Card variant="default" className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Athlete Display Name"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            />

            <Input
              label="Height (cm)"
              type="number"
              value={formData.heightCm}
              onChange={(e) => setFormData({ ...formData, heightCm: parseInt(e.target.value, 10) || 0 })}
            />

            <Input
              label="Current Bodyweight (kg)"
              type="number"
              step="0.1"
              value={formData.currentWeightKg}
              onChange={(e) => setFormData({ ...formData, currentWeightKg: parseFloat(e.target.value) || 0 })}
            />

            <Input
              label="Weekly Workouts Target"
              type="number"
              value={formData.weeklyWorkoutTarget}
              onChange={(e) => setFormData({ ...formData, weeklyWorkoutTarget: parseInt(e.target.value, 10) || 4 })}
            />

            <Select
              label="Activity Multiplier Tier"
              value={formData.activityLevel}
              onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as any })}
              options={[
                { value: 'SEDENTARY', label: 'Sedentary (Desk Job)' },
                { value: 'LIGHT', label: 'Lightly Active (1-3 days/wk)' },
                { value: 'MODERATE', label: 'Moderately Active (3-5 days/wk)' },
                { value: 'HEAVY', label: 'Heavy Training (6-7 days/wk)' },
                { value: 'ATHLETE', label: 'Competitive Athlete (2x / day)' },
              ]}
            />

            <Select
              label="Cuisine Preference"
              value={formData.preferredCuisine}
              onChange={(e) => setFormData({ ...formData, preferredCuisine: e.target.value as any })}
              options={[
                { value: 'AMERICAN', label: '🇺🇸 American / Western' },
                { value: 'SOUTH_INDIAN', label: '🥥 South Indian Fitness' },
                { value: 'NORTH_INDIAN', label: '🫓 North Indian / Desi' },
                { value: 'MEDITERRANEAN', label: '🫒 Mediterranean Athletic' },
                { value: 'ASIAN', label: '🥢 Asian / East Asian' },
              ]}
            />
          </div>

          <div className="pt-3 border-t border-border-subtle flex justify-end">
            <Button
              variant="primary"
              size="md"
              isLoading={isSaving}
              onClick={handleSaveProfile}
            >
              Save Profile Changes ⚡
            </Button>
          </div>
        </Card>
      </div>

      {/* 3. Developer Diagnostics Separator */}
      <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle">
        <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
          Developer & Diagnostics Access
        </span>
        <div className="p-3.5 rounded-md bg-surface border border-border-subtle flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-text-primary block">
              System Diagnostics & Telemetry
            </span>
            <span className="text-[11px] text-text-tertiary">
              Internal environment status, collection registries, and bridge debugging
            </span>
          </div>
          <Link
            href="/dev/diagnostics"
            className="text-xs font-bold text-text-tertiary hover:text-primary uppercase"
          >
            Diagnostics &rarr;
          </Link>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isLogoutModalOpen}
        title="Sign Out from XEVYRA"
        description="Are you sure you want to end your current session? All offline logs are stored locally and will synchronize upon next login."
        confirmLabel="Sign Out"
        cancelLabel="Stay Logged In"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </PageContainer>
  );
}
