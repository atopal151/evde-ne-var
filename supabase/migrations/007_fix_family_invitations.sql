-- Gelen davetler: e-posta eşleşmesi ve üyelik düzeltmeleri
-- 006 sonrası çalıştırın

CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(trim(coalesce(
    nullif(auth.jwt() ->> 'email', ''),
    (SELECT email FROM auth.users WHERE id = auth.uid())
  )));
$$;

GRANT EXECUTE ON FUNCTION public.current_user_email() TO authenticated;

-- get_home_members / get_home_invitations: 008_fix_ambiguous_columns.sql içinde düzeltildi

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

  user_email := public.current_user_email();
  IF user_email IS NULL OR user_email = '' THEN
    RAISE EXCEPTION 'Hesap e-postası bulunamadı';
  END IF;

  SELECT * INTO inv
  FROM home_invitations
  WHERE id = p_invitation_id AND status = 'pending';

  IF inv IS NULL THEN
    RAISE EXCEPTION 'Davet bulunamadı veya süresi dolmuş';
  END IF;

  IF lower(inv.invitee_email) <> user_email THEN
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
  WHERE lower(invitee_email) = user_email
    AND status = 'pending'
    AND id <> p_invitation_id;
END;
$$;

DROP POLICY IF EXISTS "home_invitations_select" ON home_invitations;

CREATE POLICY "home_invitations_select" ON home_invitations
  FOR SELECT USING (
    inviter_id = auth.uid()
    OR lower(invitee_email) = public.current_user_email()
  );
