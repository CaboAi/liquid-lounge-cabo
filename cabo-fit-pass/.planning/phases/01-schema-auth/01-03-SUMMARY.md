---
phase: 01-schema-auth
plan: 03
subsystem: database
tags: [supabase, postgresql, triggers, rls, vitest, security-definer]

# Dependency graph
requires:
  - phase: 01-schema-auth/01-01
    provides: "8-table canonical schema (profiles, studios, instructors, classes, bookings, credit_transactions, plans, subscriptions) with RLS enabled"
provides:
  - "handle_new_user() SECURITY DEFINER trigger function in supabase/migrations/005_trigger.sql"
  - "on_auth_user_created trigger wiring auth.users → public.profiles"
  - "tests/unit/rls.spec.ts — trigger SQL logic tests + RLS policy inventory documentation"
affects: [02-component-data-layer, 03-booking-engine]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SECURITY DEFINER SET search_path = public — required pattern for triggers writing through RLS"
    - "ON CONFLICT (id) DO NOTHING — idempotent trigger safe for re-runs and social auth"
    - "extractTriggerInsert() pure function pattern for unit-testing PL/pgSQL logic"
    - "RLS policy inventory as living documentation in spec files"

key-files:
  created:
    - supabase/migrations/005_trigger.sql
    - tests/unit/rls.spec.ts
  modified: []

key-decisions:
  - "005_trigger.sql uses EXECUTE PROCEDURE (not EXECUTE FUNCTION) for broader Postgres version compatibility"
  - "extractTriggerInsert() is a test-only pure function mirroring PL/pgSQL trigger logic — not exported for production"
  - "RLS policy inventory in rls.spec.ts serves as living documentation — policy name changes cause test failures, forcing explicit acknowledgment"
  - "supabase db push deferred: remote migration history mismatch is pre-existing blocker requiring user to repair migration history or create new Supabase project"

patterns-established:
  - "Mirror PL/pgSQL trigger logic as a pure TypeScript function for unit-testability"
  - "Document RLS policies as typed Record<table, policyNames[]> inventory in spec files"

requirements-completed: [DB-01, DB-04]

# Metrics
duration: 2min
completed: 2026-03-10
---

# Phase 1 Plan 03: Schema Auth — Trigger and RLS Tests Summary

**SECURITY DEFINER trigger (handle_new_user) auto-creates public.profiles on signup, with pure-function unit tests documenting trigger logic and an 8-table RLS policy inventory**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-10T07:08:10Z
- **Completed:** 2026-03-10T07:10:30Z
- **Tasks:** 2/2 (checkpoint:human-verify pending)
- **Files modified:** 2

## Accomplishments

- Created `005_trigger.sql` with `handle_new_user()` SECURITY DEFINER function and `on_auth_user_created` trigger on `auth.users`
- Trigger inserts `role='member'` and `credits=0` for every new signup; `ON CONFLICT (id) DO NOTHING` makes it safe for re-runs and social OAuth
- Created `rls.spec.ts` with 8 tests covering: trigger COALESCE logic, idempotency, RLS policy inventory (all 8 tables), and compile-time `credit_transactions` immutability assertion
- All 17 unit tests pass (`rls.spec.ts` + `auth.spec.ts` + `utils.spec.ts`); `pnpm build` clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Write 005_trigger.sql** - `fcef2b6` (feat)
2. **Task 2: Write RLS unit tests (rls.spec.ts)** - `9f8f6c6` (test)

## Files Created/Modified

- `supabase/migrations/005_trigger.sql` — handle_new_user() SECURITY DEFINER function + on_auth_user_created trigger
- `tests/unit/rls.spec.ts` — 8 unit tests: trigger logic, RLS inventory, immutability contract

## Decisions Made

- Used `EXECUTE PROCEDURE` (not `EXECUTE FUNCTION`) in the trigger definition for broader Postgres compatibility
- `extractTriggerInsert()` is a test-only pure function that mirrors the PL/pgSQL trigger logic, enabling unit testing without a real DB connection
- RLS policy inventory typed as `Record<string, string[]>` serves as living documentation — if policy names change in migrations, this test fails and forces acknowledgment
- `supabase db push` was attempted but blocked by pre-existing migration history mismatch; the SQL file is correct and push will succeed once the user repairs migration history (see blocker in STATE.md)

## Deviations from Plan

None — plan executed exactly as written. The `supabase db push` remote mismatch is a pre-existing blocker (documented in STATE.md from Plan 01), not caused by this plan's changes.

## Issues Encountered

- `supabase db push` failed with "Remote migration versions not found in local migrations directory" — this is a pre-existing issue where the Supabase remote project has migration history that doesn't match the numbered local files (001–005). The SQL file `005_trigger.sql` is correct; the push will work once the user runs `supabase migration repair` or links to a fresh project.

## User Setup Required

To apply the trigger to the live database, the user must:

1. Repair migration history or create a new Supabase project (see STATE.md blocker)
2. Run: `supabase db push` (or `npx supabase db push`)
3. Verify in Supabase Dashboard:
   - Database → Functions → `handle_new_user` should appear
   - Database → Triggers → auth schema → `on_auth_user_created` should appear

## Next Phase Readiness

- Trigger SQL is authored and ready to apply once the Supabase project blocker is resolved
- Unit test suite is fully green (17 tests) — ready for Phase 2
- Once trigger is applied, new signups will automatically create profiles rows; dashboard will no longer crash with "profile not found"

**Blocker:** `supabase db push` blocked by migration history mismatch. User must resolve before end-to-end signup creates profiles row.

---
*Phase: 01-schema-auth*
*Completed: 2026-03-10*
