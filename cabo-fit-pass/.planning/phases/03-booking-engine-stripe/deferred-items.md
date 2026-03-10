# Deferred Items — Phase 03: Booking Engine + Stripe

## Out-of-scope discoveries during 03-01 execution

### Pre-existing TypeScript errors in Stripe webhook files (from 31a93c0 commit)

Found during Task 2 typecheck. These errors are in files owned by Plan 03-03, not 03-01:

- `app/api/stripe/create-checkout-session/route.ts` — `stripe_price_id`/`name`/`credits` property missing from `never` type (Supabase query type narrowing issue)
- `app/api/webhooks/stripe/route.ts` — `add_credits` RPC argument not assignable to `never`; `subscription` missing from Invoice type
- `lib/stripe.ts` — Stripe API version `"2024-12-18.acacia"` not assignable to current Stripe types `"2026-02-25.clover"`

**Owner:** Plan 03-03 (Stripe webhook implementation)
**Action needed:** Fix Supabase DB type generation, update Stripe version, add `add_credits` RPC type to generated types.

### stripe-webhook.spec.ts import failure (resolved)

`tests/unit/stripe-webhook.spec.ts` imports `@/app/api/webhooks/stripe/route` which existed from the 31a93c0 commit but had type errors. Tests pass when Stripe mock is active.
