import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout.js';
import BrutalCard from '../../components/common/BrutalCard.js';
import BrutalInput from '../../components/common/BrutalInput.js';
import BrutalButton from '../../components/common/BrutalButton.js';
import { Category, Product } from '../../types/index.js';
import api from '../../api/client.js';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const ShopkeeperEditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
  const [isActive, setIsActive] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get(`/products/${id}`),
    ])
      .then(([catRes, prodRes]: any) => {
        setCategories(catRes.data || []);
        const p: Product = prodRes.data;
        setName(p.name);
        setSku(p.sku);
        setCategoryId(p.categoryId);
        setDescription(p.description);
        setPrice(p.price);
        setDiscountPercent(p.discountPercent);
        setMaterial(p.material);
        setColor(p.color);
        setSize(p.size);
        setTotalQuantity(p.totalQuantity);
        setIsActive(p.isActive);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await api.patch(`/products/${id}`, {
        name,
        categoryId,
        description,
        price: Number(price),
        discountPercent: Number(discountPercent),
        material,
        color,
        size,
        totalQuantity: Number(totalQuantity),
        isActive,
      });

      navigate('/dashboard/products');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update outfit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Edit Outfit">
        <div className="h-64 bg-neutral-200 border-3 border-[#121212] animate-pulse" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Edit Outfit Details"
      subtitle={`Updating catalog item: ${sku}`}
    >
      <BrutalCard bg="bg-white" shadow="md" className="p-6">
        {errorMsg && (
          <div className="p-3 bg-[#FF4D4D] text-white border-2 border-[#121212] shadow-brutal-sm text-xs font-bold mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BrutalInput
                label="Outfit Title / Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <BrutalInput
                label="SKU / Style Code"
                disabled
                value={sku}
                helperText="SKU cannot be altered after creation"
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
                  className="w-full px-3 py-2 bg-white border-2 md:border-3 border-[#121212] shadow-brutal-sm font-medium focus:outline-none text-xs"
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
                required
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BrutalInput
                label="Color"
                required
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />

              <BrutalInput
                label="Size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              />

              <BrutalInput
                label="Total Physical Stock in Store"
                type="number"
                min="0"
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 md:border-3 border-[#121212] shadow-brutal-sm font-medium focus:outline-none text-xs"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t-2 border-[#121212]">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#121212]">
              Pricing & Visibility
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <BrutalInput
                label="Retail Price (₹ INR)"
                type="number"
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

              <div className="p-3 bg-[#FAF7EE] border-2 border-[#121212] flex items-center justify-between">
                <span className="text-xs font-black uppercase">Active On Storefront</span>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 accent-[#00E599]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t-3 border-[#121212] flex gap-3">
            <BrutalButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
            >
              Save Changes
            </BrutalButton>
          </div>
        </form>
      </BrutalCard>
    </DashboardLayout>
  );
};

export default ShopkeeperEditProductPage;
