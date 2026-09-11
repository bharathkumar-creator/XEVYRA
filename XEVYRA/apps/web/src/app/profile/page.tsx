'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageContainer } from '@/components/navigation/PageContainer';
import { SectionHeader } from '@/components/navigation/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { ConfirmationDialog } from '@/components/feedback/ConfirmationDialog';
import { useToast } from '@/components/feedback/Toast';

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [athlete, setAthlete] = useState({
    name: 'Bharath',
    email: 'athlete@xevyra.fit',
    heightCm: 180,
    weightKg: 78.2,
    trainingExperience: 'Advanced (5+ years)',
    weeklyWorkoutsTarget: 4,
    dailyCalorieTarget: 2400,
    maintenanceTDEE: 2650,
    goalMode: 'DEFICIT (Fat Loss)',
  });

  const handleSaveProfile = () => {
    showToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Athlete biometric parameters synchronized.',
    });
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    showToast({
      type: 'info',
      title: 'Signed Out',
      message: 'Securely logged out from XEVYRA session.',
    });
    router.push('/login');
  };

  return (
    <PageContainer maxWidth="xl" className="flex flex-col gap-6">
      {/* 1. Athlete Header Card */}
      <Card variant="elevated" className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 border-border-light">
        <Avatar name={athlete.name} size="xl" status="online" />
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-text-primary tracking-tight uppercase font-display">
              {athlete.name}
            </h1>
            <Badge variant="primary" size="sm">
              PRO ATHLETE
            </Badge>
          </div>
          <span className="text-xs text-text-tertiary">{athlete.email}</span>
          <p className="text-xs text-text-secondary mt-2">
            Targeting lean body recomposition with high-protein hyper-caloric balance.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => setIsLogoutModalOpen(true)}>
          Sign Out
        </Button>
      </Card>

      {/* 2. Biometric & Training Parameters */}
      <div className="flex flex-col gap-3">
        <SectionHeader
          title="Biometrics & Targets"
          subtitle="Configure physical markers and daily caloric targets"
        />

        <Card variant="default" className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Athlete Name"
              value={athlete.name}
              onChange={(e) => setAthlete({ ...athlete, name: e.target.value })}
            />
            <Input
              label="Bodyweight (kg)"
              type="number"
              value={athlete.weightKg}
              onChange={(e) => setAthlete({ ...athlete, weightKg: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Height (cm)"
              type="number"
              value={athlete.heightCm}
              onChange={(e) => setAthlete({ ...athlete, heightCm: parseInt(e.target.value, 10) || 0 })}
            />
            <Input
              label="Daily Target (kcal)"
              type="number"
              value={athlete.dailyCalorieTarget}
              onChange={(e) => setAthlete({ ...athlete, dailyCalorieTarget: parseInt(e.target.value, 10) || 0 })}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="sm" onClick={handleSaveProfile}>
              Save Biometrics
            </Button>
          </div>
        </Card>
      </div>

      {/* 3. System & Native Diagnostics */}
      <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle">
        <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
          System & Mobile Shell
        </span>
        <div className="p-4 rounded-md bg-surface border border-border-subtle flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-text-primary uppercase block">
              Flutter Native Bridge
            </span>
            <span className="text-[11px] text-text-tertiary">
              Active bidirectional communication channel with WebView container
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
