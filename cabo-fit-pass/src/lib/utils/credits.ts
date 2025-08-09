/**
 * Credit calculation and formatting utilities
 */

export interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number // in dollars
  bonus?: number // bonus credits
  popular?: boolean
  description?: string
  validityDays?: number // how long credits are valid
}

export interface CreditTransaction {
  id: string
  amount: number
  type: 'purchase' | 'spend' | 'refund' | 'bonus' | 'expired'
  description: string
  timestamp: Date
  reference?: string
}

/**
 * Predefined credit packages
 */
export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 5,
    price: 49.99,
    description: 'Perfect for trying new classes',
    validityDays: 60
  },
  {
    id: 'regular',
    name: 'Regular Pack',
    credits: 10,
    price: 89.99,
    bonus: 1,
    description: 'Most popular choice',
    popular: true,
    validityDays: 90
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    credits: 20,
    price: 159.99,
    bonus: 3,
    description: 'Best value for frequent users',
    validityDays: 120
  },
  {
    id: 'unlimited',
    name: 'Monthly Unlimited',
    credits: 100,
    price: 199.99,
    bonus: 10,
    description: 'Unlimited classes for 30 days',
    validityDays: 30
  }
]

/**
 * Calculate credit package value
 */
export function calculatePackageValue(pkg: CreditPackage): {
  totalCredits: number
  pricePerCredit: number
  savings: number
  bonusValue: number
} {
  const totalCredits = pkg.credits + (pkg.bonus || 0)
  const pricePerCredit = pkg.price / totalCredits
  const basePrice = pkg.credits * 10 // Assume $10 per credit base price
  const savings = Math.max(0, basePrice - pkg.price)
  const bonusValue = (pkg.bonus || 0) * 10

  return {
    totalCredits,
    pricePerCredit,
    savings,
    bonusValue
  }
}

/**
 * Format credits with proper pluralization
 */
export function formatCredits(credits: number): string {
  if (credits === 1) {
    return '1 credit'
  }
  return `${credits} credits`
}

/**
 * Format price in USD
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price)
}

/**
 * Calculate refund amount based on cancellation policy
 */
export function calculateRefund(
  creditsSpent: number,
  hoursUntilClass: number,
  cancellationPolicy: {
    fullRefundHours: number // hours before class for full refund
    partialRefundHours: number // hours before class for partial refund
    partialRefundPercent: number // percentage for partial refund
  } = {
    fullRefundHours: 24,
    partialRefundHours: 2,
    partialRefundPercent: 50
  }
): {
  refundAmount: number
  refundPercentage: number
  refundType: 'full' | 'partial' | 'none'
} {
  if (hoursUntilClass >= cancellationPolicy.fullRefundHours) {
    return {
      refundAmount: creditsSpent,
      refundPercentage: 100,
      refundType: 'full'
    }
  } else if (hoursUntilClass >= cancellationPolicy.partialRefundHours) {
    const refundAmount = Math.floor(creditsSpent * (cancellationPolicy.partialRefundPercent / 100))
    return {
      refundAmount,
      refundPercentage: cancellationPolicy.partialRefundPercent,
      refundType: 'partial'
    }
  } else {
    return {
      refundAmount: 0,
      refundPercentage: 0,
      refundType: 'none'
    }
  }
}

/**
 * Check if user has enough credits for a class
 */
export function hasEnoughCredits(
  userBalance: number,
  requiredCredits: number,
  includeBuffer: boolean = false
): {
  hasEnough: boolean
  shortfall: number
  bufferNeeded: number
} {
  const buffer = includeBuffer ? 1 : 0 // Keep at least 1 credit as buffer
  const needed = requiredCredits + buffer
  const hasEnough = userBalance >= needed
  const shortfall = Math.max(0, needed - userBalance)

  return {
    hasEnough,
    shortfall,
    bufferNeeded: buffer
  }
}

/**
 * Calculate credit usage analytics
 */
export function calculateCreditUsageAnalytics(transactions: CreditTransaction[]): {
  totalPurchased: number
  totalSpent: number
  totalRefunded: number
  currentBalance: number
  averageSpendPerTransaction: number
  mostExpensiveClass: number
  totalTransactions: number
  monthlyUsage: Record<string, number>
} {
  let totalPurchased = 0
  let totalSpent = 0
  let totalRefunded = 0
  let currentBalance = 0
  const spendTransactions: number[] = []
  const monthlyUsage: Record<string, number> = {}

  transactions.forEach(transaction => {
    const monthKey = transaction.timestamp.toISOString().substring(0, 7) // YYYY-MM

    switch (transaction.type) {
      case 'purchase':
      case 'bonus':
        totalPurchased += transaction.amount
        currentBalance += transaction.amount
        break
      
      case 'spend':
        totalSpent += transaction.amount
        currentBalance -= transaction.amount
        spendTransactions.push(transaction.amount)
        monthlyUsage[monthKey] = (monthlyUsage[monthKey] || 0) + transaction.amount
        break
      
      case 'refund':
        totalRefunded += transaction.amount
        currentBalance += transaction.amount
        break
      
      case 'expired':
        currentBalance -= transaction.amount
        break
    }
  })

  const averageSpendPerTransaction = spendTransactions.length > 0 
    ? spendTransactions.reduce((sum, amount) => sum + amount, 0) / spendTransactions.length
    : 0

  const mostExpensiveClass = Math.max(...spendTransactions, 0)

  return {
    totalPurchased,
    totalSpent,
    totalRefunded,
    currentBalance,
    averageSpendPerTransaction,
    mostExpensiveClass,
    totalTransactions: transactions.length,
    monthlyUsage
  }
}

/**
 * Get recommended credit package based on usage
 */
export function getRecommendedPackage(
  currentBalance: number,
  monthlyUsage: number,
  userType: 'new' | 'light' | 'regular' | 'heavy' = 'new'
): CreditPackage {
  // If user has low balance and high usage, recommend larger packages
  if (currentBalance <= 2 && monthlyUsage >= 15) {
    return CREDIT_PACKAGES.find(p => p.id === 'premium')!
  }

  // Based on user type
  switch (userType) {
    case 'new':
      return CREDIT_PACKAGES.find(p => p.id === 'starter')!
    
    case 'light':
      return CREDIT_PACKAGES.find(p => p.id === 'starter')!
    
    case 'regular':
      return CREDIT_PACKAGES.find(p => p.id === 'regular')!
    
    case 'heavy':
      if (monthlyUsage >= 25) {
        return CREDIT_PACKAGES.find(p => p.id === 'unlimited')!
      }
      return CREDIT_PACKAGES.find(p => p.id === 'premium')!
    
    default:
      return CREDIT_PACKAGES.find(p => p.id === 'regular')!
  }
}

/**
 * Calculate credit expiration
 */
export function calculateCreditExpiration(
  purchaseDate: Date,
  validityDays: number
): {
  expirationDate: Date
  daysUntilExpiration: number
  isExpiringSoon: boolean
  isExpired: boolean
} {
  const expirationDate = new Date(purchaseDate)
  expirationDate.setDate(expirationDate.getDate() + validityDays)
  
  const now = new Date()
  const msUntilExpiration = expirationDate.getTime() - now.getTime()
  const daysUntilExpiration = Math.ceil(msUntilExpiration / (1000 * 60 * 60 * 24))
  
  const isExpired = daysUntilExpiration <= 0
  const isExpiringSoon = !isExpired && daysUntilExpiration <= 7 // 7 days warning

  return {
    expirationDate,
    daysUntilExpiration,
    isExpiringSoon,
    isExpired
  }
}

/**
 * Format credit expiration warning
 */
export function formatExpirationWarning(daysUntilExpiration: number, credits: number): string {
  if (daysUntilExpiration <= 0) {
    return `${formatCredits(credits)} expired`
  } else if (daysUntilExpiration === 1) {
    return `${formatCredits(credits)} expire tomorrow`
  } else if (daysUntilExpiration <= 7) {
    return `${formatCredits(credits)} expire in ${daysUntilExpiration} days`
  }
  
  return `${formatCredits(credits)} expire in ${daysUntilExpiration} days`
}

/**
 * Calculate loyalty bonus
 */
export function calculateLoyaltyBonus(
  totalPurchases: number,
  memberSinceMonths: number
): {
  bonusPercentage: number
  bonusCredits: number
  nextTierPurchases: number
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum'
} {
  let loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze'
  let bonusPercentage = 0
  let nextTierPurchases = 500

  // Determine tier based on total purchases and membership duration
  if (totalPurchases >= 2000 && memberSinceMonths >= 12) {
    loyaltyTier = 'platinum'
    bonusPercentage = 15
    nextTierPurchases = 0
  } else if (totalPurchases >= 1000 && memberSinceMonths >= 6) {
    loyaltyTier = 'gold'
    bonusPercentage = 10
    nextTierPurchases = 2000 - totalPurchases
  } else if (totalPurchases >= 500 && memberSinceMonths >= 3) {
    loyaltyTier = 'silver'
    bonusPercentage = 5
    nextTierPurchases = 1000 - totalPurchases
  } else {
    loyaltyTier = 'bronze'
    bonusPercentage = 0
    nextTierPurchases = 500 - totalPurchases
  }

  return {
    bonusPercentage,
    bonusCredits: 0, // Would be calculated when making a purchase
    nextTierPurchases: Math.max(0, nextTierPurchases),
    loyaltyTier
  }
}

/**
 * Apply loyalty bonus to credit purchase
 */
export function applyLoyaltyBonus(
  baseCredits: number,
  bonusPercentage: number
): {
  totalCredits: number
  bonusCredits: number
} {
  const bonusCredits = Math.floor(baseCredits * (bonusPercentage / 100))
  const totalCredits = baseCredits + bonusCredits

  return {
    totalCredits,
    bonusCredits
  }
}

/**
 * Calculate class credit requirements based on factors
 */
export function calculateClassCredits(
  baseCost: number,
  factors: {
    isPeakTime?: boolean
    isPopularInstructor?: boolean
    isSmallClass?: boolean
    isSpecialEvent?: boolean
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
  } = {}
): number {
  let credits = baseCost
  
  // Peak time surcharge (morning/evening rush)
  if (factors.isPeakTime) {
    credits += 1
  }
  
  // Popular instructor premium
  if (factors.isPopularInstructor) {
    credits += 1
  }
  
  // Small class premium (more personalized attention)
  if (factors.isSmallClass) {
    credits += 1
  }
  
  // Special event premium
  if (factors.isSpecialEvent) {
    credits += 2
  }
  
  // Difficulty adjustment
  if (factors.difficulty === 'advanced') {
    credits += 1
  }
  
  return Math.max(1, credits) // Minimum 1 credit
}

/**
 * Format credit transaction for display
 */
export function formatTransaction(transaction: CreditTransaction): {
  displayText: string
  amountText: string
  typeColor: string
  icon: string
} {
  const isPositive = ['purchase', 'refund', 'bonus'].includes(transaction.type)
  const amountText = `${isPositive ? '+' : '-'}${transaction.amount}`
  
  const typeConfig = {
    purchase: { color: 'green', icon: '💳' },
    spend: { color: 'red', icon: '🏃‍♀️' },
    refund: { color: 'blue', icon: '↩️' },
    bonus: { color: 'purple', icon: '🎁' },
    expired: { color: 'gray', icon: '⏰' }
  }
  
  const config = typeConfig[transaction.type] || { color: 'gray', icon: '?' }
  
  return {
    displayText: transaction.description,
    amountText,
    typeColor: config.color,
    icon: config.icon
  }
}