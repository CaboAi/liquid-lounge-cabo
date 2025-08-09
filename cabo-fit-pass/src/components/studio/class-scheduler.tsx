'use client'

import { useState } from 'react'
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash,
  Users,
  MapPin,
  Copy,
  MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { FitnessClass } from '@/types/database.types'

interface ClassSchedulerProps {
  classes?: FitnessClass[]
  onAddClass?: () => void
  onEditClass?: (classId: string) => void
  onDeleteClass?: (classId: string) => void
  onDuplicateClass?: (classId: string) => void
  loading?: boolean
  className?: string
}

export function ClassScheduler({
  classes = [],
  onAddClass,
  onEditClass,
  onDeleteClass,
  onDuplicateClass,
  loading = false,
  className
}: ClassSchedulerProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [view, setView] = useState<'week' | 'day'>('week')

  // Generate week days
  const getWeekDays = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const weekDays = getWeekDays(currentWeek)

  // Mock data for demonstration
  const mockClasses: FitnessClass[] = [
    {
      id: '1',
      gym_id: 'gym1',
      name: 'Morning Yoga',
      description: 'Start your day with energy',
      instructor_name: 'Sarah Johnson',
      start_time: new Date(2024, 0, 8, 6, 30).toISOString(),
      duration: 60,
      max_participants: 20,
      current_participants: 15,
      credits_required: 2,
      category: 'Yoga',
      difficulty: 'beginner',
      intensity: 'low',
      location: 'Studio A',
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      gym_id: 'gym1',
      name: 'HIIT Training',
      description: 'High intensity interval training',
      instructor_name: 'Mike Chen',
      start_time: new Date(2024, 0, 8, 8, 0).toISOString(),
      duration: 45,
      max_participants: 15,
      current_participants: 12,
      credits_required: 3,
      category: 'HIIT',
      difficulty: 'intermediate',
      intensity: 'high',
      location: 'Studio B',
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      gym_id: 'gym1',
      name: 'Pilates',
      description: 'Core strengthening',
      instructor_name: 'Emma Davis',
      start_time: new Date(2024, 0, 8, 10, 0).toISOString(),
      duration: 50,
      max_participants: 12,
      current_participants: 10,
      credits_required: 2,
      category: 'Pilates',
      difficulty: 'intermediate',
      intensity: 'medium',
      location: 'Studio A',
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  const scheduleClasses = classes.length > 0 ? classes : mockClasses

  // Group classes by hour for time slots
  const timeSlots = Array.from({ length: 14 }, (_, i) => i + 6) // 6 AM to 8 PM

  const getClassesForDayAndTime = (day: Date, hour: number) => {
    return scheduleClasses.filter(cls => {
      const classDate = new Date(cls.start_time)
      return (
        classDate.getDate() === day.getDate() &&
        classDate.getMonth() === day.getMonth() &&
        classDate.getFullYear() === day.getFullYear() &&
        classDate.getHours() === hour
      )
    })
  }

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour} ${period}`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const getIntensityColor = (intensity: string) => {
    switch (intensity?.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Class Schedule</CardTitle>
            <CardDescription>
              Week of {weekDays[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateWeek('prev')}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentWeek(new Date())}
                className="h-8 px-3 font-medium"
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateWeek('next')}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={onAddClass} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 text-sm font-medium text-muted-foreground w-20">
                  Time
                </th>
                {weekDays.map((day) => {
                  const isToday = day.toDateString() === new Date().toDateString()
                  return (
                    <th
                      key={day.toISOString()}
                      className={cn(
                        "text-center p-2 text-sm font-medium min-w-[140px]",
                        isToday && "bg-primary/5"
                      )}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-muted-foreground">
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className={cn(
                          "text-lg",
                          isToday && "text-primary font-semibold"
                        )}>
                          {day.getDate()}
                        </span>
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((hour) => (
                <tr key={hour} className="border-b">
                  <td className="p-2 text-sm text-muted-foreground">
                    {formatTime(hour)}
                  </td>
                  {weekDays.map((day) => {
                    const isToday = day.toDateString() === new Date().toDateString()
                    const dayClasses = getClassesForDayAndTime(day, hour)
                    
                    return (
                      <td
                        key={`${day.toISOString()}-${hour}`}
                        className={cn(
                          "p-2 align-top border-l min-h-[60px]",
                          isToday && "bg-primary/5"
                        )}
                      >
                        <div className="space-y-1">
                          {dayClasses.map((cls) => (
                            <TooltipProvider key={cls.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="relative group">
                                    <div className={cn(
                                      "p-2 rounded-md border text-xs cursor-pointer hover:shadow-md transition-shadow",
                                      getIntensityColor(cls.intensity)
                                    )}>
                                      <div className="font-medium line-clamp-1">
                                        {cls.name}
                                      </div>
                                      <div className="text-xs opacity-80 line-clamp-1">
                                        {cls.instructor_name}
                                      </div>
                                      <div className="flex items-center gap-1 mt-1">
                                        <Users className="h-3 w-3" />
                                        <span>{cls.current_participants}/{cls.max_participants}</span>
                                      </div>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <MoreVertical className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onEditClass?.(cls.id)}>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onDuplicateClass?.(cls.id)}>
                                          <Copy className="h-4 w-4 mr-2" />
                                          Duplicate
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                          onClick={() => onDeleteClass?.(cls.id)}
                                          className="text-red-600"
                                        >
                                          <Trash className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    <p className="font-medium">{cls.name}</p>
                                    <p className="text-xs">{cls.instructor_name}</p>
                                    <p className="text-xs">{cls.duration} minutes</p>
                                    <p className="text-xs">{cls.location}</p>
                                    <p className="text-xs">{cls.current_participants}/{cls.max_participants} participants</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Schedule Summary */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Classes</p>
            <p className="text-2xl font-bold">{scheduleClasses.length}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Capacity</p>
            <p className="text-2xl font-bold">
              {scheduleClasses.reduce((sum, cls) => sum + cls.max_participants, 0)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Booked</p>
            <p className="text-2xl font-bold">
              {scheduleClasses.reduce((sum, cls) => sum + cls.current_participants, 0)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg. Utilization</p>
            <p className="text-2xl font-bold">
              {Math.round(
                (scheduleClasses.reduce((sum, cls) => sum + cls.current_participants, 0) /
                scheduleClasses.reduce((sum, cls) => sum + cls.max_participants, 0)) * 100
              )}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}