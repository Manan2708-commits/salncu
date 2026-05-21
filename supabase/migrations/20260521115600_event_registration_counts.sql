CREATE OR REPLACE FUNCTION public.get_event_registration_counts(_event_ids UUID[])
RETURNS TABLE(event_id UUID, registration_count BIGINT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.event_id, COUNT(*)::BIGINT AS registration_count
  FROM public.registrations r
  WHERE r.event_id = ANY(_event_ids)
    AND r.status <> 'cancelled'
  GROUP BY r.event_id
$$;

GRANT EXECUTE ON FUNCTION public.get_event_registration_counts(UUID[]) TO anon, authenticated;
