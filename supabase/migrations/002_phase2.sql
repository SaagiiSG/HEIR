-- Phase 2: Admin Dashboard Schema Additions
-- Adds: role to profiles, product_images, inventory, payments, drops, drop_products
-- Updates: RLS policies for admin access

-- ============================================================
-- UPDATE PROFILES — add role, ovog/ner naming + locale
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ovog TEXT,
  ADD COLUMN IF NOT EXISTS ner TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer'
    CHECK (role IN ('customer', 'admin')),
  ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'mn';

-- ============================================================
-- PRODUCT IMAGES (separate table, was array in Phase 1)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_images_select_all" ON product_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.is_active = TRUE)
  );

CREATE POLICY "product_images_admin_all" ON product_images
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- INVENTORY (one row per variant)
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID UNIQUE NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 0,
  low_stock_threshold INT DEFAULT 3,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Customers cannot read inventory directly
CREATE POLICY "inventory_admin_all" ON inventory
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- PAYMENTS (separate from orders)
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  qpay_invoice_id TEXT,
  qpay_payment_id TEXT,
  amount INT NOT NULL,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_select_own" ON payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );

CREATE POLICY "payments_admin_all" ON payments
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- CART ITEMS (server-side cart, Phase 2)
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, variant_id)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cart_items_select_own" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "cart_items_insert_own" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cart_items_update_own" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "cart_items_delete_own" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- DROPS
-- ============================================================
CREATE TABLE IF NOT EXISTS drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_mn TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_mn TEXT,
  description_en TEXT,
  image_url TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drop_products (
  drop_id UUID REFERENCES drops(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  PRIMARY KEY (drop_id, product_id)
);

ALTER TABLE drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE drop_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drops_select_active" ON drops
  FOR SELECT USING (is_active = TRUE OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "drops_admin_all" ON drops
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "drop_products_select_all" ON drop_products
  FOR SELECT USING (TRUE);

CREATE POLICY "drop_products_admin_all" ON drop_products
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- ADMIN POLICIES FOR EXISTING TABLES
-- ============================================================

-- Products — admin full CRUD
CREATE POLICY "products_admin_all" ON products
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Product variants — admin full CRUD
CREATE POLICY "variants_admin_all" ON product_variants
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Orders — admin full CRUD
CREATE POLICY "orders_admin_all" ON orders
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Profiles — admin read all
-- NOTE: Intentionally omitted to avoid recursive RLS on profiles.
-- Admin-facing code should use the service-role client (createAdminClient),
-- which bypasses RLS entirely for profiles reads.

-- ============================================================
-- HELPER: promote user to admin (run manually in Supabase SQL editor)
-- UPDATE profiles SET role = 'admin' WHERE id = '<your-user-id>';
-- ============================================================

-- ============================================================
-- UPDATE PROFILE TRIGGER to include ovog/ner from Google OAuth
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, ner, ovog, locale)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'given_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'family_name', ''),
    'mn'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
