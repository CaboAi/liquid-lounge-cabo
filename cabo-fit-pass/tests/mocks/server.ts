/**
 * Mock Service Worker (MSW) server setup
 * For mocking API calls during testing
 */

import { setupServer } from 'msw/node'
import { rest } from 'msw'

// Mock API endpoints
const handlers = [
  // Authentication endpoints
  rest.post('/api/auth/signup', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: {
          id: 'test-user-id',
          email: 'test@cabofitpass.com',
          name: 'Test User',
        },
        message: 'User created successfully',
      })
    )
  }),

  rest.post('/api/auth/signin', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: {
          id: 'test-user-id',
          email: 'test@cabofitpass.com',
          name: 'Test User',
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      })
    )
  }),

  rest.post('/api/auth/signout', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'Signed out successfully' }))
  }),

  // Classes endpoints
  rest.get('/api/classes', (req, res, ctx) => {
    const classes = [
      {
        id: 'class-1',
        title: 'Morning Yoga',
        description: 'Start your day with energizing yoga',
        instructor: 'Maria Rodriguez',
        start_time: '2024-01-15T08:00:00Z',
        duration: 60,
        capacity: 15,
        booked_count: 8,
        credits_required: 1,
        studio_id: 'studio-1',
        category: 'yoga',
      },
      {
        id: 'class-2',
        title: 'HIIT Workout',
        description: 'High-intensity interval training',
        instructor: 'Carlos Mendez',
        start_time: '2024-01-15T18:00:00Z',
        duration: 45,
        capacity: 12,
        booked_count: 10,
        credits_required: 2,
        studio_id: 'studio-1',
        category: 'fitness',
      },
    ]

    return res(ctx.status(200), ctx.json({ data: classes, count: classes.length }))
  }),

  rest.get('/api/classes/:id', (req, res, ctx) => {
    const { id } = req.params
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          id,
          title: 'Test Class',
          description: 'A test fitness class',
          instructor: 'Test Instructor',
          start_time: '2024-01-15T10:00:00Z',
          duration: 60,
          capacity: 20,
          booked_count: 5,
          credits_required: 1,
          studio_id: 'test-studio-id',
        },
      })
    )
  }),

  rest.post('/api/classes/:id/book', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        booking: {
          id: 'booking-123',
          class_id: req.params.id,
          user_id: 'test-user-id',
          status: 'confirmed',
          credits_used: 1,
          created_at: new Date().toISOString(),
        },
        message: 'Class booked successfully',
      })
    )
  }),

  rest.delete('/api/classes/:id/book', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Booking cancelled successfully',
        refund: {
          credits: 1,
          amount: 0,
        },
      })
    )
  }),

  // Studios endpoints
  rest.get('/api/studios', (req, res, ctx) => {
    const studios = [
      {
        id: 'studio-1',
        name: 'Ocean View Fitness',
        description: 'Premium fitness studio with ocean views',
        address: 'Marina Boulevard, Los Cabos',
        phone: '+52-624-123-4567',
        email: 'info@oceanviewfitness.com',
        image_url: 'https://example.com/studio1.jpg',
        rating: 4.8,
        class_count: 25,
      },
      {
        id: 'studio-2',
        name: 'Desert Wellness',
        description: 'Holistic wellness center in the desert',
        address: 'Desert Road, Los Cabos',
        phone: '+52-624-987-6543',
        email: 'hello@desertwellness.com',
        image_url: 'https://example.com/studio2.jpg',
        rating: 4.6,
        class_count: 18,
      },
    ]

    return res(ctx.status(200), ctx.json({ data: studios, count: studios.length }))
  }),

  rest.get('/api/studios/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          id: req.params.id,
          name: 'Test Studio',
          description: 'A test fitness studio',
          address: '123 Test Street, Los Cabos',
          phone: '+52-624-123-4567',
          email: 'studio@test.com',
          image_url: 'https://example.com/studio.jpg',
          rating: 4.5,
          class_count: 20,
        },
      })
    )
  }),

  // Credits endpoints
  rest.get('/api/credits', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          user_id: 'test-user-id',
          balance: 10,
          total_purchased: 20,
          total_used: 10,
          expires_at: '2024-12-31T23:59:59Z',
        },
      })
    )
  }),

  rest.post('/api/credits/purchase', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        transaction: {
          id: 'txn-123',
          user_id: 'test-user-id',
          amount: 50.0,
          credits: 5,
          type: 'purchase',
          status: 'completed',
          created_at: new Date().toISOString(),
        },
        payment_intent: {
          id: 'pi_test_123',
          status: 'succeeded',
        },
      })
    )
  }),

  rest.get('/api/credits/history', (req, res, ctx) => {
    const transactions = [
      {
        id: 'txn-1',
        type: 'purchase',
        credits: 10,
        amount: 100.0,
        description: 'Credit package purchase',
        created_at: '2024-01-01T12:00:00Z',
        status: 'completed',
      },
      {
        id: 'txn-2',
        type: 'usage',
        credits: -1,
        amount: 0,
        description: 'Class booking: Morning Yoga',
        created_at: '2024-01-05T08:00:00Z',
        status: 'completed',
      },
    ]

    return res(ctx.status(200), ctx.json({ data: transactions, count: transactions.length }))
  }),

  // Booking endpoints
  rest.get('/api/bookings', (req, res, ctx) => {
    const bookings = [
      {
        id: 'booking-1',
        class_id: 'class-1',
        user_id: 'test-user-id',
        status: 'confirmed',
        credits_used: 1,
        created_at: '2024-01-01T12:00:00Z',
        class: {
          id: 'class-1',
          title: 'Morning Yoga',
          start_time: '2024-01-15T08:00:00Z',
          duration: 60,
          instructor: 'Maria Rodriguez',
          studio: {
            id: 'studio-1',
            name: 'Ocean View Fitness',
          },
        },
      },
    ]

    return res(ctx.status(200), ctx.json({ data: bookings, count: bookings.length }))
  }),

  // Stripe webhook
  rest.post('/api/webhooks/stripe', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ received: true }))
  }),

  // Health check
  rest.get('/api/health', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'healthy',
          redis: 'healthy',
        },
      })
    )
  }),

  // Analytics endpoints
  rest.get('/api/analytics/studio/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          revenue: {
            total: 5000,
            thisMonth: 1200,
            lastMonth: 1000,
            growth: 20,
          },
          bookings: {
            total: 150,
            thisMonth: 35,
            lastMonth: 30,
            growth: 16.7,
          },
          classes: {
            total: 25,
            active: 20,
            upcoming: 10,
          },
          members: {
            total: 85,
            active: 60,
            new: 8,
          },
        },
      })
    )
  }),

  // Error scenarios for testing
  rest.post('/api/auth/signin-error', (req, res, ctx) => {
    return res(
      ctx.status(401),
      ctx.json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      })
    )
  }),

  rest.post('/api/classes/full-class/book', (req, res, ctx) => {
    return res(
      ctx.status(409),
      ctx.json({
        error: 'Class is full',
        code: 'CLASS_FULL',
        waitlist_position: 3,
      })
    )
  }),

  rest.post('/api/credits/insufficient', (req, res, ctx) => {
    return res(
      ctx.status(402),
      ctx.json({
        error: 'Insufficient credits',
        code: 'INSUFFICIENT_CREDITS',
        required: 2,
        available: 1,
      })
    )
  }),
]

// Setup the server
export const server = setupServer(...handlers)

// Handler utilities for tests
export const mockHandlers = {
  // Override specific endpoints for testing
  overrideAuthSuccess: () =>
    server.use(
      rest.post('/api/auth/signin', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            user: { id: 'test-user-id', email: 'test@example.com' },
            accessToken: 'mock-token',
          })
        )
      })
    ),

  overrideAuthError: () =>
    server.use(
      rest.post('/api/auth/signin', (req, res, ctx) => {
        return res(
          ctx.status(401),
          ctx.json({ error: 'Invalid credentials' })
        )
      })
    ),

  overrideClassFull: () =>
    server.use(
      rest.post('/api/classes/:id/book', (req, res, ctx) => {
        return res(
          ctx.status(409),
          ctx.json({ 
            error: 'Class is full',
            waitlist_position: 3,
          })
        )
      })
    ),

  overrideInsufficientCredits: () =>
    server.use(
      rest.post('/api/classes/:id/book', (req, res, ctx) => {
        return res(
          ctx.status(402),
          ctx.json({ 
            error: 'Insufficient credits',
            required: 2,
            available: 1,
          })
        )
      })
    ),

  overrideNetworkError: () =>
    server.use(
      rest.get('/api/classes', (req, res, ctx) => {
        return res.networkError('Network error')
      })
    ),

  // Reset to default handlers
  reset: () => server.resetHandlers(),
}