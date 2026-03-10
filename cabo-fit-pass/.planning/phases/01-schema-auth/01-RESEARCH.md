# Phase 1: Schema + Auth — Research

**Researched:** 2026-03-09
**Domain:** Supabase SSR auth + PostgreSQL schema migrations + RLS policies (Next.js 15 App Router)
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can sign up with email and password | Sign-up page exists; `supabase.auth.signUp()` call in place — needs profile trigger wired |
| AUTH-02 | User receives email verification and must confirm before accessing dashboard | Email redirect to `/auth/callback` is wired; callback route exchanges code for session |
| AUTH-03 | User can reset password via email link | `forgot-password/page.tsx` exists with `resetPasswordForEmail`; needs `/auth/reset-password` page added |
| AUTH-04 | User session persists across browser refresh | Middleware calls `getUser()` on every request via `@supabase/ssr`; pattern is correct |
| AUTH-05 | User can sign in with Google OAuth | NOT YET IMPLEMENTED — requires Supabase Google provider config + OAuth button on signin page |
| AUTH-06 | User can sign out from any page | NOT YET IMPLEMENTED — no sign-out button exists anywhere in current codebase |
| DB-01 | Canonical profiles table with credits column, RLS enforced | `lib/supabase/types.ts` defines target schema; old migrations use `monthly_credits`/`gyms` — canonical migration must reconcile |
| DB-02 | Studios table with owner_id FK, public read RLS | Defined in `types.ts` as `studios`; old migrations have `gyms` table — Phase 1 must define `studios` authoritatively |
| DB-03 | Classes table with capacity, credit_cost, scheduled_at | Defined in `types.ts`; old migrations have `classes` augmented with `gym_id` FK — canonical migration must use `studio_id` |
| DB-04 | Bookings table — users see only their own rows (RLS) | Defined in `types.ts`; existing RLS migration covers bookings table |
| DB-05 | credit_transactions table — immutable audit log | Defined in `types.ts` with `Update: Record<string, never>` enforcing immutability |
| DB-06 | Plans and subscriptions tables for credit packages | Both defined in `types.ts`; need clean migrations |
| DB-07 | Performance indexes on bookings.user_id, classes.scheduled_at | Must be explicit in 003_indexes migration |
</phase_requirements>

---

## Summary

This project has a **schema bifurcation problem** that must be resolved in Phase 1. The existing migration files in `supabase/migrations/` (dated 20241208*) operate on a `gyms`-based schema with `monthly_credits` and a `gym_staff` join table. Meanwhile, `lib/supabase/types.ts` — the canonical TypeScript type file that Next.js components actually import and use — describes a cleaner `studios`/`credits` schema. These two worlds are inconsistent. The live Supabase database schema is unknown, but the TypeScript types represent the intended target.

Phase 1 must write fresh, authoritative SQL migrations that establish the `studios`-based schema defined in `types.ts`, enable RLS on all tables, create the performance indexes, and write the `handle_new_user()` trigger. Auth pages (signin, signup, forgot-password, callback) are substantially complete but need two additions: Google OAuth support (AUTH-05) and a sign-out mechanism (AUTH-06). A `/auth/reset-password` page is also missing for the password-reset flow to complete.

The good news: `@supabase/ssr` is already installed and correctly configured in `lib/supabase/client.ts`, `lib/supabase/server.ts`, and `middleware.ts`. The SSR pattern is right. No auth library swap is needed.

**Primary recommendation:** Write 4 numbered migration files (`001_schema`, `002_rls`, `003_indexes`, `004_seed`) that match the `types.ts` definitions exactly, then update `types.ts` to match the live schema via `supabase gen types`. Add Google OAuth button and sign-out action to complete AUTH-05 and AUTH-06.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/ssr` | 0.6.1 (installed) | SSR-safe Supabase client for Next.js App Router | Required for server components, middleware, route handlers — replaces deprecated `@supabase/auth-helpers-nextjs` |
| `@supabase/supabase-js` | 2.54.0 (installed) | Core Supabase client | Foundation; `@supabase/ssr` wraps this |
| `next` | 15.3.0 (installed) | App Router framework | Project baseline |
| Supabase CLI | latest | Run `supabase db push`, `supabase gen types` | Official toolchain for migrations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `supabase gen types typescript` | CLI command | Generate `types.ts` from live schema | After every migration is applied |
| Supabase Dashboard | web | Configure OAuth providers, email templates | One-time setup per provider |
| `zod` | 3.24.0 (installed) | Validate auth form inputs server-side | Add to server actions if using them |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase Auth | NextAuth.js | NextAuth was removed in Phase 0 — do not re-add; `@supabase/ssr` owns auth |
| Server Actions for forms | Client-side `supabase.auth.*` calls | Current client-side pattern is fine for auth forms; server actions add complexity without benefit here |

**Installation:** No new packages needed — `@supabase/ssr` and `@supabase/supabase-js` are already in `package.json`.

---

## Architecture Patterns

### Migration File Naming Convention
```
supabase/migrations/
├── 001_schema.sql       # CREATE TABLE statements only
├── 002_rls.sql          # ENABLE ROW LEVEL SECURITY + CREATE POLICY
├── 003_indexes.sql      # CREATE INDEX (performance)
└── 004_seed.sql         # INSERT INTO plans (credit packs seed data)
```

The existing 20241208* migration files are exploratory/legacy. Phase 1 writes the four authoritative migrations numbered 001–004. Do NOT modify or delete the 20241208* files — they may be tracked. Write new canonical ones.

### Canonical Schema (from `types.ts` — this is the target)

The `types.ts` file defines the intended schema precisely. Migrations must produce exactly this shape:

**profiles** — linked 1:1 with `auth.users`
- `id uuid PK` — equals `auth.users.id`
- `full_name text`
- `avatar_url text`
- `phone text`
- `locale text DEFAULT 'en'`
- `role text CHECK IN ('member', 'studio_owner', 'admin') DEFAULT 'member'`
- `credits integer NOT NULL DEFAULT 0 CHECK (credits >= 0)`
- `created_at timestamptz DEFAULT now()`
- `updated_at timestamptz DEFAULT now()`

**studios** — NOT `gyms`
- `id uuid PK`
- `name text NOT NULL`
- `slug text UNIQUE NOT NULL`
- `description text`
- `address text`
- `logo_url text`
- `cover_url text`
- `is_active boolean DEFAULT true`
- `owner_id uuid REFERENCES profiles(id)`
- `created_at timestamptz DEFAULT now()`

**instructors**
- `id uuid PK`, `studio_id uuid REFERENCES studios(id)`, `name text`, `bio text`, `avatar_url text`, `specialties text[] DEFAULT '{}'`, `created_at timestamptz`

**classes**
- `id uuid PK`
- `studio_id uuid REFERENCES studios(id)` — NOT `gym_id`
- `instructor_id uuid REFERENCES instructors(id)`
- `title text NOT NULL`
- `description text`
- `class_type text NOT NULL`
- `difficulty_level text CHECK IN ('beginner','intermediate','advanced') DEFAULT 'beginner'`
- `scheduled_at timestamptz NOT NULL`
- `duration_minutes integer DEFAULT 60`
- `credit_cost integer DEFAULT 1 CHECK (credit_cost > 0)`
- `max_capacity integer DEFAULT 20`
- `is_cancelled boolean DEFAULT false`
- `cancellation_window_hours integer DEFAULT 2`
- `created_at timestamptz`

**bookings**
- `id uuid PK`
- `user_id uuid REFERENCES profiles(id)`
- `class_id uuid REFERENCES classes(id)`
- `status text CHECK IN ('confirmed','cancelled','attended','no_show') DEFAULT 'confirmed'`
- `credits_charged integer NOT NULL`
- `booked_at timestamptz DEFAULT now()`
- `cancelled_at timestamptz`

**credit_transactions** — immutable (no UPDATE allowed)
- `id uuid PK`
- `user_id uuid REFERENCES profiles(id)`
- `amount integer NOT NULL` — positive = credit, negative = debit
- `type text CHECK IN ('purchase','booking','refund','rollover','bonus')`
- `reference_id uuid` — FK to booking or subscription
- `note text`
- `created_at timestamptz DEFAULT now()`

**plans**
- `id uuid PK`, `name text`, `credits integer`, `price_cents integer`, `stripe_price_id text`, `validity_days integer DEFAULT 30`, `is_active boolean DEFAULT true`, `created_at timestamptz`

**subscriptions**
- `id uuid PK`, `user_id uuid REFERENCES profiles(id)`, `plan_id uuid REFERENCES plans(id)`, `stripe_subscription_id text`, `status text`, `current_period_start timestamptz`, `current_period_end timestamptz`, `credits_remaining integer DEFAULT 0`, `rollover_percentage integer DEFAULT 0`, `rollover_cap_credits integer DEFAULT 0`, `created_at timestamptz`

### Pattern 1: Auto Profile Creation Trigger

When a user signs up via Supabase Auth, a profile row must be automatically created. This must fire on `auth.users` INSERT.

```sql
-- Source: Supabase official docs + existing auto_profile_creation.sql in this repo
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, credits)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'member',
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

`SECURITY DEFINER SET search_path = public` is required — without it the trigger runs as the calling role and cannot write to `public.profiles`.

### Pattern 2: RLS Policy Structure

Each table needs explicit policies per operation. The canonical pattern for this app:

```sql
-- profiles: users see and update only their own row
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- studios: anyone can read active studios
CREATE POLICY "studios_public_read" ON studios
  FOR SELECT USING (is_active = true);

-- bookings: users see only their own
CREATE POLICY "bookings_select_own" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "bookings_insert_own" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- credit_transactions: users see only their own, nobody inserts via client
CREATE POLICY "credit_transactions_select_own" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);
-- No INSERT policy for anon/authenticated — service_role only inserts
```

**Key:** Use `auth.uid()` not a custom `auth.user_id()` function. `auth.uid()` is the standard built-in Supabase function.

### Pattern 3: Supabase SSR Client (already correct in codebase)

The existing `lib/supabase/client.ts` and `lib/supabase/server.ts` implement the correct pattern for `@supabase/ssr` 0.6+. Do not change these files.

### Pattern 4: Google OAuth

```typescript
// In a sign-in button handler (client component)
const supabase = createClient()
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
})
```

The `callback/route.ts` already handles `exchangeCodeForSession` — this route also handles OAuth codes, so no route change needed. OAuth requires enabling Google provider in Supabase Dashboard and configuring Google Cloud Console OAuth credentials.

### Pattern 5: Sign Out (Server Action)

```typescript
// app/auth/signout/route.ts  (POST route handler)
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/signin')
}
```

Call via a form with `method="POST"` action pointing to `/auth/signout`, or via client-side `supabase.auth.signOut()` then `router.push('/auth/signin')`.

### Pattern 6: Password Reset Completion Page

The `forgot-password` page sends a reset link to `/auth/callback?next=/auth/reset-password`. The callback route exists and handles the code exchange. What is missing: `/auth/reset-password/page.tsx` — a page that calls `supabase.auth.updateUser({ password: newPassword })`.

```typescript
// app/auth/reset-password/page.tsx (client component)
const supabase = createClient()
await supabase.auth.updateUser({ password: newPassword })
```

### Recommended Project Structure (additions for Phase 1)

```
app/
├── auth/
│   ├── callback/route.ts         (exists — correct)
│   ├── forgot-password/page.tsx  (exists — correct)
│   ├── reset-password/page.tsx   (MISSING — add)
│   ├── signin/                   (exists — add Google OAuth button)
│   └── signup/                   (exists — correct)
├── auth/signout/route.ts         (MISSING — add)
lib/
└── supabase/
    ├── client.ts    (exists — correct)
    ├── server.ts    (exists — correct)
    └── types.ts     (exists — REGENERATE after migrations applied)
supabase/
└── migrations/
    ├── 001_schema.sql     (write fresh)
    ├── 002_rls.sql        (write fresh)
    ├── 003_indexes.sql    (write fresh)
    └── 004_seed.sql       (write fresh)
```

### Anti-Patterns to Avoid

- **Using `auth.user_id()` custom function instead of `auth.uid()`:** The existing 20241208* RLS migration defines a custom `auth.user_id()` function. Use the built-in `auth.uid()` instead — it's always available in Supabase projects without needing to create it.
- **Adding UPDATE policies to credit_transactions:** The `types.ts` specifies `Update: Record<string, never>` — this is intentional. The table is an immutable audit log. Only `service_role` should insert; no client-side UPDATE.
- **NOT using SECURITY DEFINER on the profile trigger:** The trigger function must be SECURITY DEFINER or it will fail to write to `profiles` when called by the `anon` or `authenticated` role.
- **Calling `supabase.auth.getSession()` in server components:** This reads from the cookie without verifying with the auth server. Always use `supabase.auth.getUser()` in server components. The existing code correctly uses `getUser()` in middleware and dashboard.
- **Using `gyms` table:** The old migrations used `gyms`. This project's canonical name is `studios`. Do not reference the `gyms` table in new code or migrations.
- **Duplicate policy names:** If any old policies exist on tables in the live DB, new migrations must drop them before creating new ones (`DROP POLICY IF EXISTS`).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session management across server/client | Custom cookie handling | `@supabase/ssr` `createServerClient` / `createBrowserClient` | Token refresh, cookie synchronization, race conditions are non-trivial |
| RLS policy testing | Manual SQL queries | `supabase.rpc()` calls from two separate client sessions | Testing RLS requires authenticated sessions; Supabase testing utilities handle this |
| TypeScript DB types | Manual interface definitions | `supabase gen types typescript --project-id <id> > lib/supabase/types.ts` | Hand-written types drift from DB; generated types stay in sync |
| Password hashing | bcrypt/argon2 implementation | Supabase Auth (handles internally) | Supabase Auth uses bcrypt internally; never store raw passwords |
| Email verification flow | Custom token generation | Supabase Auth `signUp` with `emailRedirectTo` | Supabase handles SMTP, token expiry, one-time use enforcement |

**Key insight:** Supabase Auth is a complete auth system. The only custom code needed is the UI layer and the `handle_new_user` trigger to bridge `auth.users` to `public.profiles`.

---

## Common Pitfalls

### Pitfall 1: Schema Mismatch Between Migrations and types.ts

**What goes wrong:** The 20241208* migrations reference `gyms`, `monthly_credits`, `gym_staff`. The `types.ts` uses `studios`, `credits`. If Phase 1 migrations are applied to the same DB where old migrations ran, column/table name conflicts will cause errors.
**Why it happens:** The project has exploratory migrations from an earlier iteration that never settled on a canonical schema.
**How to avoid:** The 001_schema.sql must use `CREATE TABLE IF NOT EXISTS` with the canonical names from `types.ts`. If the live DB has `gyms` tables, they should remain untouched (or the DB should be reset for development). After applying migrations, regenerate `types.ts` with `supabase gen types`.
**Warning signs:** TypeScript errors in dashboard/page.tsx referencing `profile.credits` vs `profile.monthly_credits`.

### Pitfall 2: RLS Blocking the Profile Trigger

**What goes wrong:** After enabling RLS on `profiles`, new user signups fail silently — the trigger fires but cannot INSERT.
**Why it happens:** The trigger runs as the `authenticated` role by default. With RLS enabled and the INSERT policy checking `auth.uid() = id`, the trigger context may not have a JWT, so `auth.uid()` returns null.
**How to avoid:** Declare the trigger function as `SECURITY DEFINER` — it then runs as the function's owner (postgres), which bypasses RLS.
**Warning signs:** User signs up, receives verification email, confirms, but no row in `profiles` table.

### Pitfall 3: Missing /auth/reset-password Page

**What goes wrong:** The forgot-password flow sends users to `/auth/callback?next=/auth/reset-password`. The callback exchanges the code for a session and redirects to `/auth/reset-password`. If this page doesn't exist, users hit a 404.
**Why it happens:** The page was not created in Phase 0.
**How to avoid:** Create `/auth/reset-password/page.tsx` that calls `supabase.auth.updateUser({ password })`.
**Warning signs:** Password reset links lead to 404.

### Pitfall 4: Google OAuth Redirect URI Mismatch

**What goes wrong:** Google OAuth returns "redirect_uri_mismatch" error.
**Why it happens:** Google Cloud Console OAuth credentials must explicitly list the Supabase callback URL as an authorized redirect URI. The URL format is `https://<project-ref>.supabase.co/auth/v1/callback`.
**How to avoid:** Add both local (`http://localhost:3000/auth/callback`) and production URL to Supabase Dashboard "Redirect URLs" config, and add the Supabase callback URL to Google Cloud Console.
**Warning signs:** "Error 400: redirect_uri_mismatch" in browser after clicking Google sign-in.

### Pitfall 5: Credits Column Name Collision

**What goes wrong:** `profiles` in `types.ts` uses `credits`. The old migrations added `monthly_credits`. If the live DB has `monthly_credits` and code references `credits`, queries return null.
**Why it happens:** Schema bifurcation between old migrations and new types.
**How to avoid:** The canonical 001_schema migration must create `credits` column. After applying, regenerate types. Do not reference `monthly_credits` in new code.
**Warning signs:** `profile?.credits` always returns undefined in dashboard.

### Pitfall 6: service_role Key Exposed Client-Side

**What goes wrong:** `SUPABASE_SERVICE_ROLE_KEY` is used in client-side code, bypassing all RLS.
**Why it happens:** Developer copies server-side patterns to client components.
**How to avoid:** `SUPABASE_SERVICE_ROLE_KEY` must NEVER appear in client code or be prefixed `NEXT_PUBLIC_`. Only use it in server-side route handlers and Edge Functions.
**Warning signs:** Service role key in `createBrowserClient()` call.

---

## Code Examples

### 001_schema.sql Structure
```sql
-- Source: lib/supabase/types.ts (canonical schema definition for this project)

CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  avatar_url  text,
  phone       text,
  locale      text NOT NULL DEFAULT 'en',
  role        text NOT NULL DEFAULT 'member'
                CHECK (role IN ('member', 'studio_owner', 'admin')),
  credits     integer NOT NULL DEFAULT 0 CHECK (credits >= 0),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS studios (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  description text,
  address     text,
  logo_url    text,
  cover_url   text,
  is_active   boolean NOT NULL DEFAULT true,
  owner_id    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ... classes, bookings, credit_transactions, plans, subscriptions, instructors
```

### 002_rls.sql Structure
```sql
-- Source: Supabase RLS docs (https://supabase.com/docs/guides/auth/row-level-security)

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- studios: public read
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "studios_public_read" ON studios;
CREATE POLICY "studios_public_read" ON studios
  FOR SELECT USING (is_active = true);
```

### 003_indexes.sql Structure
```sql
-- Source: DB-07 requirement (bookings.user_id, classes.scheduled_at)
CREATE INDEX IF NOT EXISTS idx_bookings_user_id     ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_class_id    ON bookings(class_id);
CREATE INDEX IF NOT EXISTS idx_classes_scheduled_at ON classes(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_classes_studio_id    ON classes(studio_id);
CREATE INDEX IF NOT EXISTS idx_credit_tx_user_id    ON credit_transactions(user_id);
```

### Regenerating types after migration
```bash
# Run after supabase db push or supabase db reset
npx supabase gen types typescript --project-id <your-project-ref> \
  --schema public > lib/supabase/types.ts
# Or if using local dev:
npx supabase gen types typescript --local > lib/supabase/types.ts
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2024 | `@supabase/ssr` is the official replacement; project already uses it correctly |
| `supabase.auth.getSession()` server-side | `supabase.auth.getUser()` server-side | 2024 | `getSession()` reads unverified cookie; `getUser()` validates with auth server — project already uses `getUser()` correctly in middleware |
| Custom `auth.user_id()` helper function | Built-in `auth.uid()` | Always | `auth.uid()` is always available; no need for the custom wrapper the old migrations define |
| NextAuth.js | Supabase Auth + `@supabase/ssr` | Phase 0 | Already migrated; do not re-introduce NextAuth |

**Deprecated/outdated in this codebase:**
- `types/next-auth.d.ts`: NextAuth type augmentation file; can be deleted once all NextAuth references are confirmed gone
- `20241208*` migration files: Exploratory/legacy; authoritative schema is now defined by Phase 1 migrations

---

## Open Questions

1. **Is the live Supabase DB fresh or has it run the 20241208* migrations?**
   - What we know: `.env.example` exists; actual `.env.local` with real credentials is not in the repo
   - What's unclear: Whether `gyms` table or other old-schema tables exist in the live DB
   - Recommendation: Phase 1 plans should include a "reset to clean state" step for dev, or use `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE IF NOT EXISTS` defensively. For production, start with a fresh Supabase project.

2. **Google OAuth credentials status**
   - What we know: AUTH-05 requires Google OAuth; `supabase.auth.signInWithOAuth` is the correct call
   - What's unclear: Whether the developer has a Google Cloud Console project with OAuth credentials configured
   - Recommendation: Plan 1.2 should include instructions for Supabase Dashboard Google provider setup as a prerequisite step, not assume credentials exist.

3. **Supabase CLI installed locally?**
   - What we know: `pnpm-lock.yaml` exists; `package.json` has no `supabase` CLI package
   - What's unclear: Whether `npx supabase` works or if CLI needs installing globally
   - Recommendation: Add `supabase` as a dev dependency (`pnpm add -D supabase`) or instruct use of `npx supabase@latest`.

---

## Validation Architecture

Nyquist validation is enabled (`workflow.nyquist_validation: true` in `.planning/config.json`).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.x + jsdom |
| Config file | `vitest.config.ts` (exists) |
| Quick run command | `pnpm test:unit` |
| Full suite command | `pnpm test:unit && pnpm test:e2e` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Sign up creates profile row | integration (manual via Supabase dashboard verify) | `pnpm test:unit` smoke | ❌ Wave 0 |
| AUTH-02 | Email verification flow completes | manual-only (requires real email) | N/A — verify in browser | N/A |
| AUTH-03 | Password reset email sent + reset-password page renders | unit (page render) | `pnpm test:unit` | ❌ Wave 0 |
| AUTH-04 | Session persists on refresh (middleware redirect check) | unit (middleware logic) | `pnpm test:unit` | ❌ Wave 0 |
| AUTH-05 | Google OAuth button renders and calls signInWithOAuth | unit (component render + mock) | `pnpm test:unit` | ❌ Wave 0 |
| AUTH-06 | Sign out clears session and redirects | unit (route handler response) | `pnpm test:unit` | ❌ Wave 0 |
| DB-01 | profiles RLS: user A cannot read user B's row | manual-only (requires two DB sessions) | Verify in Supabase SQL editor | N/A |
| DB-04 | bookings RLS: user A cannot read user B's bookings | manual-only (requires two DB sessions) | Verify in Supabase SQL editor | N/A |
| DB-07 | indexes on bookings.user_id, classes.scheduled_at exist | manual-only (`\d bookings` in psql) | Verify post-migration | N/A |

### Sampling Rate
- **Per task commit:** `pnpm test:unit`
- **Per wave merge:** `pnpm test:unit && pnpm build`
- **Phase gate:** All unit tests green + manual RLS verification complete before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/auth.spec.ts` — covers AUTH-01 profile creation trigger (mock Supabase), AUTH-04 middleware redirect logic, AUTH-05/06 component renders
- [ ] `tests/setup.ts` — already exists, no change needed
- [ ] Supabase CLI: `pnpm add -D supabase` — needed for `supabase gen types` and `supabase db push`

---

## Sources

### Primary (HIGH confidence)
- `lib/supabase/types.ts` — canonical schema definition for this project; all migrations must match this
- `middleware.ts` — confirms `@supabase/ssr` SSR pattern is correctly implemented
- `lib/supabase/server.ts`, `lib/supabase/client.ts` — confirm client factory pattern
- `app/auth/callback/route.ts` — confirms OAuth/email code exchange pattern
- `supabase/migrations/auto_profile_creation.sql` — reference implementation for `handle_new_user` trigger
- `supabase/migrations/20241208000005_row_level_security.sql` — reference for existing RLS patterns

### Secondary (MEDIUM confidence)
- Supabase SSR docs: https://supabase.com/docs/guides/auth/server-side/nextjs — confirmed patterns match existing code
- Supabase RLS docs: https://supabase.com/docs/guides/auth/row-level-security — `auth.uid()` as standard function

### Tertiary (LOW confidence)
- Google OAuth setup steps for Supabase — not independently verified; subject to Google Cloud Console UI changes

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages are installed, versions confirmed from `package.json`
- Architecture: HIGH — based on direct codebase reading + established Supabase SSR patterns
- Schema definition: HIGH — derived from `lib/supabase/types.ts` which is already used by production components
- Pitfalls: HIGH — derived from direct analysis of schema divergence and existing code
- Google OAuth steps: MEDIUM — correct API calls confirmed; console setup is environment-dependent

**Research date:** 2026-03-09
**Valid until:** 2026-06-09 (Supabase SSR API is stable; Google OAuth setup process may change)
