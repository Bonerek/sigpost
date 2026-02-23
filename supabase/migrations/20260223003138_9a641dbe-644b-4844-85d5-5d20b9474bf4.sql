
CREATE OR REPLACE VIEW public.system_settings_public AS
SELECT registration_enabled, default_redirect_token
FROM public.system_settings
LIMIT 1;

GRANT SELECT ON public.system_settings_public TO anon;
GRANT SELECT ON public.system_settings_public TO authenticated;
