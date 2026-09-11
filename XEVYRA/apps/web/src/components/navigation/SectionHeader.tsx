import React from 'react';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionElement?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionElement,
  badge,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between gap-3 mb-3 ${className}`}>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-text-primary uppercase tracking-wider font-display">
            {title}
          </h2>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>
        )}
      </div>
      {actionElement && <div>{actionElement}</div>}
    </div>
  );
};
