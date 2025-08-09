/**
 * @jest-environment node
 */

import { createMocks } from 'node-mocks-http'
import type { NextApiRequest, NextApiResponse } from 'next'

// Mock Supabase operations
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
    limit: jest.fn().mockReturnThis(),
  })),
  rpc: jest.fn(),
}

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabase,
}))

// Mock authentication middleware
const mockAuth = {
  getUser: jest.fn(),
}

// Mock API handlers
const createBookingHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { class_id, user_id, credits_to_use } = req.body

    // Validation
    if (!class_id || !user_id || !credits_to_use) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'class_id, user_id, and credits_to_use are required'
      })
    }

    if (credits_to_use < 1) {
      return res.status(400).json({ 
        error: 'Invalid credits amount',
        details: 'Credits must be at least 1'
      })
    }

    // Check if class exists and has capacity
    const { data: classData, error: classError } = await mockSupabase
      .from('classes')
      .select('id, title, capacity, booked_count, credits_required, start_time')
      .eq('id', class_id)
      .single()

    if (classError || !classData) {
      return res.status(404).json({
        error: 'Class not found',
        details: 'The specified class does not exist'
      })
    }

    // Check if class is full
    if (classData.booked_count >= classData.capacity) {
      return res.status(409).json({
        error: 'Class is full',
        details: 'This class has reached maximum capacity',
        waitlist_available: true,
      })
    }

    // Check if class has already started
    const classStartTime = new Date(classData.start_time)
    const now = new Date()
    if (classStartTime <= now) {
      return res.status(410).json({
        error: 'Class has already started',
        details: 'Cannot book classes that have already begun'
      })
    }

    // Check if user has sufficient credits
    const { data: userCredits, error: creditsError } = await mockSupabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', user_id)
      .single()

    if (creditsError || !userCredits) {
      return res.status(404).json({
        error: 'User credits not found',
        details: 'Could not retrieve user credit balance'
      })
    }

    if (userCredits.balance < classData.credits_required) {
      return res.status(402).json({
        error: 'Insufficient credits',
        details: `This class requires ${classData.credits_required} credits, but you have ${userCredits.balance}`,
        required: classData.credits_required,
        available: userCredits.balance,
      })
    }

    // Check for existing booking
    const { data: existingBooking } = await mockSupabase
      .from('bookings')
      .select('id')
      .eq('class_id', class_id)
      .eq('user_id', user_id)
      .eq('status', 'confirmed')
      .single()

    if (existingBooking) {
      return res.status(409).json({
        error: 'Already booked',
        details: 'You have already booked this class'
      })
    }

    // Create booking using transaction
    const { data: booking, error: bookingError } = await mockSupabase.rpc('create_booking', {
      p_class_id: class_id,
      p_user_id: user_id,
      p_credits_used: classData.credits_required,
    })

    if (bookingError) {
      throw bookingError
    }

    return res.status(201).json({
      booking: {
        id: booking.id,
        class_id,
        user_id,
        status: 'confirmed',
        credits_used: classData.credits_required,
        created_at: new Date().toISOString(),
      },
      message: 'Class booked successfully',
      remaining_credits: userCredits.balance - classData.credits_required,
    })
  } catch (error) {
    console.error('Booking creation error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: 'Failed to create booking'
    })
  }
}

const cancelBookingHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { booking_id } = req.query
    const { user_id } = req.body

    if (!booking_id || !user_id) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        details: 'booking_id and user_id are required'
      })
    }

    // Get booking details
    const { data: booking, error: bookingError } = await mockSupabase
      .from('bookings')
      .select(`
        id, class_id, user_id, status, credits_used,
        class:classes(id, title, start_time)
      `)
      .eq('id', booking_id)
      .eq('user_id', user_id)
      .single()

    if (bookingError || !booking) {
      return res.status(404).json({
        error: 'Booking not found',
        details: 'The specified booking does not exist or does not belong to you'
      })
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        error: 'Cannot cancel booking',
        details: `Booking is already ${booking.status}`
      })
    }

    // Check cancellation deadline (24 hours before class)
    const classStartTime = new Date(booking.class.start_time)
    const now = new Date()
    const hoursUntilClass = (classStartTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilClass < 24) {
      return res.status(409).json({
        error: 'Too late to cancel',
        details: 'Bookings can only be cancelled up to 24 hours before the class starts',
        no_refund: true,
      })
    }

    // Cancel booking and refund credits
    const { error: cancelError } = await mockSupabase.rpc('cancel_booking', {
      p_booking_id: booking_id,
      p_refund_credits: booking.credits_used,
    })

    if (cancelError) {
      throw cancelError
    }

    return res.status(200).json({
      message: 'Booking cancelled successfully',
      refund: {
        credits: booking.credits_used,
        amount: 0, // Credits only, no monetary refund
      },
      booking_id: booking_id,
    })
  } catch (error) {
    console.error('Booking cancellation error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: 'Failed to cancel booking'
    })
  }
}

const getUserBookingsHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { user_id, status, limit = 20, offset = 0 } = req.query

    if (!user_id) {
      return res.status(400).json({ 
        error: 'Missing user_id',
        details: 'User ID is required'
      })
    }

    let query = mockSupabase
      .from('bookings')
      .select(`
        id, status, credits_used, created_at,
        class:classes(
          id, title, description, instructor, start_time, duration,
          studio:studios(id, name, address)
        )
      `)
      .eq('user_id', user_id)

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .limit(parseInt(limit as string))
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1)

    const { data: bookings, error, count } = await query

    if (error) {
      throw error
    }

    // Categorize bookings
    const categorizedBookings = {
      upcoming: bookings?.filter(b => {
        const classTime = new Date(b.class.start_time)
        return classTime > new Date() && b.status === 'confirmed'
      }) || [],
      past: bookings?.filter(b => {
        const classTime = new Date(b.class.start_time)
        return classTime <= new Date()
      }) || [],
      cancelled: bookings?.filter(b => b.status === 'cancelled') || [],
    }

    return res.status(200).json({
      data: bookings || [],
      categorized: categorizedBookings,
      pagination: {
        total: count || 0,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: (count || 0) > parseInt(offset as string) + parseInt(limit as string),
      },
    })
  } catch (error) {
    console.error('Get bookings error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: 'Failed to retrieve bookings'
    })
  }
}

const getBookingDetailsHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { booking_id, user_id } = req.query

    if (!booking_id || !user_id) {
      return res.status(400).json({ 
        error: 'Missing parameters',
        details: 'booking_id and user_id are required'
      })
    }

    const { data: booking, error } = await mockSupabase
      .from('bookings')
      .select(`
        id, status, credits_used, created_at, updated_at,
        class:classes(
          id, title, description, instructor, start_time, end_time, duration,
          capacity, booked_count, credits_required, category,
          studio:studios(id, name, address, phone, email)
        )
      `)
      .eq('id', booking_id)
      .eq('user_id', user_id)
      .single()

    if (error || !booking) {
      return res.status(404).json({
        error: 'Booking not found',
        details: 'The specified booking does not exist or does not belong to you'
      })
    }

    // Add booking metadata
    const classStartTime = new Date(booking.class.start_time)
    const now = new Date()
    const canCancel = classStartTime.getTime() - now.getTime() > 24 * 60 * 60 * 1000 && booking.status === 'confirmed'
    const timeUntilClass = classStartTime.getTime() - now.getTime()

    return res.status(200).json({
      data: {
        ...booking,
        metadata: {
          can_cancel: canCancel,
          time_until_class: timeUntilClass,
          has_started: classStartTime <= now,
          cancellation_deadline: new Date(classStartTime.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        }
      },
    })
  } catch (error) {
    console.error('Get booking details error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: 'Failed to retrieve booking details'
    })
  }
}

describe('/api/bookings/create', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default successful responses
    mockSupabase.from().single.mockImplementation(() => {
      const table = mockSupabase.from().select.mock.calls[mockSupabase.from().select.mock.calls.length - 1]?.[0]
      
      if (table?.includes('classes')) {
        return Promise.resolve({
          data: {
            id: 'class-1',
            title: 'Test Class',
            capacity: 20,
            booked_count: 5,
            credits_required: 1,
            start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
          error: null,
        })
      }
      
      if (table?.includes('user_credits')) {
        return Promise.resolve({
          data: { balance: 10 },
          error: null,
        })
      }
      
      if (table?.includes('bookings')) {
        return Promise.resolve({
          data: null, // No existing booking
          error: null,
        })
      }
      
      return Promise.resolve({ data: null, error: null })
    })

    mockSupabase.rpc.mockResolvedValue({
      data: { id: 'booking-123' },
      error: null,
    })
  })

  it('creates a booking successfully', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        class_id: 'class-1',
        user_id: 'user-1',
        credits_to_use: 1,
      },
    })

    await createBookingHandler(req, res)

    expect(res._getStatusCode()).toBe(201)
    const data = JSON.parse(res._getData())
    expect(data.booking.class_id).toBe('class-1')
    expect(data.booking.user_id).toBe('user-1')
    expect(data.booking.status).toBe('confirmed')
    expect(data.message).toBe('Class booked successfully')
    expect(data.remaining_credits).toBe(9) // 10 - 1
  })

  it('validates required fields', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        class_id: 'class-1',
        // Missing user_id and credits_to_use
      },
    })

    await createBookingHandler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Missing required fields')
  })

  it('validates credits amount', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        class_id: 'class-1',
        user_id: 'user-1',
        credits_to_use: 0,
      },
    })

    await createBookingHandler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Invalid credits amount')
  })

  it('handles class not found', async () => {
    mockSupabase.from().single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Class not found' },
    })

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        class_id: 'nonexistent',
        user_id: 'user-1',
        credits_to_use: 1,
      },
    })

    await createBookingHandler(req, res)

    expect(res._getStatusCode()).toBe(404)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Class not found')
  })

  it('handles full class', async () => {
    mockSupabase.from().single.mockResolvedValueOnce({
      data: {
        id: 'class-1',
        capacity: 20,
        booked_count: 20, // Full capacity
        credits_required: 1,
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      error: null,
    })

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        class_id: 'class-1',
        user_id: 'user-1',
        credits_to_use: 1,
      },
    })

    await createBookingHandler(req, res)

    expect(res._getStatusCode()).toBe(409)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Class is full')
    expect(data.waitlist_available).toBe(true)
  })

  it('handles insufficient credits', async () => {
    mockSupabase.from().single.mockImplementation(() => {
      const table = mockSupabase.from().select.mock.calls[mockSupabase.from().select.mock.calls.length - 1]?.[0]
      
      if (table?.includes('classes')) {
        return Promise.resolve({
          data: {
            id: 'class-1',
            capacity: 20,
            booked_count: 5,
            credits_required: 5, // Requires 5 credits
            start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
          error: null,
        })
      }
      
      if (table?.includes('user_credits')) {
        return Promise.resolve({
          data: { balance: 2 }, // Only has 2 credits
          error: null,
        })
      }
      
      return Promise.resolve({ data: null, error: null })
    })

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        class_id: 'class-1',
        user_id: 'user-1',
        credits_to_use: 1,
      },
    })

    await createBookingHandler(req, res)

    expect(res._getStatusCode()).toBe(402)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Insufficient credits')
    expect(data.required).toBe(5)
    expect(data.available).toBe(2)
  })

  it('handles already booked class', async () => {
    mockSupabase.from().single.mockImplementation(() => {
      const calls = mockSupabase.from().select.mock.calls
      const lastCall = calls[calls.length - 1]?.[0]
      
      if (lastCall?.includes('bookings') && lastCall?.includes('confirmed')) {
        return Promise.resolve({
          data: { id: 'existing-booking' }, // Existing booking found
          error: null,
        })
      }
      
      // Default responses for other queries
      if (lastCall?.includes('classes')) {
        return Promise.resolve({
          data: {
            id: 'class-1',
            capacity: 20,
            booked_count: 5,
            credits_required: 1,
            start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
          error: null,
        })
      }
      
      if (lastCall?.includes('user_credits')) {
        return Promise.resolve({
          data: { balance: 10 },
          error: null,
        })
      }
      
      return Promise.resolve({ data: null, error: null })
    })

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        class_id: 'class-1',
        user_id: 'user-1',
        credits_to_use: 1,
      },
    })

    await createBookingHandler(req, res)

    expect(res._getStatusCode()).toBe(409)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Already booked')
  })

  it('handles class that has already started', async () => {
    mockSupabase.from().single.mockResolvedValueOnce({
      data: {
        id: 'class-1',
        capacity: 20,
        booked_count: 5,
        credits_required: 1,
        start_time: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // Started 1 hour ago
      },
      error: null,
    })

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        class_id: 'class-1',
        user_id: 'user-1',
        credits_to_use: 1,
      },
    })

    await createBookingHandler(req, res)

    expect(res._getStatusCode()).toBe(410)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Class has already started')
  })

  it('rejects non-POST requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    })

    await createBookingHandler(req, res)

    expect(res._getStatusCode()).toBe(405)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Method not allowed')
  })
})

describe('/api/bookings/cancel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('cancels booking successfully', async () => {
    mockSupabase.from().single.mockResolvedValue({
      data: {
        id: 'booking-1',
        class_id: 'class-1',
        user_id: 'user-1',
        status: 'confirmed',
        credits_used: 1,
        class: {
          id: 'class-1',
          title: 'Test Class',
          start_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours from now
        },
      },
      error: null,
    })

    mockSupabase.rpc.mockResolvedValue({ error: null })

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'DELETE',
      query: { booking_id: 'booking-1' },
      body: { user_id: 'user-1' },
    })

    await cancelBookingHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.message).toBe('Booking cancelled successfully')
    expect(data.refund.credits).toBe(1)
  })

  it('handles too late to cancel', async () => {
    mockSupabase.from().single.mockResolvedValue({
      data: {
        id: 'booking-1',
        status: 'confirmed',
        credits_used: 1,
        class: {
          start_time: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
        },
      },
      error: null,
    })

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'DELETE',
      query: { booking_id: 'booking-1' },
      body: { user_id: 'user-1' },
    })

    await cancelBookingHandler(req, res)

    expect(res._getStatusCode()).toBe(409)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Too late to cancel')
    expect(data.no_refund).toBe(true)
  })

  it('handles booking not found', async () => {
    mockSupabase.from().single.mockResolvedValue({
      data: null,
      error: { message: 'Not found' },
    })

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'DELETE',
      query: { booking_id: 'nonexistent' },
      body: { user_id: 'user-1' },
    })

    await cancelBookingHandler(req, res)

    expect(res._getStatusCode()).toBe(404)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Booking not found')
  })

  it('rejects non-DELETE requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    })

    await cancelBookingHandler(req, res)

    expect(res._getStatusCode()).toBe(405)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Method not allowed')
  })
})

describe('/api/bookings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock successful bookings response
    mockSupabase.from().range.mockReturnThis()
    mockSupabase.from().limit.mockReturnThis()
    mockSupabase.from().order.mockResolvedValue({
      data: [
        {
          id: 'booking-1',
          status: 'confirmed',
          credits_used: 1,
          created_at: '2024-01-01T10:00:00Z',
          class: {
            id: 'class-1',
            title: 'Test Class',
            start_time: '2024-01-15T10:00:00Z',
            studio: { name: 'Test Studio' },
          },
        },
      ],
      error: null,
      count: 1,
    })
  })

  it('retrieves user bookings successfully', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { user_id: 'user-1' },
    })

    await getUserBookingsHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.data).toHaveLength(1)
    expect(data.categorized.upcoming).toBeDefined()
    expect(data.categorized.past).toBeDefined()
    expect(data.categorized.cancelled).toBeDefined()
  })

  it('validates user_id parameter', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: {}, // Missing user_id
    })

    await getUserBookingsHandler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Missing user_id')
  })

  it('applies pagination correctly', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { 
        user_id: 'user-1',
        limit: '10',
        offset: '5'
      },
    })

    await getUserBookingsHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.pagination.limit).toBe(10)
    expect(data.pagination.offset).toBe(5)
  })

  it('rejects non-GET requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    })

    await getUserBookingsHandler(req, res)

    expect(res._getStatusCode()).toBe(405)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Method not allowed')
  })
})