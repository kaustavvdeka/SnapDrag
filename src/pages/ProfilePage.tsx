import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrutalCard from '../components/common/BrutalCard.js';
import BrutalBadge from '../components/common/BrutalBadge.js';
import BrutalButton from '../components/common/BrutalButton.js';
import { useAuth } from '../context/AuthContext.js';
import api from '../api/client.js';
import { User, Mail, Phone, Calendar, BookmarkCheck, Heart, LogOut } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [reservationCount, setReservationCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=/profile');
      return;
    }
    if (isAuthenticated) {
      Promise.all([
        api.get('/reservations/my-reservations').catch(() => ({ data: [] })),
        api.get('/favorites').catch(() => ({ data: [] })),
      ]).then(([resRes, favRes]: any) => {
        setReservationCount(resRes.data?.length || 0);
        setFavoriteCount(favRes.data?.length || 0);
      });
    }
  }, [isAuthenticated, authLoading, navigate]);

  return (
    <div className="min-h-screen bg-[#FAF7EE] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b-4 border-[#121212] pb-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-black uppercase text-[#FF6EA7]">
              Customer Account
            </span>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#121212]">
              MY PROFILE
            </h1>
          </div>

          <BrutalButton variant="danger" size="sm" onClick={logout}>
            <LogOut size={14} className="mr-1" /> Sign Out
          </BrutalButton>
        </div>

        {/* Profile Card */}
        <BrutalCard bg="bg-white" shadow="lg" className="p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#FFE600] border-3 border-[#121212] shadow-brutal flex items-center justify-center font-black text-2xl text-[#121212]">
              {user?.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase text-[#121212]">{user?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <BrutalBadge variant="green" size="sm">{user?.role}</BrutalBadge>
                <span className="text-xs font-mono text-neutral-500">
                  Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t-2 border-[#121212] font-mono text-xs">
            <div className="p-3 bg-[#FAF7EE] border-2 border-[#121212] shadow-brutal-sm">
              <span className="block text-[10px] text-neutral-500 font-bold uppercase">Email Address</span>
              <p className="font-bold text-sm text-[#121212] mt-0.5">{user?.email}</p>
            </div>

            <div className="p-3 bg-[#FAF7EE] border-2 border-[#121212] shadow-brutal-sm">
              <span className="block text-[10px] text-neutral-500 font-bold uppercase">Phone Number</span>
              <p className="font-bold text-sm text-[#121212] mt-0.5">{user?.phone || 'Not linked'}</p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <Link to="/reservations" className="block group">
              <div className="p-4 bg-[#FFE600] border-3 border-[#121212] shadow-brutal hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-center">
                <BookmarkCheck size={28} className="mx-auto text-[#121212] mb-1" />
                <span className="text-2xl font-black text-[#121212] font-mono block">{reservationCount}</span>
                <span className="text-xs font-black uppercase tracking-wider text-neutral-800">In-Store Holds</span>
              </div>
            </Link>

            <Link to="/favorites" className="block group">
              <div className="p-4 bg-[#FF6EA7] border-3 border-[#121212] shadow-brutal hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-center">
                <Heart size={28} className="mx-auto text-[#121212] mb-1" />
                <span className="text-2xl font-black text-[#121212] font-mono block">{favoriteCount}</span>
                <span className="text-xs font-black uppercase tracking-wider text-neutral-800">Saved Favorites</span>
              </div>
            </Link>
          </div>
        </BrutalCard>
      </div>
    </div>
  );
};

export default ProfilePage;
