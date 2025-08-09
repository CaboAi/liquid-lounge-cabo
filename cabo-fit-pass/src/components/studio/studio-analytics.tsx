'use client'

import { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Activity,
  Clock,
  Star,
  ChevronDown
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface StudioAnalyticsData {
  overview: {
    totalBookings: number
    totalRevenue: number
    totalMembers: number
    averageRating: number
    bookingTrend: number // percentage change
    revenueTrend: number // percentage change
    memberTrend: number // percentage change
    ratingTrend: number // percentage change
  }
  classPerformance: Array<{
    id: string
    name: string
    bookings: number
    revenue: number
    capacity: number
    rating: number
  }>
  memberActivity: Array<{
    date: string
    bookings: number
    revenue: number
    newMembers: number
  }>
  peakHours: Array<{
    hour: number
    bookings: number
    dayOfWeek: string
  }>
}

interface StudioAnalyticsProps {
  data?: StudioAnalyticsData
  loading?: boolean
  period?: 'week' | 'month' | 'quarter' | 'year'
  onPeriodChange?: (period: string) => void
  className?: string
}

export function StudioAnalytics({
  data,
  loading = false,
  period = 'month',
  onPeriodChange,
  className
}: StudioAnalyticsProps) {
  const [selectedTab, setSelectedTab] = useState('overview')

  const mockData: StudioAnalyticsData = {
    overview: {
      totalBookings: 324,
      totalRevenue: 12450,
      totalMembers: 156,
      averageRating: 4.8,
      bookingTrend: 12.5,
      revenueTrend: 8.3,
      memberTrend: 5.2,
      ratingTrend: 0.2
    },
    classPerformance: [
      { id: '1', name: 'Morning Yoga', bookings: 45, revenue: 1350, capacity: 85, rating: 4.9 },
      { id: '2', name: 'HIIT Training', bookings: 38, revenue: 1140, capacity: 76, rating: 4.7 },
      { id: '3', name: 'Pilates', bookings: 42, revenue: 1260, capacity: 93, rating: 4.8 },
      { id: '4', name: 'Spin Class', bookings: 35, revenue: 1050, capacity: 70, rating: 4.6 },
      { id: '5', name: 'CrossFit', bookings: 40, revenue: 1600, capacity: 80, rating: 4.9 }
    ],
    memberActivity: [
      { date: '2024-01-01', bookings: 12, revenue: 480, newMembers: 3 },
      { date: '2024-01-02', bookings: 15, revenue: 600, newMembers: 2 },
      { date: '2024-01-03', bookings: 18, revenue: 720, newMembers: 4 },
      { date: '2024-01-04', bookings: 14, revenue: 560, newMembers: 1 },
      { date: '2024-01-05', bookings: 20, revenue: 800, newMembers: 5 }
    ],
    peakHours: [
      { hour: 6, bookings: 25, dayOfWeek: 'Monday' },
      { hour: 7, bookings: 30, dayOfWeek: 'Monday' },
      { hour: 8, bookings: 28, dayOfWeek: 'Monday' },
      { hour: 17, bookings: 35, dayOfWeek: 'Monday' },
      { hour: 18, bookings: 40, dayOfWeek: 'Monday' },
      { hour: 19, bookings: 38, dayOfWeek: 'Monday' }
    ]
  }

  const analyticsData = data || mockData

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : trend < 0 ? (
      <TrendingDown className="h-4 w-4 text-red-600" />
    ) : null
  }

  const getTrendColor = (trend: number) => {
    return trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Studio Analytics</h2>
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Total Bookings</CardDescription>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalBookings}</div>
            <div className={cn("flex items-center gap-1 text-sm", getTrendColor(analyticsData.overview.bookingTrend))}>
              {getTrendIcon(analyticsData.overview.bookingTrend)}
              <span>{Math.abs(analyticsData.overview.bookingTrend)}%</span>
              <span className="text-muted-foreground">from last {period}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Total Revenue</CardDescription>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.overview.totalRevenue)}</div>
            <div className={cn("flex items-center gap-1 text-sm", getTrendColor(analyticsData.overview.revenueTrend))}>
              {getTrendIcon(analyticsData.overview.revenueTrend)}
              <span>{Math.abs(analyticsData.overview.revenueTrend)}%</span>
              <span className="text-muted-foreground">from last {period}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Active Members</CardDescription>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalMembers}</div>
            <div className={cn("flex items-center gap-1 text-sm", getTrendColor(analyticsData.overview.memberTrend))}>
              {getTrendIcon(analyticsData.overview.memberTrend)}
              <span>{Math.abs(analyticsData.overview.memberTrend)}%</span>
              <span className="text-muted-foreground">from last {period}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Average Rating</CardDescription>
              <Star className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.averageRating}</div>
            <div className={cn("flex items-center gap-1 text-sm", getTrendColor(analyticsData.overview.ratingTrend))}>
              {getTrendIcon(analyticsData.overview.ratingTrend)}
              <span>{Math.abs(analyticsData.overview.ratingTrend)}%</span>
              <span className="text-muted-foreground">from last {period}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="classes">Class Performance</TabsTrigger>
          <TabsTrigger value="members">Member Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Peak Hours Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Peak Hours</CardTitle>
              <CardDescription>Most popular class times this {period}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.peakHours.map((hour, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-16 text-sm font-medium">
                      {hour.hour}:00
                    </div>
                    <div className="flex-1">
                      <Progress 
                        value={(hour.bookings / 40) * 100} 
                        className="h-2"
                      />
                    </div>
                    <div className="w-16 text-sm text-muted-foreground text-right">
                      {hour.bookings}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Avg. Class Size</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">18</div>
                <p className="text-xs text-muted-foreground">members per class</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Retention Rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">86%</div>
                <p className="text-xs text-muted-foreground">returning members</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Utilization Rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">capacity filled</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Classes</CardTitle>
              <CardDescription>Classes ranked by revenue and bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.classPerformance.map((classItem, index) => (
                  <div key={classItem.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{classItem.name}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{classItem.bookings} bookings</span>
                          <span>{formatCurrency(classItem.revenue)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="text-right">
                              <p className="text-sm font-medium">{classItem.capacity}%</p>
                              <Progress value={classItem.capacity} className="h-1 w-12" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Capacity utilization</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{classItem.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Member Activity Trends</CardTitle>
              <CardDescription>Daily activity over the past {period}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.memberActivity.map((day) => (
                  <div key={day.date} className="grid grid-cols-4 gap-4 p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Bookings</p>
                      <p className="font-medium">{day.bookings}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="font-medium">{formatCurrency(day.revenue)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">New Members</p>
                      <p className="font-medium">+{day.newMembers}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}