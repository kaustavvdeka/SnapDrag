import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLocation } from '../context/LocationContext.js';
import ShopCard from '../components/shops/ShopCard.js';
import BrutalButton from '../components/common/BrutalButton.js';
import BrutalCard from '../components/common/BrutalCard.js';
import { Shop } from '../types/index.js';
import api from '../api/client.js';
import { Store, MapPin, Search, Compass, Building2, SlidersHorizontal } from 'lucide-react';

export const ShopsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { selectedCity, setSelectedCity, availableCities } = useLocation();

  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const fetchShops = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedCity) queryParams.set('city', selectedCity);
        if (searchTerm) queryParams.set('search', searchTerm);

        const res: any = await api.get(`/shops?${queryParams.toString()}`);
        setShops(res.data || []);
      } catch (err) {
        console.error('Failed to load shops:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShops();
  }, [selectedCity, searchTerm]);

  return (
    <div className="min-h-screen bg-[#FAF7EE] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b-4 border-[#121212]">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-black uppercase text-[#FF4D4D] mb-1">
              <MapPin size={14} /> City: {selectedCity}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#121212]">
              TRADITIONAL SHOPS & BOUTIQUES
            </h1>
            <p className="text-sm font-medium text-neutral-700 mt-2 max-w-2xl">
              Locate physical shops, master weavers, and mall showrooms. Walk in directly or reserve an outfit beforehand.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/map">
              <BrutalButton variant="accent" size="md">
                <Compass size={16} className="mr-1.5" />
                Map View
              </BrutalButton>
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by shop name or mall..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#121212] shadow-brutal-sm text-xs font-mono font-bold focus:outline-none"
            />
          </div>

          {/* Quick City Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
            <span className="text-xs font-mono font-bold text-neutral-600 shrink-0">City:</span>
            {availableCities.slice(0, 6).map((c) => (
              <button
                key={c.city}
                onClick={() => setSelectedCity(c.city)}
                className={`text-xs px-2.5 py-1 border-2 border-[#121212] font-mono font-bold shrink-0 transition-all cursor-pointer ${
                  selectedCity.toLowerCase() === c.city.toLowerCase()
                    ? 'bg-[#FFE600] shadow-brutal-sm'
                    : 'bg-white hover:bg-neutral-100'
                }`}
              >
                {c.city}
              </button>
            ))}
          </div>
        </div>

        {/* Shops Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 bg-neutral-200 border-3 border-[#121212] animate-pulse" />
            ))}
          </div>
        ) : shops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        ) : (
          <BrutalCard bg="bg-white" shadow="lg" className="p-12 text-center space-y-4">
            <Store size={40} className="mx-auto text-neutral-400" />
            <h3 className="text-xl font-black uppercase text-[#121212]">
              No Shops Registered in {selectedCity} Yet
            </h3>
            <p className="text-xs font-mono text-neutral-600 max-w-md mx-auto">
              Are you a traditional clothing boutique or loom owner in {selectedCity}? Register your shop today.
            </p>
            <div className="pt-2">
              <Link to="/register?role=SHOPKEEPER">
                <BrutalButton variant="primary">Register Your Shop</BrutalButton>
              </Link>
            </div>
          </BrutalCard>
        )}
      </div>
    </div>
  );
};

export default ShopsPage;
