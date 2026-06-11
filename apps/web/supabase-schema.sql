-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- Creates the product and collection tables for Rehab Store

-- Products table: stores full Product JSON in `data` column
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_data_category ON products USING GIN ((data->'category'));
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);

-- Auto-update updated_at on products
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for product images:
-- 1. Go to Dashboard → Storage → Create a new bucket named "product-images"
-- 2. Set it to "Public" (so images are publicly accessible)
-- 3. In the bucket's "Policies" tab, add a policy to allow public reads:
--    - Name: "Public Read"
--    - Allowed operations: SELECT
--    - Policy definition: true
-- 4. Optionally add a policy for authenticated uploads (for admin):
--    - Name: "Admin Upload"
--    - Allowed operations: INSERT
--    - Policy definition: (role() = 'service_role')
-- (Alternatively, the server-side upload in supabase-storage.ts uses the service role
--  key which bypasses RLS, so step 4 may not be needed.)
