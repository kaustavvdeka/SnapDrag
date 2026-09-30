import React, { useState } from 'react';
import { ProductImage } from '../../types/index.js';
import BrutalCard from '../common/BrutalCard.js';

interface ImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, productName }) => {
  const defaultImages = images && images.length > 0 ? images : [
    { id: '1', productId: '1', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80', isPrimary: true, order: 0 }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = defaultImages[activeIndex]?.url || defaultImages[0].url;

  return (
    <div className="space-y-3">
      {/* Main Image View */}
      <BrutalCard bg="bg-white" shadow="lg" className="overflow-hidden">
        <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden group">
          <img
            src={activeImage}
            alt={productName}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-2 right-2 bg-[#121212] text-white text-[10px] font-mono font-bold px-2 py-1 uppercase">
            Image {activeIndex + 1} of {defaultImages.length}
          </div>
        </div>
      </BrutalCard>

      {/* Thumbnails */}
      {defaultImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {defaultImages.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-20 h-24 shrink-0 border-2 overflow-hidden cursor-pointer transition-all ${
                activeIndex === idx
                  ? 'border-[#121212] shadow-brutal-sm scale-95 ring-2 ring-[#FFE600]'
                  : 'border-neutral-300 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
