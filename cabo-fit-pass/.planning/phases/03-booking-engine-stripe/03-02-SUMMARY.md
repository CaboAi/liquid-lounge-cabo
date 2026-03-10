---
phase: 3
plan: "03-02"
subsystem: booking-engine
tags: [cancellation, rpc, plpgsql, tdd, tanstack-query, supabase]
dependency_graph:
  requires: [03-01]
  provides:
    - cancel_booking PL/pgSQL RPC function (appended to supabase/migrations/006_rpc.sql)
    - useCancelBooking mutation hook (hooks/use-cancel-booking.ts)
    - useTransactions query hook (hooks/use-transactions.ts)
    - BookingCard with Cancel button (components/booking-card.tsx)
  affects:
    - hooks/use-bookings.ts (cache invalidated by useCancelBooking onSettled)
    - hooks/use-credits.ts (cache invalidated by useCancelBooking onSettled)
tech_stack:
  added: []
  patterns:
    - TDD RED→GREEN for both mutation and query hooks
    - PL/pgSQL SECURITY DEFINER with SET search_path = ''
    - SELECT FOR UPDATE for race-condition-safe cancellation
    - TanStack Query v5 useMutation with optimistic update rollback
key_files:
  created:
    - hooks/use-cancel-booking.ts
    - hooks/use-cancel-booking.spec.ts
    - hooks/use-transactions.ts
    - hooks/use-transactions.spec.ts
  modified:
    - supabase/migrations/006_rpc.sql
    - supabase/migrations/008_rpc_grant.sql
    - components/booking-card.tsx
    - components/booking-card.spec.tsx
decisions:
  - any cast on supabase.rpc('cancel_booking') — Supabase generated types don't include custom RPC; same pattern as 03-01 useBookClass
  - CancelContext explicit type added to useMutation generic to satisfy TypeScript for onError context shape
  - BookingCard tests updated to wrap with QueryClientProvider (required since component now uses useCancelBooking)
  - Added 2 new BookingCard tests (cancel button visible for confirmed, hidden for cancelled)
metrics:
  duration: "15 min"
  completed_date: "2026-03-10"
  tasks: 2/2
  files: 8
---

# Phase 3 Plan 02: Cancel Booking RPC + useCancelBooking + useTransactions Summary

**One-liner:** `cancel_booking` PL/pgSQL function with refund window logic, `useCancelBooking` mutation with optimistic update, `useTransactions` credit history query, and BookingCard wired with Cancel button.

## Files Modified/Created

| File | Purpose |
|------|---------|
| `supabase/migrations/006_rpc.sql` | `cancel_booking` PL/pgSQL appended — SECURITY DEFINER, SELECT FOR UPDATE, refund window check |
| `supabase/migrations/008_rpc_grant.sql` | REVOKE PUBLIC + GRANT authenticated on cancel_booking appended |
| `hooks/use-cancel-booking.ts` | useCancelBooking mutation: RPC call, refund/no-refund/error branches, optimistic rollback |
| `hooks/use-cancel-booking.spec.ts` | 5 tests (refund true, refund false, booking_not_found, cancellation_window_passed, invalidation) |
| `hooks/use-transactions.ts` | useTransactions query + transactionsQueryOptions factory |
| `hooks/use-transactions.spec.ts` | 3 tests (with data, empty array, disabled when userId empty) |
| `components/booking-card.tsx` | Cancel button wired to useCancelBooking; error display for cancellation_window_passed |
| `components/booking-card.spec.tsx` | Updated with QueryClientProvider wrapper + 2 new cancel button tests |

## Test Results

| Test File | Tests | Status |
|-----------|-------|--------|
| `hooks/use-cancel-booking.spec.ts` | 5 | GREEN |
| `hooks/use-transactions.spec.ts` | 3 | GREEN |
| `components/booking-card.spec.tsx` | 6 | GREEN |
| All other existing tests | 66 | GREEN |
| **Total** | **80** | **GREEN** |

## Key Decisions Made

1. **`any` cast on supabase.rpc('cancel_booking')** — Supabase auto-generated types don't include custom RPC functions. Same pattern used in useBookClass (Plan 03-01). Cast keeps the runtime behavior correct while avoiding complex type augmentation.

2. **Explicit `CancelContext` type** — TanStack Query v5 requires the context type to be explicit in `useMutation<Result, Error, Vars, Context>` generic when using `onError` with context. This resolves the TypeScript `{}` inference error.

3. **BookingCard tests updated with QueryClientProvider** — Converting BookingCard to `'use client'` with `useCancelBooking` requires QueryClient context. Updated existing 4 tests + added 2 new ones for cancel button visibility.

## Deviations from Plan

None — plan executed as written. The `// eslint-disable-next-line` comments for `any` casts follow the same pattern established in Plan 03-01.

## Commits

| Hash | Message |
|------|---------|
| `58d87a5` | test(03-02): TDD RED→GREEN for useCancelBooking and useTransactions hooks |
| `f119ef9` | feat(03-02): add cancel_booking RPC migration and BookingCard cancel button |

## Self-Check: PASSED

All 8 files exist on disk. Both commits verified in git log. pnpm test:unit (80/80 green). pnpm typecheck clean.
