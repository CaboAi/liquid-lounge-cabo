import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ClassCardProps {
  name: string
  studio: string
  time: string
  duration: number
  credits: number
  difficulty: string
  spotsLeft: number
}

export default function ClassCard({ name, studio, time, duration, credits, difficulty, spotsLeft }: ClassCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{name}</CardTitle>
          <Badge variant="secondary">{credits} credits</Badge>
        </div>
        <CardDescription>{studio}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Time:</span>
          <span>{time}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Duration:</span>
          <span>{duration} min</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Level:</span>
          <Badge variant="outline" className="text-xs">{difficulty}</Badge>
        </div>
        <div className="flex justify-between text-sm">
          <span>Spots left:</span>
          <span className={spotsLeft < 5 ? 'text-red-600 font-semibold' : ''}>{spotsLeft}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" disabled={spotsLeft === 0}>
          {spotsLeft === 0 ? 'Fully Booked' : 'Book Class'}
        </Button>
      </CardFooter>
    </Card>
  )
}
