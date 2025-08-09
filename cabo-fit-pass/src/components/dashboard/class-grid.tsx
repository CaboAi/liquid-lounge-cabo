'use client'

import { useState } from 'react'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  Heart,
  Star,
  TrendingUp,
  Info
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
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { FitnessClass } from '@/types/database.types'

interface ClassGridProps {
  classes: FitnessClass[]
  onBookClass?: (classId: string) => void
  onToggleFavorite?: (classId: string) => void
  loading?: boolean
  className?: string
}

export function ClassGrid({ 
  classes, 
  onBookClass, 
  onToggleFavorite,
  loading = false,
  className 
}: ClassGridProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const handleToggleFavorite = (classId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(classId)) {
      newFavorites.delete(classId)
    } else {
      newFavorites.add(classId)
    }
    setFavorites(newFavorites)
    onToggleFavorite?.(classId)
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

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return { variant: 'outline' as const, text: 'Beginner' }
      case 'intermediate':
        return { variant: 'secondary' as const, text: 'Intermediate' }
      case 'advanced':
        return { variant: 'default' as const, text: 'Advanced' }
      default:
        return { variant: 'outline' as const, text: 'All Levels' }
    }
  }

  const formatTime = (datetime: string) => {
    const date = new Date(datetime)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (datetime: string) => {
    const date = new Date(datetime)
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

  if (loading) {
    return (
      <div className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", className)}>
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="h-9 bg-gray-200 rounded w-full"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (classes.length === 0) {
    return (
      <Card className={cn("col-span-full", className)}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold mb-2">No classes available</p>
          <p className="text-sm text-muted-foreground text-center">
            Check back later for upcoming fitness classes
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", className)}>
      <TooltipProvider>
        {classes.map((fitnessClass) => {
          const isFavorite = favorites.has(fitnessClass.id)
          const spotsLeft = fitnessClass.max_participants - fitnessClass.current_participants
          const bookingPercentage = (fitnessClass.current_participants / fitnessClass.max_participants) * 100
          const difficulty = getDifficultyBadge(fitnessClass.difficulty)
          
          return (
            <Card 
              key={fitnessClass.id} 
              className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Class Image/Banner */}
              {fitnessClass.image_url && (
                <div className="relative h-32 overflow-hidden">
                  <img 
                    src={fitnessClass.image_url} 
                    alt={fitnessClass.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-white hover:bg-white/20"
                    onClick={() => handleToggleFavorite(fitnessClass.id)}
                  >
                    <Heart className={cn(
                      "h-5 w-5",
                      isFavorite && "fill-red-500 text-red-500"
                    )} />
                  </Button>
                </div>
              )}
              
              <CardHeader className={!fitnessClass.image_url ? 'pb-3' : 'pt-3 pb-3'}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg line-clamp-1">
                      {fitnessClass.name}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-1">
                      {fitnessClass.instructor_name}
                    </CardDescription>
                  </div>
                  {!fitnessClass.image_url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 -mt-1 -mr-2"
                      onClick={() => handleToggleFavorite(fitnessClass.id)}
                    >
                      <Heart className={cn(
                        "h-4 w-4",
                        isFavorite && "fill-current text-red-500"
                      )} />
                    </Button>
                  )}
                </div>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant={difficulty.variant} className="text-xs">
                    {difficulty.text}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", getIntensityColor(fitnessClass.intensity))}
                  >
                    {fitnessClass.intensity} Intensity
                  </Badge>
                  {fitnessClass.category && (
                    <Badge variant="secondary" className="text-xs">
                      {fitnessClass.category}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Date and Time */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">
                      {formatDate(fitnessClass.start_time)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatTime(fitnessClass.start_time)}
                    </span>
                  </div>
                </div>
                
                {/* Location */}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{fitnessClass.location}</span>
                </div>
                
                {/* Duration and Credits */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{fitnessClass.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span>{fitnessClass.credits_required} credit{fitnessClass.credits_required !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                
                {/* Availability */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{fitnessClass.current_participants}/{fitnessClass.max_participants} spots</span>
                    </div>
                    {spotsLeft <= 3 && spotsLeft > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        Only {spotsLeft} left!
                      </Badge>
                    )}
                    {spotsLeft === 0 && (
                      <Badge variant="outline" className="text-xs">
                        Full
                      </Badge>
                    )}
                  </div>
                  <Progress value={bookingPercentage} className="h-2" />
                </div>

                {/* Rating */}
                {fitnessClass.average_rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {fitnessClass.average_rating.toFixed(1)}
                      </span>
                    </div>
                    {fitnessClass.total_ratings && (
                      <span className="text-xs text-muted-foreground">
                        ({fitnessClass.total_ratings} reviews)
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="pt-3">
                <Button 
                  className="w-full" 
                  onClick={() => onBookClass?.(fitnessClass.id)}
                  disabled={spotsLeft === 0}
                >
                  {spotsLeft === 0 ? 'Class Full' : 'Book Class'}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </TooltipProvider>
    </div>
  )
}