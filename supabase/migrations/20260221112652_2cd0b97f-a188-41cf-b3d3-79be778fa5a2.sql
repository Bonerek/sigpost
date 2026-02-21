
-- Add share columns to pages table
ALTER TABLE public.pages ADD COLUMN share_enabled boolean DEFAULT false;
ALTER TABLE public.pages ADD COLUMN share_token text;

-- Migrate existing share data from user_settings to first page of each user
UPDATE public.pages p
SET share_enabled = us.share_enabled,
    share_token = us.share_token
FROM public.user_settings us
WHERE p.user_id = us.user_id
  AND us.share_enabled = true
  AND us.share_token IS NOT NULL
  AND p.position = 0;

-- Update the validate_share_token function to return page id instead of user_id
CREATE OR REPLACE FUNCTION public.validate_share_token(token_value text)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id
  FROM public.pages
  WHERE share_token = token_value
    AND share_enabled = true
    AND share_token IS NOT NULL
  LIMIT 1
$function$;

-- Update RLS for pages to allow public read with share token on the page itself
DROP POLICY IF EXISTS "Allow public read access to shared pages" ON public.pages;
CREATE POLICY "Allow public read access to shared pages" ON public.pages
  FOR SELECT
  USING (share_enabled = true AND share_token IS NOT NULL);
