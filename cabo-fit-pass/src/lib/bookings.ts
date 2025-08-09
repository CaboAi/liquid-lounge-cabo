import { createClient } from '@supabase/supabase-js'
import type { Database, Booking, FitnessClass } from '@/types/database.types'

interface BookingWithClass extends Booking {
  fitness_class?: FitnessClass
}

interface BookingOptions {
  acceptWaitlist?: boolean
  agreeToPolicy?: boolean
  emergencyContact?: string
}

interface BookingResult {
  booking: Booking
  fitnessClass: FitnessClass | null
  isWaitlisted: boolean
  message: string
}

export class BookingManager {
  private supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get user bookings with class details
  async getUserBookings(userId: string, includeHistory = false): Promise<BookingWithClass[]> {
    let query = this.supabase
      .from('bookings')
      .select(`
        *,
        fitness_class:fitness_classes(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!includeHistory) {
      // Only get future and recent past bookings
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - 7) // Last 7 days
      query = query.gte('fitness_classes.start_time', cutoffDate.toISOString())
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  // Get booking by ID
  async getBookingById(bookingId: string): Promise<BookingWithClass | null> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        fitness_class:fitness_classes(*)
      `)
      .eq('id', bookingId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  }

  // Check class availability
  async checkClassAvailability(classId: string) {
    const { data: fitnessClass, error: classError } = await this.supabase
      .from('fitness_classes')
      .select('*')
      .eq('id', classId)
      .single()

    if (classError) throw classError
    if (!fitnessClass) throw new Error('Class not found')

    const { data: bookings, error: bookingsError } = await this.supabase
      .from('bookings')
      .select('id, status')
      .eq('class_id', classId)
      .in('status', ['confirmed', 'waitlisted'])

    if (bookingsError) throw bookingsError

    const confirmedCount = bookings?.filter(b => b.status === 'confirmed').length || 0
    const waitlistCount = bookings?.filter(b => b.status === 'waitlisted').length || 0
    const spotsLeft = Math.max(0, fitnessClass.max_participants - confirmedCount)

    return {
      classId,
      maxParticipants: fitnessClass.max_participants,
      confirmedBookings: confirmedCount,
      spotsLeft,
      waitlistCount,
      isAvailable: spotsLeft > 0,
      isFull: spotsLeft === 0
    }
  }

  // Book a class
  async bookClass(userId: string, classId: string, options: BookingOptions = {}): Promise<BookingResult> {
    const { acceptWaitlist = false, agreeToPolicy = true, emergencyContact } = options

    if (!agreeToPolicy) {
      throw new Error('You must agree to the cancellation policy')
    }

    // Get class details
    const { data: fitnessClass, error: classError } = await this.supabase
      .from('fitness_classes')
      .select('*')
      .eq('id', classId)
      .single()

    if (classError) throw classError
    if (!fitnessClass) throw new Error('Class not found')

    // Check if class is in the future
    if (new Date(fitnessClass.start_time) <= new Date()) {
      throw new Error('Cannot book past classes')
    }

    // Check if user already has a booking for this class
    const { data: existingBooking, error: existingError } = await this.supabase
      .from('bookings')
      .select('id, status')
      .eq('user_id', userId)
      .eq('class_id', classId)
      .in('status', ['confirmed', 'waitlisted'])
      .single()

    if (existingError && existingError.code !== 'PGRST116') throw existingError
    if (existingBooking) {
      throw new Error('You already have a booking for this class')
    }

    // Check availability
    const availability = await this.checkClassAvailability(classId)
    let bookingStatus: 'confirmed' | 'waitlisted' = 'confirmed'
    let message = 'Class booked successfully!'

    if (!availability.isAvailable) {
      if (!acceptWaitlist) {
        throw new Error('Class is full and you did not accept waitlist')
      }
      bookingStatus = 'waitlisted'
      message = 'Class is full. You have been added to the waitlist.'
    }

    // Create booking
    const bookingData = {
      user_id: userId,
      class_id: classId,
      status: bookingStatus,
      booking_date: new Date().toISOString(),
      attended: false,
      metadata: {
        emergency_contact: emergencyContact,
        agreed_to_policy: agreeToPolicy,
        booking_source: 'web'
      }
    }

    const { data: booking, error: bookingError } = await this.supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single()

    if (bookingError) throw bookingError

    return {
      booking,
      fitnessClass,
      isWaitlisted: bookingStatus === 'waitlisted',
      message
    }
  }

  // Cancel a booking
  async cancelBooking(bookingId: string, userId: string) {
    // Get booking details
    const booking = await this.getBookingById(bookingId)
    if (!booking) throw new Error('Booking not found')
    if (booking.user_id !== userId) throw new Error('Unauthorized')

    const fitnessClass = booking.fitness_class
    if (!fitnessClass) throw new Error('Class not found')

    // Check cancellation policy (2 hours before class)
    const classStart = new Date(fitnessClass.start_time)
    const now = new Date()
    const hoursUntilClass = (classStart.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    let refundAmount = 0
    if (hoursUntilClass >= 2 && booking.status === 'confirmed') {
      refundAmount = fitnessClass.credits_required
    }

    // Cancel the booking
    const { error: cancelError } = await this.supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
        metadata: {
          ...booking.metadata,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: hoursUntilClass < 2 ? 'late_cancellation' : 'user_cancelled'
        }
      })
      .eq('id', bookingId)

    if (cancelError) throw cancelError

    // If there's a waitlist, promote the next person
    if (booking.status === 'confirmed') {
      await this.promoteFromWaitlist(fitnessClass.id)
    }

    return {
      cancelled: true,
      refundAmount,
      fitnessClass,
      message: refundAmount > 0 
        ? `Booking cancelled. ${refundAmount} credits have been refunded.`
        : 'Booking cancelled. No refund available due to late cancellation.'
    }
  }

  // Reschedule a booking
  async rescheduleBooking(bookingId: string, newClassId: string, userId: string) {
    const oldBooking = await this.getBookingById(bookingId)
    if (!oldBooking) throw new Error('Booking not found')
    if (oldBooking.user_id !== userId) throw new Error('Unauthorized')

    const oldClass = oldBooking.fitness_class
    if (!oldClass) throw new Error('Original class not found')

    // Get new class details
    const { data: newClass, error: newClassError } = await this.supabase
      .from('fitness_classes')
      .select('*')
      .eq('id', newClassId)
      .single()

    if (newClassError) throw newClassError
    if (!newClass) throw new Error('New class not found')

    // Check if reschedule is allowed (24 hours before original class)
    const originalClassStart = new Date(oldClass.start_time)
    const now = new Date()
    const hoursUntilOriginal = (originalClassStart.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (hoursUntilOriginal < 24) {
      throw new Error('Rescheduling is only allowed 24 hours before the original class')
    }

    // Calculate credit difference
    const creditDifference = newClass.credits_required - oldClass.credits_required

    // Check availability for new class
    const availability = await this.checkClassAvailability(newClassId)
    if (!availability.isAvailable) {
      throw new Error('New class is full')
    }

    // Cancel old booking (without refund processing since we're rescheduling)
    await this.supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
        metadata: {
          ...oldBooking.metadata,
          rescheduled_to: newClassId,
          rescheduled_at: new Date().toISOString()
        }
      })
      .eq('id', bookingId)

    // Create new booking
    const newBookingResult = await this.bookClass(userId, newClassId, {
      agreeToPolicy: true
    })

    // Promote someone from waitlist for the old class
    await this.promoteFromWaitlist(oldClass.id)

    return {
      oldBooking,
      newBooking: newBookingResult.booking,
      creditDifference,
      message: creditDifference === 0 
        ? 'Class rescheduled successfully!'
        : creditDifference > 0
        ? `Class rescheduled. ${creditDifference} additional credits required.`
        : `Class rescheduled. ${Math.abs(creditDifference)} credits have been refunded.`
    }
  }

  // Join waitlist
  async joinWaitlist(userId: string, classId: string) {
    const availability = await this.checkClassAvailability(classId)
    if (availability.isAvailable) {
      throw new Error('Class has available spots. Book directly instead.')
    }

    return this.bookClass(userId, classId, { acceptWaitlist: true })
  }

  // Leave waitlist
  async leaveWaitlist(bookingId: string, userId: string) {
    const booking = await this.getBookingById(bookingId)
    if (!booking) throw new Error('Booking not found')
    if (booking.user_id !== userId) throw new Error('Unauthorized')
    if (booking.status !== 'waitlisted') throw new Error('Not on waitlist')

    const { error } = await this.supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
        metadata: {
          ...booking.metadata,
          left_waitlist_at: new Date().toISOString()
        }
      })
      .eq('id', bookingId)

    if (error) throw error

    return {
      success: true,
      message: 'Removed from waitlist'
    }
  }

  // Check in to a class
  async checkIn(bookingId: string, userId: string, location?: { lat: number; lng: number }) {
    const booking = await this.getBookingById(bookingId)
    if (!booking) throw new Error('Booking not found')
    if (booking.user_id !== userId) throw new Error('Unauthorized')
    if (booking.status !== 'confirmed') throw new Error('Booking not confirmed')

    const fitnessClass = booking.fitness_class
    if (!fitnessClass) throw new Error('Class not found')

    // Check if class is happening now (30 minutes before to 30 minutes after start)
    const classStart = new Date(fitnessClass.start_time)
    const now = new Date()
    const timeDiff = now.getTime() - classStart.getTime()
    const minutesDiff = timeDiff / (1000 * 60)

    if (minutesDiff < -30 || minutesDiff > 30) {
      throw new Error('Check-in is only available 30 minutes before to 30 minutes after class start')
    }

    const { error } = await this.supabase
      .from('bookings')
      .update({
        attended: true,
        updated_at: new Date().toISOString(),
        metadata: {
          ...booking.metadata,
          checked_in_at: new Date().toISOString(),
          check_in_location: location
        }
      })
      .eq('id', bookingId)

    if (error) throw error

    return {
      success: true,
      message: 'Checked in successfully!',
      checkedInAt: new Date().toISOString()
    }
  }

  // Promote next person from waitlist
  private async promoteFromWaitlist(classId: string) {
    // Get next person on waitlist
    const { data: waitlistBooking, error: waitlistError } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('class_id', classId)
      .eq('status', 'waitlisted')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (waitlistError && waitlistError.code !== 'PGRST116') {
      console.error('Error getting waitlist:', waitlistError)
      return
    }

    if (waitlistBooking) {
      // Check if there's actually a spot available
      const availability = await this.checkClassAvailability(classId)
      
      if (availability.isAvailable) {
        // Promote to confirmed
        await this.supabase
          .from('bookings')
          .update({
            status: 'confirmed',
            updated_at: new Date().toISOString(),
            metadata: {
              ...waitlistBooking.metadata,
              promoted_from_waitlist_at: new Date().toISOString()
            }
          })
          .eq('id', waitlistBooking.id)

        // TODO: Send notification to user about waitlist promotion
        console.log(`User ${waitlistBooking.user_id} promoted from waitlist for class ${classId}`)
      }
    }
  }

  // Subscribe to user booking changes
  subscribeToUserBookings(userId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`user_bookings:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }

  // Get booking analytics for user
  async getUserBookingStats(userId: string) {
    const { data: bookings, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        fitness_class:fitness_classes(*)
      `)
      .eq('user_id', userId)

    if (error) throw error

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const stats = {
      totalBookings: bookings?.length || 0,
      confirmedBookings: bookings?.filter(b => b.status === 'confirmed').length || 0,
      attendedClasses: bookings?.filter(b => b.attended).length || 0,
      missedClasses: bookings?.filter(b => !b.attended && b.status === 'confirmed' && 
        b.fitness_class && new Date(b.fitness_class.start_time) < now).length || 0,
      thisMonthBookings: bookings?.filter(b => 
        b.fitness_class && new Date(b.fitness_class.start_time) >= thisMonth).length || 0,
      favoriteCategories: this.getFavoriteCategories(bookings || []),
      attendanceRate: 0
    }

    const completedClasses = stats.attendedClasses + stats.missedClasses
    if (completedClasses > 0) {
      stats.attendanceRate = Math.round((stats.attendedClasses / completedClasses) * 100)
    }

    return stats
  }

  private getFavoriteCategories(bookings: BookingWithClass[]) {
    const categoryCount: Record<string, number> = {}
    
    bookings.forEach(booking => {
      if (booking.fitness_class?.category) {
        categoryCount[booking.fitness_class.category] = 
          (categoryCount[booking.fitness_class.category] || 0) + 1
      }
    })

    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }))
  }
}

export const bookingManager = new BookingManager()