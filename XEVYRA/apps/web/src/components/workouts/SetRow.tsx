'use client';

import React from 'react';

export interface SetRowProps {
  setNumber: number;
  previousPerformance?: string; // e.g. "80 kg × 8"
  weight: number | '';
  reps: number | '';
  isCompleted: boolean;
  onWeightChange: (val: number | '') => void;
  onRepsChange: (val: number | '') => void;
  onToggleComplete: () => void;
  className?: string;
}

export const SetRow: React.FC<SetRowProps> = ({
  setNumber,
  previousPerformance = '—',
  weight,
  reps,
  isCompleted,
  onWeightChange,
  onRepsChange,
  onToggleComplete,
  className = '',
}) => {
  return (
    <div
      className={`grid grid-cols-12 gap-2 items-center py-2 px-3 rounded-md transition-colors ${
        isCompleted
          ? 'bg-brand-emerald/10 border border-brand-emerald/20'
          : 'bg-surface-elevated/60 border border-border-subtle'
      } ${className}`}
    >
      {/* Set Number */}
      <div className="col-span-2 text-center">
        <span className="text-xs font-black text-text-secondary uppercase">
          #{setNumber}
        </span>
      </div>

      {/* Previous Performance Ghost Text */}
      <div className="col-span-3 text-center">
        <span className="text-[11px] font-medium text-text-tertiary truncate block">
          {previousPerformance}
        </span>
      </div>

      {/* Weight Input (KG/LBS) */}
      <div className="col-span-3">
        <input
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={weight}
          onChange={(e) => onWeightChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
          disabled={isCompleted}
          className="w-full h-10 bg-surface-muted text-text-primary text-center font-bold text-sm rounded-sm border border-border-subtle focus:border-primary focus:outline-none disabled:opacity-60"
        />
      </div>

      {/* Reps Input */}
      <div className="col-span-2">
        <input
          type="number"
          inputMode="numeric"
          placeholder="0"
          value={reps}
          onChange={(e) => onRepsChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
          disabled={isCompleted}
          className="w-full h-10 bg-surface-muted text-text-primary text-center font-bold text-sm rounded-sm border border-border-subtle focus:border-primary focus:outline-none disabled:opacity-60"
        />
      </div>

      {/* Completion Button (>=44px touch target) */}
      <div className="col-span-2 flex justify-center">
        <button
          type="button"
          aria-label={isCompleted ? `Mark set ${setNumber} incomplete` : `Complete set ${setNumber}`}
          onClick={onToggleComplete}
          className={`w-11 h-10 rounded-sm flex items-center justify-center transition-all duration-150 active:scale-95 touch-target ${
            isCompleted
              ? 'bg-brand-emerald text-background-deep shadow-sm'
              : 'bg-surface-muted text-text-tertiary hover:text-text-primary hover:bg-surface-muted/80 border border-border-subtle'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};
