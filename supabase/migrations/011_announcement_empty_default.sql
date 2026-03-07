-- Change announcement defaults to empty string so the bar is hidden until admin sets text
ALTER TABLE site_settings
  ALTER COLUMN announcement_mn SET DEFAULT '',
  ALTER COLUMN announcement_en SET DEFAULT '';

-- Clear the seeded row so bar is hidden on fresh installs
UPDATE site_settings SET announcement_mn = '', announcement_en = '' WHERE id = 'default';
