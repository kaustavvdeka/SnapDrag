import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout.js';
import BrutalCard from '../../components/common/BrutalCard.js';
import BrutalBadge from '../../components/common/BrutalBadge.js';
import BrutalButton from '../../components/common/BrutalButton.js';
import { Reservation, ReservationStatus } from '../../types/index.js';
import api from '../../api/client.js';
import {
  BookmarkCheck,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  ShoppingBag,
  AlertTriangle,
} from 'lucide-react';

export const ShopkeeperReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const url = filterStatus === 'ALL'
        ? '/reservations/shop'
        : `/reservations/shop?status=${filterStatus}`;
      const res: any = await api.get(url);
      setReservations(res.data || []);
    } catch (err) {
      console.error('Failed to load shop reservations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [filterStatus]);

  const handleUpdateStatus = async (
    reservationId: string,
    newStatus: ReservationStatus,
    reason?: string
  ) => {
    setUpdatingId(reservationId);
    try {
      await api.patch(`/reservations/${reservationId}/status`, {
        status: newStatus,
        cancelReason: reason,
      });
      await fetchReservations();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'PENDING':
        return <BrutalBadge variant="yellow" size="sm">Pending Your Confirmation</BrutalBadge>;
      case 'CONFIRMED':
        return <BrutalBadge variant="blue" size="sm">Confirmed / Holding Stock</BrutalBadge>;
      case 'READY_FOR_VISIT':
        return <BrutalBadge variant="green" size="sm">Ready For Visit</BrutalBadge>;
      case 'COMPLETED':
        return <BrutalBadge variant="dark" size="sm">Sold In Store</BrutalBadge>;
      case 'CANCELLED':
        return <BrutalBadge variant="red" size="sm">Cancelled</BrutalBadge>;
      case 'EXPIRED':
        return <BrutalBadge variant="white" size="sm">Expired</BrutalBadge>;
      default:
        return <BrutalBadge variant="yellow" size="sm">{status}</BrutalBadge>;
    }
  };

  return (
    <DashboardLayout
      title="Customer In-Store Holds"
      subtitle="Fulfill reservation requests, confirm hold availability, and record in-person purchases."
    >
      <BrutalCard bg="bg-white" shadow="md" className="p-4 space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 pb-2 border-b-2 border-[#121212]">
          {['ALL', 'PENDING', 'CONFIRMED', 'READY_FOR_VISIT', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`text-xs px-3 py-1 border-2 border-[#121212] font-black uppercase transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-[#FFE600] shadow-brutal-sm translate-x-0.5'
                  : 'bg-white hover:bg-neutral-100'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Reservations List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-neutral-200 border-2 border-[#121212] animate-pulse" />
            ))}
          </div>
        ) : reservations.length > 0 ? (
          <div className="space-y-3">
            {reservations.map((res) => {
              const product = res.product;
              const isUpdating = updatingId === res.id;

              return (
                <div
                  key={res.id}
                  className="p-4 bg-[#FAF7EE] border-2 border-[#121212] shadow-brutal-sm flex flex-col md:flex-row gap-4 items-start justify-between font-mono text-xs"
                >
                  {/* Left: Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black bg-[#FFE600] px-2 py-0.5 border border-[#121212] text-sm text-[#121212]">
                        {res.reservationCode}
                      </span>
                      {getStatusBadge(res.status)}
                    </div>

                    <h4 className="font-black text-sm text-[#121212] truncate mt-1">
                      {product?.name}
                    </h4>

                    <div className="flex flex-wrap gap-4 text-neutral-700 pt-1">
                      <span className="flex items-center gap-1 font-bold">
                        <User size={13} /> {res.customer?.name} ({res.customer?.phone || 'No phone'})
                      </span>
                      <span className="flex items-center gap-1 font-bold text-[#121212]">
                        Qty: {res.quantity} • Total: ₹{(res.unitPrice * res.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-neutral-600 bg-white p-2 border border-neutral-300">
                      <Calendar size={13} />
                      <span>
                        Visit Scheduled: <strong>{new Date(res.preferredVisitDate).toLocaleDateString()}</strong>{' '}
                        ({res.preferredVisitTime || 'Flexible'})
                      </span>
                    </div>

                    {res.notes && (
                      <p className="text-[11px] text-neutral-700 bg-amber-50 p-1.5 border border-amber-200">
                        Customer Note: "{res.notes}"
                      </p>
                    )}
                  </div>

                  {/* Right: Fulfillment Action Buttons */}
                  <div className="w-full md:w-56 space-y-1.5 shrink-0 pt-2 md:pt-0">
                    {res.status === 'PENDING' && (
                      <BrutalButton
                        variant="primary"
                        size="sm"
                        fullWidth
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(res.id, 'CONFIRMED')}
                      >
                        ✓ Confirm & Hold Item
                      </BrutalButton>
                    )}

                    {(res.status === 'PENDING' || res.status === 'CONFIRMED') && (
                      <BrutalButton
                        variant="accent"
                        size="sm"
                        fullWidth
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(res.id, 'READY_FOR_VISIT')}
                      >
                        Set "Ready for Visit"
                      </BrutalButton>
                    )}

                    {['PENDING', 'CONFIRMED', 'READY_FOR_VISIT'].includes(res.status) && (
                      <BrutalButton
                        variant="dark"
                        size="sm"
                        fullWidth
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(res.id, 'COMPLETED')}
                      >
                        <ShoppingBag size={14} className="mr-1" /> Mark Sold Offline
                      </BrutalButton>
                    )}

                    {['PENDING', 'CONFIRMED'].includes(res.status) && (
                      <BrutalButton
                        variant="danger"
                        size="sm"
                        fullWidth
                        disabled={isUpdating}
                        onClick={() => {
                          const reason = prompt('Reason for declining reservation:');
                          if (reason !== null) {
                            handleUpdateStatus(res.id, 'CANCELLED', reason || 'Out of physical stock');
                          }
                        }}
                      >
                        Decline & Release Stock
                      </BrutalButton>
                    )}

                    {res.status === 'COMPLETED' && (
                      <span className="block text-center text-xs font-black text-[#00E599] bg-[#121212] py-1 border border-[#121212]">
                        ✓ COMPLETED IN STORE
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center space-y-3 font-mono">
            <BookmarkCheck size={36} className="mx-auto text-neutral-400" />
            <p className="font-bold text-sm text-[#121212]">No reservations found for this status</p>
          </div>
        )}
      </BrutalCard>
    </DashboardLayout>
  );
};

export default ShopkeeperReservationsPage;
