import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { EventCard } from '@/components/events/EventCard';
import { mockEvents } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { EventType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';

const eventTypes: EventType[] = ['workshop', 'fest', 'competition', 'seminar', 'cultural', 'sports', 'tech', 'other'];

export default function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedClub, setSelectedClub] = useState<string>('all');
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  const clubs = [...new Set(mockEvents.map(e => e.clubName))];

  const filteredEvents = mockEvents
    .filter(event => event.status === 'approved' || event.status === 'upcoming')
    .filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || event.eventType === selectedType;
      const matchesClub = selectedClub === 'all' || event.clubName === selectedClub;
      return matchesSearch && matchesType && matchesClub;
    });

  const handleRegister = (eventId: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Please sign in',
        description: 'You need to sign in to register for events.',
        variant: 'destructive',
      });
      return;
    }

    setRegisteredEvents([...registeredEvents, eventId]);
    toast({
      title: 'Successfully registered!',
      description: 'You have been registered for this event.',
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedClub('all');
  };

  const hasActiveFilters = searchQuery || selectedType !== 'all' || selectedClub !== 'all';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Discover Events
          </h1>
          <p className="text-muted-foreground">
            Find and register for exciting events happening across campus
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {eventTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Club Filter */}
            <Select value={selectedClub} onValueChange={setSelectedClub}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Club" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clubs</SelectItem>
                {clubs.map((club) => (
                  <SelectItem key={club} value={club}>
                    {club}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setSearchQuery('')}
                  />
                </Badge>
              )}
              {selectedType !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Type: {selectedType}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setSelectedType('all')}
                  />
                </Badge>
              )}
              {selectedClub !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Club: {selectedClub}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setSelectedClub('all')}
                  />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event}
                onRegister={handleRegister}
                isRegistered={registeredEvents.includes(event.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
