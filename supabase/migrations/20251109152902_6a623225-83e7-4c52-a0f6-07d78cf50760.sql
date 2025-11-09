-- Drop old foreign keys that point to auth.users
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_user_id_fkey;
ALTER TABLE public.user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;

-- Add new foreign keys pointing to profiles with CASCADE delete
ALTER TABLE public.categories
ADD CONSTRAINT categories_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(user_id)
ON DELETE CASCADE;

ALTER TABLE public.user_settings
ADD CONSTRAINT user_settings_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(user_id)
ON DELETE CASCADE;

-- Create trigger to clean up profiles when auth user is deleted
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete the user's profile (which will cascade to categories, links, and settings)
  DELETE FROM public.profiles WHERE user_id = OLD.id;
  RETURN OLD;
END;
$$;

-- Trigger on auth.users deletion
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_delete();