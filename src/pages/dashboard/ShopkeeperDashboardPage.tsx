import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout.js';
import StatCard from '../../components/common/StatCard.js';
import BrutalCard from '../../components/common/BrutalCard.js';
import BrutalBadge from '../../components/common/BrutalBadge.js';
import BrutalButton from '../../components/common/BrutalButton.js';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  Package,
  CheckCircle2,
  BookmarkCheck,
  Eye,
  ShoppingBag,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const ShopkeeperDashboardPage: React.FC = () => {
  const { user, role, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || role !== 'SHOPKEEPER')) {
      navigate('/login?redirect=/dashboard');
      return;
    }

    if (isAuthenticated) {
      api.get('/shops/dashboard-stats')
        .then((res: any) => setDashboardData(res.data))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isAuthenticated, role, authLoading, navigate]);

  if (isLoading) {
    return (
      <DashboardLayout title="Overview" subtitle="Loading shop insights...">
        <div className="h-64 bg-neutral-200 border-3 border-[#121212] animate-pulse" />
      </DashboardLayout>
    );
  }

  const stats = dashboardData?.stats || {
    totalProducts: 0,
    availableProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalReservations: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    completedReservations: 0,
    totalViews: 0,
    productViews: 0,
  };

  const chartData = [
    { day: 'Mon', reservations: 4, views: 24 },
    { day: 'Tue', reservations: 3, views: 32 },
    { day: 'Wed', reservations: 7, views: 45 },
    { day: 'Thu', reservations: 5, views: 38 },
    { day: 'Fri', reservations: 9, views: 56 },
    { day: 'Sat', reservations: 14, views: 88 },
    { day: 'Sun', reservations: 12, views: 76 },
  ];

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.name}`}
      subtitle={`${dashboardData?.shop?.name || 'Your Traditional Boutique'} • Store Dashboard`}
      action={
        <Link to="/dashboard/products/new">
          <BrutalButton variant="primary" size="sm">
            + Add New Outfit
          </BrutalButton>
        </Link>
      }
    >
      {/* Top Numeric Stat Cards (Section 7) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Outfits"
          value={stats.totalProducts}
          subtext={`${stats.availableProducts} ready in showroom`}
          icon={<Package size={20} />}
          bg="bg-white"
        />

        <StatCard
          title="In-Store Holds"
          value={stats.totalReservations}
          subtext={`${stats.pendingReservations} need your confirmation`}
          icon={<BookmarkCheck size={20} />}
          bg="bg-[#FFE600]"
        />

        <StatCard
          title="Showroom Visits"
          value={stats.completedReservations}
          subtext="Inspected & bought offline"
          icon={<ShoppingBag size={20} />}
          bg="bg-[#00E599]"
        />

        <StatCard
          title="Storefront Views"
          value={stats.totalViews + stats.productViews}
          subtext="Discovered by local buyers"
          icon={<Eye size={20} />}
          bg="bg-[#38BDF8]"
        />
      </div>

      {/* Stock Alerts Warning Banner if any items low */}
      {stats.lowStockProducts > 0 && (
        <div className="p-4 bg-[#FF6EA7] border-3 border-[#121212] shadow-brutal flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white border-2 border-[#121212]">
              <AlertTriangle size={20} className="text-[#121212]" />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase text-[#121212]">
                {stats.lowStockProducts} Outfits Running Low on Physical Stock!
              </h4>
              <p className="text-xs text-neutral-900 font-mono">
                Update your in-store quantity so buyers don't visit for out-of-stock sizes.
              </p>
            </div>
          </div>
          <Link to="/dashboard/products">
            <BrutalButton variant="dark" size="sm">
              Manage Stock
            </BrutalButton>
          </Link>
        </div>
      )}

      {/* Analytics Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recharts Traffic & In-Store Interest */}
        <BrutalCard bg="bg-white" shadow="md" className="p-5 lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#121212]">
            <div>
              <h3 className="font-black text-base uppercase text-[#121212]">
                Customer Interest & In-Store Holds
              </h3>
              <p className="text-xs font-mono text-neutral-500">Weekly discovery performance</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono font-bold">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#FFE600] border border-[#121212]" /> Holds
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#121212] border border-[#121212]" /> Views
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5DFD3" />
                <XAxis dataKey="day" stroke="#121212" fontStyle="bold" />
                <YAxis stroke="#121212" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FAF7EE',
                    border: '2px solid #121212',
                    boxShadow: '4px 4px 0px #121212',
                    fontFamily: 'Space Mono',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="views" fill="#121212" />
                <Bar dataKey="reservations" fill="#FFE600" stroke="#121212" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </BrutalCard>

        {/* Recent In-Store Reservation Inquiries */}
        <BrutalCard bg="bg-white" shadow="md" className="p-5 lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#121212]">
            <h3 className="font-black text-base uppercase text-[#121212]">
              Recent In-Store Holds
            </h3>
            <Link to="/dashboard/reservations" className="text-xs font-mono font-bold underline">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {dashboardData?.recentReservations && dashboardData.recentReservations.length > 0 ? (
              dashboardData.recentReservations.map((res: any) => (
                <div key={res.id} className="p-3 bg-[#FAF7EE] border-2 border-[#121212] text-xs font-mono">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[#121212]">{res.customer?.name}</span>
                    <span className="bg-[#FFE600] px-1 border border-[#121212]">
                      ₹{res.product?.discountedPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-neutral-700 truncate mt-1">{res.product?.name}</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    Visit: {new Date(res.preferredVisitDate).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-500 font-mono py-4 text-center">
                No recent reservations recorded yet.
              </p>
            )}
          </div>
        </BrutalCard>
      </div>
    </DashboardLayout>
  );
};

export default ShopkeeperDashboardPage;
