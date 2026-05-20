'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import EventCard from '@/components/events/EventCard';
import api from '@/lib/api';
import type { Event } from '@/lib/types';
import { Search, Loader2, Calendar } from 'lucide-react';

const STATUSES = ['All', 'upcoming', 'ongoing', 'completed'];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get('/events', { params: { search, status: status === 'All' ? '' : status, page, limit: 12 } })
      .then(({ data }) => { setEvents(data.events); setPages(data.pages); })
      .finally(() => setLoading(false));
  }, [search, status, page]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Campus Events</h1>
          <p className="text-gray-400">Discover and register for upcoming events</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input className="input pl-10" placeholder="Search events..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => { setStatus(s === 'All' ? '' : s); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${(s === 'All' && !status) || status === s ? 'bg-indigo-600 text-white' : 'glass text-gray-400 hover:text-white'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No events found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((e) => <EventCard key={e._id} event={e} />)}
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
