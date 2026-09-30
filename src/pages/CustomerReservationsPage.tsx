import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Reservation, ReservationStatus } from '../types/index.js';
import BrutalCard from '../components/common/BrutalCard.js';
import BrutalBadge from '../components/common/BrutalBadge.js';
import BrutalButton from '../components/common/BrutalButton.js';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Calendar,
  Clock,
  MapPin,
  Store,
  Building2,
  AlertCircle,
  XCircle,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react';

export const CustomerReservationsPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/reservations/my-reservations');
      setReservations(res.data || []);
    } catch (err) {
      console.error('Failed to load reservations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=/reservations');
      return;
    }
    if (isAuthenticated) {
      fetchReservations();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('Are you sure you want to cancel this in-store reservation? The held item will be released for other customers.')) {
      return;
    }

    setCancellingId(reservationId);
    try {
      await api.patch(`/reservations/${reservationId}/status`, {
        status: 'CANCELLED',
        cancelReason: 'Cancelled by customer online',
      });
      await fetchReservations();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel reservation');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'PENDING':
        return <BrutalBadge variant="yellow" size="sm">⏳ Pending Shop Confirmation</BrutalBadge>;
      case 'CONFIRMED':
        return <BrutalBadge variant="blue" size="sm">✓ Confirmed & Held For You</BrutalBadge>;
      case 'READY_FOR_VISIT':
        return <BrutalBadge variant="green" size="sm">🎉 Ready For Visit Now</BrutalBadge>;
      case 'COMPLETED':
        return <BrutalBadge variant="dark" size="sm">✓ Purchased In Shop</BrutalBadge>;
      case 'CANCELLED':
        return <BrutalBadge variant="red" size="sm">✕ Cancelled</BrutalBadge>;
      case 'EXPIRED':
        return <BrutalBadge variant="white" size="sm">⚠ Expired (48h Lapsed)</BrutalBadge>;
      default:
        return <BrutalBadge variant="yellow" size="sm">{status}</BrutalBadge>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b-4 border-[#121212] pb-4">
          <span className="text-xs font-mono font-black uppercase text-[#FF4D4D]">
            Zero-Obligation In-Store Holds
          </span>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#121212]">
            MY IN-STORE RESERVATIONS
          </h1>
          <p className="text-xs font-mono text-neutral-600 mt-1">
            Items reserved here are held physically in the shop for 48 hours. Bring your reservation code, inspect the fabric, and pay offline.
          </p>
        </div>

        {/* Reservations List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-44 bg-neutral-200 border-3 border-[#121212] animate-pulse" />
            ))}
          </div>
        ) : reservations.length > 0 ? (
          <div className="space-y-4">
            {reservations.map((res) => {
              const product = res.product;
              const shop = res.shop;
              const location = shop?.location;
              const isActive = ['PENDING', 'CONFIRMED', 'READY_FOR_VISIT'].includes(res.status);

              return (
                <BrutalCard
                  key={res.id}
                  bg="bg-white"
                  shadow="md"
                  className="p-5 flex flex-col md:flex-row gap-5 items-start justify-between"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex gap-4 flex-1">
                    <img
                      src={
                        product?.images[0]?.url ||
                        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&q=80'
                      }
                      alt={product?.name}
                      className="w-24 h-32 object-cover border-2 border-[#121212] shadow-brutal-sm shrink-0"
                    />

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(res.status)}
                        <span className="font-mono text-xs font-bold text-neutral-500">
                          Reserved on: {new Date(res.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-black text-lg text-[#121212] truncate">
                        {product?.name}
                      </h3>

                      <p className="text-xs font-mono text-neutral-700">
                        {product?.material} • {product?.color} • Qty: <strong>{res.quantity}</strong>
                      </p>

                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-xl font-black text-[#121212]">
                          ₹{(res.unitPrice * res.quantity).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-500">
                          (Pay at shop upon physical inspection)
                        </span>
                      </div>

                      {/* Mall Location details */}
                      {location && (
                        <div className="mt-2 p-2 bg-[#FAF7EE] border border-[#121212] text-xs font-mono">
                          <p className="font-bold flex items-center gap-1 text-[#121212]">
                            <Store size={14} /> {shop.name}
                          </p>
                          <p className="text-neutral-700 mt-0.5">
                            {location.mall?.name ? `${location.mall.name}, ` : ''}
                            {location.floorName ? `${location.floorName}, ` : ''}
                            {location.shopNumber ? `${location.shopNumber}` : ''}
                          </p>
                          {location.nearbyLandmark && (
                            <p className="text-[10px] text-neutral-500 mt-0.5">
                              Landmark: {location.nearbyLandmark}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Reservation Code & Actions Box */}
                  <div className="w-full md:w-64 bg-[#FAF7EE] border-2 border-[#121212] p-4 text-center space-y-3 shrink-0">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-neutral-500">
                        In-Store Pickup Code
                      </span>
                      <div className="text-2xl font-black font-mono tracking-wider bg-[#FFE600] border-2 border-[#121212] py-1 px-3 shadow-brutal-sm text-[#121212] my-1">
                        {res.reservationCode}
                      </div>
                      <p className="text-[10px] font-mono text-neutral-600">
                        Show this to shopkeeper on arrival
                      </p>
                    </div>

                    <div className="text-xs font-mono text-neutral-800 bg-white p-2 border border-neutral-300 text-left">
                      <div className="flex items-center gap-1 font-bold">
                        <Calendar size={13} /> Visit Date:
                      </div>
                      <div className="font-bold text-[#121212] mt-0.5">
                        {new Date(res.preferredVisitDate).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        ({res.preferredVisitTime || 'Flexible'})
                      </div>
                    </div>

                    {/* Cancel action */}
                    {isActive && (
                      <BrutalButton
                        variant="danger"
                        size="sm"
                        fullWidth
                        disabled={cancellingId === res.id}
                        isLoading={cancellingId === res.id}
                        onClick={() => handleCancelReservation(res.id)}
                      >
                        Cancel Hold
                      </BrutalButton>
                    )}
                  </div>
                </BrutalCard>
              );
            })}
          </div>
        ) : (
          <BrutalCard bg="bg-white" shadow="lg" className="p-12 text-center space-y-4">
            <ShoppingBag size={40} className="mx-auto text-neutral-400" />
            <h3 className="text-xl font-black uppercase text-[#121212]">
              No Active In-Store Reservations
            </h3>
            <p className="text-xs font-mono text-neutral-600 max-w-md mx-auto">
              Explore traditional sarees, mekhela chadors, and lehengas from verified local shops and hold any piece for 48 hours.
            </p>
            <div className="pt-2">
              <Link to="/explore">
                <BrutalButton variant="primary">Explore Traditional Outfits</BrutalButton>
              </Link>
            </div>
          </BrutalCard>
        )}
      </div>
    </div>
  );
};

export default CustomerReservationsPage;
