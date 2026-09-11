'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, Apple, BarChart3, User } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Workouts', href: '/workouts', icon: Dumbbell },
  { label: 'Nutrition', href: '/nutrition', icon: Apple },
  { label: 'Progress', href: '/progress', icon: BarChart3 },
  { label: 'Profile', href: '/profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  // Do not render bottom nav on login or dev routes
  if (pathname === '/login' || pathname?.startsWith('/dev')) {
    return null;
  }

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#090D16]/95 backdrop-blur-lg border-t border-border/80 px-2 py-1 pb-[calc(0.25rem+env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-brand font-semibold'
                  : 'text-text-muted hover:text-text-secondary active:scale-95'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110' : ''
                  }`}
                  aria-hidden="true"
                />
                {isActive && (
                  <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-brand shadow-glow-brand" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
