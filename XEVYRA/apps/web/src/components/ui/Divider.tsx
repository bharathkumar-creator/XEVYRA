import React from 'react';

export interface DividerProps {
  label?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ label, className = '' }) => {
  if (!label) {
    return <hr className={`border-t border-border-subtle my-4 ${className}`} />;
  }

  return (
    <div className={`flex items-center gap-3 my-4 ${className}`}>
      <div className="flex-1 border-t border-border-subtle" />
      <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">{label}</span>
      <div className="flex-1 border-t border-border-subtle" />
    </div>
  );
};
