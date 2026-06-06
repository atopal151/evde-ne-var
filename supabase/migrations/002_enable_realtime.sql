-- Supabase Realtime — stok ve alışveriş listesi
-- Dashboard → Database → Publications → supabase_realtime alternatif yol

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE shopping_list;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE inventory;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
