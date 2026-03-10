CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id uuid,
  p_amount integer,
  p_reference_id text,
  p_note text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
    SET credits = credits + p_amount, updated_at = now()
    WHERE id = p_user_id;

  INSERT INTO public.credit_transactions (user_id, amount, type, reference_id, note)
    VALUES (p_user_id, p_amount, 'purchase', p_reference_id, p_note);
END;
$$;

REVOKE ALL ON FUNCTION public.add_credits(uuid, integer, text, text) FROM PUBLIC;
-- No GRANT TO authenticated — add_credits is only called by service_role via webhook
