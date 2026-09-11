'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Settings, Shield, LogOut, ChevronRight, Scale, Activity, Flame, Cpu } from 'lucide-react';
import { TopHeader } from '@/components/navigation/top-header';

export default function ProfilePage() {
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');

  const handleLogout = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] pb-24 md:pb-12">
      <TopHeader />

      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        {/* User Card */}
        <div className="bg-surface-card border border-border/80 rounded-3xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-brand flex-shrink-0 bg-surface-elevated">
            <Image
              src="/images/athlete-avatar.jpg"
              alt="Bharath"
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-display text-white">Bharath</h1>
                <p className="text-xs text-text-secondary">bharath@xevyra.fit</p>
              </div>
              <span className="inline-flex items-center gap-1 self-center sm:self-start text-[11px] font-bold uppercase tracking-wider text-brand bg-brand/10 border border-brand/20 px-3 py-1 rounded-full">
                PRO ATHLETE
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-border">
              <div className="text-center">
                <span className="text-xs text-text-muted">Weight</span>
                <p className="text-sm font-bold font-display text-white">70.2 kg</p>
              </div>
              <div className="text-center">
                <span className="text-xs text-text-muted">Target</span>
                <p className="text-sm font-bold font-display text-white">2,200 kcal</p>
              </div>
              <div className="text-center">
                <span className="text-xs text-text-muted">Streak</span>
                <p className="text-sm font-bold font-display text-brand">12 Days 🔥</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted px-1">
            Preferences & Settings
          </h2>

          <div className="bg-surface-card border border-border rounded-2xl divide-y divide-border">
            {/* Units Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Scale className="w-4 h-4 text-text-secondary" />
                <span className="text-sm font-medium text-white">Weight Units</span>
              </div>
              <div className="flex bg-surface-elevated rounded-xl p-1 border border-border">
                <button
                  type="button"
                  onClick={() => setUnit('kg')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    unit === 'kg' ? 'bg-brand text-background' : 'text-text-secondary'
                  }`}
                >
                  KG
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('lbs')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    unit === 'lbs' ? 'bg-brand text-background' : 'text-text-secondary'
                  }`}
                >
                  LBS
                </button>
              </div>
            </div>

            {/* Security */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-text-secondary" />
                <span className="text-sm font-medium text-white">Security & Devices</span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </div>

            {/* Developer Diagnostics Link */}
            <Link
              href="/dev/diagnostics"
              className="p-4 flex items-center justify-between hover:bg-surface-elevated/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-sm font-medium text-white">Developer Diagnostics</span>
                  <p className="text-[11px] text-text-muted">MongoDB & API health smoke-test</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>
          </div>
        </div>

        {/* Logout CTA */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full bg-surface-card hover:bg-surface-elevated text-danger font-medium py-3.5 px-4 rounded-2xl border border-red-500/20 hover:border-red-500/40 flex items-center justify-center gap-2 transition-colors touch-target"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
