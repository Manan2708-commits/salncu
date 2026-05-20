import Link from 'next/link';
import Image from 'next/image';
import { Users, Tag } from 'lucide-react';
import type { Club } from '@/lib/types';

export default function ClubCard({ club }: { club: Club }) {
  return (
    <Link href={`/clubs/${club._id}`} className="glass-card group block hover:scale-[1.02] transition-transform duration-300">
      <div className="relative h-32 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-indigo-900 to-purple-900">
        {club.banner ? (
          <Image src={club.banner} alt={club.name} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-white/20">{club.name[0]}</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="badge bg-black/40 text-white backdrop-blur-sm">
            <Tag className="w-3 h-3 mr-1" />{club.category}
          </span>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/30 flex items-center justify-center shrink-0 text-lg font-bold text-indigo-300">
          {club.logo ? <Image src={club.logo} alt="" width={40} height={40} className="rounded-xl object-cover" /> : club.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">{club.name}</h3>
          <p className="text-sm text-gray-400 line-clamp-2 mt-0.5">{club.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-500">
        <Users className="w-3.5 h-3.5" />
        <span>{club.memberCount} members</span>
      </div>
    </Link>
  );
}
