---
phase: 3
plan: "03-04"
subsystem: ui-wiring
tags: [dashboard, stripe, credit-purchase, tanstack-query, server-client-split]
dependency_graph:
  requires: [03-01, 03-02, 03-03]
  provides:
    - CreditPurchaseModal with real Stripe checkout redirect (components/CreditPurchasemodal.tsx)
    - DashboardClient with real credits/bookings/transactions hooks (app/dashboard/dashboard-client.tsx)
    - Wired dashboard page with payment success banner (app/dashboard/page.tsx)
  affects:
    - hooks/use-credits.ts (type cast fix for Supabase never inference)
tech_stack:
  added: []
  patterns:
    - Next.js 15 App Router Server/Client component split for dashboard
    - useEffect + Supabase client for plan data fetch in modal
    - TanStack Query hooks for reactive credits/bookings/transactions
key_files:
  created:
    - app/dashboard/dashboard-client.tsx
  modified:
    - components/CreditPurchasemodal.tsx
    - app/dashboard/page.tsx
    - hooks/use-credits.ts
decisions:
  - Server/Client split: page.tsx keeps auth guard + searchParams reading; dashboard-client.tsx owns all data hooks
  - CreditPurchaseModal uses useEffect+createClient for plan fetch (not TanStack Query) — modal is self-contained, no shared query cache needed
  - BookingWithClass type cast in dashboard-client.tsx for Supabase never inference (same pattern as ClassesClient in Phase 2)
  - use-credits.ts needed explicit (data as { credits: number } | null) cast — Supabase .select('credits').single() infers never
metrics:
  duration: "20 min"
  completed_date: "2026-03-10"
  tasks: 3/3
  files: 4
checkpoint:
  type: human-verify
  status: approved
  approved_by: user
  approved_at: "2026-03-10"
---

# Phase 3 Plan 04: Wire UI — CreditPurchaseModal + Dashboard Data Summary

**One-liner:** CreditPurchaseModal calls real Stripe checkout; dashboard wired to useCredits/useBookings/useTransactions with payment success banner and BookingCard cancel button.

## Files Created/Modified

| File | Purpose |
|------|---------|
| `components/CreditPurchasemodal.tsx` | Real Stripe checkout — fetches plans from DB, calls /api/stripe/create-checkout-session, redirects via window.location.href |
| `app/dashboard/dashboard-client.tsx` | 'use client' component: useCredits/useBookings/useTransactions, payment-success-banner, bookings-list, transactions-list |
| `app/dashboard/page.tsx` | Server Component: auth guard + searchParams.payment → passes userId + paymentStatus to DashboardClient |
| `hooks/use-credits.ts` | Type cast fix: (data as { credits: number } | null) |

## Test Results

| Test File | Tests | Status |
|-----------|-------|--------|
| All existing tests | 80 | GREEN |
| pnpm typecheck | — | CLEAN |

## Key Decisions

1. **Server/Client split** — `page.tsx` stays a Server Component (auth guard, searchParams). `dashboard-client.tsx` is the 'use client' boundary for all reactive data. This avoids `'use client'` on the page file and keeps auth server-side.

2. **CreditPurchaseModal plan fetch via useEffect** — Modal is self-contained; plans data isn't shared with other components. A direct `createClient()` call in `useEffect` is simpler than adding a new TanStack Query key for this isolated fetch.

3. **BookingWithClass type cast** — Supabase's TypeScript inference returns `never[]` for joined selects (`*, classes(...)`). Applied the same explicit type cast pattern used in `ClassesClient` (Phase 2 Plan 03).

## Checkpoint Approval

**Status:** ✓ Approved by user on 2026-03-10

Verified:
- `/dashboard` renders credit balance, bookings section, transactions section
- Credit Purchase Modal shows DB plans and attempts Stripe redirect
- `/dashboard?payment=success` shows green payment-success-banner
- BookingCard cancel button visible for confirmed bookings

## Commits

| Hash | Message |
|------|---------|
| `bc779c1` | feat(03-04): rewrite CreditPurchaseModal with real Stripe checkout redirect |
| `21953ca` | feat(03-04): wire dashboard to real credits, bookings, transactions hooks + payment success banner |

## Self-Check: PASSED

All 4 files created/modified. Both commits present in git log. 80/80 tests green. Typecheck clean. Checkpoint approved.
