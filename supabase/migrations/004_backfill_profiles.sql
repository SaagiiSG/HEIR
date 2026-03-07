-- Backfill profiles for any auth.users that don't have a profile row
-- (e.g. users created before the signup trigger was fixed).
-- Safe to run multiple times (ON CONFLICT DO NOTHING).

INSERT INTO public.profiles (id, first_name, last_name, role)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'first_name', u.raw_user_meta_data->>'given_name', ''),
  COALESCE(u.raw_user_meta_data->>'last_name', u.raw_user_meta_data->>'family_name', ''),
  'customer'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;
