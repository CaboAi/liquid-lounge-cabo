'use client'

import { useEffect, useRef, useState, createContext, useContext, ReactNode } from 'react'

// Live region context for global announcements
interface LiveRegionContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void
  announceStatus: (message: string) => void
  announceError: (message: string) => void
  announceSuccess: (message: string) => void
}

const LiveRegionContext = createContext<LiveRegionContextType | null>(null)

// Provider component
export function LiveRegionProvider({ children }: { children: ReactNode }) {
  const politeRef = useRef<HTMLDivElement>(null)
  const assertiveRef = useRef<HTMLDivElement>(null)

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const regionRef = priority === 'assertive' ? assertiveRef : politeRef
    
    if (regionRef.current) {
      // Clear previous message first to ensure screen readers pick up the new one
      regionRef.current.textContent = ''
      
      // Set new message with a slight delay
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message
        }
      }, 100)
    }
  }

  const announceStatus = (message: string) => {
    announce(message, 'polite')
  }

  const announceError = (message: string) => {
    announce(`Error: ${message}`, 'assertive')
  }

  const announceSuccess = (message: string) => {
    announce(`Success: ${message}`, 'polite')
  }

  const contextValue: LiveRegionContextType = {
    announce,
    announceStatus,
    announceError,
    announceSuccess
  }

  return (
    <LiveRegionContext.Provider value={contextValue}>
      {children}
      
      {/* Live regions for screen reader announcements */}
      <div
        ref={politeRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      <div
        ref={assertiveRef}
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </LiveRegionContext.Provider>
  )
}

// Hook to use live region announcements
export function useLiveRegion() {
  const context = useContext(LiveRegionContext)
  
  if (!context) {
    throw new Error('useLiveRegion must be used within a LiveRegionProvider')
  }
  
  return context
}

// Standalone live region component
export function LiveRegion({ 
  message,
  priority = 'polite',
  clearAfter = 5000
}: {
  message?: string
  priority?: 'polite' | 'assertive'
  clearAfter?: number
}) {
  const [currentMessage, setCurrentMessage] = useState(message)

  useEffect(() => {
    if (message) {
      setCurrentMessage(message)
      
      if (clearAfter > 0) {
        const timer = setTimeout(() => {
          setCurrentMessage('')
        }, clearAfter)
        
        return () => clearTimeout(timer)
      }
    }
  }, [message, clearAfter])

  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {currentMessage}
    </div>
  )
}

// Status announcer for form validation
export function FormStatusAnnouncer({ 
  errors,
  successMessage,
  isSubmitting 
}: {
  errors?: Record<string, string>
  successMessage?: string
  isSubmitting?: boolean
}) {
  const { announceError, announceSuccess, announceStatus } = useLiveRegion()
  const prevErrorsRef = useRef<Record<string, string>>({})
  const prevSuccessRef = useRef<string>()

  useEffect(() => {
    if (isSubmitting) {
      announceStatus('Submitting form...')
    }
  }, [isSubmitting, announceStatus])

  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      const newErrors = Object.entries(errors).filter(
        ([field, error]) => prevErrorsRef.current[field] !== error
      )
      
      if (newErrors.length > 0) {
        const errorMessages = newErrors.map(([field, error]) => `${field}: ${error}`).join(', ')
        announceError(`Form validation errors: ${errorMessages}`)
        prevErrorsRef.current = { ...errors }
      }
    }
  }, [errors, announceError])

  useEffect(() => {
    if (successMessage && successMessage !== prevSuccessRef.current) {
      announceSuccess(successMessage)
      prevSuccessRef.current = successMessage
    }
  }, [successMessage, announceSuccess])

  return null
}

// Loading status announcer
export function LoadingStatusAnnouncer({ 
  isLoading,
  loadingMessage = 'Loading...',
  completeMessage = 'Loading complete'
}: {
  isLoading: boolean
  loadingMessage?: string
  completeMessage?: string
}) {
  const { announceStatus } = useLiveRegion()
  const wasLoadingRef = useRef(false)

  useEffect(() => {
    if (isLoading && !wasLoadingRef.current) {
      announceStatus(loadingMessage)
      wasLoadingRef.current = true
    } else if (!isLoading && wasLoadingRef.current) {
      announceStatus(completeMessage)
      wasLoadingRef.current = false
    }
  }, [isLoading, loadingMessage, completeMessage, announceStatus])

  return null
}

// Navigation announcer
export function NavigationAnnouncer({ 
  currentPage,
  totalPages 
}: {
  currentPage?: string
  totalPages?: number
}) {
  const { announceStatus } = useLiveRegion()
  const prevPageRef = useRef<string>()

  useEffect(() => {
    if (currentPage && currentPage !== prevPageRef.current) {
      const message = totalPages 
        ? `Navigated to ${currentPage}, page ${currentPage} of ${totalPages}`
        : `Navigated to ${currentPage}`
      
      announceStatus(message)
      prevPageRef.current = currentPage
    }
  }, [currentPage, totalPages, announceStatus])

  return null
}

// Dynamic content announcer
export function DynamicContentAnnouncer({ 
  content,
  contentType = 'content',
  announceEmpty = false
}: {
  content?: any[]
  contentType?: string
  announceEmpty?: boolean
}) {
  const { announceStatus } = useLiveRegion()
  const prevCountRef = useRef<number>(0)

  useEffect(() => {
    if (content) {
      const currentCount = content.length
      const prevCount = prevCountRef.current

      if (currentCount !== prevCount) {
        if (currentCount === 0 && announceEmpty) {
          announceStatus(`No ${contentType} available`)
        } else if (currentCount > prevCount) {
          const newItems = currentCount - prevCount
          announceStatus(`${newItems} new ${contentType} ${newItems === 1 ? 'item' : 'items'} added. Total: ${currentCount}`)
        } else if (currentCount < prevCount) {
          announceStatus(`${contentType} updated. Total: ${currentCount} ${currentCount === 1 ? 'item' : 'items'}`)
        }

        prevCountRef.current = currentCount
      }
    }
  }, [content, contentType, announceEmpty, announceStatus])

  return null
}

// Search results announcer
export function SearchResultsAnnouncer({ 
  results,
  searchTerm,
  isSearching 
}: {
  results?: any[]
  searchTerm?: string
  isSearching?: boolean
}) {
  const { announceStatus } = useLiveRegion()

  useEffect(() => {
    if (isSearching) {
      announceStatus(searchTerm ? `Searching for ${searchTerm}...` : 'Searching...')
    }
  }, [isSearching, searchTerm, announceStatus])

  useEffect(() => {
    if (results && !isSearching) {
      const count = results.length
      const message = searchTerm
        ? `Search for "${searchTerm}" returned ${count} ${count === 1 ? 'result' : 'results'}`
        : `${count} ${count === 1 ? 'result' : 'results'} found`
      
      announceStatus(message)
    }
  }, [results, isSearching, searchTerm, announceStatus])

  return null
}

// Booking status announcer
export function BookingStatusAnnouncer({ 
  bookingStatus,
  className 
}: {
  bookingStatus?: 'pending' | 'confirmed' | 'cancelled' | 'waitlisted'
  className?: string
}) {
  const { announceStatus, announceSuccess, announceError } = useLiveRegion()
  const prevStatusRef = useRef<string>()

  useEffect(() => {
    if (bookingStatus && bookingStatus !== prevStatusRef.current) {
      switch (bookingStatus) {
        case 'pending':
          announceStatus('Booking request pending...')
          break
        case 'confirmed':
          announceSuccess('Booking confirmed successfully')
          break
        case 'cancelled':
          announceStatus('Booking has been cancelled')
          break
        case 'waitlisted':
          announceStatus('Added to waitlist')
          break
      }
      
      prevStatusRef.current = bookingStatus
    }
  }, [bookingStatus, announceStatus, announceSuccess, announceError])

  return <div className={`sr-only ${className}`} />
}