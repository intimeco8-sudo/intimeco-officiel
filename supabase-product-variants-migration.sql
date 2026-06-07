-- Product variants migration.
-- Run this once in Supabase SQL Editor for existing projects.

ALTER TABLE products ADD COLUMN IF NOT EXISTS variant_options jsonb DEFAULT '[]'::jsonb;

CREATE OR REPLACE FUNCTION public.handle_new_order_item()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  updated_variants jsonb;
BEGIN
  SELECT jsonb_agg(
    CASE
      WHEN variant->>'color' = NEW.color AND NEW.size IS NOT NULL THEN
        jsonb_set(
          variant,
          ARRAY['stockBySize', NEW.size],
          to_jsonb(GREATEST(0, COALESCE((variant->'stockBySize'->>NEW.size)::integer, 0) - NEW.quantity))
        )
      ELSE variant
    END
  )
  INTO updated_variants
  FROM public.products product,
       jsonb_array_elements(COALESCE(product.variant_options, '[]'::jsonb)) variant
  WHERE product.id = NEW.product_id;

  UPDATE public.products
  SET variant_options = COALESCE(updated_variants, variant_options),
      stock = GREATEST(0, COALESCE(stock, 0) - NEW.quantity),
      updated_at = now()
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$;
