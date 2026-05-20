import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/events/EventCard';
import { useAuthStore } from '@/stores/authStore';
import { useClubs } from '@/hooks/useClubs';
import { useEvents } from '@/hooks/useEvents';
import { Users, Mail, Phone, PlusCircle, Settings, ArrowLeft, Loader2, Building2 } from 'lucide-react';

export default function ClubDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, roles, user } = useAuthStore();

  const { data: clubs = [], isLoading } = useClubs({ status: ['approved'] });
  const club = clubs.find((c: any) => c.id === id);

  const isAdmin = roles.includes('admin');
  const isMyClub = roles.includes('club_admin') && club?.admin_user_id === user?.id;
  const canManage = isAdmin || isMyClub;

  // Fetch events for this club — club admin / admin see all statuses, others see public ones
  const { data: events = [], isLoading: eventsLoading } = useEvents(
    canManage
      ? { clubId: id }
      : { clubId: id, status: ['approved', 'upcoming', 'ongoing', 'completed'] }
  );

  const content = (
    <div className="space-y-8">
      {/* Back */}
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
          <Link to={isAuthenticated ? (roles.includes('admin') ? '/admin' : roles.includes('club_admin') ? '/club-admin' : '/student/clubs') : '/clubs'}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Clubs
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : !club ? (
        <div className="text-center py-16">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="font-semibold text-lg">Club not found</h2>
          <p className="text-muted-foreground text-sm">This club may not exist or hasn't been approved yet.</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                {club.logo_url ? (
                  <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <Building2 className="w-8 h-8 text-primary-foreground" />
                )}
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">{club.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>
                  {isMyClub && <Badge variant="secondary">Your Club</Badge>}
                  {isAdmin && !isMyClub && <Badge variant="outline">Admin View</Badge>}
                </div>
              </div>
            </div>

            {canManage && (
              <div className="flex gap-2 shrink-0">
                {(isMyClub || isAdmin) && (
                  <Button className="btn-gradient" asChild>
                    <Link to="/club-admin/create-event"><PlusCircle className="w-4 h-4 mr-2" />Create Event</Link>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link to="/club-admin/registrations"><Settings className="w-4 h-4 mr-2" />Manage</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-base">About</CardTitle></CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{club.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 text-primary shrink-0" />
                  <span>{club.member_count || 0} members</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="break-all">{club.coordinator_email}</span>
                </div>
                {club.coordinator_phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <span>{club.coordinator_phone}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Coordinator</p>
                  <p className="font-medium text-foreground">{club.coordinator_name}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Club admin full details */}
          {canManage && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader><CardTitle className="text-base text-primary">Management Overview</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Total Events</p>
                  <p className="font-bold text-2xl">{events.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Pending Events</p>
                  <p className="font-bold text-2xl">{events.filter((e: any) => e.status === 'pending').length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Total Registrations</p>
                  <p className="font-bold text-2xl">{events.reduce((s: number, e: any) => s + (e.registration_count || 0), 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Members</p>
                  <p className="font-bold text-2xl">{club.member_count || 0}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Events */}
          <div>
            <h2 className="font-display text-xl font-semibold mb-4">
              {canManage ? 'All Events' : 'Upcoming Events'}
              {eventsLoading && <Loader2 className="w-4 h-4 inline ml-2 animate-spin" />}
            </h2>
            {events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((e: any) => <EventCard key={e.id} event={e} showActions={false} />)}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm py-6 text-center">
                {canManage ? 'No events yet. Create your first one!' : 'No upcoming events for this club.'}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );

  // Authenticated users get the dashboard layout (with sidebar); public visitors get plain navbar
  if (isAuthenticated) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">{content}</div>
    </div>
  );
}
