-- Aile paylaşımı: davet, onay, ortak mutfak
-- 004_auth_rls.sql ve 005_ensure_profile.sql sonrası çalıştırın

-- Üyelik tablosu (aynı ev = ortak stok + alışveriş listesi)
CREATE TABLE IF NOT EXISTS home_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (home_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_home_members_home ON home_members(home_id);
CREATE INDEX IF NOT EXISTS idx_home_members_user ON home_members(user_id);

-- Davet tablosu
CREATE TABLE IF NOT EXISTS home_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_home_invitations_home ON home_invitations(home_id);
CREATE INDEX IF NOT EXISTS idx_home_invitations_email ON home_invitations(lower(invitee_email));

CREATE UNIQUE INDEX IF NOT EXISTS idx_home_invitations_pending_unique
  ON home_invitations(home_id, lower(invitee_email))
  WHERE status = 'pending';

-- Mevcut kullanıcıları üye tablosuna taşı
INSERT INTO home_members (home_id, user_id, role)
SELECT p.home_id, p.id, 'owner'
FROM profiles p
WHERE p.home_id IS NOT NULL
ON CONFLICT (home_id, user_id) DO NOTHING;

-- Yeni kullanıcı trigger'ını güncelle (ev + profil + üyelik)
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

  INSERT INTO public.home_members (home_id, user_id, role)
  VALUES (new_home_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$;

-- ensure_user_profile: üyelik kaydı ekle
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
    INSERT INTO home_members (home_id, user_id, role)
    VALUES (existing, uid, 'owner')
    ON CONFLICT (home_id, user_id) DO NOTHING;

    out_home_id := existing;
    RETURN NEXT;
    RETURN;
  END IF;

  INSERT INTO homes (name) VALUES (label || ' — Mutfak') RETURNING id INTO new_home;

  INSERT INTO profiles (id, home_id, full_name)
  VALUES (uid, new_home, NULLIF(label, 'Evim'))
  ON CONFLICT (id) DO UPDATE
    SET home_id = COALESCE(profiles.home_id, EXCLUDED.home_id);

  INSERT INTO home_members (home_id, user_id, role)
  VALUES (new_home, uid, 'owner')
  ON CONFLICT (home_id, user_id) DO NOTHING;

  out_home_id := new_home;
  RETURN NEXT;
END;
$$;

-- Kullanıcının erişebildiği evler
CREATE OR REPLACE FUNCTION public.user_accessible_home_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT home_id FROM profiles WHERE id = auth.uid() AND home_id IS NOT NULL
  UNION
  SELECT home_id FROM home_members WHERE user_id = auth.uid();
$$;

-- Davet gönder
CREATE OR REPLACE FUNCTION public.send_home_invitation(p_invitee_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  user_email text;
  user_home uuid;
  normalized_email text;
  invite_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Oturum gerekli';
  END IF;

  normalized_email := lower(trim(p_invitee_email));
  IF normalized_email = '' OR position('@' in normalized_email) = 0 THEN
    RAISE EXCEPTION 'Geçerli bir e-posta girin';
  END IF;

  SELECT email INTO user_email FROM auth.users WHERE id = uid;
  IF lower(user_email) = normalized_email THEN
    RAISE EXCEPTION 'Kendinizi davet edemezsiniz';
  END IF;

  SELECT home_id INTO user_home FROM profiles WHERE id = uid;
  IF user_home IS NULL THEN
    RAISE EXCEPTION 'Mutfak evi bulunamadı';
  END IF;

  INSERT INTO home_members (home_id, user_id, role)
  VALUES (user_home, uid, 'owner')
  ON CONFLICT (home_id, user_id) DO NOTHING;

  IF EXISTS (
    SELECT 1
    FROM home_members hm
    JOIN auth.users u ON u.id = hm.user_id
    WHERE hm.home_id = user_home AND lower(u.email) = normalized_email
  ) THEN
    RAISE EXCEPTION 'Bu kişi zaten mutfağınızda';
  END IF;

  IF EXISTS (
    SELECT 1 FROM home_invitations
    WHERE home_id = user_home
      AND lower(invitee_email) = normalized_email
      AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Bu kişiye zaten davet gönderildi';
  END IF;

  INSERT INTO home_invitations (home_id, inviter_id, invitee_email, status)
  VALUES (user_home, uid, normalized_email, 'pending')
  RETURNING id INTO invite_id;

  RETURN invite_id;
END;
$$;

-- Daveti yanıtla (kabul / red)
CREATE OR REPLACE FUNCTION public.respond_home_invitation(
  p_invitation_id uuid,
  p_accept boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  user_email text;
  inv home_invitations%ROWTYPE;
  old_home uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Oturum gerekli';
  END IF;

  SELECT email INTO user_email FROM auth.users WHERE id = uid;

  SELECT * INTO inv
  FROM home_invitations
  WHERE id = p_invitation_id AND status = 'pending';

  IF inv IS NULL THEN
    RAISE EXCEPTION 'Davet bulunamadı veya süresi dolmuş';
  END IF;

  IF lower(inv.invitee_email) <> lower(user_email) THEN
    RAISE EXCEPTION 'Bu davet size ait değil';
  END IF;

  IF NOT p_accept THEN
    UPDATE home_invitations
    SET status = 'rejected', responded_at = NOW()
    WHERE id = p_invitation_id;
    RETURN;
  END IF;

  SELECT home_id INTO old_home FROM profiles WHERE id = uid;

  INSERT INTO home_members (home_id, user_id, role)
  VALUES (inv.home_id, uid, 'member')
  ON CONFLICT (home_id, user_id) DO NOTHING;

  IF old_home IS NOT NULL AND old_home <> inv.home_id THEN
    UPDATE inventory SET home_id = inv.home_id WHERE home_id = old_home;
    UPDATE shopping_list SET home_id = inv.home_id WHERE home_id = old_home;
    DELETE FROM home_members WHERE home_id = old_home AND user_id = uid;
  END IF;

  UPDATE profiles SET home_id = inv.home_id WHERE id = uid;

  UPDATE home_invitations
  SET status = 'accepted', responded_at = NOW()
  WHERE id = p_invitation_id;

  UPDATE home_invitations
  SET status = 'cancelled', responded_at = NOW()
  WHERE lower(invitee_email) = lower(user_email)
    AND status = 'pending'
    AND id <> p_invitation_id;
END;
$$;

-- Daveti iptal et
CREATE OR REPLACE FUNCTION public.cancel_home_invitation(p_invitation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Oturum gerekli';
  END IF;

  UPDATE home_invitations
  SET status = 'cancelled', responded_at = NOW()
  WHERE id = p_invitation_id
    AND inviter_id = uid
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Davet iptal edilemedi';
  END IF;
END;
$$;

-- Mutfak üyelerini listele
CREATE OR REPLACE FUNCTION public.get_home_members()
RETURNS TABLE(
  user_id uuid,
  full_name text,
  email text,
  role text,
  joined_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  user_home uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Oturum gerekli';
  END IF;

  SELECT home_id INTO user_home FROM profiles WHERE id = uid;
  IF user_home IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM home_members WHERE home_id = user_home AND user_id = uid
  ) THEN
    RAISE EXCEPTION 'Bu mutfağa erişiminiz yok';
  END IF;

  RETURN QUERY
  SELECT
    hm.user_id,
    COALESCE(p.full_name, split_part(u.email, '@', 1))::text,
    u.email::text,
    hm.role::text,
    hm.joined_at
  FROM home_members hm
  JOIN auth.users u ON u.id = hm.user_id
  LEFT JOIN profiles p ON p.id = hm.user_id
  WHERE hm.home_id = user_home
  ORDER BY hm.joined_at ASC;
END;
$$;

-- Davetleri listele
CREATE OR REPLACE FUNCTION public.get_home_invitations()
RETURNS TABLE(
  id uuid,
  home_id uuid,
  home_name text,
  inviter_id uuid,
  inviter_name text,
  invitee_email text,
  status text,
  direction text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  user_email text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Oturum gerekli';
  END IF;

  SELECT email INTO user_email FROM auth.users WHERE id = uid;

  RETURN QUERY
  SELECT
    i.id,
    i.home_id,
    h.name::text,
    i.inviter_id,
    COALESCE(p.full_name, split_part(u.email, '@', 1))::text,
    i.invitee_email::text,
    i.status::text,
    CASE
      WHEN i.inviter_id = uid THEN 'outgoing'
      ELSE 'incoming'
    END::text,
    i.created_at
  FROM home_invitations i
  JOIN homes h ON h.id = i.home_id
  JOIN auth.users u ON u.id = i.inviter_id
  LEFT JOIN profiles p ON p.id = i.inviter_id
  WHERE i.status = 'pending'
    AND (
      i.inviter_id = uid
      OR lower(i.invitee_email) = lower(user_email)
    )
  ORDER BY i.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_home_invitation(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_home_invitation(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_home_invitation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_home_members() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_home_invitations() TO authenticated;

-- RLS
ALTER TABLE home_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inventory_member" ON inventory;
DROP POLICY IF EXISTS "shopping_list_member" ON shopping_list;

CREATE POLICY "inventory_member" ON inventory
  FOR ALL USING (
    home_id IN (SELECT public.user_accessible_home_ids())
  )
  WITH CHECK (
    home_id IN (SELECT public.user_accessible_home_ids())
  );

CREATE POLICY "shopping_list_member" ON shopping_list
  FOR ALL USING (
    home_id IN (SELECT public.user_accessible_home_ids())
  )
  WITH CHECK (
    home_id IN (SELECT public.user_accessible_home_ids())
  );

CREATE POLICY "home_members_select" ON home_members
  FOR SELECT USING (
    home_id IN (SELECT public.user_accessible_home_ids())
  );

CREATE POLICY "home_invitations_select" ON home_invitations
  FOR SELECT USING (
    inviter_id = auth.uid()
    OR lower(invitee_email) = lower((
      SELECT email FROM auth.users WHERE id = auth.uid()
    ))
  );

-- Realtime: davetler anlık güncellensin
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE home_invitations;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
