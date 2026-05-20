'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import type { Event } from '@/lib/types';
import { Calendar, Clock, MapPin, Users, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`).then(({ data }) => setEvent(data.event)).finally(() => setLoading(false));
  }, [id]);

  const handleRegister = async () => {
    if (!user) { toast.error('Please login to register'); return; }
    setRegistering(true);
    try {
      await api.post(`/events/${id}/register`);
      toast.success('Registered successfully!');
      setRegistered(true);
      setEvent((e) => e ? { ...e, participantCount: e.participantCount + 1 } : e);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center text-gray-400">Event not found</div>;

  const isFull = event.maxParticipants !== null && event.participantCount >= event.maxParticipants;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <Link href="/events" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>

        <div className="relative h-64 rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-purple-900 to-indigo-900">
          {event.banner && <Image src={event.banner} alt={event.title} fill className="object-cover opacity-70" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <span className={clsx('badge mb-2', event.status === 'upcoming' ? 'bg-green-500/30 text-green-300' : 'bg-gray-500/30 text-gray-300')}>
              {event.status}
            </span>
            <h1 className="text-3xl font-bold text-white">{event.title}</h1>
            <p className="text-indigo-300 text-sm mt-1">by {event.clubName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card">
              <h2 className="font-semibold text-lg mb-3">About this Event</h2>
              <p className="text-gray-400 leading-relaxed">{event.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-pink-400 shrink-0" />
                <span>{event.venue}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-4 h-4 text-green-400 shrink-0" />
                <span>{event.participantCount} registered{event.maxParticipants ? ` / ${event.maxParticipants} max` : ''}</span>
              </div>

              {event.status === 'upcoming' && (
                <button onClick={handleRegister} disabled={registering || registered || isFull}
                  className={clsx('btn-primary w-full mt-2', (registered || isFull) && 'opacity-60 cursor-not-allowed')}>
                  {registered ? '✓ Registered' : isFull ? 'Event Full' : registering ? 'Registering...' : 'Register Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
