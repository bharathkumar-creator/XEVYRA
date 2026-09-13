'use client';

import React, { useState } from 'react';
import { ProgressRing } from './ProgressRing';
import { useAnimatedCounter } from './useAnimatedCounter';

export interface CalorieRingProps {
  consumed: number;
  target: number;
  size?: number;
  className?: string;
}

export const CalorieRing: React.FC<CalorieRingProps> = ({
  consumed,
  target,
  size = 190,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const animatedConsumed = useAnimatedCounter(consumed, 900);

  const percentage = target > 0 ? (consumed / target) * 100 : 0;
  const remaining = Math.max(0, target - consumed);
  const isOver = consumed > target;
  const ringColor = isOver ? '#FF5722' : '#D4FF00';

  return (
    <div
      className={`flex flex-col items-center justify-center select-none cursor-pointer group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <ProgressRing
          progress={percentage}
          size={size}
          strokeWidth={14}
          color={ringColor}
          trackColor="#141C2E"
          glow={percentage >= 100}
        >
          <div className="flex flex-col items-center text-center transition-transform duration-200 group-hover:scale-105">
            <span className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight font-display">
              {Math.round(animatedConsumed)}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-text-tertiary uppercase tracking-widest -mt-1">
              / {target} KCAL
            </span>

            {/* Percentage completion pill badge */}
            <span
              className={`mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border transition-all ${
                isOver
                  ? 'bg-feedback-danger/15 text-feedback-danger border-feedback-danger/30'
                  : 'bg-primary/15 text-primary border-primary/30'
              }`}
            >
              {Math.round(percentage)}% FUELLED
            </span>
          </div>
        </ProgressRing>
      </div>

      {/* Reactive Remaining Metrics with Subtle Hover Transition */}
      <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-text-secondary transition-all">
        <span
          className={`font-black text-sm transition-colors ${
            isOver ? 'text-feedback-danger' : 'text-primary'
          }`}
        >
          {isOver ? `+${Math.round(consumed - target)}` : Math.round(remaining)}
        </span>
        <span>{isOver ? 'kcal over target' : 'kcal remaining'}</span>
      </div>
    </div>
  );
};
