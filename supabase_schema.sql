-- ========================================================
-- LUXECUT SALON SUPABASE SQL SCHEMA
-- Run this in your Supabase SQL Editor (supabase.com -> SQL Editor -> New Query)
-- ========================================================

-- 1. Create Visits Table
CREATE TABLE IF NOT EXISTS salon_visits (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  date DATE NOT NULL,
  time TEXT,
  services JSONB DEFAULT '[]'::jsonb,
  products JSONB DEFAULT '[]'::jsonb,
  services_total NUMERIC DEFAULT 0,
  products_total NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  grand_total NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'Cash',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Services Catalog Table
CREATE TABLE IF NOT EXISTS salon_services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Products Catalog Table
CREATE TABLE IF NOT EXISTS salon_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Employees Table
CREATE TABLE IF NOT EXISTS salon_employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'Stylist',
  aadhaar_number TEXT,
  address TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS) & Allow Public / Anon Access
ALTER TABLE salon_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write for salon_visits" ON salon_visits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for salon_services" ON salon_services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for salon_products" ON salon_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for salon_employees" ON salon_employees FOR ALL USING (true) WITH CHECK (true);

