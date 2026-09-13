'use client';

import React from 'react';
import { EChart } from './EChart';
import type { EChartsOption } from 'echarts';

export interface BarChartDataPoint {
  label: string;
  value: number;
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
  barColor = '#00E599',
  unit = 'kg',
  className = '',
}) => {
  const xLabels = data.map((d) => d.label);
  const values = data.map((d) => d.value);

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
      borderColor: 'rgba(0, 229, 153, 0.4)',
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
          <strong style="color: ${barColor}; font-size: 14px;">${item.value.toLocaleString()} ${unit}</strong>
        </div>`;
      },
    },
    xAxis: {
      type: 'category',
      data: xLabels,
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
        formatter: (val: number) => {
          return val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`;
        },
      },
    },
    series: [
      {
        name: 'Volume',
        type: 'bar',
        barWidth: '35%',
        data: values,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: barColor },
              { offset: 1, color: `${barColor}80` },
            ],
          },
          shadowColor: `${barColor}30`,
          shadowBlur: 8,
        },
        emphasis: {
          itemStyle: {
            color: '#FFFFFF',
            shadowBlur: 12,
          },
        },
        animationDuration: 900,
        animationEasing: 'elasticOut',
      },
    ],
  };

  return (
    <div className={`w-full ${className}`}>
      <EChart option={option} height={height} />
    </div>
  );
};
