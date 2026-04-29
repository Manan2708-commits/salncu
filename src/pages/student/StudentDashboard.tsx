import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { EventCard } from '@/components/events/EventCard';
import { useAuthStore } from '@/stores/authStore';
import { Calendar, Users, CheckCircle, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useEvents, useMyRegistrations, useUnregister } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { data: allEvents = [] } = useEvents({ status: ['approved', 'upcoming', 'ongoing', 'completed'] });
  const { data: myRegs = [] } = useMyRegistrations(user?.id);
  const unregister = useUnregister();
  const { toast } = useToast();

  const regSet = new Set(myRegs.map((r: any) => r.event_id));
  const myEvents = allEvents.filter((e: any) => regSet.has(e.id));
  const upcoming = allEvents.filter((e: any) => ['approved', 'upcoming', 'ongoing'].includes(e.status)).slice(0, 6);

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
      </div>
    </DashboardLayout>
  );
}
