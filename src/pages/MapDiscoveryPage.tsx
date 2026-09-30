import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from '../context/LocationContext.js';
import BrutalCard from '../components/common/BrutalCard.js';
import BrutalBadge from '../components/common/BrutalBadge.js';
import BrutalButton from '../components/common/BrutalButton.js';
import ReservationModal from '../components/reservations/ReservationModal.js';
import { Shop, Product } from '../types/index.js';
import api from '../api/client.js';
import {
  MapPin,
  Building2,
  Navigation,
  Compass,
  Star,
  ExternalLink,
  Store,
  Layers,
  Phone,
  Clock,
  BookmarkCheck,
  CheckCircle,
} from 'lucide-react';

const CITY_COORDINATES: Record<string, [number, number]> = {
  Guwahati: [26.1557, 91.7766],
  Silchar: [24.8333, 92.7789],
  Delhi: [28.6139, 77.2090],
  Mumbai: [18.9930, 72.8258],
  Kolkata: [22.5726, 88.3639],
  Bengaluru: [12.9716, 77.5946],
  Bengluru: [12.9716, 77.5946],
  Jaipur: [26.9239, 75.8267],
  Varanasi: [25.3076, 83.0064],
};

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY || '';

export const MapDiscoveryPage: React.FC = () => {
  const { selectedCity, setSelectedCity, availableCities } = useLocation();

  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [selectedProductForReserve, setSelectedProductForReserve] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const center = CITY_COORDINATES[selectedCity] || [26.1557, 91.7766];
      const map = L.map(mapContainerRef.current, {
        center,
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Geoapify Tile Layer with OpenStreetMap fallback
      const tileUrl = GEOAPIFY_KEY
        ? `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors, Geoapify',
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map alive between re-renders
    };
  }, []);

  // Fetch shops when city changes
  useEffect(() => {
    const fetchShops = async () => {
      setIsLoading(true);
      try {
        const res: any = await api.get(`/shops?city=${selectedCity}`);
        const data: Shop[] = res.data || [];
        setShops(data);
        if (data.length > 0) {
          setSelectedShop(data[0]);
        } else {
          setSelectedShop(null);
        }
      } catch (err) {
        console.error('Failed to load shops for map:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShops();
  }, [selectedCity]);

  // Update map view & markers whenever city or shops change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    const cityCoords = CITY_COORDINATES[selectedCity] || [26.1557, 91.7766];
    map.setView(cityCoords, 13);

    shops.forEach((shop) => {
      const lat = shop.location?.latitude || cityCoords[0];
      const lng = shop.location?.longitude || cityCoords[1];

      const isSelected = selectedShop?.id === shop.id;

      // Custom Neo-Brutalist HTML Marker
      const customIcon = L.divIcon({
        className: 'brutal-marker-wrapper',
        html: `
          <div style="
            transform: translate(-50%, -100%);
            background: ${isSelected ? '#FFE600' : '#FFFFFF'};
            border: 3px solid #121212;
            box-shadow: ${isSelected ? '4px 4px 0px #121212' : '2px 2px 0px #121212'};
            padding: 4px 8px;
            font-family: monospace;
            font-weight: 900;
            font-size: 11px;
            text-transform: uppercase;
            cursor: pointer;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
            color: #121212;
          ">
            <span>🏬</span>
            <span>${shop.name.length > 20 ? shop.name.slice(0, 18) + '...' : shop.name}</span>
          </div>
        `,
        iconSize: [0, 0],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(markersGroup);

      marker.on('click', () => {
        setSelectedShop(shop);
        map.panTo([lat, lng], { animate: true });
      });

      // Bind rich popup
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 6px; max-width: 240px;">
          <h3 style="font-weight: 900; font-size: 14px; text-transform: uppercase; margin: 0 0 4px 0; color: #121212;">${shop.name}</h3>
          <p style="font-size: 11px; margin: 0 0 4px 0; color: #555;">📍 ${shop.location?.floorName || 'Showroom'}, ${shop.location?.shopNumber || ''}</p>
          <p style="font-size: 11px; margin: 0; color: #121212; font-weight: bold;">⭐ ${shop.rating || 4.8} / 5.0 (${shop.reviewCount || 90} visits)</p>
        </div>
      `);
    });
  }, [shops, selectedCity, selectedShop]);

  return (
    <div className="min-h-screen bg-[#FAF7EE] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-3 border-[#121212]">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-black uppercase text-[#FF4D4D]">
              <Compass size={15} /> Physical Store Locator & Mall Navigator
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#121212]">
              INTERACTIVE SHOP MAP: {selectedCity.toUpperCase()}
            </h1>
          </div>

          {/* City switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-mono font-bold text-neutral-600 shrink-0">City:</span>
            {availableCities.map((c) => (
              <button
                key={c.city}
                onClick={() => setSelectedCity(c.city)}
                className={`text-xs px-2.5 py-1 border-2 border-[#121212] font-mono font-bold shrink-0 cursor-pointer ${
                  selectedCity.toLowerCase() === c.city.toLowerCase()
                    ? 'bg-[#FFE600] shadow-brutal-sm'
                    : 'bg-white hover:bg-neutral-100'
                }`}
              >
                {c.city} ({c.shopCount})
              </button>
            ))}
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex lg:hidden bg-white border-2 border-[#121212] shadow-brutal-sm p-1 gap-1 text-xs font-mono font-black">
          <button
            type="button"
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-2 text-center flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'map' ? 'bg-[#00E599] border border-[#121212]' : 'text-neutral-600'
            }`}
          >
            <Compass size={14} /> Map View ({shops.length})
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-2 text-center flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'list' ? 'bg-[#FFE600] border border-[#121212]' : 'text-neutral-600'
            }`}
          >
            <Store size={14} /> Store Details {selectedShop ? `(${selectedShop.name.slice(0, 10)}...)` : ''}
          </button>
        </div>

        {/* Map & Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-auto lg:h-[700px]">
          {/* Left: Interactive Leaflet Map Area (8 cols) */}
          <div
            className={`lg:col-span-8 h-[360px] sm:h-[450px] lg:h-full flex flex-col ${
              mobileTab === 'map' ? 'block' : 'hidden lg:block'
            }`}
          >
            <BrutalCard bg="bg-white" shadow="lg" className="flex-1 relative overflow-hidden flex flex-col border-3 border-[#121212]">
              {/* Leaflet Map DOM Element */}
              <div ref={mapContainerRef} className="w-full h-full relative z-10" />

              {/* Map Info Bar Badge */}
              <div className="absolute top-3 left-3 z-[1000] bg-white border-2 border-[#121212] shadow-brutal-sm p-2 text-xs font-mono">
                <span className="font-black text-[#121212] block">
                  📍 {selectedCity} Physical Boutique Grid
                </span>
                <span className="block text-[10px] text-neutral-500">
                  {shops.length} verified traditional clothing stores pinned
                </span>
              </div>
            </BrutalCard>
          </div>

          {/* Right: Selected Shop Mall/Floor Navigator & Live Inventory (4 cols) */}
          <div
            className={`lg:col-span-4 h-auto lg:h-full flex flex-col space-y-4 lg:overflow-y-auto pr-0 lg:pr-1 ${
              mobileTab === 'list' ? 'block' : 'hidden lg:block'
            }`}
          >
            {selectedShop ? (
              <>
                {/* Shop Highlights Card */}
                <BrutalCard bg="bg-white" shadow="md" className="p-5 border-3 border-[#121212] space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <BrutalBadge variant="green" size="sm">
                          Verified Shop
                        </BrutalBadge>
                        <span className="text-xs font-mono font-bold text-neutral-700 flex items-center gap-1">
                          <Star size={13} className="fill-[#FFE600] text-[#121212]" />
                          {selectedShop.rating || 4.8}
                        </span>
                      </div>
                      <h2 className="text-xl font-black uppercase text-[#121212]">
                        {selectedShop.name}
                      </h2>
                    </div>

                    <Link to={`/shops/${selectedShop.id}`}>
                      <BrutalButton variant="outline" size="sm">
                        <ExternalLink size={14} />
                      </BrutalButton>
                    </Link>
                  </div>

                  <p className="text-xs text-neutral-600 line-clamp-2">
                    {selectedShop.description}
                  </p>

                  {/* Physical Navigation Metadata Matrix */}
                  <div className="p-3 bg-[#FAF7EE] border-2 border-[#121212] space-y-2 text-xs font-mono">
                    <div className="flex items-center gap-2 font-bold text-[#121212]">
                      <Building2 size={16} className="text-[#121212] shrink-0" />
                      <span>{selectedShop.location?.floorName || 'Ground Floor Traditional Store'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-neutral-700">
                      <Store size={16} className="text-[#121212] shrink-0" />
                      <span className="font-bold">{selectedShop.location?.shopNumber || 'Shop 101'}</span>
                      {selectedShop.location?.section && (
                        <span className="text-neutral-500">({selectedShop.location.section})</span>
                      )}
                    </div>

                    <div className="flex items-start gap-2 text-neutral-700">
                      <MapPin size={16} className="text-[#121212] shrink-0 mt-0.5" />
                      <span>{selectedShop.location?.address}, {selectedShop.location?.city}</span>
                    </div>

                    {selectedShop.location?.nearbyLandmark && (
                      <div className="pt-2 border-t border-neutral-300 text-[11px] text-neutral-600">
                        <span className="font-bold text-[#121212]">Landmark: </span>
                        {selectedShop.location.nearbyLandmark}
                      </div>
                    )}
                  </div>

                  {/* Contact & Hours */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2 bg-neutral-50 border border-[#121212] flex items-center gap-1.5">
                      <Clock size={13} className="text-[#121212]" />
                      <span className="truncate">{selectedShop.openingHours || '10 AM - 9 PM'}</span>
                    </div>
                    <div className="p-2 bg-neutral-50 border border-[#121212] flex items-center gap-1.5">
                      <Phone size={13} className="text-[#121212]" />
                      <span className="truncate">{selectedShop.phone}</span>
                    </div>
                  </div>

                  <Link to={`/shops/${selectedShop.id}`} className="block">
                    <BrutalButton variant="primary" fullWidth size="md">
                      Browse Full Store Catalog
                    </BrutalButton>
                  </Link>
                </BrutalCard>

                {/* Available In-Store Outfits in This Shop */}
                <div className="space-y-2">
                  <span className="text-xs font-mono font-black uppercase text-[#121212] block">
                    In-Store Pieces Available Right Now:
                  </span>

                  {selectedShop.products && selectedShop.products.length > 0 ? (
                    selectedShop.products.slice(0, 4).map((prod: Product) => (
                      <BrutalCard
                        key={prod.id}
                        bg="bg-white"
                        className="p-3 border-2 border-[#121212] flex items-center justify-between gap-3 hover:translate-x-0.5 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=120'}
                            alt={prod.name}
                            className="w-12 h-14 object-cover border border-[#121212] shrink-0"
                          />
                          <div>
                            <Link
                              to={`/products/${prod.id}`}
                              className="font-black text-xs text-[#121212] line-clamp-1 uppercase hover:underline"
                            >
                              {prod.name}
                            </Link>
                            <span className="text-[11px] font-mono font-bold text-[#121212] block">
                              ₹{prod.price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-700 font-bold">
                              ✓ {prod.availableQuantity} in stock
                            </span>
                          </div>
                        </div>

                        <BrutalButton
                          variant="accent"
                          size="sm"
                          onClick={() => setSelectedProductForReserve(prod)}
                        >
                          Hold
                        </BrutalButton>
                      </BrutalCard>
                    ))
                  ) : (
                    <div className="p-4 bg-white border-2 border-[#121212] text-center text-xs font-mono text-neutral-500">
                      Visit store to browse uncataloged artisan weaves.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 bg-white border-3 border-[#121212] shadow-md text-center space-y-2">
                <Store size={36} className="mx-auto text-neutral-400" />
                <h3 className="font-black text-base uppercase text-[#121212]">
                  Select a Boutique
                </h3>
                <p className="text-xs font-mono text-neutral-500">
                  Click any marker on the map to inspect floor level, shop number, and live in-store stock.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Reserve Modal */}
      {selectedProductForReserve && (
        <ReservationModal
          product={selectedProductForReserve}
          isOpen={!!selectedProductForReserve}
          onClose={() => setSelectedProductForReserve(null)}
        />
      )}
    </div>
  );
};

export default MapDiscoveryPage;
