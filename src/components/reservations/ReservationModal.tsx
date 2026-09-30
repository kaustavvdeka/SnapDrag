import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, Reservation } from '../../types/index.js';
import BrutalModal from '../common/BrutalModal.js';
import BrutalButton from '../common/BrutalButton.js';
import BrutalBadge from '../common/BrutalBadge.js';
import { useAuth } from '../../context/AuthContext.js';
import api from '../../api/client.js';
import { Calendar, Clock, MapPin, Store, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';

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

  const [quantity, setQuantity] = useState(1);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [visitDate, setVisitDate] = useState(defaultDateStr);
  const [visitTime, setVisitTime] = useState('3:00 PM - 5:00 PM');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
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

      const resData = response.data;
      setCreatedReservation(resData);
      if (onSuccess) onSuccess(resData);
    } catch (err: any) {
      console.error('Reservation failed:', err);
      setErrorMsg(err.message || 'Unable to place reservation. The item might be out of stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCreatedReservation(null);
    setErrorMsg('');
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
        <div className="space-y-4 text-center py-2">
          <div className="w-16 h-16 bg-[#00E599] border-3 border-[#121212] shadow-brutal flex items-center justify-center mx-auto">
            <CheckCircle size={36} className="text-[#121212]" strokeWidth={2.5} />
          </div>

          <div>
            <span className="text-xs font-black uppercase text-neutral-500">Your Unique In-Store Code</span>
            <div className="text-3xl font-black font-mono tracking-wider bg-[#FFE600] border-3 border-[#121212] py-2 px-4 shadow-brutal-sm inline-block my-2 text-[#121212]">
              {createdReservation.reservationCode}
            </div>
            <p className="text-xs text-neutral-700 font-mono">
              Show this code to the shopkeeper upon arrival to inspect the item physically.
            </p>
          </div>

          <div className="text-left bg-white border-2 border-[#121212] p-3 text-xs space-y-1.5 font-medium shadow-brutal-sm">
            <p className="font-bold flex items-center gap-1.5 text-sm text-[#121212]">
              <Store size={16} /> {product.shop?.name}
            </p>
            {product.shop?.location && (
              <p className="text-neutral-700 flex items-start gap-1">
                <MapPin size={14} className="shrink-0 mt-0.5" />
                <span>
                  {product.shop.location.shopNumber ? `${product.shop.location.shopNumber}, ` : ''}
                  {product.shop.location.floorName ? `${product.shop.location.floorName}, ` : ''}
                  {product.shop.location.address}, {product.shop.location.city}
                </span>
              </p>
            )}
            <p className="flex items-center gap-1.5 text-neutral-800">
              <Calendar size={14} /> Scheduled Visit:{' '}
              <span className="font-bold">
                {new Date(createdReservation.preferredVisitDate).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}{' '}
                ({createdReservation.preferredVisitTime || 'Flexible'})
              </span>
            </p>
            <p className="text-neutral-500 font-mono text-[11px] pt-1 border-t border-neutral-200">
              Stock is held for 48 hours. No advance online payment required. Inspect & pay at the shop!
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
                className="w-full px-3 py-2 bg-white border-2 border-[#121212] shadow-brutal-sm font-bold focus:outline-none"
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
                min={new Date().toISOString().split('T')[0]}
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border-2 border-[#121212] shadow-brutal-sm font-bold text-xs focus:outline-none"
              >
              </input>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1">
              Time Window (Estimated)
            </label>
            <select
              value={visitTime}
              onChange={(e) => setVisitTime(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-[#121212] shadow-brutal-sm font-bold text-xs focus:outline-none"
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
              placeholder="e.g. Please keep matching blouse fabric ready"
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
              <strong>Zero Obligation:</strong> Item is held exclusively for you. If you don't like the feel or fit in-person, you have no obligation to buy!
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
              CONFIRM RESERVATION (FREE)
            </BrutalButton>
          </div>
        </form>
      )}
    </BrutalModal>
  );
};

export default ReservationModal;
