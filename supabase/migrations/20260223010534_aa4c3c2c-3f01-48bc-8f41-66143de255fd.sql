
-- Drop all existing RESTRICTIVE policies on system_settings
DROP POLICY IF EXISTS "Allow anonymous read of system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Authenticated users can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can update system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can insert system settings" ON public.system_settings;

-- Recreate as PERMISSIVE (default)
CREATE POLICY "anon_read_system_settings" ON public.system_settings
  FOR SELECT TO anon USING (true);

CREATE POLICY "authenticated_read_system_settings" ON public.system_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "admin_update_system_settings" ON public.system_settings
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admin_insert_system_settings" ON public.system_settings
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
