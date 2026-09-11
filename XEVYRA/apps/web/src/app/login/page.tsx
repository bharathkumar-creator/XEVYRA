'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Dumbbell, Apple, TrendingUp, Zap, Mail, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/brand/logo';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    // In Phase 2 this triggers Firebase Google Auth. For foundation demo, redirect to dashboard.
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 600);
  };

  const handleEmailSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 600);
  };

  return (
    <div className="relative min-h-screen min-h-[100dvh] w-full flex flex-col justify-between overflow-hidden bg-[#090D16]">
      {/* Background Image with Dark Vignette & Gradient Overlays */}
      <div className="absolute inset-0 z-0 select-none">
        <Image
          src="/images/hero-athlete.jpg"
          alt="XEVYRA Athlete Training"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top sm:object-center opacity-40 sm:opacity-50"
        />
        {/* Gradients to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/75 to-[#090D16]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090D16]/90 via-[#090D16]/40 to-transparent" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col justify-between">
        {/* Top Header */}
        <header className="flex items-center justify-between">
          <Logo size="lg" />
          <div className="text-right hidden sm:block">
            <span className="text-[10px] tracking-[0.2em] font-semibold text-text-secondary uppercase">
              Stronger · Healthier · Happier You
            </span>
          </div>
        </header>

        {/* Center Hero & Value Proposition */}
        <div className="my-auto py-8 sm:py-12 max-w-xl">
          {/* Main Tagline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight leading-[1.1]">
            Track Harder.
            <br />
            Eat Smarter.
            <br />
            Break <span className="text-brand">Plateaus.</span>
          </h1>

          {/* Subtext */}
          <p className="mt-4 text-sm sm:text-base text-text-secondary leading-relaxed max-w-md">
            Your AI-powered fitness companion for workouts, nutrition, and a
            stronger tomorrow.
          </p>

          {/* 4 Feature Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-8">
            <div className="bg-surface/80 backdrop-blur-md border border-border/80 rounded-xl p-3 flex flex-col items-center text-center">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-brand mb-1.5">
                <Dumbbell className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-white">Workouts</span>
              <span className="text-[10px] text-text-muted mt-0.5">
                Plan. Log. Progress.
              </span>
            </div>

            <div className="bg-surface/80 backdrop-blur-md border border-border/80 rounded-xl p-3 flex flex-col items-center text-center">
              <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mb-1.5">
                <Apple className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-white">Nutrition</span>
              <span className="text-[10px] text-text-muted mt-0.5">
                Track. Fuel. Balance.
              </span>
            </div>

            <div className="bg-surface/80 backdrop-blur-md border border-border/80 rounded-xl p-3 flex flex-col items-center text-center">
              <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400 mb-1.5">
                <TrendingUp className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-white">Insights</span>
              <span className="text-[10px] text-text-muted mt-0.5">
                Data-driven progress.
              </span>
            </div>

            <div className="bg-surface/80 backdrop-blur-md border border-border/80 rounded-xl p-3 flex flex-col items-center text-center">
              <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mb-1.5">
                <Zap className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-white">AI Coach</span>
              <span className="text-[10px] text-text-muted mt-0.5">
                Personalized guidance.
              </span>
            </div>
          </div>
        </div>

        {/* Auth CTA Area */}
        <div className="w-full max-w-md mx-auto sm:mx-0 space-y-3 pb-4">
          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white hover:bg-neutral-100 text-neutral-900 font-bold py-3.5 px-5 rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-lg shadow-white/10 touch-target"
          >
            {/* Google Icon SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="text-sm font-semibold tracking-wide">
              {isLoading ? 'Connecting...' : 'Continue with Google'}
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-border/80" />
            <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium">
              or
            </span>
            <div className="flex-1 h-px bg-border/80" />
          </div>

          {/* Email Sign In */}
          <button
            type="button"
            onClick={handleEmailSignIn}
            disabled={isLoading}
            className="w-full bg-surface-card/90 hover:bg-surface-elevated text-white font-medium py-3.5 px-5 rounded-2xl border border-border/80 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.98] touch-target"
          >
            <Mail className="w-4 h-4 text-text-secondary" />
            <span className="text-sm font-medium">Continue with Email</span>
          </button>

          {/* Terms & Privacy */}
          <p className="text-center text-[11px] text-text-muted pt-2 leading-normal">
            By continuing, you agree to our{' '}
            <Link href="#" className="text-text-secondary hover:text-white underline underline-offset-2">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="#" className="text-text-secondary hover:text-white underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-border/40 pt-4 mt-2">
          <span className="text-[11px] font-bold tracking-widest text-text-muted">
            XE<span className="text-brand">VY</span>RA
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
            Built for a better you
          </span>
        </footer>
      </div>
    </div>
  );
}
