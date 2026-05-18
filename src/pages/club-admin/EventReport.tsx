import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useEvent } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Loader2, Upload, X } from 'lucide-react';

export default function EventReport() {
  const { eventId } = useParams();
  const { data: event } = useEvent(eventId);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [form, setForm] = useState({ summary: '', attendance: 0, rating: 0, expenses: 0 });
  const [photos, setPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (event) {
      setForm({
        summary: event.report_summary || '',
        attendance: event.report_attendance || 0,
        rating: event.report_feedback_rating || 0,
        expenses: event.report_expenses || 0,
      });
    }
  }, [event]);

  useEffect(() => {
    if (!eventId) return;
    supabase.from('event_photos').select('*').eq('event_id', eventId).then(({ data }) => setExistingPhotos(data || []));
  }, [eventId]);

  const removePhoto = async (id: string, url: string) => {
    const path = url.split('/event-photos/')[1];
    if (path) await supabase.storage.from('event-photos').remove([path]);
    await supabase.from('event_photos').delete().eq('id', id);
    setExistingPhotos(p => p.filter(x => x.id !== id));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    setSaving(true);

    // Upload new photos
    for (const file of photos) {
      const path = `${eventId}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from('event-photos').upload(path, file);
      if (upErr) continue;
      const { data: pub } = supabase.storage.from('event-photos').getPublicUrl(path);
      await supabase.from('event_photos').insert({ event_id: eventId, photo_url: pub.publicUrl });
    }

    const { error } = await supabase.from('events').update({
      report_summary: form.summary,
      report_attendance: form.attendance,
      report_feedback_rating: form.rating,
      report_expenses: form.expenses,
      report_submitted_at: new Date().toISOString(),
      status: 'completed',
    }).eq('id', eventId);

    setSaving(false);
    if (error) return toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    toast({ title: 'Report submitted' });
    navigate('/club-admin');
  };

  return (
    <DashboardLayout requiredRole={['club_admin', 'admin']}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" /> Event Report
          </h1>
          <p className="text-muted-foreground">{event?.name}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Post-event report</CardTitle>
            <CardDescription>Summarise the event, upload photos, and record feedback.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label>Summary *</Label>
                <Textarea rows={5} required value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="What happened, highlights, outcomes…" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Attendance</Label>
                  <Input type="number" min={0} value={form.attendance} onChange={(e) => setForm({ ...form, attendance: +e.target.value })} />
                </div>
                <div>
                  <Label>Feedback rating (0–5)</Label>
                  <Input type="number" step="0.1" min={0} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: +e.target.value })} />
                </div>
                <div>
                  <Label>Expenses (₹)</Label>
                  <Input type="number" min={0} value={form.expenses} onChange={(e) => setForm({ ...form, expenses: +e.target.value })} />
                </div>
              </div>

              <div>
                <Label>Photos</Label>
                <Input type="file" accept="image/*" multiple onChange={(e) => setPhotos(Array.from(e.target.files || []))} />
                {photos.length > 0 && <p className="text-xs text-muted-foreground mt-1">{photos.length} new photo(s) ready to upload</p>}
                {existingPhotos.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-3">
                    {existingPhotos.map(p => (
                      <div key={p.id} className="relative group">
                        <img src={p.photo_url} className="aspect-square object-cover rounded-md w-full" />
                        <button type="button" onClick={() => removePhoto(p.id, p.photo_url)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" disabled={saving} className="btn-gradient w-full">
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : <><Upload className="w-4 h-4 mr-2" />Submit Report</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
