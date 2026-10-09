import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import BrutalCard from '../components/common/BrutalCard.js';
import BrutalBadge from '../components/common/BrutalBadge.js';
import BrutalButton from '../components/common/BrutalButton.js';
import ProductCard from '../components/products/ProductCard.js';
import ReservationModal from '../components/reservations/ReservationModal.js';
import { Shop, Product } from '../types/index.js';
import api from '../api/client.js';
import {
  MapPin,
  Building2,
  Phone,
  Mail,
  Clock,
  Star,
  CheckCircle,
  Share2,
  Navigation,
} from 'lucide-react';

export const ShopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductForReserve, setSelectedProductForReserve] = useState<Product | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchShop = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res: any = await api.get(`/shops/${id}`);
        setShop(res.data);
        setProducts(res.data.products || []);
      } catch (err) {
        console.error('Failed to load shop:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShop();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7EE] py-12 px-4 max-w-7xl mx-auto flex items-center justify-center">
        <div className="font-mono font-bold text-sm">Loading shop showcase...</div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#FAF7EE] py-12 px-4 max-w-md mx-auto text-center space-y-4">
        <h2 className="text-2xl font-black uppercase">Shop Not Found</h2>
        <Link to="/shops">
          <BrutalButton variant="primary">Back to Shops</BrutalButton>
        </Link>
      </div>
    );
  }

  const location = shop.location;

  // Extract unique categories from products
  const categoriesInShop = Array.from(
    new Set(products.map((p) => p.category?.name).filter(Boolean))
  ) as string[];

  const filteredProducts =
    activeCategoryTab === 'all'
      ? products
      : products.filter((p) => p.category?.name === activeCategoryTab);

  return (
    <div className="min-h-screen bg-[#FAF7EE] pb-16">
      {/* Shop Banner Area */}
      <div className="relative h-64 md:h-80 bg-neutral-200 border-b-4 border-[#121212] overflow-hidden">
        <img
          src={shop.bannerUrl || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1600&q=80'}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="absolute bottom-4 left-4 sm:left-8 flex items-end gap-4 z-10">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white border-3 border-[#121212] shadow-brutal overflow-hidden shrink-0">
            <img
              src={shop.logoUrl || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&q=80'}
              alt={shop.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-white pb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-[#FFE600] text-[#121212] px-1.5 py-0.5 border border-[#121212]">
                ✓ VERIFIED STORE
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight drop-shadow-md">
              {shop.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Shop Info Card & Location Box */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left: About & Contact */}
          <BrutalCard bg="bg-white" shadow="md" className="p-5 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#121212]">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-[#FFE600] px-2 py-1 border border-[#121212] font-black text-sm">
                  <Star size={14} className="fill-[#121212]" />
                  {shop.rating.toFixed(1)}
                  <span className="text-xs font-mono text-neutral-600">({shop.reviewCount} customer reviews)</span>
                </div>
              </div>

              <div className="text-xs font-mono font-bold text-neutral-600">
                Member of Vastrix Artisan Network
              </div>
            </div>

            <p className="text-sm text-neutral-800 leading-relaxed font-medium">
              {shop.description || 'Traditional clothing store offering handwoven regional apparel.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-neutral-800 font-bold">
                <Clock size={16} className="text-neutral-500" />
                <span>Hours: {shop.openingHours || '10:00 AM - 9:00 PM'}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-800 font-bold">
                <Phone size={16} className="text-neutral-500" />
                <span>Contact: {shop.phone}</span>
              </div>
            </div>
          </BrutalCard>

          {/* Right: Mall / Floor Directions Card */}
          <BrutalCard bg="bg-[#FAF7EE]" shadow="md" className="p-5 border-3 border-[#121212] space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-[#121212]">
              <MapPin size={18} className="text-[#FF4D4D]" />
              <h3 className="font-black text-sm uppercase text-[#121212]">
                Exact In-Store Location
              </h3>
            </div>

            {location ? (
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 bg-white border-2 border-[#121212] shadow-brutal-sm">
                  <p className="font-black text-sm text-[#121212] flex items-center gap-1 mb-1">
                    <Building2 size={15} /> {location.mall?.name || 'Commercial High Street'}
                  </p>
                  <p className="text-neutral-600">{location.address}, {location.city}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-white border border-[#121212]">
                    <span className="block text-[10px] text-neutral-500">FLOOR:</span>
                    <strong className="text-xs">{location.floorName || 'Ground Floor'}</strong>
                  </div>
                  <div className="p-2 bg-white border border-[#121212]">
                    <span className="block text-[10px] text-neutral-500">SHOP NUMBER:</span>
                    <strong className="text-xs">{location.shopNumber || 'Shop Front'}</strong>
                  </div>
                </div>

                {location.nearbyLandmark && (
                  <p className="text-[11px] text-neutral-700 p-2 bg-white border border-neutral-300">
                    📍 <strong>Landmark:</strong> {location.nearbyLandmark}
                  </p>
                )}

                {location.indoorDirections && (
                  <p className="text-[11px] text-neutral-700 p-2 bg-amber-50 border border-amber-300">
                    🚶 <strong>Directions:</strong> {location.indoorDirections}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-neutral-600 font-mono">Location coordinates not specified.</p>
            )}
          </BrutalCard>
        </div>

        {/* Shop Outfits Catalog */}
        <div className="mt-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-4 border-[#121212]">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#121212]">
                Available In-Store Catalog ({products.length})
              </h2>
              <p className="text-xs font-mono text-neutral-600 mt-0.5">
                Every piece shown below is physically available inside {shop.name}.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveCategoryTab('all')}
                className={`text-xs px-3 py-1 border-2 border-[#121212] font-black uppercase transition-all ${
                  activeCategoryTab === 'all'
                    ? 'bg-[#FFE600] shadow-brutal-sm'
                    : 'bg-white hover:bg-neutral-100'
                }`}
              >
                All Pieces
              </button>
              {categoriesInShop.map((catName) => (
                <button
                  key={catName}
                  onClick={() => setActiveCategoryTab(catName)}
                  className={`text-xs px-3 py-1 border-2 border-[#121212] font-black uppercase transition-all ${
                    activeCategoryTab === catName
                      ? 'bg-[#FFE600] shadow-brutal-sm'
                      : 'bg-white hover:bg-neutral-100'
                  }`}
                >
                  {catName}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onReserveClick={(prod) => setSelectedProductForReserve(prod)}
              />
            ))}
          </div>
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

export default ShopDetailPage;
