-- ========== CLUB REGISTRATION REQUESTS ==========
-- Users who want to become club admins submit a request here.
-- Admin reviews and approves/rejects. On approval, the club is created
-- and the user is granted club_admin role.

CREATE TYPE public.club_request_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.club_registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Submitting user
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Club details
  club_name TEXT NOT NULL,
  club_description TEXT NOT NULL,
  club_logo_url TEXT,
  -- Coordinator details (may differ from the submitting user)
  coordinator_name TEXT NOT NULL,
  coordinator_email TEXT NOT NULL,
  coordinator_phone TEXT,
  -- Admin review
  status public.club_request_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.club_registration_requests ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_club_requests_updated
  BEFORE UPDATE ON public.club_registration_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS: users see their own requests; admins see all
CREATE POLICY "club_req_select_own_or_admin" ON public.club_registration_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Any authenticated user can submit a request
CREATE POLICY "club_req_insert_self" ON public.club_registration_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Only admin can update (approve/reject)
CREATE POLICY "club_req_update_admin" ON public.club_registration_requests
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "club_req_delete_admin" ON public.club_registration_requests
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ========== FUNCTION: approve club request ==========
-- Atomically: creates the club, grants club_admin role, links user, marks request approved.
CREATE OR REPLACE FUNCTION public.approve_club_request(
  _request_id UUID,
  _admin_id UUID,
  _admin_notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _req RECORD;
  _club_id UUID;
BEGIN
  -- Verify caller is admin
  IF NOT public.has_role(_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can approve club requests';
  END IF;

  SELECT * INTO _req FROM public.club_registration_requests WHERE id = _request_id AND status = 'pending';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;

  -- Create the club
  INSERT INTO public.clubs (name, description, coordinator_name, coordinator_email, coordinator_phone, logo_url, status, admin_user_id)
  VALUES (_req.club_name, _req.club_description, _req.coordinator_name, _req.coordinator_email, _req.coordinator_phone, _req.club_logo_url, 'approved', _req.user_id)
  RETURNING id INTO _club_id;

  -- Grant club_admin role (ignore if already exists)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_req.user_id, 'club_admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Mark request approved
  UPDATE public.club_registration_requests
  SET status = 'approved', reviewed_by = _admin_id, reviewed_at = now(), admin_notes = _admin_notes
  WHERE id = _request_id;
END;
$$;

-- Reject function
CREATE OR REPLACE FUNCTION public.reject_club_request(
  _request_id UUID,
  _admin_id UUID,
  _admin_notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can reject club requests';
  END IF;

  UPDATE public.club_registration_requests
  SET status = 'rejected', reviewed_by = _admin_id, reviewed_at = now(), admin_notes = _admin_notes
  WHERE id = _request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;
END;
$$;

-- Grant execute to authenticated users (functions check role internally)
GRANT EXECUTE ON FUNCTION public.approve_club_request(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_club_request(UUID, UUID, TEXT) TO authenticated;
