

## Problem

The `booking_submissions` table doesn't exist in the database yet (types.ts shows no tables), causing the TypeScript error. The edge function also needs `verify_jwt = false` in config.toml to be callable without auth.

## Plan

### 1. Create `booking_submissions` database table
Create a migration with the table matching what Contact.tsx expects:
- `id` (uuid, primary key)
- `first_name`, `last_name`, `email`, `phone_number`, `preferred_therapy`, `service_location` (text, not null)
- `preferred_date`, `preferred_time`, `additional_info` (text, nullable)
- `created_at` (timestamptz, default now)
- RLS policy: allow anonymous inserts (public booking form), no select/update/delete for anon

### 2. Update `supabase/config.toml`
Add `verify_jwt = false` for the edge function so the public form can call it without authentication:
```toml
[functions.send-booking-notification]
verify_jwt = false
```

### 3. Deploy and test
- Deploy the edge function
- Test end-to-end by submitting a booking through the form
- Verify the database insert works and the notification fires

### Technical Notes
- The form is public (no auth), so the table needs an INSERT policy for `anon` role
- No SELECT/UPDATE/DELETE policies needed for anon — admin access can be added later
- The edge function already has CORS headers and rate limiting in place

