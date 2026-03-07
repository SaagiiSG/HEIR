-- Add compare_at_price (inflated/original price shown crossed out)
ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price INT;
