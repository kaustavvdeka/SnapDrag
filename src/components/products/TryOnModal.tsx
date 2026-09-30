import React, { useState, useRef } from 'react';
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
  Eye,
  Store,
  MapPin,
  Sliders,
} from 'lucide-react';

interface TryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onReserveClick: () => void;
}

const DEMO_CUSTOMER_AVATARS = [
  {
    name: 'Ananya (Festive)',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80',
  },
  {
    name: 'Priyanka (Bridal)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80',
  },
  {
    name: 'Meera (Traditional)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80',
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

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Webcam access error:', err);
      setErrorMsg('Could not access camera. Please upload a photo instead.');
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
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
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate virtual try-on with Gemini AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  const primaryProductImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600';

  return (
    <BrutalModal
      isOpen={isOpen}
      onClose={onClose}
      title="✨ TRY YOURSELF — AI VIRTUAL MIRROR"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Subheader banner */}
        <div className="bg-[#FFE600] border-2 border-[#121212] p-3 shadow-brutal-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#121212]" />
            <span className="text-xs font-mono font-black uppercase text-[#121212]">
              Powered by Google Gemini (Nano Banana) Vision Drape Engine
            </span>
          </div>
          <BrutalBadge variant="dark" size="sm">
            AI Draping Preview
          </BrutalBadge>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#FF4D4D] text-white border-2 border-[#121212] shadow-brutal-sm text-xs font-bold flex items-center gap-2">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!tryOnResult ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Customer Photo Upload & Selection (6 cols) */}
            <div className="md:col-span-6 space-y-4">
              <span className="text-xs font-mono font-black uppercase block text-[#121212]">
                1. Your Photo / Silhouette:
              </span>

              {/* Photo Display / Camera Canvas */}
              <div className="aspect-[3/4] bg-neutral-100 border-3 border-[#121212] shadow-brutal relative overflow-hidden flex items-center justify-center">
                {cameraActive ? (
                  <div className="w-full h-full relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#00E599] text-[#121212] font-black uppercase px-4 py-2 border-2 border-[#121212] shadow-brutal flex items-center gap-2 cursor-pointer"
                    >
                      <Camera size={18} /> Snap Photo
                    </button>
                  </div>
                ) : (
                  <img
                    src={customerImage}
                    alt="Customer preview"
                    className="w-full h-full object-cover"
                  />
                )}

                <div className="absolute top-2 left-2 bg-white/90 border border-[#121212] px-2 py-0.5 text-[10px] font-mono font-bold">
                  Customer Silhouette
                </div>
              </div>

              {/* Upload Controls */}
              <div className="flex gap-2">
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
                  className="flex-1 bg-white text-[#121212] font-black text-xs uppercase py-2.5 px-3 border-2 border-[#121212] shadow-brutal-sm hover:bg-neutral-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload size={14} /> Upload Photo
                </button>
                <button
                  type="button"
                  onClick={startWebcam}
                  className="flex-1 bg-[#38BDF8] text-[#121212] font-black text-xs uppercase py-2.5 px-3 border-2 border-[#121212] shadow-brutal-sm hover:bg-[#7dd3fc] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Camera size={14} /> Use Camera
                </button>
              </div>

              {/* Quick Preset Avatars */}
              <div>
                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase block mb-1">
                  Or select test model:
                </span>
                <div className="flex gap-2">
                  {DEMO_CUSTOMER_AVATARS.map((avatar, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setCustomerImage(avatar.url);
                        setCameraActive(false);
                      }}
                      className={`flex-1 p-1 border-2 border-[#121212] text-[10px] font-mono font-bold truncate cursor-pointer ${
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
            <div className="md:col-span-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-mono font-black uppercase block text-[#121212]">
                  2. Selected Traditional Outfit:
                </span>

                <BrutalCard bg="bg-white" className="p-3 flex gap-3 items-center">
                  <img
                    src={primaryProductImage}
                    alt={product.name}
                    className="w-20 h-24 object-cover border-2 border-[#121212] shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#FF6EA7]">
                      {product.category?.name || 'Traditional Weave'}
                    </span>
                    <h3 className="font-black text-xs sm:text-sm text-[#121212] line-clamp-2 uppercase">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#121212]">
                      <span>₹{product.price.toLocaleString('en-IN')}</span>
                      <span className="text-neutral-500">| {product.material}</span>
                    </div>
                  </div>
                </BrutalCard>

                {/* Style Preference */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold uppercase block text-[#121212]">
                    Drape & Style Preference:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {['Traditional Elegance', 'Royal Bridal Grandeur', 'Contemporary Fusion', 'Celebration Festive'].map(
                      (style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setFitPreference(style)}
                          className={`p-2 border-2 border-[#121212] font-bold text-left cursor-pointer transition-all ${
                            fitPreference === style
                              ? 'bg-[#FFE600] shadow-brutal-sm'
                              : 'bg-white hover:bg-neutral-100'
                          }`}
                        >
                          {style}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="p-3 bg-[#FAF7EE] border-2 border-[#121212] text-xs font-mono space-y-1">
                  <span className="font-bold block text-[#121212]">How AI Try-On Works:</span>
                  <p className="text-neutral-600 text-[11px] leading-relaxed">
                    Gemini AI contours your silhouette, drapes the {product.material} weave with authentic pleat physics, and simulates how the pallu falls against your neckline.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <BrutalButton
                variant="accent"
                size="lg"
                fullWidth
                isLoading={isGenerating}
                onClick={handleGenerateTryOn}
                className="mt-4"
              >
                <Sparkles size={18} className="mr-2" />
                {isGenerating ? 'Gemini AI Draping Outfit...' : 'Generate AI Try-On Now'}
              </BrutalButton>
            </div>
          </div>
        ) : (
          /* RESULT VIEW: Displayed after Gemini generates the try-on */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left: High-Impact Visual Try-On Display (7 cols) */}
              <div className="md:col-span-7 space-y-3">
                <div className="aspect-[3/4] bg-neutral-900 border-3 border-[#121212] shadow-brutal relative overflow-hidden">
                  <img
                    src={tryOnResult.tryOnImageUrl}
                    alt="AI Virtual Try-On Result"
                    className="w-full h-full object-cover"
                  />

                  {/* Customer Silhouette Pip in corner */}
                  <div className="absolute bottom-3 left-3 w-20 h-28 border-2 border-white shadow-md overflow-hidden bg-neutral-800">
                    <img
                      src={customerImage}
                      alt="Your uploaded portrait"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] text-white text-center font-mono py-0.5">
                      Your Photo
                    </div>
                  </div>

                  {/* Match Score Badge */}
                  <div className="absolute top-3 right-3 bg-[#00E599] border-2 border-[#121212] shadow-brutal-sm px-3 py-1 font-black text-sm text-[#121212] flex items-center gap-1.5">
                    <CheckCircle size={16} />
                    <span>{tryOnResult.fitScore}% FIT MATCH</span>
                  </div>

                  {/* Watermark badge */}
                  <div className="absolute top-3 left-3 bg-[#FFE600] border-2 border-[#121212] shadow-brutal-sm px-2 py-0.5 text-[10px] font-mono font-black uppercase text-[#121212]">
                    Gemini Nano Banana AI Drape
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTryOnResult(null)}
                  className="text-xs font-mono font-bold uppercase underline text-[#121212] hover:text-[#FF6EA7] flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Try with different photo or style
                </button>
              </div>

              {/* Right: Gemini Stylist Evaluation & Boutique Action (5 cols) */}
              <div className="md:col-span-5 space-y-4">
                <BrutalCard bg="bg-white" className="p-4 space-y-3">
                  <div className="border-b-2 border-[#121212] pb-2">
                    <span className="text-[10px] font-mono font-black uppercase text-[#FF6EA7] block">
                      AI Master Stylist Appraisal
                    </span>
                    <h3 className="font-black text-base text-[#121212] uppercase">
                      {tryOnResult.celebrationType}
                    </h3>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      <span className="font-bold text-[#121212] block">Styling Verdict:</span>
                      <p className="text-neutral-700 text-[11px] leading-relaxed mt-0.5">
                        {tryOnResult.stylingVerdict}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-neutral-200">
                      <span className="font-bold text-[#121212] block">Drape & Pallu Recommendation:</span>
                      <p className="text-neutral-700 text-[11px] leading-relaxed mt-0.5">
                        {tryOnResult.drapeAdvice}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-neutral-200">
                      <span className="font-bold text-[#121212] block">Jewelry Pairing:</span>
                      <p className="text-neutral-700 text-[11px] leading-relaxed mt-0.5">
                        {tryOnResult.suggestedJewelry}
                      </p>
                    </div>
                  </div>
                </BrutalCard>

                {/* Physical Boutique Availability Callout */}
                <BrutalCard bg="bg-[#FAF7EE]" className="p-4 border-2 border-[#121212] space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 block">
                    Available For Physical In-Store Inspection
                  </span>
                  <div className="flex items-start gap-2">
                    <Store size={18} className="text-[#121212] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-sm uppercase text-[#121212]">
                        {tryOnResult.shop.name}
                      </h4>
                      <p className="text-xs font-mono text-neutral-600 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} /> {tryOnResult.shop.city} — {tryOnResult.shop.floorAndShop}
                      </p>
                    </div>
                  </div>
                </BrutalCard>

                {/* Final Decision Action: Free 48-Hour In-Store Hold */}
                <div className="space-y-2 pt-2">
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
                    Reserve in Shop to Try On (Free 48h)
                  </BrutalButton>
                  <p className="text-[10px] font-mono text-neutral-500 text-center">
                    Zero online payment. Visit physical shop to inspect drape in person.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BrutalModal>
  );
};

export default TryOnModal;
