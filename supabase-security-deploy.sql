-- INTIME & CO - Security hardening migration for existing Supabase projects
-- Run this in Supabase SQL Editor before deploying the current app.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.role() = 'authenticated'
    AND (
      auth.jwt()->'app_metadata'->>'role' = 'admin'
      OR auth.jwt()->'app_metadata'->>'admin' = 'true'
    );
$$;

-- Product/admin data is writable only by users with app_metadata.role = "admin".
DROP POLICY IF EXISTS "Authenticated users can do all on products" ON products;
DROP POLICY IF EXISTS "Admins can do all on products" ON products;
CREATE POLICY "Admins can do all on products"
  ON products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Checkout must go through create_checkout_order; no direct anonymous order inserts.
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can read all orders" ON orders;
DROP POLICY IF EXISTS "Admins can read all orders" ON orders;
CREATE POLICY "Admins can read all orders"
  ON orders FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Anyone can insert order_items" ON order_items;
DROP POLICY IF EXISTS "Authenticated users can read order_items" ON order_items;
DROP POLICY IF EXISTS "Admins can read order_items" ON order_items;
CREATE POLICY "Admins can read order_items"
  ON order_items FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can do all on promo_codes" ON promo_codes;
DROP POLICY IF EXISTS "Admins can do all on promo_codes" ON promo_codes;
CREATE POLICY "Admins can do all on promo_codes"
  ON promo_codes FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can write settings" ON settings;
DROP POLICY IF EXISTS "Admins can write settings" ON settings;
CREATE POLICY "Admins can write settings"
  ON settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Storage image writes are admin-only.
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Authenticated users can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images' AND public.is_admin())
WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Authenticated users can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND public.is_admin());

-- Replace checkout RPC so prices, delivery, promo discount, subtotal, and total are calculated server-side.
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
  product_subtotal numeric(10,2) := 0;
  delivery_fee numeric(10,2) := 0;
  free_delivery_threshold numeric(10,2) := 0;
  discount_amount numeric(10,2) := 0;
  order_subtotal numeric(10,2) := 0;
  order_total numeric(10,2) := 0;
  promo_record public.promo_codes%ROWTYPE;
BEGIN
  IF jsonb_typeof(cart_items) <> 'array' OR jsonb_array_length(cart_items) = 0 THEN
    RAISE EXCEPTION 'cart_items must be a non-empty array';
  END IF;

  IF jsonb_array_length(cart_items) > 100 THEN
    RAISE EXCEPTION 'Panier trop volumineux';
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

    product_subtotal := product_subtotal + (product_record.price * item_quantity);
  END LOOP;

  SELECT COALESCE(NULLIF(value, '')::numeric, 0)
  INTO delivery_fee
  FROM public.settings
  WHERE key = 'delivery_fee';

  SELECT COALESCE(NULLIF(value, '')::numeric, 0)
  INTO free_delivery_threshold
  FROM public.settings
  WHERE key = 'free_delivery_threshold';

  delivery_fee := COALESCE(delivery_fee, 0);
  free_delivery_threshold := COALESCE(free_delivery_threshold, 0);

  IF free_delivery_threshold > 0 AND product_subtotal >= free_delivery_threshold THEN
    delivery_fee := 0;
  END IF;

  IF promo IS NOT NULL THEN
    SELECT *
    INTO promo_record
    FROM public.promo_codes
    WHERE upper(code) = upper(promo)
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
      AND (max_uses IS NULL OR COALESCE(used_count, 0) < max_uses)
      AND product_subtotal >= COALESCE(min_order, 0)
    LIMIT 1;

    IF FOUND THEN
      IF promo_record.discount_type = 'percent' THEN
        discount_amount := round((product_subtotal * promo_record.discount_value) / 100);
      ELSIF promo_record.discount_type = 'fixed' THEN
        discount_amount := promo_record.discount_value;
      END IF;

      discount_amount := LEAST(discount_amount, product_subtotal);
      promo := promo_record.code;
    ELSE
      promo := NULL;
      discount_amount := 0;
    END IF;
  END IF;

  order_subtotal := product_subtotal + delivery_fee;
  order_total := GREATEST(0, order_subtotal - discount_amount);

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
    discount_amount,
    order_subtotal,
    order_total,
    nullif(order_data->>'notes', '')
  );

  FOR item IN SELECT value FROM jsonb_array_elements(cart_items)
  LOOP
    item_product_id := nullif(item->>'id', '')::uuid;
    item_quantity := COALESCE((item->>'qty')::integer, 1);

    SELECT p.*
    INTO product_record
    FROM public.products p
    WHERE p.id = item_product_id
      AND p.is_active = true;

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
      product_record.name,
      product_record.price,
      nullif(item->>'selectedSize', ''),
      nullif(item->>'selectedColor', ''),
      item_quantity,
      product_record.price * item_quantity
    );
  END LOOP;

  RETURN QUERY SELECT new_order_id, new_order_number;
END;
$$;

REVOKE ALL ON FUNCTION public.create_checkout_order(jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_checkout_order(jsonb, jsonb) TO anon, authenticated;

-- Recreate status RPC with an admin check.
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
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin privileges required';
  END IF;

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
