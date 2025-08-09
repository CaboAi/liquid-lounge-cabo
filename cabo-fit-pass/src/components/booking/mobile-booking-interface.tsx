'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { 
  Clock, 
  MapPin, 
  Users, 
  CreditCard, 
  AlertTriangle,
  Info,
  CheckCircle,
  X
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatTime, formatDate, getTimeUntilClass } from '@/lib/utils/date-time'
import { formatCredits, hasEnoughCredits } from '@/lib/utils/credits'
import { cn } from '@/lib/utils'
import type { FitnessClass, Gym } from '@/types/database.types'

interface MobileBookingInterfaceProps {
  class: FitnessClass & { gym?: Gym }
  userCredits: number
  spotsLeft: number
  isWaitlist?: boolean
  onBook: (data: {
    acceptWaitlist: boolean
    agreeToPolicy: boolean
    emergencyContact?: string
    specialRequirements?: string
  }) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  children?: React.ReactNode
}

export function MobileBookingInterface({
  class: fitnessClass,
  userCredits,
  spotsLeft,
  isWaitlist = false,
  onBook,
  onCancel,
  loading = false,
  children
}: MobileBookingInterfaceProps) {
  const [open, setOpen] = useState(false)
  const [acceptWaitlist, setAcceptWaitlist] = useState(false)
  const [agreeToPolicy, setAgreeToPolicy] = useState(false)
  const [emergencyContact, setEmergencyContact] = useState('')
  const [specialRequirements, setSpecialRequirements] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const { timeString, isStartingSoon, hasStarted } = getTimeUntilClass(fitnessClass.start_time)
  const { hasEnough: hasEnoughCreditsForClass, shortfall } = hasEnoughCredits(
    userCredits,
    fitnessClass.credits_required
  )

  const canBook = !hasStarted && (hasEnoughCreditsForClass || isWaitlist)
  const requiresWaitlist = spotsLeft === 0
  const willJoinWaitlist = requiresWaitlist || (isWaitlist && acceptWaitlist)

  const handleSubmit = async () => {
    if (!agreeToPolicy) {
      toast({
        title: 'Agreement Required',
        description: 'Please agree to the cancellation policy to continue.',
        variant: 'destructive'
      })
      return
    }

    if (requiresWaitlist && !acceptWaitlist) {
      toast({
        title: 'Waitlist Required',
        description: 'This class is full. Please accept to join the waitlist.',
        variant: 'destructive'
      })
      return
    }

    try {
      setSubmitting(true)
      await onBook({
        acceptWaitlist: willJoinWaitlist,
        agreeToPolicy,
        emergencyContact: emergencyContact || undefined,
        specialRequirements: specialRequirements || undefined
      })
      
      setOpen(false)
      toast({
        title: willJoinWaitlist ? 'Added to Waitlist' : 'Booking Confirmed',
        description: willJoinWaitlist 
          ? 'You\'ve been added to the waitlist. We\'ll notify you if a spot opens up.'
          : 'Your class has been booked successfully!'
      })
    } catch (error) {
      toast({
        title: 'Booking Failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button 
            className="w-full" 
            disabled={!canBook || loading}
            size="lg"
          >
            {requiresWaitlist ? 'Join Waitlist' : 'Book Class'}
          </Button>
        )}
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl">
            {willJoinWaitlist ? 'Join Waitlist' : 'Book Class'}
          </SheetTitle>
          <SheetDescription>
            Complete your booking for {fitnessClass.name}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Class Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{fitnessClass.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {formatTime(fitnessClass.start_time)}
                    </div>
                    <div className="text-muted-foreground">
                      {formatDate(fitnessClass.start_time)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
                    </div>
                    <div className="text-muted-foreground">
                      {fitnessClass.current_participants}/{fitnessClass.max_participants}
                    </div>
                  </div>
                </div>

                {fitnessClass.gym && (
                  <div className="flex items-center space-x-2 col-span-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">
                        {fitnessClass.gym.name}
                      </div>
                      <div className="text-muted-foreground text-xs truncate">
                        {fitnessClass.location || fitnessClass.gym.address}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 col-span-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {formatCredits(fitnessClass.credits_required)}
                    </span>
                    {!hasEnoughCreditsForClass && !willJoinWaitlist && (
                      <Badge variant="destructive" className="text-xs">
                        Need {shortfall} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Alerts */}
              {isStartingSoon && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This class is starting soon! Make sure you can arrive on time.
                  </AlertDescription>
                </Alert>
              )}

              {requiresWaitlist && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This class is currently full. You can join the waitlist and we'll notify you if a spot becomes available.
                  </AlertDescription>
                </Alert>
              )}

              {!hasEnoughCreditsForClass && !willJoinWaitlist && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You need {shortfall} more credits to book this class.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Emergency Contact */}
              <div className="space-y-2">
                <Label htmlFor="emergency-contact">
                  Emergency Contact (Optional)
                </Label>
                <Input
                  id="emergency-contact"
                  placeholder="Name and phone number"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                />
              </div>

              {/* Special Requirements */}
              <div className="space-y-2">
                <Label htmlFor="special-requirements">
                  Special Requirements (Optional)
                </Label>
                <Textarea
                  id="special-requirements"
                  placeholder="Any injuries, modifications, or special needs..."
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Waitlist Agreement */}
              {requiresWaitlist && (
                <div className="flex items-start space-x-2 p-4 bg-muted rounded-lg">
                  <Checkbox
                    id="accept-waitlist"
                    checked={acceptWaitlist}
                    onCheckedChange={setAcceptWaitlist}
                  />
                  <div className="space-y-1">
                    <Label 
                      htmlFor="accept-waitlist"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Join waitlist for this class
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      We'll notify you immediately if a spot becomes available. No credits will be charged until your booking is confirmed.
                    </p>
                  </div>
                </div>
              )}

              {/* Policy Agreement */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agree-policy"
                  checked={agreeToPolicy}
                  onCheckedChange={setAgreeToPolicy}
                />
                <div className="space-y-1">
                  <Label 
                    htmlFor="agree-policy"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the cancellation policy
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Free cancellation 24+ hours before class. 50% refund 2-24 hours before. 
                    No refund within 2 hours of class time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          {!willJoinWaitlist && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Class Fee</span>
                    <span>{formatCredits(fitnessClass.credits_required)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Your Balance</span>
                    <span>{formatCredits(userCredits)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-medium">
                      <span>Remaining Balance</span>
                      <span className={cn(
                        hasEnoughCreditsForClass ? 'text-green-600' : 'text-red-600'
                      )}>
                        {formatCredits(userCredits - fitnessClass.credits_required)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 sticky bottom-0 bg-background pt-4 pb-6">
            <Button
              onClick={handleSubmit}
              disabled={
                !canBook || 
                !agreeToPolicy || 
                (requiresWaitlist && !acceptWaitlist) || 
                submitting ||
                (!hasEnoughCreditsForClass && !willJoinWaitlist)
              }
              className="w-full"
              size="lg"
            >
              {submitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  {willJoinWaitlist ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Join Waitlist
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Book for {formatCredits(fitnessClass.credits_required)}
                    </>
                  )}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full"
              size="lg"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}