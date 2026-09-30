import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard.js';
import ReservationModal from '../components/reservations/ReservationModal.js';
import BrutalButton from '../components/common/BrutalButton.js';
import BrutalCard from '../components/common/BrutalCard.js';
import { Product } from '../types/index.js';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { Heart, ShoppingBag } from 'lucide-react';

export const FavoritesPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductForReserve, setSelectedProductForReserve] = useState<Product | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=/favorites');
      return;
    }
    if (isAuthenticated) {
      api.get('/favorites')
        .then((res: any) => setFavorites(res.data || []))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isAuthenticated, authLoading, navigate]);

  return (
    <div className="min-h-screen bg-[#FAF7EE] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="border-b-4 border-[#121212] pb-4">
          <span className="text-xs font-mono font-black uppercase text-[#FF6EA7]">
            Your Saved Traditional Outfits
          </span>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#121212]">
            FAVORITES & WISHLIST ({favorites.length})
          </h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-96 bg-neutral-200 border-3 border-[#121212] animate-pulse" />
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((fav) => (
              <ProductCard
                key={fav.id}
                product={fav.product}
                isFavorited={true}
                onReserveClick={(prod) => setSelectedProductForReserve(prod)}
              />
            ))}
          </div>
        ) : (
          <BrutalCard bg="bg-white" shadow="lg" className="p-12 text-center space-y-4">
            <Heart size={40} className="mx-auto text-neutral-400" />
            <h3 className="text-xl font-black uppercase text-[#121212]">
              No Saved Outfits Yet
            </h3>
            <p className="text-xs font-mono text-neutral-600 max-w-md mx-auto">
              Save sarees, mekhela chadors, and lehengas while browsing so you can compare prices and visit shops later.
            </p>
            <div className="pt-2">
              <Link to="/explore">
                <BrutalButton variant="primary">Explore Outfits</BrutalButton>
              </Link>
            </div>
          </BrutalCard>
        )}
      </div>

      <ReservationModal
        product={selectedProductForReserve}
        isOpen={!!selectedProductForReserve}
        onClose={() => setSelectedProductForReserve(null)}
      />
    </div>
  );
};

export default FavoritesPage;
