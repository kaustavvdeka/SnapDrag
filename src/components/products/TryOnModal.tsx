import React, { useState, useRef, useEffect } from 'react';
import BrutalModal from '../common/BrutalModal.js';
import BrutalButton from '../common/BrutalButton.js';
import BrutalBadge from '../common/BrutalBadge.js';
import BrutalCard from '../common/BrutalCard.js';
import { Product } from '../../types/index.js';
import api from '../../api/client.js';
import {
  Sparkles,
  Camera,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  BookmarkCheck,
  Store,
  MapPin,
  Download,
  Share2,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  Columns,
} from 'lucide-react';

interface TryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onReserveClick: () => void;
}

const DEMO_CUSTOMER_AVATARS = [
  {
    name: 'Ananya',
    label: 'Model 1',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80',
  },
  {
    name: 'Priyanka',
    label: 'Model 2',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80',
  },
  {
    name: 'Meera',
    label: 'Model 3',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80',
  },
];

export const TryOnModal: React.FC<TryOnModalProps> = ({
  isOpen,
  onClose,
  product,
  onReserveClick,
}) => {
  const [customerImage, setCustomerImage] = useState<string>(DEMO_CUSTOMER_AVATARS[0].url);
  const [fitPreference, setFitPreference] = useState<string>('Traditional Elegance');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [tryOnResult, setTryOnResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  // Interactive Mirror Controls
  const [mirrorViewMode, setMirrorViewMode] = useState<'mirror' | 'split' | 'dress'>('mirror');
  const [drapeOpacity, setDrapeOpacity] = useState<number>(90);
  const [drapeOffsetY, setDrapeOffsetY] = useState<number>(32);
  const [drapeScale, setDrapeScale] = useState<number>(100);
  const [activeMobileTab, setActiveMobileTab] = useState<'mirror' | 'stylist' | 'store'>('mirror');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mirrorCanvasRef = useRef<HTMLDivElement | null>(null);

  // Stop camera when modal closes or unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomerImage(reader.result as string);
        setCameraActive(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startWebcam = async () => {
    try {
      setCameraActive(true);
      setErrorMsg('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 800 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Webcam access error:', err);
      setErrorMsg('Could not access camera. Please upload a photo from your gallery instead.');
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 800;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCustomerImage(dataUrl);

        // Stop stream
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        setCameraActive(false);
      }
    }
  };

  const handleGenerateTryOn = async () => {
    setIsGenerating(true);
    setErrorMsg('');

    try {
      const res: any = await api.post('/ai/try-on', {
        productId: product.id,
        customerImageBase64: customerImage.startsWith('data:') ? customerImage : undefined,
        customerImageUrl: !customerImage.startsWith('data:') ? customerImage : undefined,
        fitPreference,
      });

      setTryOnResult(res.data);
      setMirrorViewMode('mirror');
    } catch (err: any) {
      console.error('Try-on error:', err);
      setErrorMsg(err.message || 'Failed to generate virtual try-on. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadMirrorPhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseImg = new Image();
    baseImg.crossOrigin = 'anonymous';
    baseImg.src = customerImage;

    baseImg.onload = () => {
      // Draw background customer portrait
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

      // Draw drape overlay
      const dressImg = new Image();
      dressImg.crossOrigin = 'anonymous';
      dressImg.src = primaryProductImage;

      dressImg.onload = () => {
        ctx.save();
        ctx.globalAlpha = drapeOpacity / 100;
        const targetY = (canvas.height * drapeOffsetY) / 100;
        const targetH = (canvas.height * (100 - drapeOffsetY) * drapeScale) / 10000;
        ctx.drawImage(dressImg, 0, targetY, canvas.width, targetH);
        ctx.restore();

        // Draw branded frame & watermark
        ctx.fillStyle = 'rgba(18, 18, 18, 0.85)';
        ctx.fillRect(0, canvas.height - 110, canvas.width, 110);

        ctx.fillStyle = '#FFE600';
        ctx.font = 'bold 32px monospace';
        ctx.fillText('SNAPDRAG • VIRTUAL MIRROR', 30, canvas.height - 60);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '22px monospace';
        ctx.fillText(`${product.name.slice(0, 45)}... • ${product.shop?.name || 'Local Boutique'}`, 30, canvas.height - 25);

        // Download link
        const a = document.createElement('a');
        a.download = `snapdrag-mirror-${product.slug}.jpg`;
        a.href = canvas.toDataURL('image/jpeg', 0.9);
        a.click();
      };
    };
  };

  const primaryProductImage =
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800';

  return (
    <BrutalModal
      isOpen={isOpen}
      onClose={onClose}
      title="🪞 SEE YOURSELF IN MIRROR"
      maxWidth="xl"
    >
      <div className="space-y-4 sm:space-y-5 text-[#121212]">
        {/* Banner with Status */}
        <div className="bg-[#FFE600] border-2 border-[#121212] p-2 sm:p-2.5 shadow-brutal-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles size={16} className="text-[#121212] shrink-0" />
            <span className="text-[10px] sm:text-xs font-mono font-black uppercase truncate text-[#121212]">
              Powered by Google Gemini Vision Drape Engine
            </span>
          </div>
          <BrutalBadge variant="dark" size="sm">
            AI MIRROR
          </BrutalBadge>
        </div>

        {errorMsg && (
          <div className="p-2.5 sm:p-3 bg-[#FF4D4D] text-white border-2 border-[#121212] shadow-brutal-sm text-xs font-bold flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span className="break-words">{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: UPLOAD / CAMERA SELECTION (Before Generation) */}
        {!tryOnResult ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
            {/* Left: Customer Photo Capture (6 cols) */}
            <div className="md:col-span-6 space-y-3 sm:space-y-4">
              <span className="text-xs font-mono font-black uppercase block text-[#121212]">
                1. Your Photo / Live Camera:
              </span>

              {/* Viewport: Live Camera or Photo */}
              <div className="aspect-[3/4] max-h-[340px] sm:max-h-[400px] w-full bg-neutral-900 border-3 border-[#121212] shadow-brutal relative overflow-hidden flex items-center justify-center mx-auto">
                {cameraActive ? (
                  <div className="w-full h-full relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 inset-x-0 flex justify-center px-4">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="bg-[#00E599] text-[#121212] font-black uppercase px-4 py-2 text-xs sm:text-sm border-2 border-[#121212] shadow-brutal flex items-center gap-2 cursor-pointer hover:bg-[#05f0a2] active:translate-y-0.5"
                      >
                        <Camera size={16} /> Snap Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <img
                    src={customerImage}
                    alt="Customer portrait"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Badge Overlay */}
                <div className="absolute top-2 left-2 bg-white/95 border border-[#121212] px-2 py-0.5 text-[10px] font-mono font-black uppercase">
                  {cameraActive ? '🔴 Camera Live' : 'Customer Silhouette'}
                </div>
              </div>

              {/* Upload Controls */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white text-[#121212] font-black text-xs uppercase py-2.5 px-2 border-2 border-[#121212] shadow-brutal-sm hover:bg-neutral-100 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload size={14} /> Upload Photo
                </button>
                <button
                  type="button"
                  onClick={startWebcam}
                  className="bg-[#38BDF8] text-[#121212] font-black text-xs uppercase py-2.5 px-2 border-2 border-[#121212] shadow-brutal-sm hover:bg-[#7dd3fc] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Camera size={14} /> {cameraActive ? 'Restart Camera' : 'Take Selfie'}
                </button>
              </div>

              {/* Preset Models for Quick Testing */}
              <div>
                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase block mb-1">
                  Or select demo customer portrait:
                </span>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {DEMO_CUSTOMER_AVATARS.map((avatar, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setCustomerImage(avatar.url);
                        setCameraActive(false);
                      }}
                      className={`p-1 border-2 border-[#121212] text-[10px] font-mono font-black uppercase truncate cursor-pointer transition-all ${
                        customerImage === avatar.url
                          ? 'bg-[#FFE600] shadow-brutal-sm'
                          : 'bg-white hover:bg-neutral-100'
                      }`}
                    >
                      {avatar.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Selected Outfit & Styling Preferences (6 cols) */}
            <div className="md:col-span-6 space-y-3 sm:space-y-4 flex flex-col justify-between">
              <div className="space-y-3 sm:space-y-4">
                <span className="text-xs font-mono font-black uppercase block text-[#121212]">
                  2. Selected Outfit to Try On:
                </span>

                <BrutalCard bg="bg-white" className="p-2.5 sm:p-3 flex gap-3 items-center">
                  <img
                    src={primaryProductImage}
                    alt={product.name}
                    className="w-16 h-20 sm:w-20 sm:h-24 object-cover border-2 border-[#121212] shrink-0"
                  />
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#FF6EA7] block truncate">
                      {product.category?.name || 'Traditional Weave'}
                    </span>
                    <h3 className="font-black text-xs sm:text-sm text-[#121212] line-clamp-2 uppercase">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#121212] flex-wrap">
                      <span className="text-[#00E599] bg-[#121212] px-1 py-0.2">
                        ₹{product.discountedPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-neutral-500">| {product.material}</span>
                    </div>
                  </div>
                </BrutalCard>

                {/* Style Preferences */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-black uppercase block text-[#121212]">
                    Drape & Silhouette Style:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs font-mono">
                    {[
                      'Traditional Elegance',
                      'Royal Bridal Grandeur',
                      'Contemporary Fusion',
                      'Celebration Festive',
                    ].map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setFitPreference(style)}
                        className={`p-2 border-2 border-[#121212] font-bold text-left cursor-pointer transition-all text-[11px] sm:text-xs ${
                          fitPreference === style
                            ? 'bg-[#FFE600] shadow-brutal-sm'
                            : 'bg-white hover:bg-neutral-100'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Explainer Box */}
                <div className="p-2.5 bg-[#FAF7EE] border-2 border-[#121212] text-xs font-mono space-y-1">
                  <span className="font-bold text-[#121212] block">How Mirror Try-On Works:</span>
                  <p className="text-neutral-600 text-[11px] leading-relaxed">
                    Gemini AI contours your silhouette, fits the {product.material} folds around your torso, and generates an authentic fitting-room reflection.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <BrutalButton
                  variant="accent"
                  size="lg"
                  fullWidth
                  isLoading={isGenerating}
                  onClick={handleGenerateTryOn}
                >
                  <Sparkles size={18} className="mr-2" />
                  {isGenerating ? 'Simulating Drape in Mirror...' : '✨ See Yourself in Mirror'}
                </BrutalButton>
              </div>
            </div>
          </div>
        ) : (
          /* STEP 2: ACTIVE VIRTUAL MIRROR DISPLAY (After Generation) */
          <div className="space-y-4">
            {/* Mobile Tab Switcher */}
            <div className="flex md:hidden border-2 border-[#121212] bg-white shadow-brutal-sm p-1 gap-1 text-xs font-mono font-black">
              <button
                type="button"
                onClick={() => setActiveMobileTab('mirror')}
                className={`flex-1 py-1.5 text-center ${
                  activeMobileTab === 'mirror' ? 'bg-[#FFE600] border border-[#121212]' : 'text-neutral-600'
                }`}
              >
                🪞 Mirror
              </button>
              <button
                type="button"
                onClick={() => setActiveMobileTab('stylist')}
                className={`flex-1 py-1.5 text-center ${
                  activeMobileTab === 'stylist' ? 'bg-[#00E599] border border-[#121212]' : 'text-neutral-600'
                }`}
              >
                ✨ Stylist
              </button>
              <button
                type="button"
                onClick={() => setActiveMobileTab('store')}
                className={`flex-1 py-1.5 text-center ${
                  activeMobileTab === 'store' ? 'bg-[#38BDF8] border border-[#121212]' : 'text-neutral-600'
                }`}
              >
                🏬 Store Hold
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">
              {/* Left Column: Interactive Virtual Mirror Viewport (7 cols) */}
              <div
                className={`md:col-span-7 space-y-3 ${
                  activeMobileTab === 'mirror' ? 'block' : 'hidden md:block'
                }`}
              >
                {/* Mirror Mode Switcher */}
                <div className="flex items-center justify-between gap-1 text-xs font-mono font-bold flex-wrap">
                  <div className="flex items-center gap-1 bg-white border-2 border-[#121212] p-0.5">
                    <button
                      type="button"
                      onClick={() => setMirrorViewMode('mirror')}
                      className={`px-2.5 py-1 text-[11px] font-black uppercase transition-all ${
                        mirrorViewMode === 'mirror'
                          ? 'bg-[#FFE600] text-[#121212] border border-[#121212]'
                          : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      🪞 Draped Mirror
                    </button>
                    <button
                      type="button"
                      onClick={() => setMirrorViewMode('split')}
                      className={`px-2.5 py-1 text-[11px] font-black uppercase transition-all ${
                        mirrorViewMode === 'split'
                          ? 'bg-[#FFE600] text-[#121212] border border-[#121212]'
                          : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      <Columns size={12} className="inline mr-1" /> Side-by-Side
                    </button>
                    <button
                      type="button"
                      onClick={() => setMirrorViewMode('dress')}
                      className={`px-2.5 py-1 text-[11px] font-black uppercase transition-all ${
                        mirrorViewMode === 'dress'
                          ? 'bg-[#FFE600] text-[#121212] border border-[#121212]'
                          : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      <Eye size={12} className="inline mr-1" /> Outfit Weave
                    </button>
                  </div>

                  <span className="text-[10px] bg-[#00E599] border border-[#121212] font-black px-1.5 py-0.5">
                    {tryOnResult.fitScore}% FIT MATCH
                  </span>
                </div>

                {/* THE VIRTUAL MIRROR CANVAS */}
                <div
                  ref={mirrorCanvasRef}
                  className="aspect-[3/4] max-h-[460px] sm:max-h-[520px] w-full bg-neutral-950 border-4 border-[#121212] shadow-brutal-xl relative overflow-hidden mx-auto select-none"
                >
                  {mirrorViewMode === 'mirror' && (
                    /* Draped Mirror Mode: Customer photo with outfit mapped */
                    <div className="w-full h-full relative overflow-hidden bg-neutral-900">
                      {/* Customer Base Photo */}
                      <img
                        src={customerImage}
                        alt="Customer mirror reflection"
                        className="w-full h-full object-cover"
                      />

                      {/* Overlaid Drape / Saree / Dress Layer with realistic fabric blend */}
                      <div
                        className="absolute inset-x-0 pointer-events-none transition-all duration-150"
                        style={{
                          top: `${drapeOffsetY}%`,
                          bottom: 0,
                          opacity: drapeOpacity / 100,
                          transform: `scale(${drapeScale / 100})`,
                          transformOrigin: 'top center',
                        }}
                      >
                        <img
                          src={primaryProductImage}
                          alt="Draped traditional outfit"
                          className="w-full h-full object-cover mix-blend-multiply filter contrast-125 saturate-110 drop-shadow-xl"
                        />
                        {/* Shimmer gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-amber-200/20 mix-blend-overlay" />
                      </div>

                      {/* Mirror Reflection Glass Sheen */}
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 via-transparent to-white/5" />

                      {/* Boutique Mirror Watermark & Branding */}
                      <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-xs border border-white/20 p-2 text-white font-mono flex items-center justify-between">
                        <div className="truncate">
                          <span className="text-[10px] text-[#FFE600] font-black uppercase block tracking-wider">
                            SnapDrag Virtual Mirror
                          </span>
                          <span className="text-xs font-bold truncate block">
                            {product.name}
                          </span>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-[10px] text-neutral-400 block">Available At:</span>
                          <span className="text-xs font-bold text-[#00E599]">{product.shop?.name}</span>
                        </div>
                      </div>

                      {/* Small Silhouette Pip */}
                      <div className="absolute top-3 right-3 w-16 h-20 border-2 border-white shadow-md overflow-hidden bg-neutral-900">
                        <img
                          src={customerImage}
                          alt="Original portrait"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-white text-center font-mono">
                          You
                        </div>
                      </div>
                    </div>
                  )}

                  {mirrorViewMode === 'split' && (
                    /* Side-by-Side Split View */
                    <div className="w-full h-full grid grid-cols-2 relative bg-neutral-950">
                      <div className="h-full relative border-r-2 border-[#FFE600] overflow-hidden">
                        <img
                          src={customerImage}
                          alt="Your portrait"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/80 text-white font-mono text-[9px] px-1.5 py-0.5">
                          Your Silhouette
                        </div>
                      </div>
                      <div className="h-full relative overflow-hidden">
                        <img
                          src={primaryProductImage}
                          alt="Traditional Outfit"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-black/80 text-[#FFE600] font-mono text-[9px] px-1.5 py-0.5 font-bold">
                          Store Garment
                        </div>
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#121212] text-[#FFE600] border-2 border-[#FFE600] rounded-full p-1.5 shadow-md">
                        <Columns size={16} />
                      </div>
                    </div>
                  )}

                  {mirrorViewMode === 'dress' && (
                    /* High-Detail Outfit Weave View */
                    <div className="w-full h-full relative overflow-hidden bg-neutral-900">
                      <img
                        src={primaryProductImage}
                        alt="Handcrafted Weave"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-3 left-3 bg-black/85 text-white p-2 font-mono text-xs border border-white/20">
                        <span className="font-bold text-[#FFE600] block">{product.material}</span>
                        <span className="text-[10px] text-neutral-300">Color: {product.color}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Interactive Fit & Position Sliders */}
                {mirrorViewMode === 'mirror' && (
                  <div className="p-2.5 bg-white border-2 border-[#121212] shadow-brutal-sm space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase">
                      <span className="flex items-center gap-1">
                        <SlidersHorizontal size={13} /> Adjust Drape on Silhouette:
                      </span>
                      <span className="text-neutral-500">Fine-tune alignment</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <div className="flex justify-between mb-0.5">
                          <span>Neckline Position:</span>
                          <span className="font-bold">{drapeOffsetY}%</span>
                        </div>
                        <input
                          type="range"
                          min="15"
                          max="55"
                          value={drapeOffsetY}
                          onChange={(e) => setDrapeOffsetY(Number(e.target.value))}
                          className="w-full accent-[#121212] cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-0.5">
                          <span>Fabric Blend:</span>
                          <span className="font-bold">{drapeOpacity}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="100"
                          value={drapeOpacity}
                          onChange={(e) => setDrapeOpacity(Number(e.target.value))}
                          className="w-full accent-[#121212] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons: Download & Retake */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadMirrorPhoto}
                    className="flex-1 bg-white hover:bg-neutral-100 text-[#121212] font-black text-xs uppercase py-2 px-3 border-2 border-[#121212] shadow-brutal-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} /> Save Mirror Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTryOnResult(null);
                      setCameraActive(false);
                    }}
                    className="flex-1 bg-[#FAF7EE] hover:bg-neutral-200 text-[#121212] font-black text-xs uppercase py-2 px-3 border-2 border-[#121212] shadow-brutal-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={14} /> Try Another Outfit
                  </button>
                </div>
              </div>

              {/* Right Column: Stylist Appraisal & Store Reservation (5 cols) */}
              <div
                className={`md:col-span-5 space-y-3 sm:space-y-4 ${
                  activeMobileTab !== 'mirror' ? 'block' : 'hidden md:block'
                }`}
              >
                {/* AI Stylist Appraisal Card */}
                {(activeMobileTab === 'stylist' || activeMobileTab === 'mirror') && (
                  <BrutalCard bg="bg-white" className="p-3 sm:p-4 space-y-3">
                    <div className="border-b-2 border-[#121212] pb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-black uppercase text-[#FF6EA7] block">
                          Gemini Master Stylist Appraisal
                        </span>
                        <BrutalBadge variant="green" size="sm">
                          {tryOnResult.fitScore}% Match
                        </BrutalBadge>
                      </div>
                      <h3 className="font-black text-sm sm:text-base text-[#121212] uppercase mt-1">
                        {tryOnResult.celebrationType}
                      </h3>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div>
                        <span className="font-bold text-[#121212] block">Silhouette Verdict:</span>
                        <p className="text-neutral-700 text-[11px] leading-relaxed mt-0.5">
                          {tryOnResult.stylingVerdict}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-neutral-200">
                        <span className="font-bold text-[#121212] block">Pallu / Pleating Guide:</span>
                        <p className="text-neutral-700 text-[11px] leading-relaxed mt-0.5">
                          {tryOnResult.drapeAdvice}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-neutral-200">
                        <span className="font-bold text-[#121212] block">Jewelry Styling:</span>
                        <p className="text-neutral-700 text-[11px] leading-relaxed mt-0.5">
                          {tryOnResult.suggestedJewelry}
                        </p>
                      </div>
                    </div>
                  </BrutalCard>
                )}

                {/* In-Store Hold & Shop Location Card */}
                {(activeMobileTab === 'store' || activeMobileTab === 'mirror') && (
                  <div className="space-y-3">
                    <BrutalCard bg="bg-[#FAF7EE]" className="p-3 sm:p-4 border-2 border-[#121212] space-y-2">
                      <span className="text-[10px] font-mono font-black uppercase text-neutral-500 block">
                        Physical Boutique Where You Can Try This On
                      </span>
                      <div className="flex items-start gap-2">
                        <Store size={18} className="text-[#121212] shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-black text-sm uppercase text-[#121212]">
                            {tryOnResult.shop.name}
                          </h4>
                          <p className="text-xs font-mono text-neutral-700 flex items-center gap-1 mt-0.5">
                            <MapPin size={12} className="text-[#FF4D4D] shrink-0" />
                            <span>
                              {tryOnResult.shop.city} — {tryOnResult.shop.floorAndShop}
                            </span>
                          </p>
                        </div>
                      </div>
                    </BrutalCard>

                    {/* Reserve CTA */}
                    <div className="space-y-1.5 pt-1">
                      <BrutalButton
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={() => {
                          onClose();
                          onReserveClick();
                        }}
                      >
                        <BookmarkCheck size={18} className="mr-2" />
                        Hold in Shop for Free (48h)
                      </BrutalButton>
                      <p className="text-[10px] font-mono text-neutral-600 text-center">
                        Zero online payment. Visit physical boutique to inspect and try on in real mirror!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </BrutalModal>
  );
};

export default TryOnModal;
