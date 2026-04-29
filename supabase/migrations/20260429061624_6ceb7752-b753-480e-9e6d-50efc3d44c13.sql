
-- Lock down SECURITY DEFINER functions: revoke from PUBLIC, grant only to authenticated for the ones used in RLS
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_user_roles(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_roles(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;

-- Set explicit search_path on the trigger fn (linter warn 0011)
ALTER FUNCTION public.update_updated_at() SET search_path = public;
