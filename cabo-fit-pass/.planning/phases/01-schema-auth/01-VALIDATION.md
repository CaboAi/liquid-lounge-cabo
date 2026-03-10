---
phase: 1
slug: schema-auth
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.x + jsdom |
| **Config file** | `vitest.config.ts` (exists) |
| **Quick run command** | `pnpm test:unit` |
| **Full suite command** | `pnpm test:unit && pnpm build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test:unit`
- **After every plan wave:** Run `pnpm test:unit && pnpm build`
- **Before `/gsd:verify-work`:** Full suite must be green + manual RLS checks complete
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | DB-01–07 | manual (migration applied) | `pnpm supabase db push` | ✅ | ⬜ pending |
| 1-01-02 | 01 | 1 | DB-01 | manual (RLS in SQL editor) | N/A | N/A | ⬜ pending |
| 1-01-03 | 01 | 1 | DB-07 | manual (`\d bookings`) | N/A | N/A | ⬜ pending |
| 1-02-01 | 02 | 2 | AUTH-01 | unit | `pnpm test:unit` | ❌ Wave 0 | ⬜ pending |
| 1-02-02 | 02 | 2 | AUTH-03 | unit (page render) | `pnpm test:unit` | ❌ Wave 0 | ⬜ pending |
| 1-02-03 | 02 | 2 | AUTH-05 | unit (component render + mock) | `pnpm test:unit` | ❌ Wave 0 | ⬜ pending |
| 1-02-04 | 02 | 2 | AUTH-06 | unit (route handler) | `pnpm test:unit` | ❌ Wave 0 | ⬜ pending |
| 1-02-05 | 02 | 2 | AUTH-02 | manual (real email) | N/A — verify in browser | N/A | ⬜ pending |
| 1-02-06 | 02 | 2 | AUTH-04 | unit (middleware redirect) | `pnpm test:unit` | ❌ Wave 0 | ⬜ pending |
| 1-03-01 | 03 | 2 | DB-01 | manual (Supabase dashboard) | N/A | N/A | ⬜ pending |
| 1-03-02 | 03 | 2 | DB-04 | manual (two DB sessions) | N/A | N/A | ⬜ pending |
| 1-03-03 | 03 | 3 | AUTH-01 | unit (profile trigger mock) | `pnpm test:unit` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/unit/auth.spec.ts` — stubs for AUTH-01 (profile creation), AUTH-03 (reset-password page render), AUTH-04 (middleware redirect), AUTH-05 (Google OAuth button render), AUTH-06 (sign-out route)
- [ ] `pnpm add -D supabase` — Supabase CLI for `supabase gen types` and `supabase db push`

*Existing `tests/setup.ts` covers test environment setup — no changes needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Email verification flow completes | AUTH-02 | Requires real email + SMTP delivery | Sign up with real email, check inbox, click link, verify dashboard loads |
| User A cannot read User B's profile | DB-01 | Requires two concurrent DB sessions | Use Supabase SQL editor with two user JWTs, attempt cross-user SELECT |
| User A cannot read User B's bookings | DB-04 | Requires two concurrent DB sessions | Use Supabase SQL editor with two user JWTs, attempt cross-user SELECT on bookings |
| Performance indexes exist post-migration | DB-07 | Schema verification | Run `\d bookings` in psql or check Supabase Table Editor → indexes tab |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
