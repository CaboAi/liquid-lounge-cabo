-- Migration 004: Seed data for plans table
-- 3 credit pack rows for UI display (Phase 2 onwards)
-- stripe_price_id intentionally NULL — populated in Phase 3 after Stripe setup
-- price_cents in USD cents: Day Pass = $15, Week Pack = $50, Month Pack = $150
-- ON CONFLICT DO NOTHING makes this idempotent

INSERT INTO plans (id, name, credits, price_cents, validity_days, is_active)
VALUES
  (gen_random_uuid(), 'Day Pass',    1,  1500,  1, true),
  (gen_random_uuid(), 'Week Pack',   5,  5000,  7, true),
  (gen_random_uuid(), 'Month Pack', 20, 15000, 30, true)
ON CONFLICT DO NOTHING;
