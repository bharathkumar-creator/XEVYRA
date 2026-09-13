import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'emerald' | 'protein' | 'carbs' | 'fat' | 'calories' | 'warning' | 'danger' | 'success' | 'neutral';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  pulse = false,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider font-bold',
    md: 'text-xs px-2.5 py-1 tracking-wider font-bold',
  }[size];

  const variantStyles = {
    primary: 'bg-primary/15 text-primary border border-primary/30',
    emerald: 'bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30',
    protein: 'bg-macro-protein/15 text-macro-protein border border-macro-protein/30',
    carbs: 'bg-macro-carbs/15 text-macro-carbs border border-macro-carbs/30',
    fat: 'bg-macro-fat/15 text-macro-fat border border-macro-fat/30',
    calories: 'bg-macro-calories/15 text-macro-calories border border-macro-calories/30',
    warning: 'bg-feedback-warning/15 text-feedback-warning border border-feedback-warning/30',
    danger: 'bg-feedback-danger/15 text-feedback-danger border border-feedback-danger/30',
    success: 'bg-feedback-success/15 text-feedback-success border border-feedback-success/30',
    neutral: 'bg-surface-muted text-text-secondary border border-border-subtle',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 uppercase rounded-sm ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {pulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {children}
    </span>
  );
};
