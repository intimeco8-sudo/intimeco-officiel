-- Checkout RPC for public order creation.
-- Keeps orders/products private while allowing anonymous checkout.

CREATE OR REPLACE FUNCTION public.create_checkout_order(order_data jsonb, cart_items jsonb)
RETURNS TABLE (id uuid, order_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  new_order_id uuid := gen_random_uuid();
  new_order_number text := 'IC-' || to_char(now(), 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  item jsonb;
  item_product_id uuid;
  item_quantity integer;
  item_size text;
  item_color text;
  product_record public.products%ROWTYPE;
  available_stock integer;
  promo text := nullif(order_data->>'promoCode', '');
BEGIN
  IF jsonb_typeof(cart_items) <> 'array' OR jsonb_array_length(cart_items) = 0 THEN
    RAISE EXCEPTION 'cart_items must be a non-empty array';
  END IF;

  FOR item IN SELECT value FROM jsonb_array_elements(cart_items)
  LOOP
    item_product_id := nullif(item->>'id', '')::uuid;
    item_quantity := COALESCE((item->>'qty')::integer, 1);
    item_size := nullif(item->>'selectedSize', '');
    item_color := nullif(item->>'selectedColor', '');

    IF item_quantity < 1 THEN
      RAISE EXCEPTION 'Quantite invalide';
    END IF;

    SELECT p.*
    INTO product_record
    FROM public.products p
    WHERE p.id = item_product_id
      AND p.is_active = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produit indisponible';
    END IF;

    IF COALESCE(jsonb_array_length(product_record.variant_options), 0) > 0 AND item_color IS NOT NULL AND item_size IS NOT NULL THEN
      SELECT COALESCE((variant->'stockBySize'->>item_size)::integer, 0)
      INTO available_stock
      FROM jsonb_array_elements(product_record.variant_options) variant
      WHERE variant->>'color' = item_color
      LIMIT 1;

      available_stock := COALESCE(available_stock, 0);
    ELSE
      available_stock := COALESCE(product_record.stock, 0);
    END IF;

    IF available_stock < item_quantity THEN
      RAISE EXCEPTION 'Stock insuffisant pour %', product_record.name;
    END IF;
  END LOOP;

  INSERT INTO public.orders (
    id,
    order_number,
    customer_name,
    customer_phone,
    address,
    wilaya,
    commune,
    payment_method,
    promo_code,
    discount_amount,
    subtotal,
    total,
    notes
  )
  VALUES (
    new_order_id,
    new_order_number,
    order_data->>'customerName',
    order_data->>'customerPhone',
    order_data->>'address',
    order_data->>'wilaya',
    order_data->>'commune',
    order_data->>'paymentMethod',
    promo,
    COALESCE((order_data->>'discountAmount')::numeric, 0),
    (order_data->>'subtotal')::numeric,
    (order_data->>'total')::numeric,
    nullif(order_data->>'notes', '')
  );

  FOR item IN SELECT value FROM jsonb_array_elements(cart_items)
  LOOP
    item_product_id := nullif(item->>'id', '')::uuid;
    item_quantity := COALESCE((item->>'qty')::integer, 1);

    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name,
      product_price,
      size,
      color,
      quantity,
      subtotal
    )
    VALUES (
      new_order_id,
      item_product_id,
      item->>'name',
      (item->>'price')::numeric,
      nullif(item->>'selectedSize', ''),
      nullif(item->>'selectedColor', ''),
      item_quantity,
      (item->>'price')::numeric * item_quantity
    );

  END LOOP;

  RETURN QUERY SELECT new_order_id, new_order_number;
END;
$$;

REVOKE ALL ON FUNCTION public.create_checkout_order(jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_checkout_order(jsonb, jsonb) TO anon, authenticated;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stock_deducted boolean DEFAULT false;

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
  FROM public.orders o
  WHERE o.id = order_id
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
      FROM public.products p
      WHERE p.id = item_record.product_id
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
      WHERE products.id = item_record.product_id;
    END LOOP;

    target_order.stock_deducted := true;
  END IF;

  UPDATE public.orders
  SET status = new_status,
      stock_deducted = COALESCE(target_order.stock_deducted, false),
      updated_at = now()
  WHERE orders.id = order_id
  RETURNING * INTO target_order;

  RETURN target_order;
END;
$$;

REVOKE ALL ON FUNCTION public.update_order_status(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_order_status(uuid, text) TO authenticated;
