# Phase 2: Component System + Data Layer - Research

**Researched:** 2026-03-10
**Domain:** TanStack Query v5 + Tailwind CSS v3 design tokens + Next.js 15 App Router component patterns
**Confidence:** HIGH

---

## Summary

Phase 2 builds the visual and data-fetching foundation on top of Phase 1's auth/schema work. Three distinct tracks run in parallel: (1) updating the Tailwind config to the Tropical Sunset design system, (2) building the canonical component library (class-card, booking-card, credit-balance, studio-card, mobile-bottom-nav), and (3) wiring TanStack Query hooks that read from Supabase using the typed `Database` interface already in `lib/supabase/types.ts`.

The project has TanStack Query v5.90 installed with `QueryProvider` already wired into `app/layout.tsx`. Stub versions of `class-card.tsx` and `credit-display.tsx` exist in `components/` but use mock shapes that do not match the DB types, so they must be replaced. The Tailwind config already has a rich animation/utility system but uses placeholder `var(--font-geist-sans)` fonts and lacks the Cabo Gold / Ocean Blue brand tokens. The `@/hooks/` directory does not exist yet — all four query hooks are net-new.

The critical path: tailwind.config.ts update (Plan 2.1) has zero code dependencies, component stubs (Plan 2.2) depend on the final type shapes from the DB types file, and query hooks (Plan 2.3) depend on the Supabase client pattern already established in `lib/supabase/client.ts`. All three plans can be executed in sequence within the same phase.

**Primary recommendation:** Use `queryOptions()` factory (TanStack Query v5 pattern) to co-locate key + fetcher, then spread into `useQuery()` in each hook — this gives type-safe key inference and avoids key duplication between prefetch and fetch sites.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CLASS-01 | User can browse available classes with filters (type, difficulty, time, studio) | `use-classes` hook with filter params; Supabase `.eq()` / `.gte()` / `.lte()` chaining |
| CLASS-02 | User can see class details (instructor, duration, credits, capacity remaining) | Join `classes` with `instructors` and aggregate `bookings` count in query |
| CLASS-03 | User can see a weekly schedule view | Filter `classes.scheduled_at` range ± 7 days in query hook |
| CLASS-04 | Classes show real-time availability (spots remaining) | `max_capacity - COUNT(bookings WHERE status='confirmed')` via Supabase RPC or select with aggregate |
| UI-01 | Tailwind config matches Tropical Sunset design system (Cabo Gold #FF9F43, Ocean Blue #0EA5E9) | Direct `tailwind.config.ts` edit — add `cabo-gold` and `ocean-blue` named tokens |
| UI-02 | Inter + Roboto Mono fonts loaded | `next/font/google` in `app/layout.tsx` — replace current `var(--font-geist-sans)` placeholder |
| UI-03 | Mobile bottom nav (Browse, Bookings, Credits, Profile) works at 375px | `fixed bottom-0` nav, `min-h-[60px]`, `pb-safe` safe-area inset, use Next.js `usePathname` for active state |
| UI-04 | All views have loading / error / empty states | Skeleton components for loading; TanStack Query `isPending` / `isError` / `data.length === 0` pattern |
| UI-05 | Credit balance pulses when low (≤2 credits) | Tailwind `animate-pulse` keyframe + conditional class; existing `tailwindcss-animate` plugin already installed |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-query | 5.90.21 (installed) | Server-state caching, loading/error states | Industry standard for async data in React; already wired |
| @tanstack/react-query-devtools | 5.84.2 (installed) | Cache inspection during dev | Already in QueryProvider |
| @supabase/supabase-js | 2.54+ (installed) | Supabase JS client | Matches SSR client already in lib/supabase/client.ts |
| tailwindcss | 3.4.1 (installed) | Utility CSS | Already configured with tailwindcss-animate |
| next/font/google | Next 15 built-in | Font loading | Zero-CLS, no external request at render |
| lucide-react | 0.539 (installed) | Icons | Already used in class-card.tsx; optimized via next.config.mjs |
| class-variance-authority | 0.7.1 (installed) | Variant-safe component props | Already used in button.tsx and badge.tsx |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tailwindcss-animate | 1.0.7 (installed) | Animation utilities including `animate-pulse` | Credit balance pulse, skeleton shimmer |
| clsx + tailwind-merge | installed | Conditional class merging | Already used via `cn()` in lib/utils.ts |
| zod | 3.24 (installed) | Filter params validation | Validate query filter inputs at hook boundary |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `queryOptions()` factory | inline object in `useQuery()` | Factory gives type-safe key tagging; inline is simpler but loses key reuse |
| `next/font/google` | `@fontsource/inter` npm package | next/font is zero-runtime and automatically self-hosted; fontsource adds bundle weight |
| Tailwind animate-pulse | Framer Motion | animate-pulse is already installed; Framer Motion adds 30 KB gzipped |

**Installation:** All required packages are already installed. No `pnpm add` needed for Phase 2.

---

## Architecture Patterns

### Recommended Project Structure
```
hooks/
├── use-classes.ts       # Classes query with filters
├── use-bookings.ts      # User bookings (upcoming + past)
├── use-credits.ts       # Profile credits + transaction history
└── use-profile.ts       # Current user profile

components/
├── class-card.tsx       # REPLACE existing stub — align to DB types
├── booking-card.tsx     # NEW
├── credit-balance.tsx   # NEW (replaces credit-display.tsx)
├── studio-card.tsx      # NEW
├── mobile-bottom-nav.tsx # NEW
└── ui/                  # Existing shadcn components — no changes

app/
└── classes/
    └── page.tsx         # NEW — /classes route, wires use-classes hook

lib/supabase/
├── client.ts            # Existing — no changes
├── server.ts            # Existing — no changes
└── types.ts             # Existing — source of truth for all component prop types
```

### Pattern 1: queryOptions Factory (TanStack Query v5)

**What:** Co-locate query key and fetcher function in a typed factory. Spread into `useQuery()`. Enables key reuse for prefetch/invalidation without duplication.

**When to use:** All four hooks in this phase (use-classes, use-bookings, use-credits, use-profile).

**Example:**
```typescript
// Source: @tanstack/react-query v5.90 installed source — queryOptions.ts
import { queryOptions, useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type ClassRow = Database['public']['Tables']['classes']['Row']

type ClassFilters = {
  class_type?: string
  difficulty_level?: string
  studio_id?: string
  from?: string   // ISO date string
  to?: string
}

export const classesQueryOptions = (filters: ClassFilters = {}) =>
  queryOptions({
    queryKey: ['classes', filters] as const,
    queryFn: async () => {
      const supabase = createClient()
      let query = supabase
        .from('classes')
        .select('*, studios(id, name, address, slug)')
        .eq('is_cancelled', false)
        .order('scheduled_at', { ascending: true })

      if (filters.class_type) query = query.eq('class_type', filters.class_type)
      if (filters.difficulty_level) query = query.eq('difficulty_level', filters.difficulty_level)
      if (filters.studio_id) query = query.eq('studio_id', filters.studio_id)
      if (filters.from) query = query.gte('scheduled_at', filters.from)
      if (filters.to) query = query.lte('scheduled_at', filters.to)

      const { data, error } = await query
      if (error) throw error
      return data
    },
    staleTime: 30_000,
  })

export function useClasses(filters: ClassFilters = {}) {
  return useQuery(classesQueryOptions(filters))
}
```

### Pattern 2: Loading / Error / Empty States

**What:** Each component that consumes a query must handle all three non-success states before rendering data.

**When to use:** Every page that uses a query hook.

**Example:**
```typescript
// Standard tristate guard for any query consumer
function ClassesPage() {
  const { data, isPending, isError, error } = useClasses()

  if (isPending) return <ClassesLoadingSkeleton />
  if (isError) return <ErrorState message={error.message} />
  if (data.length === 0) return <EmptyState message="No classes found" />

  return <ClassList classes={data} />
}

// Skeleton — use Tailwind animate-pulse (already in tailwindcss-animate)
function ClassesLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  )
}
```

### Pattern 3: Credit Pulse Animation (UI-05)

**What:** Conditional `animate-pulse` class when credits ≤ 2.

**When to use:** credit-balance component.

**Example:**
```typescript
// Uses tailwindcss-animate animate-pulse (already installed)
function CreditBalance({ credits }: { credits: number }) {
  const isLow = credits <= 2
  return (
    <span
      className={cn(
        'text-2xl font-bold font-mono',
        isLow ? 'text-cabo-gold animate-pulse' : 'text-ocean-blue'
      )}
    >
      {credits}
    </span>
  )
}
```

### Pattern 4: Mobile Bottom Nav (UI-03)

**What:** Fixed bottom bar at 60px height. Uses Next.js `usePathname` for active state. Adds `pb-safe` padding for iOS safe area (env(safe-area-inset-bottom)).

**When to use:** Renders in root layout or a shared layout for authenticated routes.

**Example:**
```typescript
'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/classes', label: 'Browse', icon: Search },
  { href: '/bookings', label: 'Bookings', icon: Calendar },
  { href: '/credits', label: 'Credits', icon: Coins },
  { href: '/profile', label: 'Profile', icon: User },
] as const

export function MobileBottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors',
              active ? 'text-cabo-gold' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
```

### Pattern 5: Tailwind Design Tokens (UI-01 + UI-02)

**What:** Add `cabo-gold` and `ocean-blue` as named color scales in `tailwind.config.ts`, replacing the current placeholder `brand` scale. Switch fonts from `var(--font-geist-sans)` to CSS variables set by `next/font/google`.

**When to use:** tailwind.config.ts and app/layout.tsx.

**Example — tailwind.config.ts additions:**
```typescript
// Add inside theme.extend.colors:
'cabo-gold': {
  DEFAULT: '#FF9F43',
  50:  '#FFF5EB',
  100: '#FFEAD6',
  200: '#FFD5AD',
  300: '#FFBF85',
  400: '#FFAF5C',
  500: '#FF9F43',   // brand primary
  600: '#FF8510',
  700: '#CC6800',
  800: '#994E00',
  900: '#663400',
},
'ocean-blue': {
  DEFAULT: '#0EA5E9',
  50:  '#F0F9FF',
  100: '#E0F2FE',
  200: '#BAE6FD',
  300: '#7DD3FC',
  400: '#38BDF8',
  500: '#0EA5E9',   // brand secondary
  600: '#0284C7',
  700: '#0369A1',
  800: '#075985',
  900: '#0C4A6E',
},
```

**Example — layout.tsx font loading (next/font/google):**
```typescript
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
})

// Apply on <html> tag:
<html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>

// tailwind.config.ts fontFamily:
fontFamily: {
  sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
  mono: ['var(--font-roboto-mono)', 'Consolas', 'monospace'],
}
```

**IMPORTANT:** `content` array in `tailwind.config.ts` currently misses `./components/**/*.{tsx,ts}`. This must be added or new component classes will be purged in build.

### Anti-Patterns to Avoid

- **Inline query keys as plain strings:** `useQuery({ queryKey: ['classes'] })` — loses type tagging. Use `queryOptions()` factory so keys are typed and reusable.
- **Server Component fetching data AND Client Component fetching the same data:** Pick one per route. Dashboard currently uses Server Component direct Supabase fetch — keep that pattern for initial page load; use Client Component + TanStack Query for interactive filtering on `/classes`.
- **`'use client'` on every component by default:** Only mark components that use hooks (`useQuery`, `usePathname`, `useState`). Leaf display components like `ClassCard` that just render props should remain server-compatible (no directive needed unless using event handlers).
- **Creating a `/classes/page.tsx` as a Server Component that also tries to use TanStack Query:** TanStack Query is client-only in this project. Create a `ClassesClient` child component with `'use client'` that owns the query, and keep the page itself as a Server Component shell.
- **Using `credit-display.tsx` as-is:** Its `handleQuickAdd` uses `setTimeout` mock — must be replaced with real credit data from `use-credits` hook.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Loading skeleton shimmer | Custom CSS keyframe animation | `animate-pulse` from `tailwindcss-animate` (installed) | Consistent timing, purgeable, no JS |
| Query cache invalidation | Custom event bus / zustand | `queryClient.invalidateQueries({ queryKey: ['classes'] })` | TanStack Query handles stale-while-revalidate automatically |
| Font optimization | Static `<link>` tag or npm font packages | `next/font/google` | Automatic subsetting, self-hosting, zero CLS |
| Filter serialization | Custom URL state manager | Keep filters in component state for Phase 2; URL params in Phase 5 | Minimum viable for this phase |
| Spots remaining calculation | Custom computed field in component | `max_capacity - confirmed_bookings_count` computed in Supabase query select or RPC | DB-side computation is consistent across clients |
| Conditional CSS animation | Custom useEffect + className toggle | `animate-pulse` conditional class with `cn()` | Declarative, no useEffect needed |

**Key insight:** The animation, caching, and font problems all have zero-configuration solutions in the already-installed stack. Building custom versions would duplicate behavior and add maintenance burden.

---

## Common Pitfalls

### Pitfall 1: Tailwind content paths missing `components/`
**What goes wrong:** Custom component classes like `text-cabo-gold` or `bg-ocean-blue` get purged in `pnpm build` — colors work in dev (JIT scanning) but vanish in production.
**Why it happens:** `tailwind.config.ts` `content` array currently lists `./pages/**`, `./app/**`, `./lib/**` — `./components/**` is absent.
**How to avoid:** Add `'./components/**/*.{js,ts,jsx,tsx}'` to the content array before writing any component.
**Warning signs:** Colors present in dev, missing after `pnpm build`. TypeScript passes, build passes, but visual regression.

### Pitfall 2: TanStack Query v5 object-only API (no positional args)
**What goes wrong:** Using v4 API `useQuery(['key'], fetchFn)` throws a TypeScript error in v5.
**Why it happens:** v5 removed the positional overload — everything is one options object.
**How to avoid:** Always use `useQuery({ queryKey: [...], queryFn: ... })` or spread from `queryOptions()` factory.
**Warning signs:** `TS2554: Expected 1-2 arguments, but got 2.` on any `useQuery` call with two positional args.

### Pitfall 3: `'use client'` required for TanStack Query hooks
**What goes wrong:** Calling `useQuery` in a Server Component causes a React runtime error.
**Why it happens:** TanStack Query hooks use React context (`useQueryClient`) which requires client-side rendering.
**How to avoid:** All files that import `useQuery`, `useMutation`, or any custom `use-*` hook MUST have `'use client'` at the top. The page file itself can stay as a Server Component by delegating to a `*Client` child.
**Warning signs:** `Error: useContext is not a function` or `Error: Hooks can only be called inside of the body of a function component`.

### Pitfall 4: Supabase `select()` with joins requires foreign key relationships
**What goes wrong:** `supabase.from('classes').select('*, studios(name)')` returns empty nested objects or errors if no FK relationship is defined in the PostgREST schema cache.
**Why it happens:** Supabase's auto-API relies on FK metadata. The schema has `classes.studio_id` referencing `studios.id` — this should work, but the relationship must exist in the migration.
**How to avoid:** Verify the FK in `001_schema.sql` before writing join selects. Fallback: separate queries + manual join in the hook.
**Warning signs:** `{ studios: null }` in response despite valid `studio_id` value.

### Pitfall 5: `next/font/google` variable name collision
**What goes wrong:** `Inter` from `next/font/google` exported as `inter` conflicts with the existing `Inter` import in `app/layout.tsx` (which uses `.className` not `.variable`).
**Why it happens:** The current layout uses `inter.className` on `<body>` — switching to font variables requires moving application to `<html>` tag and changing tailwind font config simultaneously.
**How to avoid:** Do the font migration atomically: update layout.tsx (move to `<html>`, use `.variable`), update tailwind fontFamily config, and remove the old `inter.className` from `<body>` in one commit.
**Warning signs:** `var(--font-inter)` resolves to nothing in DevTools → body has no fallback font → system-ui renders instead of Inter.

### Pitfall 6: Mobile bottom nav adds height — body content gets clipped
**What goes wrong:** Fixed bottom nav obscures the last items in a scrollable list.
**Why it happens:** `fixed` removes the element from flow; body content doesn't know to pad.
**How to avoid:** Add `pb-20` (or `pb-16`) to the main content wrapper in any layout that renders the bottom nav, so scrollable content clears the nav.
**Warning signs:** Last booking/class card partially hidden at bottom of viewport.

---

## Code Examples

Verified patterns from installed source code:

### TanStack Query v5 — useQuery single options object
```typescript
// Source: @tanstack/react-query v5.90 src/useQuery.ts (installed)
import { useQuery } from '@tanstack/react-query'

// v5 — single object arg only
const { data, isPending, isError, error } = useQuery({
  queryKey: ['profile', userId],
  queryFn: async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },
  enabled: !!userId,
  staleTime: 60_000,
})
```

### TanStack Query v5 — queryOptions factory (type-safe keys)
```typescript
// Source: @tanstack/react-query v5.90 src/queryOptions.ts (installed)
import { queryOptions } from '@tanstack/react-query'

// Factory pattern — key is typed, reusable for invalidation
export const profileQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['profile', userId] as const,
    queryFn: async () => { /* ... */ },
  })

// In hook:
export function useProfile(userId: string) {
  return useQuery(profileQueryOptions(userId))
}

// In server component or prefetch:
await queryClient.prefetchQuery(profileQueryOptions(userId))

// In mutation onSuccess:
queryClient.invalidateQueries({ queryKey: profileQueryOptions(userId).queryKey })
```

### Supabase typed query using Database types
```typescript
// Source: lib/supabase/types.ts (project file)
import type { Database } from '@/lib/supabase/types'

type BookingRow = Database['public']['Tables']['bookings']['Row']

// Type-safe: columns and return shape are verified by TS
const { data } = await supabase
  .from('bookings')
  .select('*')
  .eq('user_id', userId)
  .order('booked_at', { ascending: false })

// data is BookingRow[] | null
```

### Conditional animate-pulse with cn()
```typescript
// Source: tailwindcss-animate v1.0.7 (installed) + lib/utils.ts cn()
import { cn } from '@/lib/utils'

// Credit balance — pulses orange when credits <= 2
<span className={cn(
  'text-3xl font-bold font-mono transition-colors',
  credits <= 2
    ? 'text-cabo-gold animate-pulse'
    : 'text-foreground'
)}>
  {credits}
</span>
```

### next/font/google Roboto_Mono (note underscore in import)
```typescript
// Source: next/font/google — Roboto_Mono uses underscore, not hyphen
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useQuery(['key'], fn)` two args | `useQuery({ queryKey, queryFn })` single object | TanStack Query v5 (2023) | Breaking — all hooks must use object form |
| `isLoading` boolean | `isPending` boolean | TanStack Query v5 | `isLoading` still works but `isPending` is preferred |
| `next/font` with `.className` on `<body>` | `.variable` CSS variable on `<html>` + Tailwind config | Next.js 13+ best practice | Enables font to cascade into all elements via CSS variable |
| `@fontsource/*` npm packages | `next/font/google` built-in | Next.js 13 | Self-hosted, zero CLS, no external request |
| Manual query key arrays | `queryOptions()` factory | TanStack Query v5 | Type inference flows through key to data |

**Deprecated/outdated:**
- `credit-display.tsx` mock `handleQuickAdd` with `setTimeout`: must be replaced with real `use-credits` hook.
- `class-card.tsx` prop shape `credits_required` / `next_schedule`: does not match DB column `credit_cost` / `scheduled_at` — must be reconciled before Phase 3 booking integration.
- `var(--font-geist-sans)` in tailwind.config.ts: Geist is not loaded anywhere; must be replaced with `--font-inter`.

---

## Open Questions

1. **Spots remaining (CLASS-04): query-side vs. RPC**
   - What we know: `classes.max_capacity` is in DB. `bookings` table has `status` column. A count of `status='confirmed'` bookings per class gives spots taken.
   - What's unclear: Whether to compute this as a Supabase RPC, a view, or in the query with `.select('*, bookings(count)')`. The FK relationship exists in the schema.
   - Recommendation: Use `select('*, bookings!inner(count)')` aggregate syntax (PostgREST v11+ supports this). Test in Supabase studio before implementing. Fallback: separate query per class.

2. **Weekly schedule view (CLASS-03): client-side date grouping vs. DB range filter**
   - What we know: `scheduled_at` is indexed (`003_indexes.sql`). Filtering by date range in the query is efficient.
   - What's unclear: Whether the weekly view needs its own dedicated route (`/classes/week`) or is a filter mode on `/classes`.
   - Recommendation: Implement as a filter mode on `/classes` — pass `from` and `to` date range to `classesQueryOptions`. Keep `/classes` as the single route for Phase 2.

3. **`/classes` route — Server Component shell + Client child pattern**
   - What we know: `/dashboard` is a full Server Component with direct Supabase fetch. TanStack Query hooks require `'use client'`.
   - What's unclear: Whether the planner wants initial data SSR-prefetched (HydrationBoundary) or pure client-fetch.
   - Recommendation: Pure client-fetch for Phase 2 simplicity. `app/classes/page.tsx` is a Server Component shell that just renders `<ClassesClient />`, which owns the TanStack Query hook and all filter state. SSR prefetching is a Phase 5 performance optimization.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.x + @testing-library/react 16 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `pnpm test:unit` |
| Full suite command | `pnpm test:unit` (runs all `*.spec.ts` / `*.spec.tsx`) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CLASS-01 | `useClasses` returns filtered data array | unit | `pnpm test:unit -- hooks/use-classes.spec.ts` | ❌ Wave 0 |
| CLASS-02 | ClassCard renders instructor, duration, credit_cost, spots_remaining | unit | `pnpm test:unit -- components/class-card.spec.tsx` | ❌ Wave 0 |
| CLASS-03 | `useClasses({ from, to })` passes correct date range to query | unit | `pnpm test:unit -- hooks/use-classes.spec.ts` | ❌ Wave 0 |
| CLASS-04 | ClassCard renders `spots_remaining` computed field | unit | `pnpm test:unit -- components/class-card.spec.tsx` | ❌ Wave 0 |
| UI-01 | tailwind.config.ts exports cabo-gold `#FF9F43` and ocean-blue `#0EA5E9` | unit | `pnpm test:unit -- tests/unit/design-tokens.spec.ts` | ❌ Wave 0 |
| UI-02 | layout.tsx imports Inter and Roboto_Mono from next/font/google | unit (import check) | `pnpm test:unit -- tests/unit/design-tokens.spec.ts` | ❌ Wave 0 |
| UI-03 | MobileBottomNav renders 4 links at correct hrefs | unit | `pnpm test:unit -- components/mobile-bottom-nav.spec.tsx` | ❌ Wave 0 |
| UI-04 | ClassesClient renders skeleton when isPending=true | unit | `pnpm test:unit -- components/class-card.spec.tsx` | ❌ Wave 0 |
| UI-05 | CreditBalance applies animate-pulse class when credits ≤ 2 | unit | `pnpm test:unit -- components/credit-balance.spec.tsx` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test:unit`
- **Per wave merge:** `pnpm test:unit` (full suite — all 17 existing + new Phase 2 tests)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `hooks/use-classes.spec.ts` — covers CLASS-01, CLASS-03 — mock Supabase client, assert queryKey structure and filter passthrough
- [ ] `hooks/use-credits.spec.ts` — covers CRED-03 (credit balance read) used in UI-05
- [ ] `components/class-card.spec.tsx` — covers CLASS-02, CLASS-04, UI-04
- [ ] `components/credit-balance.spec.tsx` — covers UI-05 pulse animation conditional class
- [ ] `components/mobile-bottom-nav.spec.tsx` — covers UI-03 (4 nav items, correct hrefs)
- [ ] `tests/unit/design-tokens.spec.ts` — covers UI-01, UI-02 (import + config value assertions)

All test files use existing `tests/setup.ts` (jsdom environment, already configured in vitest.config.ts). No new test infrastructure needed.

---

## Sources

### Primary (HIGH confidence)
- `C:/Users/mario/cabo-fit-pass/node_modules/.pnpm/@tanstack+react-query@5.90.21_react@19.2.4/node_modules/@tanstack/react-query/src/` — TanStack Query v5 source: `useQuery.ts`, `queryOptions.ts`, `index.ts` — verified v5 object-only API, `queryOptions()` factory
- `C:/Users/mario/cabo-fit-pass/lib/supabase/types.ts` — authoritative DB column shapes for all components
- `C:/Users/mario/cabo-fit-pass/tailwind.config.ts` — current config state, identified missing `components/` content path
- `C:/Users/mario/cabo-fit-pass/package.json` — confirmed all required libraries are installed at correct versions
- `C:/Users/mario/cabo-fit-pass/vitest.config.ts` — confirmed test infrastructure (jsdom, @vitejs/plugin-react, `@/*` alias)
- `C:/Users/mario/cabo-fit-pass/components/providers/query-provider.tsx` — confirmed QueryProvider + DevTools already wired

### Secondary (MEDIUM confidence)
- `C:/Users/mario/cabo-fit-pass/app/layout.tsx` — confirmed current Inter font usage (`.className` on `<body>`) — identifies migration scope
- `C:/Users/mario/cabo-fit-pass/components/class-card.tsx` + `credit-display.tsx` — identified prop shape mismatches with DB types
- `C:/Users/mario/cabo-fit-pass/tsconfig.json` — confirmed `@/hooks/*` path alias is already defined

### Tertiary (LOW confidence)
- next/font/google Roboto_Mono underscore naming: inferred from Next.js font convention (font names with spaces use underscores in import). Flag for validation on first `pnpm typecheck` run.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified from installed node_modules and package.json
- Architecture: HIGH — queryOptions factory verified from installed TanStack Query v5 source; component patterns verified from existing code
- Pitfalls: HIGH for tailwind content path (directly observed) and v5 API change (verified from source); MEDIUM for Supabase FK join behavior (inferred from schema, needs runtime validation)

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable libraries — TanStack Query v5 and Tailwind v3 are not fast-moving at this point)
