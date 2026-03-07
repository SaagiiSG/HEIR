-- Atomic stock decrement called from createOrder() server action.
-- Uses GREATEST(0, ...) to prevent negative stock.
CREATE OR REPLACE FUNCTION decrement_variant_stock(p_variant_id UUID, p_quantity INT)
RETURNS void AS $$
BEGIN
  UPDATE product_variants
  SET stock = GREATEST(0, stock - p_quantity)
  WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
