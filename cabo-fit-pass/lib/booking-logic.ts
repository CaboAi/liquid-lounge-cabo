export function isCancellationAllowed(
  scheduledAt: Date,
  cancellationWindowHours: number,
  now: Date
): boolean {
  return scheduledAt.getTime() - now.getTime() >= cancellationWindowHours * 60 * 60 * 1000
}

export function isClassFull(confirmedCount: number, maxCapacity: number): boolean {
  return confirmedCount >= maxCapacity
}

export function isAlreadyBooked(
  bookings: Array<{ class_id: string; status: string }>,
  classId: string
): boolean {
  return bookings.some(b => b.class_id === classId && b.status === 'confirmed')
}

export function computeNewCredits(current: number, purchasedAmount: number): number {
  return current + purchasedAmount
}
