# Phase 3: Booking Engine + Stripe - Research

**Researched:** 2026-03-10
**Domain:** Supabase Edge Functions (Deno 2) + PostgreSQL atomic RPC + Stripe Checkout + TanStack Query mutations
**Confidence:** HIGH (all major claims verified against official docs or authoritative secondary sources)

---

## Summary

Phase 3 introduces the two most complex subsystems in the project: an atomic booking engine and a Stripe payment flow. The core architectural decision is that **all multi-step database operations must live inside PostgreSQL PL/pgSQL functions** (called via Supabase RPC), not in application code. The supabase-js client does not support transactions — it is built on PostgREST, which has no transaction primitive. This means a book-class operation that needs to check capacity + check duplicate + debit credits + insert booking + log transaction in one atomic unit must be a single `CREATE OR REPLACE FUNCTION` in SQL, called via `supabase.rpc()`.

Stripe Checkout follows the standard Next.js 15 App Router pattern: a `POST /api/stripe/create-checkout-session` route handler creates the session and returns the redirect URL; a `POST /api/webhooks/stripe` route handler verifies the `Stripe-Signature` header using raw `request.text()` and updates Supabase using the `service_role` key. Stripe webhooks require a Route Handler (not a Server Action) because Stripe needs a static URL. The webhook handler must guard against duplicate deliveries by checking if a `reference_id` (stripe session ID) already exists in `credit_transactions`.

Supabase Edge Functions (Deno 2, configured in this project's `config.toml`) are **not required** for this phase. The booking RPC and cancellation RPC are PostgreSQL functions deployed via migration. The Stripe webhook handler is a Next.js Route Handler using `service_role`. Edge Functions become relevant if logic needs to run close to the user without going through PostgREST — but for this schema, PostgreSQL functions called via RPC are simpler, easier to test, and already the pattern established in Phase 1 (the trigger).

**Primary recommendation:** Put `book_class` and `cancel_booking` logic in PL/pgSQL functions (migration 006), call them via `supabase.rpc()` from Next.js API routes or client hooks. Stripe checkout and webhook in Next.js Route Handlers using `stripe` npm package + `service_role` Supabase client.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BOOK-01 | User can book a class (atomic: capacity check + credit debit in one transaction) | PL/pgSQL RPC with SELECT FOR UPDATE on class row; all writes in one function body |
| BOOK-02 | System prevents double-booking (same user, same class) | UNIQUE constraint or EXISTS check inside the RPC before INSERT |
| BOOK-03 | System prevents overbooking (max_capacity enforced) | COUNT of confirmed bookings vs max_capacity inside RPC with SELECT FOR UPDATE |
| BOOK-04 | User can cancel a booking ≥2 hours before class start | PL/pgSQL cancel_booking RPC checks `(scheduled_at - NOW()) >= cancellation_window_hours * interval '1 hour'` |
| BOOK-05 | Credits are refunded on eligible cancellation | cancel_booking RPC: UPDATE profiles SET credits = credits + refund_amount, INSERT credit_transactions type='refund' |
| BOOK-06 | User can view upcoming and past bookings | useBookings hook (already built in Phase 2); wire BookingCard to real data |
| CRED-01 | User can purchase a credit pack via Stripe Checkout | POST /api/stripe/create-checkout-session route handler; plans.stripe_price_id maps to Stripe Price |
| CRED-02 | Stripe webhook updates credits after successful payment | POST /api/webhooks/stripe with stripe-signature verification; service_role UPDATE + INSERT |
| CRED-03 | User can see current credit balance | useCredits hook (already built); wire to real profile.credits |
| CRED-04 | User can see full credit transaction history | New useTransactions hook querying credit_transactions ordered by created_at DESC |
| CRED-05 | Stripe webhook handles subscription renewal | checkout.session.completed with mode='subscription' + invoice.paid event handler |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| stripe | ^17.x (npm) | Stripe API client for session creation + webhook verification | Official Stripe SDK; handles cryptographic webhook verification |
| @supabase/supabase-js | ^2.54.0 (already installed) | service_role client in webhook handler; RPC calls from client hooks | Already in project; service_role bypasses RLS for server-side writes |
| @tanstack/react-query | ^5.84.2 (already installed) | useMutation for booking/cancel with optimistic updates | Already in project; established pattern from Phase 2 |
| zod | ^3.24.0 (already installed) | Validate webhook payload shape, validate RPC response errors | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @stripe/stripe-js | ^4.x (npm) | Client-side: load Stripe.js for potential embedded elements | Only if using Stripe Embedded Checkout (not needed for hosted checkout redirect) |

**For this phase, use hosted Stripe Checkout (redirect mode). No `@stripe/stripe-js` or `@stripe/react-stripe-js` needed on the client.** The flow is: client POSTs to `/api/stripe/create-checkout-session` → server returns `{url}` → client does `window.location.href = url`.

### Installation
```bash
pnpm add stripe
```

That is the only new dependency for this phase.

---

## Architecture Patterns

### Recommended Project Structure
```
supabase/
├── migrations/
│   ├── 006_rpc.sql          # book_class() + cancel_booking() PL/pgSQL functions
│   └── 007_rpc_grant.sql    # GRANT EXECUTE on functions to authenticated role
├── functions/               # (empty — Edge Functions NOT used this phase)
app/
├── api/
│   ├── stripe/
│   │   └── create-checkout-session/
│   │       └── route.ts     # POST handler: create Stripe Checkout Session
│   └── webhooks/
│       └── stripe/
│           └── route.ts     # POST handler: verify sig + update DB
lib/
├── stripe.ts                # Singleton stripe client (server-only)
hooks/
├── use-book-class.ts        # useMutation wrapping book-class RPC
├── use-cancel-booking.ts    # useMutation wrapping cancel-booking RPC
├── use-transactions.ts      # useQuery for credit_transactions history
```

---

### Pattern 1: Atomic PL/pgSQL booking RPC

**What:** A single PostgreSQL function `book_class(p_user_id uuid, p_class_id uuid)` that atomically performs all booking steps. Called as `supabase.rpc('book_class', { p_user_id, p_class_id })`.

**Why PL/pgSQL (not Edge Function):** The supabase-js client has no transaction support — it is PostgREST-based. Multi-step operations (check → debit → insert → log) require a database function. This matches Phase 1 precedent (handle_new_user trigger).

**SELECT FOR UPDATE pattern:** Lock the class row first to prevent concurrent overbooking:

```sql
-- Source: PostgreSQL documentation + supabase.com/docs/guides/database/functions
CREATE OR REPLACE FUNCTION public.book_class(
  p_user_id  uuid,
  p_class_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_class          public.classes%ROWTYPE;
  v_credits        integer;
  v_booking_count  integer;
  v_booking_id     uuid;
BEGIN
  -- 1. Lock the class row to prevent concurrent capacity changes
  SELECT * INTO v_class
  FROM public.classes
  WHERE id = p_class_id AND is_cancelled = false
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'class_not_found');
  END IF;

  -- 2. Check capacity
  SELECT COUNT(*) INTO v_booking_count
  FROM public.bookings
  WHERE class_id = p_class_id AND status = 'confirmed';

  IF v_booking_count >= v_class.max_capacity THEN
    RETURN jsonb_build_object('error', 'class_full');
  END IF;

  -- 3. Check duplicate booking
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE user_id = p_user_id AND class_id = p_class_id
      AND status = 'confirmed'
  ) THEN
    RETURN jsonb_build_object('error', 'already_booked');
  END IF;

  -- 4. Check and debit credits (lock profile row)
  SELECT credits INTO v_credits
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_credits < v_class.credit_cost THEN
    RETURN jsonb_build_object('error', 'insufficient_credits');
  END IF;

  UPDATE public.profiles
  SET credits = credits - v_class.credit_cost,
      updated_at = now()
  WHERE id = p_user_id;

  -- 5. Insert booking
  INSERT INTO public.bookings (user_id, class_id, status, credits_charged)
  VALUES (p_user_id, p_class_id, 'confirmed', v_class.credit_cost)
  RETURNING id INTO v_booking_id;

  -- 6. Append-only audit log (uses service_role privilege via SECURITY DEFINER)
  INSERT INTO public.credit_transactions (user_id, amount, type, reference_id, note)
  VALUES (p_user_id, -v_class.credit_cost, 'booking', v_booking_id::text,
          'Booked: ' || v_class.title);

  RETURN jsonb_build_object('booking_id', v_booking_id);
END;
$$;
```

**Critical:** `SECURITY DEFINER` with `SET search_path = ''` is required (per Supabase docs) to allow inserting into `credit_transactions` which has no authenticated INSERT RLS policy. The function runs as the DB owner (postgres role), bypassing RLS. Grant execute only to `authenticated`:

```sql
REVOKE ALL ON FUNCTION public.book_class(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.book_class(uuid, uuid) TO authenticated;
```

**Calling from client:**
```typescript
// Source: supabase.com/docs/reference/javascript/rpc
const { data, error } = await supabase.rpc('book_class', {
  p_user_id: userId,
  p_class_id: classId,
})
// data is JsonB: { booking_id: string } | { error: 'class_full' | 'already_booked' | 'insufficient_credits' }
```

---

### Pattern 2: PL/pgSQL cancellation RPC with refund window

**What:** `cancel_booking(p_user_id uuid, p_booking_id uuid)` checks the cancellation window, sets status to 'cancelled', conditionally refunds credits.

```sql
CREATE OR REPLACE FUNCTION public.cancel_booking(
  p_user_id    uuid,
  p_booking_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_booking  public.bookings%ROWTYPE;
  v_class    public.classes%ROWTYPE;
  v_refund   boolean;
BEGIN
  -- Lock booking row
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id AND user_id = p_user_id AND status = 'confirmed'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'booking_not_found');
  END IF;

  SELECT * INTO v_class FROM public.classes WHERE id = v_booking.class_id;

  -- Check refund window: cancellation_window_hours is stored on the class row
  v_refund := (v_class.scheduled_at - now()) >=
              (v_class.cancellation_window_hours * interval '1 hour');

  -- Update booking
  UPDATE public.bookings
  SET status = 'cancelled', cancelled_at = now()
  WHERE id = p_booking_id;

  -- Conditionally refund
  IF v_refund THEN
    UPDATE public.profiles
    SET credits = credits + v_booking.credits_charged,
        updated_at = now()
    WHERE id = p_user_id;

    INSERT INTO public.credit_transactions (user_id, amount, type, reference_id, note)
    VALUES (p_user_id, v_booking.credits_charged, 'refund', p_booking_id::text,
            'Refund: cancelled booking');
  END IF;

  RETURN jsonb_build_object('refunded', v_refund);
END;
$$;
```

**Key insight:** `cancellation_window_hours` is stored on the `classes` table (already in schema). The check `(scheduled_at - now()) >= interval` is a pure PostgreSQL interval comparison — no application logic required.

---

### Pattern 3: Stripe Checkout Session Route Handler

**What:** `POST /api/stripe/create-checkout-session/route.ts` — authenticates user, looks up plan, creates Stripe Checkout Session with `metadata.userId` and `metadata.planId`, returns `{url}`.

```typescript
// app/api/stripe/create-checkout-session/route.ts
// Source: docs.stripe.com/checkout/quickstart + dev.to/flnzba/33-stripe-integration

import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { planId } = await request.json()

  const { data: plan } = await supabase
    .from('plans')
    .select('stripe_price_id, credits, name')
    .eq('id', planId)
    .single()

  if (!plan?.stripe_price_id) {
    return NextResponse.json({ error: 'plan_not_found' }, { status: 404 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancelled`,
    metadata: {
      userId: user.id,
      planId,
      credits: String(plan.credits),
    },
  })

  return NextResponse.json({ url: session.url })
}
```

**Client-side (CreditPurchaseModal):**
```typescript
const response = await fetch('/api/stripe/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ planId }),
})
const { url } = await response.json()
window.location.href = url
```

---

### Pattern 4: Stripe Webhook Handler with Idempotency Guard

**What:** `POST /api/webhooks/stripe/route.ts` — must use `request.text()` (raw body) for signature verification. Uses `service_role` Supabase client. Guards against duplicate webhook delivery.

```typescript
// app/api/webhooks/stripe/route.ts
// Source: docs.stripe.com/webhooks + pedroalonso.net/blog/stripe-nextjs-complete-guide-2025

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

// Service role client — only created server-side, never exposed to browser
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  // CRITICAL: must be raw text, not json — signature verification breaks on parsed body
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutCompleted(session)
      break
    }
    case 'invoice.paid': {
      // CRED-05: subscription renewal
      const invoice = event.data.object as Stripe.Invoice
      await handleInvoicePaid(invoice)
      break
    }
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { userId, credits, planId } = session.metadata ?? {}
  if (!userId || !credits) return

  // Idempotency guard: check if this session was already processed
  const { data: existing } = await supabaseAdmin
    .from('credit_transactions')
    .select('id')
    .eq('reference_id', session.id)
    .eq('type', 'purchase')
    .maybeSingle()

  if (existing) return // Already processed — webhook retry, skip

  const creditCount = parseInt(credits, 10)

  // Atomic: update credits + insert transaction (two separate ops, both use service_role)
  // Note: true atomicity here would require a PL/pgSQL RPC — acceptable for webhooks
  // because the idempotency guard above prevents double-crediting
  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ credits: supabaseAdmin.rpc('increment_credits', { amount: creditCount }) })
    .eq('id', userId)

  // Prefer a RPC for atomic credit increment to avoid read-modify-write race:
  await supabaseAdmin.rpc('add_credits', {
    p_user_id: userId,
    p_amount: creditCount,
    p_reference_id: session.id,
    p_note: `Stripe purchase: ${session.id}`,
  })
}
```

**Preferred approach:** Add a third PL/pgSQL function `add_credits(p_user_id, p_amount, p_reference_id, p_note)` that atomically does `UPDATE profiles SET credits = credits + p_amount` + `INSERT credit_transactions`. Called from the webhook via `supabaseAdmin.rpc()`. This avoids the read-modify-write race in the webhook handler.

---

### Pattern 5: TanStack Query useMutation with Optimistic Updates

**What:** Booking mutation with optimistic update that immediately shows the class as "booked" in the UI, rolls back on error.

```typescript
// hooks/use-book-class.ts
// Source: tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { bookingsQueryOptions } from './use-bookings'

type BookClassVars = { userId: string; classId: string }
type BookClassError = { message: string; code: string }

export function useBookClass() {
  const queryClient = useQueryClient()

  return useMutation<{ booking_id: string }, BookClassError, BookClassVars>({
    mutationFn: async ({ userId, classId }) => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('book_class', {
        p_user_id: userId,
        p_class_id: classId,
      })
      if (error) throw error
      // The RPC returns { error: string } on business logic failure
      if (data?.error) throw { message: data.error, code: data.error }
      return data
    },
    onMutate: async ({ userId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(bookingsQueryOptions(userId))
      // Snapshot previous value
      const previousBookings = queryClient.getQueryData(
        bookingsQueryOptions(userId).queryKey
      )
      // Optimistically add a pending booking (UI shows immediately)
      // Return snapshot for rollback
      return { previousBookings }
    },
    onError: (_err, { userId }, context) => {
      // Roll back to snapshot
      if (context?.previousBookings) {
        queryClient.setQueryData(
          bookingsQueryOptions(userId).queryKey,
          context.previousBookings
        )
      }
    },
    onSettled: (_data, _err, { userId }) => {
      // Always refetch to get authoritative server state
      queryClient.invalidateQueries(bookingsQueryOptions(userId))
      // Also invalidate credits — they changed
      queryClient.invalidateQueries({ queryKey: ['credits', userId] })
    },
  })
}
```

---

### Pattern 6: Stripe singleton client (lib/stripe.ts)

```typescript
// lib/stripe.ts — server-only, never import in client components
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})
```

---

### Anti-Patterns to Avoid

- **Sequencing multiple supabase-js calls for atomicity:** The client has no transaction support. If step 2 fails after step 1 succeeds, data is corrupted. Always use PL/pgSQL functions for multi-step writes.
- **Using `request.json()` in the webhook handler:** Stripe signature verification requires the raw bytes. Using `request.json()` will cause all webhook verifications to fail with signature mismatch.
- **Creating the service_role client in a Client Component:** `SUPABASE_SERVICE_ROLE_KEY` must never reach the browser. Only instantiate it in Route Handlers, Server Components, or Server Actions.
- **Skipping the idempotency guard in the webhook:** Stripe retries webhooks on failure. Without the guard, a single purchase can credit a user multiple times.
- **Exposing the Stripe Secret Key:** `STRIPE_SECRET_KEY` is server-only. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is the only Stripe key safe for the browser (not needed for hosted checkout redirect).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Webhook signature verification | Custom HMAC comparison | `stripe.webhooks.constructEvent()` | Stripe's implementation handles timing-safe comparison, error cases |
| Concurrent booking capacity check | Application-level locking | `SELECT FOR UPDATE` in PL/pgSQL | Database-level lock is the only safe approach across concurrent requests |
| Credit arithmetic | Application read-modify-write | `UPDATE SET credits = credits + N` (atomic SQL) | Read-modify-write in app code has TOCTOU race condition |
| Stripe pricing display | Manual price calculation | Fetch from `plans` table with `stripe_price_id` | Plans table is the single source of truth, already seeded |
| Idempotency key generation | UUID generation in app | Stripe session ID as `reference_id` in `credit_transactions` | Session ID is stable and globally unique |

**Key insight:** PostgreSQL's transaction isolation (READ COMMITTED by default, upgraded to SERIALIZABLE via FOR UPDATE) is the correct tool for booking race conditions. Never trust application-level checks for capacity or duplicate detection.

---

## Common Pitfalls

### Pitfall 1: Webhook Raw Body Parsing
**What goes wrong:** Using `await request.json()` in the webhook handler causes `Error: No signatures found matching the expected signature`. All webhook deliveries fail.
**Why it happens:** Stripe's HMAC signature is computed over the raw bytes. JSON parsing normalizes whitespace, changing the byte signature.
**How to avoid:** Always `const body = await request.text()` before any other parsing.
**Warning signs:** Webhook handler returns 400 with "invalid_signature" on every event.

### Pitfall 2: Next.js Route Handler Body Buffering
**What goes wrong:** Next.js 15 App Router may apply body parsing middleware that consumes the request body before the webhook handler reads it.
**How to avoid:** Export `export const config = { api: { bodyParser: false } }` — this is a Pages Router pattern. In App Router, `request.text()` works directly without configuration. Confirm by testing with Stripe CLI.

### Pitfall 3: SECURITY DEFINER Without search_path
**What goes wrong:** A `SECURITY DEFINER` function without `SET search_path = ''` is vulnerable to search_path injection. Supabase docs flag this as a required security measure.
**How to avoid:** Always add `SET search_path = ''` and use fully qualified table names (`public.bookings`, not `bookings`).

### Pitfall 4: credit_transactions RLS Blocks SECURITY DEFINER
**What goes wrong:** Developers assume `SECURITY DEFINER` bypasses RLS. It does not — `SECURITY DEFINER` runs as the function definer's role (postgres), which has a `BYPASSRLS` privilege. However, if the function is created by a non-superuser, `BYPASSRLS` is not implied.
**How to avoid:** Create booking RPCs in the `postgres` role (default in Supabase migrations) or explicitly use `ALTER FUNCTION ... SECURITY DEFINER` after verifying the owner. Test by calling the function as an authenticated user and verifying `credit_transactions` rows are inserted.

### Pitfall 5: Double-Crediting on Webhook Retry
**What goes wrong:** Stripe retries webhook delivery up to 72 hours if the endpoint returns non-2xx. Without idempotency guard, each retry credits the user.
**How to avoid:** Check `credit_transactions WHERE reference_id = session.id AND type = 'purchase'` before processing. Return `200` immediately if already processed.

### Pitfall 6: plans.stripe_price_id Not Seeded
**What goes wrong:** `plans` table has `stripe_price_id = NULL` for seed rows (004_seed.sql). Checkout session creation fails with "price not found".
**How to avoid:** During development, create real Stripe test-mode prices and update seed data. Or use `mode: 'payment'` with `price_data` (inline price) for local testing without Stripe dashboard setup. In production, `stripe_price_id` must be populated before going live.

### Pitfall 7: Supabase DB Push Still Blocked
**What goes wrong:** The Supabase project DNS issue from Phase 1 is still an open blocker. The new migration (006_rpc.sql) can be written and reviewed but cannot be pushed until the user provisions a new Supabase project.
**How to avoid:** Write migration files as planned. The plan tasks must note: "apply locally with `supabase db reset` or push after new project is provisioned." Local testing uses `supabase start` + `supabase db reset`.

---

## Code Examples

### Environment Variables Required

```bash
# .env.local additions for Phase 3
STRIPE_SECRET_KEY=sk_test_...         # Server-only
STRIPE_WEBHOOK_SECRET=whsec_...       # From: stripe listen --print-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Not needed for redirect flow
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Local Stripe Webhook Testing
```bash
# Terminal 1: Start Next.js
pnpm dev

# Terminal 2: Start Supabase local
supabase start

# Terminal 3: Forward webhooks to local Next.js
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# The CLI prints: > Ready! Your webhook signing secret is whsec_... (copy to .env.local)

# Terminal 4: Trigger a test event
stripe trigger checkout.session.completed
```

### Local Edge Function Testing (if needed)
```bash
# Serve all functions locally
supabase functions serve

# Test with bearer token (get token from supabase status)
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/function-name' \
  --header 'Authorization: Bearer <anon-key>' \
  --header 'Content-Type: application/json' \
  --data '{"key":"value"}'

# Skip JWT verification (for webhook-style functions)
supabase functions serve --no-verify-jwt
```

### add_credits PL/pgSQL function (atomic webhook credit update)
```sql
-- supabase/migrations/006_rpc.sql
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id     uuid,
  p_amount      integer,
  p_reference_id text,
  p_note        text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET credits = credits + p_amount,
      updated_at = now()
  WHERE id = p_user_id;

  INSERT INTO public.credit_transactions (user_id, amount, type, reference_id, note)
  VALUES (p_user_id, p_amount, 'purchase', p_reference_id, p_note);
END;
$$;

REVOKE ALL ON FUNCTION public.add_credits(uuid, integer, text, text) FROM PUBLIC;
-- Webhook uses service_role, not authenticated — no GRANT TO authenticated needed
-- service_role bypasses RLS and has EXECUTE on all functions by default
```

### Error Code Mapping (UI layer)
```typescript
// lib/booking-errors.ts
type BookingErrorCode =
  | 'class_not_found'
  | 'class_full'
  | 'already_booked'
  | 'insufficient_credits'
  | 'booking_not_found'
  | 'cancellation_window_passed'

const ERROR_MESSAGES: Record<BookingErrorCode, string> = {
  class_not_found: 'This class is no longer available.',
  class_full: 'Sorry, this class is full.',
  already_booked: 'You have already booked this class.',
  insufficient_credits: 'You don\'t have enough credits. Purchase more to continue.',
  booking_not_found: 'Booking not found.',
  cancellation_window_passed: 'Cancellation window has passed. No refund will be issued.',
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router API routes with `req/res` | App Router Route Handlers with `Request/Response` Web API | Next.js 13+ | `await request.text()` replaces `req.body` buffer workarounds |
| Stripe `apiVersion: '2022-11-15'` | `apiVersion: '2024-12-18.acacia'` | 2024 | Breaking changes in Session object shape; always pin version |
| supabase Edge Functions for business logic | PL/pgSQL functions via RPC | Established pattern | Simpler, no Deno runtime complexity, transactions built in |
| Server Actions for webhook endpoints | Route Handlers only for webhooks | Next.js 13+ | Stripe requires a static URL; Server Actions use POST but are not stable URLs for external services |

**Deprecated/outdated:**
- `stripe.redirectToCheckout()` (Stripe.js v3): Replaced by creating a session and redirecting to `session.url` directly. Old method requires `@stripe/stripe-js` on the client.
- Pages Router `/pages/api/webhooks/stripe.ts` with `export const config = { api: { bodyParser: false } }`: App Router does not need this config.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.x |
| Config file | `vitest.config.ts` (exists) |
| Quick run command | `pnpm test:unit` |
| Full suite command | `pnpm test:unit && pnpm test:e2e` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BOOK-01 | Atomic capacity check + credit debit | unit | `pnpm test:unit -- --reporter=verbose hooks/use-book-class.spec.ts` | Wave 0 |
| BOOK-02 | Double-booking prevention | unit | Pure function test: `isAlreadyBooked(bookings, classId)` | Wave 0 |
| BOOK-03 | Overbooking prevention | unit | Pure function test: `isClassFull(bookings, maxCapacity)` | Wave 0 |
| BOOK-04 | Cancellation window check | unit | Pure function: `isCancellationAllowed(scheduledAt, windowHours, now)` | Wave 0 |
| BOOK-05 | Credits refunded on cancel | unit | Test cancel_booking error codes + credit math | Wave 0 |
| BOOK-06 | View bookings | unit (hook) | `pnpm test:unit -- hooks/use-bookings.spec.ts` | Partial (exists, extend) |
| CRED-01 | Stripe checkout session | manual | `stripe trigger checkout.session.completed` via CLI | N/A (Stripe external) |
| CRED-02 | Webhook updates credits | unit | Mock stripe.webhooks.constructEvent, test handler logic | Wave 0 |
| CRED-03 | See credit balance | unit (hook) | `pnpm test:unit -- hooks/use-credits.spec.ts` | Exists |
| CRED-04 | Transaction history | unit (hook) | `pnpm test:unit -- hooks/use-transactions.spec.ts` | Wave 0 |
| CRED-05 | Subscription renewal webhook | unit | Test invoice.paid handler branch | Wave 0 |

### Pure Functions to Unit Test (HIGH PRIORITY)

These are the testable extractions from the PL/pgSQL logic — pure TypeScript functions that mirror the database logic for unit testing without a live DB:

```typescript
// lib/booking-logic.ts — pure, no DB dependency

// BOOK-04: mirrors PL/pgSQL: (scheduled_at - now()) >= window_hours * interval '1 hour'
export function isCancellationAllowed(
  scheduledAt: Date,
  cancellationWindowHours: number,
  now: Date = new Date()
): boolean {
  const windowMs = cancellationWindowHours * 60 * 60 * 1000
  return scheduledAt.getTime() - now.getTime() >= windowMs
}

// BOOK-01/BOOK-03: capacity check
export function isClassFull(confirmedCount: number, maxCapacity: number): boolean {
  return confirmedCount >= maxCapacity
}

// BOOK-02: duplicate detection
export function isAlreadyBooked(
  bookings: Array<{ class_id: string; status: string }>,
  classId: string
): boolean {
  return bookings.some(b => b.class_id === classId && b.status === 'confirmed')
}

// CRED-02: credit arithmetic after purchase
export function computeNewCredits(current: number, purchasedAmount: number): number {
  return current + purchasedAmount
}
```

### Mocking Stripe in Unit Tests

```typescript
// tests/unit/stripe-webhook.spec.ts (Wave 0 gap)
import { vi, describe, it, expect } from 'vitest'

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}))

// Test the handler logic with a pre-validated event object
// Do NOT test constructEvent itself — that's Stripe's code
```

### Sampling Rate
- **Per task commit:** `pnpm test:unit`
- **Per wave merge:** `pnpm test:unit && pnpm typecheck`
- **Phase gate:** Full suite green (`pnpm test:unit && pnpm test:e2e`) before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `lib/booking-logic.ts` — pure functions for cancellation window, capacity, duplicate checks
- [ ] `lib/booking-logic.spec.ts` — unit tests for all pure functions
- [ ] `hooks/use-book-class.ts` — useMutation hook
- [ ] `hooks/use-book-class.spec.ts` — mutation unit tests with mocked supabase.rpc
- [ ] `hooks/use-cancel-booking.ts` — useMutation hook
- [ ] `hooks/use-cancel-booking.spec.ts` — mutation unit tests
- [ ] `hooks/use-transactions.ts` — useQuery for credit_transactions
- [ ] `hooks/use-transactions.spec.ts` — query unit tests
- [ ] `tests/unit/stripe-webhook.spec.ts` — webhook handler logic tests
- [ ] `supabase/migrations/006_rpc.sql` — book_class + cancel_booking + add_credits functions
- [ ] `lib/stripe.ts` — singleton Stripe client
- [ ] `app/api/stripe/create-checkout-session/route.ts` — checkout session handler
- [ ] `app/api/webhooks/stripe/route.ts` — webhook handler

---

## Open Questions

1. **Supabase project DNS blocker**
   - What we know: Project `pamzfhiiuvmtlwwvufut` is unreachable. Migration files are written but cannot be pushed.
   - What's unclear: Whether the user has provisioned a new project yet.
   - Recommendation: Plan tasks must include "run `supabase db reset` locally to test RPCs" as an alternative to `supabase db push`. All RPC logic can be tested locally with `supabase start`.

2. **plans.stripe_price_id is NULL in seed data**
   - What we know: `004_seed.sql` inserts 3 plans with `stripe_price_id` not set.
   - What's unclear: Whether real Stripe test prices have been created in the Stripe dashboard.
   - Recommendation: Plan task 3.3 must create Stripe test prices and update seed data OR use `price_data` inline for local testing. Document both paths.

3. **Subscription vs one-time payment scope**
   - What we know: CRED-05 requires webhook handling for subscription renewal (invoice.paid). The plans table has a subscriptions table linked to it.
   - What's unclear: Whether the current phase should implement full subscription lifecycle or just one-time purchases.
   - Recommendation: Implement `checkout.session.completed` (one-time) fully for Phase 3. Implement `invoice.paid` handler stub that logs the event and is fleshed out in Phase 5. This covers CRED-05 at a basic level.

4. **Edge Functions vs Route Handlers for book-class**
   - What we know: The plan says "Create Supabase Edge Function `book-class`". Research shows the PL/pgSQL RPC approach is simpler and more testable.
   - Recommendation: Use a Next.js API Route Handler that calls `supabase.rpc('book_class', ...)`, NOT a Supabase Edge Function. This avoids Deno runtime complexity, keeps all server logic in Next.js (same language, same tests), and matches the architectural precedent from Phase 1. The planner should note this deviation from the original plan description.

---

## Sources

### Primary (HIGH confidence)
- [Supabase Database Functions Docs](https://supabase.com/docs/guides/database/functions) — SECURITY DEFINER pattern, RPC calling, search_path requirement
- [Supabase Stripe Webhook Example](https://supabase.com/docs/guides/functions/examples/stripe-webhooks) — stripe.webhooks.constructEventAsync, Deno.env.get pattern
- [TanStack Query v5 Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates) — onMutate/onError/onSettled pattern
- [Stripe Webhooks Documentation](https://docs.stripe.com/webhooks) — signature verification, retry behavior, idempotency
- [Stripe CLI Documentation](https://docs.stripe.com/stripe-cli) — stripe listen, stripe trigger

### Secondary (MEDIUM confidence)
- [Pedro Alonso: Stripe + Next.js 15 Complete Guide](https://www.pedroalonso.net/blog/stripe-nextjs-complete-guide-2025/) — verified: request.text() requirement, metadata.userId pattern, constructEvent pattern
- [DEV: Stripe Integration Guide Next.js 15 with Supabase](https://dev.to/flnzba/33-stripe-integration-guide-for-nextjs-15-with-supabase-13b5) — service_role client pattern for webhook, metadata userId extraction
- [Marmelab: Supabase Edge Function Transactions and RLS](https://marmelab.com/blog/2025/12/08/supabase-edge-function-transaction-rls.html) — confirmed supabase-js has no transaction support, PL/pgSQL RPC is the recommended pattern
- [PostgreSQL Explicit Locking Docs](https://www.postgresql.org/docs/current/explicit-locking.html) — SELECT FOR UPDATE semantics
- [Supabase Securing Edge Functions](https://supabase.com/docs/guides/functions/auth) — JWT verification in Edge Functions

### Tertiary (LOW confidence — flagged for validation)
- [Stormatics: SELECT FOR UPDATE in PostgreSQL](https://stormatics.tech/blogs/select-for-update-in-postgresql) — booking seat example, directional only
- DEV community articles on idempotency patterns — confirm against Stripe official docs before relying on

---

## Metadata

**Confidence breakdown:**
- Standard stack (stripe npm package + RPC pattern): HIGH — verified against official Stripe and Supabase docs
- Architecture (PL/pgSQL vs Edge Function): HIGH — confirmed by marmelab.com research and official Supabase docs on supabase-js transaction limitations
- Stripe integration (request.text(), metadata, constructEvent): HIGH — verified against Stripe official docs + Pedro Alonso guide (2025)
- Optimistic updates (TanStack Query v5): HIGH — verified against official TanStack docs
- Pitfalls (double-crediting, raw body, SECURITY DEFINER): HIGH — each traced to official source
- Subscription/invoice.paid handling: MEDIUM — pattern clear, scope decision (Phase 3 vs 5) is a project decision

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (Stripe API versions change; re-verify `apiVersion` if implementing after this date)
