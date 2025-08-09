'use client'

import { useState } from 'react'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User,
  MoreVertical,
  X,
  CheckCircle,
  AlertCircle,
  Navigation,
  Share2,
  CalendarPlus
} from 'lucide-react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import type { Booking, FitnessClass } from '@/types/database.types'

interface BookingCardProps {
  booking: Booking & { fitness_class?: FitnessClass }
  onCancel?: (bookingId: string) => void
  onReschedule?: (bookingId: string) => void
  onGetDirections?: (location: string) => void
  onAddToCalendar?: (booking: Booking) => void
  onShare?: (booking: Booking) => void
  variant?: 'default' | 'compact' | 'detailed'
  showActions?: boolean
  className?: string
}

export function BookingCard({ 
  booking,
  onCancel,
  onReschedule,
  onGetDirections,
  onAddToCalendar,
  onShare,
  variant = 'default',
  showActions = true,
  className 
}: BookingCardProps) {
  const [showCancelWarning, setShowCancelWarning] = useState(false)
  
  const fitnessClass = booking.fitness_class
  if (!fitnessClass) return null

  const bookingDate = new Date(fitnessClass.start_time)
  const endTime = new Date(bookingDate.getTime() + fitnessClass.duration * 60000)
  const now = new Date()
  const isPast = bookingDate < now
  const isToday = bookingDate.toDateString() === now.toDateString()
  const isUpcoming = bookingDate > now
  const hoursUntilClass = Math.floor((bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60))
  const canCancel = hoursUntilClass >= 2 && booking.status === 'confirmed'

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const getStatusBadge = () => {
    if (isPast) {
      return booking.attended ? (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Attended
        </Badge>
      ) : booking.status === 'cancelled' ? (
        <Badge variant="outline" className="text-gray-500">
          Cancelled
        </Badge>
      ) : (
        <Badge variant="outline" className="text-yellow-600 border-yellow-200">
          Missed
        </Badge>
      )
    }
    
    switch (booking.status) {
      case 'confirmed':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        )
      case 'waitlisted':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Waitlisted
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="outline" className="text-gray-500">
            <X className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return null
    }
  }

  const handleCancel = () => {
    if (!canCancel) return
    if (!showCancelWarning) {
      setShowCancelWarning(true)
    } else {
      onCancel?.(booking.id)
      setShowCancelWarning(false)
    }
  }

  if (variant === 'compact') {
    return (
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm line-clamp-1">
                  {fitnessClass.name}
                </p>
                {getStatusBadge()}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(bookingDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(bookingDate)}</span>
                </div>
              </div>
            </div>
            {showActions && isUpcoming && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onGetDirections?.(fitnessClass.location)}>
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddToCalendar?.(booking)}>
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Add to Calendar
                  </DropdownMenuItem>
                  {canCancel && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleCancel}
                        className="text-red-600"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel Booking
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "hover:shadow-lg transition-shadow",
      isPast && "opacity-75",
      className
    )}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg line-clamp-1">
              {fitnessClass.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <User className="h-3 w-3" />
              {fitnessClass.instructor_name}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isUpcoming && (
                    <>
                      <DropdownMenuItem onClick={() => onGetDirections?.(fitnessClass.location)}>
                        <Navigation className="h-4 w-4 mr-2" />
                        Get Directions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAddToCalendar?.(booking)}>
                        <CalendarPlus className="h-4 w-4 mr-2" />
                        Add to Calendar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onShare?.(booking)}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      {onReschedule && (
                        <DropdownMenuItem onClick={() => onReschedule(booking.id)}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Reschedule
                        </DropdownMenuItem>
                      )}
                      {canCancel && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={handleCancel}
                            className="text-red-600"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel Booking
                          </DropdownMenuItem>
                        </>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{formatDate(bookingDate)}</p>
              {isToday && (
                <p className="text-xs text-muted-foreground">
                  {hoursUntilClass > 0 ? `In ${hoursUntilClass} hours` : 'Starting soon'}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {formatTime(bookingDate)} - {formatTime(endTime)}
              </p>
              <p className="text-xs text-muted-foreground">
                {fitnessClass.duration} minutes
              </p>
            </div>
          </div>
        </div>
        
        {/* Location */}
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium line-clamp-1">
              {fitnessClass.location}
            </p>
            {fitnessClass.gym_name && (
              <p className="text-xs text-muted-foreground">
                {fitnessClass.gym_name}
              </p>
            )}
          </div>
          {isUpcoming && onGetDirections && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onGetDirections(fitnessClass.location)}
              className="h-7 text-xs"
            >
              <Navigation className="h-3 w-3 mr-1" />
              Directions
            </Button>
          )}
        </div>

        {/* Class Details */}
        {variant === 'detailed' && (
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {fitnessClass.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {fitnessClass.difficulty}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {fitnessClass.intensity} Intensity
            </Badge>
          </div>
        )}

        {/* Cancel Warning */}
        {showCancelWarning && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm">
              Are you sure you want to cancel this booking? Your credit will be refunded.
              <div className="flex gap-2 mt-2">
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={handleCancel}
                >
                  Yes, Cancel
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowCancelWarning(false)}
                >
                  Keep Booking
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Cancel Policy Notice */}
        {isUpcoming && !canCancel && booking.status === 'confirmed' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-xs text-red-800">
              Cancellations must be made at least 2 hours before class start time.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      {showActions && isUpcoming && variant !== 'compact' && (
        <CardFooter className="flex gap-2">
          {canCancel ? (
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleCancel}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Booking
            </Button>
          ) : null}
          {onReschedule && (
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onReschedule(booking.id)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Reschedule
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}