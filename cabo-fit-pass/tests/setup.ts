/**
 * Jest test setup file
 * Runs before each test file
 */

import '@testing-library/jest-dom'
import 'jest-canvas-mock'
import { loadEnvConfig } from '@next/env'
import { TextEncoder, TextDecoder } from 'util'
import { server } from './mocks/server'

// Load environment variables for testing
loadEnvConfig(process.cwd())

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    has: jest.fn(),
  }),
  headers: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    has: jest.fn(),
  }),
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
      maybeSingle: jest.fn(),
    })),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    })),
  },
}))

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn(() => ({
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
      confirm: jest.fn(),
    },
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
    },
    subscriptions: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
    },
  }))
})

// Mock framer-motion for components that use animations
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    input: ({ children, ...props }: any) => <input {...props}>{children}</input>,
    textarea: ({ children, ...props }: any) => <textarea {...props}>{children}</textarea>,
    select: ({ children, ...props }: any) => <select {...props}>{children}</select>,
  },
  AnimatePresence: ({ children }: any) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
  useInView: () => false,
  useMotionValue: (initial: any) => ({ get: () => initial, set: jest.fn() }),
  useTransform: () => jest.fn(),
}))

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useFormContext: () => ({
    register: jest.fn(),
    handleSubmit: jest.fn(),
    formState: { errors: {} },
    setValue: jest.fn(),
    getValues: jest.fn(),
    watch: jest.fn(),
    control: {},
  }),
}))

// Mock date-fns for consistent date testing
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  formatInTimeZone: jest.fn((date, timeZone, format) => 
    new Intl.DateTimeFormat('en-US').format(new Date(date))
  ),
}))

// Setup MSW (Mock Service Worker)
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Custom matchers for testing
expect.extend({
  toBeAccessible: (received: HTMLElement) => {
    // Simple accessibility check - in real implementation, use @testing-library/jest-dom
    const hasAltOrAriaLabel = 
      received.hasAttribute('alt') || 
      received.hasAttribute('aria-label') ||
      received.hasAttribute('aria-labelledby')
    
    const isInteractiveWithKeyboard = 
      received.tagName === 'BUTTON' ||
      received.tagName === 'A' ||
      received.hasAttribute('tabindex')

    if (received.tagName === 'IMG' && !hasAltOrAriaLabel) {
      return {
        message: () => 'Image elements must have alt text or aria-label',
        pass: false,
      }
    }

    return {
      message: () => 'Element is accessible',
      pass: true,
    }
  },
})

// Global test utilities
global.testUtils = {
  // Mock user data
  mockUser: {
    id: 'test-user-id',
    email: 'test@cabofitpass.com',
    name: 'Test User',
    created_at: '2024-01-01T00:00:00Z',
  },
  
  // Mock class data
  mockClass: {
    id: 'test-class-id',
    title: 'Test Yoga Class',
    description: 'A relaxing yoga session',
    instructor: 'Jane Doe',
    start_time: '2024-01-15T10:00:00Z',
    duration: 60,
    capacity: 20,
    booked_count: 5,
    credits_required: 1,
    studio_id: 'test-studio-id',
  },

  // Mock studio data
  mockStudio: {
    id: 'test-studio-id',
    name: 'Test Fitness Studio',
    description: 'A great place to work out',
    address: '123 Test Street, Los Cabos',
    phone: '+52-624-123-4567',
    email: 'studio@test.com',
    image_url: 'https://example.com/studio.jpg',
  },

  // Wait for async operations
  waitFor: (callback: () => void, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      const checkCondition = () => {
        try {
          callback()
          resolve(true)
        } catch (error) {
          if (Date.now() - startTime > timeout) {
            reject(new Error(`Timeout after ${timeout}ms: ${error}`))
          } else {
            setTimeout(checkCondition, 50)
          }
        }
      }
      checkCondition()
    })
  },
}

// Console warning filters
const originalWarn = console.warn
console.warn = (message: string, ...args: any[]) => {
  // Filter out known warnings that we can't control
  if (
    message.includes('React does not recognize') ||
    message.includes('componentWillReceiveProps') ||
    message.includes('validateDOMNesting')
  ) {
    return
  }
  originalWarn(message, ...args)
}

// Error boundary for tests
global.ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  try {
    return <>{children}</>
  } catch (error) {
    return <div data-testid="error-boundary">Something went wrong: {String(error)}</div>
  }
}