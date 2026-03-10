# Requirements: Cabo Fit Pass 2026

**Defined:** 2026-03-09
**Core Value:** Tourist buys credits, books any studio class in under 3 minutes

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User receives email verification and must confirm before accessing dashboard
- [ ] **AUTH-03**: User can reset password via email link
- [ ] **AUTH-04**: User session persists across browser refresh
- [ ] **AUTH-05**: User can sign in with Google OAuth
- [ ] **AUTH-06**: User can sign out from any page

### Database Schema

- [x] **DB-01**: Canonical profiles table with credits column, RLS enforced
- [x] **DB-02**: Studios table with owner_id FK, public read RLS
- [x] **DB-03**: Classes table with capacity, credit_cost, scheduled_at
- [x] **DB-04**: Bookings table — users see only their own rows (RLS)
- [x] **DB-05**: credit_transactions table — immutable audit log
- [x] **DB-06**: Plans and subscriptions tables for credit packages
- [x] **DB-07**: Performance indexes on bookings.user_id, classes.scheduled_at

### Class Discovery

- [ ] **CLASS-01**: User can browse available classes with filters (type, difficulty, time, studio)
- [ ] **CLASS-02**: User can see class details (instructor, duration, credits, capacity remaining)
- [ ] **CLASS-03**: User can see a weekly schedule view
- [ ] **CLASS-04**: Classes show real-time availability (spots remaining)

### Booking Engine

- [ ] **BOOK-01**: User can book a class (atomic: capacity check + credit debit in one transaction)
- [ ] **BOOK-02**: System prevents double-booking (same user, same class)
- [ ] **BOOK-03**: System prevents overbooking (max_capacity enforced)
- [ ] **BOOK-04**: User can cancel a booking ≥2 hours before class start
- [ ] **BOOK-05**: Credits are refunded on eligible cancellation
- [ ] **BOOK-06**: User can view upcoming and past bookings

### Credits & Payments

- [ ] **CRED-01**: User can purchase a credit pack via Stripe Checkout
- [ ] **CRED-02**: Stripe webhook updates credits after successful payment
- [ ] **CRED-03**: User can see current credit balance
- [ ] **CRED-04**: User can see full credit transaction history
- [ ] **CRED-05**: Stripe webhook handles subscription renewal

### Studio Partner Portal

- [ ] **STUD-01**: Studio owner can create, edit, and cancel classes
- [ ] **STUD-02**: Studio owner can view bookings for their classes
- [ ] **STUD-03**: Studio owner sees real analytics (bookings/week, attendance rate, no-show rate)
- [ ] **STUD-04**: Studio owner can complete onboarding (details, location, photos)
- [ ] **STUD-05**: Admin can approve/reject studio partner applications

### UI & Design System

- [ ] **UI-01**: Tailwind config matches Tropical Sunset design system (Cabo Gold #FF9F43, Ocean Blue #0EA5E9)
- [ ] **UI-02**: Inter + Roboto Mono fonts loaded
- [ ] **UI-03**: Mobile bottom nav (Browse, Bookings, Credits, Profile) works at 375px
- [ ] **UI-04**: All views have loading / error / empty states
- [ ] **UI-05**: Credit balance pulses when low (≤2 credits)

### Notifications

- [ ] **NOTF-01**: User receives booking confirmation email
- [ ] **NOTF-02**: User receives class reminder email 24h before class
- [ ] **NOTF-03**: User receives payment receipt email

### Quality

- [ ] **QUAL-01**: Unit tests cover booking logic (credit deduction, capacity, duplicate check)
- [ ] **QUAL-02**: Integration tests cover book → cancel → refund cycle
- [ ] **QUAL-03**: E2E tests: signup → buy credits → book → cancel
- [ ] **QUAL-04**: Lighthouse ≥90 on mobile for / and /dashboard
- [ ] **QUAL-05**: CI green on every push (typecheck → lint → test → build)

## v2 Requirements

### Localization
- **L10N-01**: Spanish UI strings
- **L10N-02**: MXN pricing display option

### Advanced Booking
- **BOOK-07**: Waitlist for full classes
- **BOOK-08**: Recurring booking (same class every week)

### Studio Analytics
- **STUD-06**: Revenue forecasting dashboard
- **STUD-07**: Customer retention metrics

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native iOS/Android app | Web PWA first; defer to v2 |
| Real-time chat | Not core booking value; adds complexity |
| Video class streaming | Storage/bandwidth cost; defer to v3 |
| Multiple payment processors | Stripe only for v1 simplicity |
| Instructor-facing app | Studio owner manages; defer to v2 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 to AUTH-06 | Phase 1 | Pending |
| DB-01 to DB-07 | Phase 1 | ✓ Complete (migrations written; db push deferred pending new Supabase project) |
| CLASS-01 to CLASS-04 | Phase 2 | Pending |
| UI-01 to UI-05 | Phase 2 | Pending |
| BOOK-01 to BOOK-06 | Phase 3 | Pending |
| CRED-01 to CRED-05 | Phase 3 | Pending |
| STUD-01 to STUD-05 | Phase 4 | Pending |
| NOTF-01 to NOTF-03 | Phase 5 | Pending |
| QUAL-01 to QUAL-05 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-09*
*Last updated: 2026-03-09 after Phase 0 completion*
