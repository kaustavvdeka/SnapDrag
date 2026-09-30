import React from 'react';

export interface BrutalBadgeProps {
  children: React.ReactNode;
  variant?: 'yellow' | 'pink' | 'green' | 'blue' | 'purple' | 'red' | 'dark' | 'white';
  size?: 'sm' | 'md';
  className?: string;
}

export const BrutalBadge: React.FC<BrutalBadgeProps> = ({
  children,
  variant = 'yellow',
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    yellow: 'bg-[#FFE600] text-[#121212]',
    pink: 'bg-[#FF6EA7] text-[#121212]',
    green: 'bg-[#00E599] text-[#121212]',
    blue: 'bg-[#38BDF8] text-[#121212]',
    purple: 'bg-[#A388EE] text-[#121212]',
    red: 'bg-[#FF4D4D] text-white',
    dark: 'bg-[#121212] text-white',
    white: 'bg-white text-[#121212]',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 border-[1.5px] md:border-2 border-[#121212] font-bold uppercase tracking-wider',
    md: 'text-sm px-3 py-1 border-2 border-[#121212] font-bold uppercase tracking-wider',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default BrutalBadge;
