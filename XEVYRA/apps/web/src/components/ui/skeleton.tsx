import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rounded' | 'circle' | 'pill' | 'card';
}

export function Skeleton({
  className = '',
  variant = 'rounded',
  ...props
}: SkeletonProps) {
  const variantClasses = {
    rounded: 'rounded-xl',
    circle: 'rounded-full',
    pill: 'rounded-full',
    card: 'rounded-2xl border border-border/60',
  };

  return (
    <div
      role="status"
      aria-label="Loading content"
      className={`skeleton-shimmer ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
