---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_plan: Not started
status: unknown
last_updated: "2026-03-11T01:48:15.054Z"
progress:
  total_phases: 5
  completed_phases: 3
  total_plans: 10
  completed_plans: 10
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-09)

**Core value:** Tourist buys credits, books any studio class in under 3 minutes
**Current focus:** Phase 1 — Schema + Auth

## Current Phase

**Phase 3: Booking Engine + Stripe**
Goal: Users can book classes atomically, cancel with credit refund, and purchase credit packs via Stripe.

**Current Plan:** Not started
**Last session stopped at:** Completed 03-02-PLAN.md — Cancel Booking RPC + useCancelBooking + useTransactions (2026-03-10)

## Phase Status

| Phase | Name | Status |
|-------|------|--------|
| 0 | Foundation | ✓ Complete |
| 1 | Schema + Auth | ✓ Complete (3/3 plans done) |
| 2 | Component System + Data Layer | ✓ Complete (3/3 plans done) |
| 3 | Booking Engine + Stripe | ◑ In Progress (3/4 plans done) |
| 4 | Studio Partner Portal | ○ Pending |
| 5 | Quality + Ship | ○ Pending |

## Phase 0 Completion Notes

- Next.js 15.5 + React 19 + TypeScript 5.7
- next-auth removed, Supabase SSR auth wired
- pnpm build passes, 3/3 unit tests pass
- GitHub Actions CI created
- .env.example created
- Nested cabo-fit-pass/cabo-fit-pass/ stale dir removed
- tailwind postcss config fixed (v3 API)

## Phase 1 Plan 01 Completion Notes (2026-03-10)

- 4 canonical SQL migration files created: 001_schema.sql, 002_rls.sql, 003_indexes.sql, 004_seed.sql
- All 8 tables match lib/supabase/types.ts column-by-column
- RLS enabled on all 8 tables using auth.uid(); credit_transactions has no authenticated INSERT/UPDATE
- 5 performance indexes created; 3 seed credit pack rows in plans
- pnpm build passes (0 TypeScript errors)
- globals.css Tailwind v4/v3 mismatch auto-fixed (Rule 1)
- tailwind.config.ts missing @tailwindcss/typography plugin removed (Rule 1)
- Commits: 84ecbe6 (schema + RLS), 9ff2846 (indexes + seed)

## Phase 1 Plan 02 Completion Notes (2026-03-10)

- Google OAuth button ("Continue with Google") added to sign-in form via supabase.auth.signInWithOAuth
- POST /auth/signout route handler created — clears session, redirects to /auth/signin
- /auth/reset-password page created with password/confirm fields, client validation, updateUser call
- Wave 0 TDD: 6-test auth.spec.ts scaffold written RED then turned GREEN; all 17 unit tests pass
- pnpm build passes; human-verify checkpoint approved
- Commits: 5c01ba8 (test scaffold), 04a7f6c (OAuth + signout), 072809b (reset-password)

## Phase 1 Plan 03 Completion Notes (2026-03-10)

- 005_trigger.sql created: handle_new_user() SECURITY DEFINER function + on_auth_user_created trigger
- Trigger inserts role='member', credits=0 on new auth.users row; ON CONFLICT DO NOTHING
- tests/unit/rls.spec.ts created: 8 tests — trigger logic, RLS inventory (8 tables), credit_transactions immutability
- All 17 unit tests pass (rls.spec.ts + auth.spec.ts + utils.spec.ts); pnpm build clean
- supabase db push blocked by pre-existing migration history mismatch (same blocker as plan 01)
- Commits: fcef2b6 (trigger SQL), 9f8f6c6 (rls tests)
- Checkpoint: human-verify pending

## Phase 2 Plan 03 Completion Notes (2026-03-10)

- Four TanStack Query v5 hooks created: use-classes, use-bookings, use-credits, use-profile
- All hooks use queryOptions factory pattern with typed queryKeys
- createClient() called inside queryFn (SSR safety); staleTime 30s classes / 60s profile+credits
- ClassesClient wired to useClasses(filters): skeleton/error/empty/data branches implemented
- spots_remaining computed from max_capacity - bookings[0].count (CLASS-04)
- ClassFilters supports class_type, difficulty_level, studio_id, from/to (CLASS-03 weekly range)
- Auto-fix Rule 1: ClassWithRelations type cast added to handle Supabase joined result (TypeScript inferred never)
- 49 unit tests pass (7 new); pnpm typecheck + pnpm build clean
- Commits: ea14b52 (RED tests), d852190 (GREEN hooks + ClassesClient)

## Phase 2 Plan 02 Completion Notes (2026-03-10)

- ClassCard replaced entirely: uses credit_cost/scheduled_at/spots_remaining (DB column names), isPending skeleton
- CreditBalance: animate-pulse + text-cabo-gold at credits <= 2, Low credits badge
- BookingCard: confirmed/cancelled/waitlisted status badge variants, class title, booked_at formatted date
- StudioCard: name/address/description, active badge, Link to /studios/{slug}
- MobileBottomNav: 'use client', usePathname active state, 4 links at correct hrefs
- app/classes/page.tsx: Server Component shell with ClassesClient placeholder
- 42 unit tests pass (19 new); pnpm typecheck + pnpm build clean
- Auto-fix Rule 1: button "Full" text collision with span — changed to "Class Full"
- Commits: 6da60ef (RED tests), 7d1ec02 (GREEN implementations)

## Phase 3 Plan 01 Completion Notes (2026-03-10)

- book_class PL/pgSQL function created in 006_rpc.sql: SECURITY DEFINER, 7 atomic steps, SELECT FOR UPDATE
- 4 pure booking logic functions: isClassFull, isAlreadyBooked, isCancellationAllowed, computeNewCredits
- lib/booking-logic.spec.ts: 12 tests (parameterized + fast-check fc.nat() property test) — all GREEN
- useBookClass TanStack Query v5 mutation: RPC call, error code mapping, optimistic rollback, cache invalidation
- hooks/use-book-class.spec.ts: 4 tests (success + 3 error codes) — all GREEN
- lib/booking-errors.ts: BookingErrorCode type (6 codes) + ERROR_MESSAGES record
- 008_rpc_grant.sql: REVOKE PUBLIC + GRANT authenticated on book_class
- fast-check 4.6.0 installed as devDependency
- 69 unit tests pass (all tests owned by 03-01 green; 1 pre-existing stripe-webhook test deferred to 03-03)
- Commits: 858da63 (RED→GREEN booking-logic), 2d589eb (useBookClass hook), 30f2ce6 (SQL migration)

## Phase 2 Plan 01 Completion Notes (2026-03-10)

- cabo-gold (#FF9F43) and ocean-blue (#0EA5E9) named color scales replace brand placeholder
- ./components/**/ added to Tailwind content array to prevent brand class purge in production
- Inter + Roboto Mono loaded via next/font/google CSS variables on html element
- All 23 unit tests pass; pnpm build clean
- Commits: 6c824b6 (RED test), 76302c3 (GREEN implementation)

## Key Decisions

| Date | Decision |
|------|----------|
| 2026-03-10 | createClient() called inside queryFn (not module level) for SSR safety across all 4 hooks |
| 2026-03-10 | staleTime 30s for classes (changes occasionally), 60s for profile/credits (changes rarely) |
| 2026-03-10 | ClassWithRelations type cast in ClassesClient resolves TypeScript `never` inference on Supabase joined queries |
| 2026-03-10 | instructor_name left empty string in ClassesClient pending Phase 3 instructors table join |
| 2026-03-10 | ClassCard button text "Class Full" (not "Full") avoids duplicate text nodes; spots_remaining is a computed prop (max_capacity - confirmed_count), not a DB column |
| 2026-03-10 | cabo-gold (#FF9F43) and ocean-blue (#0EA5E9) replace brand placeholder; Inter/Roboto Mono via CSS variables on html element — required for Tailwind var() fontFamily resolution |
| 2026-03-10 | credit_transactions has no authenticated INSERT/UPDATE policy — enforces audit log immutability at DB level matching Update: Record<string, never> in types.ts |
| 2026-03-10 | studios.owner_id REFERENCES profiles(id) ON DELETE SET NULL (nullable) to allow seeding studios without owners |
| 2026-03-10 | Supabase project pamzfhiiuvmtlwwvufut DNS non-existent; db push deferred — user must provision new Supabase project and update .env.local |
| 2026-03-10 | 005_trigger.sql uses EXECUTE PROCEDURE (not EXECUTE FUNCTION) for broader Postgres version compatibility |
| 2026-03-10 | extractTriggerInsert() is a test-only pure function mirroring PL/pgSQL trigger logic — not exported for production use |
| 2026-03-10 | RLS policy inventory in rls.spec.ts serves as living documentation — policy name changes force test failure and explicit acknowledgment |
| 2026-03-10 | Google OAuth redirectTo uses window.location.origin for portable localhost and production URL support |
| 2026-03-10 | Sign-out route is POST-only to prevent CSRF via GET — callers must use a form or fetch |
| 2026-03-10 | Reset-password validates password match and minimum 8 chars client-side before calling supabase.auth.updateUser |
| 2026-03-10 | fast-check fc.nat() for computeNewCredits property test — natural numbers guarantee non-negative sum without special-casing negatives |
| 2026-03-10 | 006_rpc.sql contains ONLY book_class (not add_credits) to prevent parallel write conflict with Plan 03-03 which owns 007_add_credits.sql |
| 2026-03-10 | SECURITY DEFINER SET search_path = '' required in book_class so INSERT into credit_transactions succeeds (no authenticated INSERT RLS policy) |

## Blockers / Open Items

- **BLOCKER**: Supabase project `pamzfhiiuvmtlwwvufut` (in .env.local) returns DNS non-existent domain. User must create a new Supabase project at supabase.com, update `.env.local` with new credentials, run `supabase link --project-ref <new-ref>`, then `supabase db push` to apply the 4 migration files.

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 01-schema-auth | 01 | 12 min | 2/2 | 7 |
| 01-schema-auth | 02 | 45 min | 3/3 | 4 |
| 01-schema-auth | 03 | 2 min | 2/2 | 2 |
| 02-component-system-data-layer | 01 | 8 min | 2/2 | 3 |
| 02-component-system-data-layer | 02 | 18 min | 2/2 | 11 |
| 02-component-system-data-layer | 03 | 15 min | 2/2 | 7 |

---
*Last updated: 2026-03-10 after Phase 1 Plan 02 completion (all Phase 1 plans complete)*
| Phase 02-component-system-data-layer P01 | 8 | 2 tasks | 3 files |
| Phase 02-component-system-data-layer P02 | 18 | 2 tasks | 11 files |
| Phase 03-booking-engine-stripe P01 | 9 | 3 tasks | 7 files |
| Phase 03-booking-engine-stripe P03-03 | 25 | 2 tasks | 5 files |
| Phase 03-booking-engine-stripe P03-02 | 15 | 2 tasks | 8 files |

