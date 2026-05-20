import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ClubRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ClubRegistrationRequest {
  id: string;
  user_id: string;
  club_name: string;
  club_description: string;
  club_logo_url?: string | null;
  coordinator_name: string;
  coordinator_email: string;
  coordinator_phone?: string | null;
  status: ClubRequestStatus;
  admin_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  // joined
  profile?: { name: string; email: string } | null;
}

export function useClubs(filters?: { status?: ('pending' | 'approved' | 'rejected')[] }) {
  return useQuery({
    queryKey: ['clubs', filters],
    queryFn: async () => {
      let q = supabase.from('clubs').select('*').order('name');
      if (filters?.status?.length) q = q.in('status', filters.status);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useMyClub(userId: string | undefined) {
  return useQuery({
    queryKey: ['my-club', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('admin_user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useApproveClub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { clubId: string; approve: boolean }) => {
      const { error } = await supabase
        .from('clubs')
        .update({ status: args.approve ? 'approved' : 'rejected' })
        .eq('id', args.clubId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clubs'] }),
  });
}

export function useClubRequests(filters?: { status?: ClubRequestStatus[] }) {
  return useQuery({
    queryKey: ['club-requests', filters],
    queryFn: async () => {
      const { data: requests, error } = await supabase
        .from('club_registration_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch profiles for each request
      const userIds = [...new Set((requests || []).map((r: any) => r.user_id))];
      let profileMap: Record<string, { name: string; email: string }> = {};
      if (userIds.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', userIds);
        (profiles || []).forEach((p: any) => { profileMap[p.id] = { name: p.name, email: p.email }; });
      }

      const result = (requests || []).map((r: any) => ({ ...r, profile: profileMap[r.user_id] || null }));
      if (filters?.status?.length) return result.filter((r: any) => filters.status!.includes(r.status));
      return result as ClubRegistrationRequest[];
    },
  });
}

export function useSubmitClubRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      user_id: string;
      club_name: string;
      club_description: string;
      coordinator_name: string;
      coordinator_email: string;
      coordinator_phone?: string;
      club_logo_url?: string;
    }) => {
      const { error } = await supabase.from('club_registration_requests').insert(data);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['club-requests'] }),
  });
}

export function useApproveClubRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { requestId: string; adminId: string; notes?: string }) => {
      const { error } = await supabase.rpc('approve_club_request', {
        _request_id: args.requestId,
        _admin_id: args.adminId,
        _admin_notes: args.notes ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['club-requests'] });
      qc.invalidateQueries({ queryKey: ['clubs'] });
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useRejectClubRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { requestId: string; adminId: string; notes?: string }) => {
      const { error } = await supabase.rpc('reject_club_request', {
        _request_id: args.requestId,
        _admin_id: args.adminId,
        _admin_notes: args.notes ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['club-requests'] }),
  });
}
