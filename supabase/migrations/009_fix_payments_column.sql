-- Fix payments table: rename qpay_invoice_id → provider_invoice_id
-- The webhook and app code uses provider_invoice_id but migration 002 created qpay_invoice_id

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'payments'
      AND column_name = 'qpay_invoice_id'
  ) THEN
    ALTER TABLE payments RENAME COLUMN qpay_invoice_id TO provider_invoice_id;
  END IF;
END;
$$;

-- Also rename qpay_payment_id → provider_payment_id for consistency
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'payments'
      AND column_name = 'qpay_payment_id'
  ) THEN
    ALTER TABLE payments RENAME COLUMN qpay_payment_id TO provider_payment_id;
  END IF;
END;
$$;
