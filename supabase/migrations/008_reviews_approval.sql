-- Phase 8: Add is_approved to reviews for admin moderation + landing page curation

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;

-- Update the public read policy to only show approved reviews
-- (drop old policy and replace)
DROP POLICY IF EXISTS "public_read_reviews" ON reviews;

CREATE POLICY "public_read_reviews" ON reviews
  FOR SELECT USING (
    is_approved = TRUE OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin full access
CREATE POLICY IF NOT EXISTS "reviews_admin_all" ON reviews
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
