'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';

export interface RestTimerProps {
  initialSeconds?: number;
  onFinish?: () => void;
  className?: string;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds = 90,
  onFinish,
  className = '',
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isRunning) {
      setIsRunning(false);
      if (onFinish) onFinish();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsRemaining, onFinish]);

  const addTime = (delta: number) => {
    setSecondsRemaining((prev) => Math.max(0, prev + delta));
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg bg-surface-elevated border border-border-subtle shadow-card ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-bold">
          ⏱️
        </div>
        <div>
          <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider block">
            REST TIMER
          </span>
          <span className="text-lg font-black text-text-primary tracking-tight font-display">
            {formatTime(secondsRemaining)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => addTime(-15)}
          className="px-2 py-1 text-xs font-bold text-text-secondary bg-surface-muted hover:text-text-primary rounded-sm border border-border-subtle"
        >
          -15s
        </button>
        <button
          type="button"
          onClick={() => addTime(30)}
          className="px-2 py-1 text-xs font-bold text-text-secondary bg-surface-muted hover:text-text-primary rounded-sm border border-border-subtle"
        >
          +30s
        </button>
        <Button
          variant={isRunning ? 'secondary' : 'primary'}
          size="sm"
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? 'Pause' : 'Start'}
        </Button>
      </div>
    </div>
  );
};
