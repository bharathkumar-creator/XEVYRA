import React from 'react';
import { ProgressRing } from './ProgressRing';

export interface CalorieRingProps {
  consumed: number;
  target: number;
  size?: number;
  className?: string;
}

export const CalorieRing: React.FC<CalorieRingProps> = ({
  consumed,
  target,
  size = 180,
  className = '',
}) => {
  const percentage = target > 0 ? (consumed / target) * 100 : 0;
  const remaining = Math.max(0, target - consumed);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <ProgressRing
        progress={percentage}
        size={size}
        strokeWidth={14}
        color="#D4FF00"
        trackColor="#141C2E"
        glow={percentage >= 100}
      >
        <div className="flex flex-col items-center text-center">
          <span className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight font-display">
            {Math.round(consumed)}
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-text-tertiary uppercase tracking-widest -mt-1">
            / {target} KCAL
          </span>
        </div>
      </ProgressRing>
      <div className="mt-2 text-xs font-semibold text-text-secondary flex items-center gap-1">
        <span className="text-primary font-bold">{Math.round(remaining)}</span>
        <span>kcal remaining</span>
      </div>
    </div>
  );
};
