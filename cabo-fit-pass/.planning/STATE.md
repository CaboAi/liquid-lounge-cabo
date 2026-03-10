# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-09)

**Core value:** Tourist buys credits, books any studio class in under 3 minutes
**Current focus:** Phase 1 — Schema + Auth

## Current Phase

**Phase 1: Schema + Auth**
Goal: Real users can sign up, verify email, sign in, and their data is secure behind RLS.

**Current Plan:** 1-02 (next)
**Last session stopped at:** Completed 01-schema-auth-01-01-PLAN.md (2026-03-10)

## Phase Status

| Phase | Name | Status |
|-------|------|--------|
| 0 | Foundation | ✓ Complete |
| 1 | Schema + Auth | ◑ In Progress (1/? plans done) |
| 2 | Component System + Data Layer | ○ Pending |
| 3 | Booking Engine + Stripe | ○ Pending |
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

## Key Decisions

| Date | Decision |
|------|----------|
| 2026-03-10 | credit_transactions has no authenticated INSERT/UPDATE policy — enforces audit log immutability at DB level matching Update: Record<string, never> in types.ts |
| 2026-03-10 | studios.owner_id REFERENCES profiles(id) ON DELETE SET NULL (nullable) to allow seeding studios without owners |
| 2026-03-10 | Supabase project pamzfhiiuvmtlwwvufut DNS non-existent; db push deferred — user must provision new Supabase project and update .env.local |

## Blockers / Open Items

- **BLOCKER**: Supabase project `pamzfhiiuvmtlwwvufut` (in .env.local) returns DNS non-existent domain. User must create a new Supabase project at supabase.com, update `.env.local` with new credentials, run `supabase link --project-ref <new-ref>`, then `supabase db push` to apply the 4 migration files.

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 01-schema-auth | 01 | 12 min | 2/2 | 7 |

---
*Last updated: 2026-03-10 after Phase 1 Plan 01 completion*
