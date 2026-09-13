'use client';

import React, { useState, useEffect } from 'react';

export interface MacroRingProps {
  protein: { consumed: number; target: number };
  carbs: { consumed: number; target: number };
  fat: { consumed: number; target: number };
  size?: number;
  className?: string;
}

export const MacroRing: React.FC<MacroRingProps> = ({
  protein,
  carbs,
  fat,
  size = 150,
  className = '',
}) => {
  const [activeMacro, setActiveMacro] = useState<'ALL' | 'PROTEIN' | 'CARBS' | 'FAT'>('ALL');
  const [animatedProgress, setAnimatedProgress] = useState({ p: 0, c: 0, f: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress({
        p: protein.target > 0 ? Math.min(100, Math.max(0, (protein.consumed / protein.target) * 100)) : 0,
        c: carbs.target > 0 ? Math.min(100, Math.max(0, (carbs.consumed / carbs.target) * 100)) : 0,
        f: fat.target > 0 ? Math.min(100, Math.max(0, (fat.consumed / fat.target) * 100)) : 0,
      });
    }, 60);
    return () => clearTimeout(timer);
  }, [protein, carbs, fat]);

  const center = size / 2;
  const strokeWidth = 9;
  const gap = 3.5;

  // Concentric 3 rings radii
  const proteinRadius = center - strokeWidth / 2 - 2;
  const carbsRadius = proteinRadius - strokeWidth - gap;
  const fatRadius = carbsRadius - strokeWidth - gap;

  const getOffset = (radius: number, progressPct: number) => {
    const circumference = 2 * Math.PI * radius;
    return {
      circumference,
      offset: circumference - (progressPct / 100) * circumference,
    };
  };

  const pData = getOffset(proteinRadius, animatedProgress.p);
  const cData = getOffset(carbsRadius, animatedProgress.c);
  const fData = getOffset(fatRadius, animatedProgress.f);

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <defs>
          <filter id="glow-protein" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-carbs" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-fat" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Protein Track & Arc */}
        <circle cx={center} cy={center} r={proteinRadius} stroke="#141C2E" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={center}
          cy={center}
          r={proteinRadius}
          stroke="#3B82F6"
          strokeWidth={strokeWidth}
          strokeDasharray={pData.circumference}
          strokeDashoffset={pData.offset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)"
          style={{
            opacity: activeMacro === 'ALL' || activeMacro === 'PROTEIN' ? 1 : 0.25,
            filter: activeMacro === 'PROTEIN' ? 'url(#glow-protein)' : undefined,
          }}
        />

        {/* Carbs Track & Arc */}
        <circle cx={center} cy={center} r={carbsRadius} stroke="#141C2E" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={center}
          cy={center}
          r={carbsRadius}
          stroke="#F59E0B"
          strokeWidth={strokeWidth}
          strokeDasharray={cData.circumference}
          strokeDashoffset={cData.offset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)"
          style={{
            opacity: activeMacro === 'ALL' || activeMacro === 'CARBS' ? 1 : 0.25,
            filter: activeMacro === 'CARBS' ? 'url(#glow-carbs)' : undefined,
          }}
        />

        {/* Fat Track & Arc */}
        <circle cx={center} cy={center} r={fatRadius} stroke="#141C2E" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={center}
          cy={center}
          r={fatRadius}
          stroke="#A855F7"
          strokeWidth={strokeWidth}
          strokeDasharray={fData.circumference}
          strokeDashoffset={fData.offset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)"
          style={{
            opacity: activeMacro === 'ALL' || activeMacro === 'FAT' ? 1 : 0.25,
            filter: activeMacro === 'FAT' ? 'url(#glow-fat)' : undefined,
          }}
        />
      </svg>

      {/* Center Macro Pill Selector */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-black tracking-widest text-text-tertiary uppercase">
          MACROS
        </span>
      </div>
    </div>
  );
};
