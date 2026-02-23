
-- Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Allow anonymous read of system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Authenticated users can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can update system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can insert system settings" ON public.system_settings;

-- Recreate as PERMISSIVE (default)
CREATE POLICY "Allow anonymous read of system settings"
ON public.system_settings FOR SELECT TO anon
USING (true);

CREATE POLICY "Authenticated users can view system settings"
ON public.system_settings FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update system settings"
ON public.system_settings FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert system settings"
ON public.system_settings FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
