import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  href?: string;
  className?: string;
}

export function Logo({
  size = 'md',
  showTagline = false,
  href = '/dashboard',
  className = '',
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg tracking-wider',
    md: 'text-2xl tracking-wider',
    lg: 'text-3xl tracking-widest',
    xl: 'text-4xl tracking-widest',
  };

  const content = (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="flex items-center gap-1.5 font-display font-extrabold select-none">
        <span className={`text-white uppercase ${sizeClasses[size]}`}>
          XE<span className="text-brand">VY</span>RA
        </span>
      </div>
      {showTagline && (
        <span className="text-[10px] uppercase tracking-[0.25em] text-text-secondary font-medium mt-0.5">
          Train · Fuel · Evolve
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
