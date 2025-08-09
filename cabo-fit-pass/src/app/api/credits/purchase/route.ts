import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { creditManager } from '@/lib/credits'
import type { Database } from '@/types/database.types'

const purchaseSchema = z.object({
  packageId: z.string().min(1, 'Package ID is required'),
  paymentMethod: z.enum(['card', 'apple', 'google']),
  paymentToken: z.string().optional(),
  promoCode: z.string().optional(),
})

type PurchaseRequest = z.infer<typeof purchaseSchema>

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = purchaseSchema.parse(body)
    const { packageId, paymentMethod, paymentToken, promoCode } = validatedData

    // Get credit package details
    const creditPackage = creditManager.getCreditPackage(packageId)
    if (!creditPackage) {
      return NextResponse.json(
        { error: 'Invalid credit package' },
        { status: 400 }
      )
    }

    // Calculate total amount (with promo code if applicable)
    let totalAmount = creditPackage.price
    let discount = 0
    
    if (promoCode) {
      const discountResult = await applyPromoCode(promoCode, totalAmount)
      if (discountResult.valid) {
        discount = discountResult.discount
        totalAmount = discountResult.finalAmount
      }
    }

    // Process payment
    let paymentResult
    try {
      paymentResult = await processPayment({
        amount: totalAmount,
        currency: 'usd',
        paymentMethod,
        paymentToken,
        userId: user.id,
        description: `CaboFitPass Credits - ${creditPackage.name}`,
        metadata: {
          packageId,
          userId: user.id,
          originalAmount: creditPackage.price,
          discount,
          promoCode: promoCode || null
        }
      })
    } catch (paymentError) {
      console.error('Payment processing error:', paymentError)
      return NextResponse.json(
        { error: 'Payment failed', details: paymentError instanceof Error ? paymentError.message : 'Unknown error' },
        { status: 402 }
      )
    }

    // Add credits to user account
    const { credits, transaction } = await creditManager.purchaseCredits(
      user.id,
      packageId,
      paymentMethod,
      paymentResult.paymentIntentId
    )

    // Log purchase for analytics
    await logPurchaseEvent({
      userId: user.id,
      packageId,
      amount: totalAmount,
      paymentMethod,
      creditsAdded: creditPackage.credits + (creditPackage.bonus || 0),
      transactionId: transaction.id
    })

    // Return success response
    return NextResponse.json({
      success: true,
      credits,
      transaction,
      payment: {
        id: paymentResult.paymentIntentId,
        amount: totalAmount,
        currency: 'usd'
      },
      package: creditPackage
    }, { status: 200 })

  } catch (error: any) {
    console.error('Credit purchase error:', error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch available credit packages
export async function GET() {
  try {
    const packages = creditManager.getCreditPackages()
    
    return NextResponse.json({
      packages,
      promoOffers: await getActivePromoOffers()
    })
  } catch (error) {
    console.error('Error fetching credit packages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credit packages' },
      { status: 500 }
    )
  }
}

// Payment processing function (mock implementation)
async function processPayment({
  amount,
  currency,
  paymentMethod,
  paymentToken,
  userId,
  description,
  metadata
}: {
  amount: number
  currency: string
  paymentMethod: string
  paymentToken?: string
  userId: string
  description: string
  metadata: Record<string, any>
}) {
  // In a real implementation, you would integrate with Stripe, Square, or another payment processor
  // For demo purposes, we'll simulate a successful payment
  
  if (paymentMethod === 'card' && !paymentToken) {
    throw new Error('Payment token required for card payments')
  }

  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Mock successful payment result
  return {
    paymentIntentId: `pi_mock_${Date.now()}_${userId}`,
    status: 'succeeded',
    amount,
    currency,
    paymentMethod,
    created: new Date().toISOString()
  }
}

// Promo code validation
async function applyPromoCode(promoCode: string, amount: number) {
  const validPromoCodes: Record<string, { discount: number; type: 'percentage' | 'fixed'; minAmount?: number }> = {
    'WELCOME10': { discount: 0.10, type: 'percentage' },
    'SAVE20': { discount: 0.20, type: 'percentage', minAmount: 50 },
    'FIRST5': { discount: 5, type: 'fixed' },
    'SUMMER25': { discount: 0.25, type: 'percentage', minAmount: 100 }
  }

  const promo = validPromoCodes[promoCode.toUpperCase()]
  if (!promo) {
    return { valid: false, discount: 0, finalAmount: amount }
  }

  if (promo.minAmount && amount < promo.minAmount) {
    return { valid: false, discount: 0, finalAmount: amount, error: `Minimum purchase of $${promo.minAmount} required` }
  }

  let discount = 0
  if (promo.type === 'percentage') {
    discount = amount * promo.discount
  } else {
    discount = promo.discount
  }

  const finalAmount = Math.max(0, amount - discount)

  return {
    valid: true,
    discount,
    finalAmount,
    type: promo.type,
    code: promoCode
  }
}

// Get active promotional offers
async function getActivePromoOffers() {
  // In a real implementation, this would fetch from a database
  return [
    {
      code: 'WELCOME10',
      description: '10% off your first purchase',
      discount: 0.10,
      type: 'percentage' as const,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      newUsersOnly: true
    },
    {
      code: 'SUMMER25',
      description: '25% off purchases over $100',
      discount: 0.25,
      type: 'percentage' as const,
      validUntil: new Date('2024-09-01').toISOString(),
      minAmount: 100
    }
  ]
}

// Analytics logging
async function logPurchaseEvent({
  userId,
  packageId,
  amount,
  paymentMethod,
  creditsAdded,
  transactionId
}: {
  userId: string
  packageId: string
  amount: number
  paymentMethod: string
  creditsAdded: number
  transactionId: string
}) {
  // In a real implementation, you would log to analytics service
  console.log('Purchase event:', {
    userId,
    packageId,
    amount,
    paymentMethod,
    creditsAdded,
    transactionId,
    timestamp: new Date().toISOString()
  })
}