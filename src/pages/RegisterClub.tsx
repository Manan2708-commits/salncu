import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { useSubmitClubRequest } from '@/hooks/useClubs';
import { Building2, Loader2, CheckCircle } from 'lucide-react';

export default function RegisterClub() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const submit = useSubmitClubRequest();
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    club_name: '',
    club_description: '',
    coordinator_name: user?.name ?? '',
    coordinator_email: user?.email ?? '',
    coordinator_phone: '',
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await submit.mutateAsync({
        user_id: user.id,
        club_name: form.club_name.trim(),
        club_description: form.club_description.trim(),
        coordinator_name: form.coordinator_name.trim(),
        coordinator_email: form.coordinator_email.trim(),
        coordinator_phone: form.coordinator_phone.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      toast({ title: 'Submission failed', description: err.message, variant: 'destructive' });
    }
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto mt-16 text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="font-display text-2xl font-bold">Request Submitted!</h2>
          <p className="text-muted-foreground">
            Your club registration request has been sent to the admin for review. You'll be notified once it's approved.
          </p>
          <Button asChild variant="outline">
            <Link to="/student">Back to Dashboard</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary" /> Register a Club
          </h1>
          <p className="text-muted-foreground">
            Fill in your club details. An admin will review and approve your request.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Club Details</CardTitle>
            <CardDescription>Tell us about the club you want to create.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="club_name">Club Name *</Label>
                <Input id="club_name" value={form.club_name} onChange={set('club_name')} required maxLength={100} placeholder="e.g. Robotics Club" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="club_description">Description *</Label>
                <Textarea id="club_description" value={form.club_description} onChange={set('club_description')} required maxLength={1000} rows={4} placeholder="What does your club do?" />
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3 text-muted-foreground">Coordinator Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coordinator_name">Coordinator Name *</Label>
                    <Input id="coordinator_name" value={form.coordinator_name} onChange={set('coordinator_name')} required maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coordinator_email">Coordinator Email *</Label>
                    <Input id="coordinator_email" type="email" value={form.coordinator_email} onChange={set('coordinator_email')} required maxLength={255} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="coordinator_phone">Phone (optional)</Label>
                    <Input id="coordinator_phone" value={form.coordinator_phone} onChange={set('coordinator_phone')} maxLength={20} placeholder="+1 234 567 8900" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" className="btn-gradient" disabled={submit.isPending}>
                  {submit.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : 'Submit Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
