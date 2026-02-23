
-- =============================================
-- Fix ALL RLS policies: drop RESTRICTIVE, recreate as PERMISSIVE
-- =============================================

-- ============ system_settings ============
DROP POLICY IF EXISTS "anon_read_system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "authenticated_read_system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "admin_update_system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "admin_insert_system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow anonymous read of system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow authenticated read of system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow admin to update system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow admin to insert system settings" ON public.system_settings;

CREATE POLICY "anon_read_system_settings" ON public.system_settings AS PERMISSIVE FOR SELECT TO anon USING (true);
CREATE POLICY "authenticated_read_system_settings" ON public.system_settings AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_update_system_settings" ON public.system_settings AS PERMISSIVE FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admin_insert_system_settings" ON public.system_settings AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ profiles ============
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Prevent admin@admin.local profile deletion" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can update their own profile" ON public.profiles AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can update all profiles" ON public.profiles AS PERMISSIVE FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System can insert profiles" ON public.profiles AS PERMISSIVE FOR INSERT WITH CHECK (true);
CREATE POLICY "Prevent admin@admin.local profile deletion" ON public.profiles AS PERMISSIVE FOR DELETE TO authenticated USING (email <> 'admin@admin.local' AND has_role(auth.uid(), 'admin'::app_role));

-- ============ user_roles ============
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles AS PERMISSIVE FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert roles" ON public.user_roles AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete roles" ON public.user_roles AS PERMISSIVE FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ user_settings ============
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON public.user_settings;

CREATE POLICY "Users can view their own settings" ON public.user_settings AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON public.user_settings AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.user_settings AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON public.user_settings AS PERMISSIVE FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ tabs ============
DROP POLICY IF EXISTS "Users can view their own tabs" ON public.tabs;
DROP POLICY IF EXISTS "Users can insert their own tabs" ON public.tabs;
DROP POLICY IF EXISTS "Users can update their own tabs" ON public.tabs;
DROP POLICY IF EXISTS "Users can delete their own tabs" ON public.tabs;
DROP POLICY IF EXISTS "Allow public read access to shared tabs" ON public.tabs;

CREATE POLICY "Users can view their own tabs" ON public.tabs AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tabs" ON public.tabs AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tabs" ON public.tabs AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tabs" ON public.tabs AS PERMISSIVE FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow public read access to shared tabs" ON public.tabs AS PERMISSIVE FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM user_settings WHERE user_settings.user_id = tabs.user_id AND user_settings.share_enabled = true AND user_settings.share_token IS NOT NULL));

-- ============ categories ============
DROP POLICY IF EXISTS "Users can view their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public read access to shared categories" ON public.categories;

CREATE POLICY "Users can view their own categories" ON public.categories AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own categories" ON public.categories AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON public.categories AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON public.categories AS PERMISSIVE FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow public read access to shared categories" ON public.categories AS PERMISSIVE FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM user_settings WHERE user_settings.user_id = categories.user_id AND user_settings.share_enabled = true AND user_settings.share_token IS NOT NULL));

-- ============ links ============
DROP POLICY IF EXISTS "Users can view links in their categories" ON public.links;
DROP POLICY IF EXISTS "Users can insert links in their categories" ON public.links;
DROP POLICY IF EXISTS "Users can update links in their categories" ON public.links;
DROP POLICY IF EXISTS "Users can delete links in their categories" ON public.links;
DROP POLICY IF EXISTS "Allow public read access to shared links" ON public.links;

CREATE POLICY "Users can view links in their categories" ON public.links AS PERMISSIVE FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM categories WHERE categories.id = links.category_id AND categories.user_id = auth.uid()));
CREATE POLICY "Users can insert links in their categories" ON public.links AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM categories WHERE categories.id = links.category_id AND categories.user_id = auth.uid()));
CREATE POLICY "Users can update links in their categories" ON public.links AS PERMISSIVE FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM categories WHERE categories.id = links.category_id AND categories.user_id = auth.uid()));
CREATE POLICY "Users can delete links in their categories" ON public.links AS PERMISSIVE FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM categories WHERE categories.id = links.category_id AND categories.user_id = auth.uid()));
CREATE POLICY "Allow public read access to shared links" ON public.links AS PERMISSIVE FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM categories JOIN user_settings ON user_settings.user_id = categories.user_id WHERE categories.id = links.category_id AND user_settings.share_enabled = true AND user_settings.share_token IS NOT NULL));

-- ============ pages ============
DROP POLICY IF EXISTS "Users can view their own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can insert their own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can update their own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can delete their own pages" ON public.pages;
DROP POLICY IF EXISTS "Allow public read access to shared pages" ON public.pages;

CREATE POLICY "Users can view their own pages" ON public.pages AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own pages" ON public.pages AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pages" ON public.pages AS PERMISSIVE FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own pages" ON public.pages AS PERMISSIVE FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow public read access to shared pages" ON public.pages AS PERMISSIVE FOR SELECT TO anon USING (share_enabled = true AND share_token IS NOT NULL);
