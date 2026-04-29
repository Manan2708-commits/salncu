import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
