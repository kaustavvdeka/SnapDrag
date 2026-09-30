import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout.js';
import BrutalCard from '../../components/common/BrutalCard.js';
import BrutalInput from '../../components/common/BrutalInput.js';
import BrutalButton from '../../components/common/BrutalButton.js';
import { Category } from '../../types/index.js';
import api from '../../api/client.js';
import { Upload, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export const ShopkeeperAddProductPage: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('Free Size');
  const [totalQuantity, setTotalQuantity] = useState<number>(5);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api.get('/categories')
      .then((res: any) => {
        const cats = res.data || [];
        setCategories(cats);
        if (cats.length > 0) setCategoryId(cats[0].id);
      })
      .catch(console.error);
  }, []);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setErrorMsg('Please select a category');
      return;
    }
    if (images.length === 0) {
      setErrorMsg('At least one outfit image URL is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await api.post('/products', {
        name,
        sku: sku.trim() || undefined,
        categoryId,
        description,
        price: Number(price),
        discountPercent: Number(discountPercent),
        material,
        color,
        size,
        totalQuantity: Number(totalQuantity),
        tags,
        images,
      });

      navigate('/dashboard/products');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create outfit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Add New Traditional Outfit"
      subtitle="Publish an item to your digital storefront for local customers to discover and hold."
    >
      <BrutalCard bg="bg-white" shadow="md" className="p-6">
        {errorMsg && (
          <div className="p-3 bg-[#FF4D4D] text-white border-2 border-[#121212] shadow-brutal-sm text-xs font-bold mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#121212] pb-2 border-b-2 border-[#121212]">
              1. General Outfit Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BrutalInput
                label="Outfit Title / Name"
                placeholder="e.g. Pure Muga Silk Mekhela Chador with Antique Kingkhap"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <BrutalInput
                label="Shop SKU / Style Code (Optional)"
                placeholder="e.g. MUG-2026-04"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                helperText="Auto-generated if left blank"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border-2 md:border-3 border-[#121212] shadow-brutal-sm font-medium focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <BrutalInput
                label="Fabric / Material"
                placeholder="e.g. Pure Mulberry Paat Silk, Katan Silk, Eri Peace Silk"
                required
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BrutalInput
                label="Color Shade"
                placeholder="e.g. Crimson Red & Gold"
                required
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />

              <BrutalInput
                label="Size / Fit"
                placeholder="e.g. Free Size, Unstitched"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              />

              <BrutalInput
                label="Physical Stock Quantity in Shop"
                type="number"
                min="1"
                required
                value={totalQuantity}
                onChange={(e) => setTotalQuantity(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Weave & Artisan Description
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe the weaving technique, motif significance, border zari work, and occasions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 md:border-3 border-[#121212] shadow-brutal-sm font-medium focus:outline-none text-xs"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4 pt-4 border-t-2 border-[#121212]">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#121212] pb-2 border-b-2 border-[#121212]">
              2. In-Store Price & Discount
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <BrutalInput
                label="Retail Price (₹ INR)"
                type="number"
                min="100"
                placeholder="e.g. 14500"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
              />

              <BrutalInput
                label="Discount (%)"
                type="number"
                min="0"
                max="90"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
              />

              <div className="p-3 bg-[#FAF7EE] border-2 border-[#121212] flex flex-col justify-center">
                <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold">
                  Final Customer Price
                </span>
                <span className="text-xl font-black text-[#121212]">
                  ₹
                  {price
                    ? Math.round(Number(price) * (1 - discountPercent / 100)).toLocaleString('en-IN')
                    : '0'}
                </span>
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-4 pt-4 border-t-2 border-[#121212]">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#121212] pb-2 border-b-2 border-[#121212]">
              3. Outfit Photography (Image URLs)
            </h3>

            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Paste image URL (https://...)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border-2 border-[#121212] shadow-brutal-sm text-xs font-mono"
              />
              <BrutalButton type="button" variant="outline" size="sm" onClick={handleAddImage}>
                <Plus size={16} /> Add Photo
              </BrutalButton>
            </div>

            {/* Thumbnails preview */}
            <div className="flex flex-wrap gap-3 pt-2">
              {images.map((url, idx) => (
                <div key={idx} className="relative w-24 h-28 border-2 border-[#121212] shadow-brutal-sm group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-[#FF4D4D] text-white border border-[#121212] opacity-90 hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-[#FFE600] text-[#121212] text-[9px] font-black uppercase px-1 border border-[#121212]">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3 pt-4 border-t-2 border-[#121212]">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#121212]">
              4. Search Tags
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. bihu, wedding, sangeet, bridal, handloom"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-white border-2 border-[#121212] text-xs font-mono"
              />
              <BrutalButton type="button" variant="outline" size="sm" onClick={handleAddTag}>
                Add Tag
              </BrutalButton>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="bg-[#FFE600] px-2 py-0.5 border border-[#121212] text-xs font-mono font-bold flex items-center gap-1"
                >
                  #{t}
                  <button type="button" onClick={() => handleRemoveTag(t)} className="cursor-pointer">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 border-t-3 border-[#121212] flex gap-3">
            <BrutalButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
            >
              Publish Outfit to Storefront
            </BrutalButton>
          </div>
        </form>
      </BrutalCard>
    </DashboardLayout>
  );
};

export default ShopkeeperAddProductPage;
