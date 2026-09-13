'use client';

import { useState, useEffect } from 'react';

/**
 * Smoothly interpolates from previous value to target value using ease-out cubic.
 */
export function useAnimatedCounter(targetValue: number, duration = 800): number {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = currentValue;
    const changeInValue = targetValue - startValue;

    if (changeInValue === 0) return;

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic: 1 - pow(1 - progress, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCurrentValue(startValue + changeInValue * easeProgress);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetValue, duration]);

  return currentValue;
}
