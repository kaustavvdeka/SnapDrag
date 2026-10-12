import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, Reservation } from '../../types/index.js';
import BrutalModal from '../common/BrutalModal.js';
import BrutalButton from '../common/BrutalButton.js';
import BrutalBadge from '../common/BrutalBadge.js';
import { useAuth } from '../../context/AuthContext.js';
import api from '../../api/client.js';
import {
  Calendar,
  Clock,
  MapPin,
  Store,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  Copy,
  Check,
  LogIn,
  Phone,
  Sparkles,
} from 'lucide-react';

interface ReservationModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (reservation: Reservation) => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Date calculation strictly bounded to 48 hours (today to today + 2 days)
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 2);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const [quantity, setQuantity] = useState(1);
  const [visitDate, setVisitDate] = useState(tomorrowStr);
  const [visitTime, setVisitTime] = useState('3:00 PM - 5:00 PM');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRestoredFromDraft, setIsRestoredFromDraft] = useState(false);

  // Restore draft from sessionStorage if returning from login
  useEffect(() => {
    if (!isOpen || !product) return;
    try {
      const saved = sessionStorage.getItem('vastrix_pending_reservation');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.productId === product.id) {
          if (parsed.quantity) setQuantity(Number(parsed.quantity));
          if (parsed.visitDate) setVisitDate(parsed.visitDate);
          if (parsed.visitTime) setVisitTime(parsed.visitTime);
          if (parsed.notes) setNotes(parsed.notes);
          setIsRestoredFromDraft(true);
        }
      }
    } catch {
      // ignore JSON parse errors
    }
  }, [isOpen, product]);

  if (!product) return null;

  const handleSaveDraftAndRedirect = () => {
    try {
      sessionStorage.setItem(
        'vastrix_pending_reservation',
        JSON.stringify({
          productId: product.id,
          quantity,
          visitDate,
          visitTime,
          notes,
          timestamp: Date.now(),
        })
      );
    } catch {
      // ignore
    }
    const currentPath = window.location.pathname + window.location.search;
    navigate('/login?redirect=' + encodeURIComponent(currentPath));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      handleSaveDraftAndRedirect();
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response: any = await api.post('/reservations', {
        productId: product.id,
        quantity,
        preferredVisitDate: new Date(visitDate).toISOString(),
        preferredVisitTime: visitTime,
        notes: notes.trim() || undefined,
      });

      // Robust response unwrapping
      const resData = response?.data?.id
        ? response.data
        : response?.id
        ? response
        : response?.data || response;

      setCreatedReservation(resData);
      sessionStorage.removeItem('vastrix_pending_reservation');
      setIsRestoredFromDraft(false);

      if (onSuccess) {
        onSuccess(resData);
      }
    } catch (err: any) {
      console.error('Reservation failed:', err);
      const msg =
        err?.message ||
        err?.error?.message ||
        err?.response?.data?.message ||
        (typeof err === 'string'
          ? err
          : 'Unable to place reservation. The item might have gone out of stock.');
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleClose = () => {
    setCreatedReservation(null);
    setErrorMsg('');
    setCopied(false);
    onClose();
  };

  return (
    <BrutalModal
      isOpen={isOpen}
      onClose={handleClose}
      title={createdReservation ? 'RESERVATION CONFIRMED!' : 'RESERVE & VISIT SHOP'}
      maxWidth="md"
    >
      {createdReservation ? (
        <div className="space-y-4 text-center py-1">
          <div className="w-16 h-16 bg-[#00E599] border-3 border-[#121212] shadow-brutal flex items-center justify-center mx-auto">
            <CheckCircle size={36} className="text-[#121212]" strokeWidth={2.5} />
          </div>

          <div>
            <span className="text-xs font-black uppercase text-neutral-500 block">
              Your Unique In-Store Pickup Code
            </span>
            <div className="flex items-center justify-center gap-2 my-2">
              <div className="text-3xl font-black font-mono tracking-wider bg-[#FFE600] border-3 border-[#121212] py-2 px-5 shadow-brutal-sm text-[#121212]">
                {createdReservation.reservationCode}
              </div>
              <button
                type="button"
                onClick={() => handleCopyCode(createdReservation.reservationCode)}
                title="Copy Pickup Code"
                className="p-3 bg-white hover:bg-neutral-100 border-3 border-[#121212] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer font-bold text-xs"
              >
                {copied ? (
                  <>
                    <Check size={18} className="text-[#00E599]" strokeWidth={3} />
                    <span className="text-[#00E599] font-black">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy size={18} className="text-[#121212]" />
                    <span className="text-[#121212]">COPY</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-neutral-700 font-mono">
              Show this code to the shopkeeper upon arrival to inspect the fabric and outfit in-person.
            </p>
          </div>

          <div className="text-left bg-white border-2 border-[#121212] p-3 text-xs space-y-2 font-medium shadow-brutal-sm">
            <div className="flex items-center justify-between">
              <p className="font-black flex items-center gap-1.5 text-sm text-[#121212]">
                <Store size={16} /> {product.shop?.name}
              </p>
              {product.shop?.phone && (
                <a
                  href={`tel:${product.shop.phone}`}
                  className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#121212] bg-[#FAF7EE] hover:bg-[#FFE600] px-2 py-0.5 border border-[#121212] transition-colors"
                >
                  <Phone size={11} /> {product.shop.phone}
                </a>
              )}
            </div>

            {product.shop?.location && (
              <p className="text-neutral-700 flex items-start gap-1 font-mono text-[11px]">
                <MapPin size={14} className="shrink-0 mt-0.5 text-[#FF4D4D]" />
                <span>
                  {product.shop.location.shopNumber ? `${product.shop.location.shopNumber}, ` : ''}
                  {product.shop.location.floorName ? `${product.shop.location.floorName}, ` : ''}
                  {product.shop.location.address}, {product.shop.location.city}
                  {product.shop.location.indoorDirections && (
                    <span className="block text-neutral-500 font-normal mt-0.5">
                      📍 {product.shop.location.indoorDirections}
                    </span>
                  )}
                </span>
              </p>
            )}

            <div className="p-2 bg-[#FAF7EE] border border-neutral-300 space-y-1 font-mono text-[11px]">
              <p className="flex items-center gap-1.5 text-neutral-800">
                <Calendar size={13} /> Scheduled Visit:{' '}
                <span className="font-bold text-[#121212]">
                  {new Date(createdReservation.preferredVisitDate).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}{' '}
                  ({createdReservation.preferredVisitTime || 'Flexible'})
                </span>
              </p>
              <p className="flex items-center gap-1.5 text-neutral-800">
                <Clock size={13} className="text-[#FF4D4D]" /> 48-Hour Hold Valid Until:{' '}
                <span className="font-bold text-[#121212]">
                  {new Date(
                    createdReservation.expiresAt || Date.now() + 48 * 3600 * 1000
                  ).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </p>
            </div>

            <p className="text-neutral-500 font-mono text-[11px] pt-1 border-t border-neutral-200">
              🔒 No advance online payment required. Pay in store only after you are 100% satisfied!
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <BrutalButton
              variant="outline"
              size="md"
              fullWidth
              onClick={() => {
                handleClose();
                navigate('/reservations');
              }}
            >
              My Reservations
            </BrutalButton>
            <BrutalButton variant="dark" size="md" fullWidth onClick={handleClose}>
              Done
            </BrutalButton>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Draft Restored Banner */}
          {isRestoredFromDraft && isAuthenticated && (
            <div className="p-2.5 bg-[#00E599]/20 border-2 border-[#121212] shadow-brutal-sm text-xs font-bold text-[#121212] flex items-center gap-2">
              <Sparkles size={16} className="text-[#121212] shrink-0" />
              <span>We restored your selected hold details! Click confirm below to generate your code.</span>
            </div>
          )}

          {/* Unauthenticated Quick Banner */}
          {!isAuthenticated && (
            <div className="p-3 bg-[#FFE600] border-2 border-[#121212] shadow-brutal-sm text-xs font-mono text-[#121212] space-y-2">
              <div className="flex items-start gap-2">
                <LogIn size={16} className="shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-black uppercase tracking-tight">Quick Sign In Required</strong>
                  <span>
                    Holds are 100% free! Sign in or register to generate your unique in-store pickup code. We will remember your selected date and options.
                  </span>
                </div>
              </div>
              <BrutalButton
                type="button"
                variant="dark"
                size="sm"
                fullWidth
                onClick={handleSaveDraftAndRedirect}
              >
                Sign In To Reserve (Free)
              </BrutalButton>
            </div>
          )}

          {/* Product Summary */}
          <div className="flex gap-3 bg-white border-2 border-[#121212] p-3 shadow-brutal-sm">
            <img
              src={product.images[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=150'}
              alt={product.name}
              className="w-18 h-22 object-cover border-2 border-[#121212] shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-mono font-bold text-neutral-600 block">
                {product.shop?.name}
              </span>
              <h4 className="font-black text-sm text-[#121212] truncate">{product.name}</h4>
              <p className="text-xs text-neutral-700 font-mono mt-0.5">
                {product.material} • {product.color}
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-black text-base text-[#121212]">
                  ₹{product.discountedPrice.toLocaleString('en-IN')}
                </span>
                <BrutalBadge variant="green" size="sm">
                  {product.availableQuantity} available
                </BrutalBadge>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#FF4D4D] text-white border-2 border-[#121212] shadow-brutal-sm text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Quantity to Hold
              </label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border-2 border-[#121212] shadow-brutal-sm font-bold focus:outline-none cursor-pointer"
              >
                {Array.from({ length: Math.min(product.availableQuantity, 5) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} piece{n > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Preferred Visit Date
              </label>
              <input
                type="date"
                min={todayStr}
                max={maxDateStr}
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border-2 border-[#121212] shadow-brutal-sm font-bold text-xs focus:outline-none cursor-pointer"
              />
              <span className="block text-[10px] font-mono text-neutral-500 mt-1">
                Hold valid for 48 hrs (max 2 days)
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1">
              Time Window (Estimated)
            </label>
            <select
              value={visitTime}
              onChange={(e) => setVisitTime(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-[#121212] shadow-brutal-sm font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="11:00 AM - 1:00 PM">Morning (11:00 AM - 1:00 PM)</option>
              <option value="1:00 PM - 3:00 PM">Afternoon (1:00 PM - 3:00 PM)</option>
              <option value="3:00 PM - 5:00 PM">Evening (3:00 PM - 5:00 PM)</option>
              <option value="5:00 PM - 7:00 PM">Late Evening (5:00 PM - 7:00 PM)</option>
              <option value="7:00 PM - 9:00 PM">Night (7:00 PM - 9:00 PM)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1">
              Note for Shopkeeper (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Please keep matching blouse fabric or alternate color ready"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={200}
              className="w-full px-3 py-2 bg-white border-2 border-[#121212] shadow-brutal-sm font-medium text-xs focus:outline-none"
            />
          </div>

          {/* Guarantee banner */}
          <div className="p-2.5 bg-[#FAF7EE] border border-[#121212] text-[11px] text-neutral-700 flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#00E599] shrink-0" strokeWidth={2.5} />
            <span>
              <strong>Zero Obligation:</strong> Item is held exclusively for you for 48 hours. If you don't like the feel or fit in-person, you have zero obligation to buy!
            </span>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <BrutalButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
            >
              {isAuthenticated ? 'CONFIRM RESERVATION (FREE)' : 'SIGN IN & CONFIRM (FREE)'}
            </BrutalButton>
          </div>
        </form>
      )}
    </BrutalModal>
  );
};

export default ReservationModal;

