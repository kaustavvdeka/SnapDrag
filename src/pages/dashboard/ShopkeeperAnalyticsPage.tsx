import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout.js';
import BrutalCard from '../../components/common/BrutalCard.js';
import StatCard from '../../components/common/StatCard.js';
import api from '../../api/client.js';
import { Package, Eye, BookmarkCheck, ShoppingBag, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const ShopkeeperAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/shops/dashboard-stats')
      .then((res: any) => setData(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const stats = data?.stats || {
    totalProducts: 0,
    availableProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalReservations: 0,
    completedReservations: 0,
    totalViews: 0,
    productViews: 0,
  };

  const inventoryDistribution = [
    { name: 'Available in Showroom', value: stats.availableProducts, color: '#00E599' },
    { name: 'Low Stock (<3)', value: stats.lowStockProducts, color: '#FFE600' },
    { name: 'Out of Stock', value: stats.outOfStockProducts, color: '#FF4D4D' },
  ];

  const weeklyTraffic = [
    { day: 'Mon', views: 24, reservations: 3 },
    { day: 'Tue', views: 35, reservations: 5 },
    { day: 'Wed', views: 42, reservations: 4 },
    { day: 'Thu', views: 38, reservations: 6 },
    { day: 'Fri', views: 55, reservations: 8 },
    { day: 'Sat', views: 90, reservations: 15 },
    { day: 'Sun', views: 78, reservations: 12 },
  ];

  return (
    <DashboardLayout
      title="Store Analytics & Footfall Metrics"
      subtitle="Track digital interest that translates into physical in-store visits and offline purchases."
    >
      <div className="space-y-6">
        {/* Core KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Outfits"
            value={stats.totalProducts}
            subtext="In digital catalog"
            icon={<Package size={18} />}
          />
          <StatCard
            title="Total Store Views"
            value={stats.totalViews + stats.productViews}
            subtext="Local customer impressions"
            icon={<Eye size={18} />}
            bg="bg-[#38BDF8]"
          />
          <StatCard
            title="In-Store Holds"
            value={stats.totalReservations}
            subtext="48h physical reserves"
            icon={<BookmarkCheck size={18} />}
            bg="bg-[#FFE600]"
          />
          <StatCard
            title="Offline Purchases"
            value={stats.completedReservations}
            subtext="Inspected & bought in shop"
            icon={<ShoppingBag size={18} />}
            bg="bg-[#00E599]"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Traffic bar chart */}
          <BrutalCard bg="bg-white" shadow="md" className="p-5 lg:col-span-8 space-y-4">
            <h3 className="font-black text-sm uppercase text-[#121212]">
              Weekly Customer Inquiries vs Footfall
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTraffic}>
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
                  <Bar dataKey="views" fill="#121212" name="Store Views" />
                  <Bar dataKey="reservations" fill="#FFE600" stroke="#121212" strokeWidth={2} name="Holds" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </BrutalCard>

          {/* Inventory Breakdown */}
          <BrutalCard bg="bg-white" shadow="md" className="p-5 lg:col-span-4 space-y-4">
            <h3 className="font-black text-sm uppercase text-[#121212]">
              Inventory Health
            </h3>
            <div className="space-y-3 font-mono text-xs pt-2">
              <div className="p-3 bg-[#FAF7EE] border-2 border-[#121212] flex items-center justify-between">
                <span>✓ Available In Stock:</span>
                <strong className="text-sm font-black text-green-700">{stats.availableProducts}</strong>
              </div>

              <div className="p-3 bg-[#FAF7EE] border-2 border-[#121212] flex items-center justify-between">
                <span>⚠ Low Stock (&le; 2):</span>
                <strong className="text-sm font-black text-amber-600">{stats.lowStockProducts}</strong>
              </div>

              <div className="p-3 bg-[#FAF7EE] border-2 border-[#121212] flex items-center justify-between">
                <span>✕ Out of Stock:</span>
                <strong className="text-sm font-black text-red-600">{stats.outOfStockProducts}</strong>
              </div>
            </div>
          </BrutalCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ShopkeeperAnalyticsPage;
