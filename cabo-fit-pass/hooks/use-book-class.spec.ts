import { describe, test, expect, vi, beforeEach } from 'vitest'

const mockRpc = vi.fn()
const mockInvalidateQueries = vi.fn()
const mockCancelQueries = vi.fn()
const mockGetQueryData = vi.fn()
const mockSetQueryData = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    rpc: mockRpc,
  }),
}))

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()
  return {
    ...actual,
    useMutation: vi.fn((opts: { mutationFn: (vars: unknown) => Promise<unknown> }) => ({
      mutateAsync: opts.mutationFn,
    })),
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
      cancelQueries: mockCancelQueries,
      getQueryData: mockGetQueryData,
      setQueryData: mockSetQueryData,
    }),
  }
})

const userId = 'user-123'
const classId = 'class-456'

describe('useBookClass', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('mutationFn returns { booking_id } when RPC succeeds', async () => {
    const bookingId = 'booking-789'
    mockRpc.mockResolvedValue({ data: { booking_id: bookingId }, error: null })

    const { useBookClass } = await import('./use-book-class')
    const mutation = useBookClass() as { mutateAsync: (v: { userId: string; classId: string }) => Promise<{ booking_id: string }> }

    const result = await mutation.mutateAsync({ userId, classId })

    expect(result).toEqual({ booking_id: bookingId })
    expect(mockRpc).toHaveBeenCalledWith('book_class', {
      p_user_id: userId,
      p_class_id: classId,
    })
  })

  test('mutationFn throws { code: "class_full" } when RPC returns { error: "class_full" }', async () => {
    mockRpc.mockResolvedValue({ data: { error: 'class_full' }, error: null })

    const { useBookClass } = await import('./use-book-class')
    const mutation = useBookClass() as { mutateAsync: (v: { userId: string; classId: string }) => Promise<unknown> }

    await expect(mutation.mutateAsync({ userId, classId })).rejects.toMatchObject({
      code: 'class_full',
    })
  })

  test('mutationFn throws { code: "already_booked" } when RPC returns { error: "already_booked" }', async () => {
    mockRpc.mockResolvedValue({ data: { error: 'already_booked' }, error: null })

    const { useBookClass } = await import('./use-book-class')
    const mutation = useBookClass() as { mutateAsync: (v: { userId: string; classId: string }) => Promise<unknown> }

    await expect(mutation.mutateAsync({ userId, classId })).rejects.toMatchObject({
      code: 'already_booked',
    })
  })

  test('mutationFn throws { code: "insufficient_credits" } when RPC returns { error: "insufficient_credits" }', async () => {
    mockRpc.mockResolvedValue({ data: { error: 'insufficient_credits' }, error: null })

    const { useBookClass } = await import('./use-book-class')
    const mutation = useBookClass() as { mutateAsync: (v: { userId: string; classId: string }) => Promise<unknown> }

    await expect(mutation.mutateAsync({ userId, classId })).rejects.toMatchObject({
      code: 'insufficient_credits',
    })
  })
})
