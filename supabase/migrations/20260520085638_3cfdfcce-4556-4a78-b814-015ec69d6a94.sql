
-- Restrict club creation to admin or club_admin
DROP POLICY IF EXISTS "clubs_insert_authenticated" ON public.clubs;
CREATE POLICY "clubs_insert_admin_or_clubadmin" ON public.clubs
  FOR INSERT TO authenticated
  WITH CHECK (
    admin_user_id = auth.uid()
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'club_admin'))
  );

-- Tighten public bucket write/update/delete to owner or admin
DROP POLICY IF EXISTS "public_buckets_write" ON storage.objects;
CREATE POLICY "public_buckets_write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('event-posters','event-photos','club-logos')
    AND owner = auth.uid()
  );

DROP POLICY IF EXISTS "public_buckets_update" ON storage.objects;
CREATE POLICY "public_buckets_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id IN ('event-posters','event-photos','club-logos')
    AND (owner = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  );

DROP POLICY IF EXISTS "public_buckets_delete" ON storage.objects;
CREATE POLICY "public_buckets_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id IN ('event-posters','event-photos','club-logos')
    AND (owner = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  );

-- Let certificate recipients read their own certificate PDFs
CREATE POLICY "certs_read_recipient" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'certificates'
    AND EXISTS (
      SELECT 1 FROM public.certificates_issued ci
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE ci.certificate_path = storage.objects.name
        AND ci.recipient_email = p.email
    )
  );

-- Revoke EXECUTE on security definer helpers from public/authenticated;
-- RLS policies invoke them as the owning role regardless.
REVOKE EXECUTE ON FUNCTION public.get_user_roles(uuid) FROM PUBLIC, anon, authenticated;
