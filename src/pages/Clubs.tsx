import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ClubCard } from '@/components/clubs/ClubCard';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Building2 } from 'lucide-react';
import { useClubs } from '@/hooks/useClubs';
import { useAuthStore } from '@/stores/authStore';

function ClubsContent() {
  const [query, setQuery] = useState('');
  const { data: clubs = [], isLoading } = useClubs({ status: ['approved'] });

  const filtered = clubs.filter((c: any) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.description.toLowerCase().includes(query.toLowerCase()) ||
    (c.coordinator_name ?? '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold mb-1">Campus Clubs</h1>
        <p className="text-muted-foreground">Explore clubs and find communities that match your interests.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, description or coordinator..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((club: any) => <ClubCard key={club.id} club={club} />)}
        </div>
      ) : (
        <div className="text-center py-16">
          <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-lg mb-1">No clubs found</h3>
          <p className="text-muted-foreground text-sm">Try a different search term.</p>
        </div>
      )}
    </div>
  );
}

export default function Clubs() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return (
      <DashboardLayout>
        <ClubsContent />
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <ClubsContent />
      </div>
    </div>
  );
}
