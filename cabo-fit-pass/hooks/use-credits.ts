'use client'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export const creditsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['credits', userId] as const,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()
      if (error) throw error
      return data?.credits ?? 0
    },
    staleTime: 60_000,
    enabled: !!userId,
  })

export function useCredits(userId: string) {
  return useQuery(creditsQueryOptions(userId))
}
