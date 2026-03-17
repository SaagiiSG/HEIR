ALTER TABLE orders ADD COLUMN IF NOT EXISTS expires_at timestamptz;
