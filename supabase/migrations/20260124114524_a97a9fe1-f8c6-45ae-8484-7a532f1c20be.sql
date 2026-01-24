-- Create a public view for shared settings that excludes sensitive columns
CREATE VIEW public.user_settings_public
WITH (security_invoker = on) AS
SELECT 
  id,
  column_count,
  custom_text,
  share_enabled
FROM public.user_settings
WHERE share_enabled = true AND share_token IS NOT NULL;

-- Drop the old permissive public SELECT policy on user_settings
DROP POLICY IF EXISTS "Allow public read access to shared settings" ON public.user_settings;

-- Create a function to validate share token and return user_id (for backend use only)
CREATE OR REPLACE FUNCTION public.validate_share_token(token_value text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id
  FROM public.user_settings
  WHERE share_token = token_value
    AND share_enabled = true
    AND share_token IS NOT NULL
  LIMIT 1
$$;