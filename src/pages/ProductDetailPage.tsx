import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ImageGallery from '../components/products/ImageGallery.js';
import BrutalButton from '../components/common/BrutalButton.js';
import BrutalBadge from '../components/common/BrutalBadge.js';
import BrutalCard from '../components/common/BrutalCard.js';
import ReservationModal from '../components/reservations/ReservationModal.js';
import ProductCard from '../components/products/ProductCard.js';
import { Product } from '../types/index.js';
import api from '../api/client.js';
import {
  MapPin,
  Building2,
  Navigation,
  Clock,
  Phone,
  ShieldCheck,
  BookmarkCheck,
  CheckCircle,
  AlertCircle,
  Share2,
  Heart,
  Store,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import TryOnModal from '../components/products/TryOnModal.js';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [isTryOnModalOpen, setIsTryOnModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res: any = await api.get(`/products/${id}`);
        setProduct(res.data);

        // Fetch similar products in same category
        if (res.data.categoryId) {
          const simRes: any = await api.get(`/products?category=${res.data.category?.slug}&limit=4`);
          setSimilarProducts((simRes.data.products || []).filter((p: Product) => p.id !== id));
        }
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      alert('Please log in as a customer to save favorites.');
      return;
    }
    if (!product) return;
    try {
      const res: any = await api.post(`/favorites/toggle/${product.id}`);
      setIsFavorited(res.data.isFavorited);
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7EE] py-12 px-4 max-w-7xl mx-auto flex items-center justify-center">
        <div className="text-center font-mono font-bold text-sm">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF7EE] py-12 px-4 max-w-md mx-auto text-center space-y-4">
        <h2 className="text-2xl font-black uppercase">Product Not Found</h2>
        <Link to="/explore">
          <BrutalButton variant="primary">Back to Catalog</BrutalButton>
        </Link>
      </div>
    );
  }

  const isAvailable = product.availableQuantity > 0;
  const location = product.shop?.location;

  return (
    <div className="min-h-screen bg-[#FAF7EE] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-600 mb-6 truncate">
          <Link to="/" className="hover:underline">Home</Link>
          <ChevronRight size={12} />
          <Link to="/explore" className="hover:underline">Explore</Link>
          <ChevronRight size={12} />
          {product.category && (
            <>
              <Link to={`/explore?category=${product.category.slug}`} className="hover:underline">
                {product.category.name}
              </Link>
              <ChevronRight size={12} />
            </>
          )}
          <span className="text-[#121212] truncate">{product.name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Gallery (5 cols) */}
          <div className="lg:col-span-6">
            <ImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Right: Info & Actions (7 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {/* Badges strip */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {product.category && (
                  <BrutalBadge variant="yellow" size="sm">
                    {product.category.name}
                  </BrutalBadge>
                )}
                <span className="text-xs font-mono text-neutral-500 font-bold">
                  SKU: {product.sku}
                </span>
                <span className="ml-auto">
                  {isAvailable ? (
                    <BrutalBadge variant="green" size="sm">
                      ✓ In-Store: {product.availableQuantity} pieces ready
                    </BrutalBadge>
                  ) : (
                    <BrutalBadge variant="red" size="sm">
                      ✕ Currently Out of Stock
                    </BrutalBadge>
                  )}
                </span>
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-[#121212] leading-tight">
                {product.name}
              </h1>

              {/* Price Row */}
              <div className="mt-4 p-4 bg-white border-3 border-[#121212] shadow-brutal-sm flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-black text-[#121212]">
                    ₹{product.discountedPrice.toLocaleString('en-IN')}
                  </span>
                  {product.discountPercent > 0 && (
                    <span className="text-sm line-through text-neutral-500 ml-3 font-mono">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="block text-[10px] font-mono text-neutral-600 mt-0.5">
                    Pay at store upon physical inspection • Inclusive of all taxes
                  </span>
                </div>

                {product.discountPercent > 0 && (
                  <span className="bg-[#FFE600] px-2 py-1 border-2 border-[#121212] font-black text-xs uppercase shadow-brutal-sm">
                    {product.discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Specifications Matrix */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-white border-2 border-[#121212] shadow-brutal-sm text-center">
                <span className="block text-[10px] font-mono font-bold uppercase text-neutral-500">Fabric</span>
                <span className="font-black text-xs text-[#121212]">{product.material}</span>
              </div>
              <div className="p-3 bg-white border-2 border-[#121212] shadow-brutal-sm text-center">
                <span className="block text-[10px] font-mono font-bold uppercase text-neutral-500">Color Tone</span>
                <span className="font-black text-xs text-[#121212]">{product.color}</span>
              </div>
              <div className="p-3 bg-white border-2 border-[#121212] shadow-brutal-sm text-center">
                <span className="block text-[10px] font-mono font-bold uppercase text-neutral-500">Sizing</span>
                <span className="font-black text-xs text-[#121212]">{product.size}</span>
              </div>
            </div>

            {/* Product Description */}
            <div className="p-4 bg-white border-2 border-[#121212] shadow-brutal-sm">
              <h3 className="font-black text-xs uppercase tracking-wider text-neutral-500 mb-2">
                Weave & Artisan Description
              </h3>
              <p className="text-sm text-neutral-800 leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

            {/* PHYSICAL SHOP LOCATION & MALL NAVIGATION CARD */}
            {product.shop && (
              <BrutalCard bg="bg-[#FAF7EE]" shadow="md" className="p-4 border-3 border-[#121212] space-y-3">
                <div className="flex items-start justify-between pb-3 border-b-2 border-[#121212]">
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-[#FFE600] px-1.5 py-0.5 border border-[#121212]">
                      Available At Physical Shop
                    </span>
                    <h3 className="font-black text-lg text-[#121212] mt-1 flex items-center gap-1.5">
                      <Store size={18} /> {product.shop.name}
                    </h3>
                  </div>

                  <Link to={`/shops/${product.shop.id}`}>
                    <BrutalButton variant="outline" size="sm">
                      View Store Profile
                    </BrutalButton>
                  </Link>
                </div>

                {/* Navigation Coordinates Breakdown */}
                {location && (
                  <div className="space-y-2 text-xs font-mono text-neutral-800">
                    {/* Mall / Floor / Shop# */}
                    <div className="p-3 bg-white border-2 border-[#121212] shadow-brutal-sm space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-sm text-[#121212]">
                        <Building2 size={16} className="text-[#FF4D4D] shrink-0" />
                        <span>
                          {location.mall?.name || 'High Street Commercial Arcade'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-neutral-200">
                        <div>
                          <span className="text-neutral-500 block text-[10px]">FLOOR:</span>
                          <span className="font-black text-[#121212]">{location.floorName || 'Ground Floor'}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block text-[10px]">SHOP NUMBER:</span>
                          <span className="font-black text-[#121212]">{location.shopNumber || 'Front Showroom'}</span>
                        </div>
                      </div>

                      {location.nearbyLandmark && (
                        <p className="text-[11px] text-neutral-700 pt-1">
                          📍 <strong>Landmark:</strong> {location.nearbyLandmark}
                        </p>
                      )}

                      {location.indoorDirections && (
                        <p className="text-[11px] text-neutral-600 bg-amber-50 p-2 border border-amber-300">
                          🚶 <strong>Directions:</strong> {location.indoorDirections}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-neutral-600 px-1">
                      <span className="flex items-center gap-1 font-bold">
                        <Clock size={13} /> {product.shop.openingHours || '10:00 AM - 9:00 PM'}
                      </span>
                      <span className="flex items-center gap-1 font-bold">
                        <Phone size={13} /> {product.shop.phone}
                      </span>
                    </div>
                  </div>
                )}
              </BrutalCard>
            )}

            {/* AI Virtual Try-On Highlight CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsTryOnModalOpen(true)}
                className="w-full bg-[#FFE600] hover:bg-[#FFF066] text-[#121212] font-black uppercase text-sm sm:text-base py-3.5 px-4 border-3 border-[#121212] shadow-brutal hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-brutal-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Sparkles size={20} className="text-[#121212] fill-[#121212]" />
                <span>TRY YOURSELF — AI VIRTUAL MIRROR</span>
                <span className="text-[10px] font-mono bg-[#121212] text-[#FFE600] px-1.5 py-0.5 border border-[#121212] font-bold">
                  GEMINI AI
                </span>
              </button>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div className="sm:col-span-3">
                  <BrutalButton
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={!isAvailable}
                    onClick={() => setIsReserveModalOpen(true)}
                  >
                    <BookmarkCheck size={20} className="mr-2" />
                    RESERVE & VISIT SHOP (FREE)
                  </BrutalButton>
                </div>

                <div className="sm:col-span-1">
                  <BrutalButton
                    variant="outline"
                    size="lg"
                    fullWidth
                    onClick={handleFavoriteToggle}
                    title="Save to favorites"
                  >
                    <Heart
                      size={20}
                      className={isFavorited ? 'fill-[#FF4D4D] text-[#FF4D4D]' : ''}
                      strokeWidth={2.5}
                    />
                  </BrutalButton>
                </div>
              </div>

              <p className="text-center text-xs font-mono text-neutral-600">
                🔒 Free 48-hour hold. Zero online charge. Inspect and pay in store.
              </p>
            </div>
          </div>
        </div>

        {/* Similar Products Carousel */}
        {similarProducts.length > 0 && (
          <div className="mt-20 pt-8 border-t-4 border-[#121212]">
            <h2 className="text-2xl font-black uppercase text-[#121212] mb-6">
              Similar Handlooms & Outfits In {product.shop?.location?.city || 'Your Area'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reserve & Visit Modal */}
      <ReservationModal
        product={product}
        isOpen={isReserveModalOpen}
        onClose={() => setIsReserveModalOpen(false)}
      />

      {/* AI Virtual Try-On Modal */}
      {product && isTryOnModalOpen && (
        <TryOnModal
          product={product}
          isOpen={isTryOnModalOpen}
          onClose={() => setIsTryOnModalOpen(false)}
          onReserveClick={() => setIsReserveModalOpen(true)}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;
