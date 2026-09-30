import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.js';
import BrutalCard from '../../components/common/BrutalCard.js';
import BrutalInput from '../../components/common/BrutalInput.js';
import BrutalButton from '../../components/common/BrutalButton.js';
import { Category } from '../../types/index.js';
import api from '../../api/client.js';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const fetchCategories = () => {
    setIsLoading(true);
    api.get('/categories')
      .then((res: any) => setCategories(res.data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await api.post('/admin/categories', { name, description, imageUrl });
      setName('');
      setDescription('');
      setImageUrl('');
      fetchCategories();
    } catch (e: any) {
      alert(e.message || 'Failed to create category');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AdminLayout title="Traditional Categories" subtitle="Manage ethnic clothing taxonomies (Sarees, Mekhela Chador, Lehengas, Handloom).">
      <div className="space-y-6">
        {/* Create Category Form */}
        <BrutalCard bg="bg-white" shadow="md" className="p-5">
          <h3 className="font-black text-sm uppercase text-[#121212] mb-3">
            Add New Traditional Category
          </h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <BrutalInput
              label="Category Name"
              placeholder="e.g. Bandhani & Patola"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <BrutalInput
              label="Cover Image URL"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <BrutalButton type="submit" variant="primary" size="md" isLoading={isCreating}>
              Create Category
            </BrutalButton>
          </form>
        </BrutalCard>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <BrutalCard key={c.id} bg="bg-white" shadow="sm" className="overflow-hidden flex flex-col">
              <div className="h-28 bg-neutral-200 border-b-2 border-[#121212] overflow-hidden">
                <img
                  src={c.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300'}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-black text-sm uppercase text-[#121212]">{c.name}</h4>
                  <p className="text-[11px] font-mono text-neutral-500 mt-0.5 line-clamp-2">
                    {c.description}
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-neutral-700 mt-2 block border-t pt-1 border-neutral-200">
                  {c._count?.products || 0} active outfits
                </span>
              </div>
            </BrutalCard>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCategoriesPage;
