'use client'

import { useState } from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CreditCard,
  Users,
  AlertCircle,
  CheckCircle,
  X,
  Heart,
  Star,
  Activity,
  Loader2
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { FitnessClass } from '@/types/database.types'

interface ClassBookingModalProps {
  fitnessClass: FitnessClass
  userCredits?: number
  onBook?: (classId: string, options: BookingOptions) => Promise<void>
  onAddToWaitlist?: (classId: string) => Promise<void>
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  loading?: boolean
}

interface BookingOptions {
  acceptWaitlist: boolean
  agreeToPolicy: boolean
  emergencyContact?: string
}

export function ClassBookingModal({
  fitnessClass,
  userCredits = 0,
  onBook,
  onAddToWaitlist,
  children,
  open,
  onOpenChange,
  loading = false
}: ClassBookingModalProps) {
  const [isBooking, setIsBooking] = useState(false)
  const [acceptWaitlist, setAcceptWaitlist] = useState(false)
  const [agreeToPolicy, setAgreeToPolicy] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const startTime = new Date(fitnessClass.start_time)
  const endTime = new Date(startTime.getTime() + fitnessClass.duration * 60000)
  const spotsLeft = fitnessClass.max_participants - fitnessClass.current_participants
  const isFull = spotsLeft <= 0
  const bookingPercentage = (fitnessClass.current_participants / fitnessClass.max_participants) * 100
  const hasEnoughCredits = userCredits >= fitnessClass.credits_required

  const formatDateTime = (date: Date) => ({
    date: date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    time: date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  })

  const { date, time } = formatDateTime(startTime)
  const endTimeFormatted = formatDateTime(endTime).time

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getIntensityColor = (intensity: string) => {
    switch (intensity?.toLowerCase()) {
      case 'low':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'high':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const handleBooking = async () => {
    if (!agreeToPolicy) {
      toast.error('Please agree to the cancellation policy')
      return
    }

    if (!hasEnoughCredits && !isFull) {
      toast.error('Insufficient credits', {
        description: `You need ${fitnessClass.credits_required} credits to book this class.`
      })
      return
    }

    setIsBooking(true)
    
    try {
      const options: BookingOptions = {
        acceptWaitlist,
        agreeToPolicy
      }

      if (isFull && acceptWaitlist) {
        if (onAddToWaitlist) {
          await onAddToWaitlist(fitnessClass.id)
        }
        toast.success('Added to waitlist!', {
          description: 'You\'ll be notified if a spot becomes available.'
        })
      } else if (onBook) {
        await onBook(fitnessClass.id, options)
        toast.success('Class booked successfully!', {
          description: `You're confirmed for ${fitnessClass.name} on ${date}.`
        })
      }
      
      onOpenChange?.(false)
    } catch (error) {
      toast.error('Booking failed', {
        description: 'Please try again or contact support.'
      })
    } finally {
      setIsBooking(false)
    }
  }

  const canBook = !isFull && hasEnoughCredits && agreeToPolicy
  const canWaitlist = isFull && acceptWaitlist && agreeToPolicy

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Book Class
          </DialogTitle>
          <DialogDescription>
            Review class details and confirm your booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Class Header */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{fitnessClass.name}</h3>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{fitnessClass.instructor_name}</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="outline" 
                className={cn("text-xs", getDifficultyColor(fitnessClass.difficulty))}
              >
                {fitnessClass.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Activity className={cn("h-3 w-3 mr-1", getIntensityColor(fitnessClass.intensity))} />
                {fitnessClass.intensity} intensity
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {fitnessClass.category}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Class Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{date}</p>
                <p className="text-sm text-muted-foreground">
                  {time} - {endTimeFormatted} ({fitnessClass.duration} min)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{fitnessClass.location}</p>
                {fitnessClass.gym_name && (
                  <p className="text-sm text-muted-foreground">
                    {fitnessClass.gym_name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {fitnessClass.credits_required} credit{fitnessClass.credits_required !== 1 ? 's' : ''}
                </span>
                {!hasEnoughCredits && (
                  <Badge variant="destructive" className="text-xs">
                    Insufficient credits
                  </Badge>
                )}
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {fitnessClass.current_participants}/{fitnessClass.max_participants} participants
                  </span>
                </div>
                {spotsLeft <= 3 && spotsLeft > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    Only {spotsLeft} left!
                  </Badge>
                )}
                {isFull && (
                  <Badge variant="outline" className="text-xs">
                    Class Full
                  </Badge>
                )}
              </div>
              <Progress value={bookingPercentage} className="h-2" />
            </div>

            {/* Rating */}
            {fitnessClass.average_rating && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{fitnessClass.average_rating.toFixed(1)}</span>
                {fitnessClass.total_ratings && (
                  <span className="text-sm text-muted-foreground">
                    ({fitnessClass.total_ratings} reviews)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          {fitnessClass.description && (
            <>
              <Separator />
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="h-auto p-0 font-medium"
                >
                  {showDetails ? 'Hide' : 'Show'} Details
                </Button>
                {showDetails && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {fitnessClass.description}
                  </p>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Booking Options */}
          <div className="space-y-3">
            {/* Waitlist Option */}
            {isFull && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="waitlist" 
                  checked={acceptWaitlist}
                  onCheckedChange={setAcceptWaitlist}
                />
                <Label htmlFor="waitlist" className="text-sm">
                  Join waitlist if class is full
                </Label>
              </div>
            )}

            {/* Policy Agreement */}
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="policy" 
                checked={agreeToPolicy}
                onCheckedChange={setAgreeToPolicy}
              />
              <Label htmlFor="policy" className="text-sm leading-relaxed">
                I agree to the{' '}
                <button className="text-primary underline hover:no-underline">
                  cancellation policy
                </button>
                {' '}and understand that cancellations must be made at least 2 hours before class start time.
              </Label>
            </div>
          </div>

          {/* Warnings and Info */}
          <div className="space-y-2">
            {!hasEnoughCredits && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-900">Insufficient Credits</AlertTitle>
                <AlertDescription className="text-red-800">
                  You need {fitnessClass.credits_required} credits to book this class. You currently have {userCredits} credits.
                </AlertDescription>
              </Alert>
            )}

            {isFull && !acceptWaitlist && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-900">Class Full</AlertTitle>
                <AlertDescription className="text-yellow-800">
                  This class is currently full. Check the waitlist option to be notified if a spot becomes available.
                </AlertDescription>
              </Alert>
            )}

            {canBook && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Ready to book! {fitnessClass.credits_required} credit{fitnessClass.credits_required !== 1 ? 's' : ''} will be deducted from your account.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleBooking}
            disabled={(!canBook && !canWaitlist) || isBooking || loading}
            className="flex-1"
          >
            {isBooking ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : isFull ? (
              <Users className="h-4 w-4 mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            {isBooking 
              ? 'Booking...' 
              : isFull 
                ? 'Join Waitlist' 
                : 'Book Class'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}