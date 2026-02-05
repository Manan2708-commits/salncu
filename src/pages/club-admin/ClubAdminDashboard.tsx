import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { EventCard } from '@/components/events/EventCard';
import { mockEvents, mockClubs } from '@/data/mockData';
import { useAuthStore } from '@/stores/authStore';
import { 
  Calendar, 
  Users, 
  Clock,
  PlusCircle,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export default function ClubAdminDashboard() {
  const { user } = useAuthStore();
  
  // Get club for current user (mock)
  const club = mockClubs.find(c => c.id === user?.clubId) || mockClubs[0];
  const clubEvents = mockEvents.filter(e => e.clubId === club?.id);
  const upcomingEvents = clubEvents.filter(e => e.status === 'upcoming' || e.status === 'approved');
  const totalRegistrations = clubEvents.reduce((sum, e) => sum + e.registrationCount, 0);

  const stats = [
    { title: 'Total Events', value: clubEvents.length, icon: Calendar, variant: 'primary' as const },
    { title: 'Total Registrations', value: totalRegistrations, icon: Users, variant: 'accent' as const },
    { title: 'Upcoming Events', value: upcomingEvents.length, icon: Clock, variant: 'success' as const },
    { title: 'Club Members', value: club?.memberCount || 0, icon: Users, variant: 'default' as const },
  ];

  return (
    <DashboardLayout requiredRole="club_admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">{club?.name || 'Club Dashboard'}</h1>
            <p className="text-muted-foreground">Manage your club's events and registrations.</p>
          </div>
          <Button className="btn-gradient" asChild>
            <Link to="/club-admin/create-event">
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Event
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Your Events
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/club-admin/events">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {clubEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clubEvents.slice(0, 3).map((event) => (
                  <EventCard key={event.id} event={event} showActions={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No events created yet</p>
                <Button asChild>
                  <Link to="/club-admin/create-event">Create Your First Event</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
