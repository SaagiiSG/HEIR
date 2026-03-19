-- Add missing product categories
INSERT INTO categories (slug, name_mn, name_en)
VALUES
  ('sweater', 'Свайтер', 'Sweaters'),
  ('shoes', 'Гутал', 'Shoes')
ON CONFLICT (slug) DO NOTHING;
