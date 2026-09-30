import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/index.js';
import BrutalCard from '../common/BrutalCard.js';
import BrutalBadge from '../common/BrutalBadge.js';
import BrutalButton from '../common/BrutalButton.js';
import { MapPin, Heart, ShieldCheck, Store, Clock } from 'lucide-react';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';

interface ProductCardProps {
  product: Product;
  onReserveClick?: (product: Product) => void;
  isFavorited?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onReserveClick,
  isFavorited = false,
}) => {
  const { isAuthenticated } = useAuth();
  const [favorited, setFavorited] = useState(isFavorited);
  const [isTogglingFav, setIsTogglingFav] = useState(false);

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0].url
      : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80';

  const isAvailable = product.availableQuantity > 0;
  const isLowStock = isAvailable && product.availableQuantity <= 2;

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please log in as a customer to save favorites.');
      return;
    }
    setIsTogglingFav(true);
    try {
      const res: any = await api.post(`/favorites/toggle/${product.id}`);
      setFavorited(res.data.isFavorited);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setIsTogglingFav(false);
    }
  };

  const locationText = product.shop?.location
    ? `${product.shop.location.city}${
        product.shop.location.floorName ? ` • ${product.shop.location.floorName}` : ''
      }`
    : 'Local Store';

  return (
    <BrutalCard
      bg="bg-white"
      shadow="md"
      hoverEffect
      className="flex flex-col h-full overflow-hidden group"
    >
      {/* Product Image Area */}
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 border-b-3 border-[#121212]">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Category Badge */}
        {product.category && (
          <div className="absolute top-2 left-2 z-10">
            <BrutalBadge variant="yellow" size="sm">
              {product.category.name}
            </BrutalBadge>
          </div>
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteToggle}
          disabled={isTogglingFav}
          aria-label="Save to favorites"
          className="absolute top-2 right-2 z-10 p-1.5 bg-white border-2 border-[#121212] shadow-brutal-sm hover:scale-110 active:scale-95 transition-all cursor-pointer"
        >
          <Heart
            size={18}
            className={favorited ? 'fill-[#FF4D4D] text-[#FF4D4D]' : 'text-[#121212]'}
            strokeWidth={2.5}
          />
        </button>

        {/* Stock Status Badge */}
        <div className="absolute bottom-2 left-2 z-10">
          {!isAvailable ? (
            <BrutalBadge variant="red" size="sm">
              ✕ Out of Stock
            </BrutalBadge>
          ) : isLowStock ? (
            <BrutalBadge variant="pink" size="sm">
              ⚠ Only {product.availableQuantity} Left In Shop
            </BrutalBadge>
          ) : (
            <BrutalBadge variant="green" size="sm">
              ✓ In-Store Available ({product.availableQuantity})
            </BrutalBadge>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Shop Name & Distance */}
          <div className="flex items-center justify-between text-xs text-neutral-600 mb-1 font-mono">
            <Link
              to={`/shops/${product.shop?.id}`}
              className="font-bold text-[#121212] hover:underline flex items-center gap-1 truncate"
            >
              <Store size={14} className="shrink-0" />
              <span className="truncate">{product.shop?.name || 'Local Boutique'}</span>
            </Link>
            <span className="shrink-0 font-bold bg-[#FAF7EE] px-1 border border-neutral-300">
              1.2 km away
            </span>
          </div>

          {/* Product Title */}
          <Link to={`/products/${product.id}`}>
            <h3 className="font-black text-base text-[#121212] line-clamp-2 hover:text-[#FF6EA7] transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Material & Color Attributes */}
          <p className="text-xs text-neutral-700 mt-1 font-mono">
            {product.material} • {product.color}
          </p>

          {/* Mall & Floor / Shop number if present */}
          {product.shop?.location?.shopNumber && (
            <div className="mt-2 text-xs bg-[#FAF7EE] border border-[#121212] p-1.5 flex items-center gap-1.5 font-bold text-neutral-800">
              <MapPin size={13} className="text-[#FF4D4D] shrink-0" />
              <span className="truncate">
                {product.shop.location.shopNumber}
                {product.shop.location.floorName ? `, ${product.shop.location.floorName}` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3 border-t-2 border-[#121212]">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-xl font-black text-[#121212]">
                ₹{product.discountedPrice.toLocaleString('en-IN')}
              </span>
              {product.discountPercent > 0 && (
                <span className="text-xs line-through text-neutral-500 ml-2 font-mono">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {product.discountPercent > 0 && (
              <span className="text-xs font-black bg-[#FFE600] px-1.5 py-0.5 border border-[#121212]">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Link to={`/products/${product.id}`} className="w-full">
              <BrutalButton variant="outline" size="sm" fullWidth>
                View
              </BrutalButton>
            </Link>

            <BrutalButton
              variant="primary"
              size="sm"
              fullWidth
              disabled={!isAvailable}
              onClick={() => onReserveClick && onReserveClick(product)}
            >
              Reserve
            </BrutalButton>
          </div>
        </div>
      </div>
    </BrutalCard>
  );
};

export default ProductCard;
