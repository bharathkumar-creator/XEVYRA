'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Calendar, ChevronLeft, ChevronRight, Dumbbell, Apple, BarChart3, Home, User } from 'lucide-react';
import { Logo } from '../brand/logo';

export interface TopHeaderProps {
  displayName?: string;
  avatarUrl?: string;
  displayDate?: string;
  greeting?: string;
  motivationalMessage?: string;
  onPrevDate?: () => void;
  onNextDate?: () => void;
}

const DESKTOP_NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Workouts', href: '/workouts', icon: Dumbbell },
  { label: 'Nutrition', href: '/nutrition', icon: Apple },
  { label: 'Progress', href: '/progress', icon: BarChart3 },
  { label: 'Profile', href: '/profile', icon: User },
];

export function TopHeader({
  displayName = 'Bharath',
  avatarUrl = '/images/athlete-avatar.jpg',
  displayDate = 'Wed, 10 Sep 2026',
  greeting = 'Good morning,',
  motivationalMessage = 'Small steps. Big results. Keep going! 💪',
  onPrevDate,
  onNextDate,
}: TopHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="w-full bg-[#090D16]/90 backdrop-blur-md border-b border-border/60 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Main Row: Logo, Desktop Navigation, and User Avatar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Logo size="md" />

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {DESKTOP_NAV.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'text-brand bg-brand/10 shadow-sm'
                        : 'text-text-secondary hover:text-white hover:bg-surface-elevated'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Info & Avatar */}
          <Link
            href="/profile"
            className="flex items-center gap-3 group text-right cursor-pointer"
          >
            <div className="hidden sm:flex flex-col">
              <span className="text-xs text-text-muted">{greeting}</span>
              <span className="text-sm font-bold text-white group-hover:text-brand transition-colors">
                {displayName}
              </span>
            </div>
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-border group-hover:border-brand transition-colors bg-surface-elevated flex-shrink-0">
              <Image
                src={avatarUrl}
                alt={displayName}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          </Link>
        </div>

        {/* Sub-Header: Motivational tagline & Date Switcher (Only on Dashboard) */}
        {pathname === '/dashboard' && (
          <div className="mt-3 pt-2 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs sm:text-sm text-text-secondary font-medium">
              {motivationalMessage}
            </p>

            {/* Date Navigator */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-surface-card border border-border/80 rounded-xl px-2.5 py-1 text-xs">
              <Calendar className="w-3.5 h-3.5 text-text-muted" />
              <span className="font-semibold text-white">{displayDate}</span>
              <div className="flex items-center gap-1 ml-1 pl-1 border-l border-border">
                <button
                  type="button"
                  onClick={onPrevDate}
                  aria-label="Previous day"
                  className="p-1 hover:text-brand text-text-muted rounded transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onNextDate}
                  aria-label="Next day"
                  className="p-1 hover:text-brand text-text-muted rounded transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
