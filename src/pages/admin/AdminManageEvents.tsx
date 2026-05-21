import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useEvents } from '@/hooks/useEvents';
import { useClubs } from '@/hooks/useClubs';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Search, Pencil, Trash2, Loader2, Calendar, MapPin, Clock } from 'lucide-react';
import type { EventStatus, EventType } from '@/types';

const EVENT_TYPES: EventType[] = ['workshop', 'fest', 'competition', 'seminar', 'cultural', 'sports', 'tech', 'other'];
const EVENT_STATUSES: EventStatus[] = ['pending', 'approved', 'upcoming', 'ongoing', 'completed', 'cancelled', 'rejected'];

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  upcoming: 'bg-green-100 text-green-700',
  ongoing: 'bg-purple-100 text-purple-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function AdminManageEvents() {
  const { data: events = [], isLoading } = useEvents();
  const { data: clubs = [] } = useClubs({ status: ['approved'] });
  const qc = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [filterClub, setFilterClub] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const clubOptions = useMemo(() =>
    [...clubs].sort((a: any, b: any) => a.name.localeCompare(b.name)), [clubs]);

  const filtered = useMemo(() => events.filter((e: any) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.club?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchClub = filterClub === 'all' || e.club_id === filterClub;
    const matchStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchSearch && matchClub && matchStatus;
  }), [events, search, filterClub, filterStatus]);

  const openEdit = (event: any) => setEditing({
    ...event,
    event_date: event.event_date?.slice(0, 10) || '',
  });

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase.from('events').update({
      name: editing.name,
      description: editing.description,
      event_date: editing.event_date,
      event_time: editing.event_time,
      venue: editing.venue,
      event_type: editing.event_type,
      status: editing.status,
      max_participants: editing.max_participants || null,
    }).eq('id', editing.id);
    setSaving(false);
    if (error) return toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    toast({ title: 'Event updated' });
    qc.invalidateQueries({ queryKey: ['events'] });
    setEditing(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    setDeleting(id);
    const { error } = await supabase.from('events').delete().eq('id', id);
    setDeleting(null);
    if (error) return toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    toast({ title: 'Event deleted' });
    qc.invalidateQueries({ queryKey: ['events'] });
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1 flex items-center gap-3">
            <Calendar className="w-7 h-7 text-primary" /> Manage Events
          </h1>
          <p className="text-muted-foreground">View, edit and delete all events across every club.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search events or clubs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterClub} onValueChange={setFilterClub}>
            <SelectTrigger className="w-full md:w-56"><SelectValue placeholder="All Clubs" /></SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all">All Clubs</SelectItem>
              {clubOptions.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {EVENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filtered.length}</span> of {events.length} events
        </p>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-3">
            {filtered.map((event: any) => (
              <Card key={event.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold truncate">{event.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[event.status] || 'bg-gray-100 text-gray-600'}`}>
                          {event.status}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {event.event_type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">
                        {event.club?.name || '—'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.event_time}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.venue}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => openEdit(event)}>
                        <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => handleDelete(event.id, event.name)} disabled={deleting === event.id}>
                        {deleting === event.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Event</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <Label>Event Name</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" value={editing.event_date} onChange={(e) => setEditing({ ...editing, event_date: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Time</Label>
                  <Input value={editing.event_time} onChange={(e) => setEditing({ ...editing, event_time: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Venue</Label>
                <Input value={editing.venue} onChange={(e) => setEditing({ ...editing, venue: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Event Type</Label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    value={editing.event_type} onChange={(e) => setEditing({ ...editing, event_type: e.target.value })}>
                    {EVENT_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                    {EVENT_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Max Participants</Label>
                <Input type="number" value={editing.max_participants || ''} placeholder="Unlimited"
                  onChange={(e) => setEditing({ ...editing, max_participants: e.target.value ? parseInt(e.target.value) : null })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="btn-gradient">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
