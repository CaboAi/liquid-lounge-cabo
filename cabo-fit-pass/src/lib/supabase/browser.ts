/**
 * Supabase Client-Side Client for Next.js App Router
 * Used for Client Components and browser interactions
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

/**
 * Creates a Supabase client for Client Components
 * This client will handle authentication state on the client side
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Singleton instance for browser client
 * Use this in Client Components
 */
const supabase = createClient()
export default supabase

/**
 * Authentication helper functions
 */
export const auth = {
  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider: 'google' | 'facebook' | 'apple', redirectTo?: string) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Sign out current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }
  },

  /**
   * Reset password
   */
  async resetPassword(email: string, redirectTo?: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Update password
   */
  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Get current user
   */
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      throw error
    }

    return user
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      throw error
    }

    return session
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },
}

/**
 * Profile management functions
 */
export const profiles = {
  /**
   * Get user profile
   */
  async get(userId?: string) {
    const user = userId || (await auth.getUser())?.id

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user)
      .single()

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Update user profile
   */
  async update(updates: Partial<Database['public']['Tables']['profiles']['Update']>) {
    const user = await auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Upload and update avatar
   */
  async updateAvatar(file: File) {
    const user = await auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Upload file to storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
      })

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // Update profile with new avatar URL
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: data.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return profile
  },
}

/**
 * Credit management functions
 */
export const credits = {
  /**
   * Get user credits
   */
  async get(userId?: string) {
    const user = userId || (await auth.getUser())?.id

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user)
      .single()

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Get credit transaction history
   */
  async getTransactions(limit: number = 50) {
    const user = await auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data || []
  },
}

/**
 * Booking management functions
 */
export const bookings = {
  /**
   * Create a new booking
   */
  async create(bookingData: {
    class_id: string
    credits_used: number
    payment_method: Database['public']['Enums']['payment_method']
    special_requests?: string
  }) {
    const user = await auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        class_id: bookingData.class_id,
        credits_used: bookingData.credits_used,
        payment_method: bookingData.payment_method,
        special_requests: bookingData.special_requests,
        booking_status: 'pending',
        payment_status: bookingData.credits_used > 0 ? 'completed' : 'pending',
        booking_source: 'app',
        confirmation_code: Math.random().toString(36).substr(2, 8).toUpperCase(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Get user bookings
   */
  async getUserBookings(limit: number = 50) {
    const user = await auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        class:classes(
          *,
          gym:gyms(name, location)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data || []
  },

  /**
   * Cancel a booking
   */
  async cancel(bookingId: string, reason?: string) {
    const user = await auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({
        booking_status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason as any || 'user_request',
      })
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Join waitlist for a class
   */
  async joinWaitlist(classId: string) {
    const user = await auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('class_waitlist')
      .insert({
        class_id: classId,
        user_id: user.id,
        auto_book: true,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Leave waitlist
   */
  async leaveWaitlist(classId: string) {
    const user = await auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from('class_waitlist')
      .delete()
      .eq('class_id', classId)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }
  },
}

/**
 * Class management functions
 */
export const classes = {
  /**
   * Get all classes with filters
   */
  async search(filters: {
    query?: string
    gym_id?: string
    category_id?: string
    difficulty_level?: string
    date_from?: string
    date_to?: string
    available_spots?: boolean
    limit?: number
  } = {}) {
    let query = supabase
      .from('classes')
      .select(`
        *,
        gym:gyms(*),
        instructor:gym_staff(*),
        categories:class_category_assignments(
          category:class_categories(*)
        )
      `)
      .eq('class_status', 'scheduled')
      .gte('starts_at', new Date().toISOString())

    if (filters.query) {
      query = query.ilike('title', `%${filters.query}%`)
    }

    if (filters.gym_id) {
      query = query.eq('gym_id', filters.gym_id)
    }

    if (filters.difficulty_level) {
      query = query.eq('difficulty_level', filters.difficulty_level)
    }

    if (filters.date_from) {
      query = query.gte('starts_at', filters.date_from)
    }

    if (filters.date_to) {
      query = query.lte('starts_at', filters.date_to)
    }

    if (filters.available_spots) {
      query = query.lt('current_bookings', supabase.raw('max_capacity'))
    }

    query = query
      .order('starts_at', { ascending: true })
      .limit(filters.limit || 50)

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data || []
  },

  /**
   * Get class by ID
   */
  async getById(classId: string) {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        gym:gyms(*),
        instructor:gym_staff(*),
        categories:class_category_assignments(
          category:class_categories(*)
        )
      `)
      .eq('id', classId)
      .single()

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Get upcoming classes
   */
  async getUpcoming(limit: number = 20) {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        gym:gyms(*),
        instructor:gym_staff(*)
      `)
      .eq('class_status', 'scheduled')
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(limit)

    if (error) {
      throw error
    }

    return data || []
  },
}

/**
 * Gym management functions
 */
export const gyms = {
  /**
   * Get all gyms
   */
  async getAll() {
    const { data, error } = await supabase
      .from('gyms')
      .select(`
        *,
        amenities:gym_amenities(*),
        operating_hours:gym_operating_hours(*)
      `)
      .eq('status', 'active')
      .order('name', { ascending: true })

    if (error) {
      throw error
    }

    return data || []
  },

  /**
   * Get gym by ID
   */
  async getById(gymId: string) {
    const { data, error } = await supabase
      .from('gyms')
      .select(`
        *,
        amenities:gym_amenities(*),
        images:gym_images(*),
        operating_hours:gym_operating_hours(*),
        staff:gym_staff(*)
      `)
      .eq('id', gymId)
      .single()

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Search gyms
   */
  async search(filters: {
    query?: string
    city?: string
    featured?: boolean
    verified?: boolean
    limit?: number
  } = {}) {
    let query = supabase
      .from('gyms')
      .select(`
        *,
        amenities:gym_amenities(*)
      `)
      .eq('status', 'active')

    if (filters.query) {
      query = query.ilike('name', `%${filters.query}%`)
    }

    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`)
    }

    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured)
    }

    if (filters.verified !== undefined) {
      query = query.eq('verified', filters.verified)
    }

    query = query
      .order('featured', { ascending: false })
      .order('name', { ascending: true })
      .limit(filters.limit || 50)

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data || []
  },
}

/**
 * Review management functions
 */
export const reviews = {
  /**
   * Create a gym review
   */
  async create(reviewData: {
    gym_id: string
    rating: number
    title?: string
    review_text?: string
    pros?: string[]
    cons?: string[]
    would_recommend?: boolean
    visited_date?: string
  }) {
    const user = await auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('gym_reviews')
      .insert({
        ...reviewData,
        user_id: user.id,
        review_status: 'pending',
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  /**
   * Get reviews for a gym
   */
  async getByGym(gymId: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('gym_reviews')
      .select(`
        *,
        user:profiles(full_name, avatar_url)
      `)
      .eq('gym_id', gymId)
      .eq('review_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data || []
  },

  /**
   * Get user's reviews
   */
  async getUserReviews() {
    const user = await auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('gym_reviews')
      .select(`
        *,
        gym:gyms(name, logo_url)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  },
}

/**
 * Real-time subscriptions
 */
export const realtime = {
  /**
   * Subscribe to user's booking changes
   */
  subscribeToUserBookings(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('user-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe()
  },

  /**
   * Subscribe to class booking count changes
   */
  subscribeToClassBookings(classId: string, callback: (payload: any) => void) {
    return supabase
      .channel('class-bookings')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'classes',
          filter: `id=eq.${classId}`,
        },
        callback
      )
      .subscribe()
  },

  /**
   * Subscribe to user credit changes
   */
  subscribeToUserCredits(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('user-credits')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_credits',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe()
  },
}

/**
 * Utility functions
 */
export const utils = {
  /**
   * Format Supabase error message
   */
  formatError(error: any): string {
    if (error?.message) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return 'An unexpected error occurred'
  },

  /**
   * Check if user has sufficient credits
   */
  async canAffordClass(classId: string): Promise<boolean> {
    try {
      const [userCredits, classData] = await Promise.all([
        credits.get(),
        classes.getById(classId)
      ])

      return userCredits.current_balance >= classData.credit_cost
    } catch {
      return false
    }
  },

  /**
   * Get class availability status
   */
  getClassAvailability(classData: Database['public']['Tables']['classes']['Row']): {
    available: boolean
    spotsLeft: number
    waitlistLength: number
  } {
    const spotsLeft = classData.max_capacity - classData.current_bookings
    
    return {
      available: spotsLeft > 0,
      spotsLeft: Math.max(0, spotsLeft),
      waitlistLength: classData.waitlist_count
    }
  },
}