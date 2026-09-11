'use client';

import React from 'react';
import { ChartDataPoint } from './LineChart';

export interface AreaChartProps {
  data: ChartDataPoint[];
  height?: number;
  color?: string;
  gradientId?: string;
  className?: string;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  height = 140,
  color = '#D4FF00',
  gradientId = 'area-grad',
  className = '',
}) => {
  if (!data || data.length === 0) return null;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = (maxVal - minVal) * 0.1 || 1;
  const chartMin = minVal - padding;
  const chartMax = maxVal + padding;
  const range = chartMax - chartMin || 1;

  const width = 360;
  const svgPadding = 16;
  const plotWidth = width - svgPadding * 2;
  const plotHeight = height - svgPadding * 2;

  const points = data.map((d, i) => {
    const x = svgPadding + (i / Math.max(1, data.length - 1)) * plotWidth;
    const y = svgPadding + plotHeight - ((d.value - chartMin) / range) * plotHeight;
    return { x, y };
  });

  const lineD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${lineD} L ${points[points.length - 1].x},${height - svgPadding} L ${points[0].x},${height - svgPadding} Z`;

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <path d={areaD} fill={`url(#${gradientId})`} />
        <path d={lineD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
};
