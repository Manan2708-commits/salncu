import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useMyClub } from '@/hooks/useClubs';
import { useEvents, useEventRegistrations } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { ClipboardList, Users, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Registrations() {
  const { user } = useAuthStore();
  const { data: club } = useMyClub(user?.id);
  const { data: events = [] } = useEvents({ clubId: club?.id });
  const [eventId, setEventId] = useState<string>('');
  const selectedEvent = events.find((e: any) => e.id === eventId);

  useMemo(() => { if (!eventId && events.length) setEventId(events[0].id); }, [events, eventId]);

  const { data: regs = [], refetch } = useEventRegistrations(eventId);
  const qc = useQueryClient();
  const { toast } = useToast();

  const setStatus = async (regId: string, status: 'confirmed' | 'attended' | 'cancelled') => {
    const { error } = await supabase.from('registrations').update({ status }).eq('id', regId);
    if (error) return toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    refetch();
    qc.invalidateQueries({ queryKey: ['events'] });
  };

  return (
    <DashboardLayout requiredRole={['club_admin', 'admin']}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-primary" /> Registrations
            </h1>
            <p className="text-muted-foreground">Mark attendance for participants in your events.</p>
          </div>
          {selectedEvent && selectedEvent.status === 'completed' && (
            <Button asChild variant="outline">
              <Link to={`/club-admin/event-report/${selectedEvent.id}`}><FileText className="w-4 h-4 mr-2" />Submit Report</Link>
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <Select value={eventId} onValueChange={setEventId}>
                <SelectTrigger className="md:w-[400px]"><SelectValue placeholder="Pick an event" /></SelectTrigger>
                <SelectContent>
                  {events.map((e: any) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name} · {new Date(e.event_date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="ml-auto"><Users className="w-3 h-3 mr-1" />{regs.length} registered</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {regs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No registrations yet.</p>
            ) : (
              <div className="space-y-2">
                {regs.map((r: any) => (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{r.student_name}</p>
                      <p className="text-sm text-muted-foreground truncate">{r.student_email}</p>
                    </div>
                    <Badge variant={r.status === 'attended' ? 'default' : r.status === 'cancelled' ? 'destructive' : 'secondary'}>
                      {r.status}
                    </Badge>
                    <Select value={r.status} onValueChange={(v) => setStatus(r.id, v as any)}>
                      <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="attended">Attended</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
