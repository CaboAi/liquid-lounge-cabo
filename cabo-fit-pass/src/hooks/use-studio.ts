'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './use-auth'
import { studioManager } from '@/lib/studio'
import type { 
  FitnessClass, 
  Gym, 
  GymStaff, 
  Booking 
} from '@/types/database.types'

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
  recentBookings: Booking[]
  memberStats: {
    totalMembers: number
    activeMembers: number
    newThisMonth: number
    churnRate: number
  }
}

interface UseStudioOptions {
  enableRealTime?: boolean
  autoRefresh?: boolean
}

export function useStudio(gymId?: string, options: UseStudioOptions = {}) {
  const { enableRealTime = true, autoRefresh = true } = options
  const { user, profile } = useAuth()
  
  const [studio, setStudio] = useState<Gym | null>(null)
  const [classes, setClasses] = useState<FitnessClass[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [analytics, setAnalytics] = useState<StudioAnalytics | null>(null)
  const [staff, setStaff] = useState<GymStaff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Determine which gym to manage
  const targetGymId = gymId || profile?.gym_id

  // Load studio data
  const loadStudio = useCallback(async () => {
    if (!targetGymId) {
      setStudio(null)
      setLoading(false)
      return
    }

    try {
      setError(null)
      const studioData = await studioManager.getStudio(targetGymId)
      setStudio(studioData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load studio')
      console.error('Error loading studio:', err)
    }
  }, [targetGymId])

  // Load studio classes
  const loadClasses = useCallback(async (includeArchived = false) => {
    if (!targetGymId) return

    try {
      const studioClasses = await studioManager.getStudioClasses(targetGymId, {
        includeArchived,
        includeBookingStats: true
      })
      setClasses(studioClasses)
    } catch (err) {
      console.error('Error loading classes:', err)
    }
  }, [targetGymId])

  // Load studio bookings
  const loadBookings = useCallback(async (filters: {
    startDate?: Date
    endDate?: Date
    status?: string
    limit?: number
  } = {}) => {
    if (!targetGymId) return

    try {
      const studioBookings = await studioManager.getStudioBookings(targetGymId, filters)
      setBookings(studioBookings)
    } catch (err) {
      console.error('Error loading bookings:', err)
    }
  }, [targetGymId])

  // Load analytics
  const loadAnalytics = useCallback(async (period: 'week' | 'month' | 'quarter' | 'year' = 'month') => {
    if (!targetGymId) return

    try {
      const analyticsData = await studioManager.getStudioAnalytics(targetGymId, period)
      setAnalytics(analyticsData)
    } catch (err) {
      console.error('Error loading analytics:', err)
    }
  }, [targetGymId])

  // Load staff
  const loadStaff = useCallback(async () => {
    if (!targetGymId) return

    try {
      const studioStaff = await studioManager.getStudioStaff(targetGymId)
      setStaff(studioStaff)
    } catch (err) {
      console.error('Error loading staff:', err)
    }
  }, [targetGymId])

  // Create a new class
  const createClass = useCallback(async (classData: Omit<FitnessClass, 'id' | 'gym_id' | 'created_at' | 'updated_at'>) => {
    if (!targetGymId || !user?.id) throw new Error('Not authorized')

    try {
      const newClass = await studioManager.createClass(targetGymId, {
        ...classData,
        created_by: user.id
      })
      
      // Refresh classes
      await loadClasses()
      
      return newClass
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create class')
      throw err
    }
  }, [targetGymId, user?.id, loadClasses])

  // Update a class
  const updateClass = useCallback(async (classId: string, updates: Partial<FitnessClass>) => {
    if (!user?.id) throw new Error('Not authorized')

    try {
      const updatedClass = await studioManager.updateClass(classId, {
        ...updates,
        updated_by: user.id
      })
      
      // Update local state
      setClasses(prev => prev.map(cls => 
        cls.id === classId ? { ...cls, ...updatedClass } : cls
      ))
      
      return updatedClass
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update class')
      throw err
    }
  }, [user?.id])

  // Delete a class
  const deleteClass = useCallback(async (classId: string) => {
    if (!user?.id) throw new Error('Not authorized')

    try {
      await studioManager.deleteClass(classId, user.id)
      
      // Remove from local state
      setClasses(prev => prev.filter(cls => cls.id !== classId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete class')
      throw err
    }
  }, [user?.id])

  // Duplicate a class
  const duplicateClass = useCallback(async (classId: string, modifications: Partial<FitnessClass> = {}) => {
    const originalClass = classes.find(cls => cls.id === classId)
    if (!originalClass) throw new Error('Class not found')

    const { id, created_at, updated_at, current_participants, ...classData } = originalClass
    
    return createClass({
      ...classData,
      ...modifications,
      name: modifications.name || `${classData.name} (Copy)`,
      current_participants: 0
    })
  }, [classes, createClass])

  // Manage bookings
  const confirmBooking = useCallback(async (bookingId: string) => {
    try {
      await studioManager.updateBookingStatus(bookingId, 'confirmed')
      await loadBookings()
    } catch (err) {
      throw err
    }
  }, [loadBookings])

  const cancelBooking = useCallback(async (bookingId: string, reason?: string) => {
    try {
      await studioManager.cancelBooking(bookingId, reason)
      await loadBookings()
    } catch (err) {
      throw err
    }
  }, [loadBookings])

  const checkInMember = useCallback(async (bookingId: string) => {
    try {
      await studioManager.checkInMember(bookingId)
      await loadBookings()
    } catch (err) {
      throw err
    }
  }, [loadBookings])

  // Studio management
  const updateStudioInfo = useCallback(async (updates: Partial<Gym>) => {
    if (!targetGymId) throw new Error('No studio selected')

    try {
      const updatedStudio = await studioManager.updateStudio(targetGymId, updates)
      setStudio(updatedStudio)
      return updatedStudio
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update studio')
      throw err
    }
  }, [targetGymId])

  // Staff management
  const addStaffMember = useCallback(async (staffData: {
    user_id: string
    role: 'owner' | 'manager' | 'instructor' | 'staff'
    permissions?: string[]
  }) => {
    if (!targetGymId) throw new Error('No studio selected')

    try {
      const newStaff = await studioManager.addStaffMember(targetGymId, staffData)
      setStaff(prev => [...prev, newStaff])
      return newStaff
    } catch (err) {
      throw err
    }
  }, [targetGymId])

  const removeStaffMember = useCallback(async (staffId: string) => {
    try {
      await studioManager.removeStaffMember(staffId)
      setStaff(prev => prev.filter(member => member.id !== staffId))
    } catch (err) {
      throw err
    }
  }, [])

  const updateStaffRole = useCallback(async (staffId: string, role: string, permissions?: string[]) => {
    try {
      const updatedStaff = await studioManager.updateStaffMember(staffId, { role, permissions })
      setStaff(prev => prev.map(member => 
        member.id === staffId ? { ...member, ...updatedStaff } : member
      ))
      return updatedStaff
    } catch (err) {
      throw err
    }
  }, [])

  // Check permissions
  const hasPermission = useCallback((permission: string) => {
    if (profile?.role === 'admin') return true
    
    const userStaff = staff.find(member => member.user_id === user?.id)
    if (!userStaff) return false
    
    if (userStaff.role === 'owner') return true
    
    return userStaff.permissions?.includes(permission) || false
  }, [profile?.role, staff, user?.id])

  // Initialize data loading
  useEffect(() => {
    if (targetGymId) {
      const loadAllData = async () => {
        setLoading(true)
        await Promise.all([
          loadStudio(),
          loadClasses(),
          loadBookings(),
          loadAnalytics(),
          loadStaff()
        ])
        setLoading(false)
      }
      
      loadAllData()
    }
  }, [targetGymId])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!enableRealTime || !targetGymId) return

    const subscriptions = [
      // Subscribe to class changes
      studioManager.subscribeToStudioClasses(targetGymId, () => {
        loadClasses()
      }),
      
      // Subscribe to booking changes
      studioManager.subscribeToStudioBookings(targetGymId, () => {
        loadBookings()
      })
    ]

    return () => {
      subscriptions.forEach(sub => sub?.unsubscribe())
    }
  }, [enableRealTime, targetGymId, loadClasses, loadBookings])

  // Auto-refresh analytics
  useEffect(() => {
    if (!autoRefresh || !targetGymId) return

    const interval = setInterval(() => {
      loadAnalytics()
    }, 300000) // Refresh every 5 minutes

    return () => clearInterval(interval)
  }, [autoRefresh, targetGymId, loadAnalytics])

  return {
    // State
    studio,
    classes,
    bookings,
    analytics,
    staff,
    loading,
    error,
    
    // Actions - Classes
    createClass,
    updateClass,
    deleteClass,
    duplicateClass,
    
    // Actions - Bookings
    confirmBooking,
    cancelBooking,
    checkInMember,
    
    // Actions - Studio
    updateStudioInfo,
    
    // Actions - Staff
    addStaffMember,
    removeStaffMember,
    updateStaffRole,
    
    // Data loading
    loadStudio,
    loadClasses,
    loadBookings,
    loadAnalytics,
    loadStaff,
    
    // Utilities
    hasPermission,
    
    // Computed values
    isOwner: staff.some(member => 
      member.user_id === user?.id && member.role === 'owner'
    ),
    userRole: staff.find(member => member.user_id === user?.id)?.role,
  }
}

// Specialized hook for class management
export function useClassManagement(gymId?: string) {
  const {
    classes,
    createClass,
    updateClass,
    deleteClass,
    duplicateClass,
    loadClasses,
    loading,
    error
  } = useStudio(gymId)

  return {
    classes,
    createClass,
    updateClass,
    deleteClass,
    duplicateClass,
    loadClasses,
    loading,
    error
  }
}

// Specialized hook for booking management
export function useBookingManagement(gymId?: string) {
  const {
    bookings,
    confirmBooking,
    cancelBooking,
    checkInMember,
    loadBookings,
    loading,
    error
  } = useStudio(gymId)

  return {
    bookings,
    confirmBooking,
    cancelBooking,
    checkInMember,
    loadBookings,
    loading,
    error
  }
}