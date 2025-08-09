import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { Database } from '@/types/database.types'

const updateClassSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  intensity: z.enum(['low', 'moderate', 'high', 'extreme']).optional(),
  duration: z.number().min(15).max(180).optional(),
  max_participants: z.number().min(1).max(100).optional(),
  credits_required: z.number().min(1).max(10).optional(),
  instructor_name: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  equipment_needed: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  start_time: z.string().datetime().optional(),
  location: z.string().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
})

type UpdateClassRequest = z.infer<typeof updateClassSchema>

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/classes/[id] - Get specific class details with booking info
export async function GET(request: NextRequest, { params }: RouteParams) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  try {
    const { id: classId } = params

    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      )
    }

    // Get class details with related information
    const { data: fitnessClass, error: classError } = await supabase
      .from('fitness_classes')
      .select(`
        *,
        gym:gyms(*),
        bookings(id, user_id, status, created_at)
      `)
      .eq('id', classId)
      .single()

    if (classError) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    // Calculate availability
    const confirmedBookings = fitnessClass.bookings?.filter(b => b.status === 'confirmed') || []
    const spotsLeft = fitnessClass.max_participants - confirmedBookings.length
    const waitlistCount = fitnessClass.bookings?.filter(b => b.status === 'waitlisted').length || 0

    // Check if user is authenticated to get their booking status
    const { data: { user } } = await supabase.auth.getUser()
    let userBooking = null
    
    if (user && fitnessClass.bookings) {
      userBooking = fitnessClass.bookings.find(b => b.user_id === user.id) || null
    }

    // Get class reviews/ratings (if you have a reviews table)
    const { data: reviews } = await supabase
      .from('class_reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        user:profiles(full_name)
      `)
      .eq('class_id', classId)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      fitnessClass: {
        ...fitnessClass,
        bookings: undefined // Remove detailed booking info from public response
      },
      availability: {
        spotsLeft: Math.max(0, spotsLeft),
        totalSpots: fitnessClass.max_participants,
        waitlistCount,
        isAvailable: spotsLeft > 0,
        isWaitlistAvailable: true
      },
      userBooking,
      reviews: reviews || [],
      averageRating: fitnessClass.average_rating || 0
    })

  } catch (error: any) {
    console.error('Error fetching class:', error)
    return NextResponse.json(
      { error: 'Failed to fetch class details', message: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/classes/[id] - Update class (studio owners/managers only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const { id: classId } = params

    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateClassSchema.parse(body)

    // Get the class first to check ownership
    const { data: fitnessClass, error: classError } = await supabase
      .from('fitness_classes')
      .select(`
        *,
        gym:gyms(*)
      `)
      .eq('id', classId)
      .single()

    if (classError) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to edit this class
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Check if user is admin or staff of the gym
    const { data: staffRecord } = await supabase
      .from('gym_staff')
      .select('role, permissions')
      .eq('gym_id', fitnessClass.gym_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    const isAdmin = userProfile?.role === 'admin'
    const isGymOwner = staffRecord?.role === 'owner'
    const isGymManager = staffRecord?.role === 'manager'
    const canEditClasses = staffRecord?.permissions?.includes('edit_classes')

    if (!isAdmin && !isGymOwner && !isGymManager && !canEditClasses) {
      return NextResponse.json(
        { error: 'Insufficient permissions to edit this class' },
        { status: 403 }
      )
    }

    // Check for conflicts if changing time or capacity
    if (validatedData.start_time && validatedData.start_time !== fitnessClass.start_time) {
      // Check if there are confirmed bookings - might need to handle rescheduling
      const { data: confirmedBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('class_id', classId)
        .eq('status', 'confirmed')

      if (confirmedBookings && confirmedBookings.length > 0) {
        // In a real implementation, you might want to notify users or require confirmation
        console.log(`Rescheduling class ${classId} with ${confirmedBookings.length} confirmed bookings`)
      }
    }

    if (validatedData.max_participants && validatedData.max_participants < fitnessClass.current_participants) {
      return NextResponse.json(
        { error: 'Cannot reduce capacity below current participant count' },
        { status: 400 }
      )
    }

    // Update the class
    const { data: updatedClass, error: updateError } = await supabase
      .from('fitness_classes')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', classId)
      .select(`
        *,
        gym:gyms(*)
      `)
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update class' },
        { status: 500 }
      )
    }

    // Log the update for audit trail
    await logClassEvent({
      userId: user.id,
      classId,
      action: 'updated',
      changes: validatedData
    })

    return NextResponse.json({
      success: true,
      fitnessClass: updatedClass,
      message: 'Class updated successfully'
    })

  } catch (error: any) {
    console.error('Error updating class:', error)

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

    return NextResponse.json(
      { error: 'Failed to update class', message: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/classes/[id] - Cancel/delete class (studio owners/managers only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { id: classId } = params
    const { searchParams } = new URL(request.url)
    const reason = searchParams.get('reason') || 'Cancelled by studio'

    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      )
    }

    // Get the class first to check ownership and bookings
    const { data: fitnessClass, error: classError } = await supabase
      .from('fitness_classes')
      .select(`
        *,
        gym:gyms(*),
        bookings(id, user_id, status)
      `)
      .eq('id', classId)
      .single()

    if (classError) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    // Check permissions (similar to PUT)
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const { data: staffRecord } = await supabase
      .from('gym_staff')
      .select('role, permissions')
      .eq('gym_id', fitnessClass.gym_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    const isAdmin = userProfile?.role === 'admin'
    const isGymOwner = staffRecord?.role === 'owner'
    const isGymManager = staffRecord?.role === 'manager'
    const canDeleteClasses = staffRecord?.permissions?.includes('delete_classes')

    if (!isAdmin && !isGymOwner && !isGymManager && !canDeleteClasses) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete this class' },
        { status: 403 }
      )
    }

    const confirmedBookings = fitnessClass.bookings?.filter(b => b.status === 'confirmed') || []

    // Cancel the class (soft delete)
    const { error: updateError } = await supabase
      .from('fitness_classes')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
        metadata: {
          cancelled_by: user.id,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason
        }
      })
      .eq('id', classId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to cancel class' },
        { status: 500 }
      )
    }

    // Cancel all bookings and process refunds
    if (confirmedBookings.length > 0) {
      // Cancel all bookings
      await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
          metadata: {
            cancelled_by_studio: true,
            cancellation_reason: 'Class cancelled by studio'
          }
        })
        .eq('class_id', classId)
        .in('status', ['confirmed', 'waitlisted'])

      // Process refunds for confirmed bookings
      const refundPromises = confirmedBookings.map(async (booking) => {
        // Add credits back to user account
        await supabase
          .from('credit_transactions')
          .insert({
            user_id: booking.user_id,
            amount: fitnessClass.credits_required,
            transaction_type: 'refund',
            description: `Refund: ${fitnessClass.name} (class cancelled)`,
            reference_id: classId
          })

        // Update user's credit balance
        await supabase
          .rpc('update_user_credits', {
            user_id: booking.user_id,
            credit_change: fitnessClass.credits_required
          })
      })

      await Promise.all(refundPromises)
    }

    // Log the cancellation
    await logClassEvent({
      userId: user.id,
      classId,
      action: 'cancelled',
      reason,
      affectedBookings: confirmedBookings.length
    })

    return NextResponse.json({
      success: true,
      message: `Class cancelled successfully. ${confirmedBookings.length} bookings refunded.`,
      refundedBookings: confirmedBookings.length
    })

  } catch (error: any) {
    console.error('Error cancelling class:', error)
    return NextResponse.json(
      { error: 'Failed to cancel class', message: error.message },
      { status: 500 }
    )
  }
}

// Analytics logging function
async function logClassEvent(event: {
  userId: string
  classId: string
  action: string
  changes?: any
  reason?: string
  affectedBookings?: number
}) {
  // In a real implementation, you would log to an analytics service
  console.log('Class event:', {
    ...event,
    timestamp: new Date().toISOString()
  })
}