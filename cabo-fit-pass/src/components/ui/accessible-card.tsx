'use client'

import React from 'react'
import { Card, CardProps, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { touchTarget, contrast, ARIA } from '@/lib/utils/accessibility'
import { HoverCard } from '@/components/ui/page-transition'

interface AccessibleCardProps extends CardProps {
  // Enhanced accessibility props
  title?: string
  description?: string
  interactive?: boolean
  pressed?: boolean
  selected?: boolean
  onInteract?: () => void
  ariaLabel?: string
  ariaDescribedby?: string
  role?: string
  touchOptimized?: boolean
  animateOnHover?: boolean
}

export const AccessibleCard = React.forwardRef<HTMLDivElement, AccessibleCardProps>(
  ({
    className,
    title,
    description,
    children,
    interactive = false,
    pressed,
    selected,
    onInteract,
    ariaLabel,
    ariaDescribedby,
    role,
    touchOptimized = true,
    animateOnHover = true,
    onClick,
    onKeyDown,
    ...props
  }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(e)
      onInteract?.()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (interactive && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        onInteract?.()
      }
      onKeyDown?.(e)
    }

    const enhancedClassName = cn(
      className,
      interactive && [
        'cursor-pointer',
        touchOptimized && touchTarget.minSize,
        contrast.focusVisible,
        selected && 'ring-2 ring-primary',
        'hover:shadow-md transition-shadow'
      ]
    )

    const ariaProps = {
      ...(ariaLabel && { 'aria-label': ariaLabel }),
      ...(ariaDescribedby && { 'aria-describedby': ariaDescribedby }),
      ...(pressed !== undefined && ARIA.button.pressed(pressed)),
      ...(selected !== undefined && { 'aria-selected': selected }),
      ...(interactive && {
        tabIndex: 0,
        role: role || 'button'
      })
    }

    const CardComponent = animateOnHover && interactive ? HoverCard : Card

    return (
      <CardComponent
        ref={ref}
        className={enhancedClassName}
        onClick={interactive ? handleClick : onClick}
        onKeyDown={interactive ? handleKeyDown : onKeyDown}
        {...ariaProps}
        {...props}
      >
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        {children && <CardContent>{children}</CardContent>}
      </CardComponent>
    )
  }
)

AccessibleCard.displayName = 'AccessibleCard'

// Class card with accessibility
interface ClassCardProps extends AccessibleCardProps {
  classData: {
    id: string
    title: string
    instructor: string
    startTime: Date
    duration: number
    spotsAvailable: number
    totalSpots: number
    isBookmarked?: boolean
  }
  onBook?: () => void
  onBookmark?: () => void
  compact?: boolean
}

export const ClassCard = React.forwardRef<HTMLDivElement, ClassCardProps>(
  ({ classData, onBook, onBookmark, compact = false, ...props }, ref) => {
    const { title, instructor, startTime, duration, spotsAvailable, totalSpots, isBookmarked } = classData
    
    const spotsLeft = spotsAvailable
    const isFullyBooked = spotsLeft === 0
    
    const cardLabel = `${title} class with ${instructor}. ${
      isFullyBooked ? 'Fully booked' : `${spotsLeft} spots available`
    }. Starts at ${startTime.toLocaleTimeString()}`

    return (
      <AccessibleCard
        ref={ref}
        interactive={true}
        ariaLabel={cardLabel}
        role="article"
        touchOptimized={true}
        animateOnHover={!compact}
        {...props}
      >
        <div className={cn('p-4', compact ? 'space-y-2' : 'space-y-3')}>
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                'font-semibold truncate',
                compact ? 'text-sm' : 'text-base'
              )}>
                {title}
              </h3>
              <p className={cn(
                'text-muted-foreground truncate',
                compact ? 'text-xs' : 'text-sm'
              )}>
                {instructor}
              </p>
            </div>
            
            {onBookmark && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onBookmark()
                }}
                className={cn(
                  'p-1 rounded-full hover:bg-accent',
                  touchTarget.minSize,
                  contrast.focusVisible
                )}
                aria-label={`${isBookmarked ? 'Remove from' : 'Add to'} favorites`}
              >
                <span className={`text-lg ${isBookmarked ? '❤️' : '🤍'}`} aria-hidden="true" />
              </button>
            )}
          </div>
          
          <div className={cn(
            'flex items-center justify-between',
            compact ? 'text-xs' : 'text-sm'
          )}>
            <div className="text-muted-foreground">
              {startTime.toLocaleTimeString()} • {duration}min
            </div>
            
            <div className={cn(
              'font-medium',
              isFullyBooked ? 'text-destructive' : 'text-foreground'
            )}>
              {isFullyBooked ? 'Full' : `${spotsLeft}/${totalSpots} spots`}
            </div>
          </div>
          
          {!compact && onBook && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onBook()
              }}
              disabled={isFullyBooked}
              className={cn(
                'w-full mt-3 py-2 px-4 rounded-md font-medium transition-colors',
                touchTarget.minSize,
                contrast.focusVisible,
                isFullyBooked
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
              aria-label={isFullyBooked ? 'Class is full' : `Book ${title} class`}
            >
              {isFullyBooked ? 'Class Full' : 'Book Class'}
            </button>
          )}
        </div>
      </AccessibleCard>
    )
  }
)

ClassCard.displayName = 'ClassCard'

// Studio card
interface StudioCardProps extends AccessibleCardProps {
  studioData: {
    id: string
    name: string
    address: string
    rating: number
    classCount: number
    distance?: string
    image?: string
  }
  onViewClasses?: () => void
}

export const StudioCard = React.forwardRef<HTMLDivElement, StudioCardProps>(
  ({ studioData, onViewClasses, ...props }, ref) => {
    const { name, address, rating, classCount, distance, image } = studioData
    
    const cardLabel = `${name} studio. ${rating} star rating. ${classCount} classes available. ${
      distance ? `${distance} away` : ''
    }. Located at ${address}`

    return (
      <AccessibleCard
        ref={ref}
        interactive={true}
        ariaLabel={cardLabel}
        role="article"
        touchOptimized={true}
        {...props}
      >
        <div className="aspect-video w-full bg-muted rounded-t-lg overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={`${name} studio`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-4xl" aria-hidden="true">🏋️</span>
            </div>
          )}
        </div>
        
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-base truncate">{name}</h3>
            <p className="text-sm text-muted-foreground truncate">{address}</p>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <span className="text-yellow-500" aria-hidden="true">⭐</span>
              <span>{rating}</span>
              <span className="text-muted-foreground sr-only">star rating</span>
            </div>
            
            <div className="text-muted-foreground">
              {classCount} classes
            </div>
            
            {distance && (
              <div className="text-muted-foreground">
                {distance}
              </div>
            )}
          </div>
          
          {onViewClasses && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onViewClasses()
              }}
              className={cn(
                'w-full py-2 px-4 rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors',
                touchTarget.minSize,
                contrast.focusVisible
              )}
              aria-label={`View classes at ${name}`}
            >
              View Classes
            </button>
          )}
        </div>
      </AccessibleCard>
    )
  }
)

StudioCard.displayName = 'StudioCard'