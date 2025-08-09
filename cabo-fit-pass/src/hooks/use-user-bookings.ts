'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useAuth } from './use-auth'
import { bookingManager } from '@/lib/bookings'
import type { Database, Booking, FitnessClass, Gym } from '@/types/database.types'

interface BookingWithDetails extends Booking {
  fitness_class?: FitnessClass & {
    gym?: Gym
  }
  canCancel: boolean
  canReschedule: boolean
  canCheckIn: boolean
  timeUntilClass: number // in milliseconds
  status_display: string
}

interface BookingStats {
  totalBookings: number
  confirmedBookings: number
  cancelledBookings: number
  attendedClasses: number
  noShowCount: number
  creditsSpent: number
  favoriteCategories: string[]
  attendanceRate: number
}

interface UseUserBookingsOptions {
  includeHistory?: boolean
  enableRealTime?: boolean
  statusFilter?: ('confirmed' | 'cancelled' | 'waitlisted' | 'attended')[]
  limit?: number
}

export function useUserBookings(options: UseUserBookingsOptions = {}) {
  const { 
    includeHistory = false, 
    enableRealTime = true, 
    statusFilter,
    limit = 50 
  } = options
  const { user } = useAuth()
  
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [stats, setStats] = useState<BookingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Load user bookings
  const loadBookings = useCallback(async (showLoading = true) => {
    if (!user?.id) {
      setBookings([])
      setStats(null)
      setLoading(false)
      return
    }

    try {
      if (showLoading) setLoading(true)
      setError(null)

      // Get bookings with class and gym details
      let query = supabase
        .from('bookings')
        .select(`
          *,
          fitness_class:fitness_classes(
            *,
            gym:gyms(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!includeHistory) {
        // Only show future classes and recent past classes (last 7 days)
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        
        query = query.or(`fitness_classes.start_time.gte.${new Date().toISOString()},fitness_classes.start_time.gte.${oneWeekAgo.toISOString()}`)
      }

      if (statusFilter && statusFilter.length > 0) {
        query = query.in('status', statusFilter)
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Process bookings with additional data
      const processedBookings: BookingWithDetails[] = (data || []).map(booking => {
        const classTime = booking.fitness_class ? new Date(booking.fitness_class.start_time) : null
        const now = new Date()
        const timeUntilClass = classTime ? classTime.getTime() - now.getTime() : 0
        const hoursUntilClass = timeUntilClass / (1000 * 60 * 60)

        // Determine what actions are available
        const canCancel = booking.status === 'confirmed' && 
                         timeUntilClass > 2 * 60 * 60 * 1000 && // 2 hours before
                         classTime && classTime > now

        const canReschedule = booking.status === 'confirmed' && 
                             timeUntilClass > 24 * 60 * 60 * 1000 && // 24 hours before
                             classTime && classTime > now

        const canCheckIn = booking.status === 'confirmed' &&
                          timeUntilClass > -30 * 60 * 1000 && // 30 minutes after start
                          timeUntilClass < 30 * 60 * 1000 && // 30 minutes before start
                          !booking.attended

        // Status display
        let statusDisplay = booking.status
        if (booking.attended) {
          statusDisplay = 'attended'
        } else if (booking.status === 'confirmed' && classTime && classTime < now && !booking.attended) {
          statusDisplay = 'no-show'
        }

        return {
          ...booking,
          canCancel,
          canReschedule,
          canCheckIn,
          timeUntilClass,
          status_display: statusDisplay
        }
      })

      setBookings(processedBookings)

      // Calculate stats
      if (user.id) {
        const bookingStats = await bookingManager.getUserBookingStats(user.id)
        
        // Additional stats calculations
        const categories = processedBookings
          .filter(b => b.fitness_class?.category && (b.status === 'confirmed' || b.attended))
          .map(b => b.fitness_class!.category)

        const categoryCount: Record<string, number> = {}
        categories.forEach(cat => {
          if (cat) categoryCount[cat] = (categoryCount[cat] || 0) + 1
        })

        const favoriteCategories = Object.entries(categoryCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([category]) => category)

        const confirmedCount = processedBookings.filter(b => b.status === 'confirmed').length
        const attendedCount = processedBookings.filter(b => b.attended).length
        const attendanceRate = confirmedCount > 0 ? (attendedCount / confirmedCount) * 100 : 0

        const enhancedStats: BookingStats = {
          ...bookingStats,
          favoriteCategories,
          attendanceRate: Math.round(attendanceRate)
        }

        setStats(enhancedStats)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load bookings'
      setError(errorMessage)
      console.error('Error loading bookings:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.id, includeHistory, statusFilter, limit, supabase])

  // Refresh bookings
  const refresh = useCallback(async () => {
    setRefreshing(true)
    await loadBookings(false)
  }, [loadBookings])

  // Book a class
  const bookClass = useCallback(async (
    classId: string,
    options: {
      acceptWaitlist?: boolean
      agreeToPolicy?: boolean
      emergencyContact?: string
    } = {}
  ) => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      const result = await bookingManager.bookClass(user.id, classId, {
        acceptWaitlist: options.acceptWaitlist || false,
        agreeToPolicy: options.agreeToPolicy || true,
        emergencyContact: options.emergencyContact
      })

      // Refresh bookings to show new booking
      await refresh()

      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book class')
      throw err
    }
  }, [user?.id, refresh])

  // Cancel booking
  const cancelBooking = useCallback(async (bookingId: string) => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      const result = await bookingManager.cancelBooking(bookingId, user.id)

      // Update local state
      setBookings(prev => prev.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: 'cancelled', canCancel: false, canReschedule: false }
          : booking
      ))

      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking')
      throw err
    }
  }, [user?.id])

  // Reschedule booking
  const rescheduleBooking = useCallback(async (bookingId: string, newClassId: string) => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      const result = await bookingManager.rescheduleBooking(bookingId, newClassId, user.id)

      // Refresh bookings to show updated booking
      await refresh()

      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reschedule booking')
      throw err
    }
  }, [user?.id, refresh])

  // Check in to class
  const checkIn = useCallback(async (
    bookingId: string,
    location?: { lat: number; lng: number }
  ) => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      const result = await bookingManager.checkIn(bookingId, user.id, location)

      // Update local state
      setBookings(prev => prev.map(booking =>
        booking.id === bookingId
          ? { ...booking, attended: true, status_display: 'attended', canCheckIn: false }
          : booking
      ))

      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in')
      throw err
    }
  }, [user?.id])

  // Get booking by ID
  const getBooking = useCallback((bookingId: string) => {
    return bookings.find(booking => booking.id === bookingId)
  }, [bookings])

  // Computed values
  const upcomingBookings = useMemo(() => {
    const now = new Date()
    return bookings
      .filter(b => 
        b.fitness_class && 
        new Date(b.fitness_class.start_time) > now &&
        ['confirmed', 'waitlisted'].includes(b.status)
      )
      .sort((a, b) => {
        const timeA = a.fitness_class ? new Date(a.fitness_class.start_time).getTime() : 0
        const timeB = b.fitness_class ? new Date(b.fitness_class.start_time).getTime() : 0
        return timeA - timeB
      })
  }, [bookings])

  const pastBookings = useMemo(() => {
    const now = new Date()
    return bookings
      .filter(b => 
        b.fitness_class && 
        new Date(b.fitness_class.start_time) <= now
      )
      .sort((a, b) => {
        const timeA = a.fitness_class ? new Date(a.fitness_class.start_time).getTime() : 0
        const timeB = b.fitness_class ? new Date(b.fitness_class.start_time).getTime() : 0
        return timeB - timeA
      })
  }, [bookings])

  const cancelledBookings = useMemo(() => {
    return bookings.filter(b => b.status === 'cancelled')
  }, [bookings])

  const waitlistedBookings = useMemo(() => {
    return bookings.filter(b => b.status === 'waitlisted')
  }, [bookings])

  const nextClass = useMemo(() => {
    return upcomingBookings[0] || null
  }, [upcomingBookings])

  const checkInAvailable = useMemo(() => {
    return bookings.filter(b => b.canCheckIn)
  }, [bookings])

  // Initialize
  useEffect(() => {
    if (user?.id) {
      loadBookings()
    } else {
      setBookings([])
      setStats(null)
      setLoading(false)
    }
  }, [user?.id, loadBookings])

  // Real-time subscriptions
  useEffect(() => {
    if (!enableRealTime || !user?.id) return

    const subscription = supabase
      .channel(`user_bookings:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          refresh()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [enableRealTime, user?.id, refresh, supabase])

  return {
    // Data
    bookings,
    upcomingBookings,
    pastBookings,
    cancelledBookings,
    waitlistedBookings,
    nextClass,
    checkInAvailable,
    stats,
    
    // State
    loading,
    refreshing,
    error,
    
    // Actions
    bookClass,
    cancelBooking,
    rescheduleBooking,
    checkIn,
    refresh,
    loadBookings,
    
    // Utilities
    getBooking,
    
    // Computed values
    totalBookings: bookings.length,
    upcomingCount: upcomingBookings.length,
    pastCount: pastBookings.length,
    cancelledCount: cancelledBookings.length,
    waitlistCount: waitlistedBookings.length,
    isEmpty: !loading && bookings.length === 0,
  }
}