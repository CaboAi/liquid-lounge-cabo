'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './use-auth'
import { useCredits } from './use-credits'
import { bookingManager } from '@/lib/bookings'
import type { Booking, FitnessClass } from '@/types/database.types'

interface UseBookingsOptions {
  enableRealTime?: boolean
  autoRefresh?: boolean
  includeHistory?: boolean
}

interface BookingWithClass extends Booking {
  fitness_class?: FitnessClass
}

export function useBookings(options: UseBookingsOptions = {}) {
  const { enableRealTime = true, autoRefresh = true, includeHistory = false } = options
  const { user } = useAuth()
  const { spendCredits, addCredits } = useCredits()
  
  const [bookings, setBookings] = useState<BookingWithClass[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<BookingWithClass[]>([])
  const [pastBookings, setPastBookings] = useState<BookingWithClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user bookings
  const loadBookings = useCallback(async () => {
    if (!user?.id) {
      setBookings([])
      setUpcomingBookings([])
      setPastBookings([])
      setLoading(false)
      return
    }

    try {
      setError(null)
      const userBookings = await bookingManager.getUserBookings(user.id, includeHistory)
      
      const now = new Date()
      const upcoming = userBookings.filter(booking => 
        booking.fitness_class && new Date(booking.fitness_class.start_time) > now
      )
      const past = userBookings.filter(booking =>
        booking.fitness_class && new Date(booking.fitness_class.start_time) <= now
      )

      setBookings(userBookings)
      setUpcomingBookings(upcoming)
      setPastBookings(past)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings')
      console.error('Error loading bookings:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id, includeHistory])

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
      setLoading(true)
      const result = await bookingManager.bookClass(user.id, classId, options)
      
      // Spend credits if booking was confirmed (not waitlisted)
      if (result.booking.status === 'confirmed' && result.fitnessClass) {
        await spendCredits(
          result.fitnessClass.credits_required,
          `Booked: ${result.fitnessClass.name}`,
          classId
        )
      }

      // Refresh bookings
      await loadBookings()
      
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book class')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.id, spendCredits, loadBookings])

  // Cancel a booking
  const cancelBooking = useCallback(async (bookingId: string) => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setLoading(true)
      const result = await bookingManager.cancelBooking(bookingId, user.id)
      
      // Refund credits if applicable
      if (result.refundAmount > 0 && result.fitnessClass) {
        await addCredits(
          result.refundAmount,
          `Refund: ${result.fitnessClass.name}`,
          'refund'
        )
      }

      // Refresh bookings
      await loadBookings()
      
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.id, addCredits, loadBookings])

  // Reschedule a booking
  const rescheduleBooking = useCallback(async (bookingId: string, newClassId: string) => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setLoading(true)
      const result = await bookingManager.rescheduleBooking(bookingId, newClassId, user.id)
      
      // Handle credit difference if any
      if (result.creditDifference > 0) {
        await spendCredits(
          result.creditDifference,
          `Additional credits for rescheduling`,
          newClassId
        )
      } else if (result.creditDifference < 0) {
        await addCredits(
          Math.abs(result.creditDifference),
          `Credit refund for rescheduling`,
          'refund'
        )
      }

      // Refresh bookings
      await loadBookings()
      
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reschedule booking')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.id, spendCredits, addCredits, loadBookings])

  // Join waitlist
  const joinWaitlist = useCallback(async (classId: string) => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      const result = await bookingManager.joinWaitlist(user.id, classId)
      await loadBookings()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join waitlist')
      throw err
    }
  }, [user?.id, loadBookings])

  // Leave waitlist
  const leaveWaitlist = useCallback(async (bookingId: string) => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      const result = await bookingManager.leaveWaitlist(bookingId, user.id)
      await loadBookings()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave waitlist')
      throw err
    }
  }, [user?.id, loadBookings])

  // Check in to a class
  const checkIn = useCallback(async (bookingId: string, location?: { lat: number; lng: number }) => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      const result = await bookingManager.checkIn(bookingId, user.id, location)
      await loadBookings()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in')
      throw err
    }
  }, [user?.id, loadBookings])

  // Get booking by ID
  const getBooking = useCallback(async (bookingId: string) => {
    return bookingManager.getBookingById(bookingId)
  }, [])

  // Get booking statistics
  const getBookingStats = useCallback(() => {
    if (!bookings.length) return null

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const thisMonthBookings = bookings.filter(booking =>
      booking.fitness_class && 
      new Date(booking.fitness_class.start_time) >= thisMonth &&
      new Date(booking.fitness_class.start_time) < now
    )

    const lastMonthBookings = bookings.filter(booking =>
      booking.fitness_class &&
      new Date(booking.fitness_class.start_time) >= lastMonth &&
      new Date(booking.fitness_class.start_time) < thisMonth
    )

    const attendedClasses = pastBookings.filter(b => b.attended).length
    const missedClasses = pastBookings.filter(b => !b.attended && b.status === 'confirmed').length
    const attendanceRate = pastBookings.length > 0 ? (attendedClasses / pastBookings.length) * 100 : 0

    return {
      totalBookings: bookings.length,
      upcomingCount: upcomingBookings.length,
      pastCount: pastBookings.length,
      thisMonthCount: thisMonthBookings.length,
      lastMonthCount: lastMonthBookings.length,
      attendedCount: attendedClasses,
      missedCount: missedClasses,
      attendanceRate: Math.round(attendanceRate),
      confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
      waitlistedBookings: bookings.filter(b => b.status === 'waitlisted').length,
      cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
    }
  }, [bookings, upcomingBookings, pastBookings])

  // Initialize data loading
  useEffect(() => {
    if (user?.id) {
      loadBookings()
    }
  }, [user?.id, loadBookings])

  // Set up real-time subscription
  useEffect(() => {
    if (!enableRealTime || !user?.id) return

    const subscription = bookingManager.subscribeToUserBookings(user.id, () => {
      loadBookings() // Reload bookings when changes occur
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [enableRealTime, user?.id, loadBookings])

  // Auto-refresh periodically
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadBookings()
    }, 60000) // Refresh every minute

    return () => clearInterval(interval)
  }, [autoRefresh, loadBookings])

  return {
    // State
    bookings,
    upcomingBookings,
    pastBookings,
    loading,
    error,
    
    // Actions
    bookClass,
    cancelBooking,
    rescheduleBooking,
    joinWaitlist,
    leaveWaitlist,
    checkIn,
    loadBookings,
    
    // Utilities
    getBooking,
    getBookingStats,
    
    // Computed values
    hasUpcomingBookings: upcomingBookings.length > 0,
    nextBooking: upcomingBookings[0] || null,
  }
}

// Specialized hook for class availability checking
export function useClassAvailability(classId?: string) {
  const [availability, setAvailability] = useState<{
    available: boolean
    spotsLeft: number
    waitlistCount: number
    loading: boolean
  }>({
    available: false,
    spotsLeft: 0,
    waitlistCount: 0,
    loading: true
  })

  const checkAvailability = useCallback(async (id: string) => {
    try {
      const result = await bookingManager.checkClassAvailability(id)
      setAvailability({
        available: result.spotsLeft > 0,
        spotsLeft: result.spotsLeft,
        waitlistCount: result.waitlistCount,
        loading: false
      })
      return result
    } catch (error) {
      console.error('Error checking availability:', error)
      setAvailability(prev => ({ ...prev, loading: false }))
    }
  }, [])

  useEffect(() => {
    if (classId) {
      checkAvailability(classId)
    }
  }, [classId, checkAvailability])

  return {
    ...availability,
    checkAvailability
  }
}