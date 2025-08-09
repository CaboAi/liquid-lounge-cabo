/**
 * Supabase Server-Side Client for Next.js App Router
 * Used for Server Components and API Routes
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'
import type { Database } from '@/types/database.types'

/**
 * Creates a Supabase client for Server Components
 * Automatically handles authentication state from cookies
 */
export const createClient = cache(() => {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  )
})

/**
 * Creates a Supabase client for API Routes
 * Handles cookie management for authentication
 */
export function createRouteHandlerClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    },
  )
}

/**
 * Creates a Supabase admin client for server-side operations
 * Uses the service role key for elevated permissions
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    },
  )
}

/**
 * Get the current user from server context
 * Returns null if not authenticated
 */
export async function getUser() {
  const supabase = createClient()
  
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user
  } catch {
    return null
  }
}

/**
 * Get the current user's profile
 * Returns null if not authenticated or profile not found
 */
export async function getUserProfile() {
  const supabase = createClient()
  const user = await getUser()

  if (!user) {
    return null
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return profile
  } catch {
    return null
  }
}

/**
 * Get user's credit balance
 * Returns null if not authenticated or credits not found
 */
export async function getUserCredits() {
  const supabase = createClient()
  const user = await getUser()

  if (!user) {
    return null
  }

  try {
    const { data: credits, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user credits:', error)
      return null
    }

    return credits
  } catch {
    return null
  }
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin() {
  const profile = await getUserProfile()
  return profile?.role === 'admin'
}

/**
 * Check if the current user has access to a specific gym
 */
export async function hasGymAccess(gymId: string) {
  const user = await getUser()
  const profile = await getUserProfile()

  if (!user || !profile) {
    return false
  }

  // Admins have access to all gyms
  if (profile.role === 'admin') {
    return true
  }

  // Check if user is staff at this gym
  const supabase = createClient()
  const { data: staffRecord } = await supabase
    .from('gym_staff')
    .select('id')
    .eq('profile_id', user.id)
    .eq('gym_id', gymId)
    .eq('active', true)
    .single()

  return !!staffRecord
}

/**
 * Server action to create a new booking
 */
export async function createBooking(bookingData: {
  class_id: string
  credits_used: number
  payment_method: string
  special_requests?: string
}) {
  const user = await getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const supabase = createClient()

  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        class_id: bookingData.class_id,
        credits_used: bookingData.credits_used,
        payment_method: bookingData.payment_method as any,
        special_requests: bookingData.special_requests,
        booking_status: 'pending',
        payment_status: bookingData.credits_used > 0 ? 'completed' : 'pending',
        booking_source: 'app',
        confirmation_code: generateConfirmationCode(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return booking
  } catch (error) {
    console.error('Error creating booking:', error)
    throw new Error('Failed to create booking')
  }
}

/**
 * Generate a unique confirmation code
 */
function generateConfirmationCode(): string {
  return Math.random().toString(36).substr(2, 8).toUpperCase()
}

/**
 * Server action to cancel a booking
 */
export async function cancelBooking(bookingId: string, reason?: string) {
  const user = await getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const supabase = createClient()

  try {
    // Check if user owns this booking
    const { data: existingBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, class:classes(starts_at)')
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingBooking) {
      throw new Error('Booking not found')
    }

    // Check if it's a late cancellation
    const classStartTime = new Date(existingBooking.class.starts_at)
    const now = new Date()
    const hoursUntilClass = (classStartTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    const isLateCancellation = hoursUntilClass < 24 // Less than 24 hours

    const { data: booking, error } = await supabase
      .from('bookings')
      .update({
        booking_status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason as any || 'user_request',
        late_cancellation: isLateCancellation,
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return booking
  } catch (error) {
    console.error('Error cancelling booking:', error)
    throw new Error('Failed to cancel booking')
  }
}

/**
 * Get upcoming classes for a gym
 */
export async function getUpcomingClasses(gymId?: string, limit: number = 20) {
  const supabase = createClient()

  try {
    let query = supabase
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

    if (gymId) {
      query = query.eq('gym_id', gymId)
    }

    const { data: classes, error } = await query

    if (error) {
      throw error
    }

    return classes || []
  } catch (error) {
    console.error('Error fetching upcoming classes:', error)
    return []
  }
}

/**
 * Get user's booking history
 */
export async function getUserBookings(limit: number = 50) {
  const user = await getUser()
  if (!user) {
    return []
  }

  const supabase = createClient()

  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        class:classes(
          *,
          gym:gyms(name)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return bookings || []
  } catch (error) {
    console.error('Error fetching user bookings:', error)
    return []
  }
}

/**
 * Search classes with filters
 */
export async function searchClasses(filters: {
  query?: string
  gym_id?: string
  category_id?: string
  difficulty_level?: string
  date_from?: string
  date_to?: string
  available_spots?: boolean
}) {
  const supabase = createClient()

  try {
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

    query = query.order('starts_at', { ascending: true })

    const { data: classes, error } = await query

    if (error) {
      throw error
    }

    return classes || []
  } catch (error) {
    console.error('Error searching classes:', error)
    return []
  }
}