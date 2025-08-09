'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  CreditCard,
  Calendar,
  Heart,
  Share2,
  MoreVertical
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { formatDate, formatTime, getTimeUntilClass } from '@/lib/utils/date-time'
import { formatCredits } from '@/lib/utils/credits'
import { cn } from '@/lib/utils'
import type { FitnessClass, Gym, Booking } from '@/types/database.types'

interface MobileClassCardProps {
  class: FitnessClass & {
    gym?: Gym
    spotsLeft: number
    userBooking?: Booking
  }
  onBook?: () => void
  onCancel?: () => void
  onShare?: () => void
  onFavorite?: () => void
  loading?: boolean
  isFavorited?: boolean
  compact?: boolean
}

export function MobileClassCard({
  class: fitnessClass,
  onBook,
  onCancel,
  onShare,
  onFavorite,
  loading = false,
  isFavorited = false,
  compact = false
}: MobileClassCardProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const { toast } = useToast()

  const {
    timeString,
    isStartingSoon,
    hasStarted,
    canCheckIn
  } = getTimeUntilClass(fitnessClass.start_time)

  const isBooked = !!fitnessClass.userBooking
  const isWaitlisted = fitnessClass.userBooking?.status === 'waitlisted'
  const spotsLeft = Math.max(0, fitnessClass.spotsLeft)
  const isFullyBooked = spotsLeft === 0 && !isWaitlisted

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: fitnessClass.name,
          text: `Join me for ${fitnessClass.name} at ${fitnessClass.gym?.name}`,
          url: window.location.origin + `/classes/${fitnessClass.id}`
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      navigator.clipboard.writeText(window.location.origin + `/classes/${fitnessClass.id}`)
      toast({
        title: 'Link copied!',
        description: 'Class link copied to clipboard'
      })
    }
    onShare?.()
  }

  const handleFavorite = () => {
    onFavorite?.()
    toast({
      title: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      description: isFavorited 
        ? 'Class removed from your favorites' 
        : 'Class added to your favorites'
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'moderate': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'extreme': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  if (compact) {
    return (
      <Card className="group overflow-hidden transition-all duration-200 hover:shadow-md active:scale-[0.98]">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
              {fitnessClass.image_url && (
                <Image
                  src={fitnessClass.image_url}
                  alt={fitnessClass.name}
                  fill
                  className={cn(
                    'object-cover transition-opacity duration-300',
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  )}
                  onLoad={() => setImageLoading(false)}
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm truncate">{fitnessClass.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(fitnessClass.start_time)} • {fitnessClass.duration}min
                  </p>
                </div>
                
                <div className="flex items-center space-x-1 ml-2">
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {formatCredits(fitnessClass.credits_required)}
                  </Badge>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{spotsLeft} left</span>
                </div>

                {isBooked ? (
                  <Badge variant={isWaitlisted ? 'secondary' : 'default'} className="text-xs">
                    {isWaitlisted ? 'Waitlisted' : 'Booked'}
                  </Badge>
                ) : (
                  <Button size="sm" className="h-7 px-3 text-xs" onClick={onBook} disabled={loading}>
                    Book
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group overflow-hidden transition-all duration-200 hover:shadow-lg active:scale-[0.98]">
      {/* Image Header */}
      <div className="relative h-48 bg-muted">
        {fitnessClass.image_url && (
          <Image
            src={fitnessClass.image_url}
            alt={fitnessClass.name}
            fill
            className={cn(
              'object-cover transition-opacity duration-300',
              imageLoading ? 'opacity-0' : 'opacity-100'
            )}
            onLoad={() => setImageLoading(false)}
          />
        )}
        
        {/* Overlay with status indicators */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Top badges */}
        <div className="absolute left-3 top-3 flex items-center space-x-2">
          {isStartingSoon && (
            <Badge className="bg-orange-500 text-white">Starting Soon</Badge>
          )}
          {hasStarted && (
            <Badge className="bg-red-500 text-white">In Progress</Badge>
          )}
          {isFullyBooked && (
            <Badge variant="secondary">Full</Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute right-3 top-3 flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30"
            onClick={handleFavorite}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={cn('h-4 w-4', isFavorited && 'fill-current text-red-500')} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                aria-label="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/classes/${fitnessClass.id}`}>
                  View Details
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-bold text-white text-lg line-clamp-2 mb-1">
            {fitnessClass.name}
          </h3>
          <p className="text-white/90 text-sm">
            {fitnessClass.instructor_name}
          </p>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <Badge className={cn('text-xs', getDifficultyColor(fitnessClass.difficulty))}>
            {fitnessClass.difficulty}
          </Badge>
          <Badge className={cn('text-xs', getIntensityColor(fitnessClass.intensity))}>
            {fitnessClass.intensity}
          </Badge>
          {fitnessClass.category && (
            <Badge variant="outline" className="text-xs">
              {fitnessClass.category}
            </Badge>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <div>
              <div className="font-medium text-foreground">
                {formatTime(fitnessClass.start_time)}
              </div>
              <div className="text-xs">{timeString}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-muted-foreground">
            <Users className="h-4 w-4 flex-shrink-0" />
            <div>
              <div className="font-medium text-foreground">
                {spotsLeft} spots left
              </div>
              <div className="text-xs">
                {fitnessClass.current_participants}/{fitnessClass.max_participants} booked
              </div>
            </div>
          </div>

          {fitnessClass.gym && (
            <div className="flex items-center space-x-2 text-muted-foreground col-span-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-foreground truncate">
                  {fitnessClass.gym.name}
                </div>
                <div className="text-xs truncate">
                  {fitnessClass.location || fitnessClass.gym.address}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 text-muted-foreground col-span-2">
            <CreditCard className="h-4 w-4 flex-shrink-0" />
            <div>
              <div className="font-medium text-foreground">
                {formatCredits(fitnessClass.credits_required)}
              </div>
              {fitnessClass.average_rating && (
                <div className="flex items-center space-x-1 text-xs">
                  <Star className="h-3 w-3 fill-current text-yellow-400" />
                  <span>{fitnessClass.average_rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {fitnessClass.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {fitnessClass.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {isBooked ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 py-2">
                <Badge variant={isWaitlisted ? 'secondary' : 'default'} className="text-sm">
                  {isWaitlisted ? 'You are waitlisted' : 'You are booked'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {canCheckIn && (
                  <Button size="sm" className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Check In
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                
                <Link href={`/classes/${fitnessClass.id}`} className="col-span-full">
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                className="w-full" 
                onClick={onBook}
                disabled={loading || hasStarted}
              >
                {isFullyBooked ? 'Join Waitlist' : 'Book Class'}
              </Button>
              
              <Link href={`/classes/${fitnessClass.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  Details
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}