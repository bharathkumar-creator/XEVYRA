import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'outline' | 'highlight';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  }[padding];

  const variantStyles = {
    default: 'bg-surface border border-border-subtle shadow-card',
    elevated: 'bg-surface-elevated border border-border-light shadow-card',
    interactive:
      'bg-surface border border-border-subtle card-interactive hover:border-primary/40 cursor-pointer shadow-card',
    outline: 'bg-transparent border border-border-subtle',
    highlight: 'bg-surface-elevated border border-primary/30 shadow-glow-primary/20',
  }[variant];

  return (
    <div
      className={`rounded-lg transition-colors overflow-hidden ${variantStyles} ${paddingStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
