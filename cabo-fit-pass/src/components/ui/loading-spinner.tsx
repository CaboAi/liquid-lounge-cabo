'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'dots' | 'pulse' | 'bounce' | 'spinner'
  className?: string
  text?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default',
  className,
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className="flex space-x-1">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className={cn(
                'rounded-full bg-primary',
                size === 'sm' ? 'h-2 w-2' :
                size === 'md' ? 'h-3 w-3' :
                size === 'lg' ? 'h-4 w-4' :
                'h-5 w-5'
              )}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: index * 0.2
              }}
            />
          ))}
        </div>
        {text && (
          <span className={cn('text-muted-foreground', textSizes[size])}>
            {text}
          </span>
        )}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center space-x-3', className)}>
        <motion.div
          className={cn(
            'rounded-full bg-primary',
            sizeClasses[size]
          )}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        {text && (
          <span className={cn('text-muted-foreground', textSizes[size])}>
            {text}
          </span>
        )}
      </div>
    )
  }

  if (variant === 'bounce') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className="flex space-x-1">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className={cn(
                'rounded-full bg-primary',
                size === 'sm' ? 'h-2 w-2' :
                size === 'md' ? 'h-3 w-3' :
                size === 'lg' ? 'h-4 w-4' :
                'h-5 w-5'
              )}
              animate={{
                y: [0, -10, 0]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: index * 0.1
              }}
            />
          ))}
        </div>
        {text && (
          <span className={cn('text-muted-foreground', textSizes[size])}>
            {text}
          </span>
        )}
      </div>
    )
  }

  if (variant === 'spinner') {
    return (
      <div className={cn('flex items-center space-x-3', className)}>
        <motion.div
          className={cn(
            'border-2 border-muted border-t-primary rounded-full',
            sizeClasses[size]
          )}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        {text && (
          <span className={cn('text-muted-foreground', textSizes[size])}>
            {text}
          </span>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <motion.div
        className={cn(
          'border-2 border-muted-foreground/20 border-t-primary rounded-full',
          sizeClasses[size]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      {text && (
        <span className={cn('text-muted-foreground', textSizes[size])}>
          {text}
        </span>
      )}
    </div>
  )
}

// Full screen loading overlay
export function LoadingOverlay({ 
  show,
  text = 'Loading...',
  variant = 'default'
}: {
  show: boolean
  text?: string
  variant?: 'default' | 'dots' | 'pulse' | 'bounce' | 'spinner'
}) {
  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center space-y-4 bg-background border rounded-lg p-8 shadow-lg"
      >
        <LoadingSpinner size="lg" variant={variant} />
        <p className="text-sm text-muted-foreground">{text}</p>
      </motion.div>
    </motion.div>
  )
}

// Inline loading state
export function InlineLoader({ 
  text = 'Loading...',
  size = 'sm'
}: {
  text?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size={size} text={text} variant="dots" />
    </div>
  )
}

// Button loading state
export function ButtonSpinner({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn('h-4 w-4 border-2 border-background/20 border-t-background rounded-full', className)}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  )
}

// Progress indicator
export function ProgressSpinner({ 
  progress,
  size = 'md',
  showPercentage = false 
}: {
  progress: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
}) {
  const radius = size === 'sm' ? 20 : size === 'md' ? 24 : 32
  const strokeWidth = size === 'sm' ? 2 : size === 'md' ? 3 : 4
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20'
  }

  return (
    <div className={cn('relative', sizeClasses[size])}>
      <svg
        className="transform -rotate-90 h-full w-full"
        width={radius * 2}
        height={radius * 2}
      >
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="text-primary transition-all duration-300 ease-out"
        />
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="text-muted-foreground/20"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  )
}

// Skeleton loading animation
export function SkeletonLoader({ 
  className,
  variant = 'default'
}: {
  className?: string
  variant?: 'default' | 'text' | 'avatar' | 'card'
}) {
  const baseClasses = 'animate-pulse bg-muted rounded'
  
  const variantClasses = {
    default: '',
    text: 'h-4',
    avatar: 'h-10 w-10 rounded-full',
    card: 'h-32'
  }

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)} />
  )
}

// Typing indicator
export function TypingIndicator() {
  return (
    <div className="flex space-x-1 p-3">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="h-2 w-2 bg-muted-foreground/50 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  )
}