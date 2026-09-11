'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar } from '../ui/Avatar';

export interface AppHeaderProps {
  athleteName?: string;
  avatarUrl?: string;
  currentStreak?: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  athleteName = 'Athlete',
  avatarUrl,
  currentStreak = 7,
}) => {
  const pathname = usePathname();

  // Don't render authenticated app header on login screen
  if (pathname === '/login') return null;

  return (
    <header className="sticky top-0 z-40 w-full bg-background-deep/90 backdrop-blur-md border-b border-border-subtle pt-safe">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand Logo & Slogan */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group focus-visible:outline-none">
          <div className="w-7 h-7 rounded-sm bg-primary flex items-center justify-center text-background-deep font-black text-sm tracking-tighter shadow-glow-primary group-hover:scale-105 transition-transform">
            X
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-black tracking-wider text-text-primary uppercase font-display leading-tight">
              XEVYRA
            </span>
            <span className="hidden sm:inline-block text-[9px] font-extrabold tracking-widest text-text-tertiary uppercase -mt-0.5">
              TRAIN • FUEL • EVOLVE
            </span>
          </div>
        </Link>

        {/* Header Right: Streak & Profile */}
        <div className="flex items-center gap-3">
          {/* Consistency Streak */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-surface-elevated border border-border-subtle text-xs font-bold">
            <span className="text-feedback-warning">🔥</span>
            <span className="text-text-primary">{currentStreak}</span>
            <span className="hidden sm:inline text-text-tertiary uppercase text-[10px]">DAYS</span>
          </div>

          {/* Profile Quick Link */}
          <Link
            href="/profile"
            className="flex items-center gap-2 focus-visible:outline-none rounded-full p-0.5"
            aria-label="View Athlete Profile"
          >
            <Avatar name={athleteName} src={avatarUrl} size="sm" status="online" />
          </Link>
        </div>
      </div>
    </header>
  );
};
