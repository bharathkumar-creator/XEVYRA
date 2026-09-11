import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface WorkoutCardProps {
  id: string;
  name: string;
  muscleGroups: string[];
  exerciseCount: number;
  estimatedMinutes: number;
  status: 'READY' | 'IN_PROGRESS' | 'COMPLETED';
  lastCompletedDate?: string;
  onStart?: (id: string) => void;
  className?: string;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  id,
  name,
  muscleGroups,
  exerciseCount,
  estimatedMinutes,
  status,
  lastCompletedDate,
  onStart,
  className = '',
}) => {
  const statusBadge = {
    READY: <Badge variant="neutral" size="sm">READY</Badge>,
    IN_PROGRESS: <Badge variant="primary" size="sm" pulse>ACTIVE</Badge>,
    COMPLETED: <Badge variant="emerald" size="sm">COMPLETED</Badge>,
  }[status];

  return (
    <Card variant="interactive" className={`flex flex-col justify-between gap-4 ${className}`}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {muscleGroups.map((group) => (
              <span key={group} className="text-[10px] font-extrabold uppercase tracking-wider text-text-tertiary bg-surface-muted px-2 py-0.5 rounded-sm">
                {group}
              </span>
            ))}
          </div>
          {statusBadge}
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-bold text-text-primary uppercase tracking-wide font-display">
            {name}
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {exerciseCount} Exercises • ~{estimatedMinutes} Min
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
        {lastCompletedDate ? (
          <span className="text-[11px] text-text-tertiary">
            Last: <strong className="text-text-secondary">{lastCompletedDate}</strong>
          </span>
        ) : (
          <span className="text-[11px] text-text-tertiary">Fresh Session</span>
        )}

        {onStart && (
          <Button
            variant={status === 'IN_PROGRESS' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onStart(id)}
          >
            {status === 'IN_PROGRESS' ? 'Resume Workout' : 'Start Session'}
          </Button>
        )}
      </div>
    </Card>
  );
};
