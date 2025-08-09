'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './use-auth'
import { studioManager } from '@/lib/studio'

interface StudioMetrics {
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
  recentBookings: any[]
  memberStats: {
    totalMembers: number
    activeMembers: number
    newThisMonth: number
    churnRate: number
  }
}

interface RevenueData {
  date: string
  revenue: number
  bookings: number
  classes: number
}

interface CategoryPerformance {
  category: string
  bookings: number
  revenue: number
  averageRating: number
  utilizationRate: number
  growth: number
}

interface MemberInsights {
  totalMembers: number
  newMembersThisMonth: number
  returningMembers: number
  churnRate: number
  averageBookingsPerMember: number
  topMembers: Array<{
    id: string
    name: string
    totalBookings: number
    totalSpent: number
    favoriteCategory: string
  }>
}

interface PeakHoursData {
  hour: number
  bookings: number
  utilization: number
  day: string
}

interface UseStudioAnalyticsOptions {
  gymId?: string
  period?: 'week' | 'month' | 'quarter' | 'year'
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useStudioAnalytics(options: UseStudioAnalyticsOptions = {}) {
  const { 
    gymId, 
    period = 'month', 
    autoRefresh = true, 
    refreshInterval = 300000 // 5 minutes
  } = options
  const { user, profile } = useAuth()
  
  const [metrics, setMetrics] = useState<StudioMetrics | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance[]>([])
  const [memberInsights, setMemberInsights] = useState<MemberInsights | null>(null)
  const [peakHours, setPeakHours] = useState<PeakHoursData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Determine target gym ID
  const targetGymId = gymId || profile?.gym_id

  // Load main analytics
  const loadAnalytics = useCallback(async () => {
    if (!targetGymId) {
      setMetrics(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const analyticsData = await studioManager.getStudioAnalytics(targetGymId, period)
      setMetrics(analyticsData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics'
      setError(errorMessage)
      console.error('Error loading analytics:', err)
    } finally {
      setLoading(false)
    }
  }, [targetGymId, period])

  // Load revenue trend data
  const loadRevenueData = useCallback(async () => {
    if (!targetGymId) return

    try {
      // Calculate date range based on period
      const endDate = new Date()
      let startDate = new Date()
      let dateFormat = 'YYYY-MM-DD'

      switch (period) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7)
          dateFormat = 'YYYY-MM-DD'
          break
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1)
          dateFormat = 'YYYY-MM-DD'
          break
        case 'quarter':
          startDate.setMonth(startDate.getMonth() - 3)
          dateFormat = 'YYYY-MM'
          break
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1)
          dateFormat = 'YYYY-MM'
          break
      }

      // Get bookings data for the period
      const bookings = await studioManager.getStudioBookings(targetGymId, {
        startDate,
        endDate
      })

      // Process into daily/monthly revenue data
      const revenueMap = new Map<string, { revenue: number; bookings: number; classes: Set<string> }>()

      bookings.forEach(booking => {
        if (booking.fitness_class && booking.status === 'confirmed') {
          const date = new Date(booking.fitness_class.start_time)
          const key = period === 'year' || period === 'quarter' 
            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            : date.toISOString().split('T')[0]

          if (!revenueMap.has(key)) {
            revenueMap.set(key, { revenue: 0, bookings: 0, classes: new Set() })
          }

          const data = revenueMap.get(key)!
          data.revenue += booking.fitness_class.credits_required || 0
          data.bookings += 1
          data.classes.add(booking.fitness_class.id)
        }
      })

      const revenueArray: RevenueData[] = Array.from(revenueMap.entries()).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        bookings: data.bookings,
        classes: data.classes.size
      })).sort((a, b) => a.date.localeCompare(b.date))

      setRevenueData(revenueArray)
    } catch (err) {
      console.error('Error loading revenue data:', err)
    }
  }, [targetGymId, period])

  // Load category performance data
  const loadCategoryPerformance = useCallback(async () => {
    if (!targetGymId) return

    try {
      const classes = await studioManager.getStudioClasses(targetGymId, {
        includeBookingStats: true
      })

      const categoryMap = new Map<string, {
        bookings: number
        revenue: number
        totalRating: number
        ratingCount: number
        totalCapacity: number
        totalParticipants: number
      }>()

      classes.forEach(cls => {
        if (!cls.category) return

        if (!categoryMap.has(cls.category)) {
          categoryMap.set(cls.category, {
            bookings: 0,
            revenue: 0,
            totalRating: 0,
            ratingCount: 0,
            totalCapacity: 0,
            totalParticipants: 0
          })
        }

        const data = categoryMap.get(cls.category)!
        const bookingCount = (cls as any).booking_count || 0
        
        data.bookings += bookingCount
        data.revenue += (cls as any).revenue || 0
        data.totalCapacity += cls.max_participants
        data.totalParticipants += cls.current_participants

        if (cls.average_rating && cls.average_rating > 0) {
          data.totalRating += cls.average_rating
          data.ratingCount += 1
        }
      })

      const categoryPerformanceArray: CategoryPerformance[] = Array.from(categoryMap.entries())
        .map(([category, data]) => ({
          category,
          bookings: data.bookings,
          revenue: data.revenue,
          averageRating: data.ratingCount > 0 ? data.totalRating / data.ratingCount : 0,
          utilizationRate: data.totalCapacity > 0 ? (data.totalParticipants / data.totalCapacity) * 100 : 0,
          growth: 0 // Would need historical data to calculate
        }))
        .sort((a, b) => b.revenue - a.revenue)

      setCategoryPerformance(categoryPerformanceArray)
    } catch (err) {
      console.error('Error loading category performance:', err)
    }
  }, [targetGymId])

  // Load member insights
  const loadMemberInsights = useCallback(async () => {
    if (!targetGymId) return

    try {
      const bookings = await studioManager.getStudioBookings(targetGymId, {
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
      })

      const memberMap = new Map<string, {
        name: string
        totalBookings: number
        totalSpent: number
        categories: Map<string, number>
        firstBooking: Date
        lastBooking: Date
      }>()

      bookings.forEach(booking => {
        if (booking.user && booking.fitness_class) {
          const userId = booking.user_id
          
          if (!memberMap.has(userId)) {
            memberMap.set(userId, {
              name: (booking as any).user?.full_name || 'Unknown',
              totalBookings: 0,
              totalSpent: 0,
              categories: new Map(),
              firstBooking: new Date(booking.created_at),
              lastBooking: new Date(booking.created_at)
            })
          }

          const data = memberMap.get(userId)!
          
          if (booking.status === 'confirmed' || booking.attended) {
            data.totalBookings += 1
            data.totalSpent += booking.fitness_class.credits_required || 0
            
            const category = booking.fitness_class.category || 'Other'
            data.categories.set(category, (data.categories.get(category) || 0) + 1)
          }

          const bookingDate = new Date(booking.created_at)
          if (bookingDate < data.firstBooking) data.firstBooking = bookingDate
          if (bookingDate > data.lastBooking) data.lastBooking = bookingDate
        }
      })

      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)

      const totalMembers = memberMap.size
      const newMembersThisMonth = Array.from(memberMap.values())
        .filter(member => member.firstBooking >= thisMonth).length

      const activeMembers = Array.from(memberMap.values())
        .filter(member => {
          const daysSinceLastBooking = (Date.now() - member.lastBooking.getTime()) / (1000 * 60 * 60 * 24)
          return daysSinceLastBooking <= 30
        }).length

      const returningMembers = Array.from(memberMap.values())
        .filter(member => member.totalBookings > 1).length

      const totalBookings = Array.from(memberMap.values())
        .reduce((sum, member) => sum + member.totalBookings, 0)
      
      const averageBookingsPerMember = totalMembers > 0 ? totalBookings / totalMembers : 0

      const topMembers = Array.from(memberMap.entries())
        .map(([id, data]) => {
          const favoriteCategory = Array.from(data.categories.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'

          return {
            id,
            name: data.name,
            totalBookings: data.totalBookings,
            totalSpent: data.totalSpent,
            favoriteCategory
          }
        })
        .sort((a, b) => b.totalBookings - a.totalBookings)
        .slice(0, 10)

      const churnRate = totalMembers > 0 ? ((totalMembers - activeMembers) / totalMembers) * 100 : 0

      setMemberInsights({
        totalMembers,
        newMembersThisMonth,
        returningMembers,
        churnRate: Math.round(churnRate),
        averageBookingsPerMember: Math.round(averageBookingsPerMember * 100) / 100,
        topMembers
      })
    } catch (err) {
      console.error('Error loading member insights:', err)
    }
  }, [targetGymId])

  // Load peak hours data
  const loadPeakHours = useCallback(async () => {
    if (!targetGymId) return

    try {
      const classes = await studioManager.getStudioClasses(targetGymId, {
        includeBookingStats: true,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      })

      const hourMap = new Map<string, { bookings: number; capacity: number; count: number }>()

      classes.forEach(cls => {
        const startTime = new Date(cls.start_time)
        const hour = startTime.getHours()
        const day = startTime.toLocaleDateString('en-US', { weekday: 'long' })
        const key = `${day}-${hour}`

        if (!hourMap.has(key)) {
          hourMap.set(key, { bookings: 0, capacity: 0, count: 0 })
        }

        const data = hourMap.get(key)!
        data.bookings += (cls as any).booking_count || 0
        data.capacity += cls.max_participants
        data.count += 1
      })

      const peakHoursArray: PeakHoursData[] = Array.from(hourMap.entries())
        .map(([key, data]) => {
          const [day, hourStr] = key.split('-')
          const hour = parseInt(hourStr)
          
          return {
            hour,
            day,
            bookings: data.bookings,
            utilization: data.capacity > 0 ? (data.bookings / data.capacity) * 100 : 0
          }
        })
        .sort((a, b) => b.utilization - a.utilization)

      setPeakHours(peakHoursArray)
    } catch (err) {
      console.error('Error loading peak hours:', err)
    }
  }, [targetGymId])

  // Load all analytics data
  const loadAllAnalytics = useCallback(async () => {
    await Promise.all([
      loadAnalytics(),
      loadRevenueData(),
      loadCategoryPerformance(),
      loadMemberInsights(),
      loadPeakHours()
    ])
  }, [loadAnalytics, loadRevenueData, loadCategoryPerformance, loadMemberInsights, loadPeakHours])

  // Computed dashboard metrics
  const dashboardMetrics = useMemo(() => {
    if (!metrics) return null

    const previousPeriodRevenue = revenueData.length > 1 
      ? revenueData[revenueData.length - 2]?.revenue || 0 
      : 0
    const currentPeriodRevenue = revenueData[revenueData.length - 1]?.revenue || 0
    const revenueGrowth = previousPeriodRevenue > 0 
      ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
      : 0

    return {
      ...metrics,
      revenueGrowth: Math.round(revenueGrowth),
      totalRevenueForPeriod: revenueData.reduce((sum, day) => sum + day.revenue, 0),
      averageRevenuePerDay: revenueData.length > 0 
        ? revenueData.reduce((sum, day) => sum + day.revenue, 0) / revenueData.length 
        : 0,
      mostPopularCategory: categoryPerformance[0]?.category || 'None',
      peakHour: peakHours[0]?.hour || 0,
      peakDay: peakHours[0]?.day || 'Monday'
    }
  }, [metrics, revenueData, categoryPerformance, peakHours])

  // Initialize
  useEffect(() => {
    if (targetGymId) {
      loadAllAnalytics()
    }
  }, [targetGymId, period, loadAllAnalytics])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !targetGymId) return

    const interval = setInterval(() => {
      loadAllAnalytics()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, targetGymId, refreshInterval, loadAllAnalytics])

  return {
    // Core data
    metrics,
    dashboardMetrics,
    
    // Detailed analytics
    revenueData,
    categoryPerformance,
    memberInsights,
    peakHours,
    
    // State
    loading,
    error,
    
    // Actions
    loadAnalytics,
    loadAllAnalytics,
    refresh: loadAllAnalytics,
    
    // Utilities
    hasData: !!metrics,
    isEmpty: !loading && !metrics
  }
}