import React from 'react';
import BrutalCard from './BrutalCard.js';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  bg?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon,
  bg = 'bg-white',
}) => {
  return (
    <BrutalCard bg={bg} shadow="md" className="p-4 flex items-start justify-between">
      <div>
        <p className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 mb-1">
          {title}
        </p>
        <p className="text-3xl font-black font-mono tracking-tight text-[#121212]">
          {value}
        </p>
        {subtext && (
          <p className="text-[11px] font-mono text-neutral-500 mt-1">
            {subtext}
          </p>
        )}
      </div>
      {icon && (
        <div className="p-2.5 bg-[#121212] text-white border-2 border-[#121212] shadow-brutal-sm shrink-0">
          {icon}
        </div>
      )}
    </BrutalCard>
  );
};

export default StatCard;
