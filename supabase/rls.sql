-- ============================================================
-- MOVEK ROW LEVEL SECURITY POLICIES
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- Helper function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin can update all profiles"
  ON profiles FOR UPDATE
  USING (public.is_admin());

-- ============================================================
-- CLIENTS — admin only
-- ============================================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to clients"
  ON clients FOR ALL
  USING (public.is_admin());

CREATE POLICY "Client can view own record"
  ON clients FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Client can insert own record"
  ON clients FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Client can update own record"
  ON clients FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- FOURNISSEURS — admin only (+ self access)
-- ============================================================
ALTER TABLE fournisseurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to fournisseurs"
  ON fournisseurs FOR ALL
  USING (public.is_admin());

CREATE POLICY "Fournisseur can view own record"
  ON fournisseurs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Fournisseur can insert own record"
  ON fournisseurs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Fournisseur can update own record"
  ON fournisseurs FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- PRODUCT FAMILIES — public read, admin write
-- ============================================================
ALTER TABLE product_families ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product families"
  ON product_families FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage product families"
  ON product_families FOR ALL
  USING (public.is_admin());

-- ============================================================
-- PRODUCT SUBCATEGORIES — public read, admin write
-- ============================================================
ALTER TABLE product_subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subcategories"
  ON product_subcategories FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage subcategories"
  ON product_subcategories FOR ALL
  USING (public.is_admin());

-- ============================================================
-- PRODUCTS — layered access
-- ============================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public: can see approved + active products
CREATE POLICY "Public can view active approved products"
  ON products FOR SELECT
  USING (is_active = TRUE AND is_approved = TRUE);

-- Fournisseur: can manage own products
CREATE POLICY "Fournisseur can view own products"
  ON products FOR SELECT
  USING (
    fournisseur_id IN (
      SELECT id FROM fournisseurs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Fournisseur can insert own products"
  ON products FOR INSERT
  WITH CHECK (
    fournisseur_id IN (
      SELECT id FROM fournisseurs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Fournisseur can update own products"
  ON products FOR UPDATE
  USING (
    fournisseur_id IN (
      SELECT id FROM fournisseurs WHERE user_id = auth.uid()
    )
  );

-- Admin: full access
CREATE POLICY "Admin full access to products"
  ON products FOR ALL
  USING (public.is_admin());

-- ============================================================
-- PRODUCT IMAGES — public read, owner/admin write
-- ============================================================
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product images"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "Fournisseur can manage own product images"
  ON product_images FOR ALL
  USING (
    product_id IN (
      SELECT p.id FROM products p
      JOIN fournisseurs f ON p.fournisseur_id = f.id
      WHERE f.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage all product images"
  ON product_images FOR ALL
  USING (public.is_admin());

-- ============================================================
-- TECHNICAL SHEETS — public read, owner/admin write
-- ============================================================
ALTER TABLE technical_sheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view technical sheets"
  ON technical_sheets FOR SELECT
  USING (true);

CREATE POLICY "Fournisseur can manage own technical sheets"
  ON technical_sheets FOR ALL
  USING (
    product_id IN (
      SELECT p.id FROM products p
      JOIN fournisseurs f ON p.fournisseur_id = f.id
      WHERE f.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage all technical sheets"
  ON technical_sheets FOR ALL
  USING (public.is_admin());

-- ============================================================
-- INTERESTS — client can manage own, admin can see all
-- ============================================================
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Client can view own interests"
  ON interests FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Client can insert own interests"
  ON interests FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Client can delete own interests"
  ON interests FOR DELETE
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin full access to interests"
  ON interests FOR ALL
  USING (public.is_admin());

-- ============================================================
-- INTROUVABLE REQUESTS — public insert, admin manage
-- ============================================================
ALTER TABLE introuvable_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit introuvable request"
  ON introuvable_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can manage introuvable requests"
  ON introuvable_requests FOR ALL
  USING (public.is_admin());

-- ============================================================
-- NOTIFICATIONS — user can see own, admin can manage
-- ============================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "User can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admin can manage all notifications"
  ON notifications FOR ALL
  USING (public.is_admin());

-- ============================================================
-- SERVICES — public read, admin manage
-- ============================================================
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admin can manage services"
  ON services FOR ALL
  USING (public.is_admin());

-- ============================================================
-- BLOG POSTS — public read published, admin manage
-- ============================================================
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Admin can manage blog posts"
  ON blog_posts FOR ALL
  USING (public.is_admin());

-- ============================================================
-- TECHNICAL DOCUMENTS — public read, admin manage
-- ============================================================
ALTER TABLE technical_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view downloadable documents"
  ON technical_documents FOR SELECT
  USING (is_downloadable = TRUE);

CREATE POLICY "Admin can manage technical documents"
  ON technical_documents FOR ALL
  USING (public.is_admin());

-- ============================================================
-- ORDERS — client can see own, admin full access
-- ============================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Client can view own orders"
  ON orders FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin full access to orders"
  ON orders FOR ALL
  USING (public.is_admin());
