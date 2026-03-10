---
phase: 02-component-system-data-layer
plan: "03"
subsystem: data-layer
tags: [tanstack-query, hooks, supabase, classes, credits]
dependency_graph:
  requires: [02-01, 02-02]
  provides: [use-classes, use-bookings, use-credits, use-profile, ClassesClient-wired]
  affects: [app/classes, Phase 3 booking engine]
tech_stack:
  added: [TanStack Query v5 queryOptions factory pattern]
  patterns: [queryOptions factory, filter passthrough, staleTime tiering, ClassWithRelations cast]
key_files:
  created:
    - hooks/use-classes.ts
    - hooks/use-bookings.ts
    - hooks/use-credits.ts
    - hooks/use-profile.ts
    - hooks/use-classes.spec.ts
    - hooks/use-credits.spec.ts
  modified:
    - app/classes/classes-client.tsx
decisions:
  - createClient() called inside queryFn (not module level) for SSR safety
  - staleTime 30s for classes (changes occasionally), 60s for profile/credits (changes rarely)
  - instructor_name left empty string pending Phase 3 instructors join
  - ClassWithRelations cast used in ClassesClient to type joined Supabase result (avoids any)
  - filters as useState in ClassesClient (not URL params) per Phase 2 scope
metrics:
  duration: "15 min"
  completed: "2026-03-10"
  tasks: 2
  files: 7
---

# Phase 2 Plan 3: TanStack Query Hooks + ClassesClient Data Layer Summary

**One-liner:** Four TanStack Query v5 hooks with queryOptions factories connect Supabase to the classes UI, with ClassesClient rendering skeleton/error/empty/data branches driven by useClasses(filters).

## What Was Built

### hooks/use-classes.ts
- `classesQueryOptions(filters)` factory: queryKey `['classes', filters]`, fetches `classes` joined with `studios` and `bookings(count)`, applies `class_type`, `difficulty_level`, `studio_id`, `from`/`to` filters via `.eq`/`.gte`/`.lte`, staleTime 30s
- `useClasses(filters)` hook wrapping the factory

### hooks/use-bookings.ts
- `bookingsQueryOptions(userId)` factory: queryKey `['bookings', userId]`, fetches bookings joined with class title/scheduled_at, ordered by booked_at desc, enabled only when userId truthy

### hooks/use-credits.ts
- `creditsQueryOptions(userId)` factory: queryKey `['credits', userId]`, fetches `profiles.credits` for the given userId, staleTime 60s

### hooks/use-profile.ts
- `profileQueryOptions(userId)` factory: queryKey `['profile', userId]`, fetches full profile row, staleTime 60s

### app/classes/classes-client.tsx
- Replaced placeholder with real `useClasses(filters)` integration
- Three UI branches: `ClassesLoadingSkeleton` (isPending), `ErrorState` (isError), `EmptyState` (data.length === 0)
- `ClassWithRelations` type cast handles joined Supabase result safely
- `spots_remaining` computed as `max_capacity - bookings[0].count`

## Test Results

- 49/49 unit tests pass (7 new hook tests + 42 pre-existing)
- pnpm typecheck exits 0
- pnpm build exits 0

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript `never` type on joined Supabase query result**
- **Found during:** Task 2 (typecheck)
- **Issue:** Supabase client infers joined relations (`studios`, `bookings`) as `never` because the DB types don't include foreign key relationships
- **Fix:** Defined `ClassWithRelations` type in ClassesClient extending `ClassRow` with explicit joined shapes; used `as unknown as ClassWithRelations[]` cast
- **Files modified:** app/classes/classes-client.tsx
- **Commit:** d852190

## Success Criteria Verification

- CLASS-01: useClasses hook fetches classes with filter support (type, difficulty, studio, date range) — DONE
- CLASS-02: ClassesClient renders ClassCard with credit_cost and studio name from joined query — DONE
- CLASS-03: from/to filters applied via .gte/.lte on scheduled_at — DONE
- CLASS-04: spots_remaining = max_capacity - bookings[0].count rendered in ClassCard — DONE
- UI-04: skeleton (isPending), error (isError), empty state (data.length === 0) — DONE

## Commits

| Hash | Message |
|------|---------|
| ea14b52 | test(02-03): add failing RED tests for useClasses and useCredits hooks |
| d852190 | feat(02-03): implement TanStack Query v5 hooks and wire ClassesClient |

## Self-Check: PASSED
