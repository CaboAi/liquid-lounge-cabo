'use client'

import React from 'react'
import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { touchTarget, contrast, ARIA } from '@/lib/utils/accessibility'
import { useLiveRegion } from '@/components/accessibility/live-region'

interface AccessibleButtonProps extends ButtonProps {
  // Enhanced accessibility props
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-pressed'?: boolean
  'aria-controls'?: string
  loading?: boolean
  loadingText?: string
  confirmAction?: boolean
  confirmText?: string
  successMessage?: string
  errorMessage?: string
  announcement?: string
  touchOptimized?: boolean
}

export const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    className,
    children,
    onClick,
    loading = false,
    loadingText = 'Loading...',
    confirmAction = false,
    confirmText = 'Are you sure?',
    successMessage,
    errorMessage,
    announcement,
    touchOptimized = true,
    disabled,
    'aria-describedby': ariaDescribedby,
    'aria-expanded': ariaExpanded,
    'aria-pressed': ariaPressed,
    'aria-controls': ariaControls,
    ...props
  }, ref) => {
    const { announce, announceSuccess, announceError } = useLiveRegion()
    
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return
      
      // Confirm action if required
      if (confirmAction && !window.confirm(confirmText)) {
        return
      }
      
      // Announce action if specified
      if (announcement) {
        announce(announcement)
      }
      
      try {
        await onClick?.(e)
        
        // Announce success if specified
        if (successMessage) {
          announceSuccess(successMessage)
        }
      } catch (error) {
        // Announce error if specified
        if (errorMessage) {
          announceError(errorMessage)
        }
      }
    }
    
    const enhancedClassName = cn(
      className,
      touchOptimized && touchTarget.minSize,
      contrast.focusVisible
    )
    
    const ariaProps = {
      ...(ariaDescribedby && { 'aria-describedby': ariaDescribedby }),
      ...(ariaExpanded !== undefined && ARIA.button.expanded(ariaExpanded)),
      ...(ariaPressed !== undefined && ARIA.button.pressed(ariaPressed)),
      ...(ariaControls && ARIA.button.controls(ariaControls)),
      ...(loading && ARIA.loading.busy(loading))
    }
    
    return (
      <Button
        ref={ref}
        className={enhancedClassName}
        onClick={handleClick}
        disabled={loading || disabled}
        {...ariaProps}
        {...props}
      >
        {loading ? loadingText : children}
      </Button>
    )
  }
)

AccessibleButton.displayName = 'AccessibleButton'

// Specialized accessible buttons
export const ConfirmButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (props, ref) => (
    <AccessibleButton
      ref={ref}
      confirmAction={true}
      confirmText="This action cannot be undone. Continue?"
      variant="destructive"
      {...props}
    />
  )
)
ConfirmButton.displayName = 'ConfirmButton'

export const ToggleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps & {
  pressed: boolean
  onToggle: (pressed: boolean) => void
  pressedLabel?: string
  unpressedLabel?: string
}>(
  ({ pressed, onToggle, pressedLabel, unpressedLabel, children, ...props }, ref) => {
    const label = pressed ? pressedLabel : unpressedLabel
    
    return (
      <AccessibleButton
        ref={ref}
        aria-pressed={pressed}
        onClick={() => onToggle(!pressed)}
        announcement={`${children} ${pressed ? 'deactivated' : 'activated'}`}
        {...props}
      >
        {label || children}
      </AccessibleButton>
    )
  }
)
ToggleButton.displayName = 'ToggleButton'

export const LoadingButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps & {
  isLoading: boolean
}>(
  ({ isLoading, children, loadingText, ...props }, ref) => (
    <AccessibleButton
      ref={ref}
      loading={isLoading}
      loadingText={loadingText || `Loading ${children}...`}
      {...props}
    >
      {children}
    </AccessibleButton>
  )
)
LoadingButton.displayName = 'LoadingButton'