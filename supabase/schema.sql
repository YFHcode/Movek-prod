-- ============================================================
-- MOVEK DATABASE SCHEMA
-- Complete DDL for all tables, views, triggers
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client', 'fournisseur')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. CLIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nom_prenom TEXT NOT NULL,
  fonction TEXT,
  entreprise TEXT NOT NULL,
  adresse TEXT,
  ville TEXT,
  pays TEXT,
  email TEXT NOT NULL,
  telephone TEXT,
  message TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. FOURNISSEURS
-- ============================================================
CREATE TABLE IF NOT EXISTS fournisseurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nom_prenom TEXT NOT NULL,
  fonction TEXT,
  entreprise TEXT NOT NULL,
  adresse TEXT,
  ville TEXT,
  pays TEXT,
  email TEXT NOT NULL,
  telephone TEXT,
  message TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. PRODUCT FAMILIES
-- ============================================================
CREATE TABLE IF NOT EXISTS product_families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  ordre INT,
  created_by_admin BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- 5. PRODUCT SUBCATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS product_subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES product_families(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  slug TEXT NOT NULL
);

-- ============================================================
-- 6. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fournisseur_id UUID REFERENCES fournisseurs(id) ON DELETE SET NULL,
  article TEXT NOT NULL,
  designation TEXT NOT NULL,
  marque TEXT,
  reference TEXT,
  origine TEXT,
  quantite INT,
  unite TEXT,
  lieu_expedition TEXT,
  garantie BOOLEAN DEFAULT FALSE,
  garantie_mois INT,
  etat TEXT CHECK (etat IN ('neuf', 'neuf-ancien', 'utilise', 'reconditionne')),
  prix DECIMAL,
  devise TEXT DEFAULT 'MAD',
  family_id UUID REFERENCES product_families(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES product_subcategories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full text search index
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('french',
      COALESCE(article, '') || ' ' ||
      COALESCE(designation, '') || ' ' ||
      COALESCE(marque, '') || ' ' ||
      COALESCE(reference, '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS products_search_idx ON products USING gin(search_vector);
CREATE INDEX IF NOT EXISTS products_family_idx ON products(family_id);
CREATE INDEX IF NOT EXISTS products_subcategory_idx ON products(subcategory_id);
CREATE INDEX IF NOT EXISTS products_etat_idx ON products(etat);
CREATE INDEX IF NOT EXISTS products_active_approved_idx ON products(is_active, is_approved);

-- ============================================================
-- 7. PRODUCT IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  ordre INT DEFAULT 0
);

-- ============================================================
-- 8. TECHNICAL SHEETS
-- ============================================================
CREATE TABLE IF NOT EXISTS technical_sheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT
);

-- ============================================================
-- 9. INTERESTS (7-day auto-expire)
-- ============================================================
CREATE TABLE IF NOT EXISTS interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  is_deleted BOOLEAN DEFAULT FALSE,
  UNIQUE(client_id, product_id)
);

-- ============================================================
-- 10. INTROUVABLE REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS introuvable_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom_prenom TEXT NOT NULL,
  fonction TEXT,
  entreprise TEXT NOT NULL,
  adresse TEXT,
  pays TEXT,
  email TEXT NOT NULL,
  telephone TEXT,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'resolved', 'closed'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN (
    'new_product', 'catalogue', 'promotion',
    'evenement', 'commande', 'technique'
  )),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. SERVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- 13. BLOG POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  contenu TEXT NOT NULL,
  category TEXT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 14. TECHNICAL DOCUMENTS LIBRARY
-- ============================================================
CREATE TABLE IF NOT EXISTS technical_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT,
  marque TEXT,
  produit TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT,
  is_downloadable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 15. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  statut TEXT DEFAULT 'pending' CHECK (statut IN (
    'pending', 'confirmed', 'quality_check',
    'invoiced', 'shipped', 'delivered', 'cancelled'
  )),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PUBLIC PRODUCTS VIEW (hides prix & fournisseur_id)
-- ============================================================
CREATE OR REPLACE VIEW public_products AS
  SELECT
    id, article, designation, marque,
    reference, origine, quantite, unite,
    lieu_expedition, garantie, garantie_mois,
    etat, family_id, subcategory_id,
    is_active, is_approved, created_at
    -- prix is intentionally excluded
    -- fournisseur_id is intentionally excluded
  FROM products
  WHERE is_active = TRUE AND is_approved = TRUE;

-- ============================================================
-- ADMIN RECENT ACTIVITY VIEW
-- ============================================================
CREATE OR REPLACE VIEW admin_recent_activity_view AS
SELECT 
  'client' as type,
  id,
  nom_prenom as label,
  entreprise as sublabel,
  created_at
FROM clients
UNION ALL
SELECT 
  'fournisseur' as type,
  id,
  nom_prenom as label,
  entreprise as sublabel,
  created_at
FROM fournisseurs
UNION ALL
SELECT 
  'product' as type,
  id,
  article as label,
  marque as sublabel,
  created_at
FROM products
UNION ALL
SELECT 
  'order' as type,
  id,
  statut as label,
  '' as sublabel,
  created_at
FROM orders
UNION ALL
SELECT 
  'introuvable' as type,
  id,
  entreprise as label,
  pays as sublabel,
  created_at
FROM introuvable_requests;

-- ============================================================
-- AUTH TRIGGER: auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- CRON: Auto-delete expired interests (pg_cron)
-- Run this AFTER enabling pg_cron extension in Supabase dashboard
-- ============================================================
-- Enable pg_cron (must be done via Supabase Dashboard > Extensions)
-- Then run:
-- SELECT cron.schedule(
--   'delete-expired-interests',
--   '0 * * * *',  -- every hour
--   $$DELETE FROM interests WHERE expires_at < NOW() OR is_deleted = TRUE$$
-- );
