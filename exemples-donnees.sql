-- EXEMPLES DE DONNEES pour tester l'application
-- Executer apres avoir execute supabase-schema.sql

-- =============================================
-- CODES PROMO D'EXEMPLE
-- =============================================

-- Code promo 10% de reduction
INSERT INTO promo_codes (code, discount_type, discount_value, min_order, is_active)
VALUES ('INTIME10', 'percent', 10, 0, true);

-- Code promo 500 DZD de reduction sur commandes de 2000 DZD+
INSERT INTO promo_codes (code, discount_type, discount_value, min_order, is_active)
VALUES ('WELCOME500', 'fixed', 500, 2000, true);

-- Code promo limite a 10 utilisations
INSERT INTO promo_codes (code, discount_type, discount_value, min_order, max_uses, is_active)
VALUES ('FIRST50', 'percent', 50, 1000, 10, true);

-- Code promo avec expiration (30 jours a partir d'aujourd'hui)
INSERT INTO promo_codes (code, discount_type, discount_value, min_order, expires_at, is_active)
VALUES ('LIMITED20', 'percent', 20, 0, NOW() + INTERVAL '30 days', true);

-- =============================================
-- PRODUITS D'EXEMPLE
-- =============================================

-- Soutien-gorge
INSERT INTO products (
  name, 
  category, 
  description, 
  price, 
  original_price,
  sizes, 
  colors, 
  images,
  badge,
  stock, 
  is_active
) VALUES (
  'Soutien-gorge push-up noir',
  'Soutien-gorge',
  'Un soutien-gorge push-up classique alliant maintien parfait et galbe elegant. Realise avec une dentelle delicate et des bonnets moules.',
  2400,
  NULL,
  ARRAY['85B', '90C', '95D'],
  ARRAY['noir'],
  ARRAY['https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&auto=format&fit=crop&q=80'],
  NULL,
  25,
  true
);

-- Ensemble
INSERT INTO products (
  name,
  category,
  description,
  price,
  original_price,
  sizes,
  colors,
  images,
  badge,
  stock,
  is_active
) VALUES (
  'Ensemble dentelle rose',
  'Ensembles',
  'Un ensemble de lingerie ultra-feminin orne de broderies florales raffinees. Comprend le soutien-gorge corbeille assorti d''une culotte.',
  4800,
  6200,
  ARRAY['85B', '90C', '95D', 'S', 'M', 'L'],
  ARRAY['rose'],
  ARRAY['https://images.unsplash.com/photo-1616606103915-dea7be78896d?w=600&auto=format&fit=crop&q=80'],
  'promo',
  15,
  true
);

-- Culotte
INSERT INTO products (
  name,
  category,
  description,
  price,
  original_price,
  sizes,
  colors,
  images,
  badge,
  stock,
  is_active
) VALUES (
  'Culotte taille haute nude',
  'Culottes&Strings',
  'Une culotte haute sans couture a effet gainant et discret sous les vetements. Un basique indispensable.',
  1200,
  NULL,
  ARRAY['XS', 'S', 'M', 'L', 'XL'],
  ARRAY['nude'],
  ARRAY['https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=600&auto=format&fit=crop&q=80'],
  NULL,
  50,
  true
);

-- Nuisette
INSERT INTO products (
  name,
  category,
  description,
  price,
  original_price,
  sizes,
  colors,
  images,
  badge,
  stock,
  is_active
) VALUES (
  'Nuisette satinee blanc',
  'Nuisettes',
  'Une nuisette en satin de soie fluide ornee de dentelle fine au decollete. Des bretelles croisees au dos pour une allure delicate.',
  3500,
  NULL,
  ARRAY['XS', 'S', 'M', 'L', 'XL'],
  ARRAY['blanc'],
  ARRAY['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&auto=format&fit=crop&q=80'],
  'new',
  20,
  true
);

-- Pyjama
INSERT INTO products (
  name,
  category,
  description,
  price,
  original_price,
  sizes,
  colors,
  images,
  badge,
  stock,
  is_active
) VALUES (
  'Pyjama fleuri rose',
  'Pyjamas',
  'Ensemble de pyjama deux pieces en viscose legere. Chemise boutonnee et pantalon fluide avec motifs floraux printaniers.',
  5200,
  NULL,
  ARRAY['XS', 'S', 'M', 'L', 'XL'],
  ARRAY['rose'],
  ARRAY['https://images.unsplash.com/photo-1608748010899-18f300247112?w=600&auto=format&fit=crop&q=80'],
  NULL,
  12,
  true
);

-- Corset
INSERT INTO products (
  name,
  category,
  description,
  price,
  original_price,
  sizes,
  colors,
  images,
  badge,
  stock,
  is_active
) VALUES (
  'Corset brode noir',
  'Corsets',
  'Un corset d''exception structure avec baleines souples et broderies contrastantes. Sublime la cambrure et affine la taille.',
  6500,
  NULL,
  ARRAY['XS', 'S', 'M', 'L', 'XL'],
  ARRAY['noir'],
  ARRAY['https://images.unsplash.com/photo-1502163140606-888448ae8cfe?w=600&auto=format&fit=crop&q=80'],
  NULL,
  8,
  true
);

-- =============================================
-- COMMANDE TEST
-- =============================================

-- Insertion d'une commande exemple
INSERT INTO orders (
  order_number,
  status,
  customer_name,
  customer_phone,
  address,
  wilaya,
  commune,
  payment_method,
  promo_code,
  discount_amount,
  subtotal,
  total
) VALUES (
  'IC-2024-0001',
  'en_attente',
  'Amina Benali',
  '0555123456',
  '12 Rue des Roses, Cite Belle Vue',
  'Blida',
  'Blida Centre',
  'livraison',
  'INTIME10',
  240,
  2900,
  2660
);

-- Recuperer l'ID de la commande pour les items
DO $$
DECLARE
  order_id_var uuid;
  product_id_var uuid;
BEGIN
  -- Obtenir l'ID de la commande
  SELECT id INTO order_id_var FROM orders WHERE order_number = 'IC-2024-0001';
  
  -- Obtenir l'ID du premier produit
  SELECT id INTO product_id_var FROM products WHERE name = 'Soutien-gorge push-up noir';
  
  -- Inserer un item de commande
  INSERT INTO order_items (
    order_id,
    product_id,
    product_name,
    product_price,
    size,
    color,
    quantity,
    subtotal
  ) VALUES (
    order_id_var,
    product_id_var,
    'Soutien-gorge push-up noir',
    2400,
    '90C',
    'noir',
    1,
    2400
  );
  
  -- Obtenir l'ID du deuxieme produit
  SELECT id INTO product_id_var FROM products WHERE name = 'Culotte taille haute nude';
  
  -- Inserer un deuxieme item
  INSERT INTO order_items (
    order_id,
    product_id,
    product_name,
    product_price,
    size,
    color,
    quantity,
    subtotal
  ) VALUES (
    order_id_var,
    product_id_var,
    'Culotte taille haute nude',
    1200,
    'M',
    'nude',
    1,
    1200
  );
END $$;

-- =============================================
-- VERIFICATION
-- =============================================

-- Verifier les produits
SELECT name, category, price, stock FROM products WHERE is_active = true;

-- Verifier les codes promo
SELECT code, discount_type, discount_value, is_active FROM promo_codes;

-- Verifier les commandes
SELECT order_number, customer_name, total, status FROM orders;

-- Verifier les parametres
SELECT key, value FROM settings;
