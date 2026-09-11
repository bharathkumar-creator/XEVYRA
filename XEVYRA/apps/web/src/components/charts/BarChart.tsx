'use client';

import React, { useState } from 'react';

export interface BarChartDataPoint {
  label: string;
  value: number;
  target?: number;
}

export interface BarChartProps {
  data: BarChartDataPoint[];
  height?: number;
  barColor?: string;
  unit?: string;
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 140,
  barColor = '#D4FF00',
  unit = '',
  className = '',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="text-xs text-text-tertiary">No data</div>;
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.value, d.target || 0)), 1);

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      <div className="flex items-end justify-between gap-2 px-1" style={{ height }}>
        {data.map((d, i) => {
          const heightPercent = (d.value / maxVal) * 100;
          const isHovered = hoveredIdx === i;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div
                className="w-full max-w-[28px] rounded-t-sm transition-all duration-200 group-hover:brightness-125"
                style={{
                  height: `${Math.max(4, heightPercent)}%`,
                  backgroundColor: isHovered ? '#FFFFFF' : barColor,
                }}
              />
            </div>
          );
        })}
      </div>

      {hoveredIdx !== null && (
        <div className="text-center text-xs font-semibold text-text-secondary">
          <span>{data[hoveredIdx].label}: </span>
          <span className="text-primary font-bold">{data[hoveredIdx].value} {unit}</span>
        </div>
      )}

      {/* X-Axis labels */}
      <div className="flex justify-between px-1 text-[10px] font-semibold text-text-tertiary uppercase">
        {data.map((d, i) => (
          <span key={i} className="text-center flex-1">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
};
