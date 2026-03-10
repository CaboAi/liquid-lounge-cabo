---
phase: 02-component-system-data-layer
plan: "02"
subsystem: component-library
tags: [components, ui, tdd, class-card, credit-balance, mobile-nav, booking-card, studio-card]
dependency_graph:
  requires: [02-01]
  provides: [ClassCard, CreditBalance, BookingCard, StudioCard, MobileBottomNav, /classes-page]
  affects: [app/classes/page.tsx, components/mobile-bottom-nav.tsx]
tech_stack:
  added: []
  patterns: [DB-typed props, TDD RED/GREEN, Server Component shell + client child]
key_files:
  created:
    - components/class-card.tsx
    - components/credit-balance.tsx
    - components/booking-card.tsx
    - components/studio-card.tsx
    - components/mobile-bottom-nav.tsx
    - app/classes/page.tsx
    - app/classes/classes-client.tsx
    - components/class-card.spec.tsx
    - components/credit-balance.spec.tsx
    - components/mobile-bottom-nav.spec.tsx
    - components/booking-card.spec.tsx
  modified: []
decisions:
  - ClassCard button text uses "Class Full" (not "Full") to avoid duplicate text nodes breaking getByText assertion
  - spots_remaining passed as computed prop (not DB column) — max_capacity minus confirmed_count computed by caller
  - ClassesClient is a placeholder stub — Plan 2.3 will wire useClasses() hook
  - StudioCard wraps in Next.js Link for /studios/{slug} navigation ready for Phase 4
metrics:
  duration: "18 min"
  completed_date: "2026-03-10"
  tasks: 2
  files: 11
requirements:
  - CLASS-02
  - CLASS-04
  - UI-03
  - UI-04
  - UI-05
---

# Phase 2 Plan 02: Canonical Component Library Summary

**One-liner:** DB-typed component library (ClassCard, CreditBalance, BookingCard, StudioCard, MobileBottomNav) with 42-test suite and /classes Server Component page.

## What Was Built

Five canonical UI components replacing the broken `class-card` stub and adding all components needed for the browse + booking UX. All components use the real DB column names from `lib/supabase/types.ts` so Phase 3 booking integration requires zero prop-shape changes.

## Components Delivered

| Component | Type | Key Feature |
|---|---|---|
| ClassCard | Display (no directive) | credit_cost, spots_remaining, isPending skeleton |
| CreditBalance | Display | animate-pulse + text-cabo-gold at credits <= 2 |
| BookingCard | Display | status badge variants, class join, booked_at date |
| StudioCard | Display | Link to /studios/{slug}, address, active badge |
| MobileBottomNav | 'use client' | usePathname active state, 4 links, md:hidden |
| ClassesPage | Server Component | metadata, ClassesClient child, pb-24 nav clearance |
| ClassesClient | 'use client' | Placeholder stub for Plan 2.3 useClasses() wiring |

## Test Results

- 4 new spec files: 19 new tests
- Total suite: 42 tests — all pass
- pnpm typecheck: exits 0
- pnpm build: exits 0 (/classes route at 295 B)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Button text "Full" duplicated with spots span text**
- **Found during:** Task 2 GREEN verification
- **Issue:** When spots_remaining === 0, both the `<span>` and the disabled `<Button>` rendered "Full", causing `screen.getByText('Full')` to throw "found multiple elements"
- **Fix:** Changed button text to "Class Full" when spots are exhausted
- **Files modified:** components/class-card.tsx
- **Commit:** 7d1ec02

## Self-Check: PASSED

Files verified present:
- components/class-card.tsx: FOUND
- components/credit-balance.tsx: FOUND
- components/booking-card.tsx: FOUND
- components/studio-card.tsx: FOUND
- components/mobile-bottom-nav.tsx: FOUND
- app/classes/page.tsx: FOUND
- app/classes/classes-client.tsx: FOUND

Commits verified:
- 6da60ef (test RED scaffolds): FOUND
- 7d1ec02 (GREEN implementations): FOUND
