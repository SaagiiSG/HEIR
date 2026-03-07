-- Phase 5: Rename products.price → products.base_price + Storage RLS policies

-- ============================================================
-- RENAME price → base_price on products table (idempotent)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'products'
      AND column_name = 'price'
  ) THEN
    ALTER TABLE products RENAME COLUMN price TO base_price;
  END IF;
END;
$$;

-- Also add is_featured if not present (was missing from schema but codebase uses it)
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- ============================================================
-- STORAGE RLS for product-images bucket
-- NOTE: The bucket must be created manually in the Supabase dashboard as "Public"
-- Policies written idempotently so this migration can be re-run safely.
-- ============================================================

-- Allow public (anon) reads on product-images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'product_images_storage_read'
  ) THEN
    CREATE POLICY "product_images_storage_read" ON storage.objects
      FOR SELECT USING (bucket_id = 'product-images');
  END IF;
END;
$$;

-- Allow admin writes (insert) on product-images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'product_images_storage_insert'
  ) THEN
    CREATE POLICY "product_images_storage_insert" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'product-images' AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END;
$$;

-- Allow admin writes (update) on product-images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'product_images_storage_update'
  ) THEN
    CREATE POLICY "product_images_storage_update" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'product-images' AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END;
$$;

-- Allow admin writes (delete) on product-images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'product_images_storage_delete'
  ) THEN
    CREATE POLICY "product_images_storage_delete" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'product-images' AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END;
$$;
