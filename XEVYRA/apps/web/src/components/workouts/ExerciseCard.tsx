import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface ExerciseCardProps {
  id: string;
  name: string;
  targetMuscle: string;
  equipment: string;
  completedSetsCount: number;
  totalSetsTarget: number;
  bestSetSummary?: string; // e.g. "100 kg × 5"
  children?: React.ReactNode;
  onAddSet?: () => void;
  className?: string;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  name,
  targetMuscle,
  equipment,
  completedSetsCount,
  totalSetsTarget,
  bestSetSummary,
  children,
  onAddSet,
  className = '',
}) => {
  return (
    <Card variant="default" padding="none" className={`flex flex-col border-border-subtle ${className}`}>
      {/* Exercise Header */}
      <div className="p-4 bg-surface-elevated/70 border-b border-border-subtle flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-sm sm:text-base font-bold text-text-primary uppercase tracking-wide font-display">
              {name}
            </h4>
            <Badge variant="neutral" size="sm">
              {targetMuscle}
            </Badge>
          </div>
          <p className="text-[11px] text-text-tertiary">
            {equipment} {bestSetSummary ? `• Best: ${bestSetSummary}` : ''}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-black text-primary">
            {completedSetsCount}/{totalSetsTarget}
          </span>
          <span className="text-[10px] text-text-tertiary uppercase block">SETS</span>
        </div>
      </div>

      {/* Set Rows Area */}
      <div className="p-3 sm:p-4 flex flex-col gap-2">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-text-tertiary uppercase px-3">
          <div className="col-span-2 text-center">SET</div>
          <div className="col-span-3 text-center">PREVIOUS</div>
          <div className="col-span-3 text-center">KG / LBS</div>
          <div className="col-span-2 text-center">REPS</div>
          <div className="col-span-2 text-center">DONE</div>
        </div>

        {children}

        {onAddSet && (
          <button
            type="button"
            onClick={onAddSet}
            className="w-full py-2.5 mt-1 rounded-sm border border-dashed border-border-subtle hover:border-primary/40 text-text-secondary hover:text-primary text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
          >
            <span>+ Add Set</span>
          </button>
        )}
      </div>
    </Card>
  );
};
