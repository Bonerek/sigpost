-- Drop old constraint and add new one with 0 as minimum
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_iframe_refresh_interval_check;
ALTER TABLE public.categories ADD CONSTRAINT categories_iframe_refresh_interval_check 
  CHECK (iframe_refresh_interval IS NULL OR (iframe_refresh_interval >= 0 AND iframe_refresh_interval <= 3600));