'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { bookingsQueryOptions } from './use-bookings'

type CancelVars = { userId: string; bookingId: string }
type CancelResult = { refunded: boolean }
type CancelError = { message: string; code: string }
type CancelContext = { previousBookings: unknown }

export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation<CancelResult, CancelError, CancelVars, CancelContext>({
    mutationFn: async ({ userId, bookingId }) => {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc('cancel_booking', {
        p_user_id: userId,
        p_booking_id: bookingId,
      })
      if (error) throw { message: (error as { message: string }).message, code: 'rpc_error' }
      const result = data as { refunded?: boolean; error?: string }
      if (result?.error) throw { message: result.error, code: result.error }
      return { refunded: result?.refunded ?? false }
    },
    onMutate: async ({ userId, bookingId }) => {
      await queryClient.cancelQueries(bookingsQueryOptions(userId))
      const previousBookings = queryClient.getQueryData(bookingsQueryOptions(userId).queryKey)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData(bookingsQueryOptions(userId).queryKey, (old: any) => {
        if (!Array.isArray(old)) return old
        return old.map((b: { id: string }) =>
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        )
      })
      return { previousBookings }
    },
    onError: (_err, { userId }, context) => {
      if (context?.previousBookings !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryClient.setQueryData(bookingsQueryOptions(userId).queryKey, context.previousBookings as any)
      }
    },
    onSettled: (_data, _err, { userId }) => {
      queryClient.invalidateQueries(bookingsQueryOptions(userId))
      queryClient.invalidateQueries({ queryKey: ['credits', userId] })
    },
  })
}
