'use client';

import React, { useState, useEffect } from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100 or current
  max?: number;  // default 100
  colorVariant?: 'primary' | 'protein' | 'carbs' | 'fat' | 'calories' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  colorVariant = 'primary',
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    const target = Math.min(100, Math.max(0, (value / (max || 1)) * 100));
    const timer = setTimeout(() => {
      setAnimatedPercent(target);
    }, 50);
    return () => clearTimeout(timer);
  }, [value, max]);

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  }[size];

  const colorStyles = {
    primary: 'bg-primary shadow-[0_0_10px_rgba(212,255,0,0.4)]',
    protein: 'bg-macro-protein shadow-[0_0_10px_rgba(59,130,246,0.4)]',
    carbs: 'bg-macro-carbs shadow-[0_0_10px_rgba(245,158,11,0.4)]',
    fat: 'bg-macro-fat shadow-[0_0_10px_rgba(168,85,247,0.4)]',
    calories: 'bg-macro-calories shadow-[0_0_10px_rgba(255,87,34,0.4)]',
    emerald: 'bg-brand-emerald shadow-[0_0_10px_rgba(0,229,153,0.4)]',
  }[colorVariant];

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs font-semibold text-text-secondary">
          <span>{Math.round(value)}</span>
          <span>{max}</span>
        </div>
      )}
      <div className={`w-full bg-surface-muted/90 rounded-full overflow-hidden p-0.5 border border-border-subtle ${heightStyles}`}>
        <div
          className={`h-full rounded-full transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${colorStyles}`}
          style={{ width: `${animatedPercent}%` }}
        />
      </div>
    </div>
  );
};
