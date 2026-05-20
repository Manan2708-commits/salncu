'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import EventCard from '@/components/events/EventCard';
import api from '@/lib/api';
import type { Club, Event } from '@/lib/types';
import { Users, Mail, Globe, Instagram, Twitter, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ClubDetailPage() {
  const { id } = useParams();
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/clubs/${id}`).then(({ data }) => { setClub(data.club); setEvents(data.events); }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>;
  if (!club) return <div className="min-h-screen flex items-center justify-center text-gray-400">Club not found</div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <Link href="/clubs" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Clubs
        </Link>

        {/* Banner */}
        <div className="relative h-56 rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-indigo-900 to-purple-900">
          {club.banner && <Image src={club.banner} alt={club.name} fill className="object-cover opacity-70" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 flex items-end gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/50 backdrop-blur-sm flex items-center justify-center text-2xl font-bold border border-white/20">
              {club.logo ? <Image src={club.logo} alt="" width={64} height={64} className="rounded-2xl object-cover" /> : club.name[0]}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{club.name}</h1>
              <span className="badge bg-indigo-500/30 text-indigo-300 mt-1">{club.category}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card">
              <h2 className="font-semibold text-lg mb-3">About</h2>
              <p className="text-gray-400 leading-relaxed">{club.description}</p>
            </div>

            <div>
              <h2 className="font-semibold text-lg mb-4">Events ({events.length})</h2>
              {events.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {events.map((e) => <EventCard key={e._id} event={e} />)}
                </div>
              ) : <p className="text-gray-500 text-sm">No events yet.</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card space-y-3">
              <h3 className="font-semibold">Details</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>{club.memberCount} members</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span className="truncate">{club.adminId?.email}</span>
              </div>
              {club.socialLinks?.website && (
                <a href={club.socialLinks.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300">
                  <Globe className="w-4 h-4" /> Website
                </a>
              )}
              {club.socialLinks?.instagram && (
                <a href={`https://instagram.com/${club.socialLinks.instagram}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-pink-400 hover:text-pink-300">
                  <Instagram className="w-4 h-4" /> @{club.socialLinks.instagram}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
