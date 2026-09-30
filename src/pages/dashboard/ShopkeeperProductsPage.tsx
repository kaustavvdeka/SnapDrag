import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout.js';
import BrutalCard from '../../components/common/BrutalCard.js';
import BrutalBadge from '../../components/common/BrutalBadge.js';
import BrutalButton from '../../components/common/BrutalButton.js';
import { Product } from '../../types/index.js';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  Package,
  PlusCircle,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  Plus,
  Minus,
} from 'lucide-react';

export const ShopkeeperProductsPage: React.FC = () => {
  const { user } = useAuth();
  const shopId = user?.shops && user.shops.length > 0 ? user.shops[0].id : '';

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);

  const fetchShopProducts = async () => {
    if (!shopId) return;
    setIsLoading(true);
    try {
      const res: any = await api.get(`/products?shopId=${shopId}&limit=50`);
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Failed to load shop products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShopProducts();
  }, [shopId]);

  const handleStockAdjust = async (product: Product, delta: number) => {
    const newTotal = Math.max(0, product.totalQuantity + delta);
    setUpdatingStockId(product.id);
    try {
      await api.patch(`/products/${product.id}`, {
        totalQuantity: newTotal,
      });
      await fetchShopProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to update stock');
    } finally {
      setUpdatingStockId(null);
    }
  };

  const handleDeleteProduct = async (productId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from your catalog?`)) {
      return;
    }
    try {
      await api.delete(`/products/${productId}`);
      await fetchShopProducts();
    } catch (err: any) {
      alert(err.message || 'Cannot delete product');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.material.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Product Catalog & Inventory"
      subtitle={`Manage active outfits, update live stock quantities, and add new collections.`}
      action={
        <Link to="/dashboard/products/new">
          <BrutalButton variant="primary" size="sm">
            <PlusCircle size={16} className="mr-1.5" /> Add New Outfit
          </BrutalButton>
        </Link>
      }
    >
      <BrutalCard bg="bg-white" shadow="md" className="p-4 space-y-4">
        {/* Search & Counter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by name, SKU, or fabric..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#FAF7EE] border-2 border-[#121212] text-xs font-mono font-bold focus:outline-none"
            />
          </div>

          <span className="text-xs font-mono font-bold text-neutral-600">
            Displaying {filteredProducts.length} of {products.length} outfits
          </span>
        </div>

        {/* Table / List */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-neutral-200 border-2 border-[#121212] animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-[#121212] text-white">
                  <th className="p-3 border-2 border-[#121212]">OUTFIT</th>
                  <th className="p-3 border-2 border-[#121212]">CATEGORY</th>
                  <th className="p-3 border-2 border-[#121212]">PRICE</th>
                  <th className="p-3 border-2 border-[#121212] text-center">IN-STORE STOCK</th>
                  <th className="p-3 border-2 border-[#121212] text-center">RESERVED</th>
                  <th className="p-3 border-2 border-[#121212] text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isUpdating = updatingStockId === p.id;
                  return (
                    <tr key={p.id} className="border-b-2 border-neutral-300 hover:bg-[#FAF7EE] transition-colors">
                      {/* Name & Photo */}
                      <td className="p-3 flex items-center gap-3">
                        <img
                          src={p.images[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100'}
                          alt={p.name}
                          className="w-10 h-12 object-cover border border-[#121212] shrink-0"
                        />
                        <div className="min-w-0">
                          <Link to={`/products/${p.id}`} className="font-bold text-[#121212] hover:underline block truncate">
                            {p.name}
                          </Link>
                          <span className="text-[10px] text-neutral-500 block">
                            SKU: {p.sku} • {p.material} ({p.color})
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3 font-bold text-[#121212]">
                        {p.category?.name || 'Traditional'}
                      </td>

                      {/* Price */}
                      <td className="p-3 font-bold text-[#121212]">
                        ₹{p.discountedPrice.toLocaleString('en-IN')}
                        {p.discountPercent > 0 && (
                          <span className="block text-[10px] text-[#00E599] font-black">
                            {p.discountPercent}% OFF
                          </span>
                        )}
                      </td>

                      {/* In-Store Stock Adjuster */}
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-white border border-[#121212] p-1 shadow-brutal-sm">
                          <button
                            onClick={() => handleStockAdjust(p, -1)}
                            disabled={p.totalQuantity <= 0 || isUpdating}
                            className="p-1 hover:bg-[#FF4D4D] hover:text-white transition-colors cursor-pointer disabled:opacity-30"
                            title="Decrease total stock"
                          >
                            <Minus size={12} strokeWidth={3} />
                          </button>

                          <span className={`px-2 font-black text-sm ${p.availableQuantity === 0 ? 'text-[#FF4D4D]' : ''}`}>
                            {p.availableQuantity} avail
                          </span>

                          <button
                            onClick={() => handleStockAdjust(p, 1)}
                            disabled={isUpdating}
                            className="p-1 hover:bg-[#00E599] transition-colors cursor-pointer"
                            title="Increase stock"
                          >
                            <Plus size={12} strokeWidth={3} />
                          </button>
                        </div>
                      </td>

                      {/* Reserved */}
                      <td className="p-3 text-center font-bold">
                        {p.reservedQuantity > 0 ? (
                          <BrutalBadge variant="yellow" size="sm">
                            {p.reservedQuantity} on hold
                          </BrutalBadge>
                        ) : (
                          <span className="text-neutral-400">0</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/products/${p.id}`}
                            target="_blank"
                            className="p-1.5 border border-[#121212] hover:bg-[#FFE600] transition-colors"
                            title="View public product page"
                          >
                            <ExternalLink size={14} />
                          </Link>

                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 border border-[#121212] text-red-600 hover:bg-[#FF4D4D] hover:text-white transition-colors cursor-pointer"
                            title="Delete outfit"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <Package size={36} className="mx-auto text-neutral-400" />
            <p className="font-bold text-sm text-[#121212]">No products found matching criteria</p>
          </div>
        )}
      </BrutalCard>
    </DashboardLayout>
  );
};

export default ShopkeeperProductsPage;
