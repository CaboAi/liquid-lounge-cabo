export type BookingErrorCode =
  | 'class_not_found'
  | 'class_full'
  | 'already_booked'
  | 'insufficient_credits'
  | 'booking_not_found'
  | 'cancellation_window_passed'

export const ERROR_MESSAGES: Record<BookingErrorCode, string> = {
  class_not_found: 'Class not found or has been cancelled.',
  class_full: 'This class is full.',
  already_booked: 'You are already booked for this class.',
  insufficient_credits: 'Not enough credits. Please purchase a credit pack.',
  booking_not_found: 'Booking not found.',
  cancellation_window_passed: 'Cancellation window has passed. No refund will be issued.',
}
