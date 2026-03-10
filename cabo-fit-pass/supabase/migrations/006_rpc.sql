-- Migration 006: book_class PL/pgSQL RPC function
-- Atomically checks capacity, prevents duplicates, debits credits,
-- inserts booking, and logs credit_transaction in one transaction.
--
-- SECURITY DEFINER + SET search_path = '' is required so that the function
-- runs as the postgres role (bypassing RLS) to allow INSERT into
-- credit_transactions, which has no authenticated INSERT policy.

CREATE OR REPLACE FUNCTION public.book_class(
  p_user_id  uuid,
  p_class_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_class          public.classes%ROWTYPE;
  v_credits        integer;
  v_booking_count  integer;
  v_booking_id     uuid;
BEGIN
  -- Step 1: Lock the class row to prevent concurrent capacity changes
  SELECT * INTO v_class
  FROM public.classes
  WHERE id = p_class_id AND is_cancelled = false
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'class_not_found');
  END IF;

  -- Step 2: Count confirmed bookings vs max_capacity
  SELECT COUNT(*) INTO v_booking_count
  FROM public.bookings
  WHERE class_id = p_class_id AND status = 'confirmed';

  IF v_booking_count >= v_class.max_capacity THEN
    RETURN jsonb_build_object('error', 'class_full');
  END IF;

  -- Step 3: Check for duplicate booking
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE user_id = p_user_id AND class_id = p_class_id
      AND status = 'confirmed'
  ) THEN
    RETURN jsonb_build_object('error', 'already_booked');
  END IF;

  -- Step 4: Lock profile row and check credits
  SELECT credits INTO v_credits
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_credits < v_class.credit_cost THEN
    RETURN jsonb_build_object('error', 'insufficient_credits');
  END IF;

  -- Step 5: Debit credits from profile
  UPDATE public.profiles
  SET credits = credits - v_class.credit_cost,
      updated_at = now()
  WHERE id = p_user_id;

  -- Step 6: Insert booking record
  INSERT INTO public.bookings (user_id, class_id, status, credits_charged)
  VALUES (p_user_id, p_class_id, 'confirmed', v_class.credit_cost)
  RETURNING id INTO v_booking_id;

  -- Step 7: Append-only audit log (SECURITY DEFINER bypasses credit_transactions RLS)
  INSERT INTO public.credit_transactions (user_id, amount, type, reference_id, note)
  VALUES (p_user_id, -v_class.credit_cost, 'booking', v_booking_id::text,
          'Booked: ' || v_class.title);

  RETURN jsonb_build_object('booking_id', v_booking_id);
END;
$$;

-- cancel_booking: atomically checks cancellation window, sets status='cancelled',
-- conditionally refunds credits and logs a 'refund' credit_transaction.
CREATE OR REPLACE FUNCTION public.cancel_booking(
  p_user_id   uuid,
  p_booking_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_booking  public.bookings%ROWTYPE;
  v_class    public.classes%ROWTYPE;
  v_refund   boolean;
BEGIN
  -- Lock the booking row; confirm it belongs to user and is still confirmed
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id AND user_id = p_user_id AND status = 'confirmed'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'booking_not_found');
  END IF;

  -- Fetch class for cancellation window and schedule time
  SELECT * INTO v_class
  FROM public.classes
  WHERE id = v_booking.class_id;

  -- Check if within cancellation window
  v_refund := (v_class.scheduled_at - now()) >= (v_class.cancellation_window_hours * interval '1 hour');

  -- Cancel the booking
  UPDATE public.bookings
  SET status = 'cancelled', cancelled_at = now()
  WHERE id = p_booking_id;

  -- If within window: refund credits and log transaction
  IF v_refund THEN
    UPDATE public.profiles
    SET credits = credits + v_booking.credits_charged, updated_at = now()
    WHERE id = p_user_id;

    INSERT INTO public.credit_transactions (user_id, amount, type, reference_id, note)
    VALUES (p_user_id, v_booking.credits_charged, 'refund', p_booking_id::text,
            'Cancelled: ' || v_class.title);
  END IF;

  RETURN jsonb_build_object('refunded', v_refund);
END;
$$;
