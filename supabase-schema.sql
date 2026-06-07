-- INTIME & CO - Schema Supabase complet
-- Executer ce script dans SQL Editor de Supabase

-- =============================================
-- TABLE: products
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  original_price numeric(10,2),
  sizes text[],
  colors text[],
  images text[],
  variant_options jsonb DEFAULT '[]'::jsonb,
  badge text,
  stock integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS variant_options jsonb DEFAULT '[]'::jsonb;

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products ADD CONSTRAINT products_category_check
  CHECK (category = ANY (ARRAY[
    'Soutien-gorge',
    'Ensembles',
    'Culottes',
    'Pyjamas',
    'Nuisettes',
    'Corsets'
  ]));

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_badge_check;
ALTER TABLE products ADD CONSTRAINT products_badge_check
  CHECK (badge IS NULL OR badge = ANY (ARRAY['new', 'promo']));

-- =============================================
-- TABLE: orders
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  status text DEFAULT 'en_attente',
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  address text NOT NULL,
  wilaya text NOT NULL,
  commune text NOT NULL,
  payment_method text NOT NULL,
  promo_code text,
  discount_amount numeric(10,2) DEFAULT 0,
  subtotal numeric(10,2) NOT NULL,
  total numeric(10,2) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method = ANY (ARRAY['livraison', 'baridimob', 'ccp']));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status = ANY (ARRAY['en_attente', 'confirme', 'en_preparation', 'expedie', 'livre', 'annule']));

-- =============================================
-- TABLE: order_items
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_price numeric(10,2) NOT NULL,
  size text,
  color text,
  quantity integer NOT NULL,
  subtotal numeric(10,2) NOT NULL
);

-- =============================================
-- TABLE: promo_codes
-- =============================================
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL,
  discount_value numeric(10,2) NOT NULL,
  min_order numeric(10,2) DEFAULT 0,
  max_uses integer,
  used_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- TABLE: settings
-- =============================================
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Products: public read (is_active = true), authenticated write
DROP POLICY IF EXISTS "Public can read active products" ON products;
CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can do all on products" ON products;
CREATE POLICY "Authenticated users can do all on products"
  ON products FOR ALL
  USING (auth.role() = 'authenticated');

-- Orders: insert allowed for anonymous, authenticated full access
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can read all orders" ON orders;
CREATE POLICY "Authenticated users can read all orders"
  ON orders FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;
CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Order items: same as orders
DROP POLICY IF EXISTS "Anyone can insert order_items" ON order_items;
CREATE POLICY "Anyone can insert order_items"
  ON order_items FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can read order_items" ON order_items;
CREATE POLICY "Authenticated users can read order_items"
  ON order_items FOR SELECT
  USING (auth.role() = 'authenticated');

-- Promo codes: public can read for validation, authenticated full access
DROP POLICY IF EXISTS "Public can read active promo codes for validation" ON promo_codes;
CREATE POLICY "Public can read active promo codes for validation"
  ON promo_codes FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can do all on promo_codes" ON promo_codes;
CREATE POLICY "Authenticated users can do all on promo_codes"
  ON promo_codes FOR ALL
  USING (auth.role() = 'authenticated');

-- Settings: public read, authenticated write
DROP POLICY IF EXISTS "Public can read settings" ON settings;
CREATE POLICY "Public can read settings"
  ON settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can write settings" ON settings;
CREATE POLICY "Authenticated users can write settings"
  ON settings FOR ALL
  USING (auth.role() = 'authenticated');

-- =============================================
-- SEED DATA: settings
-- =============================================
INSERT INTO settings (key, value) VALUES
('store_name', 'Intime & Co'),
('announcement_text', 'Livraison gratuite des 3000 DZD d''achat — Paiement a la livraison disponible'),
('delivery_fee', '500'),
('free_delivery_threshold', '3000'),
('instagram_url', 'https://www.instagram.com/inti.me15'),
('store_phone', ''),
('store_address', 'Blida, Algerie'),
('store_hours', 'Lun–Sam : 09h00 – 19h00')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================
-- INDEXES pour performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);

-- =============================================
-- STORAGE BUCKET: product-images
-- =============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Product images are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

CREATE POLICY "Product images are publicly readable"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- =============================================
-- RPC: public checkout order creation
-- =============================================
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
  promo text := nullif(order_data->>'promoCode', '');
BEGIN
  IF jsonb_typeof(cart_items) <> 'array' OR jsonb_array_length(cart_items) = 0 THEN
    RAISE EXCEPTION 'cart_items must be a non-empty array';
  END IF;

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

CREATE OR REPLACE FUNCTION public.handle_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.promo_code IS NOT NULL THEN
    UPDATE public.promo_codes
    SET used_count = COALESCE(used_count, 0) + 1
    WHERE upper(code) = upper(NEW.promo_code);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_order_created ON public.orders;
CREATE TRIGGER on_order_created
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_order();

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

DROP TRIGGER IF EXISTS on_order_item_created ON public.order_items;
CREATE TRIGGER on_order_item_created
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_order_item();

-- =============================================
-- FONCTION: mise a jour automatique updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
