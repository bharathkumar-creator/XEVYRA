import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PRBadge } from './PRBadge';

export interface WorkoutSummaryProps {
  workoutName: string;
  durationMinutes: number;
  totalVolumeKg: number;
  setsCompleted: number;
  prsAchieved?: Array<{ exerciseName: string; weight: number; reps: number }>;
  onClose: () => void;
}

export const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({
  workoutName,
  durationMinutes,
  totalVolumeKg,
  setsCompleted,
  prsAchieved = [],
  onClose,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-deep/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="w-full max-w-md bg-surface-elevated border border-primary/30 rounded-lg p-6 shadow-cardElevated flex flex-col gap-5 text-center">
        {/* Athletic Celebration Icon */}
        <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center text-3xl mx-auto shadow-glow-primary">
          ⚡
        </div>

        <div>
          <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest block mb-1">
            WORKOUT EVOLVED
          </span>
          <h3 className="text-xl font-black text-text-primary uppercase tracking-wide font-display">
            {workoutName}
          </h3>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-border-subtle">
          <div className="flex flex-col">
            <span className="text-lg font-black text-text-primary font-display">{durationMinutes}m</span>
            <span className="text-[10px] font-bold text-text-tertiary uppercase">DURATION</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-primary font-display">{totalVolumeKg.toLocaleString()}kg</span>
            <span className="text-[10px] font-bold text-text-tertiary uppercase">VOLUME</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-brand-emerald font-display">{setsCompleted}</span>
            <span className="text-[10px] font-bold text-text-tertiary uppercase">SETS</span>
          </div>
        </div>

        {/* PR Achievements */}
        {prsAchieved.length > 0 && (
          <div className="flex flex-col gap-2 text-left">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              PRs Smashed Today
            </span>
            <div className="flex flex-wrap gap-2">
              {prsAchieved.map((pr, i) => (
                <PRBadge
                  key={i}
                  exerciseName={pr.exerciseName}
                  weight={`${pr.weight} kg`}
                  reps={pr.reps}
                />
              ))}
            </div>
          </div>
        )}

        <Button variant="primary" fullWidth size="md" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
};
