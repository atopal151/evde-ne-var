-- Demo ev kaydı (Supabase modunda NEXT_PUBLIC_DEMO_HOME_ID ile eşleşmeli)
INSERT INTO homes (id, name)
VALUES (
  '00000000-0000-4000-a800-000000000001'::uuid,
  'Demo Ev'
)
ON CONFLICT (id) DO NOTHING;

-- Auth öncesi geliştirme: ev oluşturma
DO $$
BEGIN
  CREATE POLICY "homes_insert" ON homes FOR INSERT WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
