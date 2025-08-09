import { createClient } from '@supabase/supabase-js'
import type { Database, UserCredits, CreditTransaction } from '@/types/database.types'

// Credit transaction functions
export class CreditManager {
  private supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get user credits
  async getUserCredits(userId: string): Promise<UserCredits | null> {
    const { data, error } = await this.supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No credits record exists, create one
        return this.initializeUserCredits(userId)
      }
      throw error
    }

    return data
  }

  // Initialize user credits (for new users)
  async initializeUserCredits(userId: string, initialCredits = 4): Promise<UserCredits> {
    const { data, error } = await this.supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        current_balance: initialCredits,
        lifetime_earned: initialCredits,
        lifetime_spent: 0
      })
      .select()
      .single()

    if (error) throw error

    // Create initial transaction record
    await this.createTransaction({
      user_id: userId,
      type: 'credit',
      amount: initialCredits,
      description: 'Welcome bonus',
      balance_after: initialCredits
    })

    return data
  }

  // Add credits to user account
  async addCredits(
    userId: string, 
    amount: number, 
    description: string,
    reason: 'purchase' | 'refund' | 'bonus' | 'admin' = 'purchase',
    metadata?: Record<string, any>
  ): Promise<CreditTransaction> {
    // Start transaction
    const { data: credits, error: creditsError } = await this.supabase
      .rpc('add_user_credits', {
        user_id: userId,
        amount_to_add: amount
      })

    if (creditsError) throw creditsError

    // Create transaction record
    const transaction = await this.createTransaction({
      user_id: userId,
      type: 'credit',
      amount,
      description,
      balance_after: credits.current_balance,
      metadata: {
        reason,
        ...metadata
      }
    })

    return transaction
  }

  // Spend credits from user account
  async spendCredits(
    userId: string,
    amount: number,
    description: string,
    classId?: string,
    metadata?: Record<string, any>
  ): Promise<CreditTransaction> {
    // Check current balance first
    const userCredits = await this.getUserCredits(userId)
    if (!userCredits || userCredits.current_balance < amount) {
      throw new Error('Insufficient credits')
    }

    // Spend credits using stored procedure
    const { data: credits, error: creditsError } = await this.supabase
      .rpc('spend_user_credits', {
        user_id: userId,
        amount_to_spend: amount
      })

    if (creditsError) throw creditsError

    // Create transaction record
    const transaction = await this.createTransaction({
      user_id: userId,
      type: 'debit',
      amount,
      description,
      balance_after: credits.current_balance,
      class_id: classId,
      metadata
    })

    return transaction
  }

  // Purchase credits
  async purchaseCredits(
    userId: string,
    packageId: string,
    paymentMethod: string,
    paymentIntentId?: string
  ): Promise<{ credits: UserCredits; transaction: CreditTransaction }> {
    const creditPackage = this.getCreditPackage(packageId)
    if (!creditPackage) {
      throw new Error('Invalid credit package')
    }

    // In a real implementation, you would:
    // 1. Process payment through Stripe/payment processor
    // 2. Verify payment success
    // 3. Then add credits

    // For demo, we'll simulate successful payment
    const totalCredits = creditPackage.credits + (creditPackage.bonus || 0)
    
    const transaction = await this.addCredits(
      userId,
      totalCredits,
      `Purchased ${creditPackage.name}`,
      'purchase',
      {
        package_id: packageId,
        payment_method: paymentMethod,
        payment_intent_id: paymentIntentId,
        original_credits: creditPackage.credits,
        bonus_credits: creditPackage.bonus || 0,
        amount_paid: creditPackage.price
      }
    )

    const credits = await this.getUserCredits(userId)
    if (!credits) throw new Error('Failed to retrieve updated credits')

    return { credits, transaction }
  }

  // Create transaction record
  private async createTransaction(transaction: Omit<CreditTransaction, 'id' | 'created_at' | 'updated_at'>): Promise<CreditTransaction> {
    const { data, error } = await this.supabase
      .from('credit_transactions')
      .insert(transaction)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get transaction history
  async getTransactionHistory(
    userId: string,
    limit = 50,
    offset = 0,
    type?: 'credit' | 'debit'
  ): Promise<CreditTransaction[]> {
    let query = this.supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  // Get monthly spending stats
  async getMonthlyStats(userId: string, year?: number, month?: number) {
    const now = new Date()
    const targetYear = year || now.getFullYear()
    const targetMonth = month || now.getMonth()

    const startDate = new Date(targetYear, targetMonth, 1)
    const endDate = new Date(targetYear, targetMonth + 1, 1)

    const { data, error } = await this.supabase
      .from('credit_transactions')
      .select('type, amount')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString())

    if (error) throw error

    const stats = {
      earned: 0,
      spent: 0,
      net: 0,
      transactionCount: data?.length || 0
    }

    data?.forEach(transaction => {
      if (transaction.type === 'credit') {
        stats.earned += transaction.amount
      } else {
        stats.spent += transaction.amount
      }
    })

    stats.net = stats.earned - stats.spent

    return stats
  }

  // Get credit packages (could be from database in real implementation)
  getCreditPackages() {
    return [
      {
        id: 'starter',
        name: 'Starter Pack',
        credits: 5,
        price: 49.99,
        description: 'Perfect for trying out different classes',
        features: ['5 class credits', 'Valid for 30 days', 'All class types included'],
        validityDays: 30
      },
      {
        id: 'value',
        name: 'Value Pack',
        credits: 10,
        price: 89.99,
        originalPrice: 99.99,
        bonus: 1,
        popular: true,
        description: 'Most popular choice for regular members',
        features: ['10 class credits', '+1 bonus credit', 'Valid for 60 days', 'Priority booking'],
        validityDays: 60
      },
      {
        id: 'premium',
        name: 'Premium Pack',
        credits: 20,
        price: 159.99,
        originalPrice: 199.99,
        bonus: 3,
        description: 'Best value for fitness enthusiasts',
        features: ['20 class credits', '+3 bonus credits', 'Valid for 90 days', 'Priority booking', 'Free guest passes (2)'],
        validityDays: 90
      },
      {
        id: 'unlimited',
        name: 'Unlimited Monthly',
        credits: 999, // Represents unlimited
        price: 199.99,
        description: 'Unlimited access to all classes',
        features: ['Unlimited class access', 'Valid for 30 days', 'Priority booking', 'Free guest passes (5)', 'Personal trainer session (1)'],
        validityDays: 30
      }
    ]
  }

  getCreditPackage(packageId: string) {
    return this.getCreditPackages().find(pkg => pkg.id === packageId)
  }

  // Subscribe to real-time credit updates
  subscribeToCredits(userId: string, callback: (credits: UserCredits) => void) {
    return this.supabase
      .channel(`user_credits:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_credits',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as UserCredits)
        }
      )
      .subscribe()
  }

  // Admin functions
  async adminAddCredits(userId: string, amount: number, reason: string, adminId: string) {
    return this.addCredits(userId, amount, reason, 'admin', {
      admin_id: adminId,
      admin_action: true
    })
  }

  async adminRemoveCredits(userId: string, amount: number, reason: string, adminId: string) {
    return this.spendCredits(userId, amount, reason, undefined, {
      admin_id: adminId,
      admin_action: true
    })
  }

  // Monthly credit allocation (for subscription users)
  async allocateMonthlyCredits(userId: string, amount: number = 4) {
    const now = new Date()
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`
    
    // Check if already allocated this month
    const { data: existingAllocation } = await this.supabase
      .from('credit_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'credit')
      .like('description', 'Monthly allocation%')
      .like('metadata->month', monthKey)
      .single()

    if (existingAllocation) {
      throw new Error('Monthly credits already allocated')
    }

    return this.addCredits(
      userId,
      amount,
      `Monthly allocation for ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      'bonus',
      {
        month: monthKey,
        allocation_type: 'monthly'
      }
    )
  }
}

export const creditManager = new CreditManager()