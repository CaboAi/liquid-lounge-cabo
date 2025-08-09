import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { bookingManager } from '@/lib/bookings'
import { creditManager } from '@/lib/credits'
import type { Database } from '@/types/database.types'

const createBookingSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
  acceptWaitlist: z.boolean().default(false),
  agreeToPolicy: z.boolean().refine(val => val === true, {
    message: 'You must agree to the cancellation policy'
  }),
  emergencyContact: z.string().optional(),
})

const updateBookingSchema = z.object({
  action: z.enum(['cancel', 'checkin', 'reschedule']),
  newClassId: z.string().uuid().optional(), // For reschedule
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(), // For checkin
})

type CreateBookingRequest = z.infer<typeof createBookingSchema>
type UpdateBookingRequest = z.infer<typeof updateBookingSchema>

// GET /api/bookings - Get user's bookings
export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const includeHistory = searchParams.get('includeHistory') === 'true'
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get user's bookings
    const bookings = await bookingManager.getUserBookings(user.id, includeHistory)

    // Filter by status if specified
    let filteredBookings = bookings
    if (status) {
      filteredBookings = bookings.filter(booking => booking.status === status)
    }

    // Apply pagination
    const paginatedBookings = filteredBookings.slice(offset, offset + limit)

    // Get booking stats
    const stats = await bookingManager.getUserBookingStats(user.id)

    return NextResponse.json({
      bookings: paginatedBookings,
      stats,
      pagination: {
        total: filteredBookings.length,
        limit,
        offset,
        hasMore: offset + limit < filteredBookings.length
      }
    })

  } catch (error: any) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings', message: error.message },
      { status: 500 }
    )
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createBookingSchema.parse(body)
    const { classId, acceptWaitlist, agreeToPolicy, emergencyContact } = validatedData

    // Get class details first
    const { data: fitnessClass, error: classError } = await supabase
      .from('fitness_classes')
      .select('*')
      .eq('id', classId)
      .single()

    if (classError) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    // Check if user has enough credits (unless joining waitlist)
    const userCredits = await creditManager.getUserCredits(user.id)
    if (!userCredits || userCredits.current_balance < fitnessClass.credits_required) {
      // Allow waitlist even without credits
      if (!acceptWaitlist) {
        return NextResponse.json(
          { 
            error: 'Insufficient credits',
            required: fitnessClass.credits_required,
            available: userCredits?.current_balance || 0
          },
          { status: 402 }
        )
      }
    }

    // Create the booking
    const result = await bookingManager.bookClass(user.id, classId, {
      acceptWaitlist,
      agreeToPolicy,
      emergencyContact
    })

    // Spend credits if booking was confirmed (not waitlisted)
    if (result.booking.status === 'confirmed') {
      await creditManager.spendCredits(
        user.id,
        fitnessClass.credits_required,
        `Booked: ${fitnessClass.name}`,
        classId
      )
    }

    // Log booking event for analytics
    await logBookingEvent({
      userId: user.id,
      classId,
      bookingId: result.booking.id,
      status: result.booking.status,
      creditsSpent: result.booking.status === 'confirmed' ? fitnessClass.credits_required : 0,
      isWaitlisted: result.isWaitlisted
    })

    return NextResponse.json({
      success: true,
      booking: result.booking,
      fitnessClass: result.fitnessClass,
      isWaitlisted: result.isWaitlisted,
      message: result.message,
      creditsSpent: result.booking.status === 'confirmed' ? fitnessClass.credits_required : 0
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating booking:', error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    // Handle business logic errors
    if (error.message.includes('already have a booking') ||
        error.message.includes('Class is full') ||
        error.message.includes('Cannot book past classes')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create booking', message: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/bookings/[id] - Update a booking (cancel, checkin, reschedule)
export async function PUT(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get booking ID from URL
    const url = new URL(request.url)
    const bookingId = url.pathname.split('/').pop()
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateBookingSchema.parse(body)
    const { action, newClassId, location } = validatedData

    let result
    switch (action) {
      case 'cancel':
        result = await bookingManager.cancelBooking(bookingId, user.id)
        
        // Process refund if applicable
        if (result.refundAmount > 0) {
          await creditManager.addCredits(
            user.id,
            result.refundAmount,
            `Refund: ${result.fitnessClass.name}`,
            'refund'
          )
        }
        break

      case 'checkin':
        result = await bookingManager.checkIn(bookingId, user.id, location)
        break

      case 'reschedule':
        if (!newClassId) {
          return NextResponse.json(
            { error: 'New class ID is required for rescheduling' },
            { status: 400 }
          )
        }
        
        result = await bookingManager.rescheduleBooking(bookingId, newClassId, user.id)
        
        // Handle credit difference
        if (result.creditDifference > 0) {
          await creditManager.spendCredits(
            user.id,
            result.creditDifference,
            'Additional credits for rescheduling',
            newClassId
          )
        } else if (result.creditDifference < 0) {
          await creditManager.addCredits(
            user.id,
            Math.abs(result.creditDifference),
            'Credit refund for rescheduling',
            'refund'
          )
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Log action for analytics
    await logBookingEvent({
      userId: user.id,
      bookingId,
      action,
      newClassId
    })

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error: any) {
    console.error('Error updating booking:', error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    // Handle business logic errors
    if (error.message.includes('not found') ||
        error.message.includes('Unauthorized') ||
        error.message.includes('only allowed')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update booking', message: error.message },
      { status: 500 }
    )
  }
}

// Analytics logging function
async function logBookingEvent(event: {
  userId: string
  bookingId?: string
  classId?: string
  status?: string
  creditsSpent?: number
  isWaitlisted?: boolean
  action?: string
  newClassId?: string
}) {
  // In a real implementation, you would log to an analytics service
  console.log('Booking event:', {
    ...event,
    timestamp: new Date().toISOString()
  })
}