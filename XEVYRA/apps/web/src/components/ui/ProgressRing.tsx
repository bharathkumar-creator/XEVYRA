'use client';

import React, { useState, useEffect } from 'react';

export interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;    // diameter in px
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  glow?: boolean;
  gradientId?: string;
  showLeadingDot?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 140,
  strokeWidth = 12,
  color = '#D4FF00',
  trackColor = '#141C2E',
  glow = true,
  gradientId = `ring-grad-${Math.random().toString(36).substr(2, 6)}`,
  showLeadingDot = true,
  children,
  className = '',
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(Math.min(100, Math.max(0, progress)));
    }, 50);
    return () => clearTimeout(timer);
  }, [progress]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedProgress / 100) * circumference;

  // Compute leading dot coordinates on circle
  const angleInDegrees = (animatedProgress / 100) * 360 - 90;
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  const dotX = size / 2 + radius * Math.cos(angleInRadians);
  const dotY = size / 2 + radius * Math.sin(angleInRadians);

  return (
    <div
      className={`relative inline-flex items-center justify-center transition-transform duration-300 hover:scale-[1.02] group ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={`${color}CC`} />
          </linearGradient>
          <filter id={`glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
          className="opacity-75"
        />

        {/* Animated Main Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)"
          style={glow ? { filter: `url(#glow-${gradientId})` } : undefined}
        />

        {/* Leading Edge Luminous Glowing Dot */}
        {showLeadingDot && animatedProgress > 2 && (
          <circle
            cx={dotX}
            cy={dotY}
            r={strokeWidth / 2.2}
            fill="#FFFFFF"
            stroke={color}
            strokeWidth="2"
            className="transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) animate-pulse"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        )}
      </svg>

      {children && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {children}
        </div>
      )}
    </div>
  );
};
