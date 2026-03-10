import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type PlanRow = Pick<Database['public']['Tables']['plans']['Row'], 'stripe_price_id' | 'credits' | 'name'>

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { planId } = (await request.json()) as { planId: string }

  const { data: plan } = (await supabase
    .from('plans')
    .select('stripe_price_id, credits, name')
    .eq('id', planId)
    .eq('is_active', true)
    .single()) as { data: PlanRow | null; error: unknown }

  if (!plan) {
    return NextResponse.json({ error: 'plan_not_found' }, { status: 404 })
  }

  const lineItems = plan.stripe_price_id
    ? [{ price: plan.stripe_price_id, quantity: 1 }]
    : [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: plan.name },
            unit_amount: 0,
          },
          quantity: 1,
        },
      ]

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
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
