import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.js';
import BrutalCard from '../../components/common/BrutalCard.js';
import BrutalBadge from '../../components/common/BrutalBadge.js';
import BrutalButton from '../../components/common/BrutalButton.js';
import api from '../../api/client.js';

export const AdminShopsPage: React.FC = () => {
  const [shops, setShops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchShops = () => {
    setIsLoading(true);
    api.get('/admin/shops')
      .then((res: any) => setShops(res.data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleApprove = async (id: string, approve: boolean) => {
    try {
      await api.patch(`/admin/shops/${id}/approve`, { approve });
      fetchShops();
    } catch (e: any) {
      alert(e.message || 'Action failed');
    }
  };

  return (
    <AdminLayout title="Shops & Verification" subtitle="Approve new traditional shops, check physical locations, and manage live storefronts.">
      <BrutalCard bg="bg-white" shadow="md" className="p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#121212] text-white">
                <th className="p-2.5 border-2 border-[#121212]">SHOP NAME</th>
                <th className="p-2.5 border-2 border-[#121212]">PROPRIETOR</th>
                <th className="p-2.5 border-2 border-[#121212]">LOCATION</th>
                <th className="p-2.5 border-2 border-[#121212]">STATUS</th>
                <th className="p-2.5 border-2 border-[#121212] text-center">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((s) => (
                <tr key={s.id} className="border-b border-neutral-300 hover:bg-[#FAF7EE]">
                  <td className="p-2.5 font-bold">
                    {s.name}
                    <span className="block text-[10px] text-neutral-500 font-normal">
                      {s._count?.products || 0} outfits listed
                    </span>
                  </td>
                  <td className="p-2.5">{s.owner?.name} ({s.owner?.email})</td>
                  <td className="p-2.5">
                    {s.location?.city}, {s.location?.state}
                    {s.location?.floorName ? ` (${s.location.floorName})` : ''}
                  </td>
                  <td className="p-2.5">
                    {s.isApproved ? (
                      <BrutalBadge variant="green" size="sm">✓ Approved</BrutalBadge>
                    ) : (
                      <BrutalBadge variant="yellow" size="sm">Pending Approval</BrutalBadge>
                    )}
                  </td>
                  <td className="p-2.5 text-center">
                    {s.isApproved ? (
                      <button
                        onClick={() => handleApprove(s.id, false)}
                        className="underline text-red-600 font-bold cursor-pointer"
                      >
                        Suspend
                      </button>
                    ) : (
                      <BrutalButton
                        variant="accent"
                        size="sm"
                        onClick={() => handleApprove(s.id, true)}
                      >
                        Approve
                      </BrutalButton>
                    )}
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

export default AdminShopsPage;
