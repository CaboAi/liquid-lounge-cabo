# Roadmap: Cabo Fit Pass 2026

**Milestone:** v1.0 — Launch-ready multi-studio fitness marketplace
**Phases:** 5 (Phase 0 complete)
**Requirements:** 38 v1 requirements across 5 phases

---

## Phase Summary

| # | Phase | Goal | Requirements | Est. Effort |
|---|-------|------|--------------|-------------|
| 0 | Foundation | Build passes, CI green, auth scaffolded | ✓ Complete | Done |
| 1 | Schema + Auth | Real sign-up/sign-in, secure DB with RLS | AUTH-01–06, DB-01–07 | Week 2–3 |
| 2 | Component System + Data Layer | All views load real data via TanStack Query | CLASS-01–04, UI-01–05 | Week 4–5 |
| 3 | Booking Engine + Stripe | Credits purchasable, booking atomic, cancel/refund works | BOOK-01–06, CRED-01–05 | Week 6–7 |
| 4 | Studio Partner Portal | Studio owner can manage classes, view real analytics | STUD-01–05 | Week 8–9 |
| 5 | Quality + Ship | All tests pass, Lighthouse ≥90, email notifications sent | NOTF-01–03, QUAL-01–05 | Week 10 |

---

## Phase 1: Schema + Auth

**Goal:** Real users can sign up, verify email, sign in, and their data is secure behind RLS.

**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, DB-01, DB-02, DB-03, DB-04, DB-05, DB-06, DB-07

**Success Criteria:**
1. New user can sign up → receives verification email → confirms → lands on dashboard with real profile data
2. Existing user signs in → session persists on refresh → credits show from DB
3. Unauthenticated user hitting /dashboard is redirected to /auth/signin
4. RLS verified: user A cannot read user B's bookings or credit_transactions
5. supabase gen types produces types matching live DB schema

**Plans:** 3 plans

Plans:
- [x] 01-01-PLAN.md — Write and apply canonical migrations (001_schema, 002_rls, 003_indexes, 004_seed) — COMPLETE 2026-03-10 (db push deferred: Supabase project unreachable)
- [ ] 01-02-PLAN.md — Auth pages: Google OAuth, sign-out route, reset-password page + auth unit tests
- [ ] 01-03-PLAN.md — Auto-profile-creation trigger + RLS unit tests

---

## Phase 2: Component System + Data Layer

**Goal:** All class/booking/credit views load real data via TanStack Query with loading/error/empty states. Mobile nav functional.

**Requirements:** CLASS-01, CLASS-02, CLASS-03, CLASS-04, UI-01, UI-02, UI-03, UI-04, UI-05

**Success Criteria:**
1. `/classes` page loads real classes from DB via TanStack Query — shows loading skeleton, then data
2. TanStack Query DevTools show all queries cached correctly
3. Mobile bottom nav (Browse/Bookings/Credits/Profile) renders at 375px viewport
4. Credit balance pulses orange when ≤2 credits
5. Tailwind config has Cabo Gold (#FF9F43) as primary, Ocean Blue (#0EA5E9) as secondary

**Plans:**
- 2.1: Update tailwind.config.ts with full Tropical Sunset design system + Inter/Roboto Mono fonts
- 2.2: Build canonical components (class-card, booking-card, credit-balance, studio-card, mobile-bottom-nav)
- 2.3: Implement TanStack Query hooks (use-classes, use-bookings, use-credits, use-profile) with filters

---

## Phase 3: Booking Engine + Stripe

**Goal:** Credits purchasable via Stripe, booking is atomic (no race conditions), cancel/refund works correctly.

**Requirements:** BOOK-01, BOOK-02, BOOK-03, BOOK-04, BOOK-05, BOOK-06, CRED-01, CRED-02, CRED-03, CRED-04, CRED-05

**Success Criteria:**
1. Stripe test purchase → credits appear in DB → book class → credits deducted (verify in DB)
2. Attempt to book full class → blocked with "class full" error
3. Attempt to double-book → blocked with "already booked" error
4. Cancel ≥2 hours before → credits refunded → transaction log shows refund entry
5. Cancel <2 hours before → no refund → UI shows "cancellation window passed"

**Plans:**
- 3.1: Create Supabase Edge Function `book-class` (atomic: capacity + credits + booking in single RPC)
- 3.2: Create Supabase Edge Function `cancel-booking` (refund window check + credit refund)
- 3.3: Implement Stripe checkout session API route + webhook handler (`/api/stripe/create-checkout-session`, `/api/webhooks/stripe`)
- 3.4: Wire BookingModal and CreditPurchaseModal to real Edge Functions with optimistic updates

---

## Phase 4: Studio Partner Portal

**Goal:** Studio owner can CRUD classes, view real booking data, and see analytics from live DB.

**Requirements:** STUD-01, STUD-02, STUD-03, STUD-04, STUD-05

**Success Criteria:**
1. Studio owner (role=studio_owner) sees `/management` dashboard with real booking counts
2. Owner creates a class → member can see and book it → booking appears in owner dashboard
3. Analytics show real data: bookings/week, attendance rate, no-show rate (not mock)
4. Studio onboarding multi-step form saves to DB and triggers admin approval queue
5. Admin (role=admin) can approve/reject studios at `/admin/studios`

**Plans:**
- 4.1: Build studio management layout + role guard (studio_owner only)
- 4.2: Build class CRUD pages (`/management/classes`, `/management/classes/[id]/edit`)
- 4.3: Build analytics dashboard with real DB queries (bookings JOIN classes)
- 4.4: Build studio onboarding flow + admin approval queue

---

## Phase 5: Quality + Ship

**Goal:** All tests pass, Lighthouse ≥90 mobile, email notifications working. Ship to production.

**Requirements:** NOTF-01, NOTF-02, NOTF-03, QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05

**Success Criteria:**
1. `pnpm test:unit` — all unit tests pass (booking logic, validators, credit math)
2. `pnpm test:e2e` — signup → buy credits → book → cancel flow passes in Playwright
3. Lighthouse ≥90 performance on `/` and `/dashboard` (mobile)
4. Booking confirmation email received within 60 seconds of booking
5. CI pipeline green end-to-end on main branch

**Plans:**
- 5.1: Write unit tests (book-class logic, cancel refund window, Zod validators)
- 5.2: Write E2E tests (booking-flow.spec.ts, studio-flow.spec.ts)
- 5.3: Implement email templates with Resend (booking-confirmation, class-reminder, payment-receipt)
- 5.4: Performance audit + fixes (image optimization, bundle analysis, security headers)
- 5.5: Vercel production deploy + Sentry integration

---

*Created: 2026-03-09 | Phase 0 complete | Phase 1 planned 2026-03-09*
