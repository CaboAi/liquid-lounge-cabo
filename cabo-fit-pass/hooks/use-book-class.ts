'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { bookingsQueryOptions } from './use-bookings'

type BookClassVars = { userId: string; classId: string }
type BookClassResult = { booking_id: string }
type BookClassError = { message: string; code: string }

export function useBookClass() {
  const queryClient = useQueryClient()

  return useMutation<BookClassResult, BookClassError, BookClassVars>({
    mutationFn: async ({ userId, classId }) => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('book_class', {
        p_user_id: userId,
        p_class_id: classId,
      })
      if (error) throw { message: error.message, code: 'rpc_error' }
      const result = data as { booking_id?: string; error?: string }
      if (result?.error) throw { message: result.error, code: result.error }
      return result as BookClassResult
    },
    onMutate: async ({ userId }) => {
      await queryClient.cancelQueries(bookingsQueryOptions(userId))
      const previousBookings = queryClient.getQueryData(bookingsQueryOptions(userId).queryKey)
      return { previousBookings }
    },
    onError: (_err, { userId }, context) => {
      if (context?.previousBookings) {
        queryClient.setQueryData(bookingsQueryOptions(userId).queryKey, context.previousBookings)
      }
    },
    onSettled: (_data, _err, { userId }) => {
      queryClient.invalidateQueries(bookingsQueryOptions(userId))
      queryClient.invalidateQueries({ queryKey: ['credits', userId] })
    },
  })
}
