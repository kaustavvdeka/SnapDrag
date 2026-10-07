import React, { useState, useRef, useEffect } from 'react';
import BrutalModal from '../common/BrutalModal.js';
import BrutalButton from '../common/BrutalButton.js';
import BrutalBadge from '../common/BrutalBadge.js';
import BrutalCard from '../common/BrutalCard.js';
import { Product } from '../../types/index.js';
import { tryOnProduct } from '../../api/mirrorApi.js';
import {
  Sparkles,
  Camera,
  Upload,
  RefreshCw,
  AlertTriangle,
  BookmarkCheck,
  Store,
  Shirt,
  ShoppingBag,
  Loader2,
  CheckCircle,
  X,
  Eye,
} from 'lucide-react';

export interface MirrorTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onReserveClick?: () => void;
}

export type ModalState = 'IDLE' | 'PROCESSING' | 'RESULT' | 'ERROR';

export const MirrorTryOnModal: React.FC<MirrorTryOnModalProps> = ({
  isOpen,
  onClose,
  product,
  onReserveClick,
}) => {
  const [modalState, setModalState] = useState<ModalState>('IDLE');
  const [selectedImageFile, setSelectedImageFile] = useState<File | Blob | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop video stream when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage('Invalid image format. Only JPEG, PNG, and WebP are allowed.');
        return;
      }
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('Image size exceeds 10MB limit.');
        return;
      }

      setErrorMessage('');
      setSelectedImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      stopCamera();
    }
  };

  const startCamera = async () => {
    try {
      setErrorMessage('');
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 800 } },
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
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 800;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            setSelectedImageFile(blob);
            setImagePreviewUrl(canvas.toDataURL('image/jpeg'));
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleTryOnSubmit = async () => {
    if (!selectedImageFile) {
      setErrorMessage('Please upload a clear photo of yourself first.');
      return;
    }

    setModalState('PROCESSING');
    setErrorMessage('');

    try {
      const response = await tryOnProduct({
        productId: product.id,
        userImage: selectedImageFile,
      });

      if (response.success && response.result?.imageUrl) {
        setGeneratedImageUrl(response.result.imageUrl);
        setModalState('RESULT');
      } else {
        throw new Error(response.message || 'Failed to generate try-on result.');
      }
    } catch (err: any) {
      console.error('Mirror try-on submit error:', err);
      setErrorMessage(err.message || 'Mirror is currently busy. Please try again.');
      setModalState('ERROR');
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

  return (
    <BrutalModal isOpen={isOpen} onClose={onClose} title="✨ MIRROR — AI VIRTUAL TRY-ON" maxWidth="lg">
      <div className="space-y-5 text-[#121212]">
        {/* Modal Subheader */}
        <div className="bg-[#FFE600] border-2 border-[#121212] p-3 shadow-brutal-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="fill-[#121212] text-[#121212] shrink-0" />
            <div>
              <span className="font-black text-sm uppercase block text-[#121212] leading-tight">
                Mirror
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-[#121212]/80">
                AI Virtual Try-On Engine
              </span>
            </div>
          </div>
          <BrutalBadge variant="dark" size="sm">
            FASHN VTON 1.5
          </BrutalBadge>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3 bg-[#FF4D4D] text-white border-2 border-[#121212] shadow-brutal-sm text-xs font-mono font-bold flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span className="break-words flex-1">{errorMessage}</span>
          </div>
        )}

        {/* IDLE / UPLOAD / ERROR STATE */}
        {(modalState === 'IDLE' || modalState === 'ERROR') && (
          <div className="space-y-5">
            {/* Step 1: Upload Photo / Camera Capture */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-black uppercase block text-[#121212]">
                1. Upload Your Photo:
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
                        <Camera size={16} /> Snap Photo
                      </button>
                    </div>
                  </div>
                ) : imagePreviewUrl ? (
                  <div className="w-full h-full relative">
                    <img
                      src={imagePreviewUrl}
                      alt="User uploaded photo"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImageFile(null);
                        setImagePreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 bg-[#FF4D4D] text-white p-1 border border-[#121212] shadow-sm cursor-pointer"
                      title="Remove photo"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-6 text-neutral-400 space-y-2">
                    <Upload size={36} className="mx-auto text-neutral-500" />
                    <p className="text-xs font-mono font-bold">No photo selected</p>
                    <p className="text-[10px] font-mono text-neutral-500">
                      Upload a full-length or upper-body photo for best result
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
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
                  <Camera size={15} /> {cameraActive ? 'Restart Camera' : 'Use Camera'}
                </button>
              </div>
            </div>

            {/* Step 2: Selected Outfit Banner (User does NOT upload dress) */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-black uppercase block text-[#121212]">
                2. Selected Outfit (Automatically Sent):
              </label>

              <BrutalCard bg="bg-white" className="p-3 flex items-center gap-3">
                <img
                  src={primaryProductImage}
                  alt={product.name}
                  className="w-16 h-20 object-cover border-2 border-[#121212] shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#FF6EA7] block truncate">
                    {product.category?.name || 'Garment Outfit'}
                  </span>
                  <h4 className="font-black text-sm text-[#121212] uppercase truncate">
                    {product.name}
                  </h4>
                  <div className="text-xs font-mono font-bold text-[#121212]">
                    ₹{product.discountedPrice.toLocaleString('en-IN')}{' '}
                    <span className="text-neutral-500 font-normal">| {product.material}</span>
                  </div>
                </div>
              </BrutalCard>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <BrutalButton
                variant="accent"
                size="lg"
                fullWidth
                disabled={!selectedImageFile}
                onClick={handleTryOnSubmit}
              >
                <Sparkles size={20} className="mr-2 fill-[#121212]" />
                ✨ Try with Mirror
              </BrutalButton>
            </div>
          </div>
        )}

        {/* PROCESSING STATE */}
        {modalState === 'PROCESSING' && (
          <div className="py-12 px-4 text-center space-y-5 bg-white border-3 border-[#121212] shadow-brutal">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#FFE600] border-t-[#121212] animate-spin" />
              <Sparkles size={24} className="text-[#121212] fill-[#121212] animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tight text-[#121212]">
                Generating your look...
              </h3>
              <p className="text-xs font-mono text-neutral-600 max-w-sm mx-auto leading-relaxed">
                Please wait while Mirror creates your virtual try-on.
              </p>
            </div>

            <div className="p-3 bg-[#FAF7EE] border-2 border-[#121212] text-[11px] font-mono font-bold text-[#121212] max-w-xs mx-auto">
              ✨ FASHN VTON 1.5 contouring garment fit around portrait silhouette...
            </div>
          </div>
        )}

        {/* RESULT STATE */}
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

            {/* Generated Result Image Viewport */}
            <div className="aspect-[3/4] max-h-[420px] w-full bg-white border-4 border-[#121212] shadow-brutal-xl relative overflow-hidden mx-auto flex items-center justify-center">
              <img
                src={generatedImageUrl}
                alt="Mirror Virtual Try-On Result"
                className="w-full h-full object-contain bg-white"
              />

              {/* Watermark Tag */}
              <div className="absolute bottom-3 left-3 right-3 bg-[#121212]/90 backdrop-blur-xs text-white p-2 border border-white/20 font-mono text-xs flex items-center justify-between">
                <span className="font-bold text-[#FFE600] truncate">
                  {product.name}
                </span>
                <span className="text-[10px] text-[#00E599] font-black shrink-0 ml-2">
                  MIRROR RESULT
                </span>
              </div>
            </div>

            {/* Result Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <button
                type="button"
                onClick={handleTryAgain}
                className="bg-white hover:bg-neutral-100 text-[#121212] font-black text-xs uppercase py-3 px-2 border-2 border-[#121212] shadow-brutal-sm flex items-center justify-center gap-1 cursor-pointer"
              >
                <RefreshCw size={14} /> Try Again
              </button>

              <button
                type="button"
                onClick={handleTryAnotherDress}
                className="bg-[#FAF7EE] hover:bg-neutral-200 text-[#121212] font-black text-xs uppercase py-3 px-2 border-2 border-[#121212] shadow-brutal-sm flex items-center justify-center gap-1 cursor-pointer"
              >
                <Shirt size={14} /> Try Another Dress
              </button>

              <button
                type="button"
                onClick={onClose}
                className="bg-[#38BDF8] hover:bg-[#7dd3fc] text-[#121212] font-black text-xs uppercase py-3 px-2 border-2 border-[#121212] shadow-brutal-sm flex items-center justify-center gap-1 cursor-pointer"
              >
                <Eye size={14} /> View Product
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onReserveClick) onReserveClick();
                }}
                className="bg-[#FFE600] hover:bg-[#fff066] text-[#121212] font-black text-xs uppercase py-3 px-2 border-2 border-[#121212] shadow-brutal-sm flex items-center justify-center gap-1 cursor-pointer"
              >
                <ShoppingBag size={14} /> Add to Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </BrutalModal>
  );
};

export default MirrorTryOnModal;
