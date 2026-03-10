---
phase: 3
plan: "03-01"
subsystem: booking-engine
tags: [booking, rpc, plpgsql, tdd, tanstack-query, supabase]
dependency_graph:
  requires: []
  provides:
    - book_class PL/pgSQL RPC function (supabase/migrations/006_rpc.sql)
    - Pure booking logic functions (lib/booking-logic.ts)
    - useBookClass mutation hook (hooks/use-book-class.ts)
    - BookingErrorCode type and ERROR_MESSAGES (lib/booking-errors.ts)
  affects:
    - hooks/use-bookings.ts (cache invalidated by useBookClass onSettled)
    - hooks/use-credits.ts (cache invalidated by useBookClass onSettled)
tech_stack:
  added:
    - fast-check 4.6.0 (property-based testing)
  patterns:
    - TDD RED→GREEN for pure functions and mutation hook
    - PL/pgSQL SECURITY DEFINER with SET search_path = ''
    - SELECT FOR UPDATE for race-condition-safe capacity check
    - TanStack Query v5 useMutation with optimistic rollback
key_files:
  created:
    - supabase/migrations/006_rpc.sql
    - supabase/migrations/008_rpc_grant.sql
    - lib/booking-logic.ts
    - lib/booking-logic.spec.ts
    - lib/booking-errors.ts
    - hooks/use-book-class.ts
    - hooks/use-book-class.spec.ts
  modified: []
decisions:
  - fast-check fc.nat() used for computeNewCredits property test (non-negative guarantee for natural number inputs)
  - onMutate captures previousBookings snapshot for optimistic rollback — cancelQueries first to prevent race
  - 006_rpc.sql contains ONLY book_class (not add_credits) to avoid parallel write conflict with Plan 03-03
  - 008_rpc_grant.sql deferred cancel_booking grant to Plan 03-02 per plan instructions
metrics:
  duration: "9 min"
  completed_date: "2026-03-10"
  tasks: 3/3
  files: 7
---

# Phase 3 Plan 01: Atomic Booking RPC + useBookClass Mutation Summary

**One-liner:** Atomic `book_class` PL/pgSQL function with 7-step SELECT FOR UPDATE transaction, pure TS booking logic tested with fast-check, and TanStack Query v5 `useBookClass` mutation with optimistic rollback.

## Files Created

| File | Purpose |
|------|---------|
| `supabase/migrations/006_rpc.sql` | `book_class` PL/pgSQL function — SECURITY DEFINER, 7 atomic steps |
| `supabase/migrations/008_rpc_grant.sql` | REVOKE PUBLIC + GRANT authenticated on book_class |
| `lib/booking-logic.ts` | Pure functions: isClassFull, isAlreadyBooked, isCancellationAllowed, computeNewCredits |
| `lib/booking-logic.spec.ts` | 12 unit tests (parameterized + fast-check property test) |
| `lib/booking-errors.ts` | BookingErrorCode type + ERROR_MESSAGES record (6 error codes) |
| `hooks/use-book-class.ts` | useBookClass mutation: RPC call, error mapping, optimistic rollback |
| `hooks/use-book-class.spec.ts` | 4 mutation tests (success + 3 error codes) |

## Test Results

| Test File | Tests | Status |
|-----------|-------|--------|
| `lib/booking-logic.spec.ts` | 12 | GREEN |
| `hooks/use-book-class.spec.ts` | 4 | GREEN |
| All other existing tests | 53 | GREEN |
| **Total** | **69** | **GREEN** |

Note: `tests/unit/stripe-webhook.spec.ts` has 1 pre-existing failing test (invoice.paid handler) from Plan 03-03 RED phase — deferred to Plan 03-03 implementation.

## Key Decisions Made

1. **fast-check `fc.nat()` for computeNewCredits property test** — Natural numbers (non-negative integers) guarantee the sum is never negative, satisfying the property without artificial negative value handling in the function.

2. **onMutate cancelQueries before snapshot** — Standard TanStack Query v5 pattern: cancel outgoing refetches first to prevent snapshot from being overwritten by an in-flight fetch before rollback on error.

3. **006_rpc.sql contains ONLY book_class** — `add_credits` is deliberately excluded per plan instructions; it lives in `007_add_credits.sql` (owned by Plan 03-03) to prevent parallel write conflicts.

4. **008_rpc_grant.sql placeholder for cancel_booking** — Comment added noting Plan 03-02 will append the `cancel_booking` GRANT.

5. **SECURITY DEFINER SET search_path = ''** — Required per Supabase docs to allow INSERT into `credit_transactions` (no authenticated INSERT RLS policy). Fully-qualified table names (`public.classes`, etc.) used throughout.

## Deviations from Plan

None — plan executed exactly as written.

## Commits

| Hash | Message |
|------|---------|
| `858da63` | test(03-01): add TDD RED→GREEN tests for booking-logic pure functions |
| `2d589eb` | feat(03-01): implement useBookClass mutation hook and booking errors |
| `30f2ce6` | feat(03-01): add book_class PL/pgSQL migration and RPC grants |

## Self-Check: PASSED

All 7 created files exist on disk. All 3 task commits verified in git log.
