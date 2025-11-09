-- Add is_active column to profiles
ALTER TABLE public.profiles
ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;

-- Update existing profiles to be active
UPDATE public.profiles SET is_active = true;

-- Create index for faster queries
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);