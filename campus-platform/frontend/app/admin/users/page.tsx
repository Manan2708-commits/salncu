'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { User } from '@/lib/types';
import toast from 'react-hot-toast';
import { Search, Loader2 } from 'lucide-react';
import clsx from 'clsx';

const roleColors: Record<string, string> = {
  user: 'bg-gray-500/20 text-gray-400',
  club_admin: 'bg-indigo-500/20 text-indigo-400',
  super_admin: 'bg-purple-500/20 text-purple-400',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users', { params: { search } }).then(({ data }) => setUsers(data.users)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const updateRole = async (id: string, role: string) => {
    try {
      await api.patch(`/users/${id}/role`, { role });
      toast.success('Role updated');
      fetchUsers();
    } catch {
      toast.error('Failed to update role');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-gray-400 mt-1">Manage all registered users</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input className="input pl-10" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr className="text-gray-400 text-left">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium">{u.name}</td>
                  <td className="px-6 py-4 text-gray-400">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={clsx('badge', roleColors[u.role])}>{u.role.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <select value={u.role} onChange={(e) => updateRole(u._id, e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                      <option value="user">User</option>
                      <option value="club_admin">Club Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
