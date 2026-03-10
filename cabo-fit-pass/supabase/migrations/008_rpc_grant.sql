-- Migration 008: Grant execute permissions on RPC functions
--
-- book_class: callable by authenticated users (client-side hook useBookClass)
REVOKE ALL ON FUNCTION public.book_class(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.book_class(uuid, uuid) TO authenticated;

-- add_credits: used by Stripe webhook via service_role — no authenticated grant needed.
-- service_role bypasses RLS and has EXECUTE on all functions by default.
-- cancel_booking grant will be appended by Plan 03-02.
