import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useTransactions } from './use-transactions'
import type { Database } from '@/lib/supabase/types'

type CreditTransaction = Database['public']['Tables']['credit_transactions']['Row']

const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockOrder = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: mockSelect,
    }),
  }),
}))

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

const sampleTransactions: CreditTransaction[] = [
  {
    id: 'tx-1',
    user_id: 'user-1',
    amount: -5,
    type: 'booking',
    reference_id: 'booking-1',
    note: 'Booked: Yoga',
    created_at: '2026-03-10T12:00:00Z',
  },
  {
    id: 'tx-2',
    user_id: 'user-1',
    amount: 20,
    type: 'purchase',
    reference_id: 'cs_test_123',
    note: 'Stripe purchase',
    created_at: '2026-03-10T10:00:00Z',
  },
]

describe('useTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ order: mockOrder })
  })

  it('returns array of transaction rows when data is present', async () => {
    mockOrder.mockResolvedValueOnce({ data: sampleTransactions, error: null })

    const { result } = renderHook(() => useTransactions('user-1'), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(sampleTransactions)
  })

  it('returns empty array when no transactions', async () => {
    mockOrder.mockResolvedValueOnce({ data: [], error: null })

    const { result } = renderHook(() => useTransactions('user-1'), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })

  it('query is disabled when userId is empty string', () => {
    const { result } = renderHook(() => useTransactions(''), { wrapper: makeWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.status).toBe('pending')
  })
})
