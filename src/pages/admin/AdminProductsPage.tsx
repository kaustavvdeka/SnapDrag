import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.js';
import BrutalCard from '../../components/common/BrutalCard.js';
import BrutalBadge from '../../components/common/BrutalBadge.js';
import api from '../../api/client.js';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = () => {
    setIsLoading(true);
    api.get('/admin/products')
      .then((res: any) => setProducts(res.data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/products/${id}/status`, { isActive: !currentStatus });
      fetchProducts();
    } catch (e: any) {
      alert(e.message || 'Action failed');
    }
  };

  return (
    <AdminLayout title="Product Moderation" subtitle="Inspect clothing catalog across all shops and manage storefront visibility.">
      <BrutalCard bg="bg-white" shadow="md" className="p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#121212] text-white">
                <th className="p-2.5 border-2 border-[#121212]">OUTFIT</th>
                <th className="p-2.5 border-2 border-[#121212]">SHOP</th>
                <th className="p-2.5 border-2 border-[#121212]">CATEGORY</th>
                <th className="p-2.5 border-2 border-[#121212]">PRICE</th>
                <th className="p-2.5 border-2 border-[#121212]">STOCK</th>
                <th className="p-2.5 border-2 border-[#121212] text-center">STATUS</th>
                <th className="p-2.5 border-2 border-[#121212] text-center">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-neutral-300 hover:bg-[#FAF7EE]">
                  <td className="p-2.5 font-bold flex items-center gap-2">
                    <img
                      src={p.images[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100'}
                      alt=""
                      className="w-8 h-10 object-cover border border-[#121212]"
                    />
                    <span className="truncate max-w-xs">{p.name}</span>
                  </td>
                  <td className="p-2.5">{p.shop?.name}</td>
                  <td className="p-2.5">{p.category?.name}</td>
                  <td className="p-2.5 font-bold">₹{p.discountedPrice.toLocaleString('en-IN')}</td>
                  <td className="p-2.5">{p.availableQuantity} / {p.totalQuantity}</td>
                  <td className="p-2.5 text-center">
                    {p.isActive ? (
                      <BrutalBadge variant="green" size="sm">Active</BrutalBadge>
                    ) : (
                      <BrutalBadge variant="red" size="sm">Disabled</BrutalBadge>
                    )}
                  </td>
                  <td className="p-2.5 text-center">
                    <button
                      onClick={() => handleToggleStatus(p.id, p.isActive)}
                      className="underline font-bold cursor-pointer"
                    >
                      {p.isActive ? 'Hide' : 'Unhide'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BrutalCard>
    </AdminLayout>
  );
};

export default AdminProductsPage;
