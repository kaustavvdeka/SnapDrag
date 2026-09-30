import React from 'react';
import { Category } from '../../types/index.js';
import BrutalCard from '../common/BrutalCard.js';
import BrutalButton from '../common/BrutalButton.js';
import { Filter, RotateCcw, Check } from 'lucide-react';

export interface FilterState {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  material?: string;
  inStockOnly?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  categories: Category[];
  onReset: () => void;
}

const COMMON_COLORS = [
  'Red',
  'Gold',
  'Blue',
  'Green',
  'Yellow',
  'Pink',
  'Maroon',
  'Ivory',
  'Orange',
  'Purple',
];

const COMMON_MATERIALS = [
  'All Materials',
  'Pure Muga Silk',
  'Paat Silk',
  'Katan Silk',
  'Eri Silk',
  'Chanderi',
  'Georgette',
  'Cotton Handloom',
  'Organza',
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  categories,
  onReset,
}) => {
  const handleCategoryClick = (slug: string) => {
    onChange({
      ...filters,
      category: filters.category === slug ? undefined : slug,
    });
  };

  const handleColorClick = (color: string) => {
    onChange({
      ...filters,
      color: filters.color === color ? undefined : color,
    });
  };

  return (
    <BrutalCard bg="bg-[#FAF7EE]" shadow="md" className="p-4 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#121212]">
        <div className="flex items-center gap-1.5 font-black uppercase text-sm text-[#121212]">
          <Filter size={16} strokeWidth={2.5} />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-mono font-bold flex items-center gap-1 text-neutral-600 hover:text-black cursor-pointer"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* In-Stock Toggle */}
      <div className="p-3 bg-white border-2 border-[#121212] shadow-brutal-sm">
        <label className="flex items-center justify-between cursor-pointer select-none">
          <span className="text-xs font-black uppercase tracking-wider">
            In-Stock In Shop Only
          </span>
          <input
            type="checkbox"
            checked={!!filters.inStockOnly}
            onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
            className="w-4 h-4 accent-[#00E599] cursor-pointer"
          />
        </label>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs font-black uppercase tracking-wider mb-2 text-[#121212]">
          Category
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const isSelected = filters.category === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`text-xs px-2.5 py-1 border-2 border-[#121212] font-bold uppercase transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFE600] shadow-brutal-sm translate-x-0.5 translate-y-0.5'
                    : 'bg-white hover:bg-neutral-100'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-black uppercase tracking-wider mb-2 text-[#121212]">
          Budget (₹ INR)
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-mono font-bold text-neutral-600 mb-0.5">MIN (₹)</label>
            <input
              type="number"
              placeholder="0"
              value={filters.minPrice ?? ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  minPrice: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full px-2 py-1.5 bg-white border-2 border-[#121212] text-xs font-mono font-bold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono font-bold text-neutral-600 mb-0.5">MAX (₹)</label>
            <input
              type="number"
              placeholder="50000"
              value={filters.maxPrice ?? ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  maxPrice: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full px-2 py-1.5 bg-white border-2 border-[#121212] text-xs font-mono font-bold focus:outline-none"
            />
          </div>
        </div>

        {/* Quick price chips */}
        <div className="flex flex-wrap gap-1 mt-2">
          {[
            { label: '< ₹5,000', max: 5000 },
            { label: '< ₹10,000', max: 10000 },
            { label: '< ₹25,000', max: 25000 },
          ].map((chip) => (
            <button
              key={chip.label}
              onClick={() => onChange({ ...filters, maxPrice: chip.max, minPrice: undefined })}
              className={`text-[10px] px-1.5 py-0.5 border border-[#121212] font-mono ${
                filters.maxPrice === chip.max && !filters.minPrice ? 'bg-[#FFE600] font-black' : 'bg-white'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h4 className="text-xs font-black uppercase tracking-wider mb-2 text-[#121212]">
          Color
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_COLORS.map((color) => {
            const isSelected = filters.color?.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={color}
                onClick={() => handleColorClick(color)}
                className={`text-xs px-2 py-0.5 border-2 border-[#121212] font-bold font-mono transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FF6EA7] shadow-brutal-sm font-black'
                    : 'bg-white hover:bg-neutral-100'
                }`}
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fabric / Material */}
      <div>
        <h4 className="text-xs font-black uppercase tracking-wider mb-2 text-[#121212]">
          Material
        </h4>
        <select
          value={filters.material || 'All Materials'}
          onChange={(e) =>
            onChange({
              ...filters,
              material: e.target.value === 'All Materials' ? undefined : e.target.value,
            })
          }
          className="w-full px-2 py-1.5 bg-white border-2 border-[#121212] text-xs font-mono font-bold focus:outline-none"
        >
          {COMMON_MATERIALS.map((mat) => (
            <option key={mat} value={mat}>
              {mat}
            </option>
          ))}
        </select>
      </div>
    </BrutalCard>
  );
};

export default FilterPanel;
