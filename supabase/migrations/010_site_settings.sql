-- Site-wide settings (single-row table, id = 'default')
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  announcement_mn TEXT NOT NULL DEFAULT 'Монгол гарал үүсэлтэй өндөр чанарын эрэгтэй хувцас',
  announcement_en TEXT NOT NULL DEFAULT 'Mongolian Men''s Fashion — Premium Quality',
  shipping_fee INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed the one default row
INSERT INTO site_settings (id) VALUES ('default') ON CONFLICT DO NOTHING;

-- Public can read (announcement bar shown to all visitors)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings_select_all" ON site_settings
  FOR SELECT USING (TRUE);

-- Only admins can update
CREATE POLICY "site_settings_admin_update" ON site_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
