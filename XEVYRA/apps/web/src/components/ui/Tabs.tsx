import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  fullWidth?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  fullWidth = false,
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'py-1 px-3 text-xs',
    md: 'py-2 px-4 text-sm',
  }[size];

  return (
    <div
      role="tablist"
      className={`inline-flex items-center bg-surface-elevated p-1 rounded-md border border-border-subtle ${
        fullWidth ? 'w-full grid' : ''
      } ${fullWidth ? `grid-cols-${tabs.length}` : ''} ${className}`}
      style={fullWidth ? { gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` } : undefined}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center justify-center font-bold tracking-wide uppercase rounded-sm transition-all duration-150 focus-visible:outline-none ${sizeStyles} ${
              isActive
                ? 'bg-primary text-background-deep shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted/50'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isActive
                    ? 'bg-background-deep text-primary'
                    : 'bg-surface-muted text-text-tertiary'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
