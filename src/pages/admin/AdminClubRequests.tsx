import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useClubRequests, useApproveClubRequest, useRejectClubRequest, type ClubRegistrationRequest } from '@/hooks/useClubs';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { Building2, User, Mail, Phone, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function AdminClubRequests() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { data: requests = [], isLoading } = useClubRequests();
  const approve = useApproveClubRequest();
  const reject = useRejectClubRequest();

  const [selected, setSelected] = useState<ClubRegistrationRequest | null>(null);
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const pending = requests.filter((r) => r.status === 'pending');
  const reviewed = requests.filter((r) => r.status !== 'pending');

  const openDialog = (req: ClubRegistrationRequest, act: 'approve' | 'reject') => {
    setSelected(req);
    setAction(act);
    setNotes('');
  };

  const handleConfirm = async () => {
    if (!selected || !action || !user) return;
    try {
      if (action === 'approve') {
        await approve.mutateAsync({ requestId: selected.id, adminId: user.id, notes });
        toast({ title: 'Club approved', description: `${selected.club_name} is now live and the user has club_admin access.` });
      } else {
        await reject.mutateAsync({ requestId: selected.id, adminId: user.id, notes });
        toast({ title: 'Request rejected' });
      }
      setSelected(null);
    } catch (err: any) {
      toast({ title: 'Failed', description: err.message, variant: 'destructive' });
    }
  };

  const isBusy = approve.isPending || reject.isPending;

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Club Registration Requests</h1>
          <p className="text-muted-foreground">Review and approve or reject club registration requests from users.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" /> Pending ({pending.length})
              </h2>
              {pending.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4">No pending requests.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {pending.map((req) => <RequestCard key={req.id} req={req} onApprove={() => openDialog(req, 'approve')} onReject={() => openDialog(req, 'reject')} />)}
                </div>
              )}
            </section>

            {reviewed.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-3">Reviewed ({reviewed.length})</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {reviewed.map((req) => <RequestCard key={req.id} req={req} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action === 'approve' ? 'Approve' : 'Reject'} Club Request</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <p><span className="font-medium">Club:</span> {selected.club_name}</p>
              <p><span className="font-medium">Submitted by:</span> {selected.profile?.name} ({selected.profile?.email})</p>
              {action === 'approve' && (
                <p className="text-muted-foreground text-xs bg-muted p-2 rounded">
                  This will create the club, grant the user club_admin access, and link them to the club.
                </p>
              )}
              <div className="space-y-1">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Add a note for the user..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)} disabled={isBusy}>Cancel</Button>
            <Button
              onClick={handleConfirm}
              disabled={isBusy}
              className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-destructive hover:bg-destructive/90'}
            >
              {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function RequestCard({
  req,
  onApprove,
  onReject,
}: {
  req: ClubRegistrationRequest;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary shrink-0" />
            {req.club_name}
          </CardTitle>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[req.status]}`}>
            {req.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground line-clamp-2">{req.club_description}</p>

        <div className="space-y-1 text-xs text-muted-foreground">
          <p className="flex items-center gap-1"><User className="w-3 h-3" /> Coordinator: {req.coordinator_name}</p>
          <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> {req.coordinator_email}</p>
          {req.coordinator_phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {req.coordinator_phone}</p>}
        </div>

        {req.profile && (
          <div className="border-t pt-2 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-0.5">Submitted by</p>
            <p>{req.profile.name} — {req.profile.email}</p>
          </div>
        )}

        {req.admin_notes && (
          <p className="text-xs italic text-muted-foreground border-t pt-2">Note: {req.admin_notes}</p>
        )}

        {req.status === 'pending' && onApprove && onReject && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={onReject}>
              <XCircle className="w-3 h-3 mr-1" /> Reject
            </Button>
            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={onApprove}>
              <CheckCircle className="w-3 h-3 mr-1" /> Approve
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
