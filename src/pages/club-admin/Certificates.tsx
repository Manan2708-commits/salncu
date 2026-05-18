import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useMyClub } from '@/hooks/useClubs';
import { useEvents, useEventRegistrations } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import { useMemo, useState } from 'react';
import { Award, Loader2, Mail, ExternalLink } from 'lucide-react';

type CertType = 'community_service' | 'general_proficiency';

export default function ClubCertificates() {
  const { user, primaryRole } = useAuthStore();
  const { data: club } = useMyClub(user?.id);
  // Admin can issue for any event; club_admin only for own club
  const { data: events = [] } = useEvents(primaryRole === 'admin' ? undefined : { clubId: club?.id });
  const [eventId, setEventId] = useState('');
  const [certType, setCertType] = useState<CertType>('general_proficiency');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [issuing, setIssuing] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  useMemo(() => { if (!eventId && events.length) setEventId(events[0].id); }, [events, eventId]);
  const selectedEvent = events.find((e: any) => e.id === eventId);
  const { data: regs = [] } = useEventRegistrations(eventId);

  const attended = regs.filter((r: any) => r.status === 'attended');
  const all = attended.length > 0 && attended.every((r: any) => selected[r.id]);
  const toggleAll = () => {
    const next: Record<string, boolean> = {};
    if (!all) attended.forEach((r: any) => next[r.id] = true);
    setSelected(next);
  };

  const { data: issued = [] } = useQuery({
    queryKey: ['certs-issued', eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data } = await supabase.from('certificates_issued').select('*').eq('event_id', eventId).order('created_at', { ascending: false });
      return data || [];
    },
  });

  const issue = async () => {
    const recipients = attended.filter((r: any) => selected[r.id]).map((r: any) => ({
      name: r.student_name, email: r.student_email,
    }));
    if (!recipients.length) return toast({ title: 'No recipients selected', variant: 'destructive' });
    setIssuing(true);
    const { data, error } = await supabase.functions.invoke('issue-certificates', {
      body: { event_id: eventId, certificate_type: certType, recipients },
    });
    setIssuing(false);
    if (error) return toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    toast({ title: 'Certificates issued', description: `${data?.issued ?? recipients.length} processed. ${data?.emailed ?? 0} emailed.` });
    setSelected({});
    qc.invalidateQueries({ queryKey: ['certs-issued', eventId] });
  };

  const downloadCert = async (path: string) => {
    const { data } = await supabase.storage.from('certificates').createSignedUrl(path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };

  return (
    <DashboardLayout requiredRole={['club_admin', 'admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
            <Award className="w-8 h-8 text-primary" /> Certificates
          </h1>
          <p className="text-muted-foreground">Generate and email certificates to attendees.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Issue certificates</CardTitle>
            <CardDescription>Only attendees (marked in Registrations) are eligible.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select value={eventId} onValueChange={(v) => { setEventId(v); setSelected({}); }}>
                <SelectTrigger><SelectValue placeholder="Pick an event" /></SelectTrigger>
                <SelectContent>
                  {events.map((e: any) => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={certType} onValueChange={(v) => setCertType(v as CertType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general_proficiency">General Proficiency</SelectItem>
                  <SelectItem value="community_service">Community Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border">
              <div className="flex items-center gap-3 p-3 border-b bg-muted/30">
                <Checkbox checked={all} onCheckedChange={toggleAll} />
                <span className="text-sm font-medium">Select all attendees</span>
                <Badge variant="secondary" className="ml-auto">{attended.length} eligible</Badge>
              </div>
              {attended.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">No attendees yet. Mark attendance under Registrations.</p>
              ) : (
                <div className="divide-y">
                  {attended.map((r: any) => (
                    <label key={r.id} className="flex items-center gap-3 p-3 hover:bg-muted/30 cursor-pointer">
                      <Checkbox checked={!!selected[r.id]} onCheckedChange={(c) => setSelected({ ...selected, [r.id]: !!c })} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{r.student_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.student_email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={issue} disabled={issuing || !eventId} className="btn-gradient">
              {issuing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</> : <><Mail className="w-4 h-4 mr-2" />Generate & Send</>}
            </Button>
          </CardContent>
        </Card>

        {issued.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Previously issued</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {issued.map((c: any) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.recipient_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.recipient_email} · {c.certificate_type.replace('_', ' ')}</p>
                    </div>
                    <Badge variant={c.status === 'sent' ? 'default' : c.status === 'failed' ? 'destructive' : 'secondary'}>{c.status}</Badge>
                    {c.certificate_path && (
                      <Button size="sm" variant="outline" onClick={() => downloadCert(c.certificate_path)}>
                        <ExternalLink className="w-3 h-3 mr-1" />View
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
