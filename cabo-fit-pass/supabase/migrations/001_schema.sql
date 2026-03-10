-- Migration 001: Canonical schema for Cabo Fit Pass
-- Establishes all 8 tables in dependency order matching lib/supabase/types.ts
-- Replaces divergent gyms-based exploratory migrations from 2024

-- ============================================================
-- 1. profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id             uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name      text,
  avatar_url     text,
  phone          text,
  locale         text        NOT NULL DEFAULT 'en',
  role           text        NOT NULL DEFAULT 'member'
                             CHECK (role IN ('member', 'studio_owner', 'admin')),
  credits        integer     NOT NULL DEFAULT 0
                             CHECK (credits >= 0),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. studios
-- ============================================================
CREATE TABLE IF NOT EXISTS studios (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text        NOT NULL,
  slug           text        NOT NULL UNIQUE,
  description    text,
  address        text,
  logo_url       text,
  cover_url      text,
  is_active      boolean     NOT NULL DEFAULT true,
  owner_id       uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. instructors
-- ============================================================
CREATE TABLE IF NOT EXISTS instructors (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id      uuid        NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name           text        NOT NULL,
  bio            text,
  avatar_url     text,
  specialties    text[]      NOT NULL DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. classes
-- ============================================================
CREATE TABLE IF NOT EXISTS classes (
  id                         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id                  uuid        NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  instructor_id              uuid        REFERENCES instructors(id) ON DELETE SET NULL,
  title                      text        NOT NULL,
  description                text,
  class_type                 text        NOT NULL,
  difficulty_level           text        NOT NULL DEFAULT 'beginner'
                                         CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  scheduled_at               timestamptz NOT NULL,
  duration_minutes           integer     NOT NULL DEFAULT 60,
  credit_cost                integer     NOT NULL DEFAULT 1
                                         CHECK (credit_cost > 0),
  max_capacity               integer     NOT NULL DEFAULT 20,
  is_cancelled               boolean     NOT NULL DEFAULT false,
  cancellation_window_hours  integer     NOT NULL DEFAULT 2,
  created_at                 timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. bookings
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id         uuid        NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  status           text        NOT NULL DEFAULT 'confirmed'
                               CHECK (status IN ('confirmed', 'cancelled', 'attended', 'no_show')),
  credits_charged  integer     NOT NULL,
  booked_at        timestamptz NOT NULL DEFAULT now(),
  cancelled_at     timestamptz
);

-- ============================================================
-- 6. credit_transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount        integer     NOT NULL,
  type          text        NOT NULL
                            CHECK (type IN ('purchase', 'booking', 'refund', 'rollover', 'bonus')),
  reference_id  text,
  note          text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 7. plans
-- ============================================================
CREATE TABLE IF NOT EXISTS plans (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text        NOT NULL,
  credits          integer     NOT NULL,
  price_cents      integer     NOT NULL,
  stripe_price_id  text,
  validity_days    integer     NOT NULL DEFAULT 30,
  is_active        boolean     NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 8. subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id                 uuid        NOT NULL REFERENCES plans(id),
  stripe_subscription_id  text,
  status                  text        NOT NULL DEFAULT 'trialing'
                                      CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  current_period_start    timestamptz NOT NULL,
  current_period_end      timestamptz NOT NULL,
  credits_remaining       integer     NOT NULL DEFAULT 0,
  rollover_percentage     integer     NOT NULL DEFAULT 0,
  rollover_cap_credits    integer     NOT NULL DEFAULT 0,
  created_at              timestamptz NOT NULL DEFAULT now()
);
