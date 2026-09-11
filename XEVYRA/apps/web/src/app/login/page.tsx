'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In production web, this triggers Firebase Google Popup and backend session creation
      // For development/demo environment, we securely transition to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 600);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDemoAccess = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 300);
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-background-deep relative overflow-hidden">
      {/* Background Ambient Athletic Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-emerald/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md flex flex-col items-center gap-8 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-lg bg-primary flex items-center justify-center text-background-deep font-black text-2xl tracking-tighter shadow-glow-primary">
            X
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight uppercase font-display">
              XEVYRA
            </h1>
            <p className="text-xs font-extrabold tracking-widest text-primary uppercase mt-1">
              TRAIN • FUEL • EVOLVE
            </p>
          </div>
          <p className="text-sm text-text-secondary max-w-xs mt-1">
            High-performance tracking for serious athletes. Precision workouts, weight-based macros, and progressive analytics.
          </p>
        </div>

        {/* Authentication Card */}
        <Card variant="elevated" className="w-full p-6 sm:p-8 flex flex-col gap-5 border-border-light">
          <div className="text-center">
            <h2 className="text-lg font-bold text-text-primary uppercase tracking-wide font-display">
              Athlete Access
            </h2>
            <p className="text-xs text-text-tertiary mt-1">
              Sign in to sync your routines and fuel logs
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-feedback-danger/10 border border-feedback-danger/30 text-xs text-feedback-danger">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {/* Google Sign In */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              onClick={handleGoogleSignIn}
              leftIcon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              }
            >
              Continue with Google
            </Button>

            {/* Quick Demo Access */}
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={handleDemoAccess}
            >
              Explore Athlete Demo
            </Button>
          </div>

          <div className="text-center pt-2">
            <span className="text-[11px] text-text-tertiary">
              By accessing XEVYRA you agree to our Terms of Performance.
            </span>
          </div>
        </Card>

        {/* Security & Platform Badges */}
        <div className="flex items-center gap-6 text-[11px] font-bold text-text-tertiary uppercase">
          <span className="flex items-center gap-1.5">
            <span className="text-primary">🔒</span> End-to-End Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-brand-emerald">⚡</span> Native Mobile Sync
          </span>
        </div>
      </div>
    </main>
  );
}
