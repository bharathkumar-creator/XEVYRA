import React from 'react';

export interface SkeletonProps {
  variant?: 'text' | 'rect' | 'circle' | 'card' | 'stat';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  width,
  height,
  className = '',
}) => {
  if (variant === 'stat') {
    return (
      <div className={`p-4 rounded-lg bg-surface border border-border-subtle skeleton-shimmer flex flex-col gap-2 ${className}`}>
        <div className="h-3 w-16 bg-surface-elevated rounded" />
        <div className="h-7 w-24 bg-surface-elevated rounded" />
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-5 rounded-lg bg-surface border border-border-subtle skeleton-shimmer flex flex-col gap-3 ${className}`}>
        <div className="h-5 w-32 bg-surface-elevated rounded" />
        <div className="h-3 w-full bg-surface-elevated rounded" />
        <div className="h-3 w-3/4 bg-surface-elevated rounded" />
      </div>
    );
  }

  const variantStyles = {
    text: 'h-4 rounded',
    rect: 'rounded-md',
    circle: 'rounded-full',
    card: '',
    stat: '',
  }[variant];

  return (
    <div
      className={`skeleton-shimmer ${variantStyles} ${className}`}
      style={{ width, height }}
    />
  );
};
