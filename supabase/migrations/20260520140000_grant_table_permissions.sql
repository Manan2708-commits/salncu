-- Grant table-level SELECT to anon (required alongside RLS policies)
GRANT SELECT ON public.clubs TO anon;
GRANT SELECT ON public.events TO anon;

-- Grant full access to authenticated users (RLS policies enforce row-level security)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
