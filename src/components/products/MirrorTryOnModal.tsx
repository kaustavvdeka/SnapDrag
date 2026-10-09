import React, { useState, useRef, useEffect } from 'react';
import BrutalModal from '../common/BrutalModal.js';
import BrutalButton from '../common/BrutalButton.js';
import BrutalBadge from '../common/BrutalBadge.js';
import BrutalCard from '../common/BrutalCard.js';
import { Product } from '../../types/index.js';
import { tryOnProduct } from '../../api/mirrorApi.js';
import { preprocessUserImage } from '../../utils/imagePreprocessing.js';
import {
  Sparkles,
  Camera,
  Upload,
  RefreshCw,
  AlertTriangle,
  Shirt,
  ShoppingBag,
  CheckCircle,
  X,
  Eye,
  BookmarkCheck,
  ShieldCheck,
  Info,
} from 'lucide-react';

export interface MirrorTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onReserveClick?: () => void;
  onViewProductClick?: () => void;
}

export type ModalState =
  | 'IDLE'
  | 'UPLOAD'
  | 'VALIDATING'
  | 'PREPARING'
  | 'GENERATING'
  | 'RESULT'
  | 'ERROR';

export const MirrorTryOnModal: React.FC<MirrorTryOnModalProps> = ({
  isOpen,
  onClose,
  product,
  onReserveClick,
  onViewProductClick,
}) => {
  const [modalState, setModalState] = useState<ModalState>('IDLE');
  const [selectedImageFile, setSelectedImageFile] = useState<File | Blob | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loadingStep, setLoadingStep] = useState<string>('Validating portrait resolution...');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isRequestInProgressRef = useRef<boolean>(false);

  // Stop video stream and clean up URLs when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      isRequestInProgressRef.current = false;
    }
  }, [isOpen]);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const processAndSetImage = async (rawFile: File | Blob) => {
    setErrorMessage('');
    setModalState('VALIDATING');
    try {
      const result = await preprocessUserImage(rawFile);
      setSelectedImageFile(result.file);
      setImagePreviewUrl(result.previewUrl);
      setModalState('IDLE');
      stopCamera();
    } catch (err: any) {
      console.warn('Image preprocessing warning:', err);
      setErrorMessage(
        err.message || 'Please upload a clear, full-body or upper-body photo with good lighting.'
      );
      setModalState('ERROR');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processAndSetImage(file);
    }
    // reset input so the same file can be re-selected if desired
    if (e.target) e.target.value = '';
  };

  const startCamera = async () => {
    try {
      setErrorMessage('');
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera error:', err);
      setErrorMessage('Could not access camera. Please upload a photo from your device.');
      setCameraActive(false);
    }
  };

  const captureCameraPhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 720;
      canvas.height = videoRef.current.videoHeight || 960;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob(async (blob) => {
          if (blob) {
            await processAndSetImage(blob);
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  const handleTryOnSubmit = async () => {
    // Prevent duplicate concurrent requests
    if (isRequestInProgressRef.current) {
      return;
    }

    if (!selectedImageFile) {
      setErrorMessage('Please upload a clear photo of yourself first.');
      return;
    }

    if (!product || !product.id) {
      setErrorMessage('This product currently cannot be used with Mirror.');
      return;
    }

    isRequestInProgressRef.current = true;
    setErrorMessage('');

    // Step 1: Preparing
    setModalState('PREPARING');
    setLoadingStep('Preparing garment drape contours...');

    const timer1 = setTimeout(() => {
      setModalState('GENERATING');
      setLoadingStep('Synthesizing with FASHN VTON 1.5...');
    }, 1200);

    try {
      const response = await tryOnProduct({
        productId: product.id,
        userImage: selectedImageFile,
      });

      clearTimeout(timer1);

      if (response.success && response.result?.imageUrl) {
        setGeneratedImageUrl(response.result.imageUrl);
        setModalState('RESULT');
      } else {
        throw new Error(response.message || 'Failed to generate virtual try-on result.');
      }
    } catch (err: any) {
      clearTimeout(timer1);
      console.error('Mirror try-on submit error:', err);
      const message =
        err?.response?.data?.message ||
        err.message ||
        'Mirror is temporarily unavailable. Please try again.';
      setErrorMessage(message);
      setModalState('ERROR');
    } finally {
      isRequestInProgressRef.current = false;
    }
  };

  const handleTryAgain = () => {
    setModalState('IDLE');
    setErrorMessage('');
    setGeneratedImageUrl(null);
  };

  const handleTryAnotherDress = () => {
    setModalState('IDLE');
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setGeneratedImageUrl(null);
    setErrorMessage('');
    stopCamera();
    onClose();
  };

  const primaryProductImage =
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800';

  const isGenerating =
    modalState === 'VALIDATING' ||
    modalState === 'PREPARING' ||
    modalState === 'GENERATING';

  return (
    <BrutalModal
      isOpen={isOpen}
      onClose={() => {
        if (!isGenerating) {
          onClose();
        }
      }}
      title="🪞 MIRROR — AI VIRTUAL TRY-ON"
      maxWidth="lg"
    >
      <div className="space-y-5 text-[#121212]">
        {/* Header Ribbon */}
        <div className="bg-[#FFE600] border-2 border-[#121212] p-3 shadow-brutal-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="fill-[#121212] text-[#121212] shrink-0" />
            <div>
              <span className="font-black text-sm uppercase block text-[#121212] leading-tight">
                Mirror Virtual Fitting Room
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-[#121212]/80">
                Official FASHN VTON 1.5 Engine
              </span>
            </div>
          </div>
          <BrutalBadge variant="dark" size="sm">
            48H HOLD READY
          </BrutalBadge>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3 bg-[#FF4D4D] text-white border-2 border-[#121212] shadow-brutal-sm text-xs font-mono font-bold flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span className="break-words flex-1">{errorMessage}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* IDLE / UPLOAD / VALIDATING / ERROR STATE */}
        {/* ========================================================= */}
        {(modalState === 'IDLE' || modalState === 'UPLOAD' || modalState === 'ERROR') && (
          <div className="space-y-5">
            {/* Guidance banner */}
            <div className="bg-[#FAF7EE] border-2 border-[#121212] p-2.5 text-xs font-mono flex items-start gap-2 shadow-brutal-xs">
              <Info size={16} className="text-[#38BDF8] shrink-0 mt-0.5" />
              <span>
                <strong>Stylist Tip:</strong> Upload a clear, full-body or upper-body photo with good lighting. The garment is automatically selected from this Vastrix product.
              </span>
            </div>

            {/* Step 1: Upload Photo / Camera Capture */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-black uppercase block text-[#121212]">
                1. Upload or Capture Your Photo:
              </label>

              <div className="aspect-[3/4] max-h-[320px] w-full bg-neutral-900 border-3 border-[#121212] shadow-brutal relative overflow-hidden flex items-center justify-center mx-auto">
                {cameraActive ? (
                  <div className="w-full h-full relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 inset-x-0 flex justify-center">
                      <button
                        type="button"
                        onClick={captureCameraPhoto}
                        className="bg-[#00E599] text-[#121212] font-black uppercase px-4 py-2 text-xs border-2 border-[#121212] shadow-brutal flex items-center gap-1.5 cursor-pointer hover:bg-[#05f0a2]"
                      >
                        <Camera size={16} /> Snap Portrait
                      </button>
                    </div>
                  </div>
                ) : imagePreviewUrl ? (
                  <div className="w-full h-full relative">
                    <img
                      src={imagePreviewUrl}
                      alt="User portrait for Mirror Try-On"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImageFile(null);
                        setImagePreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 bg-[#FF4D4D] text-white p-1 border border-[#121212] shadow-sm cursor-pointer hover:bg-red-600"
                      title="Remove photo"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-6 text-neutral-400 space-y-2">
                    <Upload size={36} className="mx-auto text-neutral-500" />
                    <p className="text-xs font-mono font-bold">No photo selected</p>
                    <p className="text-[10px] font-mono text-neutral-400 max-w-xs mx-auto">
                      JPEG, PNG, or WebP. Optimal: full-length or upper-body portrait with good lighting.
                    </p>
                  </div>
                )}
              </div>

              {/* Upload & Camera Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white text-[#121212] font-black text-xs uppercase py-2.5 px-3 border-2 border-[#121212] shadow-brutal-sm hover:bg-neutral-100 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload size={15} /> Upload Photo
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className="bg-[#38BDF8] text-[#121212] font-black text-xs uppercase py-2.5 px-3 border-2 border-[#121212] shadow-brutal-sm hover:bg-[#7dd3fc] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Camera size={15} /> {cameraActive ? 'Restart Camera' : 'Take Selfie'}
                </button>
              </div>
            </div>

            {/* Step 2: Selected Outfit Banner (Automatically Used from Vastrix Product) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-black uppercase block text-[#121212]">
                  2. Selected Outfit (Automatic Garment Source):
                </label>
                <span className="text-[10px] font-mono bg-[#00E599] text-[#121212] px-1.5 py-0.5 border border-[#121212] font-bold">
                  ✓ Ready for Draping
                </span>
              </div>

              <BrutalCard bg="bg-white" className="p-3 flex items-center gap-3">
                <img
                  src={primaryProductImage}
                  alt={product.name}
                  className="w-16 h-20 object-cover border-2 border-[#121212] shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#FF6EA7] block truncate">
                    {product.category?.name || 'Traditional Apparel'}
                  </span>
                  <h4 className="font-black text-sm text-[#121212] uppercase truncate">
                    {product.name}
                  </h4>
                  <div className="text-xs font-mono font-bold text-[#121212]">
                    ₹{product.discountedPrice.toLocaleString('en-IN')}{' '}
                    <span className="text-neutral-500 font-normal">| {product.material}</span>
                  </div>
                  <div className="text-[10px] font-mono text-neutral-600 truncate">
                    📍 {product.shop?.name || 'Local Boutique'} ({product.shop?.location?.city || 'Local Store'})
                  </div>
                </div>
              </BrutalCard>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <BrutalButton
                variant="accent"
                size="lg"
                fullWidth
                disabled={!selectedImageFile || isGenerating}
                onClick={handleTryOnSubmit}
              >
                <Sparkles size={20} className="mr-2 fill-[#121212]" />
                ✨ Try with Mirror
              </BrutalButton>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PREPARING / GENERATING / VALIDATING STATE */}
        {/* ========================================================= */}
        {isGenerating && (
          <div className="py-12 px-6 text-center space-y-6 bg-white border-3 border-[#121212] shadow-brutal">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#FFE600] border-t-[#121212] animate-spin" />
              <Sparkles size={28} className="text-[#121212] fill-[#121212] animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tight text-[#121212]">
                Mirror is creating your look...
              </h3>
              <p className="text-xs font-mono text-neutral-600 max-w-sm mx-auto leading-relaxed">
                This may take a little while. FASHN VTON 1.5 is fitting the fabric onto your silhouette.
              </p>
            </div>

            {/* Stage Progress Indicators */}
            <div className="p-3 bg-[#FAF7EE] border-2 border-[#121212] text-xs font-mono font-bold text-[#121212] max-w-md mx-auto space-y-2 shadow-brutal-xs">
              <div className="flex items-center justify-between text-[11px] text-neutral-600">
                <span>Status:</span>
                <span className="text-[#FF6EA7] font-black uppercase">{loadingStep}</span>
              </div>
              <div className="w-full bg-neutral-200 h-2 border border-[#121212] overflow-hidden">
                <div
                  className={`h-full bg-[#FFE600] transition-all duration-700 ${
                    modalState === 'VALIDATING'
                      ? 'w-1/4'
                      : modalState === 'PREPARING'
                      ? 'w-2/4'
                      : 'w-5/6 animate-pulse'
                  }`}
                />
              </div>
              <div className="text-[10px] text-neutral-500 text-left pt-1">
                ⚙️ Draping {product.name} ({product.material}) with sub-pixel alignment...
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* RESULT STATE */}
        {/* ========================================================= */}
        {modalState === 'RESULT' && generatedImageUrl && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black uppercase text-[#121212] flex items-center gap-2">
                <CheckCircle size={20} className="text-[#00E599]" />
                Mirror Result
              </h3>
              <BrutalBadge variant="yellow" size="sm">
                AI Try-On Ready
              </BrutalBadge>
            </div>

            {/* Generated Try-On Result Viewport */}
            <div className="aspect-[3/4] max-h-[440px] w-full bg-white border-4 border-[#121212] shadow-brutal-xl relative overflow-hidden mx-auto flex items-center justify-center">
              <img
                src={generatedImageUrl}
                alt={`Mirror Virtual Try-On Result for ${product.name}`}
                className="w-full h-full object-contain bg-neutral-50"
              />

              {/* Connected Product Watermark */}
              <div className="absolute bottom-3 left-3 right-3 bg-[#121212]/95 backdrop-blur-xs text-white p-2.5 border border-white/20 font-mono text-xs flex items-center justify-between shadow-lg">
                <div className="min-w-0 pr-2">
                  <span className="font-bold text-[#FFE600] truncate block">
                    {product.name}
                  </span>
                  <span className="text-[10px] text-neutral-300 truncate block">
                    {product.shop?.name || 'Vastrix Partner Boutique'} • ₹{product.discountedPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-[10px] text-[#00E599] font-black shrink-0 bg-[#121212] px-2 py-1 border border-[#00E599]">
                  🪞 MIRROR
                </span>
              </div>
            </div>

            {/* Four Required Result Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {/* 1. Try Again */}
              <button
                type="button"
                onClick={handleTryAgain}
                className="bg-white hover:bg-neutral-100 text-[#121212] font-black text-xs uppercase py-3 px-2 border-2 border-[#121212] shadow-brutal-sm flex items-center justify-center gap-1 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
              >
                <RefreshCw size={14} /> Try Again
              </button>

              {/* 2. Try Another Dress */}
              <button
                type="button"
                onClick={handleTryAnotherDress}
                className="bg-[#FAF7EE] hover:bg-neutral-200 text-[#121212] font-black text-xs uppercase py-3 px-2 border-2 border-[#121212] shadow-brutal-sm flex items-center justify-center gap-1 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
              >
                <Shirt size={14} /> Try Another Dress
              </button>

              {/* 3. View Product */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onViewProductClick) onViewProductClick();
                }}
                className="bg-[#38BDF8] hover:bg-[#7dd3fc] text-[#121212] font-black text-xs uppercase py-3 px-2 border-2 border-[#121212] shadow-brutal-sm flex items-center justify-center gap-1 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
              >
                <Eye size={14} /> View Product
              </button>

              {/* 4. Reserve for 48h (Reuses SAME product ID and existing reservation system) */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onReserveClick) onReserveClick();
                }}
                className="bg-[#FFE600] hover:bg-[#fff066] text-[#121212] font-black text-xs uppercase py-3 px-2 border-2 border-[#121212] shadow-brutal-sm flex items-center justify-center gap-1 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
              >
                <BookmarkCheck size={14} /> 🎟️ Reserve for 48h
              </button>
            </div>

            <p className="text-center text-[11px] font-mono text-neutral-500">
              🔒 Free 48h in-store hold. No advance payment required. Inspect and purchase physically.
            </p>
          </div>
        )}
      </div>
    </BrutalModal>
  );
};

export default MirrorTryOnModal;
