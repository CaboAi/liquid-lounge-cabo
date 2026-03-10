import { describe, it, expect } from 'vitest'
import { creditsQueryOptions, useCredits } from './use-credits'

describe('creditsQueryOptions', () => {
  it('returns queryKey [credits, userId]', () => {
    const opts = creditsQueryOptions('user-123')
    expect(opts.queryKey).toEqual(['credits', 'user-123'])
  })
})

describe('useCredits', () => {
  it('is a function', () => {
    expect(typeof useCredits).toBe('function')
  })
})
