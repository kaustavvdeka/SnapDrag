import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from '../context/LocationContext.js';
import SearchBar from '../components/common/SearchBar.js';
import BrutalButton from '../components/common/BrutalButton.js';
import BrutalBadge from '../components/common/BrutalBadge.js';
import BrutalCard from '../components/common/BrutalCard.js';
import ProductCard from '../components/products/ProductCard.js';
import ShopCard from '../components/shops/ShopCard.js';
import ReservationModal from '../components/reservations/ReservationModal.js';
import { Product, Shop, Category } from '../types/index.js';
import api from '../api/client.js';
import {
  MapPin,
  Sparkles,
  ArrowRight,
  Eye,
  Store,
  BookmarkCheck,
  ShoppingBag,
  ShieldCheck,
  CheckCircle,
  Clock,
  Compass,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { selectedCity } = useLocation();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [nearbyShops, setNearbyShops] = useState<Shop[]>([]);
  const [selectedProductForReserve, setSelectedProductForReserve] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setIsLoading(true);
        const [catRes, prodRes, shopRes]: any = await Promise.all([
          api.get('/categories'),
          api.get(`/products?city=${selectedCity}&limit=8`),
          api.get(`/shops?city=${selectedCity}`),
        ]);

        setCategories(catRes.data || []);
        setFeaturedProducts(prodRes.data.products || []);
        setNearbyShops(shopRes.data || []);
      } catch (err) {
        console.error('Failed to load landing data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, [selectedCity]);

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative bg-[#FAF7EE] border-b-4 border-[#121212] py-12 md:py-20 px-4 overflow-hidden">
        {/* Background decorative neo-brutalist blocks */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-[#FFE600] border-4 border-[#121212] shadow-brutal -rotate-6 pointer-events-none hidden md:block" />
        <div className="absolute top-1/2 -left-12 w-36 h-36 bg-[#FF6EA7] border-4 border-[#121212] shadow-brutal rotate-12 pointer-events-none hidden md:block" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 mb-4 bg-white border-2 border-[#121212] px-3 py-1 shadow-brutal-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E599] animate-ping" />
              <span className="text-xs font-mono font-black uppercase text-[#121212]">
                Traditional Clothing Discovery • {selectedCity}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-[#121212] leading-[0.95]">
              FIND IT ONLINE.<br />
              <span className="bg-[#FFE600] px-2 py-0.5 border-3 border-[#121212] shadow-brutal-sm inline-block my-1">
                FEEL IT IRL.
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-lg sm:text-xl text-neutral-800 font-medium leading-relaxed max-w-2xl">
              Discover unique sarees, mekhela chadors, and lehengas from local traditional shops.
              Check real in-store stock, get the exact mall floor & shop number, and reserve for 48 hours before you visit.
            </p>

            {/* Primary Search Bar */}
            <div className="mt-8 max-w-2xl">
              <SearchBar size="lg" placeholder='Search e.g. "red mekhela under 5000", "silk saree", "wedding lehenga"' />
            </div>

            {/* Quick CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/explore">
                <BrutalButton variant="primary" size="lg">
                  Explore Clothing <ArrowRight size={18} className="ml-1" />
                </BrutalButton>
              </Link>

              <Link to="/shops">
                <BrutalButton variant="outline" size="lg">
                  Browse {nearbyShops.length || 10} Local Shops
                </BrutalButton>
              </Link>
            </div>

            {/* Quick Stat Pill */}
            <div className="mt-10 flex flex-wrap items-center gap-4 text-xs font-mono font-bold text-neutral-700">
              <div className="flex items-center gap-1.5">
                <CheckCircle size={15} className="text-[#00E599]" strokeWidth={3} />
                <span>Zero Online Payment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={15} className="text-[#00E599]" strokeWidth={3} />
                <span>48h Free In-Store Hold</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={15} className="text-[#00E599]" strokeWidth={3} />
                <span>Exact Mall Floor Directions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY SECTION */}
      <section className="py-16 px-4 bg-white border-b-4 border-[#121212]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-mono font-black uppercase text-neutral-500">
                Curated Collections
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#121212]">
                SHOP BY CATEGORY
              </h2>
            </div>
            <Link to="/explore">
              <BrutalButton variant="outline" size="sm">
                View All Categories →
              </BrutalButton>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((cat, idx) => {
              const bgColors = [
                'bg-[#FFE600]',
                'bg-[#FF6EA7]',
                'bg-[#00E599]',
                'bg-[#38BDF8]',
                'bg-[#A388EE]',
                'bg-[#FF914D]',
              ];
              const accentBg = bgColors[idx % bgColors.length];

              return (
                <Link
                  key={cat.id}
                  to={`/explore?category=${cat.slug}`}
                  className="group"
                >
                  <BrutalCard
                    bg="bg-white"
                    shadow="md"
                    hoverEffect
                    className="overflow-hidden flex flex-col h-full"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 border-b-2 border-[#121212]">
                      <img
                        src={cat.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80'}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 border border-[#121212] shadow-brutal-sm ${accentBg}`}>
                          {cat._count?.products || 12}+ Items
                        </span>
                      </div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <h3 className="font-black text-sm uppercase text-[#121212] group-hover:text-[#FF6EA7] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-neutral-600 line-clamp-1 font-mono mt-0.5">
                        {cat.description}
                      </p>
                    </div>
                  </BrutalCard>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRENDING NEAR YOU (FEATURED PRODUCTS) */}
      <section className="py-16 px-4 bg-[#FAF7EE] border-b-4 border-[#121212]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-black uppercase text-[#FF4D4D] mb-1">
                <MapPin size={14} /> Available In {selectedCity} Physical Stores
              </div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#121212]">
                TRENDING IN LOCAL STORES
              </h2>
            </div>
            <Link to="/explore">
              <BrutalButton variant="primary" size="md">
                Browse Full Catalog ({featuredProducts.length * 10}+ Items)
              </BrutalButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onReserveClick={(prod) => setSelectedProductForReserve(prod)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (SECTION 24) */}
      <section className="py-16 px-4 bg-[#FFE600] border-b-4 border-[#121212]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-black uppercase bg-white px-2 py-0.5 border border-[#121212]">
              The In-Store Discovery Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#121212] mt-2">
              HOW VASTRIX WORKS
            </h2>
            <p className="text-sm font-medium text-neutral-800 mt-2">
              Forget waiting for couriers or getting cheap synthetic knockoffs. Check the real shop before you make the trip.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'DISCOVER',
                desc: 'Browse handlooms and regional ethnic wear available in your local shops.',
                icon: <Eye size={24} />,
              },
              {
                step: '02',
                title: 'CHECK',
                desc: 'Verify exact in-store stock, live price, and read fabric specifications.',
                icon: <ShieldCheck size={24} />,
              },
              {
                step: '03',
                title: 'RESERVE',
                desc: 'Click "Reserve & Visit". Instant reservation code holds item for 48 hours for free.',
                icon: <BookmarkCheck size={24} />,
              },
              {
                step: '04',
                title: 'VISIT SHOP',
                desc: 'Use our exact mall floor, shop number & landmark directions to walk straight in.',
                icon: <Store size={24} />,
              },
              {
                step: '05',
                title: 'INSPECT & BUY',
                desc: 'Touch the silk, verify the zari work, try the fit, and pay the shopkeeper offline.',
                icon: <ShoppingBag size={24} />,
              },
            ].map((item) => (
              <BrutalCard
                key={item.step}
                bg="bg-white"
                shadow="md"
                className="p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black font-mono bg-[#121212] text-white px-2 py-0.5">
                      {item.step}
                    </span>
                    <div className="p-2 bg-[#FAF7EE] border-2 border-[#121212]">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="font-black text-base uppercase text-[#121212]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-700 font-mono mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </BrutalCard>
            ))}
          </div>
        </div>
      </section>

      {/* WHY LOCAL? (SECTION 24) */}
      <section className="py-16 px-4 bg-white border-b-4 border-[#121212]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-mono font-black uppercase text-[#FF4D4D]">
                Experience Traditional Clothing The Right Way
              </span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#121212] mt-2">
                WHY LOCAL SHOPPING BEATS ONLINE RETURNS
              </h2>
              <p className="text-base text-neutral-700 mt-4 leading-relaxed font-medium">
                Traditional clothing like Pure Muga Silk, Kanchipuram Brocade, and Heavy Velvet Lehengas are sensory experiences. Photographs cannot capture the exact weight of silk warp, the sheen of pure zari, or the fall of a drape.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  {
                    title: 'PHYSICAL INSPECTION & AUTHENTICITY',
                    desc: 'Never receive cheap synthetic polyester when you paid for pure silk. Inspect weave purity and silk mark tags in person.',
                  },
                  {
                    title: 'EXACT SHOPPING WITH ZERO TRAVEL WASTE',
                    desc: 'No more roaming 15 different market lanes wondering who has the right color. Know the exact shop and floor before leaving home.',
                  },
                  {
                    title: 'CUSTOM TAILORING & IN-PERSON DRAPING',
                    desc: 'Traditional shops provide instant blouse measurement, fall/pico finishing, and customization right on the spot.',
                  },
                  {
                    title: 'SUPPORT GENERATIONAL WEAVERS & LOCAL ECONOMY',
                    desc: 'Your purchase directly empowers master artisans, family-owned looms, and local business owners.',
                  },
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-[#FAF7EE] border-2 border-[#121212] shadow-brutal-sm">
                    <h3 className="font-black text-sm uppercase text-[#121212] flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#FFE600] border border-[#121212]" />
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-700 font-mono mt-1">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Collage */}
            <div className="relative">
              <BrutalCard bg="bg-white" shadow="xl" className="overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80"
                  alt="Traditional Weaver Showcase"
                  className="w-full h-96 object-cover"
                />
                <div className="p-5 bg-[#FAF7EE] border-t-3 border-[#121212]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-lg text-[#121212] uppercase">
                        Real Shops. Real Weaves. Real Heritage.
                      </p>
                      <p className="text-xs text-neutral-600 font-mono mt-0.5">
                        Guwahati • Silchar • Kolkata • Varanasi • Delhi • Jaipur
                      </p>
                    </div>
                    <Link to="/map">
                      <BrutalButton variant="accent" size="sm">
                        Open Map
                      </BrutalButton>
                    </Link>
                  </div>
                </div>
              </BrutalCard>
            </div>
          </div>
        </div>
      </section>

      {/* NEARBY REGISTERED SHOPS */}
      <section className="py-16 px-4 bg-[#FAF7EE]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-mono font-black uppercase text-neutral-500">
                Verified Local Boutiques & Emporiums
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#121212]">
                SHOPS IN {selectedCity.toUpperCase()}
              </h2>
            </div>
            <Link to="/shops">
              <BrutalButton variant="outline" size="sm">
                View All Shops →
              </BrutalButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nearbyShops.slice(0, 3).map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        </div>
      </section>

      {/* Global In-Store Reservation Modal */}
      <ReservationModal
        product={selectedProductForReserve}
        isOpen={!!selectedProductForReserve}
        onClose={() => setSelectedProductForReserve(null)}
      />
    </div>
  );
};

export default LandingPage;
