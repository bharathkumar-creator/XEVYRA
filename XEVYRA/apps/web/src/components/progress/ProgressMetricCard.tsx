import React from 'react';
import { Card } from '../ui/Card';

export interface ProgressMetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  deltaText?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export const ProgressMetricCard: React.FC<ProgressMetricCardProps> = ({
  label,
  value,
  unit,
  deltaText,
  deltaType = 'neutral',
  icon,
  className = '',
}) => {
  const deltaColors = {
    positive: 'text-brand-emerald bg-brand-emerald/10 border-brand-emerald/20',
    negative: 'text-feedback-warning bg-feedback-warning/10 border-feedback-warning/20',
    neutral: 'text-text-tertiary bg-surface-muted border-border-subtle',
  }[deltaType];

  return (
    <Card variant="default" className={`flex flex-col justify-between gap-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
          {label}
        </span>
        {icon && <span className="text-text-tertiary text-sm">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight font-display">
          {value}
        </span>
        {unit && <span className="text-xs font-bold text-text-tertiary uppercase">{unit}</span>}
      </div>

      {deltaText && (
        <div className="flex items-center">
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-sm border uppercase tracking-wider ${deltaColors}`}>
            {deltaText}
          </span>
        </div>
      )}
    </Card>
  );
};
