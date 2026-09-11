'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  sublabel: string;
  icon: (isActive: boolean) => React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    sublabel: 'Command Center',
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
    label: 'Workouts',
    sublabel: 'Train & Log Sets',
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
    label: 'Nutrition',
    sublabel: 'Fuel & Macros',
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
    label: 'Progress',
    sublabel: 'Evolve & Analytics',
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
    label: 'Athlete Profile',
    sublabel: 'Targets & Bio',
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

export const DesktopSidebar: React.FC = () => {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <aside
      aria-label="Desktop Navigation"
      className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-background-deep border-r border-border-subtle p-6 select-none"
    >
      {/* Brand Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 mb-8 group focus-visible:outline-none">
        <div className="w-8 h-8 rounded-sm bg-primary flex items-center justify-center text-background-deep font-black text-base shadow-glow-primary group-hover:scale-105 transition-transform">
          X
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-wider text-text-primary uppercase font-display leading-none">
            XEVYRA
          </span>
          <span className="text-[10px] font-extrabold tracking-widest text-text-tertiary uppercase mt-0.5">
            TRAIN • FUEL • EVOLVE
          </span>
        </div>
      </Link>

      {/* Nav List */}
      <nav className="flex-1 flex flex-col gap-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-md transition-all duration-150 focus-visible:outline-none ${
                isActive
                  ? 'bg-surface-elevated text-primary border border-primary/20 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface'
              }`}
            >
              <div className="flex-shrink-0">{item.icon(isActive)}</div>
              <div className="flex flex-col">
                <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-text-primary'}`}>
                  {item.label}
                </span>
                <span className="text-[10px] text-text-tertiary">
                  {item.sublabel}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Tagline / Status */}
      <div className="pt-4 border-t border-border-subtle flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[10px] font-bold text-text-tertiary uppercase">
          <span className="w-2 h-2 rounded-full bg-feedback-success" />
          <span>System Online</span>
        </div>
        <span className="text-[10px] text-text-muted">v1.0.0 • Mobile-First Engine</span>
      </div>
    </aside>
  );
};
