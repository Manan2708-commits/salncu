import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Event, EventStatus, EventType } from '@/types';

export type EventRow = Event;

const SELECT = `
  id, club_id, name, description, event_date, event_time, venue,
  registration_deadline, event_type, status, poster_url, max_participants,
  report_summary, report_attendance, report_feedback_rating, report_expenses, report_submitted_at,
  club:clubs(name)
`;

export function useEvents(filters?: { status?: EventStatus[]; clubId?: string }) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: async () => {
      let q = supabase.from('events').select(SELECT).order('event_date', { ascending: false });
      if (filters?.status?.length) q = q.in('status', filters.status);
      if (filters?.clubId) q = q.eq('club_id', filters.clubId);
      const { data, error } = await q;
      if (error) throw error;
      // attach registration counts
      const ids = (data || []).map((e: any) => e.id);
      let counts: Record<string, number> = {};
      if (ids.length) {
        const { data: registrationCounts, error: countsError } = await supabase.rpc('get_event_registration_counts', {
          _event_ids: ids,
        });
        if (!countsError) {
          counts = (registrationCounts || []).reduce((acc: Record<string, number>, r: any) => {
            acc[r.event_id] = Number(r.registration_count) || 0;
            return acc;
          }, {});
        } else {
          const { data: regs } = await supabase
            .from('registrations')
            .select('event_id')
            .in('event_id', ids)
            .neq('status', 'cancelled');
          counts = (regs || []).reduce((acc: Record<string, number>, r: any) => {
            acc[r.event_id] = (acc[r.event_id] || 0) + 1;
            return acc;
          }, {});
        }
      }
      return (data || []).map((e: any) => ({ ...e, registration_count: counts[e.id] || 0 }));
    },
  });
}

export function useEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event', eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data, error } = await supabase.from('events').select(SELECT).eq('id', eventId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useMyRegistrations(userId: string | undefined) {
  return useQuery({
    queryKey: ['my-registrations', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select('id, event_id, status, created_at')
        .eq('student_id', userId!);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useRegisterForEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { eventId: string; studentId: string; studentName: string; studentEmail: string }) => {
      const { error } = await supabase.from('registrations').insert({
        event_id: args.eventId,
        student_id: args.studentId,
        student_name: args.studentName,
        student_email: args.studentEmail,
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['my-registrations', vars.studentId] });
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUnregister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (registrationId: string) => {
      const { error } = await supabase.from('registrations').delete().eq('id', registrationId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-registrations'] });
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useEventRegistrations(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event-registrations', eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}
