import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, id, className = '', ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={`w-full bg-surface-elevated text-text-primary text-sm rounded-md border transition-all duration-150 p-3 outline-none resize-none placeholder:text-text-muted ${
            error
              ? 'border-feedback-danger focus:border-feedback-danger'
              : 'border-border-subtle focus:border-primary'
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-feedback-danger font-medium">{error}</span>}
        {helperText && !error && <span className="text-xs text-text-tertiary">{helperText}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
