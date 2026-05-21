import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useClubs } from '@/hooks/useClubs';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Search, Pencil, Trash2, Loader2, Building2, Users, Mail } from 'lucide-react';

export default function AdminManageClubs() {
  const { data: clubs = [], isLoading } = useClubs();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = clubs.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.coordinator_email.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (club: any) => setEditing({ ...club });

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase.from('clubs').update({
      name: editing.name,
      description: editing.description,
      coordinator_name: editing.coordinator_name,
      coordinator_email: editing.coordinator_email,
      coordinator_phone: editing.coordinator_phone,
      status: editing.status,
    }).eq('id', editing.id);
    setSaving(false);
    if (error) return toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    toast({ title: 'Club updated' });
    qc.invalidateQueries({ queryKey: ['clubs'] });
    setEditing(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will also delete all its events.`)) return;
    setDeleting(id);
    const { error } = await supabase.from('clubs').delete().eq('id', id);
    setDeleting(null);
    if (error) return toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    toast({ title: 'Club deleted' });
    qc.invalidateQueries({ queryKey: ['clubs'] });
  };

  const statusColor: Record<string, string> = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1 flex items-center gap-3">
            <Building2 className="w-7 h-7 text-primary" /> Manage Clubs
          </h1>
          <p className="text-muted-foreground">View, edit and delete all clubs on the platform.</p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search clubs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((club: any) => (
              <Card key={club.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">{club.name}</CardTitle>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColor[club.status]}`}>
                      {club.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground line-clamp-2">{club.description}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" /> {club.member_count || 0} members
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" /> {club.coordinator_email}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(club)}>
                      <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => handleDelete(club.id, club.name)} disabled={deleting === club.id}>
                      {deleting === club.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Club</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <Label>Club Name</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Coordinator Name</Label>
                  <Input value={editing.coordinator_name} onChange={(e) => setEditing({ ...editing, coordinator_name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Coordinator Email</Label>
                  <Input value={editing.coordinator_email} onChange={(e) => setEditing({ ...editing, coordinator_email: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={editing.coordinator_phone || ''} onChange={(e) => setEditing({ ...editing, coordinator_phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
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
