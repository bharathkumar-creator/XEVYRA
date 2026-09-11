import React from 'react';

export interface PRBadgeProps {
  exerciseName?: string;
  weight?: string | number;
  reps?: number;
  className?: string;
}

export const PRBadge: React.FC<PRBadgeProps> = ({
  exerciseName,
  weight,
  reps,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-primary/15 border border-primary/40 text-primary text-xs font-bold uppercase tracking-wider ${className}`}
    >
      <span className="text-sm">🏆</span>
      <span>PR</span>
      {exerciseName && <span className="text-text-primary">• {exerciseName}</span>}
      {weight !== undefined && (
        <span className="text-primary font-black ml-0.5">
          {weight} {reps ? `× ${reps}` : ''}
        </span>
      )}
    </span>
  );
};
