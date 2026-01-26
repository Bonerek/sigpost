-- Seed file for local Supabase development
-- Run with: supabase db reset (this applies migrations + seed)

-- ============================================
-- 1. Create admin user in auth.users
-- ============================================
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@admin.local',
  crypt('adminadmin', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  'authenticated',
  'authenticated',
  ''
);

-- Note: Profile and admin role are created automatically via database trigger (handle_new_user_role)

-- ============================================
-- 2. System settings
-- ============================================
INSERT INTO public.system_settings (id, registration_enabled)
VALUES ('00000000-0000-0000-0000-000000000001', true)
ON CONFLICT (id) DO UPDATE SET registration_enabled = true;

-- ============================================
-- 3. User settings for admin
-- ============================================
INSERT INTO public.user_settings (id, user_id, column_count, custom_text, share_enabled)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  4,
  'Welcome to Signpost - Your Personal Link Dashboard',
  false
);

-- ============================================
-- 4. Tabs
-- ============================================
INSERT INTO public.tabs (id, user_id, name, color, position) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Work', 'blue', 0),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Personal', 'green', 1),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Entertainment', 'purple', 2),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Learning', 'orange', 3);

-- ============================================
-- 5. Categories
-- ============================================

-- Work Tab Categories
INSERT INTO public.categories (id, user_id, tab_id, title, color, column_index, position) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Development Tools', '#3b82f6', 0, 0),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Cloud Services', '#6366f1', 1, 0),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Project Management', '#8b5cf6', 2, 0),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Documentation', '#0ea5e9', 3, 0);

-- Personal Tab Categories
INSERT INTO public.categories (id, user_id, tab_id, title, color, column_index, position) VALUES
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'News', '#22c55e', 0, 0),
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Social Media', '#10b981', 1, 0),
  ('20000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Shopping', '#14b8a6', 2, 0),
  ('20000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Finance', '#06b6d4', 3, 0);

-- Entertainment Tab Categories
INSERT INTO public.categories (id, user_id, tab_id, title, color, column_index, position) VALUES
  ('20000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Streaming', '#a855f7', 0, 0),
  ('20000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Gaming', '#d946ef', 1, 0),
  ('20000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Music', '#ec4899', 2, 0),
  ('20000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Sports', '#f43f5e', 3, 0);

-- Learning Tab Categories
INSERT INTO public.categories (id, user_id, tab_id, title, color, column_index, position) VALUES
  ('20000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Online Courses', '#f97316', 0, 0),
  ('20000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Reference', '#fb923c', 1, 0),
  ('20000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Tech Blogs', '#fbbf24', 2, 0),
  ('20000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Research', '#facc15', 3, 0);

-- ============================================
-- 6. Links
-- ============================================

-- Development Tools
INSERT INTO public.links (category_id, title, url, description, position) VALUES
  ('20000000-0000-0000-0000-000000000001', 'GitHub', 'https://github.com', 'Code hosting and version control', 0),
  ('20000000-0000-0000-0000-000000000001', 'GitLab', 'https://gitlab.com', 'DevOps lifecycle tool', 1),
  ('20000000-0000-0000-0000-000000000001', 'Stack Overflow', 'https://stackoverflow.com', 'Developer Q&A community', 2),
  ('20000000-0000-0000-0000-000000000001', 'CodePen', 'https://codepen.io', 'Frontend code playground', 3),
  ('20000000-0000-0000-0000-000000000001', 'JSFiddle', 'https://jsfiddle.net', 'Online code editor', 4);

-- Cloud Services
INSERT INTO public.links (category_id, title, url, description, position) VALUES
  ('20000000-0000-0000-0000-000000000002', 'AWS Console', 'https://console.aws.amazon.com', 'Amazon Web Services', 0),
  ('20000000-0000-0000-0000-000000000002', 'Google Cloud', 'https://console.cloud.google.com', 'Google Cloud Platform', 1),
  ('20000000-0000-0000-0000-000000000002', 'Microsoft Azure', 'https://portal.azure.com', 'Azure Portal', 2),
  ('20000000-0000-0000-0000-000000000002', 'DigitalOcean', 'https://cloud.digitalocean.com', 'Simple cloud hosting', 3),
  ('20000000-0000-0000-0000-000000000002', 'Vercel', 'https://vercel.com', 'Frontend deployment platform', 4);

-- Project Management
INSERT INTO public.links (category_id, title, url, description, position) VALUES
  ('20000000-0000-0000-0000-000000000003', 'Jira', 'https://www.atlassian.com/software/jira', 'Issue and project tracking', 0),
  ('20000000-0000-0000-0000-000000000003', 'Trello', 'https://trello.com', 'Kanban-style boards', 1),
  ('20000000-0000-0000-0000-000000000003', 'Asana', 'https://asana.com', 'Work management platform', 2),
  ('20000000-0000-0000-0000-000000000003', 'Notion', 'https://notion.so', 'All-in-one workspace', 3),
  ('20000000-0000-0000-0000-000000000003', 'Linear', 'https://linear.app', 'Modern issue tracking', 4);

-- Documentation
INSERT INTO public.links (category_id, title, url, description, position) VALUES
  ('20000000-0000-0000-0000-000000000004', 'MDN Web Docs', 'https://developer.mozilla.org', 'Web technology documentation', 0),
  ('20000000-0000-0000-0000-000000000004', 'React Docs', 'https://react.dev', 'Official React documentation', 1),
  ('20000000-0000-0000-0000-000000000004', 'TypeScript Docs', 'https://www.typescriptlang.org/docs', 'TypeScript handbook', 2),
  ('20000000-0000-0000-0000-000000000004', 'Tailwind CSS', 'https://tailwindcss.com/docs', 'Utility-first CSS framework', 3),
  ('20000000-0000-0000-0000-000000000004', 'Supabase Docs', 'https://supabase.com/docs', 'Backend as a service', 4);

-- News
INSERT INTO public.links (category_id, title, url, description, position) VALUES
  ('20000000-0000-0000-0000-000000000005', 'BBC News', 'https://www.bbc.com/news', 'British Broadcasting Corporation', 0),
  ('20000000-0000-0000-0000-000000000005', 'CNN', 'https://www.cnn.com', 'Cable News Network', 1),
  ('20000000-0000-0000-0000-000000000005', 'Reuters', 'https://www.reuters.com', 'International news agency', 2),
  ('20000000-0000-0000-0000-000000000005', 'The Guardian', 'https://www.theguardian.com', 'British daily newspaper', 3),
  ('20000000-0000-0000-0000-000000000005', 'Hacker News', 'https://news.ycombinator.com', 'Tech news aggregator', 4);

-- Social Media
INSERT INTO public.links (category_id, title, url, description, position) VALUES
  ('20000000-0000-0000-0000-000000000006', 'Twitter / X', 'https://x.com', 'Microblogging platform', 0),
  ('20000000-0000-0000-0000-000000000006', 'LinkedIn', 'https://www.linkedin.com', 'Professional networking', 1),
  ('20000000-0000-0000-0000-000000000006', 'Reddit', 'https://www.reddit.com', 'Social news aggregation', 2),
  ('20000000-0000-0000-0000-000000000006', 'Instagram', 'https://www.instagram.com', 'Photo and video sharing', 3),
  ('20000000-0000-0000-0000-000000000006', 'Facebook', 'https://www.facebook.com', 'Social networking service', 4);

-- Shopping
INSERT INTO public.links (category_id, title, url, description, position) VALUES
  ('20000000-0000-0000-0000-000000000007', 'Amazon', 'https://www.amazon.com', 'Online marketplace', 0),
  ('20000000-0000-0000-0000-000000000007', 'eBay', 'https://www.ebay.com', 'Online auction and shopping', 1),
  ('20000000-0000-0000-0000-000000000007', 'AliExpress', 'https://www.aliexpress.com', 'Global retail marketplace', 2),
  ('20000000-0000-0000-0000-000000000007', 'Etsy', 'https://www.etsy.com', 'Handmade and vintage items', 3),
  ('20000000-0000-0000-0000-000000000007', 'Best Buy', 'https://www.bestbuy.com', 'Electronics retailer', 4);

-- Finance
INSERT INTO public.links (category_id, title, url, description, position) VALUES
  ('20000000-0000-0000-0000-000000000008', 'Yahoo Finance', 'https://finance.yahoo.com', 'Financial news and data', 0),
  ('20000000-0000-0000-0000-000000000008', 'Bloomberg', 'https://www.bloomberg.com', 'Business and market news', 1),
  ('20000000-0000-0000-0000-000000000008', 'CoinMarketCap', 'https://coinmarketcap.com', 'Cryptocurrency prices', 2),
  ('20000000-0000-0000-0000-000000000008', 'Investing.com', 'https://www.investing.com', 'Financial portal', 3),
  ('20000000-0000-0000-0000-000000000008', 'XE Currency', 'https://www.xe.com', 'Currency converter', 4);

-- Streaming
INSERT INTO public.links (category_id, title, url, description, position) VALUES
  ('20000000-0000-0000-0000-000000000009', 'Netflix', 'https://www.netflix.com', 'Streaming entertainment', 0),
  ('20000000-0000-0000-0000-000000000009', 'YouTube', 'https://www.youtube.com', 'Video sharing platform', 1),
  ('20000000-0000-0000-0000-000000000009', 'Disney+', 'https://www.disneyplus.com', 'Disney streaming service', 2),
  ('20000000-0000-0000-0000-000000000009', 'Prime Video', 'https://www.primevideo.com', 'Amazon streaming', 3),
  ('20000000-0000-0000-0000-000000000009', 'Twitch', 'https://www.twitch.tv', 'Live streaming platform', 4);

-- Gaming
INSERT INTO public.links (category_id, title, url, description, position) VALUES
  ('20000000-0000-0000-0000-000000000010', 'Steam', 'https://store.steampowered.com', 'PC gaming platform', 0),
  ('20000000-0000-0000-0000-000000000010', 'Epic Games', 'https://store.epicgames.com', 'Game store and launcher', 1),
  ('20000000-0000-0000-0000-000000000010', 'IGN', 'https://www.ign.com', 'Gaming news and reviews', 2),
  ('20000000-0000-0000-0000-000000000010', 'GameSpot', 'https://www.gamespot.com', 'Video game website', 3),
  ('20000000-0000-0000-0000-000000000010', 'GOG', 'https://www.gog.com', 'DRM-free game store', 4);

-- Music
INSERT INTO public.links (category_id, title, url, description, position) VALUES
  ('20000000-0000-0000-0000-000000000011', 'Spotify', 'https://open.spotify.com', 'Music streaming service', 0),
  ('20000000-0000-0000-0000-000000000011', 'Apple Music', 'https://music.apple.com', 'Apple streaming service', 1),
  ('20000000-0000-0000-0000-000000000011', 'SoundCloud', 'https://soundcloud.com', 'Audio distribution platform', 2),
  ('20000000-0000-0000-0000-000000000011', 'Bandcamp', 'https://bandcamp.com', 'Music community platform', 3),
  ('20000000-0000-0000-0000-000000000011', 'Last.fm', 'https://www.last.fm', 'Music recommendation service', 4);

-- Sports
INSERT INTO public.links (category_id, title, url, description, position) VALUES
  ('20000000-0000-0000-0000-000000000012', 'ESPN', 'https://www.espn.com', 'Sports news network', 0),
  ('20000000-0000-0000-0000-000000000012', 'BBC Sport', 'https://www.bbc.com/sport', 'British sports coverage', 1),
  ('20000000-0000-0000-0000-000000000012', 'Sky Sports', 'https://www.skysports.com', 'UK sports broadcaster', 2),
  ('20000000-0000-0000-0000-000000000012', 'NBA', 'https://www.nba.com', 'Basketball league', 3),
  ('20000000-0000-0000-0000-000000000012', 'UEFA', 'https://www.uefa.com', 'European football', 4);

-- Online Courses
INSERT INTO public.links (category_id, title, url, description, position) VALUES
  ('20000000-0000-0000-0000-000000000013', 'Coursera', 'https://www.coursera.org', 'Online learning platform', 0),
  ('20000000-0000-0000-0000-000000000013', 'Udemy', 'https://www.udemy.com', 'Online course marketplace', 1),
  ('20000000-0000-0000-0000-000000000013', 'edX', 'https://www.edx.org', 'University courses online', 2),
  ('20000000-0000-0000-0000-000000000013', 'Khan Academy', 'https://www.khanacademy.org', 'Free educational content', 3),
  ('20000000-0000-0000-0000-000000000013', 'Pluralsight', 'https://www.pluralsight.com', 'Tech skills platform', 4);

-- Reference
INSERT INTO public.links (category_id, title, url, description, position) VALUES
  ('20000000-0000-0000-0000-000000000014', 'Wikipedia', 'https://www.wikipedia.org', 'Free encyclopedia', 0),
  ('20000000-0000-0000-0000-000000000014', 'Wolfram Alpha', 'https://www.wolframalpha.com', 'Computational knowledge', 1),
  ('20000000-0000-0000-0000-000000000014', 'Dictionary.com', 'https://www.dictionary.com', 'English dictionary', 2),
  ('20000000-0000-0000-0000-000000000014', 'Thesaurus.com', 'https://www.thesaurus.com', 'Synonym finder', 3),
  ('20000000-0000-0000-0000-000000000014', 'Encyclopedia Britannica', 'https://www.britannica.com', 'General knowledge', 4);

-- Tech Blogs
INSERT INTO public.links (category_id, title, url, description, position) VALUES
  ('20000000-0000-0000-0000-000000000015', 'TechCrunch', 'https://techcrunch.com', 'Tech industry news', 0),
  ('20000000-0000-0000-0000-000000000015', 'The Verge', 'https://www.theverge.com', 'Technology and culture', 1),
  ('20000000-0000-0000-0000-000000000015', 'Ars Technica', 'https://arstechnica.com', 'Technology news site', 2),
  ('20000000-0000-0000-0000-000000000015', 'Wired', 'https://www.wired.com', 'Technology magazine', 3),
  ('20000000-0000-0000-0000-000000000015', 'Smashing Magazine', 'https://www.smashingmagazine.com', 'Web design and development', 4);

-- Research
INSERT INTO public.links (category_id, title, url, description, position) VALUES
  ('20000000-0000-0000-0000-000000000016', 'Google Scholar', 'https://scholar.google.com', 'Academic search engine', 0),
  ('20000000-0000-0000-0000-000000000016', 'arXiv', 'https://arxiv.org', 'Scientific paper repository', 1),
  ('20000000-0000-0000-0000-000000000016', 'PubMed', 'https://pubmed.ncbi.nlm.nih.gov', 'Biomedical literature', 2),
  ('20000000-0000-0000-0000-000000000016', 'ResearchGate', 'https://www.researchgate.net', 'Academic social network', 3),
  ('20000000-0000-0000-0000-000000000016', 'IEEE Xplore', 'https://ieeexplore.ieee.org', 'Technical literature', 4);
