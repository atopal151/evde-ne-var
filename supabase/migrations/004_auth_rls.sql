-- Auth: yeni kullanıcıya ev + profil, RLS sıkılaştırma
-- Supabase SQL Editor'de setup_all.sql sonrası çalıştırın

-- Eski açık politikaları kaldır
DROP POLICY IF EXISTS "homes_select" ON homes;
DROP POLICY IF EXISTS "homes_insert" ON homes;
DROP POLICY IF EXISTS "inventory_all" ON inventory;
DROP POLICY IF EXISTS "shopping_list_all" ON shopping_list;
DROP POLICY IF EXISTS "profiles_all" ON profiles;

-- Yeni kullanıcı: ev + profil oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_home_id UUID;
  display_name TEXT;
BEGIN
  display_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Evim');

  INSERT INTO public.homes (name)
  VALUES (display_name || ' — Mutfak')
  RETURNING id INTO new_home_id;

  INSERT INTO public.profiles (id, home_id, full_name)
  VALUES (
    NEW.id,
    new_home_id,
    NULLIF(TRIM(display_name), '')
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS: sadece kendi ev verisi
CREATE POLICY "homes_select_member" ON homes
  FOR SELECT USING (
    id IN (SELECT home_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "inventory_member" ON inventory
  FOR ALL USING (
    home_id IN (SELECT home_id FROM profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    home_id IN (SELECT home_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "shopping_list_member" ON shopping_list
  FOR ALL USING (
    home_id IN (SELECT home_id FROM profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    home_id IN (SELECT home_id FROM profiles WHERE id = auth.uid())
  );
