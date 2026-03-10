'use client'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export type ClassFilters = {
  class_type?: string
  difficulty_level?: string
  studio_id?: string
  from?: string
  to?: string
}

export const classesQueryOptions = (filters: ClassFilters = {}) =>
  queryOptions({
    queryKey: ['classes', filters] as const,
    queryFn: async () => {
      const supabase = createClient()
      let query = supabase
        .from('classes')
        .select('*, studios(id, name, address, slug), bookings(count)')
        .eq('is_cancelled', false)
        .order('scheduled_at', { ascending: true })

      if (filters.class_type) query = query.eq('class_type', filters.class_type)
      if (filters.difficulty_level) query = query.eq('difficulty_level', filters.difficulty_level)
      if (filters.studio_id) query = query.eq('studio_id', filters.studio_id)
      if (filters.from) query = query.gte('scheduled_at', filters.from)
      if (filters.to) query = query.lte('scheduled_at', filters.to)

      const { data, error } = await query
      if (error) throw error
      return data ?? []
    },
    staleTime: 30_000,
  })

export function useClasses(filters: ClassFilters = {}) {
  return useQuery(classesQueryOptions(filters))
}
