import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useCancelBooking } from './use-cancel-booking'

const mockRpc = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    rpc: mockRpc,
  }),
}))

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  vi.spyOn(queryClient, 'invalidateQueries')
  vi.spyOn(queryClient, 'cancelQueries').mockResolvedValue(undefined)
  vi.spyOn(queryClient, 'getQueryData').mockReturnValue(undefined)
  vi.spyOn(queryClient, 'setQueryData').mockReturnValue(undefined)
  return {
    wrapper: ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children),
    queryClient,
  }
}

describe('useCancelBooking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('resolves with { refunded: true } when RPC returns { refunded: true }', async () => {
    mockRpc.mockResolvedValueOnce({ data: { refunded: true }, error: null })
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useCancelBooking(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ userId: 'user-1', bookingId: 'booking-1' })
    })

    await waitFor(() => expect(result.current.data).toEqual({ refunded: true }))
  })

  it('resolves with { refunded: false } when RPC returns { refunded: false }', async () => {
    mockRpc.mockResolvedValueOnce({ data: { refunded: false }, error: null })
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useCancelBooking(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ userId: 'user-1', bookingId: 'booking-1' })
    })

    await waitFor(() => expect(result.current.data).toEqual({ refunded: false }))
  })

  it('throws with code booking_not_found when RPC returns { error: "booking_not_found" }', async () => {
    mockRpc.mockResolvedValueOnce({ data: { error: 'booking_not_found' }, error: null })
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useCancelBooking(), { wrapper })

    await expect(
      act(async () => {
        await result.current.mutateAsync({ userId: 'user-1', bookingId: 'booking-999' })
      })
    ).rejects.toMatchObject({ code: 'booking_not_found' })
  })

  it('throws with code cancellation_window_passed when RPC returns { error: "cancellation_window_passed" }', async () => {
    mockRpc.mockResolvedValueOnce({ data: { error: 'cancellation_window_passed' }, error: null })
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useCancelBooking(), { wrapper })

    await expect(
      act(async () => {
        await result.current.mutateAsync({ userId: 'user-1', bookingId: 'booking-1' })
      })
    ).rejects.toMatchObject({ code: 'cancellation_window_passed' })
  })

  it('calls invalidateQueries for bookings and credits on settle', async () => {
    mockRpc.mockResolvedValueOnce({ data: { refunded: true }, error: null })
    const { wrapper, queryClient } = makeWrapper()
    const { result } = renderHook(() => useCancelBooking(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ userId: 'user-1', bookingId: 'booking-1' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['bookings', 'user-1'] })
    )
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['credits', 'user-1'] })
    )
  })
})
