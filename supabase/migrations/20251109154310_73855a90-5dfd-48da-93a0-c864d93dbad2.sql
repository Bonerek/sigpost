-- Drop the overly permissive public policy on system_settings
DROP POLICY IF EXISTS "Anyone can view system settings" ON public.system_settings;

-- Add a policy that requires authentication
CREATE POLICY "Authenticated users can view system settings"
ON public.system_settings
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);