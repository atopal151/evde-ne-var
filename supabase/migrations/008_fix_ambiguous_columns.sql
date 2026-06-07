-- PL/pgSQL RETURNS TABLE sütun adları (id, user_id) tablo sütunlarıyla çakışıyordu.
-- Hata: "column reference id/user_id is ambiguous"
-- 006 ve 007 sonrası çalıştırın.

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
#variable_conflict use_column
DECLARE
  v_uid uuid := auth.uid();
  v_home uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Oturum gerekli';
  END IF;

  SELECT p.home_id INTO v_home FROM profiles p WHERE p.id = v_uid;
  IF v_home IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO home_members (home_id, user_id, role)
  VALUES (v_home, v_uid, 'owner')
  ON CONFLICT (home_id, user_id) DO NOTHING;

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
  WHERE hm.home_id = v_home
  ORDER BY hm.joined_at ASC;
END;
$$;

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
#variable_conflict use_column
DECLARE
  v_uid uuid := auth.uid();
  v_email text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Oturum gerekli';
  END IF;

  v_email := public.current_user_email();
  IF v_email IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'Hesap e-postası bulunamadı';
  END IF;

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
      WHEN i.inviter_id = v_uid THEN 'outgoing'
      ELSE 'incoming'
    END::text,
    i.created_at
  FROM home_invitations i
  JOIN homes h ON h.id = i.home_id
  JOIN auth.users u ON u.id = i.inviter_id
  LEFT JOIN profiles p ON p.id = i.inviter_id
  WHERE i.status = 'pending'
    AND (
      i.inviter_id = v_uid
      OR lower(i.invitee_email) = v_email
    )
  ORDER BY i.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.send_home_invitation(p_invitee_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_user_email text;
  v_home uuid;
  v_normalized text;
  v_invite_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Oturum gerekli';
  END IF;

  v_normalized := lower(trim(p_invitee_email));
  IF v_normalized = '' OR position('@' in v_normalized) = 0 THEN
    RAISE EXCEPTION 'Geçerli bir e-posta girin';
  END IF;

  SELECT u.email INTO v_user_email FROM auth.users u WHERE u.id = v_uid;
  IF lower(v_user_email) = v_normalized THEN
    RAISE EXCEPTION 'Kendinizi davet edemezsiniz';
  END IF;

  SELECT p.home_id INTO v_home FROM profiles p WHERE p.id = v_uid;
  IF v_home IS NULL THEN
    RAISE EXCEPTION 'Mutfak evi bulunamadı';
  END IF;

  INSERT INTO home_members (home_id, user_id, role)
  VALUES (v_home, v_uid, 'owner')
  ON CONFLICT (home_id, user_id) DO NOTHING;

  IF EXISTS (
    SELECT 1
    FROM home_members hm
    JOIN auth.users u ON u.id = hm.user_id
    WHERE hm.home_id = v_home AND lower(u.email) = v_normalized
  ) THEN
    RAISE EXCEPTION 'Bu kişi zaten mutfağınızda';
  END IF;

  IF EXISTS (
    SELECT 1 FROM home_invitations hi
    WHERE hi.home_id = v_home
      AND lower(hi.invitee_email) = v_normalized
      AND hi.status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Bu kişiye zaten davet gönderildi';
  END IF;

  INSERT INTO home_invitations (home_id, inviter_id, invitee_email, status)
  VALUES (v_home, v_uid, v_normalized, 'pending')
  RETURNING home_invitations.id INTO v_invite_id;

  RETURN v_invite_id;
END;
$$;

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
  v_uid uuid := auth.uid();
  v_email text;
  v_inv home_invitations%ROWTYPE;
  v_old_home uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Oturum gerekli';
  END IF;

  v_email := public.current_user_email();
  IF v_email IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'Hesap e-postası bulunamadı';
  END IF;

  SELECT * INTO v_inv
  FROM home_invitations hi
  WHERE hi.id = p_invitation_id AND hi.status = 'pending';

  IF v_inv IS NULL THEN
    RAISE EXCEPTION 'Davet bulunamadı veya süresi dolmuş';
  END IF;

  IF lower(v_inv.invitee_email) <> v_email THEN
    RAISE EXCEPTION 'Bu davet size ait değil';
  END IF;

  IF NOT p_accept THEN
    UPDATE home_invitations hi
    SET status = 'rejected', responded_at = NOW()
    WHERE hi.id = p_invitation_id;
    RETURN;
  END IF;

  SELECT p.home_id INTO v_old_home FROM profiles p WHERE p.id = v_uid;

  INSERT INTO home_members (home_id, user_id, role)
  VALUES (v_inv.home_id, v_uid, 'member')
  ON CONFLICT (home_id, user_id) DO NOTHING;

  IF v_old_home IS NOT NULL AND v_old_home <> v_inv.home_id THEN
    UPDATE inventory SET home_id = v_inv.home_id WHERE home_id = v_old_home;
    UPDATE shopping_list SET home_id = v_inv.home_id WHERE home_id = v_old_home;
    DELETE FROM home_members hm WHERE hm.home_id = v_old_home AND hm.user_id = v_uid;
  END IF;

  UPDATE profiles p SET home_id = v_inv.home_id WHERE p.id = v_uid;

  UPDATE home_invitations hi
  SET status = 'accepted', responded_at = NOW()
  WHERE hi.id = p_invitation_id;

  UPDATE home_invitations hi
  SET status = 'cancelled', responded_at = NOW()
  WHERE lower(hi.invitee_email) = v_email
    AND hi.status = 'pending'
    AND hi.id <> p_invitation_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_home_invitation(p_invitation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Oturum gerekli';
  END IF;

  UPDATE home_invitations hi
  SET status = 'cancelled', responded_at = NOW()
  WHERE hi.id = p_invitation_id
    AND hi.inviter_id = v_uid
    AND hi.status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Davet iptal edilemedi';
  END IF;
END;
$$;
