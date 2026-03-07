-- Fix: handle_new_user trigger must work when only 001 is applied (no ner/ovog/locale).
-- Uses only columns that exist in 001_schema (id, first_name, last_name) and reads
-- first_name/last_name from raw_user_meta_data (email signup) or given_name/family_name (OAuth).
-- Uses public.profiles and search_path so the trigger works in Supabase auth context.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'given_name',
      ''
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'last_name',
      NEW.raw_user_meta_data->>'family_name',
      ''
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
