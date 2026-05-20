import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { EventCard } from '@/components/events/EventCard';
import { ClubCard } from '@/components/clubs/ClubCard';
import { useAuthStore } from '@/stores/authStore';
import { Calendar, Users, CheckCircle, Award, Building2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useEvents, useMyRegistrations, useUnregister } from '@/hooks/useEvents';
import { useClubs, useMyClub } from '@/hooks/useClubs';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function StudentDashboard() {
  const { user, roles } = useAuthStore();
  const { data: allEvents = [] } = useEvents({ status: ['approved', 'upcoming', 'ongoing', 'completed'] });
  const { data: myRegs = [] } = useMyRegistrations(user?.id);
  const { data: myClub } = useMyClub(roles.includes('club_admin') ? user?.id : undefined);
  const { data: allClubs = [] } = useClubs({ status: ['approved'] });
  const unregister = useUnregister();
  const { toast } = useToast();
  const [clubSearch, setClubSearch] = useState('');

  const regSet = new Set(myRegs.map((r: any) => r.event_id));
  const myEvents = allEvents.filter((e: any) => regSet.has(e.id));
  const upcoming = allEvents.filter((e: any) => ['approved', 'upcoming', 'ongoing'].includes(e.status)).slice(0, 6);

  const filteredClubs = allClubs.filter((c: any) =>
    c.name.toLowerCase().includes(clubSearch.toLowerCase()) ||
    c.description.toLowerCase().includes(clubSearch.toLowerCase())
  );

  const stats = [
    { title: 'My Registrations', value: myRegs.length, icon: CheckCircle, variant: 'success' as const },
    { title: 'Upcoming Events', value: upcoming.length, icon: Calendar, variant: 'primary' as const },
    { title: 'Available Events', value: allEvents.length, icon: Users, variant: 'accent' as const },
    { title: 'Certificates', value: 0, icon: Award, variant: 'default' as const },
  ];

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
          <p className="text-muted-foreground">Discover and register for campus events.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => <StatCard key={s.title} {...s} />)}
        </div>

        {/* My Club (if club admin) */}
        {myClub && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" /> My Club
              </CardTitle>
              <Button size="sm" className="btn-gradient" asChild>
                <Link to={`/clubs/${myClub.id}`}>View Full Details</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-lg">{myClub.name}</p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{myClub.description}</p>
              <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                <span>{myClub.member_count || 0} members</span>
                <span>{myClub.coordinator_email}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">My Registrations</CardTitle>
            <Button variant="outline" size="sm" asChild><Link to="/events">Browse More</Link></Button>
          </CardHeader>
          <CardContent>
            {myEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myEvents.map((e: any) => (
                  <EventCard key={e.id} event={e} isRegistered
                    onUnregister={async () => {
                      const reg = myRegs.find((r: any) => r.event_id === e.id);
                      if (!reg) return;
                      try { await unregister.mutateAsync(reg.id); toast({ title: 'Unregistered' }); }
                      catch (err: any) { toast({ title: 'Failed', description: err.message, variant: 'destructive' }); }
                    }} />
                ))}
              </div>
            ) : <p className="text-muted-foreground text-center py-8">You haven't registered for any events yet</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Upcoming Events</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((e: any) => <EventCard key={e.id} event={e} showActions={false} />)}
            </div>
          </CardContent>
        </Card>

        {/* Explore Clubs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Explore Clubs
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Search clubs..."
                value={clubSearch}
                onChange={(e) => setClubSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredClubs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClubs.slice(0, 6).map((c: any) => <ClubCard key={c.id} club={c} />)}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6 text-sm">No clubs match your search.</p>
            )}
            {filteredClubs.length > 6 && (
              <div className="text-center mt-4">
                <Button variant="outline" size="sm" asChild><Link to="/student/clubs">View All Clubs</Link></Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
