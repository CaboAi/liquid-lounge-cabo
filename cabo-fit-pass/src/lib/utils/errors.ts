/**
 * Error handling utilities for the CaboFitPass application
 */

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly code?: string

  constructor(message: string, statusCode: number = 500, code?: string, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.code = code
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  public readonly field?: string
  public readonly details?: Array<{ field: string; message: string }>

  constructor(message: string, field?: string, details?: Array<{ field: string; message: string }>) {
    super(message, 400, 'VALIDATION_ERROR')
    this.field = field
    this.details = details
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR')
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR')
  }
}

export class PaymentError extends AppError {
  public readonly paymentCode?: string

  constructor(message: string, paymentCode?: string) {
    super(message, 402, 'PAYMENT_ERROR')
    this.paymentCode = paymentCode
  }
}

export class BookingError extends AppError {
  public readonly bookingCode?: string

  constructor(message: string, bookingCode?: string) {
    super(message, 400, 'BOOKING_ERROR')
    this.bookingCode = bookingCode
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network connection failed') {
    super(message, 0, 'NETWORK_ERROR')
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter?: number

  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_ERROR')
    this.retryAfter = retryAfter
  }
}

// Error type guards
export function isAppError(error: any): error is AppError {
  return error instanceof AppError
}

export function isValidationError(error: any): error is ValidationError {
  return error instanceof ValidationError
}

export function isAuthenticationError(error: any): error is AuthenticationError {
  return error instanceof AuthenticationError
}

export function isAuthorizationError(error: any): error is AuthorizationError {
  return error instanceof AuthorizationError
}

export function isNotFoundError(error: any): error is NotFoundError {
  return error instanceof NotFoundError
}

export function isPaymentError(error: any): error is PaymentError {
  return error instanceof PaymentError
}

export function isBookingError(error: any): error is BookingError {
  return error instanceof BookingError
}

export function isNetworkError(error: any): error is NetworkError {
  return error instanceof NetworkError || error.name === 'NetworkError'
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }

  return 'An unexpected error occurred'
}

export function getErrorCode(error: unknown): string | undefined {
  if (isAppError(error)) {
    return error.code
  }

  if (error && typeof error === 'object' && 'code' in error) {
    return String(error.code)
  }

  return undefined
}

export function getHttpStatusCode(error: unknown): number {
  if (isAppError(error)) {
    return error.statusCode
  }

  // Default status codes for common error types
  if (error instanceof TypeError || error instanceof ReferenceError) {
    return 500
  }

  return 500
}

// Error classification
export function classifyError(error: unknown): {
  type: 'client' | 'server' | 'network' | 'validation' | 'authentication' | 'authorization'
  severity: 'low' | 'medium' | 'high' | 'critical'
  shouldRetry: boolean
  userMessage: string
} {
  if (isValidationError(error)) {
    return {
      type: 'validation',
      severity: 'low',
      shouldRetry: false,
      userMessage: error.message
    }
  }

  if (isAuthenticationError(error)) {
    return {
      type: 'authentication',
      severity: 'medium',
      shouldRetry: false,
      userMessage: 'Please log in to continue'
    }
  }

  if (isAuthorizationError(error)) {
    return {
      type: 'authorization',
      severity: 'medium',
      shouldRetry: false,
      userMessage: 'You do not have permission to perform this action'
    }
  }

  if (isNetworkError(error)) {
    return {
      type: 'network',
      severity: 'medium',
      shouldRetry: true,
      userMessage: 'Connection failed. Please check your internet and try again.'
    }
  }

  if (isPaymentError(error)) {
    return {
      type: 'client',
      severity: 'high',
      shouldRetry: false,
      userMessage: 'Payment failed. Please check your payment method and try again.'
    }
  }

  if (isAppError(error)) {
    const isClientError = error.statusCode >= 400 && error.statusCode < 500
    const isServerError = error.statusCode >= 500

    return {
      type: isClientError ? 'client' : isServerError ? 'server' : 'client',
      severity: isServerError ? 'high' : 'medium',
      shouldRetry: isServerError,
      userMessage: error.message
    }
  }

  // Unknown error
  return {
    type: 'server',
    severity: 'critical',
    shouldRetry: false,
    userMessage: 'An unexpected error occurred. Please try again or contact support if the problem persists.'
  }
}

// Error formatting for API responses
export function formatApiError(error: unknown): {
  error: string
  message: string
  code?: string
  statusCode: number
  details?: any
} {
  if (isAppError(error)) {
    return {
      error: error.constructor.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: isValidationError(error) ? error.details : undefined
    }
  }

  return {
    error: 'InternalServerError',
    message: getErrorMessage(error),
    statusCode: 500
  }
}

// Error logging utility
export function logError(error: unknown, context?: Record<string, any>): void {
  const errorInfo = {
    message: getErrorMessage(error),
    code: getErrorCode(error),
    statusCode: getHttpStatusCode(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
  }

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error occurred:', errorInfo)
  }

  // In production, you would send to a logging service
  // Example: sendToLoggingService(errorInfo)
}

// Retry utility
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    delay?: number
    backoffMultiplier?: number
    shouldRetry?: (error: unknown) => boolean
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoffMultiplier = 2,
    shouldRetry = (error) => classifyError(error).shouldRetry
  } = options

  let lastError: unknown
  let currentDelay = delay

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt > maxRetries || !shouldRetry(error)) {
        throw error
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, currentDelay))
      currentDelay *= backoffMultiplier
    }
  }

  throw lastError
}

// Error boundary helper for React components
export function createErrorBoundaryError(error: Error, errorInfo: { componentStack: string }) {
  return new AppError(
    `Component error: ${error.message}`,
    500,
    'COMPONENT_ERROR'
  )
}

// Safe async execution
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<{ data?: T; error?: AppError }> {
  try {
    const data = await fn()
    return { data }
  } catch (error) {
    const appError = isAppError(error) 
      ? error 
      : new AppError(getErrorMessage(error), getHttpStatusCode(error))
    
    logError(appError)
    
    return { 
      error: appError,
      data: fallback
    }
  }
}

// Form error utilities
export function extractFormErrors(error: unknown): Record<string, string> {
  if (isValidationError(error) && error.details) {
    const formErrors: Record<string, string> = {}
    error.details.forEach(({ field, message }) => {
      formErrors[field] = message
    })
    return formErrors
  }

  return {}
}

export function createFormFieldError(field: string, message: string): ValidationError {
  return new ValidationError(message, field, [{ field, message }])
}

// Error message translations (for i18n)
export const ERROR_MESSAGES = {
  AUTHENTICATION_ERROR: {
    en: 'Please log in to continue',
    es: 'Por favor inicia sesión para continuar'
  },
  AUTHORIZATION_ERROR: {
    en: 'You do not have permission to perform this action',
    es: 'No tienes permisos para realizar esta acción'
  },
  NETWORK_ERROR: {
    en: 'Connection failed. Please check your internet connection.',
    es: 'Falló la conexión. Por favor verifica tu conexión a internet.'
  },
  PAYMENT_ERROR: {
    en: 'Payment failed. Please check your payment method.',
    es: 'El pago falló. Por favor verifica tu método de pago.'
  },
  BOOKING_ERROR: {
    en: 'Booking failed. Please try again.',
    es: 'La reserva falló. Por favor inténtalo de nuevo.'
  },
  RATE_LIMIT_ERROR: {
    en: 'Too many requests. Please wait and try again.',
    es: 'Demasiadas solicitudes. Por favor espera e inténtalo de nuevo.'
  },
  VALIDATION_ERROR: {
    en: 'Please check your input and try again.',
    es: 'Por favor verifica tu información e inténtalo de nuevo.'
  },
  GENERIC_ERROR: {
    en: 'An unexpected error occurred. Please try again.',
    es: 'Ocurrió un error inesperado. Por favor inténtalo de nuevo.'
  }
} as const

export function getLocalizedErrorMessage(
  error: unknown, 
  locale: 'en' | 'es' = 'en'
): string {
  const code = getErrorCode(error)
  
  if (code && code in ERROR_MESSAGES) {
    return ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES][locale]
  }

  return ERROR_MESSAGES.GENERIC_ERROR[locale]
}