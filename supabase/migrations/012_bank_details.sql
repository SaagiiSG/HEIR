-- Add bank_details JSONB column to site_settings
-- Admins update this via the settings panel; it is fetched server-side only (never exposed to client bundle)
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS bank_details JSONB DEFAULT '{}'::jsonb;

-- Update the default row so existing installs have the column
UPDATE site_settings SET bank_details = '{}'::jsonb WHERE id = 'default' AND bank_details IS NULL;
