/**
 * Supabase Admin Client for Privileged Operations
 * Uses the service role key for elevated permissions
 * Server-side only - NEVER use in client code
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

/**
 * Admin client with service role permissions
 * Can bypass RLS policies and perform privileged operations
 */
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export default supabaseAdmin

/**
 * User management functions (Admin only)
 */
export const adminUsers = {
  /**
   * Get all users with profiles
   */
  async getAllUsers(limit: number = 100, offset: number = 0) {
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        user_credits(*),
        _count_bookings:bookings(count)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return profiles || []
  },

  /**
   * Create a new user profile
   */
  async createUser(userData: {
    email: string
    password: string
    full_name?: string
    role?: 'user' | 'admin' | 'staff'
    monthly_credits?: number
  }) {
    // Create auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
    })

    if (authError || !authUser.user) {
      throw authError
    }

    // Create profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.user.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role || 'user',
        monthly_credits: userData.monthly_credits || 0,
      })
      .select()
      .single()

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      throw profileError
    }

    return { user: authUser.user, profile }
  },

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: 'user' | 'admin' | 'staff') {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Suspend/unsuspend user
   */
  async updateUserStatus(userId: string, status: 'active' | 'suspended' | 'deleted') {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Delete user completely
   */
  async deleteUser(userId: string) {
    // Soft delete profile first
    await this.updateUserStatus(userId, 'deleted')

    // Hard delete from auth
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
      throw error
    }

    return true
  },

  /**
   * Reset user password
   */
  async resetUserPassword(userId: string, newPassword: string) {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) {
      throw error
    }

    return data
  },
}

/**
 * Credit management functions (Admin only)
 */
export const adminCredits = {
  /**
   * Add credits to user account
   */
  async addCredits(userId: string, amount: number, description: string, adminId?: string) {
    // Get current balance
    const { data: currentCredits, error: fetchError } = await supabaseAdmin
      .from('user_credits')
      .select('current_balance')
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      throw fetchError
    }

    const newBalance = currentCredits.current_balance + amount

    // Update credits
    const { error: updateError } = await supabaseAdmin
      .from('user_credits')
      .update({
        current_balance: newBalance,
        lifetime_earned: supabaseAdmin.raw('lifetime_earned + ?', [amount]),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (updateError) {
      throw updateError
    }

    // Log transaction
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('credit_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'admin_adjustment',
        amount,
        balance_before: currentCredits.current_balance,
        balance_after: newBalance,
        description,
        reference_type: 'admin',
        admin_user_id: adminId,
      })
      .select()
      .single()

    if (transactionError) {
      throw transactionError
    }

    return transaction
  },

  /**
   * Deduct credits from user account
   */
  async deductCredits(userId: string, amount: number, description: string, adminId?: string) {
    return this.addCredits(userId, -amount, description, adminId)
  },

  /**
   * Reset user's monthly credits
   */
  async resetMonthlyCredits(userId: string, newAllocation?: number) {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('monthly_credits')
      .eq('id', userId)
      .single()

    if (profileError) {
      throw profileError
    }

    const allocation = newAllocation || profile.monthly_credits

    const { error } = await supabaseAdmin
      .from('user_credits')
      .update({
        current_balance: allocation,
        monthly_allocation: allocation,
        last_reset_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (error) {
      throw error
    }

    // Log transaction
    await supabaseAdmin
      .from('credit_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'monthly_reset',
        amount: allocation,
        balance_before: 0, // Will be updated by trigger
        balance_after: allocation,
        description: 'Monthly credit reset',
        reference_type: 'system',
      })

    return true
  },

  /**
   * Get credit statistics
   */
  async getCreditStats() {
    const { data, error } = await supabaseAdmin
      .from('user_credits')
      .select(`
        current_balance,
        lifetime_earned,
        lifetime_spent
      `)

    if (error) {
      throw error
    }

    const stats = data.reduce((acc, record) => ({
      totalBalance: acc.totalBalance + record.current_balance,
      totalEarned: acc.totalEarned + record.lifetime_earned,
      totalSpent: acc.totalSpent + record.lifetime_spent,
      userCount: acc.userCount + 1,
    }), {
      totalBalance: 0,
      totalEarned: 0,
      totalSpent: 0,
      userCount: 0,
    })

    return stats
  },
}

/**
 * Gym management functions (Admin only)
 */
export const adminGyms = {
  /**
   * Create a new gym
   */
  async createGym(gymData: Database['public']['Tables']['gyms']['Insert']) {
    const { data, error } = await supabaseAdmin
      .from('gyms')
      .insert(gymData)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Update gym verification status
   */
  async updateGymVerification(gymId: string, verified: boolean) {
    const { data, error } = await supabaseAdmin
      .from('gyms')
      .update({ 
        verified,
        updated_at: new Date().toISOString()
      })
      .eq('id', gymId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Update gym featured status
   */
  async updateGymFeatured(gymId: string, featured: boolean) {
    const { data, error } = await supabaseAdmin
      .from('gyms')
      .update({ 
        featured,
        updated_at: new Date().toISOString()
      })
      .eq('id', gymId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Get gym statistics
   */
  async getGymStats() {
    const { data, error } = await supabaseAdmin
      .from('gyms')
      .select(`
        id,
        status,
        verified,
        featured,
        _count_classes:classes(count),
        _count_bookings:classes(bookings(count))
      `)

    if (error) {
      throw error
    }

    const stats = data.reduce((acc, gym) => ({
      total: acc.total + 1,
      active: acc.active + (gym.status === 'active' ? 1 : 0),
      verified: acc.verified + (gym.verified ? 1 : 0),
      featured: acc.featured + (gym.featured ? 1 : 0),
    }), {
      total: 0,
      active: 0,
      verified: 0,
      featured: 0,
    })

    return stats
  },
}

/**
 * Booking management functions (Admin only)
 */
export const adminBookings = {
  /**
   * Get all bookings with filters
   */
  async getAllBookings(filters: {
    status?: string
    gym_id?: string
    user_id?: string
    date_from?: string
    date_to?: string
    limit?: number
    offset?: number
  } = {}) {
    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        user:profiles(full_name, email),
        class:classes(
          title,
          starts_at,
          gym:gyms(name)
        )
      `)

    if (filters.status) {
      query = query.eq('booking_status', filters.status)
    }

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id)
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from)
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to)
    }

    if (filters.gym_id) {
      query = query.eq('classes.gym_id', filters.gym_id)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 50) - 1)

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data || []
  },

  /**
   * Cancel booking (admin override)
   */
  async cancelBooking(bookingId: string, reason: string, adminId?: string) {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({
        booking_status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: 'admin',
        admin_notes: `Cancelled by admin: ${reason}`,
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Get booking statistics
   */
  async getBookingStats(dateFrom?: string, dateTo?: string) {
    let query = supabaseAdmin
      .from('bookings')
      .select('booking_status, payment_status, credits_used, amount_paid, created_at')

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    const stats = data.reduce((acc, booking) => ({
      total: acc.total + 1,
      confirmed: acc.confirmed + (booking.booking_status === 'confirmed' ? 1 : 0),
      cancelled: acc.cancelled + (booking.booking_status === 'cancelled' ? 1 : 0),
      completed: acc.completed + (booking.booking_status === 'completed' ? 1 : 0),
      totalCreditsUsed: acc.totalCreditsUsed + (booking.credits_used || 0),
      totalRevenue: acc.totalRevenue + (booking.amount_paid || 0),
    }), {
      total: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
      totalCreditsUsed: 0,
      totalRevenue: 0,
    })

    return stats
  },
}

/**
 * Review management functions (Admin only)
 */
export const adminReviews = {
  /**
   * Get all reviews for moderation
   */
  async getAllReviews(status?: 'pending' | 'approved' | 'rejected' | 'flagged') {
    let query = supabaseAdmin
      .from('gym_reviews')
      .select(`
        *,
        user:profiles(full_name, email),
        gym:gyms(name)
      `)

    if (status) {
      query = query.eq('review_status', status)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data || []
  },

  /**
   * Approve review
   */
  async approveReview(reviewId: string, moderatorNotes?: string) {
    const { data, error } = await supabaseAdmin
      .from('gym_reviews')
      .update({
        review_status: 'approved',
        moderator_notes: moderatorNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Reject review
   */
  async rejectReview(reviewId: string, moderatorNotes: string) {
    const { data, error } = await supabaseAdmin
      .from('gym_reviews')
      .update({
        review_status: 'rejected',
        moderator_notes: moderatorNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Flag review for further review
   */
  async flagReview(reviewId: string, reason: string) {
    const { data, error } = await supabaseAdmin
      .from('gym_reviews')
      .update({
        review_status: 'flagged',
        moderator_notes: `Flagged: ${reason}`,
        reported_count: supabaseAdmin.raw('reported_count + 1'),
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },
}

/**
 * System management functions (Admin only)
 */
export const adminSystem = {
  /**
   * Run monthly credit reset for all users
   */
  async runMonthlyReset() {
    // Get all active users with credit allocations
    const { data: profiles, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id, monthly_credits')
      .eq('status', 'active')
      .gt('monthly_credits', 0)

    if (fetchError) {
      throw fetchError
    }

    const results = []

    for (const profile of profiles) {
      try {
        await adminCredits.resetMonthlyCredits(profile.id)
        results.push({ userId: profile.id, success: true })
      } catch (error) {
        results.push({ userId: profile.id, success: false, error: error.message })
      }
    }

    return results
  },

  /**
   * Get system statistics dashboard
   */
  async getDashboardStats() {
    const [creditStats, gymStats, bookingStats] = await Promise.all([
      adminCredits.getCreditStats(),
      adminGyms.getGymStats(),
      adminBookings.getBookingStats(),
    ])

    // Get user count by role
    const { data: userRoles, error: roleError } = await supabaseAdmin
      .from('profiles')
      .select('role, status')

    if (roleError) {
      throw roleError
    }

    const roleStats = userRoles.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      acc[`${user.status}_users`] = (acc[`${user.status}_users`] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      users: roleStats,
      credits: creditStats,
      gyms: gymStats,
      bookings: bookingStats,
    }
  },

  /**
   * Execute custom SQL query (be very careful!)
   */
  async executeQuery(sql: string) {
    const { data, error } = await supabaseAdmin.rpc('execute_sql', { sql_query: sql })

    if (error) {
      throw error
    }

    return data
  },
}

/**
 * Utility functions for admin operations
 */
export const adminUtils = {
  /**
   * Send admin notification email
   */
  async sendNotification(to: string[], subject: string, message: string) {
    // This would integrate with your email service
    // For now, just log the notification
    console.log('Admin Notification:', { to, subject, message })
    return true
  },

  /**
   * Log admin action
   */
  async logAction(adminId: string, action: string, details: Record<string, any>) {
    // This would log to an admin audit trail table
    console.log('Admin Action:', { adminId, action, details, timestamp: new Date().toISOString() })
    return true
  },

  /**
   * Validate admin permissions
   */
  async validateAdminAccess(userId: string) {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error || profile.role !== 'admin') {
      throw new Error('Access denied: Admin permissions required')
    }

    return true
  },
}