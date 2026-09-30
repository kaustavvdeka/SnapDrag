import React from 'react';

export interface BrutalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  bg?: string;
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  hoverEffect?: boolean;
}

export const BrutalCard: React.FC<BrutalCardProps> = ({
  children,
  bg = 'bg-white',
  shadow = 'md',
  hoverEffect = false,
  className = '',
  ...props
}) => {
  const shadowStyles = {
    none: '',
    sm: 'shadow-brutal-sm',
    md: 'shadow-brutal',
    lg: 'shadow-brutal-lg',
    xl: 'shadow-brutal-xl',
  };

  const hoverClass = hoverEffect ? 'brutal-card-hover' : '';

  return (
    <div
      className={`border-2 md:border-3 border-[#121212] ${bg} ${shadowStyles[shadow]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default BrutalCard;
