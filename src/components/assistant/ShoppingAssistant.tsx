import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from '../../context/LocationContext.js';
import {
  sendAssistantMessage,
  AssistantChatResponse,
  AssistantProductSummary,
  AssistantShopSummary,
} from '../../api/assistantApi.js';
import AssistantProductCard from './AssistantProductCard.js';
import MirrorTryOnModal from '../products/MirrorTryOnModal.js';
import ReservationModal from '../reservations/ReservationModal.js';
import { Product } from '../../types/index.js';
import {
  Bot,
  X,
  Send,
  RotateCcw,
  Sparkles,
  MapPin,
  Store,
  BookmarkCheck,
  ChevronDown,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  products?: AssistantProductSummary[];
  shops?: AssistantShopSummary[];
  timestamp: string;
}

const DEFAULT_QUICK_ACTIONS = [
  'Muga Mekhela Chador under ₹5000',
  'Find traditional boutiques near me',
  'Wedding Banarasi Sarees',
  'Available in City Center Mall',
  'How does 48h hold work?',
];

export const ShoppingAssistant: React.FC = () => {
  const { selectedCity, setSelectedCity, availableCities } = useLocation();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({ city: selectedCity });
  const [quickActions, setQuickActions] = useState<string[]>(DEFAULT_QUICK_ACTIONS);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState<boolean>(false);

  // Modals integration
  const [selectedMirrorProduct, setSelectedMirrorProduct] = useState<Product | null>(null);
  const [selectedReserveProduct, setSelectedReserveProduct] = useState<Product | null>(null);

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello! I am your **Vastrix AI Shopping Assistant**. Ask me about authentic Assamese Mekhela Chadors, Banarasi sarees, wedding lehengas, or physical boutique locations across ${selectedCity}!\n\nEvery item is available in-store with a **100% free 48-hour hold**.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll when messages change or loading state toggles
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Sync selectedCity change from context into activeFilters
  useEffect(() => {
    setActiveFilters((prev) => ({ ...prev, city: selectedCity }));
  }, [selectedCity]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build conversation history for context memory
      const conversationHistory = messages.slice(-6).map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text,
      }));

      const res: AssistantChatResponse = await sendAssistantMessage({
        message: query,
        conversationHistory,
        context: {
          userLocation: { city: selectedCity },
          activeFilters,
        },
      });

      if (res.success && res.data) {
        const assistantMsg: MessageItem = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: res.data.reply,
          products: res.data.products,
          shops: res.data.shops,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        if (res.data.activeFilters) {
          setActiveFilters(res.data.activeFilters);
        }
        if (res.data.suggestedQuickActions && res.data.suggestedQuickActions.length > 0) {
          setQuickActions(res.data.suggestedQuickActions);
        }
      }
    } catch (err: any) {
      console.error('Assistant error:', err);
      const errorMsg: MessageItem = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I had trouble reaching the boutique catalog right now. Please try again or explore our catalog directly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setActiveFilters({ city: selectedCity });
    setQuickActions(DEFAULT_QUICK_ACTIONS);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Conversation reset! What traditional outfit or boutique in ${selectedCity} are you looking for?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* ========================================================= */}
      {/* FLOATING TRIGGER BUTTON */}
      {/* ========================================================= */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open Vastrix AI Assistant"
        className="fixed bottom-6 right-6 z-40 bg-[#FFE600] hover:bg-[#fff066] text-[#121212] font-black text-sm uppercase px-4 py-3 border-3 border-[#121212] shadow-brutal hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-brutal-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 cursor-pointer group"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6EA7] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00E599] border border-[#121212]" />
        </span>
        <Bot size={20} className="text-[#121212] group-hover:rotate-12 transition-transform" />
        <span className="tracking-tight">Ask Vastrix</span>
        <span className="text-[10px] font-mono bg-[#121212] text-[#FFE600] px-1.5 py-0.5 border border-[#121212] font-bold">
          AI
        </span>
      </button>

      {/* ========================================================= */}
      {/* CHAT PANEL (DESKTOP FLOATING / MOBILE SHEET) */}
      {/* ========================================================= */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-22 sm:right-6 sm:w-[450px] sm:h-[620px] bg-[#FAF7EE] border-4 border-[#121212] shadow-brutal-xl z-50 flex flex-col overflow-hidden text-[#121212] font-sans">
          {/* Header */}
          <div className="bg-[#FFE600] border-b-3 border-[#121212] p-3 shrink-0 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#121212] text-[#FFE600] border-2 border-[#121212] flex items-center justify-center font-black">
                <Bot size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm uppercase tracking-tight text-[#121212]">
                    Vastrix Assistant
                  </h3>
                  <span className="text-[9px] font-mono font-black bg-[#00E599] text-[#121212] px-1 border border-[#121212]">
                    LIVE DATA
                  </span>
                </div>
                <p className="text-[10px] font-mono text-neutral-800 leading-tight">
                  Handloom & Physical Boutique Discovery
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* City selector dropdown trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCityDropdownOpen((p) => !p)}
                  className="bg-white hover:bg-neutral-100 text-[#121212] text-[10px] font-mono font-bold px-2 py-1 border border-[#121212] shadow-2xs flex items-center gap-1 cursor-pointer"
                  title="Switch city"
                >
                  <MapPin size={10} className="text-[#FF4D4D]" />
                  <span className="max-w-[70px] truncate">{selectedCity}</span>
                  <ChevronDown size={10} />
                </button>

                {isCityDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 w-36 bg-white border-2 border-[#121212] shadow-brutal-sm z-30 py-1">
                    <div className="text-[9px] font-mono uppercase font-black px-2 py-0.5 text-neutral-500">
                      Select City:
                    </div>
                    {availableCities.map((c) => (
                      <button
                        key={c.city}
                        type="button"
                        onClick={() => {
                          setSelectedCity(c.city);
                          setIsCityDropdownOpen(false);
                          handleSendMessage(`Show traditional outfits in ${c.city}`);
                        }}
                        className={`w-full text-left px-2 py-1 text-xs font-mono font-bold hover:bg-[#FFE600] flex items-center justify-between cursor-pointer ${
                          selectedCity === c.city ? 'bg-amber-100 font-black' : ''
                        }`}
                      >
                        <span>{c.city}</span>
                        <span className="text-[10px] text-neutral-500">{c.shopCount} shops</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reset conversation */}
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 hover:bg-white text-[#121212] border border-[#121212] cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw size={14} />
              </button>

              {/* Close panel */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-[#FF4D4D] hover:text-white text-[#121212] border border-[#121212] cursor-pointer transition-colors"
                title="Close assistant"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-[#FAF7EE]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Bubble */}
                <div
                  className={`max-w-[88%] p-3 border-2 border-[#121212] text-xs leading-relaxed shadow-brutal-xs ${
                    m.sender === 'user'
                      ? 'bg-[#FFE600] text-[#121212] font-semibold font-mono'
                      : 'bg-white text-[#121212]'
                  }`}
                >
                  <p className="whitespace-pre-line font-medium">{m.text}</p>
                </div>

                {/* Timestamp */}
                <span className="text-[9px] font-mono text-neutral-500 mt-1 px-1">
                  {m.timestamp}
                </span>

                {/* Product Result Cards List */}
                {m.products && m.products.length > 0 && (
                  <div className="w-full mt-3 space-y-2.5">
                    <div className="text-[10px] font-mono font-black uppercase text-neutral-600 flex items-center gap-1">
                      <ShoppingBag size={12} className="text-[#00E599]" />
                      <span>{m.products.length} In-Store Outfits Found:</span>
                    </div>

                    <div className="space-y-2">
                      {m.products.map((prod) => (
                        <AssistantProductCard
                          key={prod.id}
                          product={prod}
                          onTryMirror={(p) => setSelectedMirrorProduct(p)}
                          onReserve={(p) => setSelectedReserveProduct(p)}
                          onViewProduct={() => setIsOpen(false)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Shop Result Cards List */}
                {m.shops && m.shops.length > 0 && (
                  <div className="w-full mt-3 space-y-2">
                    <div className="text-[10px] font-mono font-black uppercase text-neutral-600 flex items-center gap-1">
                      <Store size={12} className="text-[#38BDF8]" />
                      <span>{m.shops.length} Boutiques Found:</span>
                    </div>

                    <div className="space-y-2">
                      {m.shops.map((s) => (
                        <div
                          key={s.id}
                          className="bg-white border-2 border-[#121212] shadow-brutal-xs p-2.5 space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <h5 className="font-black text-xs uppercase text-[#121212]">
                                {s.name}
                              </h5>
                              <p className="text-[10px] font-mono text-neutral-600">
                                {s.city}
                                {s.mallName ? ` • ${s.mallName}` : ''}
                                {s.floorName ? ` (${s.floorName})` : ''}
                              </p>
                            </div>
                            <span className="text-[10px] font-mono bg-[#FFE600] px-1 border border-[#121212] font-bold shrink-0">
                              ⭐ {s.rating}
                            </span>
                          </div>

                          {s.indoorDirections && (
                            <p className="text-[10px] font-mono bg-amber-50 p-1 border border-amber-200 text-neutral-700">
                              🚶 {s.indoorDirections}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1 border-t border-neutral-100">
                            <span>📞 {s.phone}</span>
                            <Link
                              to={`/shops/${s.id}`}
                              onClick={() => setIsOpen(false)}
                              className="font-black text-[#121212] hover:underline flex items-center gap-0.5"
                            >
                              <span>View Boutique</span>
                              <ExternalLink size={10} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 p-2 bg-white border border-[#121212] max-w-[260px] shadow-xs">
                <div className="w-3.5 h-3.5 border-2 border-[#121212] border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="text-[11px] font-mono font-bold text-neutral-700 animate-pulse">
                  Querying Vastrix boutiques...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="p-2 bg-neutral-100 border-t border-b border-[#121212] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickActions.map((action, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(action)}
                disabled={isLoading}
                className="whitespace-nowrap bg-white hover:bg-[#FFE600] text-[#121212] text-[10px] font-mono font-bold px-2 py-1 border border-[#121212] shadow-2xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white shrink-0 flex items-center gap-2 border-t-2 border-[#121212]"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask about Mekhela Chador, sarees, prices in ${selectedCity}...`}
              disabled={isLoading}
              className="flex-1 bg-[#FAF7EE] border-2 border-[#121212] px-3 py-2 text-xs font-mono font-medium placeholder:text-neutral-400 focus:outline-none focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-[#121212] disabled:bg-neutral-300 hover:bg-neutral-800 text-white font-black p-2.5 border-2 border-[#121212] shadow-brutal-xs cursor-pointer disabled:cursor-not-allowed transition-transform active:translate-x-0.5 active:translate-y-0.5"
              aria-label="Send query"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* INTEGRATED MIRROR VIRTUAL TRY-ON MODAL */}
      {/* ========================================================= */}
      {selectedMirrorProduct && (
        <MirrorTryOnModal
          product={selectedMirrorProduct}
          isOpen={!!selectedMirrorProduct}
          onClose={() => setSelectedMirrorProduct(null)}
          onReserveClick={() => {
            const prod = selectedMirrorProduct;
            setSelectedMirrorProduct(null);
            setSelectedReserveProduct(prod);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* INTEGRATED 48H RESERVATION MODAL */}
      {/* ========================================================= */}
      {selectedReserveProduct && (
        <ReservationModal
          product={selectedReserveProduct}
          isOpen={!!selectedReserveProduct}
          onClose={() => setSelectedReserveProduct(null)}
        />
      )}
    </>
  );
};

export default ShoppingAssistant;
