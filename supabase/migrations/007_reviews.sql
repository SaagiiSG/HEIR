-- Reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Review likes / "helpful" votes
CREATE TABLE review_likes (
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (review_id, user_id)
);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_likes ENABLE ROW LEVEL SECURITY;

-- Reviews: public reads, auth users insert own, update/delete own
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "auth_insert_review" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update_review" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own_delete_review" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Likes: public count reads, auth insert/delete own
CREATE POLICY "public_read_likes" ON review_likes FOR SELECT USING (true);
CREATE POLICY "auth_insert_like" ON review_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_delete_like" ON review_likes FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger on reviews
CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
