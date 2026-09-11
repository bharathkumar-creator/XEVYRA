import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface PRCardProps {
  exerciseName: string;
  category: string;
  weight: number;
  reps: number;
  estimatedOneRepMax: number;
  achievedDate: string;
  className?: string;
}

export const PRCard: React.FC<PRCardProps> = ({
  exerciseName,
  category,
  weight,
  reps,
  estimatedOneRepMax,
  achievedDate,
  className = '',
}) => {
  return (
    <Card variant="interactive" className={`flex items-center justify-between p-4 ${className}`}>
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-base font-bold">
          🏆
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-text-primary uppercase tracking-wide font-display">
              {exerciseName}
            </h4>
            <Badge variant="neutral" size="sm">
              {category}
            </Badge>
          </div>
          <span className="text-[11px] text-text-tertiary">
            Achieved: <strong className="text-text-secondary">{achievedDate}</strong>
          </span>
        </div>
      </div>

      <div className="text-right">
        <div className="text-base sm:text-lg font-black text-primary font-display">
          {weight} kg <span className="text-xs text-text-secondary">× {reps}</span>
        </div>
        <span className="text-[10px] text-text-tertiary font-bold uppercase block">
          1RM: ~{estimatedOneRepMax} kg
        </span>
      </div>
    </Card>
  );
};
