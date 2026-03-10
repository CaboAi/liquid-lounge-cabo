import { describe, it, expect, vi } from 'vitest'
import { classesQueryOptions, useClasses } from './use-classes'

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })
    })
  })
}))

describe('classesQueryOptions', () => {
  it('returns queryKey [classes, {}] with empty filters', () => {
    const opts = classesQueryOptions()
    expect(opts.queryKey).toEqual(['classes', {}])
  })

  it('returns queryKey with class_type filter', () => {
    const opts = classesQueryOptions({ class_type: 'yoga' })
    expect(opts.queryKey).toEqual(['classes', { class_type: 'yoga' }])
  })

  it('returns queryKey with from/to date range filters (CLASS-03)', () => {
    const opts = classesQueryOptions({ from: '2026-03-10', to: '2026-03-17' })
    expect(opts.queryKey).toEqual(['classes', { from: '2026-03-10', to: '2026-03-17' }])
  })

  it('calls supabase.from("classes") with studios in select string', async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })

    vi.mocked(await import('@/lib/supabase/client')).createClient = () =>
      ({ from: mockFrom }) as any

    const opts = classesQueryOptions()
    await opts.queryFn({ queryKey: opts.queryKey, signal: new AbortController().signal, meta: undefined })

    expect(mockFrom).toHaveBeenCalledWith('classes')
    expect(mockSelect.mock.calls[0][0]).toContain('studios')
  })
})

describe('useClasses', () => {
  it('is a function', () => {
    expect(typeof useClasses).toBe('function')
  })
})
