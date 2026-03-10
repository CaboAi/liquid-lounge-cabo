import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { BookingCard } from './booking-card'

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ rpc: vi.fn() }),
}))

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

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    React.createElement(QueryClientProvider, { client: queryClient }, ui)
  )
}

describe('BookingCard', () => {
  it('renders booking status badge', () => {
    renderWithClient(<BookingCard booking={minimalBooking} userId="u-1" />)
    expect(screen.getByText('confirmed')).toBeTruthy()
  })

  it('renders class title from joined class object', () => {
    renderWithClient(<BookingCard booking={minimalBooking} userId="u-1" />)
    expect(screen.getByText('Morning Yoga')).toBeTruthy()
  })

  it('renders booked_at formatted date', () => {
    renderWithClient(<BookingCard booking={minimalBooking} userId="u-1" />)
    const dateText = screen.getByTestId('booked-at')
    expect(dateText.textContent).toBeTruthy()
  })

  it('renders "Unknown class" when class join is null', () => {
    renderWithClient(<BookingCard booking={{ ...minimalBooking, class: null }} userId="u-1" />)
    expect(screen.getByText('Unknown class')).toBeTruthy()
  })

  it('renders Cancel button for confirmed bookings', () => {
    renderWithClient(<BookingCard booking={minimalBooking} userId="u-1" />)
    expect(screen.getByTestId('cancel-button')).toBeTruthy()
  })

  it('does not render Cancel button for cancelled bookings', () => {
    renderWithClient(
      <BookingCard booking={{ ...minimalBooking, status: 'cancelled' }} userId="u-1" />
    )
    expect(screen.queryByTestId('cancel-button')).toBeNull()
  })
})
