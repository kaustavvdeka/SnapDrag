import React, { useState } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useLocation } from '../../context/LocationContext.js';
import BrutalButton from './BrutalButton.js';
import BrutalBadge from './BrutalBadge.js';
import LocationSelector from './LocationSelector.js';
import {
  MapPin,
  Search,
  Heart,
  Bookmark,
  Store,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  Compass,
  LayoutDashboard,
  ShieldAlert,
} from 'lucide-react';

export const BrutalNavbar: React.FC = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { selectedCity } = useLocation();
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => routerLocation.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF7EE] border-b-3 md:border-b-4 border-[#121212] select-none">
        {/* Top Announcement Bar */}
        <div className="bg-[#121212] text-white py-1.5 px-4 text-xs font-mono font-bold flex items-center justify-between border-b-2 border-[#121212]">
          <div className="flex items-center gap-2 truncate">
            <span className="bg-[#FFE600] text-[#121212] px-1 py-0.2 text-[10px] uppercase font-black">
              IRL FIRST
            </span>
            <span className="truncate">
              Discover Online → Locate Mall Floor & Shop → Reserve For 48h → Inspect Physically Before Buying!
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 shrink-0">
            {role !== 'SHOPKEEPER' && (
              <Link to="/register?role=SHOPKEEPER" className="hover:text-[#FFE600] underline">
                Are you a Traditional Shop Owner? Register Store
              </Link>
            )}
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-[#FFE600] border-3 border-[#121212] shadow-brutal flex items-center justify-center font-black text-xl tracking-tighter group-hover:bg-[#FF6EA7] transition-colors">
                VX
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black tracking-tight leading-none text-[#121212]">
                  Vastrix
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-600 font-bold">
                  Traditional Clothing
                </span>
              </div>
            </Link>

            {/* Location Selector Pill */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-[#121212] shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-xs font-black uppercase ml-2 cursor-pointer"
            >
              <MapPin size={14} className="text-[#FF4D4D]" strokeWidth={3} />
              <span>{selectedCity}</span>
              <span className="text-neutral-400 font-mono text-[10px]">(Change)</span>
            </button>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/explore"
              className={`px-3 py-1.5 font-black text-xs uppercase tracking-wider border-2 transition-all ${
                isActive('/explore')
                  ? 'bg-[#FFE600] border-[#121212] shadow-brutal-sm'
                  : 'border-transparent hover:border-[#121212] hover:bg-white'
              }`}
            >
              Explore Outfits
            </Link>

            <Link
              to="/shops"
              className={`px-3 py-1.5 font-black text-xs uppercase tracking-wider border-2 transition-all ${
                isActive('/shops')
                  ? 'bg-[#FFE600] border-[#121212] shadow-brutal-sm'
                  : 'border-transparent hover:border-[#121212] hover:bg-white'
              }`}
            >
              Local Shops
            </Link>

            <Link
              to="/map"
              className={`px-3 py-1.5 font-black text-xs uppercase tracking-wider border-2 transition-all flex items-center gap-1 ${
                isActive('/map')
                  ? 'bg-[#00E599] border-[#121212] shadow-brutal-sm'
                  : 'border-transparent hover:border-[#121212] hover:bg-white'
              }`}
            >
              <Compass size={14} strokeWidth={2.5} />
              Shop Map
            </Link>

            {isAuthenticated && role === 'CUSTOMER' && (
              <>
                <Link
                  to="/favorites"
                  className={`p-2 border-2 transition-all ${
                    isActive('/favorites')
                      ? 'bg-[#FF6EA7] border-[#121212] shadow-brutal-sm'
                      : 'border-transparent hover:border-[#121212] hover:bg-white'
                  }`}
                  title="Saved Favorites"
                >
                  <Heart size={18} strokeWidth={2.5} />
                </Link>

                <Link
                  to="/reservations"
                  className={`px-3 py-1.5 font-black text-xs uppercase tracking-wider border-2 flex items-center gap-1.5 transition-all ${
                    isActive('/reservations')
                      ? 'bg-[#38BDF8] border-[#121212] shadow-brutal-sm'
                      : 'border-transparent hover:border-[#121212] hover:bg-white'
                  }`}
                >
                  <Bookmark size={14} strokeWidth={2.5} />
                  My Holds
                </Link>
              </>
            )}

            {role === 'SHOPKEEPER' && (
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 font-black text-xs uppercase tracking-wider border-2 flex items-center gap-1.5 transition-all ${
                  isActive('/dashboard')
                    ? 'bg-[#FFE600] border-[#121212] shadow-brutal-sm'
                    : 'bg-[#121212] text-white border-[#121212] shadow-brutal-sm'
                }`}
              >
                <LayoutDashboard size={14} strokeWidth={2.5} />
                Shop Dashboard
              </Link>
            )}

            {role === 'ADMIN' && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 font-black text-xs uppercase tracking-wider border-2 flex items-center gap-1.5 transition-all ${
                  isActive('/admin')
                    ? 'bg-[#FF4D4D] text-white border-[#121212] shadow-brutal-sm'
                    : 'bg-[#FF4D4D] text-white border-[#121212]'
                }`}
              >
                <ShieldAlert size={14} strokeWidth={2.5} />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* User Actions & Auth Buttons */}
          <div className="flex items-center gap-2">
            {/* Mobile Location button */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="lg:hidden p-2 bg-white border-2 border-[#121212] shadow-brutal-sm"
              aria-label="Change city"
            >
              <MapPin size={18} className="text-[#FF4D4D]" strokeWidth={2.5} />
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block font-mono text-xs font-bold text-neutral-800 bg-white px-2 py-1 border border-neutral-400">
                  {user?.name.split(' ')[0]} ({role})
                </span>
                <button
                  onClick={logout}
                  className="p-2 bg-white border-2 border-[#121212] shadow-brutal-sm hover:bg-[#FF4D4D] hover:text-white transition-all cursor-pointer"
                  title="Logout"
                >
                  <LogOut size={16} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <BrutalButton variant="outline" size="sm">
                    Sign In
                  </BrutalButton>
                </Link>
                <Link to="/register" className="hidden sm:inline-block">
                  <BrutalButton variant="primary" size="sm">
                    Join
                  </BrutalButton>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 bg-white border-2 border-[#121212] shadow-brutal-sm ml-1"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} strokeWidth={3} /> : <Menu size={20} strokeWidth={3} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#FAF7EE] border-t-3 border-[#121212] p-4 space-y-2 animate-in slide-in-from-top-2">
            <div className="p-2 bg-white border-2 border-[#121212] shadow-brutal-sm flex items-center justify-between mb-3">
              <span className="text-xs font-bold flex items-center gap-1">
                <MapPin size={14} className="text-[#FF4D4D]" /> City: {selectedCity}
              </span>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLocationModalOpen(true);
                }}
                className="text-xs font-black underline"
              >
                Change
              </button>
            </div>

            <Link
              to="/explore"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block p-2.5 font-black text-sm uppercase border-2 border-[#121212] bg-white shadow-brutal-sm"
            >
              Explore Outfits
            </Link>
            <Link
              to="/shops"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block p-2.5 font-black text-sm uppercase border-2 border-[#121212] bg-white shadow-brutal-sm"
            >
              Traditional Shops
            </Link>
            <Link
              to="/map"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block p-2.5 font-black text-sm uppercase border-2 border-[#121212] bg-[#00E599] shadow-brutal-sm"
            >
              Shop Map Discovery
            </Link>

            {isAuthenticated && role === 'CUSTOMER' && (
              <>
                <Link
                  to="/favorites"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block p-2.5 font-black text-sm uppercase border-2 border-[#121212] bg-[#FF6EA7] shadow-brutal-sm"
                >
                  Saved Favorites
                </Link>
                <Link
                  to="/reservations"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block p-2.5 font-black text-sm uppercase border-2 border-[#121212] bg-[#38BDF8] shadow-brutal-sm"
                >
                  My In-Store Holds
                </Link>
              </>
            )}

            {role === 'SHOPKEEPER' && (
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-2.5 font-black text-sm uppercase border-2 border-[#121212] bg-[#FFE600] shadow-brutal-sm"
              >
                Shop Dashboard
              </Link>
            )}

            {role === 'ADMIN' && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-2.5 font-black text-sm uppercase border-2 border-[#121212] bg-[#FF4D4D] text-white shadow-brutal-sm"
              >
                Admin Governance
              </Link>
            )}

            {!isAuthenticated && (
              <div className="pt-2 grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <BrutalButton variant="outline" size="sm" fullWidth>
                    Sign In
                  </BrutalButton>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <BrutalButton variant="primary" size="sm" fullWidth>
                    Join
                  </BrutalButton>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Global Location Selector Modal */}
      <LocationSelector
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </>
  );
};

export default BrutalNavbar;
