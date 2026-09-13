'use client';

import React from 'react';

export interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: () => void;
  ariaLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({
  checked,
  onChange,
  ariaLabel = 'Toggle completion',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }[size];

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={`uiverse-checkbox relative ${sizeStyles} rounded-md flex items-center justify-center transition-all duration-200 active:scale-90 touch-target focus-visible:outline-none ${
        checked
          ? 'bg-primary text-background-deep shadow-glow-primary'
          : 'bg-surface-muted/80 text-text-tertiary border border-border-subtle hover:border-primary/40 hover:text-text-primary'
      } ${className}`}
    >
      <svg
        className={`w-5 h-5 transition-transform duration-200 ${
          checked ? 'scale-100 animate-check-bounce' : 'scale-75 opacity-40'
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 13l4 4L19 7"
        />
      </svg>
    </button>
  );
};
