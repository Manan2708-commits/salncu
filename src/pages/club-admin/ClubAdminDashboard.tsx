import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { EventCard } from '@/components/events/EventCard';
import { useAuthStore } from '@/stores/authStore';
import { Calendar, Users, Clock, PlusCircle, TrendingUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useMyClub } from '@/hooks/useClubs';
import { useEvents } from '@/hooks/useEvents';

export default function ClubAdminDashboard() {
  const { user } = useAuthStore();
  const { data: club } = useMyClub(user?.id);
  const { data: events = [] } = useEvents({ clubId: club?.id });

  const upcoming = events.filter((e: any) => ['approved', 'upcoming', 'ongoing'].includes(e.status));
  const totalRegs = events.reduce((sum: number, e: any) => sum + (e.registration_count || 0), 0);

  const stats = [
    { title: 'Total Events', value: events.length, icon: Calendar, variant: 'primary' as const },
    { title: 'Total Registrations', value: totalRegs, icon: Users, variant: 'accent' as const },
    { title: 'Upcoming Events', value: upcoming.length, icon: Clock, variant: 'success' as const },
    { title: 'Club Members', value: club?.member_count || 0, icon: Users, variant: 'default' as const },
  ];

  return (
    <DashboardLayout requiredRole="club_admin">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">{club?.name || 'Club Dashboard'}</h1>
            <p className="text-muted-foreground">{club ? "Manage your club's events and registrations." : "You're not yet linked to a club. Contact your admin."}</p>
          </div>
          {club && (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to={`/clubs/${club.id}`}><ExternalLink className="w-4 h-4 mr-2" />View Club Page</Link>
              </Button>
              <Button className="btn-gradient" asChild>
                <Link to="/club-admin/create-event"><PlusCircle className="w-4 h-4 mr-2" />Create Event</Link>
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => <StatCard key={s.title} {...s} />)}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" />Your Events</CardTitle></CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.slice(0, 6).map((e: any) => <EventCard key={e.id} event={e} showActions={false} />)}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No events yet</p>
                {club && <Button asChild><Link to="/club-admin/create-event">Create Your First Event</Link></Button>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
