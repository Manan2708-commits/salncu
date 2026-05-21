import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ClubCard } from '@/components/clubs/ClubCard';
import { EventCard } from '@/components/events/EventCard';
import { Clock, TrendingUp, CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClubs, useApproveClub, useClubRequests, useApproveClubRequest, useRejectClubRequest } from '@/hooks/useClubs';
import { useEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function AdminApprovals() {
  const { user } = useAuthStore();
  const { data: allClubs = [] } = useClubs();
  const { data: allEvents = [] } = useEvents();
  const { data: pendingClubRequests = [] } = useClubRequests({ status: ['pending'] });
  const approve = useApproveClub();
  const approveRequest = useApproveClubRequest();
  const rejectRequest = useRejectClubRequest();
  const { toast } = useToast();
  const qc = useQueryClient();

  const pendingClubs = allClubs.filter((c: any) => c.status === 'pending');
  const totalPendingClubs = pendingClubs.length + pendingClubRequests.length;
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

  const handleApproveClubRequest = async (requestId: string, ok: boolean) => {
    if (!user) return;
    try {
      if (ok) {
        await approveRequest.mutateAsync({ requestId, adminId: user.id });
      } else {
        await rejectRequest.mutateAsync({ requestId, adminId: user.id });
      }
      toast({ title: ok ? 'Club request approved' : 'Club request rejected' });
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message, variant: 'destructive' });
    }
  };

  const handleApproveEvent = async (eventId: string, ok: boolean) => {
    const { error } = await supabase.from('events').update({ status: ok ? 'upcoming' : 'rejected' }).eq('id', eventId);
    if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    else {
      toast({ title: ok ? 'Event approved' : 'Event rejected' });
      qc.invalidateQueries({ queryKey: ['events'] });
    }
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1 flex items-center gap-3">
            <CheckSquare className="w-7 h-7 text-primary" /> Approvals
          </h1>
          <p className="text-muted-foreground">Review and approve pending clubs and events.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Club Approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" /> Pending Club Approvals
                {totalPendingClubs > 0 && (
                  <span className="ml-auto text-sm font-normal text-muted-foreground">{totalPendingClubs} pending</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {totalPendingClubs > 0 ? (
                <div className="space-y-4">
                  {pendingClubRequests.map((request: any) => (
                    <ClubCard
                      key={request.id}
                      club={{
                        id: request.id,
                        name: request.club_name,
                        description: request.club_description,
                        status: request.status,
                        member_count: 0,
                        coordinator_name: request.coordinator_name,
                        coordinator_email: request.coordinator_email,
                        logo_url: request.club_logo_url,
                      }}
                      showActions
                      linkable={false}
                      onApprove={() => handleApproveClubRequest(request.id, true)}
                      onReject={() => handleApproveClubRequest(request.id, false)}
                    />
                  ))}
                  {pendingClubs.map((club: any) => (
                    <ClubCard
                      key={club.id}
                      club={club}
                      showActions
                      linkable={false}
                      onApprove={() => handleApproveClub(club.id, true)}
                      onReject={() => handleApproveClub(club.id, false)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No pending clubs</p>
              )}
            </CardContent>
          </Card>

          {/* Pending Event Approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" /> Pending Event Approvals
                {pendingEvents.length > 0 && (
                  <span className="ml-auto text-sm font-normal text-muted-foreground">{pendingEvents.length} pending</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingEvents.length > 0 ? (
                <div className="space-y-4">
                  {pendingEvents.map((event: any) => (
                    <div key={event.id} className="space-y-2">
                      <EventCard event={event} showActions={false} />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 text-destructive"
                          onClick={() => handleApproveEvent(event.id, false)}>
                          Reject
                        </Button>
                        <Button size="sm" className="flex-1 bg-success hover:bg-success/90"
                          onClick={() => handleApproveEvent(event.id, true)}>
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No pending events</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Upcoming Events
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/events">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingEvents.slice(0, 6).map((e: any) => (
                  <EventCard key={e.id} event={e} showActions={false} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No upcoming events</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
