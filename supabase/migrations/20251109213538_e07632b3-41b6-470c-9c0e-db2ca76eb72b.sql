-- Add share_token column to user_settings for public sharing
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS share_enabled BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_share_token ON public.user_settings(share_token) WHERE share_token IS NOT NULL;

-- Add RLS policy to allow public read access for shared profiles
CREATE POLICY "Allow public read access to shared settings"
ON public.user_settings
FOR SELECT
USING (share_enabled = true AND share_token IS NOT NULL);

-- Add RLS policy to allow public read access to categories for shared profiles
CREATE POLICY "Allow public read access to shared categories"
ON public.categories
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_settings
    WHERE user_settings.user_id = categories.user_id
    AND user_settings.share_enabled = true
    AND user_settings.share_token IS NOT NULL
  )
);

-- Add RLS policy to allow public read access to links for shared profiles
CREATE POLICY "Allow public read access to shared links"
ON public.links
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.categories
    JOIN public.user_settings ON user_settings.user_id = categories.user_id
    WHERE categories.id = links.category_id
    AND user_settings.share_enabled = true
    AND user_settings.share_token IS NOT NULL
  )
);