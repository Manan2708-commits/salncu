'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, Calendar } from 'lucide-react';

type Form = { title: string; description: string; date: string; time: string; venue: string; category: string; maxParticipants: string; registrationDeadline: string };

export default function NewEventPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<Form>();
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<File | null>(null);

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (banner) fd.append('banner', banner);
      await api.post('/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Event created!');
      router.push('/club-admin');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3"><Calendar className="w-7 h-7 text-indigo-400" /> Create Event</h1>
        <p className="text-gray-400 mt-1">Add a new event for your club</p>
      </div>

      <div className="glass-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Event Title *</label>
            <input {...register('title', { required: 'Title required' })} className="input" placeholder="e.g. Annual Tech Fest" />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description *</label>
            <textarea {...register('description', { required: 'Description required' })} className="input min-h-[100px] resize-none" placeholder="Describe the event..." />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Date *</label>
              <input {...register('date', { required: true })} type="date" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Time *</label>
              <input {...register('time', { required: true })} type="time" className="input" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Venue *</label>
            <input {...register('venue', { required: 'Venue required' })} className="input" placeholder="e.g. Main Auditorium" />
            {errors.venue && <p className="text-red-400 text-xs mt-1">{errors.venue.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
              <select {...register('category')} className="input">
                {['general', 'workshop', 'competition', 'seminar', 'cultural', 'sports', 'tech'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Max Participants</label>
              <input {...register('maxParticipants')} type="number" className="input" placeholder="Leave blank for unlimited" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Registration Deadline</label>
            <input {...register('registrationDeadline')} type="datetime-local" className="input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Event Banner</label>
            <input type="file" accept="image/*" onChange={(e) => setBanner(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600/20 file:text-indigo-300 hover:file:bg-indigo-600/30 cursor-pointer" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => router.back()} className="btn-outline flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
