import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Sparkles } from 'lucide-react';
import BrutalButton from './BrutalButton.js';

interface SearchBarProps {
  initialValue?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  size?: 'md' | 'lg';
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialValue = '',
  placeholder = 'Search e.g. "red mekhela under 5000", "banarasi saree", "wedding lehenga"',
  onSearch,
  className = '',
  size = 'md',
}) => {
  const [query, setQuery] = useState(initialValue);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/explore?query=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  const sizeClasses = size === 'lg' ? 'py-3.5 px-4 text-base' : 'py-2.5 px-3 text-sm';

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center gap-2 w-full ${className}`}>
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-600">
          <Search size={size === 'lg' ? 20 : 18} strokeWidth={2.5} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-9 bg-white text-[#121212] border-2 md:border-3 border-[#121212] shadow-brutal font-medium placeholder:text-neutral-500 focus:outline-none focus:bg-[#FFFDF5] focus:shadow-brutal-lg transition-all ${sizeClasses}`}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-600 hover:text-black cursor-pointer"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>

      <BrutalButton type="submit" variant="primary" size={size === 'lg' ? 'lg' : 'md'}>
        <span className="hidden sm:inline">Search</span>
        <Search size={16} className="sm:hidden" strokeWidth={3} />
      </BrutalButton>
    </form>
  );
};

export default SearchBar;
