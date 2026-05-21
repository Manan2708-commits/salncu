import { useState, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EventCard } from '@/components/events/EventCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, Loader2, Calendar } from 'lucide-react';
import type { EventType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { useEvents, useMyRegistrations, useRegisterForEvent, useUnregister } from '@/hooks/useEvents';
import { useClubs } from '@/hooks/useClubs';

const eventTypes: EventType[] = ['workshop', 'fest', 'competition', 'seminar', 'cultural', 'sports', 'tech', 'other'];
const ALL_STATUSES = ['approved', 'upcoming', 'ongoing', 'completed', 'pending', 'rejected', 'cancelled'] as const;

function EventsContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedClub, setSelectedClub] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { isAuthenticated, user } = useAuthStore();
  const { toast } = useToast();

  // Load ALL events regardless of status
  const { data: events = [], isLoading } = useEvents();
  const { data: clubs = [] } = useClubs({ status: ['approved'] });
  const { data: myRegs = [] } = useMyRegistrations(user?.id);
  const register = useRegisterForEvent();
  const unregister = useUnregister();

  const regByEvent = new Map(myRegs.map((r: any) => [r.event_id, r]));

  // Build sorted club list from the clubs table (not just events)
  const clubOptions = useMemo(() =>
    [...clubs].sort((a: any, b: any) => a.name.localeCompare(b.name)),
    [clubs]
  );

  const filtered = useMemo(() => events.filter((event: any) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.club?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || event.event_type === selectedType;
    const matchesClub = selectedClub === 'all' || event.club_id === selectedClub;
    const matchesStatus = selectedStatus === 'all' || event.status === selectedStatus;
    return matchesSearch && matchesType && matchesClub && matchesStatus;
  }), [events, searchQuery, selectedType, selectedClub, selectedStatus]);

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

  const clearFilters = () => { setSearchQuery(''); setSelectedType('all'); setSelectedClub('all'); setSelectedStatus('all'); };
  const hasActiveFilters = searchQuery || selectedType !== 'all' || selectedClub !== 'all' || selectedStatus !== 'all';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-1">Discover Events</h1>
        <p className="text-muted-foreground">Find and register for events happening across campus</p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events, clubs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Club filter */}
          <Select value={selectedClub} onValueChange={setSelectedClub}>
            <SelectTrigger className="w-full md:w-56">
              <SelectValue placeholder="All Clubs" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all">All Clubs</SelectItem>
              {clubOptions.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Type filter */}
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full md:w-44">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {eventTypes.map((t) => (
                <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ALL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active filter badges */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                "{searchQuery}" <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
              </Badge>
            )}
            {selectedClub !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {clubOptions.find((c: any) => c.id === selectedClub)?.name || selectedClub}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedClub('all')} />
              </Badge>
            )}
            {selectedType !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {selectedType} <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedType('all')} />
              </Badge>
            )}
            {selectedStatus !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {selectedStatus} <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedStatus('all')} />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters}>Clear all</Button>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{filtered.length}</span> of {events.length} events
      </p>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((event: any) => {
            const isReg = regByEvent.has(event.id);
            return (
              <EventCard
                key={event.id}
                event={event}
                onRegister={handleRegister}
                onUnregister={() => handleUnregister(event.id)}
                isRegistered={isReg}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No events found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
          <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
        </div>
      )}
    </div>
  );
}

export default function Events() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return (
      <DashboardLayout>
        <EventsContent />
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <EventsContent />
      </div>
    </div>
  );
}
