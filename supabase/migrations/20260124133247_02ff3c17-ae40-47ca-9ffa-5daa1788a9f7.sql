-- Add iframe support to categories
ALTER TABLE public.categories 
ADD COLUMN iframe_url text DEFAULT NULL,
ADD COLUMN iframe_refresh_interval integer DEFAULT NULL;

-- Add constraint for refresh interval range (1-3600 seconds)
ALTER TABLE public.categories 
ADD CONSTRAINT categories_iframe_refresh_interval_check 
CHECK (iframe_refresh_interval IS NULL OR (iframe_refresh_interval >= 1 AND iframe_refresh_interval <= 3600));