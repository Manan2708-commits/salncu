import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { EventCard } from '@/components/events/EventCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, Loader2 } from 'lucide-react';
import type { EventType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { useEvents, useMyRegistrations, useRegisterForEvent, useUnregister } from '@/hooks/useEvents';

const eventTypes: EventType[] = ['workshop', 'fest', 'competition', 'seminar', 'cultural', 'sports', 'tech', 'other'];

export default function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedClub, setSelectedClub] = useState<string>('all');
  const { isAuthenticated, user } = useAuthStore();
  const { toast } = useToast();

  const { data: events = [], isLoading } = useEvents({ status: ['approved', 'upcoming', 'ongoing'] });
  const { data: myRegs = [] } = useMyRegistrations(user?.id);
  const register = useRegisterForEvent();
  const unregister = useUnregister();

  const regByEvent = new Map(myRegs.map((r: any) => [r.event_id, r]));
  const clubs = Array.from(new Set(events.map((e: any) => e.club?.name).filter(Boolean))) as string[];

  const filtered = events.filter((event: any) => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) || event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || event.event_type === selectedType;
    const matchesClub = selectedClub === 'all' || event.club?.name === selectedClub;
    return matchesSearch && matchesType && matchesClub;
  });

  const handleRegister = async (eventId: string) => {
    if (!isAuthenticated || !user) {
      toast({ title: 'Please sign in', description: 'You need to sign in to register.', variant: 'destructive' });
      return;
    }
    try {
      await register.mutateAsync({ eventId, studentId: user.id, studentName: user.name, studentEmail: user.email });
      toast({ title: 'Registered!', description: 'You have been registered for this event.' });
    } catch (e: any) {
      toast({ title: 'Failed to register', description: e.message, variant: 'destructive' });
    }
  };

  const handleUnregister = async (eventId: string) => {
    const reg = regByEvent.get(eventId);
    if (!reg) return;
    try {
      await unregister.mutateAsync(reg.id);
      toast({ title: 'Unregistered' });
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message, variant: 'destructive' });
    }
  };

  const clearFilters = () => { setSearchQuery(''); setSelectedType('all'); setSelectedClub('all'); };
  const hasActiveFilters = searchQuery || selectedType !== 'all' || selectedClub !== 'all';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Discover Events</h1>
          <p className="text-muted-foreground">Find and register for events happening across campus</p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search events..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Event Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {eventTypes.map((t) => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedClub} onValueChange={setSelectedClub}>
              <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Club" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clubs</SelectItem>
                {clubs.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && <Badge variant="secondary" className="gap-1">Search: {searchQuery}<X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} /></Badge>}
              {selectedType !== 'all' && <Badge variant="secondary" className="gap-1">Type: {selectedType}<X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedType('all')} /></Badge>}
              {selectedClub !== 'all' && <Badge variant="secondary" className="gap-1">Club: {selectedClub}<X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedClub('all')} /></Badge>}
              <Button variant="ghost" size="sm" onClick={clearFilters}>Clear all</Button>
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Showing {filtered.length} event{filtered.length !== 1 ? 's' : ''}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((event: any) => {
              const isReg = regByEvent.has(event.id);
              return (
                <EventCard key={event.id} event={event}
                  onRegister={handleRegister}
                  onUnregister={() => handleUnregister(event.id)}
                  isRegistered={isReg} />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4"><Search className="w-8 h-8 text-muted-foreground" /></div>
            <h3 className="font-semibold text-lg mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}
