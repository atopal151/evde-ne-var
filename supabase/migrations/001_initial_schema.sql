-- Ne Pişirsem? — İlk veritabanı şeması
-- Supabase SQL Editor veya CLI ile çalıştırın

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ev yönetimi
CREATE TABLE IF NOT EXISTS homes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kullanıcı profilleri (auth.users ile bağlı)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  home_id UUID REFERENCES homes(id) ON DELETE SET NULL,
  full_name VARCHAR(255),
  dietary_preferences TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stok
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  barcode VARCHAR(50),
  category VARCHAR(100) DEFAULT 'Diğer',
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1.0,
  unit VARCHAR(50) NOT NULL DEFAULT 'adet',
  expiration_date DATE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alışveriş listesi
CREATE TABLE IF NOT EXISTS shopping_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1.0,
  unit VARCHAR(50) DEFAULT 'adet',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_home_id ON inventory(home_id);
CREATE INDEX IF NOT EXISTS idx_inventory_expiration ON inventory(expiration_date);
CREATE INDEX IF NOT EXISTS idx_shopping_list_home_id ON shopping_list(home_id);

-- updated_at tetikleyicisi
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS inventory_updated_at ON inventory;
CREATE TRIGGER inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE homes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;

-- Geçici geliştirme politikaları (auth entegrasyonu sonrası sıkılaştırılacak)
CREATE POLICY "homes_select" ON homes FOR SELECT USING (true);
CREATE POLICY "inventory_all" ON inventory FOR ALL USING (true);
CREATE POLICY "shopping_list_all" ON shopping_list FOR ALL USING (true);
CREATE POLICY "profiles_all" ON profiles FOR ALL USING (true);
