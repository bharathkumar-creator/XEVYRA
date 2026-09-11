'use client';

import React, { useState } from 'react';

export interface ChartDataPoint {
  label: string; // e.g., 'Mon', '09/01'
  value: number;
  secondaryValue?: number;
}

export interface LineChartProps {
  data: ChartDataPoint[];
  height?: number;
  strokeColor?: string;
  unit?: string;
  className?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 160,
  strokeColor = '#D4FF00',
  unit = '',
  className = '',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className={`h-[${height}px] flex items-center justify-center text-xs text-text-tertiary`}>
        No data available
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = (maxVal - minVal) * 0.1 || 1;
  const chartMin = minVal - padding;
  const chartMax = maxVal + padding;
  const range = chartMax - chartMin || 1;

  const width = 360;
  const svgHeight = height;
  const svgPadding = 24;
  const plotWidth = width - svgPadding * 2;
  const plotHeight = svgHeight - svgPadding * 2;

  const points = data.map((d, i) => {
    const x = svgPadding + (i / Math.max(1, data.length - 1)) * plotWidth;
    const y = svgPadding + plotHeight - ((d.value - chartMin) / range) * plotHeight;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      <div className="relative w-full overflow-hidden" style={{ height }}>
        <svg
          viewBox={`0 0 ${width} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Subtle grid lines */}
          <line
            x1={svgPadding}
            y1={svgPadding}
            x2={width - svgPadding}
            y2={svgPadding}
            stroke="#1F293D"
            strokeDasharray="3 3"
          />
          <line
            x1={svgPadding}
            y1={svgHeight / 2}
            x2={width - svgPadding}
            y2={svgHeight / 2}
            stroke="#1F293D"
            strokeDasharray="3 3"
          />
          <line
            x1={svgPadding}
            y1={svgHeight - svgPadding}
            x2={width - svgPadding}
            y2={svgHeight - svgPadding}
            stroke="#1F293D"
          />

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Dots */}
          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={hoveredIdx === idx ? 5 : 3.5}
              fill={hoveredIdx === idx ? '#FFFFFF' : strokeColor}
              stroke="#070A0F"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}
        </svg>

        {hoveredIdx !== null && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-surface-elevated border border-border-light px-2.5 py-1 rounded-sm text-xs shadow-card text-center pointer-events-none"
          >
            <span className="text-text-tertiary font-medium mr-1.5">{data[hoveredIdx].label}:</span>
            <span className="text-primary font-bold">{data[hoveredIdx].value} {unit}</span>
          </div>
        )}
      </div>

      {/* X-Axis Labels */}
      <div className="flex justify-between px-2 text-[10px] font-semibold text-text-tertiary uppercase">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
};
