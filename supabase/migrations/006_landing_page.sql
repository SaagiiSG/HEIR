-- Phase 6: Landing Page Config table

CREATE TABLE landing_page_config (
  id TEXT PRIMARY KEY,        -- 'draft' | 'published'
  config JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE landing_page_config ENABLE ROW LEVEL SECURITY;

-- Visitors (anon) can only read the published row
CREATE POLICY "lp_published_read" ON landing_page_config
  FOR SELECT USING (id = 'published');

-- Admins can read/write both rows
CREATE POLICY "lp_admin_all" ON landing_page_config
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- SEED: insert default draft + published configs
-- ============================================================
INSERT INTO landing_page_config (id, config) VALUES
('draft', '{
  "hero": {
    "imageUrl": "https://placehold.co/600x800/1a1a2e/ffffff?text=HEIR",
    "imageAlt": "HEIR — Mongolian Men''s Fashion"
  },
  "newIn": [
    {"productId": null, "productName_en": "Coming Soon", "productName_mn": "Удахгүй нэмэгдэнэ", "productPrice": 0, "productImageUrl": "https://placehold.co/400x400/f5f5f5/f5f5f5", "productSlug": "", "colorSwatches": ["#c8b89a"]},
    {"productId": null, "productName_en": "Coming Soon", "productName_mn": "Удахгүй нэмэгдэнэ", "productPrice": 0, "productImageUrl": "https://placehold.co/400x400/f5f5f5/f5f5f5", "productSlug": "", "colorSwatches": ["#c8b89a"]},
    {"productId": null, "productName_en": "Coming Soon", "productName_mn": "Удахгүй нэмэгдэнэ", "productPrice": 0, "productImageUrl": "https://placehold.co/400x400/f5f5f5/f5f5f5", "productSlug": "", "colorSwatches": ["#c8b89a"]},
    {"productId": null, "productName_en": "Coming Soon", "productName_mn": "Удахгүй нэмэгдэнэ", "productPrice": 0, "productImageUrl": "https://placehold.co/400x400/f5f5f5/f5f5f5", "productSlug": "", "colorSwatches": ["#c8b89a"]},
    {"productId": null, "productName_en": "Coming Soon", "productName_mn": "Удахгүй нэмэгдэнэ", "productPrice": 0, "productImageUrl": "https://placehold.co/400x400/f5f5f5/f5f5f5", "productSlug": "", "colorSwatches": ["#c8b89a"]},
    {"productId": null, "productName_en": "Coming Soon", "productName_mn": "Удахгүй нэмэгдэнэ", "productPrice": 0, "productImageUrl": "https://placehold.co/400x400/f5f5f5/f5f5f5", "productSlug": "", "colorSwatches": ["#c8b89a"]}
  ],
  "collections": [
    {"imageUrl": "https://placehold.co/400x400/f0ebe4/f0ebe4", "label_en": "HEIR SS26", "label_mn": "HEIR ХЗ26", "href": "#"},
    {"imageUrl": "https://placehold.co/400x400/d4c9a8/d4c9a8", "label_en": "Mongolian Cashmere", "label_mn": "Монгол Кашмир", "href": "#"},
    {"imageUrl": "https://placehold.co/400x400/1a1a2e/1a1a2e", "label_en": "Technical Outerwear", "label_mn": "Техник гадуур хувцас", "href": "#"},
    {"imageUrl": "https://placehold.co/400x400/e8c4c4/e8c4c4", "label_en": "Heritage Wool", "label_mn": "Уламжлалт ноос", "href": "#"},
    {"imageUrl": "https://placehold.co/400x400/e0d5c7/e0d5c7", "label_en": "Core Collection", "label_mn": "Үндсэн цуглуулга", "href": "#"},
    {"imageUrl": "https://placehold.co/400x400/5a3e8a/5a3e8a", "label_en": "Nomad Series", "label_mn": "Нүүдэлчний цуврал", "href": "#"},
    {"imageUrl": "https://placehold.co/400x400/6b4e9e/6b4e9e", "label_en": "Sustainable Basics", "label_mn": "Тогтвортой үндсэн", "href": "#"},
    {"imageUrl": "https://placehold.co/400x400/8a9e7a/8a9e7a", "label_en": "Limited Edition", "label_mn": "Хязгаарлагдмал", "href": "#"}
  ],
  "sustainability": {
    "imageUrl": "https://placehold.co/500x350/8a9e7a/8a9e7a",
    "imageAlt": "Sustainability"
  },
  "_version": 1
}'::jsonb);

INSERT INTO landing_page_config (id, config)
  SELECT 'published', config FROM landing_page_config WHERE id = 'draft';
