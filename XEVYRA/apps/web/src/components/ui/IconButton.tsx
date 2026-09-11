import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string; // Enforce accessible label
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({
  'aria-label': ariaLabel,
  variant = 'secondary',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-12 h-12 text-base',
  }[size];

  const variantStyles = {
    primary: 'bg-primary text-background-deep hover:bg-primary-hover shadow-glow-primary',
    secondary: 'bg-surface-elevated text-text-primary hover:bg-surface-muted border border-border-subtle',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-elevated',
    danger: 'bg-feedback-danger/10 text-feedback-danger hover:bg-feedback-danger/20 border border-feedback-danger/30',
  }[variant];

  return (
    <button
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center rounded-md touch-target transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
};
