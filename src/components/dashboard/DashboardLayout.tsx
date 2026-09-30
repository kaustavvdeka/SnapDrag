import React from 'react';
import { Link, useLocation as useRouterLocation } from 'react-router-dom';
import BrutalCard from '../common/BrutalCard.js';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  BookmarkCheck,
  Building2,
  Store,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  action,
}) => {
  const routerLocation = useRouterLocation();
  const { user } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Products & Stock', path: '/dashboard/products', icon: <Package size={18} /> },
    { label: 'Add New Outfit', path: '/dashboard/products/new', icon: <PlusCircle size={18} /> },
    { label: 'Reservations', path: '/dashboard/reservations', icon: <BookmarkCheck size={18} /> },
    { label: 'Mall & Floor Settings', path: '/dashboard/location', icon: <Building2 size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7EE] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-4 border-[#121212]">
          <div>
            <span className="text-xs font-mono font-black uppercase text-[#00E599] bg-[#121212] px-2 py-0.5 inline-block">
              Shopkeeper Command Center
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
            {user?.shops && user.shops.length > 0 && (
              <Link
                to={`/shops/${user.shops[0].id}`}
                target="_blank"
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-black uppercase bg-white border-2 border-[#121212] px-3 py-2 shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5"
              >
                <Store size={14} /> View Live Storefront <ExternalLink size={12} />
              </Link>
            )}
          </div>
        </div>

        {/* Dashboard Grid: Sidebar + Main Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Sidebar */}
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

          {/* Main Area */}
          <main className="md:col-span-9 space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
