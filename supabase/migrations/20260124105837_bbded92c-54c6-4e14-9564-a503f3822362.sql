-- Create tabs table
CREATE TABLE public.tabs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'blue',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tabs ENABLE ROW LEVEL SECURITY;

-- Create policies for tabs
CREATE POLICY "Users can view their own tabs" 
ON public.tabs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tabs" 
ON public.tabs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tabs" 
ON public.tabs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tabs" 
ON public.tabs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Allow public read access to shared tabs
CREATE POLICY "Allow public read access to shared tabs" 
ON public.tabs 
FOR SELECT 
USING (EXISTS ( SELECT 1
   FROM user_settings
  WHERE ((user_settings.user_id = tabs.user_id) AND (user_settings.share_enabled = true) AND (user_settings.share_token IS NOT NULL))));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_tabs_updated_at
BEFORE UPDATE ON public.tabs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add tab_id column to categories
ALTER TABLE public.categories ADD COLUMN tab_id UUID REFERENCES public.tabs(id) ON DELETE RESTRICT;

-- Create index for faster lookups
CREATE INDEX idx_categories_tab_id ON public.categories(tab_id);
CREATE INDEX idx_tabs_user_id ON public.tabs(user_id);