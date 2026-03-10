import { describe, expect, test } from 'vitest'
import fc from 'fast-check'
import {
  isClassFull,
  isAlreadyBooked,
  isCancellationAllowed,
  computeNewCredits,
} from './booking-logic'

describe('isClassFull', () => {
  test.each([
    { confirmedCount: 10, maxCapacity: 10, expected: true },
    { confirmedCount: 9, maxCapacity: 10, expected: false },
    { confirmedCount: 0, maxCapacity: 1, expected: false },
    { confirmedCount: 1, maxCapacity: 1, expected: true },
  ])('isClassFull($confirmedCount, $maxCapacity) === $expected', ({ confirmedCount, maxCapacity, expected }) => {
    expect(isClassFull(confirmedCount, maxCapacity)).toBe(expected)
  })
})

describe('isAlreadyBooked', () => {
  test('returns true when matching class_id with status confirmed exists', () => {
    const bookings = [{ class_id: 'class-abc', status: 'confirmed' }]
    expect(isAlreadyBooked(bookings, 'class-abc')).toBe(true)
  })

  test('returns false when class_id exists but status is cancelled', () => {
    const bookings = [{ class_id: 'class-abc', status: 'cancelled' }]
    expect(isAlreadyBooked(bookings, 'class-abc')).toBe(false)
  })

  test('returns false when bookings array is empty', () => {
    expect(isAlreadyBooked([], 'class-abc')).toBe(false)
  })
})

describe('isCancellationAllowed', () => {
  const makeDate = (offsetMs: number) => new Date(Date.now() + offsetMs)
  const hours = (h: number) => h * 60 * 60 * 1000

  test('returns true when scheduledAt minus now is at least the window (4h ahead, 3h window)', () => {
    const now = new Date()
    const scheduledAt = makeDate(hours(4))
    expect(isCancellationAllowed(scheduledAt, 3, now)).toBe(true)
  })

  test('returns false when scheduledAt minus now is less than the window (1h ahead, 2h window)', () => {
    const now = new Date()
    const scheduledAt = makeDate(hours(1))
    expect(isCancellationAllowed(scheduledAt, 2, now)).toBe(false)
  })

  test('returns false when class is in the past', () => {
    const now = new Date()
    const scheduledAt = makeDate(-hours(1))
    expect(isCancellationAllowed(scheduledAt, 2, now)).toBe(false)
  })
})

describe('computeNewCredits', () => {
  test('returns current + purchased', () => {
    const current = 5
    const purchased = 10
    expect(computeNewCredits(current, purchased)).toBe(15)
  })

  test('property: result is never negative for non-negative inputs', () => {
    fc.assert(
      fc.property(fc.nat(), fc.nat(), (current, purchased) => {
        const result = computeNewCredits(current, purchased)
        return result >= 0
      })
    )
  })
})
