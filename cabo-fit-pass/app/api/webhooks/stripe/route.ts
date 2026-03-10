import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type Stripe from 'stripe'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminClient = SupabaseClient<Database> & { rpc: (fn: string, args: Record<string, unknown>) => any }

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
) as AdminClient

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const { userId, credits } = session.metadata ?? {}

  if (!userId || !credits) {
    console.error('checkout.session.completed: missing userId or credits in metadata, skipping')
    return
  }

  const { data: existing } = await supabaseAdmin
    .from('credit_transactions')
    .select('id')
    .eq('reference_id', session.id)
    .eq('type', 'purchase')
    .maybeSingle()

  if (existing) {
    return
  }

  const { error } = await supabaseAdmin.rpc('add_credits', {
    p_user_id: userId,
    p_amount: parseInt(credits, 10),
    p_reference_id: session.id,
    p_note: `Stripe purchase: ${session.id}`,
  })

  if (error) {
    console.error('checkout.session.completed: add_credits failed', error)
  }
}

function extractSubscriptionId(invoice: Stripe.Invoice): string | null {
  // Stripe API 2026-02-25.clover: subscription info moved to invoice.parent.subscription_details
  const sub = invoice.parent?.subscription_details?.subscription
  if (typeof sub === 'string') return sub
  if (sub && typeof sub === 'object' && 'id' in sub) return sub.id
  return null
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = extractSubscriptionId(invoice)

  if (!subscriptionId) {
    console.error('invoice.paid: no subscription ID, skipping')
    return
  }

  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, plan_id')
    .eq('stripe_subscription_id', subscriptionId)
    .maybeSingle()

  if (!subscription) {
    console.error('invoice.paid: subscription not found in DB, skipping')
    return
  }

  const { data: plan } = await supabaseAdmin
    .from('plans')
    .select('credits')
    .eq('id', subscription.plan_id)
    .single()

  if (!plan) {
    console.error('invoice.paid: plan not found, skipping')
    return
  }

  const { error } = await supabaseAdmin.rpc('add_credits', {
    p_user_id: subscription.user_id,
    p_amount: plan.credits,
    p_reference_id: invoice.id,
    p_note: `Subscription renewal: ${invoice.id}`,
  })

  if (error) {
    console.error('invoice.paid: add_credits failed', error)
  }
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
      break
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice)
      break
    default:
      break
  }

  return NextResponse.json({ received: true })
}
