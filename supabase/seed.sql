-- Seed file for local Supabase development
-- Run with: supabase db reset (this applies migrations + seed)

-- ============================================
-- System settings (only essential config)
-- ============================================
INSERT INTO public.system_settings (id, registration_enabled)
VALUES ('00000000-0000-0000-0000-000000000001', true)
ON CONFLICT (id) DO UPDATE SET registration_enabled = true;
