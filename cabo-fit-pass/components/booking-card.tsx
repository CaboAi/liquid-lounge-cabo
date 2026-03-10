import type { Database } from "@/lib/supabase/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type BookingWithClass = Database['public']['Tables']['bookings']['Row'] & {
  class: { title: string; scheduled_at: string } | null
}

type BookingCardProps = {
  booking: BookingWithClass
}

function statusVariant(status: string): 'default' | 'destructive' | 'secondary' {
  if (status === 'confirmed') return 'default'
  if (status === 'cancelled') return 'destructive'
  return 'secondary'
}

export function BookingCard({ booking }: BookingCardProps) {
  const classTitle = booking.class?.title ?? 'Unknown class'
  const bookedAt = new Date(booking.booked_at).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <Card className="w-full">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="font-medium">{classTitle}</p>
            <p className="text-sm text-muted-foreground" data-testid="booked-at">{bookedAt}</p>
            <p className="text-sm text-muted-foreground">{booking.credits_charged} credits charged</p>
          </div>
          <Badge variant={statusVariant(booking.status)}>{booking.status}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
