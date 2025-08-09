/**
 * @jest-environment node
 */

// Mock credit calculation utilities
const creditUtils = {
  // Credit packages and pricing
  CREDIT_PACKAGES: [
    { id: 1, credits: 1, price: 12, savings: 0 },
    { id: 5, credits: 5, price: 55, savings: 8.3 },
    { id: 10, credits: 10, price: 100, savings: 16.7 },
    { id: 20, credits: 20, price: 180, savings: 25 },
  ],

  // Base credit price
  BASE_CREDIT_PRICE: 12,

  // Calculate price per credit for a package
  getPricePerCredit: (packageId: number): number => {
    const pkg = creditUtils.CREDIT_PACKAGES.find(p => p.id === packageId)
    if (!pkg) {
      throw new Error('Invalid package ID')
    }
    return +(pkg.price / pkg.credits).toFixed(2)
  },

  // Calculate savings percentage compared to single credit price
  calculateSavings: (packageId: number): number => {
    const pkg = creditUtils.CREDIT_PACKAGES.find(p => p.id === packageId)
    if (!pkg) {
      throw new Error('Invalid package ID')
    }
    
    if (pkg.credits === 1) return 0
    
    const pricePerCredit = pkg.price / pkg.credits
    const savingsPercent = ((creditUtils.BASE_CREDIT_PRICE - pricePerCredit) / creditUtils.BASE_CREDIT_PRICE) * 100
    return +savingsPercent.toFixed(1)
  },

  // Get recommended package based on user's booking frequency
  getRecommendedPackage: (classesPerMonth: number): number => {
    if (classesPerMonth <= 1) return 1
    if (classesPerMonth <= 4) return 5
    if (classesPerMonth <= 8) return 10
    return 20
  },

  // Calculate expiration date for credits (1 year from purchase)
  calculateExpirationDate: (purchaseDate: Date = new Date()): Date => {
    const expirationDate = new Date(purchaseDate)
    expirationDate.setFullYear(expirationDate.getFullYear() + 1)
    return expirationDate
  },

  // Check if credits are expired or expiring soon
  checkCreditStatus: (expirationDate: string | Date): {
    isExpired: boolean
    isExpiringSoon: boolean
    daysUntilExpiry: number
    status: 'active' | 'expiring_soon' | 'expired'
  } => {
    const expiry = typeof expirationDate === 'string' ? new Date(expirationDate) : expirationDate
    const now = new Date()
    
    if (isNaN(expiry.getTime())) {
      throw new Error('Invalid expiration date')
    }

    const diffTime = expiry.getTime() - now.getTime()
    const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const isExpired = daysUntilExpiry < 0
    const isExpiringSoon = !isExpired && daysUntilExpiry <= 30

    let status: 'active' | 'expiring_soon' | 'expired'
    if (isExpired) {
      status = 'expired'
    } else if (isExpiringSoon) {
      status = 'expiring_soon'
    } else {
      status = 'active'
    }

    return {
      isExpired,
      isExpiringSoon,
      daysUntilExpiry,
      status,
    }
  },

  // Calculate refund amount for cancelled booking
  calculateRefund: (
    creditsUsed: number,
    cancellationTime: Date,
    classStartTime: Date,
    refundPolicy = { fullRefundHours: 24, partialRefundHours: 12, partialRefundPercent: 50 }
  ): {
    refundCredits: number
    refundType: 'full' | 'partial' | 'none'
    reason: string
  } => {
    const hoursBeforeClass = (classStartTime.getTime() - cancellationTime.getTime()) / (1000 * 60 * 60)

    if (hoursBeforeClass < 0) {
      return {
        refundCredits: 0,
        refundType: 'none',
        reason: 'Cannot cancel after class has started'
      }
    }

    if (hoursBeforeClass >= refundPolicy.fullRefundHours) {
      return {
        refundCredits: creditsUsed,
        refundType: 'full',
        reason: `Cancelled more than ${refundPolicy.fullRefundHours} hours in advance`
      }
    }

    if (hoursBeforeClass >= refundPolicy.partialRefundHours) {
      const refundCredits = Math.ceil(creditsUsed * (refundPolicy.partialRefundPercent / 100))
      return {
        refundCredits,
        refundType: 'partial',
        reason: `Cancelled ${refundPolicy.partialRefundPercent}% refund within ${refundPolicy.partialRefundHours}-${refundPolicy.fullRefundHours} hours`
      }
    }

    return {
      refundCredits: 0,
      refundType: 'none',
      reason: `No refund available within ${refundPolicy.partialRefundHours} hours of class`
    }
  },

  // Validate if user has sufficient credits for booking
  validateSufficientCredits: (userBalance: number, requiredCredits: number): {
    hasSufficientCredits: boolean
    shortfall?: number
    suggestedPackage?: number
  } => {
    if (userBalance >= requiredCredits) {
      return { hasSufficientCredits: true }
    }

    const shortfall = requiredCredits - userBalance
    
    // Find smallest package that covers the shortfall
    const suggestedPackage = creditUtils.CREDIT_PACKAGES
      .filter(pkg => pkg.credits >= shortfall)
      .sort((a, b) => a.credits - b.credits)[0]

    return {
      hasSufficientCredits: false,
      shortfall,
      suggestedPackage: suggestedPackage?.id
    }
  },

  // Calculate total value of user's credit balance
  calculateCreditValue: (creditBalance: number, pricePerCredit: number = creditUtils.BASE_CREDIT_PRICE): number => {
    return +(creditBalance * pricePerCredit).toFixed(2)
  },

  // Generate credit transaction record
  createTransactionRecord: (
    type: 'purchase' | 'usage' | 'refund' | 'expiration',
    credits: number,
    description: string,
    metadata?: Record<string, any>
  ): {
    id: string
    type: string
    credits: number
    description: string
    timestamp: string
    metadata?: Record<string, any>
  } => {
    return {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      credits,
      description,
      timestamp: new Date().toISOString(),
      metadata
    }
  },

  // Calculate credit usage analytics
  calculateUsageAnalytics: (transactions: Array<{
    type: string
    credits: number
    timestamp: string
    metadata?: any
  }>): {
    totalPurchased: number
    totalUsed: number
    totalRefunded: number
    totalExpired: number
    averageCreditsPerClass: number
    mostPopularClassType?: string
    usageByMonth: Record<string, number>
  } => {
    const purchases = transactions.filter(t => t.type === 'purchase')
    const usage = transactions.filter(t => t.type === 'usage')
    const refunds = transactions.filter(t => t.type === 'refund')
    const expirations = transactions.filter(t => t.type === 'expiration')

    const totalPurchased = purchases.reduce((sum, t) => sum + t.credits, 0)
    const totalUsed = Math.abs(usage.reduce((sum, t) => sum + t.credits, 0))
    const totalRefunded = refunds.reduce((sum, t) => sum + t.credits, 0)
    const totalExpired = Math.abs(expirations.reduce((sum, t) => sum + t.credits, 0))

    const averageCreditsPerClass = usage.length > 0 ? +(totalUsed / usage.length).toFixed(1) : 0

    // Find most popular class type from usage metadata
    const classTypes = usage
      .map(t => t.metadata?.classType)
      .filter(Boolean)
    
    const classTypeCount = classTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostPopularClassType = Object.entries(classTypeCount)
      .sort(([, a], [, b]) => b - a)[0]?.[0]

    // Usage by month
    const usageByMonth = usage.reduce((acc, t) => {
      const month = new Date(t.timestamp).toISOString().substring(0, 7) // YYYY-MM
      acc[month] = (acc[month] || 0) + Math.abs(t.credits)
      return acc
    }, {} as Record<string, number>)

    return {
      totalPurchased,
      totalUsed,
      totalRefunded,
      totalExpired,
      averageCreditsPerClass,
      mostPopularClassType,
      usageByMonth
    }
  },

  // Predict when user will run out of credits
  predictCreditDepletion: (
    currentBalance: number,
    usageHistory: Array<{ timestamp: string; credits: number }>
  ): {
    estimatedDaysRemaining: number
    recommendedTopUp: boolean
    suggestedPackage?: number
  } => {
    if (currentBalance <= 0) {
      return {
        estimatedDaysRemaining: 0,
        recommendedTopUp: true,
        suggestedPackage: creditUtils.getRecommendedPackage(4) // Default recommendation
      }
    }

    if (usageHistory.length === 0) {
      return {
        estimatedDaysRemaining: Infinity,
        recommendedTopUp: false
      }
    }

    // Calculate average daily usage from last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentUsage = usageHistory.filter(u => 
      new Date(u.timestamp) >= thirtyDaysAgo
    )

    if (recentUsage.length === 0) {
      return {
        estimatedDaysRemaining: Infinity,
        recommendedTopUp: false
      }
    }

    const totalRecentUsage = recentUsage.reduce((sum, u) => sum + Math.abs(u.credits), 0)
    const avgDailyUsage = totalRecentUsage / 30

    if (avgDailyUsage === 0) {
      return {
        estimatedDaysRemaining: Infinity,
        recommendedTopUp: false
      }
    }

    const estimatedDaysRemaining = Math.floor(currentBalance / avgDailyUsage)
    const recommendedTopUp = estimatedDaysRemaining <= 7

    const suggestedPackage = recommendedTopUp 
      ? creditUtils.getRecommendedPackage(Math.ceil(avgDailyUsage * 30))
      : undefined

    return {
      estimatedDaysRemaining,
      recommendedTopUp,
      suggestedPackage
    }
  }
}

describe('Credit Utilities', () => {
  describe('getPricePerCredit', () => {
    it('calculates correct price per credit for single credit', () => {
      const price = creditUtils.getPricePerCredit(1)
      expect(price).toBe(12)
    })

    it('calculates correct price per credit for 5-credit package', () => {
      const price = creditUtils.getPricePerCredit(5)
      expect(price).toBe(11) // 55/5
    })

    it('calculates correct price per credit for 10-credit package', () => {
      const price = creditUtils.getPricePerCredit(10)
      expect(price).toBe(10) // 100/10
    })

    it('calculates correct price per credit for 20-credit package', () => {
      const price = creditUtils.getPricePerCredit(20)
      expect(price).toBe(9) // 180/20
    })

    it('throws error for invalid package ID', () => {
      expect(() => creditUtils.getPricePerCredit(99)).toThrow('Invalid package ID')
    })
  })

  describe('calculateSavings', () => {
    it('returns 0 savings for single credit', () => {
      const savings = creditUtils.calculateSavings(1)
      expect(savings).toBe(0)
    })

    it('calculates correct savings for 5-credit package', () => {
      const savings = creditUtils.calculateSavings(5)
      expect(savings).toBe(8.3) // (12-11)/12 * 100 ≈ 8.3%
    })

    it('calculates correct savings for 10-credit package', () => {
      const savings = creditUtils.calculateSavings(10)
      expect(savings).toBe(16.7) // (12-10)/12 * 100 ≈ 16.7%
    })

    it('calculates correct savings for 20-credit package', () => {
      const savings = creditUtils.calculateSavings(20)
      expect(savings).toBe(25) // (12-9)/12 * 100 = 25%
    })

    it('throws error for invalid package ID', () => {
      expect(() => creditUtils.calculateSavings(99)).toThrow('Invalid package ID')
    })
  })

  describe('getRecommendedPackage', () => {
    it('recommends 1-credit package for low usage', () => {
      expect(creditUtils.getRecommendedPackage(1)).toBe(1)
    })

    it('recommends 5-credit package for moderate usage', () => {
      expect(creditUtils.getRecommendedPackage(3)).toBe(5)
    })

    it('recommends 10-credit package for regular usage', () => {
      expect(creditUtils.getRecommendedPackage(6)).toBe(10)
    })

    it('recommends 20-credit package for high usage', () => {
      expect(creditUtils.getRecommendedPackage(10)).toBe(20)
    })

    it('handles edge cases', () => {
      expect(creditUtils.getRecommendedPackage(0)).toBe(1)
      expect(creditUtils.getRecommendedPackage(4)).toBe(5)
      expect(creditUtils.getRecommendedPackage(8)).toBe(10)
    })
  })

  describe('calculateExpirationDate', () => {
    it('calculates expiration date one year from now', () => {
      const now = new Date('2024-01-15T12:00:00Z')
      const expiration = creditUtils.calculateExpirationDate(now)
      
      expect(expiration.getFullYear()).toBe(2025)
      expect(expiration.getMonth()).toBe(now.getMonth())
      expect(expiration.getDate()).toBe(now.getDate())
    })

    it('uses current date when no date provided', () => {
      const expiration = creditUtils.calculateExpirationDate()
      const now = new Date()
      
      expect(expiration.getFullYear()).toBe(now.getFullYear() + 1)
    })

    it('handles leap years correctly', () => {
      const leapDay = new Date('2024-02-29T12:00:00Z')
      const expiration = creditUtils.calculateExpirationDate(leapDay)
      
      expect(expiration.getFullYear()).toBe(2025)
      expect(expiration.getMonth()).toBe(1) // February
      expect(expiration.getDate()).toBe(28) // Non-leap year
    })
  })

  describe('checkCreditStatus', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    
    // Mock current time
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(now)
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('identifies active credits', () => {
      const expiryDate = new Date('2024-06-15T12:00:00Z') // 5 months away
      const status = creditUtils.checkCreditStatus(expiryDate)
      
      expect(status.isExpired).toBe(false)
      expect(status.isExpiringSoon).toBe(false)
      expect(status.status).toBe('active')
      expect(status.daysUntilExpiry).toBeGreaterThan(30)
    })

    it('identifies expiring soon credits', () => {
      const expiryDate = new Date('2024-02-10T12:00:00Z') // 26 days away
      const status = creditUtils.checkCreditStatus(expiryDate)
      
      expect(status.isExpired).toBe(false)
      expect(status.isExpiringSoon).toBe(true)
      expect(status.status).toBe('expiring_soon')
      expect(status.daysUntilExpiry).toBe(26)
    })

    it('identifies expired credits', () => {
      const expiryDate = new Date('2023-12-15T12:00:00Z') // 1 month ago
      const status = creditUtils.checkCreditStatus(expiryDate)
      
      expect(status.isExpired).toBe(true)
      expect(status.isExpiringSoon).toBe(false)
      expect(status.status).toBe('expired')
      expect(status.daysUntilExpiry).toBeLessThan(0)
    })

    it('handles string date input', () => {
      const status = creditUtils.checkCreditStatus('2024-06-15T12:00:00Z')
      expect(status.status).toBe('active')
    })

    it('throws error for invalid date', () => {
      expect(() => creditUtils.checkCreditStatus('invalid-date')).toThrow('Invalid expiration date')
    })
  })

  describe('calculateRefund', () => {
    it('provides full refund for early cancellation', () => {
      const cancellationTime = new Date('2024-01-15T10:00:00Z')
      const classStartTime = new Date('2024-01-17T10:00:00Z') // 48 hours later
      
      const refund = creditUtils.calculateRefund(2, cancellationTime, classStartTime)
      
      expect(refund.refundCredits).toBe(2)
      expect(refund.refundType).toBe('full')
      expect(refund.reason).toContain('more than 24 hours')
    })

    it('provides partial refund for moderate cancellation', () => {
      const cancellationTime = new Date('2024-01-15T10:00:00Z')
      const classStartTime = new Date('2024-01-15T22:00:00Z') // 12 hours later
      
      const refund = creditUtils.calculateRefund(2, cancellationTime, classStartTime)
      
      expect(refund.refundCredits).toBe(1) // 50% of 2 credits
      expect(refund.refundType).toBe('partial')
      expect(refund.reason).toContain('50% refund')
    })

    it('provides no refund for late cancellation', () => {
      const cancellationTime = new Date('2024-01-15T10:00:00Z')
      const classStartTime = new Date('2024-01-15T16:00:00Z') // 6 hours later
      
      const refund = creditUtils.calculateRefund(2, cancellationTime, classStartTime)
      
      expect(refund.refundCredits).toBe(0)
      expect(refund.refundType).toBe('none')
      expect(refund.reason).toContain('No refund available')
    })

    it('provides no refund for post-class cancellation', () => {
      const cancellationTime = new Date('2024-01-15T12:00:00Z')
      const classStartTime = new Date('2024-01-15T10:00:00Z') // 2 hours ago
      
      const refund = creditUtils.calculateRefund(2, cancellationTime, classStartTime)
      
      expect(refund.refundCredits).toBe(0)
      expect(refund.refundType).toBe('none')
      expect(refund.reason).toContain('after class has started')
    })

    it('accepts custom refund policy', () => {
      const cancellationTime = new Date('2024-01-15T10:00:00Z')
      const classStartTime = new Date('2024-01-16T10:00:00Z') // 24 hours later
      const customPolicy = { fullRefundHours: 48, partialRefundHours: 24, partialRefundPercent: 75 }
      
      const refund = creditUtils.calculateRefund(4, cancellationTime, classStartTime, customPolicy)
      
      expect(refund.refundCredits).toBe(3) // 75% of 4 credits
      expect(refund.refundType).toBe('partial')
    })
  })

  describe('validateSufficientCredits', () => {
    it('validates sufficient credits', () => {
      const result = creditUtils.validateSufficientCredits(10, 5)
      
      expect(result.hasSufficientCredits).toBe(true)
      expect(result.shortfall).toBeUndefined()
      expect(result.suggestedPackage).toBeUndefined()
    })

    it('identifies insufficient credits and suggests package', () => {
      const result = creditUtils.validateSufficientCredits(2, 5)
      
      expect(result.hasSufficientCredits).toBe(false)
      expect(result.shortfall).toBe(3)
      expect(result.suggestedPackage).toBe(5) // Smallest package that covers 3 credits
    })

    it('suggests appropriate package for large shortfall', () => {
      const result = creditUtils.validateSufficientCredits(1, 15)
      
      expect(result.hasSufficientCredits).toBe(false)
      expect(result.shortfall).toBe(14)
      expect(result.suggestedPackage).toBe(20) // Smallest package that covers 14 credits
    })

    it('handles exact balance', () => {
      const result = creditUtils.validateSufficientCredits(5, 5)
      
      expect(result.hasSufficientCredits).toBe(true)
    })
  })

  describe('calculateCreditValue', () => {
    it('calculates value with default price', () => {
      const value = creditUtils.calculateCreditValue(10)
      expect(value).toBe(120) // 10 * 12
    })

    it('calculates value with custom price per credit', () => {
      const value = creditUtils.calculateCreditValue(10, 10)
      expect(value).toBe(100) // 10 * 10
    })

    it('handles zero credits', () => {
      const value = creditUtils.calculateCreditValue(0)
      expect(value).toBe(0)
    })

    it('handles decimal credits', () => {
      const value = creditUtils.calculateCreditValue(2.5, 12)
      expect(value).toBe(30)
    })
  })

  describe('createTransactionRecord', () => {
    it('creates purchase transaction record', () => {
      const record = creditUtils.createTransactionRecord(
        'purchase',
        10,
        'Credit package purchase',
        { packageId: 10 }
      )
      
      expect(record.type).toBe('purchase')
      expect(record.credits).toBe(10)
      expect(record.description).toBe('Credit package purchase')
      expect(record.metadata).toEqual({ packageId: 10 })
      expect(record.id).toMatch(/^txn_\d+_[a-z0-9]{9}$/)
      expect(new Date(record.timestamp)).toBeInstanceOf(Date)
    })

    it('creates usage transaction record', () => {
      const record = creditUtils.createTransactionRecord(
        'usage',
        -1,
        'Class booking: Morning Yoga'
      )
      
      expect(record.type).toBe('usage')
      expect(record.credits).toBe(-1)
      expect(record.description).toBe('Class booking: Morning Yoga')
    })

    it('generates unique IDs', () => {
      const record1 = creditUtils.createTransactionRecord('purchase', 5, 'Test 1')
      const record2 = creditUtils.createTransactionRecord('purchase', 5, 'Test 2')
      
      expect(record1.id).not.toBe(record2.id)
    })
  })

  describe('calculateUsageAnalytics', () => {
    const sampleTransactions = [
      { type: 'purchase', credits: 10, timestamp: '2024-01-01T12:00:00Z' },
      { type: 'purchase', credits: 5, timestamp: '2024-01-15T12:00:00Z' },
      { type: 'usage', credits: -1, timestamp: '2024-01-02T10:00:00Z', metadata: { classType: 'yoga' } },
      { type: 'usage', credits: -2, timestamp: '2024-01-10T14:00:00Z', metadata: { classType: 'hiit' } },
      { type: 'usage', credits: -1, timestamp: '2024-01-20T09:00:00Z', metadata: { classType: 'yoga' } },
      { type: 'refund', credits: 1, timestamp: '2024-01-12T15:00:00Z' },
      { type: 'expiration', credits: -2, timestamp: '2024-01-31T23:59:59Z' },
    ]

    it('calculates comprehensive usage analytics', () => {
      const analytics = creditUtils.calculateUsageAnalytics(sampleTransactions)
      
      expect(analytics.totalPurchased).toBe(15) // 10 + 5
      expect(analytics.totalUsed).toBe(4) // |(-1) + (-2) + (-1)|
      expect(analytics.totalRefunded).toBe(1)
      expect(analytics.totalExpired).toBe(2) // |(-2)|
      expect(analytics.averageCreditsPerClass).toBe(1.3) // 4/3 usage transactions ≈ 1.3
      expect(analytics.mostPopularClassType).toBe('yoga') // 2 yoga vs 1 hiit
    })

    it('calculates usage by month', () => {
      const analytics = creditUtils.calculateUsageAnalytics(sampleTransactions)
      
      expect(analytics.usageByMonth['2024-01']).toBe(4) // All usage was in Jan 2024
    })

    it('handles empty transaction list', () => {
      const analytics = creditUtils.calculateUsageAnalytics([])
      
      expect(analytics.totalPurchased).toBe(0)
      expect(analytics.totalUsed).toBe(0)
      expect(analytics.averageCreditsPerClass).toBe(0)
      expect(analytics.mostPopularClassType).toBeUndefined()
      expect(Object.keys(analytics.usageByMonth)).toHaveLength(0)
    })

    it('handles transactions without metadata', () => {
      const transactionsWithoutMeta = [
        { type: 'usage', credits: -1, timestamp: '2024-01-02T10:00:00Z' },
        { type: 'usage', credits: -2, timestamp: '2024-01-10T14:00:00Z' },
      ]
      
      const analytics = creditUtils.calculateUsageAnalytics(transactionsWithoutMeta)
      
      expect(analytics.totalUsed).toBe(3)
      expect(analytics.averageCreditsPerClass).toBe(1.5)
      expect(analytics.mostPopularClassType).toBeUndefined()
    })
  })

  describe('predictCreditDepletion', () => {
    it('predicts depletion for regular usage', () => {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 15)
      
      const usageHistory = [
        { timestamp: thirtyDaysAgo.toISOString(), credits: -1 },
        { timestamp: new Date(thirtyDaysAgo.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), credits: -1 },
        { timestamp: new Date(thirtyDaysAgo.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), credits: -1 },
      ]
      
      const prediction = creditUtils.predictCreditDepletion(10, usageHistory)
      
      expect(prediction.estimatedDaysRemaining).toBeGreaterThan(0)
      expect(typeof prediction.recommendedTopUp).toBe('boolean')
    })

    it('recommends top-up when balance is low', () => {
      const recentUsage = Array.from({ length: 10 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000).toISOString(),
        credits: -1
      }))
      
      const prediction = creditUtils.predictCreditDepletion(3, recentUsage)
      
      expect(prediction.recommendedTopUp).toBe(true)
      expect(prediction.suggestedPackage).toBeDefined()
    })

    it('handles zero balance', () => {
      const prediction = creditUtils.predictCreditDepletion(0, [])
      
      expect(prediction.estimatedDaysRemaining).toBe(0)
      expect(prediction.recommendedTopUp).toBe(true)
      expect(prediction.suggestedPackage).toBeDefined()
    })

    it('handles no usage history', () => {
      const prediction = creditUtils.predictCreditDepletion(10, [])
      
      expect(prediction.estimatedDaysRemaining).toBe(Infinity)
      expect(prediction.recommendedTopUp).toBe(false)
    })

    it('handles no recent usage', () => {
      const oldUsage = [{
        timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
        credits: -1
      }]
      
      const prediction = creditUtils.predictCreditDepletion(10, oldUsage)
      
      expect(prediction.estimatedDaysRemaining).toBe(Infinity)
      expect(prediction.recommendedTopUp).toBe(false)
    })
  })
})