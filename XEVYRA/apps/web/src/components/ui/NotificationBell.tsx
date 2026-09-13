'use client';

import React, { useState } from 'react';

export interface NotificationBellProps {
  count?: number;
  onClick?: () => void;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  count = 2,
  onClick,
  className = '',
}) => {
  const [isRinging, setIsRinging] = useState(false);

  const handleClick = () => {
    setIsRinging(true);
    setTimeout(() => setIsRinging(false), 1000);
    if (onClick) onClick();
  };

  return (
    <button
      type="button"
      aria-label="View notifications"
      onClick={handleClick}
      className={`uiverse-bell-btn relative w-10 h-10 rounded-full bg-surface-elevated border border-border-subtle hover:border-primary/40 flex items-center justify-center transition-all duration-200 group touch-target focus-visible:outline-none ${className}`}
    >
      {/* Bell SVG with swinging animation */}
      <svg
        className={`w-5 h-5 text-text-secondary group-hover:text-primary transition-colors ${
          isRinging ? 'animate-bell-ring' : 'group-hover:animate-bell-wiggle'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      {/* Animated Glowing Notification Badge with Ping */}
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-primary text-background-deep text-[9px] font-black shadow-glow-primary">
            {count}
          </span>
        </span>
      )}
    </button>
  );
};
