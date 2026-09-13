'use client';

import React from 'react';
import { EChart } from './EChart';
import type { EChartsOption } from 'echarts';

export interface ChartDataPoint {
  label: string; // e.g. 'Day 1', '09/01'
  value: number;
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
  const xLabels = data.map((d) => d.label);
  const values = data.map((d) => d.value);

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const yPadding = (maxVal - minVal) * 0.1 || 1;

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    grid: {
      left: '2%',
      right: '2%',
      top: '12%',
      bottom: '12%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#141C2E',
      borderColor: 'rgba(212, 255, 0, 0.4)',
      borderWidth: 1,
      textStyle: {
        color: '#FFFFFF',
        fontFamily: 'Poppins, sans-serif',
        fontSize: 12,
        fontWeight: 'bold',
      },
      formatter: (params: any) => {
        const item = params[0];
        return `<div style="padding: 2px 4px;">
          <span style="color: #94A3B8; font-size: 11px;">${item.name}</span><br/>
          <strong style="color: ${strokeColor}; font-size: 14px;">${item.value} ${unit}</strong>
        </div>`;
      },
    },
    xAxis: {
      type: 'category',
      data: xLabels,
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#1F293D',
        },
      },
      axisLabel: {
        color: '#64748B',
        fontSize: 10,
        fontFamily: 'Poppins, sans-serif',
      },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      min: Math.floor(minVal - yPadding),
      max: Math.ceil(maxVal + yPadding),
      splitLine: {
        lineStyle: {
          color: 'rgba(31, 41, 61, 0.6)',
          type: 'dashed',
        },
      },
      axisLabel: {
        color: '#64748B',
        fontSize: 10,
        fontFamily: 'Poppins, sans-serif',
      },
    },
    series: [
      {
        name: 'Metric',
        type: 'line',
        smooth: 0.4,
        data: values,
        showSymbol: true,
        symbolSize: 7,
        itemStyle: {
          color: strokeColor,
          borderColor: '#070A0F',
          borderWidth: 2,
        },
        lineStyle: {
          width: 3,
          color: strokeColor,
          shadowColor: `${strokeColor}40`,
          shadowBlur: 10,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${strokeColor}35` },
              { offset: 1, color: `${strokeColor}00` },
            ],
          },
        },
        animationDuration: 1000,
        animationEasing: 'cubicOut',
      },
    ],
  };

  return (
    <div className={`w-full ${className}`}>
      <EChart option={option} height={height} />
    </div>
  );
};
