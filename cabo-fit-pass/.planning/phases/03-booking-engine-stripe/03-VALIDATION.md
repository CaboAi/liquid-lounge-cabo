---
phase: 3
slug: booking-engine-stripe
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.x |
| **Config file** | `vitest.config.ts` (exists) |
| **Quick run command** | `pnpm test:unit` |
| **Full suite command** | `pnpm test:unit && pnpm typecheck` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test:unit`
- **After every plan wave:** Run `pnpm test:unit && pnpm typecheck`
- **Before `/gsd:verify-work`:** Full suite must be green (`pnpm test:unit && pnpm test:e2e`)
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 03-01 | 0 | BOOK-01, BOOK-02, BOOK-03 | unit | `pnpm test:unit -- lib/booking-logic.spec.ts` | ❌ W0 | ⬜ pending |
| 3-01-02 | 03-01 | 1 | BOOK-01 | unit | `pnpm test:unit -- hooks/use-book-class.spec.ts` | ❌ W0 | ⬜ pending |
| 3-01-03 | 03-01 | 1 | BOOK-01–03 | manual | `supabase db reset && supabase rpc book_class` | ❌ W0 | ⬜ pending |
| 3-02-01 | 03-02 | 0 | BOOK-04, BOOK-05 | unit | `pnpm test:unit -- lib/booking-logic.spec.ts` | ❌ W0 | ⬜ pending |
| 3-02-02 | 03-02 | 1 | BOOK-04–05 | unit | `pnpm test:unit -- hooks/use-cancel-booking.spec.ts` | ❌ W0 | ⬜ pending |
| 3-02-03 | 03-02 | 1 | BOOK-06 | unit | `pnpm test:unit -- hooks/use-bookings.spec.ts` | ✅ | ⬜ pending |
| 3-03-01 | 03-03 | 0 | CRED-01 | manual | Stripe CLI: `stripe listen` + verify redirect | N/A | ⬜ pending |
| 3-03-02 | 03-03 | 0 | CRED-02, CRED-05 | unit | `pnpm test:unit -- tests/unit/stripe-webhook.spec.ts` | ❌ W0 | ⬜ pending |
| 3-03-03 | 03-03 | 1 | CRED-04 | unit | `pnpm test:unit -- hooks/use-transactions.spec.ts` | ❌ W0 | ⬜ pending |
| 3-04-01 | 03-04 | 1 | CRED-01–03, BOOK-01–06 | unit | `pnpm test:unit` | partial | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `lib/booking-logic.ts` — pure functions: `isCancellationAllowed`, `isClassFull`, `isAlreadyBooked`, `computeNewCredits`
- [ ] `lib/booking-logic.spec.ts` — unit tests for all four pure functions (BOOK-01–05)
- [ ] `hooks/use-book-class.ts` — useMutation stub wrapping `supabase.rpc('book_class')`
- [ ] `hooks/use-book-class.spec.ts` — mutation tests with mocked Supabase RPC
- [ ] `hooks/use-cancel-booking.ts` — useMutation stub wrapping `supabase.rpc('cancel_booking')`
- [ ] `hooks/use-cancel-booking.spec.ts` — mutation tests (window check, refund branch)
- [ ] `hooks/use-transactions.ts` — useQuery stub for `credit_transactions` history
- [ ] `hooks/use-transactions.spec.ts` — query unit tests
- [ ] `tests/unit/stripe-webhook.spec.ts` — webhook handler logic with mocked `stripe.webhooks.constructEvent`
- [ ] `supabase/migrations/006_rpc.sql` — `book_class`, `cancel_booking`, `add_credits` PL/pgSQL functions
- [ ] `lib/stripe.ts` — singleton Stripe client (server-only)
- [ ] `app/api/stripe/create-checkout-session/route.ts` — checkout session handler stub
- [ ] `app/api/webhooks/stripe/route.ts` — webhook handler stub

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Stripe test purchase → credits appear | CRED-01, CRED-02 | Stripe external service; real HTTP call | Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`, trigger `stripe trigger checkout.session.completed`, check profile.credits in Supabase Studio |
| Webhook idempotency (double delivery) | CRED-02 | Requires real Stripe retry or manual duplicate send | Call webhook handler twice with same session ID, verify credits only added once |
| Book class → credits deducted in DB | BOOK-01 | Requires live Supabase project for RPC | Run `supabase db reset`, call `supabase.rpc('book_class', {...})`, check profiles.credits |
| Cancel ≥2h before → credits refunded | BOOK-04, BOOK-05 | RPC + DB state verification | Insert a booking with `scheduled_at = NOW() + interval '3 hours'`, call cancel RPC, verify credit_transactions |
| Cancel <2h before → no refund | BOOK-04, BOOK-05 | RPC + DB state verification | Insert booking with `scheduled_at = NOW() + interval '1 hour'`, call cancel RPC, verify no refund entry |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
