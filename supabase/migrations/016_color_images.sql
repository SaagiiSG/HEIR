-- Add color_hex to product_images for per-color image tagging
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS color_hex VARCHAR(7) NULL;
