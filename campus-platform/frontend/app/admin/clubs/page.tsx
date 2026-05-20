'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Club } from '@/lib/types';
import toast from 'react-hot-toast';
import { Search, Trash2, Loader2 } from 'lucide-react';

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchClubs = () => {
    setLoading(true);
    api.get('/clubs', { params: { search, limit: 50 } }).then(({ data }) => setClubs(data.clubs)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchClubs(); }, [search]);

  const deleteClub = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/clubs/${id}`);
      toast.success('Club deleted');
      fetchClubs();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clubs</h1>
        <p className="text-gray-400 mt-1">Manage all clubs on the platform</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input className="input pl-10" placeholder="Search clubs..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr className="text-gray-400 text-left">
                <th className="px-6 py-4 font-medium">Club</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Members</th>
                <th className="px-6 py-4 font-medium">Admin</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clubs.map((c) => (
                <tr key={c._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium">{c.name}</td>
                  <td className="px-6 py-4"><span className="badge bg-indigo-500/20 text-indigo-300">{c.category}</span></td>
                  <td className="px-6 py-4 text-gray-400">{c.memberCount}</td>
                  <td className="px-6 py-4 text-gray-400">{c.adminId?.name}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => deleteClub(c._id, c.name)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
