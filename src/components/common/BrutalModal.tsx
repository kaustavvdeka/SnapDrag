import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface BrutalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BrutalModal: React.FC<BrutalModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${maxWidthStyles[maxWidth]} bg-[#FAF7EE] border-3 md:border-4 border-[#121212] shadow-brutal-xl z-10 p-3.5 sm:p-5 md:p-6 overflow-hidden max-h-[94vh] sm:max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 mb-3 sm:mb-4 border-b-2 sm:border-b-3 border-[#121212]">
          <h2 className="text-sm sm:text-xl md:text-2xl font-black uppercase tracking-tight text-[#121212] truncate mr-2">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 bg-[#FF4D4D] text-white border-2 border-[#121212] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X size={18} strokeWidth={3} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto pr-0.5 sm:pr-1 flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BrutalModal;
