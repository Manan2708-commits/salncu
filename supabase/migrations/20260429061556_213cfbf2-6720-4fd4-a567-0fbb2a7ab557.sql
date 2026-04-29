
-- ========== ENUMS ==========
CREATE TYPE public.app_role AS ENUM ('admin', 'club_admin', 'student');
CREATE TYPE public.club_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.event_status AS ENUM ('pending', 'approved', 'rejected', 'upcoming', 'ongoing', 'completed', 'cancelled');
CREATE TYPE public.event_type AS ENUM ('workshop', 'fest', 'competition', 'seminar', 'cultural', 'sports', 'tech', 'other');
CREATE TYPE public.registration_status AS ENUM ('confirmed', 'cancelled', 'waitlist', 'attended');
CREATE TYPE public.certificate_type AS ENUM ('community_service', 'general_proficiency');
CREATE TYPE public.certificate_status AS ENUM ('pending', 'generated', 'sent', 'failed');

-- ========== PROFILES ==========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ========== USER ROLES ==========
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer fn
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS SETOF public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
$$;

-- ========== CLUBS ==========
CREATE TABLE public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  logo_url TEXT,
  coordinator_name TEXT NOT NULL,
  coordinator_email TEXT NOT NULL,
  coordinator_phone TEXT,
  status public.club_status NOT NULL DEFAULT 'pending',
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

-- ========== EVENTS ==========
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL,
  venue TEXT NOT NULL,
  registration_deadline TIMESTAMPTZ NOT NULL,
  event_type public.event_type NOT NULL DEFAULT 'other',
  status public.event_status NOT NULL DEFAULT 'pending',
  poster_url TEXT,
  max_participants INTEGER,
  -- Report fields (filled after the event)
  report_summary TEXT,
  report_attendance INTEGER,
  report_feedback_rating NUMERIC(3,2),
  report_expenses NUMERIC(10,2),
  report_submitted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- ========== EVENT PHOTOS ==========
CREATE TABLE public.event_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;

-- ========== REGISTRATIONS ==========
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  status public.registration_status NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, student_id)
);
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- ========== CERTIFICATE TEMPLATES ==========
CREATE TABLE public.certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_type public.certificate_type NOT NULL UNIQUE,
  template_path TEXT NOT NULL,         -- storage path in certificate-templates bucket
  name_x INTEGER NOT NULL DEFAULT 300, -- coordinates for overlay
  name_y INTEGER NOT NULL DEFAULT 300,
  event_x INTEGER NOT NULL DEFAULT 300,
  event_y INTEGER NOT NULL DEFAULT 250,
  date_x INTEGER NOT NULL DEFAULT 300,
  date_y INTEGER NOT NULL DEFAULT 200,
  font_size INTEGER NOT NULL DEFAULT 36,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

-- ========== CERTIFICATES ISSUED ==========
CREATE TABLE public.certificates_issued (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  certificate_type public.certificate_type NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  certificate_path TEXT,                  -- storage path in 'certificates' bucket
  status public.certificate_status NOT NULL DEFAULT 'pending',
  error_message TEXT,
  issued_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);
ALTER TABLE public.certificates_issued ENABLE ROW LEVEL SECURITY;

-- ========== TRIGGERS ==========
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_clubs_updated BEFORE UPDATE ON public.clubs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_events_updated BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_cert_templates_updated BEFORE UPDATE ON public.certificate_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto profile + student role on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  -- Default everyone gets 'student' role; admins assign other roles later
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========== RLS POLICIES ==========

-- profiles
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "roles_select_own_or_admin" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "roles_admin_manage" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- clubs
CREATE POLICY "clubs_select_approved_or_owner_or_admin" ON public.clubs
  FOR SELECT TO authenticated
  USING (
    status = 'approved'
    OR admin_user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "clubs_insert_authenticated" ON public.clubs
  FOR INSERT TO authenticated
  WITH CHECK (admin_user_id = auth.uid());
CREATE POLICY "clubs_update_owner_or_admin" ON public.clubs
  FOR UPDATE TO authenticated
  USING (admin_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "clubs_delete_admin" ON public.clubs
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- events
CREATE POLICY "events_select_visible" ON public.events
  FOR SELECT TO authenticated
  USING (
    status IN ('approved','upcoming','ongoing','completed')
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = club_id AND c.admin_user_id = auth.uid())
  );
CREATE POLICY "events_insert_club_admin" ON public.events
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = club_id AND c.admin_user_id = auth.uid() AND c.status = 'approved')
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "events_update_club_admin_or_admin" ON public.events
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = club_id AND c.admin_user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "events_delete_admin" ON public.events
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- event_photos
CREATE POLICY "photos_select_all_authenticated" ON public.event_photos
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "photos_insert_club_admin" ON public.event_photos
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events e JOIN public.clubs c ON c.id = e.club_id
      WHERE e.id = event_id AND (c.admin_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );
CREATE POLICY "photos_delete_club_admin" ON public.event_photos
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e JOIN public.clubs c ON c.id = e.club_id
      WHERE e.id = event_id AND (c.admin_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

-- registrations
CREATE POLICY "regs_select_self_or_event_owner_or_admin" ON public.registrations
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.events e JOIN public.clubs c ON c.id = e.club_id
      WHERE e.id = event_id AND c.admin_user_id = auth.uid()
    )
  );
CREATE POLICY "regs_insert_self" ON public.registrations
  FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "regs_update_self_or_owner" ON public.registrations
  FOR UPDATE TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.events e JOIN public.clubs c ON c.id = e.club_id
      WHERE e.id = event_id AND c.admin_user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "regs_delete_self_or_admin" ON public.registrations
  FOR DELETE TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- certificate_templates
CREATE POLICY "cert_tpl_select_admin_or_clubadmin" ON public.certificate_templates
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'club_admin'));
CREATE POLICY "cert_tpl_admin_all" ON public.certificate_templates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- certificates_issued
CREATE POLICY "cert_select_recipient_or_issuer_or_admin" ON public.certificates_issued
  FOR SELECT TO authenticated
  USING (
    issued_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR recipient_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );
CREATE POLICY "cert_insert_clubadmin_or_admin" ON public.certificates_issued
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'club_admin'));
CREATE POLICY "cert_update_issuer_or_admin" ON public.certificates_issued
  FOR UPDATE TO authenticated
  USING (issued_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ========== STORAGE BUCKETS ==========
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('event-posters', 'event-posters', true),
  ('event-photos', 'event-photos', true),
  ('club-logos', 'club-logos', true),
  ('certificate-templates', 'certificate-templates', false),
  ('certificates', 'certificates', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (public buckets: read open, write authenticated)
CREATE POLICY "public_buckets_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id IN ('event-posters','event-photos','club-logos'));

CREATE POLICY "public_buckets_write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('event-posters','event-photos','club-logos'));

CREATE POLICY "public_buckets_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id IN ('event-posters','event-photos','club-logos'));

CREATE POLICY "public_buckets_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id IN ('event-posters','event-photos','club-logos'));

-- certificate-templates: admin only
CREATE POLICY "cert_tpl_admin_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'certificate-templates' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'club_admin')));
CREATE POLICY "cert_tpl_admin_write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'certificate-templates' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "cert_tpl_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'certificate-templates' AND public.has_role(auth.uid(),'admin'));

-- certificates: club_admin/admin write, recipients/admins read
CREATE POLICY "certs_read_admin_clubadmin" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'certificates' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'club_admin')));
CREATE POLICY "certs_write_admin_clubadmin" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'certificates' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'club_admin')));
