import React from 'react';
import { Card } from '../ui/Card';
import { LineChart, ChartDataPoint } from '../charts/LineChart';

export interface WeightTrendCardProps {
  currentWeightKg: number;
  startingWeightKg: number;
  sevenDayChangeKg: number;
  dataPoints: ChartDataPoint[];
  className?: string;
}

export const WeightTrendCard: React.FC<WeightTrendCardProps> = ({
  currentWeightKg,
  startingWeightKg,
  sevenDayChangeKg,
  dataPoints,
  className = '',
}) => {
  const isLoss = sevenDayChangeKg < 0;

  return (
    <Card variant="default" className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest block">
            BODYWEIGHT TREND
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-black text-text-primary tracking-tight font-display">
              {currentWeightKg} kg
            </span>
            <span className={`text-xs font-bold ${isLoss ? 'text-brand-emerald' : 'text-feedback-warning'}`}>
              {sevenDayChangeKg > 0 ? `+${sevenDayChangeKg}` : sevenDayChangeKg} kg (7d)
            </span>
          </div>
        </div>

        <div className="text-right text-[11px] text-text-tertiary">
          <span>Start: <strong className="text-text-secondary">{startingWeightKg} kg</strong></span>
        </div>
      </div>

      <LineChart data={dataPoints} height={140} unit="kg" strokeColor="#D4FF00" />
    </Card>
  );
};
