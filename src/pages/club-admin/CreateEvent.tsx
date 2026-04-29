import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Users, FileText, Loader2, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { EventType } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useMyClub } from '@/hooks/useClubs';
import { supabase } from '@/integrations/supabase/client';

const eventTypes: { value: EventType; label: string }[] = [
  { value: 'workshop', label: 'Workshop' }, { value: 'fest', label: 'Fest' },
  { value: 'competition', label: 'Competition' }, { value: 'seminar', label: 'Seminar' },
  { value: 'cultural', label: 'Cultural' }, { value: 'sports', label: 'Sports' },
  { value: 'tech', label: 'Tech' }, { value: 'other', label: 'Other' },
];

export default function CreateEvent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { data: club } = useMyClub(user?.id);
  const [isLoading, setIsLoading] = useState(false);
  const [poster, setPoster] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '', description: '', date: '', time: '', venue: '',
    registrationDeadline: '', eventType: '' as EventType, maxParticipants: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!club) {
      toast({ title: 'No club linked', description: 'You must be linked to an approved club to create events.', variant: 'destructive' });
      return;
    }
    if (!formData.eventType) return toast({ title: 'Select an event type', variant: 'destructive' });

    setIsLoading(true);
    try {
      let poster_url: string | null = null;
      if (poster) {
        const path = `${club.id}/${Date.now()}-${poster.name}`;
        const { error: upErr } = await supabase.storage.from('event-posters').upload(path, poster);
        if (upErr) throw upErr;
        poster_url = supabase.storage.from('event-posters').getPublicUrl(path).data.publicUrl;
      }

      const { error } = await supabase.from('events').insert({
        club_id: club.id,
        name: formData.name,
        description: formData.description,
        event_date: formData.date,
        event_time: formData.time,
        venue: formData.venue,
        registration_deadline: new Date(formData.registrationDeadline).toISOString(),
        event_type: formData.eventType,
        max_participants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        poster_url,
        created_by: user?.id,
        status: 'pending',
      });
      if (error) throw error;

      toast({ title: 'Event submitted!', description: 'Your event was submitted for admin approval.' });
      navigate('/club-admin');
    } catch (err: any) {
      toast({ title: 'Failed to create event', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout requiredRole="club_admin">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Create New Event</h1>
          <p className="text-muted-foreground">Fill in the details below. Your event will be submitted for admin approval.</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Event Details</CardTitle><CardDescription>Provide comprehensive information.</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2"><FileText className="w-4 h-4" />Event Name</Label>
                <Input id="name" maxLength={150} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={4} maxLength={2000} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select value={formData.eventType} onValueChange={(v: EventType) => setFormData({ ...formData, eventType: v })}>
                  <SelectTrigger><SelectValue placeholder="Select event type" /></SelectTrigger>
                  <SelectContent>{eventTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2"><Calendar className="w-4 h-4" />Event Date</Label>
                  <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center gap-2"><Clock className="w-4 h-4" />Event Time</Label>
                  <Input id="time" type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue" className="flex items-center gap-2"><MapPin className="w-4 h-4" />Venue</Label>
                <Input id="venue" maxLength={200} value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Registration Deadline</Label>
                  <Input id="deadline" type="date" value={formData.registrationDeadline} onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants" className="flex items-center gap-2"><Users className="w-4 h-4" />Max Participants (optional)</Label>
                  <Input id="maxParticipants" type="number" min={1} value={formData.maxParticipants} onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="poster" className="flex items-center gap-2"><ImageIcon className="w-4 h-4" />Event Poster (optional)</Label>
                <Input id="poster" type="file" accept="image/*" onChange={(e) => setPoster(e.target.files?.[0] || null)} />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/club-admin')}>Cancel</Button>
                <Button type="submit" className="flex-1 btn-gradient" disabled={isLoading}>
                  {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>) : 'Create Event'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
