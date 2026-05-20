'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { ClubRequest } from '@/lib/types';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import clsx from 'clsx';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
};

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ClubRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [notes, setNotes] = useState<Record<string, string>>({});

  const fetchRequests = () => {
    setLoading(true);
    api.get('/club-requests', { params: { status: filter } })
      .then(({ data }) => setRequests(data.requests))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  const review = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/club-requests/${id}/review`, { status, adminNotes: notes[id] || '' });
      toast.success(`Request ${status}`);
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Club Registration Requests</h1>
        <p className="text-gray-400 mt-1">Review and approve or reject club requests</p>
      </div>

      <div className="flex gap-2">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={clsx('px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all', filter === s ? 'bg-indigo-600 text-white' : 'glass text-gray-400 hover:text-white')}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No {filter} requests</div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req._id} className="glass-card space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{req.clubName}</h3>
                  <p className="text-sm text-gray-400 mt-0.5">by {req.applicantName} · {req.applicantEmail}</p>
                  <span className={clsx('badge mt-2', statusColors[req.status])}>{req.status}</span>
                </div>
                <span className="badge bg-indigo-500/20 text-indigo-300">{req.category}</span>
              </div>

              <p className="text-gray-400 text-sm">{req.description}</p>
              {req.motivation && <p className="text-gray-500 text-sm italic">"{req.motivation}"</p>}

              {req.status === 'pending' && (
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <textarea
                    className="input text-sm min-h-[60px] resize-none"
                    placeholder="Admin notes (optional)..."
                    value={notes[req._id] || ''}
                    onChange={(e) => setNotes((n) => ({ ...n, [req._id]: e.target.value }))}
                  />
                  <div className="flex gap-3">
                    <button onClick={() => review(req._id, 'rejected')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-all">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button onClick={() => review(req._id, 'approved')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm font-medium transition-all">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                  </div>
                </div>
              )}

              {req.adminNotes && (
                <p className="text-xs text-gray-500 italic border-t border-white/10 pt-2">Note: {req.adminNotes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
