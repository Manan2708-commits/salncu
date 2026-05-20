'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import ClubCard from '@/components/clubs/ClubCard';
import api from '@/lib/api';
import type { Club } from '@/lib/types';
import { Search, Loader2, Building2 } from 'lucide-react';

const CATEGORIES = ['All', 'Tech', 'Cultural', 'Sports', 'Arts', 'Science', 'Social', 'Other'];

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/clubs', { params: { search, category: category === 'All' ? '' : category, page, limit: 12 } });
      setClubs(data.clubs);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClubs(); }, [search, category, page]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Campus Clubs</h1>
          <p className="text-gray-400">Discover communities that match your interests</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input className="input pl-10" placeholder="Search clubs..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => { setCategory(c === 'All' ? '' : c); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${(c === 'All' && !category) || category === c ? 'bg-indigo-600 text-white' : 'glass text-gray-400 hover:text-white'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No clubs found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {clubs.map((club) => <ClubCard key={club._id} club={club} />)}
            </div>
            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${p === page ? 'bg-indigo-600 text-white' : 'glass text-gray-400 hover:text-white'}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
