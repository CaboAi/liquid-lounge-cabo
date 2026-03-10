'use client'
import type { Database } from "@/lib/supabase/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCancelBooking } from "@/hooks/use-cancel-booking"
import { ERROR_MESSAGES } from "@/lib/booking-errors"

type BookingWithClass = Database['public']['Tables']['bookings']['Row'] & {
  class: { title: string; scheduled_at: string } | null
}

type BookingCardProps = {
  booking: BookingWithClass
  userId: string
}

function statusVariant(status: string): 'default' | 'destructive' | 'secondary' {
  if (status === 'confirmed') return 'default'
  if (status === 'cancelled') return 'destructive'
  return 'secondary'
}

export function BookingCard({ booking, userId }: BookingCardProps) {
  const cancelBooking = useCancelBooking()
  const classTitle = booking.class?.title ?? 'Unknown class'
  const bookedAt = new Date(booking.booked_at).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  const cancelError = cancelBooking.error
  const cancelErrorMessage = cancelError
    ? (cancelError.code in ERROR_MESSAGES
        ? ERROR_MESSAGES[cancelError.code as keyof typeof ERROR_MESSAGES]
        : cancelError.message)
    : null

  return (
    <Card className="w-full">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="font-medium">{classTitle}</p>
            <p className="text-sm text-muted-foreground" data-testid="booked-at">{bookedAt}</p>
            <p className="text-sm text-muted-foreground">{booking.credits_charged} credits charged</p>
            {cancelErrorMessage && (
              <p className="text-sm text-destructive" data-testid="cancel-error">
                {cancelErrorMessage}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={statusVariant(booking.status)}>{booking.status}</Badge>
            {booking.status === 'confirmed' && (
              <Button
                variant="outline"
                size="sm"
                data-testid="cancel-button"
                disabled={cancelBooking.isPending}
                onClick={() => cancelBooking.mutate({ userId, bookingId: booking.id })}
              >
                {cancelBooking.isPending ? 'Cancelling...' : 'Cancel'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
