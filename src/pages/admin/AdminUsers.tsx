import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useMemo, useState } from 'react';
import type { Role } from '@/stores/authStore';
import { useClubs } from '@/hooks/useClubs';
import { Users, Search, Phone } from 'lucide-react';

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  roles: Role[];
  club_id?: string | null;
};

export default function AdminUsers() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const { data: clubs = [] } = useClubs({ status: ['approved', 'pending'] });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<UserRow[]> => {
      const [{ data: profiles }, { data: roles }, { data: managed }] = await Promise.all([
        supabase.from('profiles').select('id, name, email, phone').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('user_id, role'),
        supabase.from('clubs').select('id, admin_user_id'),
      ]);
      const rolesMap: Record<string, Role[]> = {};
      (roles || []).forEach((r: any) => {
        rolesMap[r.user_id] = [...(rolesMap[r.user_id] || []), r.role];
      });
      const clubMap: Record<string, string> = {};
      (managed || []).forEach((c: any) => { if (c.admin_user_id) clubMap[c.admin_user_id] = c.id; });
      return (profiles || []).map((p: any) => ({
        id: p.id, name: p.name, email: p.email, phone: p.phone || null,
        roles: rolesMap[p.id] || [],
        club_id: clubMap[p.id] || null,
      }));
    },
  });

  const filtered = useMemo(() => users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.phone || '').includes(search)
  ), [users, search]);

  const setRole = async (userId: string, role: Role) => {
    // Prevent changing your own role
    const { data: { user: me } } = await supabase.auth.getUser();
    if (me?.id === userId) {
      return toast({ title: 'Cannot change your own role', variant: 'destructive' });
    }
    // Remove old roles, add new one
    const { error: delErr } = await supabase.from('user_roles').delete().eq('user_id', userId);
    if (delErr) return toast({ title: 'Failed', description: delErr.message, variant: 'destructive' });
    const { error } = await supabase.from('user_roles').insert({ user_id: userId, role });
    if (error) return toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    toast({ title: 'Role updated' });
    qc.invalidateQueries({ queryKey: ['admin-users'] });
  };

  const assignClub = async (userId: string, clubId: string) => {
    // Unassign from any other club first
    await supabase.from('clubs').update({ admin_user_id: null }).eq('admin_user_id', userId);
    if (clubId !== 'none') {
      const { error } = await supabase.from('clubs').update({ admin_user_id: userId }).eq('id', clubId);
      if (error) return toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    }
    toast({ title: 'Club assignment updated' });
    qc.invalidateQueries({ queryKey: ['admin-users'] });
    qc.invalidateQueries({ queryKey: ['clubs'] });
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" /> User Management
          </h1>
          <p className="text-muted-foreground">Assign roles and link club admins to clubs.</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />
              <Badge variant="secondary" className="ml-auto">{filtered.length} users</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <p className="text-muted-foreground">Loading…</p> : (
              <div className="space-y-3">
                {filtered.map(u => {
                  const role = u.roles[0] || 'student';
                  return (
                    <div key={u.id} className="flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-lg border bg-card">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{u.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                        {u.phone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />{u.phone}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={role} onValueChange={(v) => setRole(u.id, v as Role)}>
                          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="club_admin">Club Admin</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        {role === 'club_admin' && (
                          <Select value={u.club_id || 'none'} onValueChange={(v) => assignClub(u.id, v)}>
                            <SelectTrigger className="w-[220px]"><SelectValue placeholder="Assign club" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">— No club —</SelectItem>
                              {clubs.map((c: any) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
