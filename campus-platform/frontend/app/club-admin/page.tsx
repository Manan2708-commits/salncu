'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/ui/StatCard';
import EventCard from '@/components/events/EventCard';
import api from '@/lib/api';
import type { Event } from '@/lib/types';
import { Calendar, Users, TrendingUp, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function ClubAdminDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [clubName, setClubName] = useState('');

  useEffect(() => {
    if (user?.clubId) {
      api.get(`/clubs/${user.clubId}`).then(({ data }) => {
        setClubName(data.club.name);
        setEvents(data.events);
      });
    }
  }, [user]);

  const totalRegs = events.reduce((s, e) => s + e.participantCount, 0);
  const upcoming = events.filter((e) => e.status === 'upcoming').length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{clubName || 'Club Dashboard'}</h1>
          <p className="text-gray-400 mt-1">Manage your club's events and activities</p>
        </div>
        <Link href="/club-admin/events/new" className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Add Event
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="Total Events" value={events.length} icon={Calendar} color="indigo" />
        <StatCard title="Total Registrations" value={totalRegs} icon={Users} color="purple" />
        <StatCard title="Upcoming Events" value={upcoming} icon={TrendingUp} color="green" />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Events</h2>
        {events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((e) => <EventCard key={e._id} event={e} />)}
          </div>
        ) : (
          <div className="glass-card text-center py-12">
            <Calendar className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">No events yet</p>
            <Link href="/club-admin/events/new" className="btn-primary inline-flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Create First Event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
