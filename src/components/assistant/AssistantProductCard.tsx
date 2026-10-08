import React from 'react';
import { Link } from 'react-router-dom';
import { AssistantProductSummary } from '../../api/assistantApi.js';
import BrutalBadge from '../common/BrutalBadge.js';
import { Sparkles, BookmarkCheck, Store, MapPin, Eye } from 'lucide-react';
import { Product } from '../../types/index.js';

interface AssistantProductCardProps {
  product: AssistantProductSummary;
  onTryMirror: (product: Product) => void;
  onReserve: (product: Product) => void;
  onViewProduct?: () => void;
}

export const AssistantProductCard: React.FC<AssistantProductCardProps> = ({
  product,
  onTryMirror,
  onReserve,
  onViewProduct,
}) => {
  // Convert AssistantProductSummary to Product type for modal consumption
  const fullProduct: Product = {
    id: product.id,
    sku: `SKU-${product.id.slice(0, 8)}`,
    name: product.name,
    slug: product.slug,
    description: `${product.name} in ${product.color}, woven with ${product.material}.`,
    price: product.price,
    discountPercent: product.discountPercent,
    discountedPrice: product.discountedPrice,
    shopId: product.shop.id,
    categoryId: '',
    material: product.material,
    color: product.color,
    size: product.size,
    totalQuantity: product.availableQuantity + 2,
    availableQuantity: product.availableQuantity,
    reservedQuantity: 0,
    soldQuantity: 1,
    isFeatured: true,
    isActive: true,
    tags: [product.material.toLowerCase(), product.color.toLowerCase()],
    createdAt: new Date().toISOString(),
    images: [
      {
        id: `img-${product.id}`,
        productId: product.id,
        url: product.primaryImage,
        isPrimary: true,
        order: 0,
      },
    ],
    category: {
      id: 'cat-1',
      name: product.categoryName,
      slug: product.categorySlug,
      displayOrder: 1,
    },
    shop: {
      id: product.shop.id,
      name: product.shop.name,
      slug: product.shop.slug,
      phone: product.shop.phone,
      isApproved: true,
      isActive: true,
      rating: product.shop.rating,
      reviewCount: 42,
      ownerId: '',
      location: {
        id: `loc-${product.shop.id}`,
        shopId: product.shop.id,
        address: product.shop.address,
        city: product.shop.city,
        state: 'India',
        pincode: '781001',
        country: 'India',
        latitude: 26.1557,
        longitude: 91.7766,
        floorName: product.shop.floorName,
        shopNumber: product.shop.shopNumber,
        mall: product.shop.mallName ? { id: 'm1', name: product.shop.mallName, slug: '', address: '', city: product.shop.city, state: '', pincode: '', latitude: 0, longitude: 0, totalFloors: 3 } : null,
      },
    },
  };

  return (
    <div className="bg-white border-2 border-[#121212] shadow-brutal-sm p-3 flex flex-col justify-between text-[#121212] w-full max-w-sm rounded-none hover:shadow-brutal transition-shadow">
      <div>
        {/* Product Image & Badges */}
        <div className="relative aspect-[4/3] w-full bg-neutral-100 border border-[#121212] overflow-hidden mb-2">
          <img
            src={product.primaryImage}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-1.5 left-1.5">
            <BrutalBadge variant="yellow" size="sm">
              {product.categoryName}
            </BrutalBadge>
          </div>
          <div className="absolute bottom-1.5 left-1.5">
            <span className="bg-[#00E599] text-[#121212] font-black text-[10px] font-mono px-1.5 py-0.5 border border-[#121212] shadow-xs">
              ✓ In Store ({product.availableQuantity})
            </span>
          </div>
        </div>

        {/* Product Title */}
        <h4 className="font-black text-xs uppercase leading-snug text-[#121212] line-clamp-2 mb-1">
          {product.name}
        </h4>

        {/* Material & Color */}
        <p className="text-[11px] font-mono text-neutral-600 truncate mb-1.5">
          {product.material} • {product.color}
        </p>

        {/* Shop & Location */}
        <div className="bg-[#FAF7EE] border border-neutral-300 p-1.5 text-[11px] font-mono space-y-0.5 mb-2">
          <div className="flex items-center gap-1 font-bold text-[#121212] truncate">
            <Store size={12} className="shrink-0 text-neutral-600" />
            <span className="truncate">{product.shop.name}</span>
          </div>
          <div className="flex items-center gap-1 text-neutral-500 text-[10px] truncate">
            <MapPin size={11} className="shrink-0 text-[#FF4D4D]" />
            <span className="truncate">
              {product.shop.city}
              {product.shop.mallName ? ` • ${product.shop.mallName}` : ''}
              {product.shop.floorName ? ` (${product.shop.floorName})` : ''}
            </span>
          </div>
        </div>

        {/* Price Row */}
        <div className="flex items-baseline justify-between mb-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-[#121212]">
              ₹{product.discountedPrice.toLocaleString('en-IN')}
            </span>
            {product.discountPercent > 0 && (
              <span className="text-xs line-through text-neutral-400 font-mono">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          {product.discountPercent > 0 && (
            <span className="text-[10px] font-black bg-[#FFE600] px-1 border border-[#121212]">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Action CTA Grid */}
      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-neutral-200">
        {/* 1. Try with Mirror */}
        <button
          type="button"
          onClick={() => onTryMirror(fullProduct)}
          className="bg-[#FFE600] hover:bg-[#fff066] text-[#121212] font-black text-[11px] uppercase py-2 px-1 border border-[#121212] shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5"
          title="Virtual Try-On with Mirror"
        >
          <Sparkles size={12} className="fill-[#121212] shrink-0" />
          <span>Mirror</span>
        </button>

        {/* 2. Reserve for 48h */}
        <button
          type="button"
          onClick={() => onReserve(fullProduct)}
          className="bg-[#121212] hover:bg-neutral-800 text-white font-black text-[11px] uppercase py-2 px-1 border border-[#121212] shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5"
          title="Hold Free for 48h in Shop"
        >
          <BookmarkCheck size={12} className="text-[#00E599] shrink-0" />
          <span>Reserve</span>
        </button>

        {/* 3. View Product */}
        <Link
          to={`/products/${product.id}`}
          onClick={onViewProduct}
          className="bg-white hover:bg-neutral-100 text-[#121212] font-black text-[11px] uppercase py-2 px-1 border border-[#121212] shadow-xs flex items-center justify-center gap-1 cursor-pointer text-center"
        >
          <Eye size={12} className="shrink-0" />
          <span>View</span>
        </Link>
      </div>
    </div>
  );
};

export default AssistantProductCard;
