import React from 'react';
import { Link, useLocation as useRouterLocation } from 'react-router-dom';
import BrutalCard from '../common/BrutalCard.js';
import { ShieldAlert, Users, Store, Package, Layers, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  subtitle,
  action,
}) => {
  const routerLocation = useRouterLocation();
  const { user } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/admin', icon: <BarChart3 size={18} /> },
    { label: 'Users', path: '/admin/users', icon: <Users size={18} /> },
    { label: 'Shops & Approvals', path: '/admin/shops', icon: <Store size={18} /> },
    { label: 'Products Catalog', path: '/admin/products', icon: <Package size={18} /> },
    { label: 'Categories', path: '/admin/categories', icon: <Layers size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7EE] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-4 border-[#121212]">
          <div>
            <span className="text-xs font-mono font-black uppercase text-white bg-[#FF4D4D] px-2 py-0.5 inline-block">
              Platform Administration
            </span>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#121212] mt-1">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs font-mono text-neutral-600 mt-0.5">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {action}
            <span className="text-xs font-mono font-bold bg-white px-3 py-1.5 border-2 border-[#121212] shadow-brutal-sm">
              Admin: {user?.email}
            </span>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <aside className="md:col-span-3">
            <BrutalCard bg="bg-white" shadow="md" className="p-3 space-y-1">
              {navItems.map((item) => {
                const isActive = routerLocation.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2.5 p-2.5 text-xs font-black uppercase tracking-wider border-2 transition-all ${
                      isActive
                        ? 'bg-[#FFE600] border-[#121212] shadow-brutal-sm translate-x-0.5'
                        : 'border-transparent hover:border-[#121212] hover:bg-[#FAF7EE]'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </BrutalCard>
          </aside>

          <main className="md:col-span-9 space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
