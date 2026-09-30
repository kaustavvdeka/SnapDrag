import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLocation } from '../context/LocationContext.js';
import SearchBar from '../components/common/SearchBar.js';
import FilterPanel, { FilterState } from '../components/products/FilterPanel.js';
import ProductCard from '../components/products/ProductCard.js';
import ReservationModal from '../components/reservations/ReservationModal.js';
import BrutalButton from '../components/common/BrutalButton.js';
import BrutalCard from '../components/common/BrutalCard.js';
import { Product, Category } from '../types/index.js';
import api from '../api/client.js';
import { SlidersHorizontal, MapPin, X, ArrowUpDown, PackageX } from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCity } = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedProductForReserve, setSelectedProductForReserve] = useState<Product | null>(null);

  // Parse filters from URL
  const queryParam = searchParams.get('query') || '';
  const categoryParam = searchParams.get('category') || undefined;
  const minPriceParam = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPriceParam = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const colorParam = searchParams.get('color') || undefined;
  const materialParam = searchParams.get('material') || undefined;
  const inStockOnlyParam = searchParams.get('inStockOnly') === 'true';
  const sortByParam = (searchParams.get('sortBy') as any) || 'newest';

  const [filters, setFilters] = useState<FilterState>({
    category: categoryParam,
    minPrice: minPriceParam,
    maxPrice: maxPriceParam,
    color: colorParam,
    material: materialParam,
    inStockOnly: inStockOnlyParam,
    sortBy: sortByParam,
  });

  // Load Categories once
  useEffect(() => {
    api.get('/categories')
      .then((res: any) => setCategories(res.data || []))
      .catch(console.error);
  }, []);

  // Fetch Products whenever filters, query, or city change
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (queryParam) params.set('query', queryParam);
        if (filters.category) params.set('category', filters.category);
        if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice.toString());
        if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice.toString());
        if (filters.color) params.set('color', filters.color);
        if (filters.material) params.set('material', filters.material);
        if (filters.inStockOnly) params.set('inStockOnly', 'true');
        if (filters.sortBy) params.set('sortBy', filters.sortBy);
        params.set('city', selectedCity);
        params.set('limit', '30');

        const res: any = await api.get(`/products?${params.toString()}`);
        setProducts(res.data.products || []);
        setTotalProducts(res.data.pagination?.total || 0);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [queryParam, filters, selectedCity]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    const newParams = new URLSearchParams(searchParams);

    if (newFilters.category) newParams.set('category', newFilters.category);
    else newParams.delete('category');

    if (newFilters.minPrice !== undefined) newParams.set('minPrice', newFilters.minPrice.toString());
    else newParams.delete('minPrice');

    if (newFilters.maxPrice !== undefined) newParams.set('maxPrice', newFilters.maxPrice.toString());
    else newParams.delete('maxPrice');

    if (newFilters.color) newParams.set('color', newFilters.color);
    else newParams.delete('color');

    if (newFilters.material) newParams.set('material', newFilters.material);
    else newParams.delete('material');

    if (newFilters.inStockOnly) newParams.set('inStockOnly', 'true');
    else newParams.delete('inStockOnly');

    if (newFilters.sortBy) newParams.set('sortBy', newFilters.sortBy);

    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setFilters({ sortBy: 'newest' });
    const newParams = new URLSearchParams();
    if (queryParam) newParams.set('query', queryParam);
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (query: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (query.trim()) newParams.set('query', query.trim());
    else newParams.delete('query');
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Header & Search Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-black uppercase text-[#FF4D4D]">
                <MapPin size={14} /> Showing Stock In: <strong className="text-[#121212]">{selectedCity}</strong>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#121212]">
                EXPLORE TRADITIONAL CLOTHING
              </h1>
            </div>

            {/* Mobile Filter Toggle Button */}
            <div className="md:hidden flex gap-2">
              <BrutalButton
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              >
                <SlidersHorizontal size={14} className="mr-1.5" />
                Filters
              </BrutalButton>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl">
            <SearchBar
              initialValue={queryParam}
              onSearch={handleSearchSubmit}
              placeholder='Try "red silk saree under 8000", "mekhela chador", "chikankari"'
            />
          </div>

          {/* Active Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-mono">
            <span className="font-bold text-neutral-600">Active Filters:</span>
            {queryParam && (
              <span className="bg-[#FFE600] px-2 py-0.5 border border-[#121212] font-black flex items-center gap-1">
                Query: "{queryParam}"
                <X size={12} className="cursor-pointer" onClick={() => handleSearchSubmit('')} />
              </span>
            )}
            {filters.category && (
              <span className="bg-white px-2 py-0.5 border border-[#121212] font-bold flex items-center gap-1">
                {filters.category}
                <X
                  size={12}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange({ ...filters, category: undefined })}
                />
              </span>
            )}
            {filters.maxPrice && (
              <span className="bg-white px-2 py-0.5 border border-[#121212] font-bold flex items-center gap-1">
                ≤ ₹{filters.maxPrice.toLocaleString('en-IN')}
                <X
                  size={12}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange({ ...filters, maxPrice: undefined })}
                />
              </span>
            )}
            {filters.color && (
              <span className="bg-[#FF6EA7] px-2 py-0.5 border border-[#121212] font-bold flex items-center gap-1">
                {filters.color}
                <X
                  size={12}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange({ ...filters, color: undefined })}
                />
              </span>
            )}
            {filters.material && (
              <span className="bg-white px-2 py-0.5 border border-[#121212] font-bold flex items-center gap-1">
                {filters.material}
                <X
                  size={12}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange({ ...filters, material: undefined })}
                />
              </span>
            )}
            {filters.inStockOnly && (
              <span className="bg-[#00E599] px-2 py-0.5 border border-[#121212] font-bold flex items-center gap-1">
                ✓ In-Stock Only
                <X
                  size={12}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange({ ...filters, inStockOnly: false })}
                />
              </span>
            )}
          </div>
        </div>

        {/* Main Content Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden md:block md:col-span-1 sticky top-24">
            <FilterPanel
              filters={filters}
              onChange={handleFilterChange}
              categories={categories}
              onReset={handleResetFilters}
            />
          </aside>

          {/* Mobile Filter Drawer */}
          {isMobileFilterOpen && (
            <div className="md:hidden col-span-1 mb-4">
              <FilterPanel
                filters={filters}
                onChange={(f) => {
                  handleFilterChange(f);
                  setIsMobileFilterOpen(false);
                }}
                categories={categories}
                onReset={handleResetFilters}
              />
            </div>
          )}

          {/* Products Grid & Results */}
          <main className="md:col-span-3 space-y-4">
            {/* Sorting bar & Counter */}
            <div className="flex items-center justify-between bg-white border-2 border-[#121212] p-3 shadow-brutal-sm text-xs font-mono">
              <span className="font-bold text-[#121212]">
                Found <strong>{totalProducts}</strong> traditional piece{totalProducts === 1 ? '' : 's'}
              </span>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline font-bold">Sort By:</span>
                <select
                  value={filters.sortBy || 'newest'}
                  onChange={(e) => handleFilterChange({ ...filters, sortBy: e.target.value as any })}
                  className="bg-[#FAF7EE] border border-[#121212] px-2 py-1 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Loading Skeleton */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-96 bg-neutral-200 border-3 border-[#121212] animate-pulse" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onReserveClick={(prod) => setSelectedProductForReserve(prod)}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <BrutalCard bg="bg-white" shadow="lg" className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-[#FFE600] border-3 border-[#121212] shadow-brutal flex items-center justify-center mx-auto">
                  <PackageX size={32} className="text-[#121212]" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-black uppercase text-[#121212]">
                  No Traditional Pieces Found
                </h3>
                <p className="text-xs text-neutral-600 font-mono max-w-md mx-auto">
                  We couldn't find matches for your current filters in {selectedCity}. Try resetting your budget or exploring all categories.
                </p>
                <div className="pt-2">
                  <BrutalButton variant="primary" size="md" onClick={handleResetFilters}>
                    Reset All Filters
                  </BrutalButton>
                </div>
              </BrutalCard>
            )}
          </main>
        </div>
      </div>

      {/* Global In-Store Reservation Modal */}
      <ReservationModal
        product={selectedProductForReserve}
        isOpen={!!selectedProductForReserve}
        onClose={() => setSelectedProductForReserve(null)}
      />
    </div>
  );
};

export default ExplorePage;
