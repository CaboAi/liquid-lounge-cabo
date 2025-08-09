'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface FocusTrapProps {
  children: ReactNode
  isActive?: boolean
  initialFocus?: 'first' | 'last' | 'auto'
  restoreFocus?: boolean
  className?: string
}

export function FocusTrap({ 
  children, 
  isActive = true,
  initialFocus = 'first',
  restoreFocus = true,
  className 
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    
    // Store previously focused element
    if (restoreFocus) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement
    }

    // Get all focusable elements
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled]), [contenteditable]:not([contenteditable="false"])'
    )

    const focusableArray = Array.from(focusableElements)
    const firstFocusable = focusableArray[0]
    const lastFocusable = focusableArray[focusableArray.length - 1]

    // Set initial focus
    if (focusableArray.length > 0) {
      const targetElement = initialFocus === 'last' ? lastFocusable : firstFocusable
      targetElement?.focus()
    }

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || focusableArray.length === 0) return

      if (focusableArray.length === 1) {
        e.preventDefault()
        return
      }

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable?.focus()
        }
      }
    }

    // Add event listener to the container to catch all tab events
    container.addEventListener('keydown', handleTabKey)

    // Cleanup
    return () => {
      container.removeEventListener('keydown', handleTabKey)
      
      // Restore focus to previously focused element
      if (restoreFocus && previouslyFocusedRef.current) {
        previouslyFocusedRef.current.focus()
      }
    }
  }, [isActive, initialFocus, restoreFocus])

  if (!isActive) {
    return <>{children}</>
  }

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

// Modal focus trap with backdrop handling
export function ModalFocusTrap({ 
  children, 
  isOpen, 
  onClose,
  className 
}: {
  children: ReactNode
  isOpen: boolean
  onClose?: () => void
  className?: string
}) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }

    const handleBackdropClick = (e: MouseEvent) => {
      if (e.target === overlayRef.current) {
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handleBackdropClick)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleBackdropClick)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <FocusTrap className={className}>
        {children}
      </FocusTrap>
    </div>
  )
}

// Sheet/drawer focus trap
export function SheetFocusTrap({ 
  children, 
  isOpen, 
  onClose,
  side = 'right',
  className 
}: {
  children: ReactNode
  isOpen: boolean
  onClose?: () => void
  side?: 'left' | 'right' | 'top' | 'bottom'
  className?: string
}) {
  if (!isOpen) return null

  const sideClasses = {
    left: 'left-0 top-0 h-full',
    right: 'right-0 top-0 h-full',
    top: 'top-0 left-0 w-full',
    bottom: 'bottom-0 left-0 w-full'
  }

  return (
    <ModalFocusTrap isOpen={isOpen} onClose={onClose}>
      <div className={`fixed ${sideClasses[side]} ${className}`}>
        {children}
      </div>
    </ModalFocusTrap>
  )
}

// Combobox/dropdown focus trap
export function DropdownFocusTrap({ 
  children, 
  isOpen, 
  onClose,
  triggerRef,
  className 
}: {
  children: ReactNode
  isOpen: boolean
  onClose?: () => void
  triggerRef?: React.RefObject<HTMLElement>
  className?: string
}) {
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.()
        triggerRef?.current?.focus()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dropdown-content]') && !target.closest('[data-dropdown-trigger]')) {
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, triggerRef])

  if (!isOpen) return null

  return (
    <div data-dropdown-content className={className}>
      <FocusTrap>
        {children}
      </FocusTrap>
    </div>
  )
}