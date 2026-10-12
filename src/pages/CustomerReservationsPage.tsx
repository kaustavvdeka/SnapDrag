import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Reservation, ReservationStatus } from '../types/index.js';
import BrutalCard from '../components/common/BrutalCard.js';
import BrutalBadge from '../components/common/BrutalBadge.js';
import BrutalButton from '../components/common/BrutalButton.js';
import BrutalModal from '../components/common/BrutalModal.js';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Calendar,
  Clock,
  MapPin,
  Store,
  Building2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  ShoppingBag,
  Copy,
  Check,
  Phone,
  ExternalLink,
  ShieldCheck,
  X,
  RotateCcw,
} from 'lucide-react';

type TabType = 'ACTIVE' | 'ALL' | 'CANCELLED_EXPIRED' | 'COMPLETED';

export const CustomerReservationsPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('ACTIVE');

  // Cancel hold modal state
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Change of plans');
  const [customReason, setCustomReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleCopyCode = async (reservationId: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(reservationId);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // fallback
    }
  };

  const openCancelModal = (res: Reservation) => {
    setReservationToCancel(res);
    setCancelReason('Change of plans');
    setCustomReason('');
    setCancelError(null);
  };

  const closeCancelModal = () => {
    if (isCancelling) return;
    setReservationToCancel(null);
    setCancelError(null);
  };

  const executeCancelHold = async () => {
    if (!reservationToCancel) return;

    setIsCancelling(true);
    setCancelError(null);

    const finalReason =
      cancelReason === 'Other'
        ? (customReason.trim() || 'Cancelled by customer online')
        : cancelReason;

    try {
      await api.patch(`/reservations/${reservationToCancel.id}/status`, {
        status: 'CANCELLED',
        cancelReason: finalReason,
      });

      const code = reservationToCancel.reservationCode;
      setToastMessage(`Hold ${code} was successfully cancelled. Item stock released back to boutique.`);
      setReservationToCancel(null);

      // Auto-dismiss toast after 5s
      setTimeout(() => {
        setToastMessage(null);
      }, 5000);

      await fetchReservations();
    } catch (err: any) {
      console.error('Cancel reservation failed:', err);
      const msg =
        err?.message ||
        err?.error?.message ||
        err?.response?.data?.message ||
        'Failed to cancel reservation. Please try again.';
      setCancelError(msg);
    } finally {
      setIsCancelling(false);
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
        return <BrutalBadge variant="red" size="sm">✕ Cancelled Hold</BrutalBadge>;
      case 'EXPIRED':
        return <BrutalBadge variant="white" size="sm">⚠ Expired (48h Lapsed)</BrutalBadge>;
      default:
        return <BrutalBadge variant="yellow" size="sm">{status}</BrutalBadge>;
    }
  };

  const getExpiryDetails = (res: Reservation) => {
    if (!res.expiresAt) return null;
    const expiresTime = new Date(res.expiresAt).getTime();
    const now = Date.now();
    const diffHours = Math.round((expiresTime - now) / (1000 * 60 * 60));
    const isActive = ['PENDING', 'CONFIRMED', 'READY_FOR_VISIT'].includes(res.status);

    if (!isActive) return null;

    if (diffHours > 0) {
      return (
        <span className="text-[10px] font-mono font-bold bg-[#FAF7EE] border border-[#121212] px-1.5 py-0.5 text-neutral-800">
          ⏳ 48h Hold: ~{diffHours}h remaining
        </span>
      );
    } else {
      return (
        <span className="text-[10px] font-mono font-bold bg-[#FF4D4D] text-white px-1.5 py-0.5">
          ⚠ Hold Expiring Soon
        </span>
      );
    }
  };

  // Groupings for tabs
  const activeReservations = reservations.filter((r) =>
    ['PENDING', 'CONFIRMED', 'READY_FOR_VISIT'].includes(r.status)
  );
  const cancelledExpiredReservations = reservations.filter((r) =>
    ['CANCELLED', 'EXPIRED'].includes(r.status)
  );
  const completedReservations = reservations.filter((r) => r.status === 'COMPLETED');

  const displayedReservations = (() => {
    switch (activeTab) {
      case 'ACTIVE':
        return activeReservations;
      case 'CANCELLED_EXPIRED':
        return cancelledExpiredReservations;
      case 'COMPLETED':
        return completedReservations;
      case 'ALL':
      default:
        return reservations;
    }
  })();

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

        {/* Success Toast */}
        {toastMessage && (
          <div className="p-3 bg-[#00E599] border-3 border-[#121212] shadow-brutal flex items-center justify-between font-mono text-xs font-bold text-[#121212] animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 hover:bg-black/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 pb-2 border-b-2 border-[#121212]">
          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-[#121212] transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ACTIVE'
                ? 'bg-[#FFE600] shadow-brutal-sm translate-x-0.5'
                : 'bg-white hover:bg-neutral-100'
            }`}
          >
            <span>Active Holds</span>
            <span className="bg-[#121212] text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {activeReservations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-[#121212] transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ALL'
                ? 'bg-[#FFE600] shadow-brutal-sm translate-x-0.5'
                : 'bg-white hover:bg-neutral-100'
            }`}
          >
            <span>All</span>
            <span className="bg-[#121212] text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {reservations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CANCELLED_EXPIRED')}
            className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-[#121212] transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'CANCELLED_EXPIRED'
                ? 'bg-[#FFE600] shadow-brutal-sm translate-x-0.5'
                : 'bg-white hover:bg-neutral-100'
            }`}
          >
            <span>Cancelled & Expired</span>
            <span className="bg-[#121212] text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {cancelledExpiredReservations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-[#121212] transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'COMPLETED'
                ? 'bg-[#FFE600] shadow-brutal-sm translate-x-0.5'
                : 'bg-white hover:bg-neutral-100'
            }`}
          >
            <span>Purchased</span>
            <span className="bg-[#121212] text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {completedReservations.length}
            </span>
          </button>
        </div>

        {/* Reservations List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-44 bg-neutral-200 border-3 border-[#121212] animate-pulse" />
            ))}
          </div>
        ) : displayedReservations.length > 0 ? (
          <div className="space-y-4">
            {displayedReservations.map((res) => {
              const product = res.product;
              const shop = res.shop;
              const location = shop?.location;
              const isActive = ['PENDING', 'CONFIRMED', 'READY_FOR_VISIT'].includes(res.status);
              const isCancelled = res.status === 'CANCELLED';
              const isExpired = res.status === 'EXPIRED';
              const isCompleted = res.status === 'COMPLETED';
              const isCopied = copiedId === res.id;

              return (
                <BrutalCard
                  key={res.id}
                  bg={isCancelled || isExpired ? 'bg-neutral-50/90' : 'bg-white'}
                  shadow={isCancelled || isExpired ? 'sm' : 'md'}
                  className={`p-5 flex flex-col md:flex-row gap-5 items-start justify-between transition-opacity ${
                    isCancelled ? 'opacity-85 border-neutral-600' : ''
                  }`}
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex gap-4 flex-1">
                    <Link to={product ? `/products/${product.id}` : '#'} className="shrink-0">
                      <img
                        src={
                          product?.images[0]?.url ||
                          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&q=80'
                        }
                        alt={product?.name}
                        className={`w-24 h-32 object-cover border-2 border-[#121212] shadow-brutal-sm hover:opacity-90 transition-opacity ${
                          isCancelled ? 'grayscale-50' : ''
                        }`}
                      />
                    </Link>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(res.status)}
                        {getExpiryDetails(res)}
                        <span className="font-mono text-xs font-bold text-neutral-500">
                          Reserved on: {new Date(res.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-black text-lg text-[#121212] truncate">
                        {product ? (
                          <Link
                            to={`/products/${product.id}`}
                            className="hover:underline hover:text-[#FF6EA7] transition-colors inline-flex items-center gap-1"
                          >
                            <span>{product.name}</span>
                            <ExternalLink size={14} className="shrink-0 text-neutral-500" />
                          </Link>
                        ) : (
                          'Reserved Outfit'
                        )}
                      </h3>

                      <p className="text-xs font-mono text-neutral-700">
                        {product?.material} • {product?.color} • Qty: <strong>{res.quantity}</strong>
                      </p>

                      <div className="flex items-baseline gap-2 pt-1">
                        <span className={`text-xl font-black ${isCancelled ? 'text-neutral-500 line-through' : 'text-[#121212]'}`}>
                          ₹{(res.unitPrice * res.quantity).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-500">
                          {isCancelled
                            ? '(Hold cancelled — item released)'
                            : isCompleted
                            ? '(Purchased in-store)'
                            : '(Pay at shop upon physical inspection)'}
                        </span>
                      </div>

                      {/* Mall Location details */}
                      {location && (
                        <div className="mt-2 p-2.5 bg-[#FAF7EE] border border-[#121212] text-xs font-mono space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-bold flex items-center gap-1 text-[#121212]">
                              <Store size={14} /> {shop.name}
                            </p>
                            {shop?.phone && (
                              <a
                                href={`tel:${shop.phone}`}
                                className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#121212] hover:bg-[#FFE600] px-2 py-0.5 border border-[#121212] transition-colors"
                              >
                                <Phone size={11} /> Call Shop ({shop.phone})
                              </a>
                            )}
                          </div>
                          <p className="text-neutral-700">
                            {location.mall?.name ? `${location.mall.name}, ` : ''}
                            {location.floorName ? `${location.floorName}, ` : ''}
                            {location.shopNumber ? `Shop #${location.shopNumber}` : ''}
                          </p>
                          {location.indoorDirections && (
                            <p className="text-[11px] text-neutral-600 bg-amber-50 p-1.5 border border-amber-300">
                              🚶 <strong>Indoor Directions:</strong> {location.indoorDirections}
                            </p>
                          )}
                          {location.nearbyLandmark && (
                            <p className="text-[10px] text-neutral-500">
                              📍 Landmark: {location.nearbyLandmark}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Reservation Status & Action Box */}
                  <div className="w-full md:w-64 bg-[#FAF7EE] border-2 border-[#121212] p-4 text-center space-y-3 shrink-0">
                    {/* Active State */}
                    {isActive && (
                      <>
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 block">
                            In-Store Pickup Code
                          </span>
                          <div className="flex items-center justify-center gap-2 my-1">
                            <div className="text-2xl font-black font-mono tracking-wider bg-[#FFE600] border-2 border-[#121212] py-1 px-3 shadow-brutal-sm text-[#121212]">
                              {res.reservationCode}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(res.id, res.reservationCode)}
                              title="Copy Code"
                              className="p-1.5 bg-white hover:bg-neutral-100 border-2 border-[#121212] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-1 cursor-pointer font-bold text-[11px]"
                            >
                              {isCopied ? (
                                <>
                                  <Check size={14} className="text-[#00E599]" strokeWidth={3} />
                                  <span className="text-[#00E599] font-black">COPIED</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={14} className="text-[#121212]" />
                                  <span className="text-[#121212]">COPY</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-[10px] font-mono text-neutral-600">
                            Show this to shopkeeper on arrival
                          </p>
                        </div>

                        <div className="text-xs font-mono text-neutral-800 bg-white p-2 border border-neutral-300 text-left space-y-1">
                          <div className="flex items-center gap-1 font-bold">
                            <Calendar size={13} /> Visit Date:
                          </div>
                          <div className="font-bold text-[#121212]">
                            {new Date(res.preferredVisitDate).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            ({res.preferredVisitTime || 'Flexible'})
                          </div>
                          {res.expiresAt && (
                            <div className="text-[10px] text-neutral-500 pt-1 border-t border-neutral-200">
                              Hold Valid Until:{' '}
                              {new Date(res.expiresAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          )}
                        </div>

                        <BrutalButton
                          variant="danger"
                          size="sm"
                          fullWidth
                          onClick={() => openCancelModal(res)}
                        >
                          Cancel Hold
                        </BrutalButton>
                      </>
                    )}

                    {/* Cancelled State */}
                    {isCancelled && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-black uppercase text-[#FF4D4D] block">
                          Hold Deactivated
                        </span>
                        <div className="text-xl font-black font-mono tracking-wider bg-neutral-200 line-through text-neutral-500 border-2 border-neutral-400 py-1 px-3 shadow-none">
                          {res.reservationCode}
                        </div>
                        <p className="text-[10px] font-mono font-bold text-[#FF4D4D]">
                          ✕ HOLD CANCELLED
                        </p>
                        <div className="text-[11px] font-mono text-neutral-600 bg-white p-2 border border-neutral-300 text-left space-y-1">
                          <p>
                            <strong>Reason:</strong> {res.cancelReason || 'Cancelled by customer online'}
                          </p>
                          <p className="text-[10px] text-neutral-500">
                            Item released back to shop stock.
                          </p>
                        </div>
                        {product && (
                          <Link to={`/products/${product.id}`} className="block pt-1">
                            <BrutalButton variant="outline" size="sm" fullWidth>
                              Re-Reserve Outfit →
                            </BrutalButton>
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Expired State */}
                    {isExpired && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-black uppercase text-neutral-500 block">
                          Hold Lapsed
                        </span>
                        <div className="text-xl font-black font-mono tracking-wider bg-neutral-200 text-neutral-500 border-2 border-neutral-400 py-1 px-3">
                          {res.reservationCode}
                        </div>
                        <p className="text-[10px] font-mono text-neutral-500 font-bold">
                          ⚠ 48-Hour Window Ended
                        </p>
                        <div className="text-[11px] font-mono text-neutral-600 bg-white p-2 border border-neutral-300 text-left">
                          <p className="text-[10px] text-neutral-500">
                            Hold expired on {new Date(res.expiresAt).toLocaleDateString()}.
                          </p>
                        </div>
                        {product && (
                          <Link to={`/products/${product.id}`} className="block pt-1">
                            <BrutalButton variant="outline" size="sm" fullWidth>
                              Check Availability →
                            </BrutalButton>
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Completed State */}
                    {isCompleted && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-black uppercase text-[#00E599] bg-[#121212] px-2 py-0.5 inline-block">
                          Purchased In Store
                        </span>
                        <div className="text-xl font-black font-mono tracking-wider bg-[#00E599] text-[#121212] border-2 border-[#121212] py-1 px-3 shadow-brutal-sm">
                          {res.reservationCode}
                        </div>
                        <p className="text-[10px] font-mono font-bold text-neutral-700">
                          ✓ Bought at physical shop
                        </p>
                        {product && (
                          <Link to={`/products/${product.id}`} className="block pt-1">
                            <BrutalButton variant="outline" size="sm" fullWidth>
                              View Outfit Page
                            </BrutalButton>
                          </Link>
                        )}
                      </div>
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
              {activeTab === 'ACTIVE'
                ? 'No Active In-Store Reservations'
                : activeTab === 'CANCELLED_EXPIRED'
                ? 'No Cancelled or Expired Reservations'
                : activeTab === 'COMPLETED'
                ? 'No In-Store Purchases Yet'
                : 'No Reservations Found'}
            </h3>
            <p className="text-xs font-mono text-neutral-600 max-w-md mx-auto">
              {activeTab === 'ACTIVE'
                ? 'Explore traditional sarees, mekhela chadors, and lehengas from verified local shops and hold any piece for 48 hours with zero advance payment.'
                : 'Your reservation history will appear here.'}
            </p>
            <div className="pt-2">
              <Link to="/explore">
                <BrutalButton variant="primary">Explore Traditional Outfits</BrutalButton>
              </Link>
            </div>
          </BrutalCard>
        )}
      </div>

      {/* Neo-Brutalist Cancel Confirmation Modal */}
      {reservationToCancel && (
        <BrutalModal
          isOpen={!!reservationToCancel}
          onClose={closeCancelModal}
          title="CANCEL IN-STORE HOLD?"
          maxWidth="md"
        >
          <div className="space-y-4">
            {/* Warning Alert */}
            <div className="p-3 bg-[#FF4D4D] text-white border-2 border-[#121212] shadow-brutal-sm text-xs font-bold flex items-start gap-2.5">
              <AlertTriangle size={20} className="shrink-0 mt-0.5" />
              <div>
                <strong className="block uppercase tracking-wider">Stock Release Warning</strong>
                <span>
                  Cancelling will immediately release the held piece back into the boutique inventory for other customers, and your in-store pickup code will be deactivated.
                </span>
              </div>
            </div>

            {/* Item summary */}
            <div className="flex gap-3 bg-white border-2 border-[#121212] p-3 shadow-brutal-sm font-mono">
              <img
                src={
                  reservationToCancel.product?.images[0]?.url ||
                  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=120'
                }
                alt={reservationToCancel.product?.name}
                className="w-16 h-20 object-cover border-2 border-[#121212] shrink-0"
              />
              <div className="flex-1 min-w-0 text-xs">
                <span className="font-bold text-neutral-600 block truncate">
                  {reservationToCancel.shop?.name}
                </span>
                <h4 className="font-black text-sm text-[#121212] truncate">
                  {reservationToCancel.product?.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-black bg-[#FFE600] px-1.5 py-0.5 border border-[#121212]">
                    {reservationToCancel.reservationCode}
                  </span>
                  <span className="font-bold text-neutral-700">
                    Qty: {reservationToCancel.quantity}
                  </span>
                </div>
              </div>
            </div>

            {/* Reason selector */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1 font-mono">
                Reason for Cancellation (Optional)
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#121212] shadow-brutal-sm font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="Change of plans">Change of plans</option>
                <option value="Found an alternative outfit">Found an alternative outfit</option>
                <option value="Cannot visit boutique within 48 hours">Cannot visit boutique within 48 hours</option>
                <option value="Need a different size or color">Need a different size or color</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            {cancelReason === 'Other' && (
              <div>
                <input
                  type="text"
                  placeholder="Specify cancellation reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  maxLength={150}
                  className="w-full px-3 py-2 bg-white border-2 border-[#121212] shadow-brutal-sm font-medium text-xs focus:outline-none font-mono"
                />
              </div>
            )}

            {cancelError && (
              <div className="p-2.5 bg-red-100 border border-red-500 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{cancelError}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <BrutalButton
                variant="outline"
                size="md"
                fullWidth
                disabled={isCancelling}
                onClick={closeCancelModal}
              >
                Keep My Hold
              </BrutalButton>
              <BrutalButton
                variant="danger"
                size="md"
                fullWidth
                isLoading={isCancelling}
                onClick={executeCancelHold}
              >
                Yes, Cancel Hold
              </BrutalButton>
            </div>
          </div>
        </BrutalModal>
      )}
    </div>
  );
};

export default CustomerReservationsPage;


