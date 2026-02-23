
-- Drop all existing system_settings policies
DROP POLICY IF EXISTS "anon_read_system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "authenticated_read_system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "admin_update_system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "admin_insert_system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow anonymous read of system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow authenticated read of system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow admin to update system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow admin to insert system settings" ON public.system_settings;

-- Recreate as explicitly PERMISSIVE
CREATE POLICY "anon_read_system_settings" ON public.system_settings AS PERMISSIVE FOR SELECT TO anon USING (true);
CREATE POLICY "authenticated_read_system_settings" ON public.system_settings AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_update_system_settings" ON public.system_settings AS PERMISSIVE FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admin_insert_system_settings" ON public.system_settings AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
