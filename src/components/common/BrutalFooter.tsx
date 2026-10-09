import React from 'react';
import { Link } from 'react-router-dom';
import BrutalButton from './BrutalButton.js';
import { Store, Compass, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export const BrutalFooter: React.FC = () => {
  return (
    <footer className="bg-[#121212] text-white border-t-4 border-[#121212] mt-20">
      {/* Banner CTA for shopkeepers */}
      <div className="bg-[#FFE600] text-[#121212] py-8 px-4 border-b-4 border-[#121212]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <span className="text-xs font-mono font-black uppercase tracking-wider bg-white px-2 py-0.5 border border-[#121212]">
              For Physical Traditional Boutiques & Looms
            </span>
            <h3 className="text-2xl md:text-3xl font-black uppercase mt-2 tracking-tight">
              Bring Footfall To Your Physical Shop.
            </h3>
            <p className="text-sm font-medium text-neutral-800 mt-1 max-w-xl">
              Don't compromise your showroom experience. Let local customers find your exact inventory, reserve items, and walk into your store to buy offline.
            </p>
          </div>
          <Link to="/register?role=SHOPKEEPER">
            <BrutalButton variant="dark" size="lg">
              List Your Shop (Free)
            </BrutalButton>
          </Link>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FFE600] text-[#121212] border-2 border-white flex items-center justify-center font-black text-lg">
                VX
              </div>
              <span className="text-2xl font-black tracking-tight">Vastrix</span>
            </div>
            <p className="text-xs text-neutral-400 font-mono leading-relaxed">
              The digital discovery layer for physical traditional clothing stores. Sarees, Mekhela Chadors, Lehengas, and Handlooms.
            </p>
            <div className="p-3 bg-neutral-900 border border-neutral-700 text-xs text-neutral-300 font-mono">
              <p className="font-bold text-[#FFE600] uppercase mb-1">Core Mantra:</p>
              Discover Online → Locate Shop → Reserve → Visit Shop → Inspect IRL → Buy Local
            </div>
          </div>

          {/* Quick Discover */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-[#FFE600] mb-4">
              Explore Collections
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link to="/explore?category=mekhela-chador" className="hover:text-[#FFE600] transition-colors">
                  Assam Mekhela Chador
                </Link>
              </li>
              <li>
                <Link to="/explore?category=sarees" className="hover:text-[#FFE600] transition-colors">
                  Banarasi & Kanjivaram Sarees
                </Link>
              </li>
              <li>
                <Link to="/explore?category=lehenga-ghagra" className="hover:text-[#FFE600] transition-colors">
                  Bridal & Festive Lehengas
                </Link>
              </li>
              <li>
                <Link to="/explore?category=salwar-suits" className="hover:text-[#FFE600] transition-colors">
                  Anarkalis & Chikankari Suits
                </Link>
              </li>
              <li>
                <Link to="/explore?category=handloom-wear" className="hover:text-[#FFE600] transition-colors">
                  Artisan Handlooms & Khadi
                </Link>
              </li>
            </ul>
          </div>

          {/* Discover Shops */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-[#FFE600] mb-4">
              Locations & Malls
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link to="/shops?city=Guwahati" className="hover:text-[#FFE600] transition-colors">
                  Guwahati (City Center Mall)
                </Link>
              </li>
              <li>
                <Link to="/shops?city=Silchar" className="hover:text-[#FFE600] transition-colors">
                  Silchar (Goldighi Mall)
                </Link>
              </li>
              <li>
                <Link to="/shops?city=Kolkata" className="hover:text-[#FFE600] transition-colors">
                  Kolkata (South City Mall)
                </Link>
              </li>
              <li>
                <Link to="/shops?city=Delhi" className="hover:text-[#FFE600] transition-colors">
                  Delhi (Omaxe Chowk Mall)
                </Link>
              </li>
              <li>
                <Link to="/shops?city=Jaipur" className="hover:text-[#FFE600] transition-colors">
                  Jaipur (Johari Bazaar)
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-[#FFE600] transition-colors font-bold text-[#00E599]">
                  📍 View Interactive Shop Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Business & Philosophy */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-[#FFE600] mb-4">
              Why Shop In-Person?
            </h4>
            <div className="space-y-2 text-xs text-neutral-400 font-mono">
              <p>✓ Feel real silk density & zari craftsmanship</p>
              <p>✓ Check exact drape & true natural lighting color</p>
              <p>✓ Direct support to generational weavers & local merchants</p>
              <p>✓ Zero packaging waste and zero courier delays</p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] text-neutral-500 font-mono">
              Admin Contact: admin@vastrix.local
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 font-mono gap-4">
          <p>© {new Date().getFullYear()} Vastrix. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with Neo-Brutalism for India's Traditional Textile Heritage
          </p>
        </div>
      </div>
    </footer>
  );
};

export default BrutalFooter;
