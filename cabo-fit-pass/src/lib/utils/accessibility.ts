'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

// Focus trap utilities
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [isActive])

  return containerRef
}

// Escape key handler
export function useEscapeKey(onEscape: () => void, isActive: boolean = true) {
  useEffect(() => {
    if (!isActive) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onEscape, isActive])
}

// Screen reader announcements
export function useScreenReaderAnnouncements() {
  const [announcements, setAnnouncements] = useState<string[]>([])

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncements(prev => [...prev, `${priority}:${message}`])
  }, [])

  return { announcements, announce }
}

// Keyboard navigation hook
export function useKeyboardNavigation<T extends HTMLElement>(
  items: T[], 
  options: {
    loop?: boolean
    direction?: 'horizontal' | 'vertical' | 'both'
    onSelect?: (index: number) => void
  } = {}
) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { loop = true, direction = 'vertical', onSelect } = options

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const { key } = e
    let newIndex = currentIndex

    if (direction === 'vertical' || direction === 'both') {
      if (key === 'ArrowDown') {
        e.preventDefault()
        newIndex = currentIndex + 1
      } else if (key === 'ArrowUp') {
        e.preventDefault()
        newIndex = currentIndex - 1
      }
    }

    if (direction === 'horizontal' || direction === 'both') {
      if (key === 'ArrowRight') {
        e.preventDefault()
        newIndex = currentIndex + 1
      } else if (key === 'ArrowLeft') {
        e.preventDefault()
        newIndex = currentIndex - 1
      }
    }

    if (key === 'Home') {
      e.preventDefault()
      newIndex = 0
    } else if (key === 'End') {
      e.preventDefault()
      newIndex = items.length - 1
    } else if (key === 'Enter' || key === ' ') {
      e.preventDefault()
      onSelect?.(currentIndex)
      return
    }

    // Handle wrapping
    if (newIndex < 0) {
      newIndex = loop ? items.length - 1 : 0
    } else if (newIndex >= items.length) {
      newIndex = loop ? 0 : items.length - 1
    }

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex)
      items[newIndex]?.focus()
    }
  }, [currentIndex, items, loop, direction, onSelect])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return { currentIndex, setCurrentIndex }
}

// Live region for dynamic content
export function useLiveRegion() {
  const regionRef = useRef<HTMLDivElement>(null)

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (regionRef.current) {
      regionRef.current.setAttribute('aria-live', priority)
      regionRef.current.textContent = message
    }
  }, [])

  const LiveRegion = () => (
    <div
      ref={regionRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  )

  return { announce, LiveRegion }
}

// Skip navigation
export function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
    >
      Skip to main content
    </a>
  )
}

// ARIA utilities
export const ARIA = {
  // Generates unique IDs for ARIA relationships
  useId: (prefix: string = 'aria') => {
    const [id] = useState(() => `${prefix}-${Math.random().toString(36).substr(2, 9)}`)
    return id
  },

  // Common ARIA attributes for components
  button: {
    expanded: (isExpanded: boolean) => ({
      'aria-expanded': isExpanded,
    }),
    pressed: (isPressed: boolean) => ({
      'aria-pressed': isPressed,
    }),
    controls: (controlsId: string) => ({
      'aria-controls': controlsId,
    }),
    describedBy: (descriptionId: string) => ({
      'aria-describedby': descriptionId,
    }),
  },

  dialog: {
    modal: (labelId: string, descriptionId?: string) => ({
      role: 'dialog',
      'aria-modal': true,
      'aria-labelledby': labelId,
      ...(descriptionId && { 'aria-describedby': descriptionId }),
    }),
  },

  menu: {
    menubar: () => ({
      role: 'menubar',
    }),
    menu: () => ({
      role: 'menu',
    }),
    menuitem: (hasSubmenu: boolean = false) => ({
      role: hasSubmenu ? 'menuitem' : 'menuitem',
      ...(hasSubmenu && { 'aria-haspopup': true }),
    }),
  },

  list: {
    list: () => ({
      role: 'list',
    }),
    listitem: () => ({
      role: 'listitem',
    }),
  },

  form: {
    required: (isRequired: boolean) => ({
      'aria-required': isRequired,
    }),
    invalid: (isInvalid: boolean, errorId?: string) => ({
      'aria-invalid': isInvalid,
      ...(isInvalid && errorId && { 'aria-describedby': errorId }),
    }),
  },

  loading: {
    busy: (isLoading: boolean) => ({
      'aria-busy': isLoading,
    }),
    live: (priority: 'polite' | 'assertive' = 'polite') => ({
      'aria-live': priority,
      'aria-atomic': true,
    }),
  },
}

// Screen reader only text component
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>
}

// Focus visible utilities
export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false)

  useEffect(() => {
    let hadKeyboardEvent = false

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.altKey || e.ctrlKey) return
      hadKeyboardEvent = true
    }

    const onPointerDown = () => {
      hadKeyboardEvent = false
    }

    const onFocus = () => {
      setIsFocusVisible(hadKeyboardEvent)
    }

    const onBlur = () => {
      setIsFocusVisible(false)
    }

    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('mousedown', onPointerDown, true)
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('focusin', onFocus, true)
    document.addEventListener('focusout', onBlur, true)

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('mousedown', onPointerDown, true)
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('focusin', onFocus, true)
      document.removeEventListener('focusout', onBlur, true)
    }
  }, [])

  return isFocusVisible
}

// Reduced motion utilities
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// High contrast detection
export function useHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setPrefersHighContrast(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersHighContrast
}

// Touch target size utilities
export const touchTarget = {
  // Ensures minimum 44px touch target as per WCAG guidelines
  minSize: 'min-h-[44px] min-w-[44px]',
  
  // Larger touch targets for better accessibility
  large: 'min-h-[56px] min-w-[56px]',
  
  // Helper for adding touch-friendly padding
  padding: 'p-3',
  
  // Interactive area with proper spacing
  interactive: 'min-h-[44px] min-w-[44px] p-2 flex items-center justify-center'
}

// Color contrast utilities
export const contrast = {
  // High contrast text combinations
  highContrast: 'text-foreground bg-background',
  
  // Accessible color combinations
  accessible: {
    primary: 'text-primary-foreground bg-primary',
    secondary: 'text-secondary-foreground bg-secondary',
    destructive: 'text-destructive-foreground bg-destructive',
    muted: 'text-muted-foreground bg-muted',
  },
  
  // Focus indicators
  focus: 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
}

// Semantic HTML helpers
export const semantic = {
  // Main content landmark
  main: (label?: string) => ({
    role: 'main',
    ...(label && { 'aria-label': label })
  }),
  
  // Navigation landmark
  nav: (label: string) => ({
    role: 'navigation',
    'aria-label': label
  }),
  
  // Content info (footer)
  contentinfo: () => ({
    role: 'contentinfo'
  }),
  
  // Banner (header)
  banner: () => ({
    role: 'banner'
  }),
  
  // Search landmark
  search: () => ({
    role: 'search'
  }),
  
  // Complementary content (sidebar)
  complementary: (label?: string) => ({
    role: 'complementary',
    ...(label && { 'aria-label': label })
  }),
}