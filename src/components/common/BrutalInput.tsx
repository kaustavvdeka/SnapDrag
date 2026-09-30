import React from 'react';

export interface BrutalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const BrutalInput = React.forwardRef<HTMLInputElement, BrutalInputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-black uppercase tracking-wider mb-1 text-[#121212]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3 py-2 bg-white text-[#121212] border-2 md:border-3 border-[#121212] shadow-brutal-sm focus:outline-none focus:bg-[#FFFDF5] focus:shadow-brutal font-medium placeholder:text-neutral-500 transition-all ${
            error ? 'border-[#FF4D4D] bg-red-50' : ''
          } ${className}`}
          {...props}
        />
        {helperText && !error && (
          <p className="text-xs text-neutral-600 mt-1 font-mono">{helperText}</p>
        )}
        {error && (
          <p className="text-xs text-[#FF4D4D] mt-1 font-bold flex items-center gap-1">
            ⚠ {error}
          </p>
        )}
      </div>
    );
  }
);

BrutalInput.displayName = 'BrutalInput';

export interface BrutalSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const BrutalSelect = React.forwardRef<HTMLSelectElement, BrutalSelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-black uppercase tracking-wider mb-1 text-[#121212]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full px-3 py-2 bg-white text-[#121212] border-2 md:border-3 border-[#121212] shadow-brutal-sm focus:outline-none focus:bg-[#FFFDF5] focus:shadow-brutal font-medium cursor-pointer transition-all ${
            error ? 'border-[#FF4D4D]' : ''
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-[#FF4D4D] mt-1 font-bold flex items-center gap-1">
            ⚠ {error}
          </p>
        )}
      </div>
    );
  }
);

BrutalSelect.displayName = 'BrutalSelect';

export default BrutalInput;
