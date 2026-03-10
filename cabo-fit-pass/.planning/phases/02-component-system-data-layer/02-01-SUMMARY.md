---
phase: 02-component-system-data-layer
plan: 01
subsystem: design-tokens
tags: [tailwind, fonts, brand-colors, design-system]
dependency_graph:
  requires: []
  provides: [cabo-gold color scale, ocean-blue color scale, CSS font variables]
  affects: [all components using text-cabo-gold, text-ocean-blue, font-sans, font-mono]
tech_stack:
  added: [Roboto_Mono from next/font/google]
  patterns: [CSS variable font loading via .variable, Tailwind named color scales with DEFAULT]
key_files:
  created: [tests/unit/design-tokens.spec.ts]
  modified: [tailwind.config.ts, app/layout.tsx]
decisions:
  - brand color scale renamed from placeholder ocean-blue values to cabo-gold (#FF9F43) + ocean-blue (#0EA5E9) as distinct scales
  - Font migration from inter.className on body to .variable on html so Tailwind fontFamily var() references resolve
  - components/ added to Tailwind content array to prevent brand class purge in production
metrics:
  duration: 8 min
  completed: "2026-03-10"
  tasks: 2/2
  files: 3
---

# Phase 2 Plan 1: Design Tokens + Font Migration Summary

**One-liner:** Cabo Gold (#FF9F43) and Ocean Blue (#0EA5E9) color scales added to Tailwind with Inter/Roboto Mono loaded via next/font/google CSS variables, replacing broken Geist font references.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Write design-tokens test (RED) | 6c824b6 | tests/unit/design-tokens.spec.ts |
| 2 | Update tailwind.config.ts + layout.tsx (GREEN) | 76302c3 | tailwind.config.ts, app/layout.tsx |

## Verification Results

- `pnpm test:unit -- tests/unit/design-tokens.spec.ts` — 6 tests pass
- All 23 unit tests pass (6 new + 17 pre-existing)
- `pnpm typecheck` — exits 0
- `pnpm build` — exits 0, all routes build cleanly

## Decisions Made

1. **Color scale rename:** `brand` placeholder (ocean-blue values) replaced with two named scales — `cabo-gold` with DEFAULT `#FF9F43` and `ocean-blue` with DEFAULT `#0EA5E9`. Keeps Shadcn UI semantic tokens untouched.
2. **Font variable pattern:** Migrated from `inter.className` on `<body>` to `inter.variable + robotoMono.variable` on `<html>`. This is required for Tailwind `fontFamily: { sans: ['var(--font-inter)'] }` to resolve at runtime.
3. **Content path:** Added `./components/**/*.{js,ts,jsx,tsx,mdx}` to Tailwind content array — without this, brand classes used in component files would be stripped in production builds.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `tests/unit/design-tokens.spec.ts` — FOUND
- `tailwind.config.ts` contains `cabo-gold` — FOUND
- `app/layout.tsx` contains `--font-inter` — FOUND
- Commit 6c824b6 — FOUND
- Commit 76302c3 — FOUND
