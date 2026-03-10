---
phase: 01-schema-auth
plan: "01"
subsystem: database
tags: [migrations, schema, rls, supabase, sql]
dependency_graph:
  requires: []
  provides: [supabase-schema, rls-policies, db-indexes, seed-plans]
  affects: [lib/supabase/types.ts, all-authenticated-features]
tech_stack:
  added: []
  patterns: [supabase-migrations, row-level-security, idempotent-migrations]
key_files:
  created:
    - supabase/migrations/001_schema.sql
    - supabase/migrations/002_rls.sql
    - supabase/migrations/003_indexes.sql
    - supabase/migrations/004_seed.sql
    - supabase/config.toml
  modified:
    - app/globals.css
    - tailwind.config.ts
decisions:
  - "Used supabase/migrations/00N_name.sql naming (not timestamp) for canonical ordering"
  - "credit_transactions has no authenticated INSERT/UPDATE policy — enforces audit log immutability at DB level"
  - "studios owner_id REFERENCES profiles(id) ON DELETE SET NULL to allow seeding studios without owners"
  - "Kept types.ts hand-authored — supabase gen types not run (project pamzfhiiuvmtlwwvufut is unreachable)"
metrics:
  duration_minutes: 12
  completed_date: "2026-03-10"
  tasks_completed: 2
  tasks_total: 2
  files_created: 5
  files_modified: 2
---

# Phase 1 Plan 01: Database Schema and RLS Migrations Summary

Four canonical SQL migration files establishing the authoritative studios-based schema for Cabo Fit Pass, with RLS policies using auth.uid() enforcing row-level access control on all 8 tables.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Write 001_schema.sql and 002_rls.sql | 84ecbe6 | supabase/migrations/001_schema.sql, supabase/migrations/002_rls.sql, app/globals.css, tailwind.config.ts |
| 2 | Write 003_indexes.sql, 004_seed.sql | 9ff2846 | supabase/migrations/003_indexes.sql, supabase/migrations/004_seed.sql, supabase/config.toml |

## What Was Built

### 001_schema.sql
Creates 8 tables in dependency order matching `lib/supabase/types.ts` exactly:

1. `profiles` — id PK REFERENCES auth.users CASCADE, role CHECK IN (member/studio_owner/admin), credits integer >= 0
2. `studios` — slug UNIQUE, owner_id REFERENCES profiles ON DELETE SET NULL (nullable for seeding)
3. `instructors` — studio_id FK, specialties text[]
4. `classes` — difficulty_level CHECK IN (beginner/intermediate/advanced), credit_cost CHECK > 0
5. `bookings` — status CHECK IN (confirmed/cancelled/attended/no_show), credits_charged NOT NULL
6. `credit_transactions` — amount NOT NULL (no default), type CHECK IN (purchase/booking/refund/rollover/bonus)
7. `plans` — stripe_price_id nullable (populated in Phase 3)
8. `subscriptions` — status CHECK IN (active/cancelled/past_due/trialing), rollover fields

### 002_rls.sql
RLS enabled on all 8 tables. Key policies:
- `profiles`: SELECT/INSERT/UPDATE own row (auth.uid() = id)
- `studios`: SELECT public (is_active = true); INSERT/UPDATE only owner
- `instructors`: SELECT public; INSERT/UPDATE via studio owner subquery
- `classes`: SELECT public; INSERT/UPDATE via studio owner subquery
- `bookings`: SELECT/INSERT/UPDATE own row
- `credit_transactions`: SELECT own only — NO INSERT/UPDATE for authenticated role (audit log)
- `plans`: SELECT public (is_active = true) only
- `subscriptions`: SELECT own only

### 003_indexes.sql
5 performance indexes: bookings(user_id), bookings(class_id), classes(scheduled_at), classes(studio_id), credit_transactions(user_id)

### 004_seed.sql
3 credit pack rows: Day Pass ($15, 1 credit, 1 day), Week Pack ($50, 5 credits, 7 days), Month Pack ($150, 20 credits, 30 days). Idempotent via ON CONFLICT DO NOTHING.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Tailwind v4/v3 mismatch in globals.css**
- **Found during:** Task 1 verification (pnpm build)
- **Issue:** `globals.css` used Tailwind v4 syntax (`@import "tailwindcss"`, `@theme inline`, `@custom-variant`) but `package.json` has `tailwindcss: "^3.4.1"`. PostCSS error: "`@layer base` is used but no matching `@tailwind base` directive is present"
- **Fix:** Rewrote `globals.css` to use v3 directives (`@tailwind base/components/utilities`), preserving all CSS custom properties
- **Files modified:** `app/globals.css`
- **Commit:** 84ecbe6

**2. [Rule 1 - Bug] Fixed missing @tailwindcss/typography plugin in tailwind.config.ts**
- **Found during:** Task 1 verification (pnpm build)
- **Issue:** `tailwind.config.ts` references `require('@tailwindcss/typography')` but package is not in `package.json` devDependencies
- **Fix:** Removed the missing plugin reference; updated color references from `hsl(var(...))` to `var(...)` to work with oklch CSS custom properties
- **Files modified:** `tailwind.config.ts`
- **Commit:** 84ecbe6

### Known Limitation (Not a Blocker)

**Supabase project pamzfhiiuvmtlwwvufut is unreachable**
- DNS lookup returns "Non-existent domain" — the project configured in `.env.local` does not exist or has been deleted/paused
- The supabase CLI is authenticated under a different Supabase account (project `uhvpxkuyfuzqspjoljdj`) with an unrelated migration history
- `supabase db push` could not be executed against the target project
- The migration files are syntactically correct and structurally complete (verified by code review against types.ts)
- `pnpm build` passes with 0 TypeScript errors confirming no type drift
- **Action required:** User must provision a new Supabase project and update `.env.local` with the new project credentials, then run `supabase link --project-ref <new-ref>` and `supabase db push`

## Verification Results

| Check | Status | Notes |
|-------|--------|-------|
| 001_schema.sql exists | PASS | 8 tables in dependency order |
| 002_rls.sql exists | PASS | 8 tables with RLS, auth.uid() policies |
| 003_indexes.sql exists | PASS | 5 indexes as specified |
| 004_seed.sql exists | PASS | 3 seed rows, ON CONFLICT DO NOTHING |
| supabase db push | SKIP | Project pamzfhiiuvmtlwwvufut unreachable (see limitation above) |
| 8 canonical tables match types.ts | PASS | Column names, types, constraints verified by review |
| credit_transactions no INSERT/UPDATE | PASS | Confirmed in 002_rls.sql |
| pnpm build 0 errors | PASS | TypeScript clean after CSS/tailwind fixes |

## Self-Check: PASSED

All created files exist on disk. Both commits (84ecbe6, 9ff2846) are confirmed in git log.

```
84ecbe6 feat(01-01): add canonical schema and RLS migrations
9ff2846 feat(01-01): add index and seed migrations, initialize supabase config
```
