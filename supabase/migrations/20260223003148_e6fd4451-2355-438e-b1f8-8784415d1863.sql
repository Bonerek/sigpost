
DROP VIEW IF EXISTS public.system_settings_public;

CREATE VIEW public.system_settings_public 
WITH (security_invoker = true)
AS
SELECT registration_enabled, default_redirect_token
FROM public.system_settings
LIMIT 1;

GRANT SELECT ON public.system_settings_public TO anon;
GRANT SELECT ON public.system_settings_public TO authenticated;

-- Add anon SELECT policy to system_settings so the view works for unauthenticated users
CREATE POLICY "Allow anonymous read of system settings"
ON public.system_settings
FOR SELECT
TO anon
USING (true);
