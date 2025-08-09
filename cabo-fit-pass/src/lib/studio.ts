import { createClient } from '@supabase/supabase-js'
import type { 
  Database, 
  FitnessClass, 
  Gym, 
  GymStaff, 
  Booking,
  Profile 
} from '@/types/database.types'

interface BookingWithUser extends Booking {
  user?: Profile
  fitness_class?: FitnessClass
}

interface ClassWithStats extends FitnessClass {
  booking_count?: number
  revenue?: number
  average_rating?: number
}

interface StudioAnalytics {
  totalClasses: number
  totalBookings: number
  totalRevenue: number
  averageRating: number
  utilizationRate: number
  monthlyGrowth: number
  topPerformingClasses: Array<{
    id: string
    name: string
    bookings: number
    revenue: number
    rating: number
  }>
  recentBookings: BookingWithUser[]
  memberStats: {
    totalMembers: number
    activeMembers: number
    newThisMonth: number
    churnRate: number
  }
}

export class StudioManager {
  private supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get studio information
  async getStudio(gymId: string): Promise<Gym> {
    const { data, error } = await this.supabase
      .from('gyms')
      .select('*')
      .eq('id', gymId)
      .single()

    if (error) throw error
    if (!data) throw new Error('Studio not found')

    return data
  }

  // Update studio information
  async updateStudio(gymId: string, updates: Partial<Gym>): Promise<Gym> {
    const { data, error } = await this.supabase
      .from('gyms')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', gymId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get studio classes
  async getStudioClasses(
    gymId: string, 
    options: {
      includeArchived?: boolean
      includeBookingStats?: boolean
      startDate?: Date
      endDate?: Date
    } = {}
  ): Promise<ClassWithStats[]> {
    const { includeArchived = false, includeBookingStats = false, startDate, endDate } = options

    let query = this.supabase
      .from('fitness_classes')
      .select('*')
      .eq('gym_id', gymId)
      .order('start_time', { ascending: true })

    if (!includeArchived) {
      query = query.eq('status', 'scheduled')
    }

    if (startDate) {
      query = query.gte('start_time', startDate.toISOString())
    }

    if (endDate) {
      query = query.lte('start_time', endDate.toISOString())
    }

    const { data: classes, error } = await query

    if (error) throw error

    if (includeBookingStats && classes) {
      // Get booking stats for each class
      const classesWithStats = await Promise.all(
        classes.map(async (cls) => {
          const { data: bookings } = await this.supabase
            .from('bookings')
            .select('status')
            .eq('class_id', cls.id)
            .in('status', ['confirmed', 'attended'])

          const bookingCount = bookings?.length || 0
          const revenue = bookingCount * cls.credits_required

          return {
            ...cls,
            booking_count: bookingCount,
            revenue,
            average_rating: cls.average_rating || 0
          }
        })
      )

      return classesWithStats
    }

    return classes || []
  }

  // Create a new class
  async createClass(
    gymId: string, 
    classData: Omit<FitnessClass, 'id' | 'gym_id' | 'created_at' | 'updated_at'> & { created_by: string }
  ): Promise<FitnessClass> {
    const { data, error } = await this.supabase
      .from('fitness_classes')
      .insert({
        ...classData,
        gym_id: gymId,
        current_participants: 0,
        status: 'scheduled'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update a class
  async updateClass(classId: string, updates: Partial<FitnessClass> & { updated_by?: string }): Promise<FitnessClass> {
    const { data, error } = await this.supabase
      .from('fitness_classes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', classId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delete a class
  async deleteClass(classId: string, deletedBy: string): Promise<void> {
    // Check if there are any confirmed bookings
    const { data: bookings, error: bookingsError } = await this.supabase
      .from('bookings')
      .select('id')
      .eq('class_id', classId)
      .eq('status', 'confirmed')

    if (bookingsError) throw bookingsError

    if (bookings && bookings.length > 0) {
      throw new Error('Cannot delete class with confirmed bookings. Cancel bookings first.')
    }

    // Soft delete by updating status
    const { error } = await this.supabase
      .from('fitness_classes')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
        metadata: {
          deleted_by: deletedBy,
          deleted_at: new Date().toISOString()
        }
      })
      .eq('id', classId)

    if (error) throw error
  }

  // Get studio bookings
  async getStudioBookings(
    gymId: string,
    filters: {
      startDate?: Date
      endDate?: Date
      status?: string
      limit?: number
      offset?: number
    } = {}
  ): Promise<BookingWithUser[]> {
    const { startDate, endDate, status, limit = 100, offset = 0 } = filters

    let query = this.supabase
      .from('bookings')
      .select(`
        *,
        user:profiles(*),
        fitness_class:fitness_classes(*)
      `)
      .eq('fitness_classes.gym_id', gymId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (startDate) {
      query = query.gte('fitness_classes.start_time', startDate.toISOString())
    }

    if (endDate) {
      query = query.lte('fitness_classes.start_time', endDate.toISOString())
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  // Update booking status
  async updateBookingStatus(bookingId: string, status: 'confirmed' | 'cancelled' | 'waitlisted'): Promise<Booking> {
    const { data, error } = await this.supabase
      .from('bookings')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Cancel booking with reason
  async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    const { error } = await this.supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
        metadata: {
          cancellation_reason: reason,
          cancelled_by_studio: true,
          cancelled_at: new Date().toISOString()
        }
      })
      .eq('id', bookingId)

    if (error) throw error
  }

  // Check in member
  async checkInMember(bookingId: string): Promise<void> {
    const { error } = await this.supabase
      .from('bookings')
      .update({
        attended: true,
        updated_at: new Date().toISOString(),
        metadata: {
          checked_in_at: new Date().toISOString(),
          checked_in_by_studio: true
        }
      })
      .eq('id', bookingId)

    if (error) throw error
  }

  // Get studio analytics
  async getStudioAnalytics(gymId: string, period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<StudioAnalytics> {
    const now = new Date()
    let startDate: Date
    let previousPeriodStart: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        previousPeriodStart = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        break
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        previousPeriodStart = new Date(now.getFullYear(), (quarter - 1) * 3, 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        previousPeriodStart = new Date(now.getFullYear() - 1, 0, 1)
        break
    }

    // Get current period data
    const [classes, bookings, previousBookings] = await Promise.all([
      this.getStudioClasses(gymId, { 
        includeBookingStats: true, 
        startDate, 
        endDate: now 
      }),
      this.getStudioBookings(gymId, { 
        startDate, 
        endDate: now 
      }),
      this.getStudioBookings(gymId, { 
        startDate: previousPeriodStart, 
        endDate: startDate 
      })
    ])

    // Calculate metrics
    const totalClasses = classes.length
    const totalBookings = bookings.length
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.attended).length
    const totalRevenue = bookings.reduce((sum, booking) => 
      sum + (booking.fitness_class?.credits_required || 0), 0
    )

    // Calculate utilization rate
    const totalCapacity = classes.reduce((sum, cls) => sum + cls.max_participants, 0)
    const utilizationRate = totalCapacity > 0 ? (confirmedBookings / totalCapacity) * 100 : 0

    // Calculate growth
    const previousBookingCount = previousBookings.length
    const monthlyGrowth = previousBookingCount > 0 
      ? ((totalBookings - previousBookingCount) / previousBookingCount) * 100 
      : 0

    // Top performing classes
    const topPerformingClasses = classes
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 5)
      .map(cls => ({
        id: cls.id,
        name: cls.name,
        bookings: cls.booking_count || 0,
        revenue: cls.revenue || 0,
        rating: cls.average_rating || 0
      }))

    // Recent bookings
    const recentBookings = bookings.slice(0, 10)

    // Member stats
    const uniqueMembers = new Set(bookings.map(b => b.user_id)).size
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const newThisMonth = bookings.filter(b => 
      new Date(b.created_at) >= thisMonthStart
    ).length

    // Average rating
    const classesWithRatings = classes.filter(cls => cls.average_rating && cls.average_rating > 0)
    const averageRating = classesWithRatings.length > 0
      ? classesWithRatings.reduce((sum, cls) => sum + (cls.average_rating || 0), 0) / classesWithRatings.length
      : 0

    return {
      totalClasses,
      totalBookings: confirmedBookings,
      totalRevenue,
      averageRating,
      utilizationRate: Math.round(utilizationRate),
      monthlyGrowth: Math.round(monthlyGrowth),
      topPerformingClasses,
      recentBookings,
      memberStats: {
        totalMembers: uniqueMembers,
        activeMembers: uniqueMembers, // Simplified for demo
        newThisMonth,
        churnRate: 0 // Would need more complex calculation
      }
    }
  }

  // Get studio staff
  async getStudioStaff(gymId: string): Promise<GymStaff[]> {
    const { data, error } = await this.supabase
      .from('gym_staff')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('gym_id', gymId)
      .eq('status', 'active')

    if (error) throw error
    return data || []
  }

  // Add staff member
  async addStaffMember(
    gymId: string, 
    staffData: {
      user_id: string
      role: 'owner' | 'manager' | 'instructor' | 'staff'
      permissions?: string[]
    }
  ): Promise<GymStaff> {
    const { data, error } = await this.supabase
      .from('gym_staff')
      .insert({
        gym_id: gymId,
        user_id: staffData.user_id,
        role: staffData.role,
        permissions: staffData.permissions || [],
        status: 'active',
        hired_date: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Remove staff member
  async removeStaffMember(staffId: string): Promise<void> {
    const { error } = await this.supabase
      .from('gym_staff')
      .update({
        status: 'inactive',
        terminated_date: new Date().toISOString()
      })
      .eq('id', staffId)

    if (error) throw error
  }

  // Update staff member
  async updateStaffMember(
    staffId: string, 
    updates: {
      role?: string
      permissions?: string[]
      status?: 'active' | 'inactive'
    }
  ): Promise<GymStaff> {
    const { data, error } = await this.supabase
      .from('gym_staff')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', staffId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Subscribe to studio classes changes
  subscribeToStudioClasses(gymId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`studio_classes:${gymId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fitness_classes',
          filter: `gym_id=eq.${gymId}`
        },
        callback
      )
      .subscribe()
  }

  // Subscribe to studio bookings changes
  subscribeToStudioBookings(gymId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`studio_bookings:${gymId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `fitness_classes.gym_id=eq.${gymId}` // This might need adjustment based on your RLS setup
        },
        callback
      )
      .subscribe()
  }

  // Get class schedule for a specific week
  async getWeeklySchedule(gymId: string, startDate: Date) {
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 7)

    const classes = await this.getStudioClasses(gymId, {
      startDate,
      endDate,
      includeBookingStats: true
    })

    // Group classes by day
    const schedule: Record<string, ClassWithStats[]> = {}
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    days.forEach(day => {
      schedule[day] = []
    })

    classes.forEach(cls => {
      const classDate = new Date(cls.start_time)
      const dayName = days[classDate.getDay()]
      schedule[dayName].push(cls)
    })

    // Sort classes by time within each day
    Object.keys(schedule).forEach(day => {
      schedule[day].sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )
    })

    return schedule
  }

  // Bulk operations
  async bulkUpdateClasses(classIds: string[], updates: Partial<FitnessClass>) {
    const { data, error } = await this.supabase
      .from('fitness_classes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', classIds)
      .select()

    if (error) throw error
    return data
  }

  async bulkCancelClasses(classIds: string[], reason: string) {
    return this.bulkUpdateClasses(classIds, {
      status: 'cancelled',
      metadata: {
        cancelled_reason: reason,
        cancelled_at: new Date().toISOString()
      }
    })
  }
}

export const studioManager = new StudioManager()