'use client';

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export interface EChartProps {
  option: echarts.EChartsOption;
  height?: number | string;
  width?: number | string;
  className?: string;
  loading?: boolean;
}

export const EChart: React.FC<EChartProps> = ({
  option,
  height = 200,
  width = '100%',
  className = '',
  loading = false,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize ECharts instance with dark background
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, 'dark', {
        renderer: 'svg',
      });
    }

    const chart = chartInstance.current;

    // Set chart options with smooth animation defaults
    chart.setOption({
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 900,
      animationEasing: 'cubicOut',
      ...option,
    });

    if (loading) {
      chart.showLoading({
        text: 'Loading...',
        color: '#D4FF00',
        textColor: '#94A3B8',
        maskColor: 'rgba(7, 10, 15, 0.7)',
      });
    } else {
      chart.hideLoading();
    }

    // Responsive auto-resize observer
    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [option, loading]);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={chartRef}
      style={{ height, width }}
      className={`relative ${className}`}
    />
  );
};
