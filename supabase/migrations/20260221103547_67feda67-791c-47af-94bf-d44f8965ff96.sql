
-- Create pages table
CREATE TABLE public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add page_id to tabs
ALTER TABLE public.tabs ADD COLUMN page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- RLS policies for pages
CREATE POLICY "Users can view their own pages" ON public.pages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own pages" ON public.pages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pages" ON public.pages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own pages" ON public.pages FOR DELETE USING (auth.uid() = user_id);

-- Allow shared access to pages
CREATE POLICY "Allow public read access to shared pages" ON public.pages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_settings
  WHERE user_settings.user_id = pages.user_id
  AND user_settings.share_enabled = true
  AND user_settings.share_token IS NOT NULL
));
