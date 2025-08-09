'use client'

import React from 'react'
import { Input, InputProps } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ARIA, contrast } from '@/lib/utils/accessibility'

interface AccessibleInputProps extends Omit<InputProps, 'id'> {
  label: string
  error?: string
  description?: string
  required?: boolean
  id?: string
  showLabel?: boolean
  labelClassName?: string
}

export const AccessibleInput = React.forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({
    label,
    error,
    description,
    required = false,
    id: providedId,
    showLabel = true,
    labelClassName,
    className,
    'aria-describedby': ariaDescribedby,
    ...props
  }, ref) => {
    const id = providedId || `input-${React.useId()}`
    const errorId = error ? `${id}-error` : undefined
    const descriptionId = description ? `${id}-description` : undefined
    
    // Combine all describing element IDs
    const allDescribedBy = [
      ariaDescribedby,
      errorId,
      descriptionId
    ].filter(Boolean).join(' ')

    return (
      <div className="space-y-2">
        {showLabel && (
          <Label 
            htmlFor={id}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              required && "after:content-['*'] after:text-destructive after:ml-1",
              labelClassName
            )}
          >
            {label}
          </Label>
        )}
        
        {description && (
          <p 
            id={descriptionId}
            className="text-sm text-muted-foreground"
          >
            {description}
          </p>
        )}
        
        <Input
          ref={ref}
          id={id}
          className={cn(
            className,
            contrast.focusVisible,
            error && 'border-destructive focus-visible:ring-destructive'
          )}
          aria-describedby={allDescribedBy || undefined}
          {...ARIA.form.required(required)}
          {...ARIA.form.invalid(!!error, errorId)}
          {...props}
        />
        
        {error && (
          <p 
            id={errorId}
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

AccessibleInput.displayName = 'AccessibleInput'

// Search input with enhanced accessibility
interface AccessibleSearchInputProps extends Omit<AccessibleInputProps, 'type'> {
  onSearch?: (value: string) => void
  searchResults?: number
  placeholder?: string
}

export const AccessibleSearchInput = React.forwardRef<HTMLInputElement, AccessibleSearchInputProps>(
  ({ onSearch, searchResults, placeholder = 'Search...', ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onSearch?.(e.currentTarget.value)
      }
      props.onKeyDown?.(e)
    }

    const resultDescription = searchResults !== undefined 
      ? `${searchResults} ${searchResults === 1 ? 'result' : 'results'} found`
      : undefined

    return (
      <AccessibleInput
        ref={ref}
        type="search"
        role="searchbox"
        placeholder={placeholder}
        description={resultDescription}
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  }
)

AccessibleSearchInput.displayName = 'AccessibleSearchInput'

// Password input with accessibility features
export const AccessiblePasswordInput = React.forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ description, ...props }, ref) => {
    const passwordDescription = [
      description,
      'Password must be at least 8 characters long'
    ].filter(Boolean).join('. ')

    return (
      <AccessibleInput
        ref={ref}
        type="password"
        description={passwordDescription}
        autoComplete="current-password"
        {...props}
      />
    )
  }
)

AccessiblePasswordInput.displayName = 'AccessiblePasswordInput'

// Email input with validation
export const AccessibleEmailInput = React.forwardRef<HTMLInputElement, AccessibleInputProps>(
  (props, ref) => (
    <AccessibleInput
      ref={ref}
      type="email"
      autoComplete="email"
      placeholder="Enter your email address"
      {...props}
    />
  )
)

AccessibleEmailInput.displayName = 'AccessibleEmailInput'

// Phone input
export const AccessiblePhoneInput = React.forwardRef<HTMLInputProps, AccessibleInputProps>(
  (props, ref) => (
    <AccessibleInput
      ref={ref}
      type="tel"
      autoComplete="tel"
      placeholder="Enter your phone number"
      {...props}
    />
  )
)

AccessiblePhoneInput.displayName = 'AccessiblePhoneInput'