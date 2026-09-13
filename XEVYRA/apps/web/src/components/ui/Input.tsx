import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixElement?: React.ReactNode;
  suffixElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, prefixElement, suffixElement, id, className = '', ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefixElement && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-text-tertiary">
              {prefixElement}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full uiverse-input text-text-primary text-sm rounded-md py-2.5 px-3.5 outline-none placeholder:text-text-muted ${
              prefixElement ? 'pl-10' : ''
            } ${suffixElement ? 'pr-12' : ''} ${
              error
                ? 'border-feedback-danger focus:border-feedback-danger focus:ring-1 focus:ring-feedback-danger'
                : ''
            } ${className}`}
            {...props}
          />
          {suffixElement && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-xs font-bold text-text-secondary">
              {suffixElement}
            </div>
          )}
        </div>
        {error && <span className="text-xs text-feedback-danger font-medium">{error}</span>}
        {helperText && !error && <span className="text-xs text-text-tertiary">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
