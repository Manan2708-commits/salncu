-- Allow anonymous (logged-out) users to read public events and clubs

CREATE POLICY "events_select_public" ON public.events
  FOR SELECT TO anon
  USING (status IN ('approved', 'upcoming', 'ongoing', 'completed'));

CREATE POLICY "clubs_select_public" ON public.clubs
  FOR SELECT TO anon
  USING (status = 'approved');
