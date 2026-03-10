import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BookingCard } from './booking-card'

const minimalBooking = {
  id: 'bk-1',
  user_id: 'u-1',
  class_id: 'cls-1',
  status: 'confirmed',
  credits_charged: 3,
  booked_at: '2026-03-10T10:00:00Z',
  cancelled_at: null,
  class: { title: 'Morning Yoga', scheduled_at: '2026-03-15T08:00:00Z' },
}

describe('BookingCard', () => {
  it('renders booking status badge', () => {
    render(<BookingCard booking={minimalBooking} />)
    expect(screen.getByText('confirmed')).toBeTruthy()
  })

  it('renders class title from joined class object', () => {
    render(<BookingCard booking={minimalBooking} />)
    expect(screen.getByText('Morning Yoga')).toBeTruthy()
  })

  it('renders booked_at formatted date', () => {
    render(<BookingCard booking={minimalBooking} />)
    // The date '2026-03-10T10:00:00Z' should be rendered in some human-readable form
    const dateText = screen.getByTestId('booked-at')
    expect(dateText.textContent).toBeTruthy()
  })

  it('renders "Unknown class" when class join is null', () => {
    render(<BookingCard booking={{ ...minimalBooking, class: null }} />)
    expect(screen.getByText('Unknown class')).toBeTruthy()
  })
})
