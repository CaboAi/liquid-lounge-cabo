'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useAuth } from './use-auth'
import { studioManager } from '@/lib/studio'
import type { Database, FitnessClass, Booking, Profile } from '@/types/database.types'

interface StudioClassWithStats extends FitnessClass {
  bookings?: Array<Booking & { user?: Profile }>
  confirmedCount: number
  waitlistCount: number
  revenue: number
  utilizationRate: number
  attendanceRate: number
  noShowCount: number
}

interface ClassScheduleDay {
  date: Date
  classes: StudioClassWithStats[]
  totalBookings: number
  totalRevenue: number
}

interface UseStudioClassesOptions {
  gymId?: string
  enableRealTime?: boolean
  includeArchived?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

export function useStudioClasses(options: UseStudioClassesOptions = {}) {
  const { gymId, enableRealTime = true, includeArchived = false, dateRange } = options
  const { user, profile } = useAuth()
  
  const [classes, setClasses] = useState<StudioClassWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedWeek, setSelectedWeek] = useState(new Date())

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Determine target gym ID
  const targetGymId = gymId || profile?.gym_id

  // Load studio classes
  const loadClasses = useCallback(async () => {
    if (!targetGymId) {
      setClasses([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const startDate = dateRange?.start || new Date()
      const endDate = dateRange?.end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

      const rawClasses = await studioManager.getStudioClasses(targetGymId, {
        includeArchived,
        includeBookingStats: true,
        startDate,
        endDate
      })

      // Process classes with detailed stats
      const processedClasses: StudioClassWithStats[] = await Promise.all(
        rawClasses.map(async (cls) => {
          // Get detailed bookings with user info
          const { data: detailedBookings } = await supabase
            .from('bookings')
            .select(`
              *,
              user:profiles(id, full_name, email, phone)
            `)
            .eq('class_id', cls.id)
            .order('created_at', { ascending: false })

          const bookings = detailedBookings || []
          const confirmedBookings = bookings.filter(b => b.status === 'confirmed')
          const waitlistedBookings = bookings.filter(b => b.status === 'waitlisted')
          const attendedBookings = bookings.filter(b => b.attended === true)
          const noShowBookings = bookings.filter(b => 
            b.status === 'confirmed' && 
            !b.attended && 
            new Date(cls.start_time) < new Date()
          )

          const utilizationRate = cls.max_participants > 0 
            ? (confirmedBookings.length / cls.max_participants) * 100 
            : 0

          const attendanceRate = confirmedBookings.length > 0 
            ? (attendedBookings.length / confirmedBookings.length) * 100 
            : 0

          return {
            ...cls,
            bookings,
            confirmedCount: confirmedBookings.length,
            waitlistCount: waitlistedBookings.length,
            revenue: confirmedBookings.length * cls.credits_required,
            utilizationRate: Math.round(utilizationRate),
            attendanceRate: Math.round(attendanceRate),
            noShowCount: noShowBookings.length
          }
        })
      )

      setClasses(processedClasses)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load studio classes'
      setError(errorMessage)
      console.error('Error loading studio classes:', err)
    } finally {
      setLoading(false)
    }
  }, [targetGymId, includeArchived, dateRange, supabase])

  // Create new class
  const createClass = useCallback(async (
    classData: Omit<FitnessClass, 'id' | 'gym_id' | 'created_at' | 'updated_at' | 'current_participants'>
  ) => {
    if (!targetGymId || !user?.id) {
      throw new Error('Not authorized to create classes')
    }

    try {
      const newClass = await studioManager.createClass(targetGymId, {
        ...classData,
        created_by: user.id
      })

      // Refresh classes list
      await loadClasses()
      
      return newClass
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create class')
      throw err
    }
  }, [targetGymId, user?.id, loadClasses])

  // Update class
  const updateClass = useCallback(async (
    classId: string, 
    updates: Partial<FitnessClass>
  ) => {
    if (!user?.id) {
      throw new Error('Not authorized to update classes')
    }

    try {
      const updatedClass = await studioManager.updateClass(classId, {
        ...updates,
        updated_by: user.id
      })

      // Update local state
      setClasses(prev => prev.map(cls => 
        cls.id === classId ? { ...cls, ...updatedClass } as StudioClassWithStats : cls
      ))

      return updatedClass
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update class')
      throw err
    }
  }, [user?.id])

  // Delete/cancel class
  const deleteClass = useCallback(async (classId: string) => {
    if (!user?.id) {
      throw new Error('Not authorized to delete classes')
    }

    try {
      await studioManager.deleteClass(classId, user.id)
      
      // Remove from local state
      setClasses(prev => prev.filter(cls => cls.id !== classId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete class')
      throw err
    }
  }, [user?.id])

  // Duplicate class
  const duplicateClass = useCallback(async (
    classId: string, 
    modifications: Partial<FitnessClass> = {}
  ) => {
    const originalClass = classes.find(cls => cls.id === classId)
    if (!originalClass) {
      throw new Error('Original class not found')
    }

    const { id, created_at, updated_at, current_participants, bookings, ...classData } = originalClass

    return createClass({
      ...classData,
      ...modifications,
      name: modifications.name || `${classData.name} (Copy)`,
      current_participants: 0
    })
  }, [classes, createClass])

  // Get weekly schedule
  const getWeeklySchedule = useCallback(async (weekStart: Date): Promise<ClassScheduleDay[]> => {
    if (!targetGymId) return []

    const schedule = await studioManager.getWeeklySchedule(targetGymId, weekStart)
    
    // Convert to our format
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const scheduleArray: ClassScheduleDay[] = []

    days.forEach((day, index) => {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + index)
      
      const dayClasses = schedule[day]?.map(cls => {
        const existingClass = classes.find(c => c.id === cls.id)
        return existingClass || {
          ...cls,
          confirmedCount: 0,
          waitlistCount: 0,
          revenue: 0,
          utilizationRate: 0,
          attendanceRate: 0,
          noShowCount: 0
        } as StudioClassWithStats
      }) || []

      scheduleArray.push({
        date,
        classes: dayClasses,
        totalBookings: dayClasses.reduce((sum, cls) => sum + cls.confirmedCount, 0),
        totalRevenue: dayClasses.reduce((sum, cls) => sum + cls.revenue, 0)
      })
    })

    return scheduleArray
  }, [targetGymId, classes])

  // Bulk operations
  const bulkUpdateClasses = useCallback(async (
    classIds: string[], 
    updates: Partial<FitnessClass>
  ) => {
    try {
      await studioManager.bulkUpdateClasses(classIds, updates)
      await loadClasses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk update classes')
      throw err
    }
  }, [loadClasses])

  const bulkCancelClasses = useCallback(async (classIds: string[], reason: string) => {
    try {
      await studioManager.bulkCancelClasses(classIds, reason)
      await loadClasses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk cancel classes')
      throw err
    }
  }, [loadClasses])

  // Computed values
  const weeklySchedule = useMemo(() => {
    const startOfWeek = new Date(selectedWeek)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()) // Go to Sunday
    
    const schedule: Record<string, StudioClassWithStats[]> = {}
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    days.forEach(day => {
      schedule[day] = []
    })

    classes.forEach(cls => {
      const classDate = new Date(cls.start_time)
      const dayName = days[classDate.getDay()]
      if (schedule[dayName]) {
        schedule[dayName].push(cls)
      }
    })

    // Sort classes by time within each day
    Object.keys(schedule).forEach(day => {
      schedule[day].sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )
    })

    return schedule
  }, [classes, selectedWeek])

  const todayClasses = useMemo(() => {
    const today = new Date()
    return classes.filter(cls => {
      const classDate = new Date(cls.start_time)
      return classDate.toDateString() === today.toDateString()
    })
  }, [classes])

  const upcomingClasses = useMemo(() => {
    const now = new Date()
    return classes.filter(cls => new Date(cls.start_time) > now)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 5)
  }, [classes])

  const classStats = useMemo(() => {
    const totalClasses = classes.length
    const totalBookings = classes.reduce((sum, cls) => sum + cls.confirmedCount, 0)
    const totalRevenue = classes.reduce((sum, cls) => sum + cls.revenue, 0)
    const averageUtilization = classes.length > 0 
      ? classes.reduce((sum, cls) => sum + cls.utilizationRate, 0) / classes.length 
      : 0
    const averageAttendance = classes.length > 0
      ? classes.reduce((sum, cls) => sum + cls.attendanceRate, 0) / classes.length
      : 0

    return {
      totalClasses,
      totalBookings,
      totalRevenue,
      averageUtilization: Math.round(averageUtilization),
      averageAttendance: Math.round(averageAttendance)
    }
  }, [classes])

  // Initialize
  useEffect(() => {
    if (targetGymId) {
      loadClasses()
    }
  }, [targetGymId, loadClasses])

  // Real-time subscriptions
  useEffect(() => {
    if (!enableRealTime || !targetGymId) return

    const subscription = supabase
      .channel(`studio_classes:${targetGymId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fitness_classes',
          filter: `gym_id=eq.${targetGymId}`
        },
        () => {
          loadClasses()
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
          loadClasses()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [enableRealTime, targetGymId, loadClasses, supabase])

  return {
    // Data
    classes,
    todayClasses,
    upcomingClasses,
    weeklySchedule,
    
    // State
    loading,
    error,
    selectedWeek,
    
    // Actions
    createClass,
    updateClass,
    deleteClass,
    duplicateClass,
    bulkUpdateClasses,
    bulkCancelClasses,
    loadClasses,
    getWeeklySchedule,
    setSelectedWeek,
    
    // Computed values
    classStats,
    hasPermission: !!targetGymId,
    isEmpty: !loading && classes.length === 0
  }
}