import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null })
const mockMaybySingle = vi.fn().mockResolvedValue({ data: null, error: null })
const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null })
const mockEq = vi.fn()
const mockSelect = vi.fn()
const mockFrom = vi.fn()

// Build the chain: from().select().eq().maybeSingle() / single()
mockEq.mockReturnValue({ maybeSingle: mockMaybySingle, single: mockSingle, eq: mockEq })
mockSelect.mockReturnValue({ eq: mockEq, maybeSingle: mockMaybySingle, single: mockSingle })
mockFrom.mockReturnValue({ select: mockSelect })

vi.mock('@/lib/stripe', () => ({
  stripe: { webhooks: { constructEvent: vi.fn() } },
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
    rpc: mockRpc,
  })),
}))

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Re-setup chain after clearAllMocks
    mockEq.mockReturnValue({ maybeSingle: mockMaybySingle, single: mockSingle, eq: mockEq })
    mockSelect.mockReturnValue({ eq: mockEq, maybeSingle: mockMaybySingle, single: mockSingle })
    mockFrom.mockReturnValue({ select: mockSelect })
    mockRpc.mockResolvedValue({ data: null, error: null })
    mockMaybySingle.mockResolvedValue({ data: null, error: null })
    mockSingle.mockResolvedValue({ data: null, error: null })
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

    // No existing transaction (idempotency check returns null)
    mockMaybySingle.mockResolvedValue({ data: null, error: null })

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

    // Existing transaction found
    mockMaybySingle.mockResolvedValue({
      data: { id: 'txn_existing', reference_id: 'cs_test_duplicate' },
      error: null,
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

    // First maybeSingle: subscription found
    // Second single: plan found
    mockMaybySingle.mockResolvedValue({
      data: { user_id: 'user-xyz', plan_id: 'plan-2' },
      error: null,
    })
    mockSingle.mockResolvedValue({
      data: { credits: 20 },
      error: null,
    })

    // Stripe API 2026-02-25.clover: subscription info moved to invoice.parent.subscription_details
    const fakeInvoice = {
      id: 'inv_test_456',
      parent: {
        subscription_details: {
          subscription: 'sub_stripe_789',
        },
      },
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
