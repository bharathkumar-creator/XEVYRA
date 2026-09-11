'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { triggerHapticFeedback } from '@/lib/bridge/flutter-bridge';

interface NavItem {
  href: string;
  label: string;
  icon: (isActive: boolean) => React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Command',
    icon: (isActive) => (
      <svg className="w-5 h-5" fill="none" stroke={isActive ? '#D4FF00' : 'currentColor'} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={isActive ? '2.5' : '1.8'}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    href: '/workouts',
    label: 'Train',
    icon: (isActive) => (
      <svg className="w-5 h-5" fill="none" stroke={isActive ? '#D4FF00' : 'currentColor'} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={isActive ? '2.5' : '1.8'}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
  {
    href: '/nutrition',
    label: 'Fuel',
    icon: (isActive) => (
      <svg className="w-5 h-5" fill="none" stroke={isActive ? '#D4FF00' : 'currentColor'} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={isActive ? '2.5' : '1.8'}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
  {
    href: '/progress',
    label: 'Evolve',
    icon: (isActive) => (
      <svg className="w-5 h-5" fill="none" stroke={isActive ? '#D4FF00' : 'currentColor'} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={isActive ? '2.5' : '1.8'}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Athlete',
    icon: (isActive) => (
      <svg className="w-5 h-5" fill="none" stroke={isActive ? '#D4FF00' : 'currentColor'} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={isActive ? '2.5' : '1.8'}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
];

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  // Hide on login
  if (pathname === '/login') return null;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background-deep/95 backdrop-blur-lg border-t border-border-subtle pb-safe"
    >
      <div className="grid grid-cols-5 h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => triggerHapticFeedback('light')}
              className={`flex flex-col items-center justify-center touch-target transition-colors duration-150 focus-visible:outline-none ${
                isActive ? 'text-primary' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              <div className="relative flex flex-col items-center">
                {item.icon(isActive)}
                {isActive && (
                  <span className="absolute -top-1 w-1 h-1 rounded-full bg-primary shadow-glow-primary" />
                )}
                <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isActive ? 'text-primary' : ''}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
