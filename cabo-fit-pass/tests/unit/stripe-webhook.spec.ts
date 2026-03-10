import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/stripe', () => ({
  stripe: { webhooks: { constructEvent: vi.fn() } },
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
}))

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when stripe-signature is invalid', async () => {
    const { stripe } = await import('@/lib/stripe')
    ;(stripe.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const { POST } = await import('@/app/api/webhooks/stripe/route')

    const request = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: 'raw-body',
      headers: { 'stripe-signature': 'bad-sig' },
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 200 and calls add_credits RPC on checkout.session.completed', async () => {
    const { stripe } = await import('@/lib/stripe')
    const { createClient } = await import('@supabase/supabase-js')

    const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
    ;(createClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: mockMaybeSingle,
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
      rpc: mockRpc,
    })

    const fakeSession = {
      id: 'cs_test_123',
      metadata: { userId: 'user-abc', planId: 'plan-1', credits: '10' },
    }

    ;(stripe.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: fakeSession },
    })

    const { POST } = await import('@/app/api/webhooks/stripe/route')

    const request = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: 'raw-body',
      headers: { 'stripe-signature': 'valid-sig' },
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(mockRpc).toHaveBeenCalledWith('add_credits', {
      p_user_id: 'user-abc',
      p_amount: 10,
      p_reference_id: 'cs_test_123',
      p_note: 'Stripe purchase: cs_test_123',
    })
  })

  it('returns 200 without calling add_credits when reference_id already exists (idempotency guard)', async () => {
    const { stripe } = await import('@/lib/stripe')
    const { createClient } = await import('@supabase/supabase-js')

    const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null })
    const existingTransaction = { id: 'txn_existing', reference_id: 'cs_test_duplicate' }
    ;(createClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: existingTransaction, error: null }),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
      rpc: mockRpc,
    })

    const fakeSession = {
      id: 'cs_test_duplicate',
      metadata: { userId: 'user-abc', planId: 'plan-1', credits: '10' },
    }

    ;(stripe.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: fakeSession },
    })

    const { POST } = await import('@/app/api/webhooks/stripe/route')

    const request = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: 'raw-body',
      headers: { 'stripe-signature': 'valid-sig' },
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('returns 200 and calls add_credits RPC on invoice.paid when subscription and plan are found', async () => {
    const { stripe } = await import('@/lib/stripe')
    const { createClient } = await import('@supabase/supabase-js')

    const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null })

    const subscriptionData = { user_id: 'user-xyz', plan_id: 'plan-2' }
    const planData = { credits: 20 }

    let fromCallCount = 0
    ;(createClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn(() => {
        fromCallCount++
        const callNum = fromCallCount
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue(
            callNum === 1 ? { data: subscriptionData, error: null } : { data: null, error: null }
          ),
          single: vi.fn().mockResolvedValue(
            callNum === 2 ? { data: planData, error: null } : { data: null, error: null }
          ),
        }
      }),
      rpc: mockRpc,
    })

    const fakeInvoice = {
      id: 'inv_test_456',
      subscription: 'sub_stripe_789',
    }

    ;(stripe.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockReturnValue({
      type: 'invoice.paid',
      data: { object: fakeInvoice },
    })

    const { POST } = await import('@/app/api/webhooks/stripe/route')

    const request = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: 'raw-body',
      headers: { 'stripe-signature': 'valid-sig' },
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(mockRpc).toHaveBeenCalledWith('add_credits', {
      p_user_id: 'user-xyz',
      p_amount: 20,
      p_reference_id: 'inv_test_456',
      p_note: 'Subscription renewal: inv_test_456',
    })
  })

  it('returns 200 with { received: true } on unhandled event type', async () => {
    const { stripe } = await import('@/lib/stripe')

    ;(stripe.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockReturnValue({
      type: 'customer.created',
      data: { object: {} },
    })

    const { POST } = await import('@/app/api/webhooks/stripe/route')

    const request = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: 'raw-body',
      headers: { 'stripe-signature': 'valid-sig' },
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ received: true })
  })
})
