import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ClubCard } from '@/components/clubs/ClubCard';
import { EventCard } from '@/components/events/EventCard';
import { Calendar, Building2, Users, CheckSquare, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClubs, useApproveClub, useClubRequests } from '@/hooks/useClubs';
import { useEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { data: allClubs = [] } = useClubs();
  const { data: allEvents = [] } = useEvents();
  const { data: clubRequests = [] } = useClubRequests({ status: ['pending'] });
  const approve = useApproveClub();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: userCount = 0 } = useQuery({
    queryKey: ['user-count'],
    queryFn: async () => {
      const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const pendingClubs = allClubs.filter((c: any) => c.status === 'pending');
  const pendingEvents = allEvents.filter((e: any) => e.status === 'pending');
  const upcomingEvents = allEvents.filter((e: any) => ['approved', 'upcoming', 'ongoing'].includes(e.status));

  const handleApproveClub = async (clubId: string, ok: boolean) => {
    try {
      await approve.mutateAsync({ clubId, approve: ok });
      toast({ title: ok ? 'Club approved' : 'Club rejected' });
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message, variant: 'destructive' });
    }
  };

  const handleApproveEvent = async (eventId: string, ok: boolean) => {
    const { error } = await supabase.from('events').update({ status: ok ? 'upcoming' : 'rejected' }).eq('id', eventId);
    if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    else { toast({ title: ok ? 'Event approved' : 'Event rejected' }); qc.invalidateQueries({ queryKey: ['events'] }); }
  };

  const stats = [
    { title: 'Total Clubs', value: allClubs.length, icon: Building2, variant: 'primary' as const },
    { title: 'Total Events', value: allEvents.length, icon: Calendar, variant: 'accent' as const },
    { title: 'Pending Approvals', value: pendingClubs.length + pendingEvents.length + clubRequests.length, icon: CheckSquare, variant: 'warning' as const },
    { title: 'Registered Users', value: userCount, icon: Users, variant: 'success' as const },
  ];

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage clubs, events, and approvals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => <StatCard key={s.title} {...s} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Clock className="w-5 h-5 text-warning" />Pending Club Approvals</CardTitle></CardHeader>
            <CardContent>
              {pendingClubs.length > 0 ? (
                <div className="space-y-4">
                  {pendingClubs.slice(0, 3).map((club: any) => (
                    <ClubCard key={club.id} club={club} showActions
                      onApprove={() => handleApproveClub(club.id, true)}
                      onReject={() => handleApproveClub(club.id, false)} />
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-center py-8">No pending clubs</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Clock className="w-5 h-5 text-warning" />Pending Event Approvals</CardTitle></CardHeader>
            <CardContent>
              {pendingEvents.length > 0 ? (
                <div className="space-y-4">
                  {pendingEvents.slice(0, 3).map((event: any) => (
                    <div key={event.id} className="space-y-2">
                      <EventCard event={event} showActions={false} />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 text-destructive" onClick={() => handleApproveEvent(event.id, false)}>Reject</Button>
                        <Button size="sm" className="flex-1 bg-success hover:bg-success/90" onClick={() => handleApproveEvent(event.id, true)}>Approve</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-center py-8">No pending events</p>}
            </CardContent>
          </Card>
        </div>

        {clubRequests.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2"><Clock className="w-5 h-5 text-yellow-500" />Pending Club Registration Requests ({clubRequests.length})</CardTitle>
              <Button variant="outline" size="sm" asChild><Link to="/admin/club-requests">Review All</Link></Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {clubRequests.length} user{clubRequests.length > 1 ? 's have' : ' has'} submitted a club registration request awaiting your review.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" />Upcoming Events</CardTitle>
            <Button variant="outline" size="sm" asChild><Link to="/events">View All</Link></Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.slice(0, 6).map((e: any) => <EventCard key={e.id} event={e} showActions={false} />)}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
