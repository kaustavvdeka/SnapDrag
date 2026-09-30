import React from 'react';

export interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'dark' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const BrutalButton: React.FC<BrutalButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'font-bold uppercase tracking-wider inline-flex items-center justify-center border-2 md:border-3 border-[#121212] transition-all brutal-btn-press select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none';

  const variantStyles = {
    primary: 'bg-[#FFE600] text-[#121212] shadow-brutal hover:bg-[#FFD600]',
    secondary: 'bg-[#FF6EA7] text-[#121212] shadow-brutal hover:bg-[#FF5391]',
    accent: 'bg-[#00E599] text-[#121212] shadow-brutal hover:bg-[#00CC88]',
    dark: 'bg-[#121212] text-[#FFFFFF] shadow-brutal hover:bg-[#252525]',
    outline: 'bg-white text-[#121212] shadow-brutal hover:bg-[#FAF7EE]',
    danger: 'bg-[#FF4D4D] text-white shadow-brutal hover:bg-[#E63939]',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 shadow-brutal-sm',
    md: 'text-sm px-5 py-2.5 shadow-brutal',
    lg: 'text-base px-7 py-3.5 shadow-brutal-lg',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default BrutalButton;
