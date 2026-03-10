import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

type ClassCardClass = {
  id: string
  title: string
  instructor_name: string
  class_type: string
  difficulty_level: string
  scheduled_at: string
  duration_minutes: number
  credit_cost: number
  max_capacity: number
  studio: { name: string; address: string }
  spots_remaining: number
}

type ClassCardProps = {
  class: ClassCardClass
  onBook: (id: string) => void
  userCredits: number
  isPending?: boolean
}

export function ClassCard({ class: classData, onBook, userCredits, isPending }: ClassCardProps) {
  if (isPending) {
    return <div className="h-40 rounded-xl bg-muted animate-pulse" data-testid="class-skeleton" />
  }

  const canBook = userCredits >= classData.credit_cost && classData.spots_remaining > 0
  const scheduledDate = new Date(classData.scheduled_at).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{classData.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{classData.instructor_name}</p>
          </div>
          <Badge variant={classData.difficulty_level === 'beginner' ? 'secondary' :
                         classData.difficulty_level === 'intermediate' ? 'default' : 'destructive'}>
            {classData.difficulty_level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            <span>{classData.studio.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>{classData.duration_minutes} min — {scheduledDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            <span className={cn(classData.spots_remaining === 0 && 'text-destructive font-medium')}>
              {classData.spots_remaining === 0 ? 'Full' : `${classData.spots_remaining} spots left`}
            </span>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="font-semibold">{classData.credit_cost} credits</span>
            <Button
              onClick={() => onBook(classData.id)}
              disabled={!canBook}
              size="sm"
            >
              {canBook ? 'Book Class' : classData.spots_remaining === 0 ? 'Class Full' : 'Not enough credits'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
