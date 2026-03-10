'use client'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export const bookingsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['bookings', userId] as const,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('bookings')
        .select('*, classes(title, scheduled_at)')
        .eq('user_id', userId)
        .order('booked_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    staleTime: 30_000,
    enabled: !!userId,
  })

export function useBookings(userId: string) {
  return useQuery(bookingsQueryOptions(userId))
}
