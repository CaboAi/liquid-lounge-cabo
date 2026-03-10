-- Migration 002: Row Level Security for all 8 canonical tables
-- Uses auth.uid() (not a custom auth.user_id() function)
-- DROP POLICY IF EXISTS before each CREATE POLICY for idempotency

-- ============================================================
-- profiles
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- studios
-- ============================================================
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "studios_select_public" ON studios;
CREATE POLICY "studios_select_public"
  ON studios FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "studios_insert_owner" ON studios;
CREATE POLICY "studios_insert_owner"
  ON studios FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "studios_update_owner" ON studios;
CREATE POLICY "studios_update_owner"
  ON studios FOR UPDATE
  USING (auth.uid() = owner_id);

-- ============================================================
-- instructors
-- ============================================================
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "instructors_select_public" ON instructors;
CREATE POLICY "instructors_select_public"
  ON instructors FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "instructors_insert_studio_owner" ON instructors;
CREATE POLICY "instructors_insert_studio_owner"
  ON instructors FOR INSERT
  WITH CHECK (studio_id IN (SELECT id FROM studios WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "instructors_update_studio_owner" ON instructors;
CREATE POLICY "instructors_update_studio_owner"
  ON instructors FOR UPDATE
  USING (studio_id IN (SELECT id FROM studios WHERE owner_id = auth.uid()))
  WITH CHECK (studio_id IN (SELECT id FROM studios WHERE owner_id = auth.uid()));

-- ============================================================
-- classes
-- ============================================================
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "classes_select_public" ON classes;
CREATE POLICY "classes_select_public"
  ON classes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "classes_insert_studio_owner" ON classes;
CREATE POLICY "classes_insert_studio_owner"
  ON classes FOR INSERT
  WITH CHECK (studio_id IN (SELECT id FROM studios WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "classes_update_studio_owner" ON classes;
CREATE POLICY "classes_update_studio_owner"
  ON classes FOR UPDATE
  USING (studio_id IN (SELECT id FROM studios WHERE owner_id = auth.uid()))
  WITH CHECK (studio_id IN (SELECT id FROM studios WHERE owner_id = auth.uid()));

-- ============================================================
-- bookings
-- ============================================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings_select_own" ON bookings;
CREATE POLICY "bookings_select_own"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookings_insert_own" ON bookings;
CREATE POLICY "bookings_insert_own"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookings_update_own" ON bookings;
CREATE POLICY "bookings_update_own"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- credit_transactions
-- ============================================================
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "credit_transactions_select_own" ON credit_transactions;
CREATE POLICY "credit_transactions_select_own"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- CRITICAL: No INSERT or UPDATE policy for authenticated role.
-- credit_transactions is an append-only audit log written exclusively
-- by service_role. The Update: Record<string, never> in types.ts
-- enforces this at the type level; this migration enforces it at DB level.

-- ============================================================
-- plans
-- ============================================================
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plans_select_public" ON plans;
CREATE POLICY "plans_select_public"
  ON plans FOR SELECT
  USING (is_active = true);

-- No client INSERT/UPDATE policy — plans are managed via service_role only.

-- ============================================================
-- subscriptions
-- ============================================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_select_own" ON subscriptions;
CREATE POLICY "subscriptions_select_own"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- No client INSERT/UPDATE policy — subscriptions are managed via Stripe webhooks
-- using service_role in Phase 3.
