'use client'
import type { Database } from '@/lib/supabase/types'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

type CreditTransaction = Database['public']['Tables']['credit_transactions']['Row']

export const transactionsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['transactions', userId] as const,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as CreditTransaction[]
    },
    staleTime: 30_000,
    enabled: !!userId,
  })

export function useTransactions(userId: string) {
  return useQuery(transactionsQueryOptions(userId))
}
