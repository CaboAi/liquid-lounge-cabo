---
phase: 2
slug: component-system-data-layer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.x + @testing-library/react 16 + jsdom |
| **Config file** | `vitest.config.ts` (exists) |
| **Quick run command** | `pnpm test:unit` |
| **Full suite command** | `pnpm test:unit` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test:unit`
- **After every plan wave:** Run `pnpm test:unit && pnpm build`
- **Before `/gsd:verify-work`:** Full suite green + manual browser checks
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 02-01 | 1 | UI-01, UI-02 | unit | `pnpm test:unit -- tests/unit/design-tokens.spec.ts` | ❌ Wave 0 | ⬜ pending |
| 2-02-01 | 02-02 | 2 | CLASS-02, CLASS-04, UI-04 | unit | `pnpm test:unit -- components/class-card.spec.tsx` | ❌ Wave 0 | ⬜ pending |
| 2-02-02 | 02-02 | 2 | UI-05 | unit | `pnpm test:unit -- components/credit-balance.spec.tsx` | ❌ Wave 0 | ⬜ pending |
| 2-02-03 | 02-02 | 2 | UI-03 | unit | `pnpm test:unit -- components/mobile-bottom-nav.spec.tsx` | ❌ Wave 0 | ⬜ pending |
| 2-03-01 | 02-03 | 2 | CLASS-01, CLASS-03 | unit | `pnpm test:unit -- hooks/use-classes.spec.ts` | ❌ Wave 0 | ⬜ pending |
| 2-03-02 | 02-03 | 2 | CLASS-01, UI-05 | unit | `pnpm test:unit -- hooks/use-credits.spec.ts` | ❌ Wave 0 | ⬜ pending |
| 2-03-03 | 02-03 | 2 | UI-04 | unit (browser) | manual — `pnpm dev` + check /classes | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `hooks/use-classes.spec.ts` — covers CLASS-01, CLASS-03 (mock Supabase, assert queryKey + filter passthrough)
- [ ] `hooks/use-credits.spec.ts` — covers credit balance read used by UI-05
- [ ] `components/class-card.spec.tsx` — covers CLASS-02, CLASS-04, UI-04
- [ ] `components/credit-balance.spec.tsx` — covers UI-05 pulse animation conditional class
- [ ] `components/mobile-bottom-nav.spec.tsx` — covers UI-03 (4 nav items, correct hrefs)
- [ ] `tests/unit/design-tokens.spec.ts` — covers UI-01, UI-02 (tailwind config token values + font import)

*Existing `tests/setup.ts` and `vitest.config.ts` cover all test infrastructure — no new setup needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| /classes page shows loading skeleton then real data | UI-04, CLASS-01 | Requires live Supabase + browser | Run `pnpm dev`, visit /classes, observe skeleton then data |
| TanStack Query DevTools show queries cached | CLASS-01 | Requires browser DevTools panel | Open /classes, check Query DevTools panel in bottom-right |
| Mobile nav renders correctly at 375px | UI-03 | Requires browser resize | DevTools → 375px viewport, verify 4 nav icons visible |
| Credit balance pulses orange at ≤2 credits | UI-05 | Requires real user with ≤2 credits | Sign in as test user with 1 credit, check dashboard |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending