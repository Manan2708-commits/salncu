import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { EventCard } from '@/components/events/EventCard';
import { mockEvents, mockRegistrations } from '@/data/mockData';
import { useAuthStore } from '@/stores/authStore';
import { 
  Calendar, 
  CheckCircle,
  Clock,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>(
    mockRegistrations.filter(r => r.studentId === user?.id).map(r => r.eventId)
  );
  
  const upcomingEvents = mockEvents.filter(e => e.status === 'upcoming' || e.status === 'approved');
  const registeredEvents = mockEvents.filter(e => registeredEventIds.includes(e.id));

  const stats = [
    { title: 'Registered Events', value: registeredEventIds.length, icon: CheckCircle, variant: 'success' as const },
    { title: 'Upcoming Events', value: upcomingEvents.length, icon: Calendar, variant: 'primary' as const },
    { title: 'Events This Week', value: 5, icon: Clock, variant: 'accent' as const },
  ];

  const handleRegister = (eventId: string) => {
    setRegisteredEventIds([...registeredEventIds, eventId]);
    toast({
      title: 'Successfully registered!',
      description: 'You have been registered for this event.',
    });
  };

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">Welcome, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">Discover events and track your registrations.</p>
          </div>
          <Button className="btn-gradient" asChild>
            <Link to="/student/events">
              <Search className="w-4 h-4 mr-2" />
              Browse Events
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Registered Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              My Registered Events
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/student/registered">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {registeredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {registeredEvents.slice(0, 3).map((event) => (
                  <EventCard key={event.id} event={event} showActions={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't registered for any events yet</p>
                <Button asChild>
                  <Link to="/events">Browse Events</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommended Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Recommended for You
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/events">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents
                .filter(e => !registeredEventIds.includes(e.id))
                .slice(0, 3)
                .map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event}
                    onRegister={handleRegister}
                    isRegistered={registeredEventIds.includes(event.id)}
                  />
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
