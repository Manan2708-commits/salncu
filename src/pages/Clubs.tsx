import { Navbar } from '@/components/layout/Navbar';
import { ClubCard } from '@/components/clubs/ClubCard';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useClubs } from '@/hooks/useClubs';

export default function Clubs() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: clubs = [], isLoading } = useClubs({ status: ['approved'] });

  const filtered = clubs.filter((c: any) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Campus Clubs</h1>
          <p className="text-muted-foreground">Explore clubs and find communities that match your interests</p>
        </div>
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search clubs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((club: any) => <ClubCard key={club.id} club={club} />)}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="font-semibold text-lg mb-2">No clubs found</h3>
            <p className="text-muted-foreground">Try a different search</p>
          </div>
        )}
      </div>
    </div>
  );
}
