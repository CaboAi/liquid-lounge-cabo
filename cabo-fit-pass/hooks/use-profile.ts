'use client'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export const profileQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['profile', userId] as const,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      return data
    },
    staleTime: 60_000,
    enabled: !!userId,
  })

export function useProfile(userId: string) {
  return useQuery(profileQueryOptions(userId))
}
