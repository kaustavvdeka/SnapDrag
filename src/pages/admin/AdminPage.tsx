import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BrutalCard from '../../components/common/BrutalCard.js';
import BrutalBadge from '../../components/common/BrutalBadge.js';
import BrutalButton from '../../components/common/BrutalButton.js';
import StatCard from '../../components/common/StatCard.js';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  ShieldAlert,
  Users,
  Store,
  Package,
  BookmarkCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building2,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, role, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [pendingShops, setPendingShops] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'approvals' | 'users'>('approvals');
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, shopsRes, usersRes]: any = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/pending-shops'),
        api.get('/admin/users'),
      ]);

      setStats(statsRes.data);
      setPendingShops(shopsRes.data || []);
      setUsersList(usersRes.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || role !== 'ADMIN')) {
      navigate('/login?redirect=/admin');
      return;
    }
    if (isAuthenticated && role === 'ADMIN') {
      fetchAdminData();
    }
  }, [isAuthenticated, role, authLoading, navigate]);

  const handleApproveShop = async (shopId: string, approve: boolean) => {
    try {
      await api.patch(`/admin/shops/${shopId}/approve`, { approve });
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="pb-4 border-b-4 border-[#121212] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-black uppercase text-white bg-[#FF4D4D] px-2 py-0.5 inline-block">
              Platform Governance
            </span>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#121212] mt-1">
              ADMIN CONTROL PANEL
            </h1>
          </div>

          <span className="text-xs font-mono font-bold bg-white px-3 py-1.5 border-2 border-[#121212] shadow-brutal-sm">
            Admin: {user?.email}
          </span>
        </div>

        {/* Top Platform Metric Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard title="Total Users" value={stats.totalUsers} bg="bg-white" />
            <StatCard title="Total Shops" value={stats.totalShops} bg="bg-white" />
            <StatCard title="Live Shops" value={stats.activeShops} bg="bg-[#00E599]" />
            <StatCard title="Pending Approvals" value={stats.pendingShops} bg="bg-[#FFE600]" />
            <StatCard title="Live Outfits" value={stats.totalProducts} bg="bg-white" />
            <StatCard title="In-Store Holds" value={stats.totalReservations} bg="bg-[#38BDF8]" />
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex gap-2 border-b-3 border-[#121212] pb-2">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2 border-2 border-[#121212] font-black text-xs uppercase cursor-pointer ${
              activeTab === 'approvals'
                ? 'bg-[#FFE600] shadow-brutal-sm'
                : 'bg-white hover:bg-neutral-100'
            }`}
          >
            Pending Shop Approvals ({pendingShops.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 border-2 border-[#121212] font-black text-xs uppercase cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#FFE600] shadow-brutal-sm'
                : 'bg-white hover:bg-neutral-100'
            }`}
          >
            Registered Users ({usersList.length})
          </button>
        </div>

        {/* Tab 1: Shop Approvals */}
        {activeTab === 'approvals' && (
          <BrutalCard bg="bg-white" shadow="md" className="p-5 space-y-4">
            <h3 className="font-black text-base uppercase text-[#121212]">
              Shopkeeper Verification Queue
            </h3>

            {pendingShops.length > 0 ? (
              <div className="space-y-4">
                {pendingShops.map((shop) => (
                  <div
                    key={shop.id}
                    className="p-4 bg-[#FAF7EE] border-2 border-[#121212] shadow-brutal-sm flex flex-col md:flex-row items-start justify-between gap-4 font-mono text-xs"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-[#121212]">{shop.name}</span>
                        <BrutalBadge variant="yellow" size="sm">Verification Pending</BrutalBadge>
                      </div>
                      <p className="text-neutral-700">{shop.description}</p>
                      <p className="text-neutral-600">
                        Owner: <strong>{shop.owner?.name}</strong> • Email: {shop.owner?.email} • Phone: {shop.phone}
                      </p>
                      {shop.location && (
                        <p className="text-neutral-600">
                          Location: {shop.location.address}, {shop.location.city}, {shop.location.state}
                          {shop.location.mall && ` (${shop.location.mall.name})`}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <BrutalButton
                        variant="accent"
                        size="sm"
                        onClick={() => handleApproveShop(shop.id, true)}
                      >
                        ✓ Approve Shop
                      </BrutalButton>
                      <BrutalButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleApproveShop(shop.id, false)}
                      >
                        ✕ Reject
                      </BrutalButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs font-mono text-neutral-500">
                ✓ All registered shops have been verified and processed!
              </div>
            )}
          </BrutalCard>
        )}

        {/* Tab 2: User Governance */}
        {activeTab === 'users' && (
          <BrutalCard bg="bg-white" shadow="md" className="p-5">
            <h3 className="font-black text-base uppercase text-[#121212] mb-4">
              Platform Accounts ({usersList.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-[#121212] text-white">
                    <th className="p-2.5 border-2 border-[#121212]">NAME</th>
                    <th className="p-2.5 border-2 border-[#121212]">EMAIL</th>
                    <th className="p-2.5 border-2 border-[#121212]">ROLE</th>
                    <th className="p-2.5 border-2 border-[#121212]">PHONE</th>
                    <th className="p-2.5 border-2 border-[#121212]">STATUS</th>
                    <th className="p-2.5 border-2 border-[#121212] text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id} className="border-b border-neutral-300 hover:bg-[#FAF7EE]">
                      <td className="p-2.5 font-bold">{u.name}</td>
                      <td className="p-2.5">{u.email}</td>
                      <td className="p-2.5">
                        <BrutalBadge
                          variant={u.role === 'ADMIN' ? 'red' : u.role === 'SHOPKEEPER' ? 'yellow' : 'green'}
                          size="sm"
                        >
                          {u.role}
                        </BrutalBadge>
                      </td>
                      <td className="p-2.5">{u.phone || '—'}</td>
                      <td className="p-2.5 font-bold">
                        {u.isActive ? (
                          <span className="text-green-700">Active</span>
                        ) : (
                          <span className="text-red-700">Suspended</span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                            className="underline font-bold text-xs cursor-pointer hover:text-red-600"
                          >
                            {u.isActive ? 'Suspend' : 'Reactivate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </BrutalCard>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
