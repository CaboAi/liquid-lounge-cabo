'use client'
import { useState } from 'react'
import { useClasses } from '@/hooks/use-classes'
import type { ClassFilters } from '@/hooks/use-classes'
import { ClassCard } from '@/components/class-card'
import type { Database } from '@/lib/supabase/types'

type ClassRow = Database['public']['Tables']['classes']['Row']

type ClassWithRelations = ClassRow & {
  studios: { id: string; name: string; address: string | null; slug: string } | null
  bookings: { count: number }[]
}

function ClassesLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
      Failed to load classes: {message}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="py-16 text-center text-muted-foreground">
      <p className="text-lg font-medium">No classes found</p>
      <p className="text-sm">Try adjusting your filters</p>
    </div>
  )
}

export function ClassesClient() {
  const [filters, setFilters] = useState<ClassFilters>({})
  const { data, isPending, isError, error } = useClasses(filters)

  if (isPending) return <ClassesLoadingSkeleton />
  if (isError) return <ErrorState message={(error as Error).message} />
  if (!data || data.length === 0) return <EmptyState />

  const classes = data as unknown as ClassWithRelations[]

  return (
    <div className="space-y-4">
      {classes.map((cls) => {
        const confirmedCount = Array.isArray(cls.bookings) ? (cls.bookings[0]?.count ?? 0) : 0
        const spotsRemaining = Math.max(0, cls.max_capacity - confirmedCount)
        return (
          <ClassCard
            key={cls.id}
            class={{
              id: cls.id,
              title: cls.title,
              instructor_name: '',
              class_type: cls.class_type,
              difficulty_level: cls.difficulty_level,
              scheduled_at: cls.scheduled_at,
              duration_minutes: cls.duration_minutes,
              credit_cost: cls.credit_cost,
              max_capacity: cls.max_capacity,
              studio: { name: cls.studios?.name ?? 'Studio', address: cls.studios?.address ?? '' },
              spots_remaining: spotsRemaining,
            }}
            onBook={(id) => console.log('book', id)}
            userCredits={0}
          />
        )
      })}
    </div>
  )
}
