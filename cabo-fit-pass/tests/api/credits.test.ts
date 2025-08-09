/**
 * @jest-environment node
 */

import { createMocks } from 'node-mocks-http'
import type { NextApiRequest, NextApiResponse } from 'next'

// Mock Stripe
const mockStripe = {
  paymentIntents: {
    create: jest.fn(),
    retrieve: jest.fn(),
    confirm: jest.fn(),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
}

jest.mock('stripe', () => {
  return jest.fn(() => mockStripe)
})

// Mock Supabase operations
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
  rpc: jest.fn(),
}

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabase,
}))

// Credit packages configuration
const CREDIT_PACKAGES = [
  { credits: 1, price: 12, stripe_price_id: 'price_1credit' },
  { credits: 5, price: 55, stripe_price_id: 'price_5credits' },
  { credits: 10, price: 100, stripe_price_id: 'price_10credits' },
  { credits: 20, price: 180, stripe_price_id: 'price_20credits' },
]

// Mock API handlers
const getCreditBalanceHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { user_id } = req.query

    if (!user_id) {
      return res.status(400).json({ 
        error: 'Missing user_id',
        details: 'User ID is required'
      })
    }

    const { data: credits, error } = await mockSupabase
      .from('user_credits')
      .select('balance, total_purchased, total_used, expires_at, updated_at')
      .eq('user_id', user_id)
      .single()

    if (error) {
      // If no credits record exists, create one
      if (error.code === 'PGRST116') {
        const { data: newCredits, error: createError } = await mockSupabase
          .from('user_credits')
          .insert({
            user_id,
            balance: 0,
            total_purchased: 0,
            total_used: 0,
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single()

        if (createError) {
          throw createError
        }

        return res.status(200).json({
          data: newCredits,
          message: 'Credit account created'
        })
      }
      throw error
    }

    // Check if credits are expired
    const now = new Date()
    const expiresAt = new Date(credits.expires_at)
    const isExpired = expiresAt <= now

    return res.status(200).json({
      data: {
        ...credits,
        user_id,
        is_expired: isExpired,
        days_until_expiry: Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      },
    })
  } catch (error) {
    console.error('Get credit balance error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: 'Failed to retrieve credit balance'
    })
  }
}

const purchaseCreditsHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { user_id, package_id, payment_method_id, currency = 'usd' } = req.body

    if (!user_id || !package_id || !payment_method_id) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'user_id, package_id, and payment_method_id are required'
      })
    }

    // Find the credit package
    const creditPackage = CREDIT_PACKAGES.find(pkg => pkg.credits === package_id)
    if (!creditPackage) {
      return res.status(400).json({
        error: 'Invalid package',
        details: 'The specified credit package does not exist',
        available_packages: CREDIT_PACKAGES.map(pkg => ({
          credits: pkg.credits,
          price: pkg.price
        }))
      })
    }

    // Create Stripe payment intent
    const { data: paymentIntent, error: stripeError } = await mockStripe.paymentIntents.create({
      amount: creditPackage.price * 100, // Convert to cents
      currency,
      payment_method: payment_method_id,
      confirm: true,
      metadata: {
        user_id,
        credits: creditPackage.credits,
        package_type: 'credit_purchase',
      },
    })

    if (stripeError || !paymentIntent) {
      return res.status(402).json({
        error: 'Payment failed',
        details: stripeError?.message || 'Unable to process payment',
        code: stripeError?.code,
      })
    }

    // Handle payment intent status
    if (paymentIntent.status === 'requires_action') {
      return res.status(200).json({
        requires_action: true,
        payment_intent: {
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
        },
      })
    }

    if (paymentIntent.status !== 'succeeded') {
      return res.status(402).json({
        error: 'Payment incomplete',
        details: `Payment status: ${paymentIntent.status}`,
        payment_intent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
        },
      })
    }

    // Create credit transaction record
    const { data: transaction, error: transactionError } = await mockSupabase
      .from('credit_transactions')
      .insert({
        user_id,
        type: 'purchase',
        credits: creditPackage.credits,
        amount: creditPackage.price,
        stripe_payment_intent_id: paymentIntent.id,
        status: 'completed',
        description: `Credit package purchase: ${creditPackage.credits} credits`,
        metadata: {
          package_id: creditPackage.credits,
          payment_method: 'stripe',
        },
      })
      .select()
      .single()

    if (transactionError) {
      throw transactionError
    }

    // Update user credit balance
    const { error: updateError } = await mockSupabase.rpc('add_credits', {
      p_user_id: user_id,
      p_credits: creditPackage.credits,
      p_transaction_id: transaction.id,
    })

    if (updateError) {
      throw updateError
    }

    return res.status(200).json({
      transaction,
      payment_intent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
      },
      credits_added: creditPackage.credits,
      message: `Successfully purchased ${creditPackage.credits} credits`,
    })
  } catch (error) {
    console.error('Purchase credits error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: 'Failed to process credit purchase'
    })
  }
}

const getCreditHistoryHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { 
      user_id, 
      type = 'all', 
      limit = 20, 
      offset = 0,
      start_date,
      end_date 
    } = req.query

    if (!user_id) {
      return res.status(400).json({ 
        error: 'Missing user_id',
        details: 'User ID is required'
      })
    }

    let query = mockSupabase
      .from('credit_transactions')
      .select('id, type, credits, amount, description, status, created_at, metadata')
      .eq('user_id', user_id)

    // Filter by transaction type
    if (type && type !== 'all') {
      query = query.eq('type', type)
    }

    // Filter by date range
    if (start_date) {
      query = query.gte('created_at', start_date)
    }
    if (end_date) {
      query = query.lte('created_at', end_date)
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .limit(parseInt(limit as string))
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1)

    const { data: transactions, error, count } = await query

    if (error) {
      throw error
    }

    // Calculate summary statistics
    const allTransactions = transactions || []
    const purchases = allTransactions.filter(t => t.type === 'purchase')
    const usage = allTransactions.filter(t => t.type === 'usage')

    const summary = {
      total_transactions: count || 0,
      total_purchased: purchases.reduce((sum, t) => sum + t.credits, 0),
      total_spent: purchases.reduce((sum, t) => sum + (t.amount || 0), 0),
      total_used: Math.abs(usage.reduce((sum, t) => sum + t.credits, 0)),
    }

    return res.status(200).json({
      data: allTransactions,
      summary,
      pagination: {
        total: count || 0,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        has_more: (count || 0) > parseInt(offset as string) + parseInt(limit as string),
      },
    })
  } catch (error) {
    console.error('Get credit history error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: 'Failed to retrieve credit history'
    })
  }
}

const getCreditPackagesHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const packages = CREDIT_PACKAGES.map(pkg => ({
      id: pkg.credits,
      credits: pkg.credits,
      price: pkg.price,
      price_per_credit: +(pkg.price / pkg.credits).toFixed(2),
      savings: pkg.credits > 1 ? `${Math.round((1 - (pkg.price / pkg.credits) / 12) * 100)}%` : null,
      popular: pkg.credits === 10, // Mark 10-credit package as popular
    }))

    return res.status(200).json({
      data: packages,
      currency: 'USD',
      note: 'Credits expire 1 year from purchase date',
    })
  } catch (error) {
    console.error('Get credit packages error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: 'Failed to retrieve credit packages'
    })
  }
}

const stripeWebhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const sig = req.headers['stripe-signature']
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!sig || !endpointSecret) {
      return res.status(400).json({
        error: 'Missing webhook signature or secret'
      })
    }

    // Construct webhook event
    const event = mockStripe.webhooks.constructEvent(req.body, sig, endpointSecret)

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        
        // Find and update the transaction
        const { data: transaction, error: findError } = await mockSupabase
          .from('credit_transactions')
          .select('id, user_id, credits, status')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single()

        if (findError || !transaction) {
          console.error('Transaction not found for payment intent:', paymentIntent.id)
          return res.status(404).json({ error: 'Transaction not found' })
        }

        // Update transaction status if not already completed
        if (transaction.status !== 'completed') {
          const { error: updateError } = await mockSupabase
            .from('credit_transactions')
            .update({ status: 'completed' })
            .eq('id', transaction.id)

          if (updateError) {
            throw updateError
          }

          // Add credits to user balance
          const { error: creditsError } = await mockSupabase.rpc('add_credits', {
            p_user_id: transaction.user_id,
            p_credits: transaction.credits,
            p_transaction_id: transaction.id,
          })

          if (creditsError) {
            throw creditsError
          }
        }
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object
        
        // Update transaction status to failed
        await mockSupabase
          .from('credit_transactions')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', failedPayment.id)
        break

      default:
        console.log(`Unhandled webhook event type: ${event.type}`)
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return res.status(500).json({ 
      error: 'Webhook processing failed',
      details: error.message
    })
  }
}

describe('/api/credits/balance', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('retrieves credit balance successfully', async () => {
    mockSupabase.from().single.mockResolvedValue({
      data: {
        balance: 10,
        total_purchased: 20,
        total_used: 10,
        expires_at: '2024-12-31T23:59:59Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      error: null,
    })

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { user_id: 'user-1' },
    })

    await getCreditBalanceHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.data.balance).toBe(10)
    expect(data.data.total_purchased).toBe(20)
    expect(data.data.total_used).toBe(10)
    expect(data.data.is_expired).toBe(false)
    expect(data.data.days_until_expiry).toBeGreaterThan(0)
  })

  it('creates new credit account if none exists', async () => {
    mockSupabase.from().single
      .mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }, // Not found error
      })
      .mockResolvedValueOnce({
        data: {
          balance: 0,
          total_purchased: 0,
          total_used: 0,
          expires_at: '2025-01-01T00:00:00Z',
        },
        error: null,
      })

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { user_id: 'new-user' },
    })

    await getCreditBalanceHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.data.balance).toBe(0)
    expect(data.message).toBe('Credit account created')
  })

  it('validates user_id parameter', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: {}, // Missing user_id
    })

    await getCreditBalanceHandler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Missing user_id')
  })

  it('detects expired credits', async () => {
    mockSupabase.from().single.mockResolvedValue({
      data: {
        balance: 5,
        expires_at: '2023-01-01T00:00:00Z', // Expired date
      },
      error: null,
    })

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { user_id: 'user-1' },
    })

    await getCreditBalanceHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.data.is_expired).toBe(true)
    expect(data.data.days_until_expiry).toBeLessThan(0)
  })

  it('rejects non-GET requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    })

    await getCreditBalanceHandler(req, res)

    expect(res._getStatusCode()).toBe(405)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Method not allowed')
  })
})

describe('/api/credits/purchase', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('purchases credits successfully', async () => {
    mockStripe.paymentIntents.create.mockResolvedValue({
      data: {
        id: 'pi_test_123',
        status: 'succeeded',
        client_secret: 'pi_test_123_secret_xyz',
      },
      error: null,
    })

    mockSupabase.from().single.mockResolvedValue({
      data: {
        id: 'txn-123',
        type: 'purchase',
        credits: 5,
        amount: 55,
        status: 'completed',
      },
      error: null,
    })

    mockSupabase.rpc.mockResolvedValue({ error: null })

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        user_id: 'user-1',
        package_id: 5, // 5-credit package
        payment_method_id: 'pm_test_123',
      },
    })

    await purchaseCreditsHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.credits_added).toBe(5)
    expect(data.transaction.amount).toBe(55)
    expect(data.message).toContain('Successfully purchased 5 credits')
  })

  it('validates required fields', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        user_id: 'user-1',
        // Missing package_id and payment_method_id
      },
    })

    await purchaseCreditsHandler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Missing required fields')
  })

  it('validates credit package', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        user_id: 'user-1',
        package_id: 99, // Invalid package
        payment_method_id: 'pm_test_123',
      },
    })

    await purchaseCreditsHandler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Invalid package')
    expect(data.available_packages).toBeDefined()
  })

  it('handles payment failures', async () => {
    mockStripe.paymentIntents.create.mockResolvedValue({
      data: null,
      error: {
        message: 'Your card was declined.',
        code: 'card_declined',
      },
    })

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        user_id: 'user-1',
        package_id: 5,
        payment_method_id: 'pm_declined',
      },
    })

    await purchaseCreditsHandler(req, res)

    expect(res._getStatusCode()).toBe(402)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Payment failed')
    expect(data.code).toBe('card_declined')
  })

  it('handles payments requiring action', async () => {
    mockStripe.paymentIntents.create.mockResolvedValue({
      data: {
        id: 'pi_test_123',
        status: 'requires_action',
        client_secret: 'pi_test_123_secret_xyz',
      },
      error: null,
    })

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        user_id: 'user-1',
        package_id: 5,
        payment_method_id: 'pm_test_123',
      },
    })

    await purchaseCreditsHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.requires_action).toBe(true)
    expect(data.payment_intent.client_secret).toBeDefined()
  })

  it('rejects non-POST requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    })

    await purchaseCreditsHandler(req, res)

    expect(res._getStatusCode()).toBe(405)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Method not allowed')
  })
})

describe('/api/credits/history', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    mockSupabase.from().range.mockReturnThis()
    mockSupabase.from().limit.mockReturnThis()
    mockSupabase.from().order.mockResolvedValue({
      data: [
        {
          id: 'txn-1',
          type: 'purchase',
          credits: 10,
          amount: 100,
          description: 'Credit package purchase',
          status: 'completed',
          created_at: '2024-01-01T12:00:00Z',
        },
        {
          id: 'txn-2',
          type: 'usage',
          credits: -1,
          amount: 0,
          description: 'Class booking: Morning Yoga',
          status: 'completed',
          created_at: '2024-01-05T08:00:00Z',
        },
      ],
      error: null,
      count: 2,
    })
  })

  it('retrieves credit history successfully', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { user_id: 'user-1' },
    })

    await getCreditHistoryHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.data).toHaveLength(2)
    expect(data.summary.total_purchased).toBe(10)
    expect(data.summary.total_spent).toBe(100)
    expect(data.summary.total_used).toBe(1)
  })

  it('filters by transaction type', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { 
        user_id: 'user-1',
        type: 'purchase'
      },
    })

    await getCreditHistoryHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(mockSupabase.from().eq).toHaveBeenCalledWith('type', 'purchase')
  })

  it('applies date filters', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { 
        user_id: 'user-1',
        start_date: '2024-01-01',
        end_date: '2024-01-31'
      },
    })

    await getCreditHistoryHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(mockSupabase.from().gte).toHaveBeenCalledWith('created_at', '2024-01-01')
    expect(mockSupabase.from().lte).toHaveBeenCalledWith('created_at', '2024-01-31')
  })

  it('validates user_id parameter', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: {}, // Missing user_id
    })

    await getCreditHistoryHandler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Missing user_id')
  })

  it('rejects non-GET requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    })

    await getCreditHistoryHandler(req, res)

    expect(res._getStatusCode()).toBe(405)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Method not allowed')
  })
})

describe('/api/credits/packages', () => {
  it('returns available credit packages', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    })

    await getCreditPackagesHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.data).toHaveLength(4)
    expect(data.data[0].credits).toBe(1)
    expect(data.data[0].price).toBe(12)
    expect(data.data[0].price_per_credit).toBe(12)
    
    // Check that 10-credit package is marked as popular
    const popularPackage = data.data.find(pkg => pkg.popular)
    expect(popularPackage.credits).toBe(10)
  })

  it('rejects non-GET requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    })

    await getCreditPackagesHandler(req, res)

    expect(res._getStatusCode()).toBe(405)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Method not allowed')
  })
})

describe('/api/webhooks/stripe', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('handles payment_intent.succeeded webhook', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_123',
          status: 'succeeded',
        },
      },
    })

    mockSupabase.from().single.mockResolvedValue({
      data: {
        id: 'txn-123',
        user_id: 'user-1',
        credits: 5,
        status: 'pending',
      },
      error: null,
    })

    mockSupabase.from().update.mockResolvedValue({ error: null })
    mockSupabase.rpc.mockResolvedValue({ error: null })

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: { 'stripe-signature': 'test_signature' },
      body: 'webhook_payload',
    })

    // Mock environment variable
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'

    await stripeWebhookHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.received).toBe(true)
  })

  it('handles payment_intent.payment_failed webhook', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'payment_intent.payment_failed',
      data: {
        object: {
          id: 'pi_test_failed',
          status: 'failed',
        },
      },
    })

    mockSupabase.from().update.mockResolvedValue({ error: null })

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: { 'stripe-signature': 'test_signature' },
      body: 'webhook_payload',
    })

    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'

    await stripeWebhookHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(mockSupabase.from().update).toHaveBeenCalledWith({ status: 'failed' })
  })

  it('validates webhook signature', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {}, // Missing stripe-signature
      body: 'webhook_payload',
    })

    await stripeWebhookHandler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Missing webhook signature or secret')
  })

  it('rejects non-POST requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    })

    await stripeWebhookHandler(req, res)

    expect(res._getStatusCode()).toBe(405)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Method not allowed')
  })
})