import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.js';
import BrutalCard from '../../components/common/BrutalCard.js';
import BrutalBadge from '../../components/common/BrutalBadge.js';
import api from '../../api/client.js';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = () => {
    setIsLoading(true);
    api.get('/admin/users')
      .then((res: any) => setUsers(res.data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${id}/status`, { isActive: !currentStatus });
      fetchUsers();
    } catch (e: any) {
      alert(e.message || 'Action failed');
    }
  };

  return (
    <AdminLayout title="User Management" subtitle="Manage registered customers, shopkeeper accounts, and access permissions.">
      <BrutalCard bg="bg-white" shadow="md" className="p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#121212] text-white">
                <th className="p-2.5 border-2 border-[#121212]">NAME</th>
                <th className="p-2.5 border-2 border-[#121212]">EMAIL</th>
                <th className="p-2.5 border-2 border-[#121212]">ROLE</th>
                <th className="p-2.5 border-2 border-[#121212]">STATUS</th>
                <th className="p-2.5 border-2 border-[#121212] text-center">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-neutral-300 hover:bg-[#FAF7EE]">
                  <td className="p-2.5 font-bold">{u.name}</td>
                  <td className="p-2.5">{u.email}</td>
                  <td className="p-2.5">
                    <BrutalBadge
                      variant={u.role === 'ADMIN' ? 'red' : u.role === 'SHOPKEEPER' ? 'yellow' : 'green'}
                      size="sm"
                    >
                      {u.role}
                    </BrutalBadge>
                  </td>
                  <td className="p-2.5 font-bold">
                    {u.isActive ? (
                      <span className="text-green-700">Active</span>
                    ) : (
                      <span className="text-red-700">Suspended</span>
                    )}
                  </td>
                  <td className="p-2.5 text-center">
                    {u.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleToggleStatus(u.id, u.isActive)}
                        className="underline font-bold text-xs cursor-pointer hover:text-red-600"
                      >
                        {u.isActive ? 'Suspend' : 'Reactivate'}
                      </button>
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

export default AdminUsersPage;
