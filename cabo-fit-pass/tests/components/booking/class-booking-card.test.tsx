/**
 * @jest-environment jsdom
 */

import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { render, testUtils, mockData } from '@/tests/utils/test-utils'
import { mockHandlers } from '@/tests/mocks/server'

// Mock ClassBookingCard Component
const MockClassBookingCard = ({ 
  classData, 
  userCredits = 5,
  onBook,
  onFavorite 
}: {
  classData: any
  userCredits?: number
  onBook?: (classId: string) => void
  onFavorite?: (classId: string) => void
}) => {
  const [isBooking, setIsBooking] = React.useState(false)
  const [isBookmarked, setIsBookmarked] = React.useState(false)
  const [error, setError] = React.useState('')

  const isFullyBooked = classData.booked_count >= classData.capacity
  const spotsLeft = classData.capacity - classData.booked_count
  const hasEnoughCredits = userCredits >= classData.credits_required

  const handleBookClick = async () => {
    if (isFullyBooked || !hasEnoughCredits) return

    setIsBooking(true)
    setError('')

    try {
      const response = await fetch(`/api/classes/${classData.id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'test-user-id',
          credits_to_use: classData.credits_required,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Booking failed')
      }

      onBook?.(classData.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed')
    } finally {
      setIsBooking(false)
    }
  }

  const handleFavoriteClick = () => {
    setIsBookmarked(!isBookmarked)
    onFavorite?.(classData.id)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <article 
      className="class-card"
      data-testid="class-booking-card"
      aria-labelledby={`class-title-${classData.id}`}
      aria-describedby={`class-details-${classData.id}`}
    >
      <header>
        <h3 id={`class-title-${classData.id}`} data-testid="class-title">
          {classData.title}
        </h3>
        <button
          onClick={handleFavoriteClick}
          aria-label={`${isBookmarked ? 'Remove from' : 'Add to'} favorites`}
          data-testid="favorite-button"
          aria-pressed={isBookmarked}
        >
          {isBookmarked ? '❤️' : '🤍'}
        </button>
      </header>

      <div id={`class-details-${classData.id}`} data-testid="class-details">
        <p data-testid="instructor">Instructor: {classData.instructor}</p>
        <p data-testid="schedule">
          {formatTime(classData.start_time)} • {classData.duration} min
        </p>
        <p data-testid="availability" aria-live="polite">
          {isFullyBooked ? (
            <span className="text-red-600">Fully Booked</span>
          ) : (
            <span className="text-green-600">
              {spotsLeft} spot{spotsLeft === 1 ? '' : 's'} available
            </span>
          )}
        </p>
      </div>

      <div className="credits-info" data-testid="credits-info">
        <span>Credits required: {classData.credits_required}</span>
        <span>Your credits: {userCredits}</span>
      </div>

      {error && (
        <div 
          role="alert" 
          data-testid="booking-error"
          aria-live="assertive"
        >
          {error}
        </div>
      )}

      <footer>
        <button
          onClick={handleBookClick}
          disabled={isBooking || isFullyBooked || !hasEnoughCredits}
          data-testid="book-button"
          aria-describedby={`class-details-${classData.id}`}
          aria-disabled={isBooking || isFullyBooked || !hasEnoughCredits}
        >
          {isBooking ? (
            <>
              <span aria-hidden="true">⏳</span>
              <span>Booking...</span>
            </>
          ) : isFullyBooked ? (
            'Fully Booked'
          ) : !hasEnoughCredits ? (
            `Need ${classData.credits_required - userCredits} more credit${classData.credits_required - userCredits === 1 ? '' : 's'}`
          ) : (
            `Book Class (${classData.credits_required} credit${classData.credits_required === 1 ? '' : 's'})`
          )}
        </button>
      </footer>
    </article>
  )
}

describe('ClassBookingCard', () => {
  const mockClass = mockData.class()

  beforeEach(() => {
    mockHandlers.reset()
  })

  describe('Rendering', () => {
    it('displays class information correctly', () => {
      render(<MockClassBookingCard classData={mockClass} />)

      expect(screen.getByTestId('class-title')).toHaveTextContent(mockClass.title)
      expect(screen.getByTestId('instructor')).toHaveTextContent(mockClass.instructor)
      expect(screen.getByTestId('schedule')).toHaveTextContent(`${mockClass.duration} min`)
      expect(screen.getByTestId('credits-info')).toHaveTextContent(`Credits required: ${mockClass.credits_required}`)
    })

    it('shows availability status', () => {
      const availableClass = { ...mockClass, booked_count: 5, capacity: 20 }
      render(<MockClassBookingCard classData={availableClass} />)

      expect(screen.getByTestId('availability')).toHaveTextContent('15 spots available')
    })

    it('shows fully booked status', () => {
      const fullClass = { ...mockClass, booked_count: 20, capacity: 20 }
      render(<MockClassBookingCard classData={fullClass} />)

      expect(screen.getByTestId('availability')).toHaveTextContent('Fully Booked')
    })

    it('has proper semantic structure', () => {
      render(<MockClassBookingCard classData={mockClass} />)

      const card = screen.getByTestId('class-booking-card')
      const title = screen.getByTestId('class-title')
      
      expect(card).toHaveAttribute('role', 'article')
      expect(card).toHaveAttribute('aria-labelledby', `class-title-${mockClass.id}`)
      expect(title).toHaveAttribute('id', `class-title-${mockClass.id}`)
    })
  })

  describe('Booking Functionality', () => {
    it('enables booking when user has sufficient credits', () => {
      render(<MockClassBookingCard classData={mockClass} userCredits={5} />)

      const bookButton = screen.getByTestId('book-button')
      expect(bookButton).not.toBeDisabled()
      expect(bookButton).toHaveTextContent(/book class/i)
    })

    it('disables booking when user has insufficient credits', () => {
      render(<MockClassBookingCard classData={mockClass} userCredits={0} />)

      const bookButton = screen.getByTestId('book-button')
      expect(bookButton).toBeDisabled()
      expect(bookButton).toHaveTextContent(/need.*more credit/i)
    })

    it('disables booking when class is full', () => {
      const fullClass = { ...mockClass, booked_count: 20, capacity: 20 }
      render(<MockClassBookingCard classData={fullClass} userCredits={5} />)

      const bookButton = screen.getByTestId('book-button')
      expect(bookButton).toBeDisabled()
      expect(bookButton).toHaveTextContent(/fully booked/i)
    })

    it('handles successful booking', async () => {
      const onBook = jest.fn()
      const { user } = render(
        <MockClassBookingCard 
          classData={mockClass} 
          userCredits={5}
          onBook={onBook}
        />
      )

      const bookButton = screen.getByTestId('book-button')
      await user.click(bookButton)

      await waitFor(() => {
        expect(onBook).toHaveBeenCalledWith(mockClass.id)
      })
    })

    it('shows loading state during booking', async () => {
      const { user } = render(<MockClassBookingCard classData={mockClass} userCredits={5} />)

      const bookButton = screen.getByTestId('book-button')
      await user.click(bookButton)

      expect(screen.getByText(/booking/i)).toBeInTheDocument()
      expect(bookButton).toBeDisabled()
    })

    it('handles booking errors', async () => {
      mockHandlers.overrideClassFull()
      
      const { user } = render(<MockClassBookingCard classData={mockClass} userCredits={5} />)

      const bookButton = screen.getByTestId('book-button')
      await user.click(bookButton)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/class is full/i)
      })
    })

    it('handles insufficient credits error from server', async () => {
      mockHandlers.overrideInsufficientCredits()
      
      const { user } = render(<MockClassBookingCard classData={mockClass} userCredits={2} />)

      const bookButton = screen.getByTestId('book-button')
      await user.click(bookButton)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/insufficient credits/i)
      })
    })
  })

  describe('Favorite Functionality', () => {
    it('toggles favorite state', async () => {
      const { user } = render(<MockClassBookingCard classData={mockClass} />)

      const favoriteButton = screen.getByTestId('favorite-button')
      
      // Initially not favorited
      expect(favoriteButton).toHaveAttribute('aria-pressed', 'false')
      expect(favoriteButton).toHaveAttribute('aria-label', 'Add to favorites')

      await user.click(favoriteButton)

      expect(favoriteButton).toHaveAttribute('aria-pressed', 'true')
      expect(favoriteButton).toHaveAttribute('aria-label', 'Remove from favorites')
    })

    it('calls onFavorite callback', async () => {
      const onFavorite = jest.fn()
      const { user } = render(
        <MockClassBookingCard 
          classData={mockClass}
          onFavorite={onFavorite}
        />
      )

      const favoriteButton = screen.getByTestId('favorite-button')
      await user.click(favoriteButton)

      expect(onFavorite).toHaveBeenCalledWith(mockClass.id)
    })
  })

  describe('Accessibility', () => {
    it('provides proper ARIA labels and roles', () => {
      render(<MockClassBookingCard classData={mockClass} />)

      const card = screen.getByTestId('class-booking-card')
      const favoriteButton = screen.getByTestId('favorite-button')
      const bookButton = screen.getByTestId('book-button')

      expect(card).toHaveAttribute('role', 'article')
      expect(favoriteButton).toHaveAttribute('aria-label')
      expect(bookButton).toHaveAttribute('aria-describedby')
    })

    it('announces booking errors to screen readers', async () => {
      mockHandlers.overrideClassFull()
      
      const { user } = render(<MockClassBookingCard classData={mockClass} userCredits={5} />)

      await user.click(screen.getByTestId('book-button'))

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert')
        expect(errorAlert).toHaveAttribute('aria-live', 'assertive')
      })
    })

    it('announces availability changes', () => {
      const { rerender } = render(
        <MockClassBookingCard 
          classData={{ ...mockClass, booked_count: 18, capacity: 20 }} 
        />
      )

      const availabilityElement = screen.getByTestId('availability')
      expect(availabilityElement).toHaveAttribute('aria-live', 'polite')
      expect(availabilityElement).toHaveTextContent('2 spots available')

      // Simulate availability change
      rerender(
        <MockClassBookingCard 
          classData={{ ...mockClass, booked_count: 20, capacity: 20 }} 
        />
      )

      expect(availabilityElement).toHaveTextContent('Fully Booked')
    })

    it('supports keyboard navigation', async () => {
      const { user } = render(<MockClassBookingCard classData={mockClass} />)

      const favoriteButton = screen.getByTestId('favorite-button')
      const bookButton = screen.getByTestId('book-button')

      // Tab to favorite button
      await user.tab()
      expect(favoriteButton).toHaveFocus()

      // Tab to book button
      await user.tab()
      expect(bookButton).toHaveFocus()

      // Activate with keyboard
      await user.keyboard('{Enter}')
      expect(screen.getByText(/booking/i)).toBeInTheDocument()
    })

    it('provides appropriate disabled states', () => {
      const fullClass = { ...mockClass, booked_count: 20, capacity: 20 }
      render(<MockClassBookingCard classData={fullClass} userCredits={0} />)

      const bookButton = screen.getByTestId('book-button')
      expect(bookButton).toBeDisabled()
      expect(bookButton).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('Visual States', () => {
    it('shows correct button text for different states', () => {
      // Available class with sufficient credits
      const { rerender } = render(
        <MockClassBookingCard classData={mockClass} userCredits={5} />
      )
      expect(screen.getByText(/book class \(1 credit\)/i)).toBeInTheDocument()

      // Insufficient credits
      rerender(<MockClassBookingCard classData={mockClass} userCredits={0} />)
      expect(screen.getByText(/need 1 more credit/i)).toBeInTheDocument()

      // Full class
      const fullClass = { ...mockClass, booked_count: 20, capacity: 20 }
      rerender(<MockClassBookingCard classData={fullClass} userCredits={5} />)
      expect(screen.getByText(/fully booked/i)).toBeInTheDocument()
    })

    it('handles singular and plural forms correctly', () => {
      // Single credit required
      const singleCreditClass = { ...mockClass, credits_required: 1 }
      const { rerender } = render(
        <MockClassBookingCard classData={singleCreditClass} userCredits={5} />
      )
      expect(screen.getByText(/1 credit\)/i)).toBeInTheDocument()

      // Multiple credits required
      const multiCreditClass = { ...mockClass, credits_required: 3 }
      rerender(<MockClassBookingCard classData={multiCreditClass} userCredits={5} />)
      expect(screen.getByText(/3 credits\)/i)).toBeInTheDocument()

      // Single spot available
      const oneSpotClass = { ...mockClass, booked_count: 19, capacity: 20 }
      rerender(<MockClassBookingCard classData={oneSpotClass} userCredits={5} />)
      expect(screen.getByText(/1 spot available/i)).toBeInTheDocument()
    })
  })

  describe('Error Recovery', () => {
    it('clears error on successful retry', async () => {
      const { user } = render(<MockClassBookingCard classData={mockClass} userCredits={5} />)

      // First attempt fails
      mockHandlers.overrideClassFull()
      await user.click(screen.getByTestId('book-button'))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      // Reset to success
      mockHandlers.reset()
      await user.click(screen.getByTestId('book-button'))

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
    })
  })
})