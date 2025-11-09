-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  color TEXT NOT NULL,
  column_index INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create links table
CREATE TABLE public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Users can view their own categories"
  ON public.categories
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
  ON public.categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON public.categories
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON public.categories
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for links
CREATE POLICY "Users can view links in their categories"
  ON public.links
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.categories
      WHERE categories.id = links.category_id
      AND categories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert links in their categories"
  ON public.links
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.categories
      WHERE categories.id = links.category_id
      AND categories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update links in their categories"
  ON public.links
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.categories
      WHERE categories.id = links.category_id
      AND categories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete links in their categories"
  ON public.links
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.categories
      WHERE categories.id = links.category_id
      AND categories.user_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_links_updated_at
  BEFORE UPDATE ON public.links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();