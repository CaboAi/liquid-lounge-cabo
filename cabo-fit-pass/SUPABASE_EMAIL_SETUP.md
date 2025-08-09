# Supabase Email Configuration Fix

## Why you're not getting confirmation emails:

1. **Development Mode**: By default, Supabase doesn't send emails in development
2. **SMTP Not Configured**: Need to set up email provider

## Quick Fix Options:

### Option 1: Disable Email Confirmation (Easiest for Testing)
1. Go to Supabase Dashboard → Authentication → Settings
2. Under "Email Auth" section:
   - Toggle OFF "Enable email confirmations"
   - Save changes
3. Now users can sign up and immediately sign in without email confirmation

### Option 2: Use Supabase's Email Logs (Development)
1. Go to Supabase Dashboard → Authentication → Logs
2. Click on "Email Logs" tab
3. You'll see all emails that would have been sent
4. Click on any email to see the magic link

### Option 3: Configure Custom SMTP (Production)
1. Go to Supabase Dashboard → Settings → Auth
2. Under "SMTP Settings":
   - Enable custom SMTP
   - Add your email provider settings (SendGrid, Mailgun, etc.)

## Recommended for Now:
**Use Option 1** - Disable email confirmation while testing. This lets you focus on getting the app working without email complexity.

## Testing the Simple Auth Flow:
1. Visit: https://cabofitpass.com/auth/simple-signin
2. Create an account (no email confirmation needed if you disable it)
3. You'll be redirected to /simple-dashboard
4. The dashboard will show connection status and available classes