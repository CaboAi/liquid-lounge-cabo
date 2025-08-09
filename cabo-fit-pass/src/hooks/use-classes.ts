'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useAuth } from './use-auth'
import type { Database, FitnessClass, Booking } from '@/types/database.types'

interface ClassWithDetails extends FitnessClass {
  gym?: {
    id: string
    name: string
    address: string
    city: string
    latitude?: number
    longitude?: number
  }
  bookings?: Booking[]
  userBooking?: Booking
  spotsLeft: number
  isWaitlisted: boolean
  canBook: boolean
  canCancel: boolean
}

interface UseClassesOptions {
  enableRealTime?: boolean
  autoRefresh?: boolean
  filters?: {
    category?: string
    difficulty?: string
    date?: Date
    gymId?: string
    status?: string[]
  }
}

export function useClasses(options: UseClassesOptions = {}) {
  const { enableRealTime = true, autoRefresh = true, filters = {} } = options
  const { user } = useAuth()
  
  const [classes, setClasses] = useState<ClassWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Load classes with filters
  const loadClasses = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      setError(null)

      let query = supabase
        .from('fitness_classes')
        .select(`
          *,
          gym:gyms(id, name, address, city, latitude, longitude),
          bookings(id, user_id, status, created_at)
        `)
        .order('start_time', { ascending: true })

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty)
      }

      if (filters.gymId) {
        query = query.eq('gym_id', filters.gymId)
      }

      if (filters.status) {
        query = query.in('status', filters.status)
      } else {
        query = query.eq('status', 'scheduled')
      }

      if (filters.date) {
        const startOfDay = new Date(filters.date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(filters.date)
        endOfDay.setHours(23, 59, 59, 999)
        
        query = query.gte('start_time', startOfDay.toISOString())
                     .lte('start_time', endOfDay.toISOString())
      } else {
        // Only future classes by default
        query = query.gte('start_time', new Date().toISOString())
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Process classes with additional data
      const processedClasses: ClassWithDetails[] = (data || []).map(cls => {
        const confirmedBookings = cls.bookings?.filter(b => b.status === 'confirmed') || []
        const waitlistedBookings = cls.bookings?.filter(b => b.status === 'waitlisted') || []
        const userBooking = cls.bookings?.find(b => b.user_id === user?.id)
        const spotsLeft = cls.max_participants - confirmedBookings.length
        
        return {
          ...cls,
          spotsLeft: Math.max(0, spotsLeft),
          isWaitlisted: spotsLeft <= 0,
          userBooking,
          canBook: !userBooking && (spotsLeft > 0 || waitlistedBookings.length < 10), // Allow waitlist up to 10
          canCancel: !!userBooking && userBooking.status !== 'cancelled' && 
                    new Date(cls.start_time) > new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours before
        }
      })

      setClasses(processedClasses)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load classes'
      setError(errorMessage)
      console.error('Error loading classes:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filters, user?.id, supabase])

  // Refresh classes
  const refresh = useCallback(async () => {
    setRefreshing(true)
    await loadClasses(false)
  }, [loadClasses])

  // Get class by ID
  const getClass = useCallback((classId: string): ClassWithDetails | undefined => {
    return classes.find(cls => cls.id === classId)
  }, [classes])

  // Get upcoming classes
  const upcomingClasses = useMemo(() => {
    const now = new Date()
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    
    return classes.filter(cls => {
      const classTime = new Date(cls.start_time)
      return classTime >= now && classTime <= next24Hours
    })
  }, [classes])

  // Get classes by category
  const getClassesByCategory = useCallback((category: string) => {
    return classes.filter(cls => cls.category === category)
  }, [classes])

  // Get available classes (with spots)
  const availableClasses = useMemo(() => {
    return classes.filter(cls => cls.spotsLeft > 0)
  }, [classes])

  // Get user's enrolled classes
  const userClasses = useMemo(() => {
    return classes.filter(cls => cls.userBooking && cls.userBooking.status === 'confirmed')
  }, [classes])

  // Get waitlisted classes
  const waitlistedClasses = useMemo(() => {
    return classes.filter(cls => cls.userBooking && cls.userBooking.status === 'waitlisted')
  }, [classes])

  // Initial load
  useEffect(() => {
    loadClasses()
  }, [loadClasses])

  // Real-time subscriptions
  useEffect(() => {
    if (!enableRealTime) return

    const subscription = supabase
      .channel('fitness_classes_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fitness_classes'
        },
        () => {
          refresh()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          refresh()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [enableRealTime, refresh, supabase])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refresh()
    }, 300000) // Refresh every 5 minutes

    return () => clearInterval(interval)
  }, [autoRefresh, refresh])

  return {
    // Data
    classes,
    upcomingClasses,
    availableClasses,
    userClasses,
    waitlistedClasses,
    
    // State
    loading,
    refreshing,
    error,
    
    // Actions
    refresh,
    loadClasses,
    
    // Utilities
    getClass,
    getClassesByCategory,
    
    // Computed values
    totalClasses: classes.length,
    availableCount: availableClasses.length,
    userClassCount: userClasses.length,
    waitlistCount: waitlistedClasses.length,
    isEmpty: !loading && classes.length === 0,
  }
}

// Specialized hook for today's classes
export function useTodayClasses() {
  const today = new Date()
  return useClasses({
    filters: { date: today }
  })
}

// Specialized hook for classes by category
export function useClassesByCategory(category: string) {
  return useClasses({
    filters: { category }
  })
}

// Specialized hook for gym-specific classes
export function useGymClasses(gymId: string) {
  return useClasses({
    filters: { gymId }
  })
}