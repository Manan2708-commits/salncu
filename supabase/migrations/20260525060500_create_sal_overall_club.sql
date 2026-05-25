INSERT INTO public.clubs (
  name,
  description,
  coordinator_name,
  coordinator_email,
  coordinator_phone,
  status,
  member_count
)
SELECT
  'Student Activities & Leadership Cell',
  'Overall SAL events conducted by the Student Activities & Leadership Cell.',
  'Student Activities & Leadership Cell',
  'sal@ncuindia.edu',
  NULL,
  'approved',
  0
WHERE NOT EXISTS (
  SELECT 1 FROM public.clubs WHERE name = 'Student Activities & Leadership Cell'
);
