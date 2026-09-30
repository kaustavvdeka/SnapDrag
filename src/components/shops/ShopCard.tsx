import React from 'react';
import { Link } from 'react-router-dom';
import { Shop } from '../../types/index.js';
import BrutalCard from '../common/BrutalCard.js';
import BrutalBadge from '../common/BrutalBadge.js';
import BrutalButton from '../common/BrutalButton.js';
import { MapPin, Star, Clock, Phone, Building2, ChevronRight } from 'lucide-react';

interface ShopCardProps {
  shop: Shop;
}

export const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  const banner =
    shop.bannerUrl ||
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80';

  const logo =
    shop.logoUrl ||
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&q=80';

  const location = shop.location;

  return (
    <BrutalCard bg="bg-white" shadow="md" hoverEffect className="flex flex-col h-full overflow-hidden">
      {/* Banner */}
      <div className="relative h-32 bg-neutral-200 border-b-3 border-[#121212] overflow-hidden">
        <img
          src={banner}
          alt={shop.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          {shop.isApproved && (
            <BrutalBadge variant="green" size="sm">
              ✓ Verified Store
            </BrutalBadge>
          )}
        </div>

        {/* Floating Logo */}
        <div className="absolute -bottom-4 left-4 w-12 h-12 bg-white border-2 border-[#121212] shadow-brutal-sm overflow-hidden z-10">
          <img src={logo} alt={shop.name} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Body */}
      <div className="pt-6 p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link to={`/shops/${shop.id}`}>
              <h3 className="font-black text-lg text-[#121212] hover:text-[#FF6EA7] transition-colors leading-snug">
                {shop.name}
              </h3>
            </Link>
            <div className="flex items-center gap-1 bg-[#FFE600] px-1.5 py-0.5 border border-[#121212] font-black text-xs shrink-0">
              <Star size={12} className="fill-[#121212]" />
              {shop.rating.toFixed(1)}
              <span className="text-[10px] text-neutral-600 font-mono">({shop.reviewCount})</span>
            </div>
          </div>

          {/* Mall & Exact Floor location */}
          {location && (
            <div className="mt-2 text-xs text-neutral-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <MapPin size={14} className="text-[#FF4D4D] shrink-0" />
                <span>{location.city}, {location.state}</span>
                <span className="text-neutral-500 font-mono font-normal">• 1.4 km</span>
              </div>

              {(location.mall || location.floorName || location.shopNumber) && (
                <div className="p-2 bg-[#FAF7EE] border border-[#121212] font-mono text-[11px] text-neutral-800 flex items-start gap-1">
                  <Building2 size={13} className="shrink-0 mt-0.5 text-neutral-700" />
                  <div>
                    {location.mall?.name && <span className="font-bold">{location.mall.name}</span>}
                    {location.floorName && <span> • {location.floorName}</span>}
                    {location.shopNumber && <span className="text-[#121212] font-black"> ({location.shopNumber})</span>}
                    {location.nearbyLandmark && (
                      <p className="text-[10px] text-neutral-600 mt-0.5">{location.nearbyLandmark}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Opening Hours */}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-600 font-mono">
            <Clock size={13} />
            <span>{shop.openingHours || '10:00 AM - 9:00 PM'}</span>
          </div>
        </div>

        {/* Footer info & CTA */}
        <div className="mt-4 pt-3 border-t-2 border-[#121212] flex items-center justify-between">
          <div className="text-xs font-bold text-neutral-700 font-mono">
            {shop._count?.products || shop.products?.length || 0} Traditional Outfits
          </div>

          <Link to={`/shops/${shop.id}`}>
            <BrutalButton variant="primary" size="sm">
              Visit Store <ChevronRight size={14} className="ml-1" />
            </BrutalButton>
          </Link>
        </div>
      </div>
    </BrutalCard>
  );
};

export default ShopCard;
