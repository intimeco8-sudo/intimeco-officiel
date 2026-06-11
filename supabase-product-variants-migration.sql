-- Product variants and accepted-order stock migration.
-- Run this once in Supabase SQL Editor for existing projects.

ALTER TABLE products ADD COLUMN IF NOT EXISTS variant_options jsonb DEFAULT '[]'::jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stock_deducted boolean DEFAULT false;

DROP TRIGGER IF EXISTS on_order_item_created ON public.order_items;
DROP FUNCTION IF EXISTS public.handle_new_order_item();

CREATE OR REPLACE FUNCTION public.update_order_status(order_id uuid, new_status text)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  target_order public.orders%ROWTYPE;
  item_record public.order_items%ROWTYPE;
  product_record public.products%ROWTYPE;
  available_stock integer;
  updated_variants jsonb;
  accepted_statuses text[] := ARRAY['confirme', 'en_preparation', 'expedie', 'livre'];
BEGIN
  IF new_status <> ALL (ARRAY['en_attente', 'confirme', 'en_preparation', 'expedie', 'livre', 'annule']) THEN
    RAISE EXCEPTION 'Statut invalide';
  END IF;

  SELECT *
  INTO target_order
  FROM public.orders
  WHERE id = order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Commande introuvable';
  END IF;

  IF new_status = ANY (accepted_statuses) AND COALESCE(target_order.stock_deducted, false) = false THEN
    FOR item_record IN
      SELECT * FROM public.order_items WHERE order_items.order_id = update_order_status.order_id
    LOOP
      IF item_record.product_id IS NULL THEN
        CONTINUE;
      END IF;

      SELECT *
      INTO product_record
      FROM public.products
      WHERE id = item_record.product_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Produit introuvable: %', item_record.product_name;
      END IF;

      updated_variants := NULL;

      IF COALESCE(jsonb_array_length(product_record.variant_options), 0) > 0
        AND item_record.color IS NOT NULL
        AND item_record.size IS NOT NULL THEN
        SELECT COALESCE((variant->'stockBySize'->>item_record.size)::integer, 0)
        INTO available_stock
        FROM jsonb_array_elements(product_record.variant_options) variant
        WHERE variant->>'color' = item_record.color
        LIMIT 1;

        available_stock := COALESCE(available_stock, 0);

        IF available_stock < item_record.quantity THEN
          RAISE EXCEPTION 'Stock insuffisant pour %', item_record.product_name;
        END IF;

        SELECT jsonb_agg(
          CASE
            WHEN variant->>'color' = item_record.color THEN
              jsonb_set(
                variant,
                ARRAY['stockBySize', item_record.size],
                to_jsonb(available_stock - item_record.quantity)
              )
            ELSE variant
          END
        )
        INTO updated_variants
        FROM jsonb_array_elements(product_record.variant_options) variant;
      ELSE
        available_stock := COALESCE(product_record.stock, 0);

        IF available_stock < item_record.quantity THEN
          RAISE EXCEPTION 'Stock insuffisant pour %', item_record.product_name;
        END IF;
      END IF;

      UPDATE public.products
      SET variant_options = COALESCE(updated_variants, variant_options),
          stock = GREATEST(0, COALESCE(stock, 0) - item_record.quantity),
          updated_at = now()
      WHERE id = item_record.product_id;
    END LOOP;

    target_order.stock_deducted := true;
  END IF;

  UPDATE public.orders
  SET status = new_status,
      stock_deducted = COALESCE(target_order.stock_deducted, false),
      updated_at = now()
  WHERE id = order_id
  RETURNING * INTO target_order;

  RETURN target_order;
END;
$$;

REVOKE ALL ON FUNCTION public.update_order_status(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_order_status(uuid, text) TO authenticated;
