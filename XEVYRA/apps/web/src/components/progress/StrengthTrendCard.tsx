import React from 'react';
import { Card } from '../ui/Card';
import { LineChart, ChartDataPoint } from '../charts/LineChart';
import { BarChart, BarChartDataPoint } from '../charts/BarChart';

export interface StrengthTrendCardProps {
  exerciseName: string;
  currentOneRepMax: number;
  deltaPercent: number;
  dataPoints: ChartDataPoint[];
  className?: string;
}

export const StrengthTrendCard: React.FC<StrengthTrendCardProps> = ({
  exerciseName,
  currentOneRepMax,
  deltaPercent,
  dataPoints,
  className = '',
}) => {
  return (
    <Card variant="default" className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold text-macro-protein uppercase tracking-widest block">
            STRENGTH PROGRESSION
          </span>
          <h4 className="text-sm font-bold text-text-primary uppercase tracking-wide font-display mt-0.5">
            {exerciseName}
          </h4>
        </div>
        <div className="text-right">
          <span className="text-lg font-black text-text-primary font-display">{currentOneRepMax} kg</span>
          <span className="text-[10px] font-bold text-brand-emerald block">+{deltaPercent}% (30d)</span>
        </div>
      </div>

      <LineChart data={dataPoints} height={120} unit="kg" strokeColor="#3B82F6" />
    </Card>
  );
};

export interface VolumeCardProps {
  weeklyVolumeTons: number;
  deltaPercent: number;
  dailyData: BarChartDataPoint[];
  className?: string;
}

export const VolumeCard: React.FC<VolumeCardProps> = ({
  weeklyVolumeTons,
  deltaPercent,
  dailyData,
  className = '',
}) => {
  return (
    <Card variant="default" className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold text-brand-emerald uppercase tracking-widest block">
            WEEKLY TRAINING TONNAGE
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-black text-text-primary font-display">
              {weeklyVolumeTons.toLocaleString()} TONNES
            </span>
            <span className="text-xs font-bold text-brand-emerald">+{deltaPercent}%</span>
          </div>
        </div>
      </div>

      <BarChart data={dailyData} height={110} unit="kg" barColor="#00E599" />
    </Card>
  );
};
