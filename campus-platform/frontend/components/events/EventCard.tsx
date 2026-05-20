import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import type { Event } from '@/lib/types';
import clsx from 'clsx';

const statusColors: Record<string, string> = {
  upcoming: 'bg-green-500/20 text-green-400',
  ongoing: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-gray-500/20 text-gray-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

export default function EventCard({ event }: { event: Event }) {
  return (
    <Link href={`/events/${event._id}`} className="glass-card group block hover:scale-[1.02] transition-transform duration-300">
      <div className="relative h-40 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-purple-900 to-indigo-900">
        {event.banner ? (
          <Image src={event.banner} alt={event.title} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-white/20" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={clsx('badge backdrop-blur-sm', statusColors[event.status])}>
            {event.status}
          </span>
        </div>
      </div>

      <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">{event.title}</h3>
      <p className="text-sm text-gray-400 line-clamp-2 mt-1">{event.description}</p>

      <div className="mt-3 space-y-1.5 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <Clock className="w-3.5 h-3.5 text-indigo-400 ml-2" />
          <span>{event.time}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-purple-400" />
          <span className="truncate">{event.venue}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-green-400" />
          <span>{event.participantCount} registered{event.maxParticipants ? ` / ${event.maxParticipants}` : ''}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-500">
        by <span className="text-indigo-400">{event.clubName}</span>
      </div>
    </Link>
  );
}
