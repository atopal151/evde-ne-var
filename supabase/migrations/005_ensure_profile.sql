-- Eksik profil/ev için otomatik tamamlama (004 sonrası çalıştırın)
CREATE OR REPLACE FUNCTION public.ensure_user_profile(p_full_name text DEFAULT 'Evim')
RETURNS TABLE(out_home_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  existing uuid;
  new_home uuid;
  label text := COALESCE(NULLIF(TRIM(p_full_name), ''), 'Evim');
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT p.home_id INTO existing FROM profiles p WHERE p.id = uid;
  IF existing IS NOT NULL THEN
    out_home_id := existing;
    RETURN NEXT;
    RETURN;
  END IF;

  INSERT INTO homes (name) VALUES (label || ' — Mutfak') RETURNING id INTO new_home;

  INSERT INTO profiles (id, home_id, full_name)
  VALUES (uid, new_home, NULLIF(label, 'Evim'))
  ON CONFLICT (id) DO UPDATE
    SET home_id = COALESCE(profiles.home_id, EXCLUDED.home_id);

  out_home_id := new_home;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_user_profile(text) TO authenticated;
