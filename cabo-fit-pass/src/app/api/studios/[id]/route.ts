import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { studioManager } from '@/lib/studio'
import type { Database } from '@/types/database.types'

const updateStudioSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  social_media: z.record(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  parking_available: z.boolean().optional(),
  wheelchair_accessible: z.boolean().optional(),
  changing_rooms: z.boolean().optional(),
  showers: z.boolean().optional(),
  lockers: z.boolean().optional(),
  retail_shop: z.boolean().optional(),
  cafe: z.boolean().optional(),
  operating_hours: z.record(z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean().optional()
  })).optional(),
  policies: z.object({
    cancellation_policy: z.string().optional(),
    late_policy: z.string().optional(),
    refund_policy: z.string().optional(),
    membership_terms: z.string().optional()
  }).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  images: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
})

type UpdateStudioRequest = z.infer<typeof updateStudioSchema>

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/studios/[id] - Get studio details with classes and stats
export async function GET(request: NextRequest, { params }: RouteParams) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  try {
    const { id: studioId } = params
    const { searchParams } = new URL(request.url)
    const includeClasses = searchParams.get('includeClasses') === 'true'
    const includeStats = searchParams.get('includeStats') === 'true'
    const includeBio = searchParams.get('includeBio') === 'true'

    if (!studioId) {
      return NextResponse.json(
        { error: 'Studio ID is required' },
        { status: 400 }
      )
    }

    // Get studio details
    const studio = await studioManager.getStudio(studioId)

    let response: any = {
      studio
    }

    // Include upcoming classes if requested
    if (includeClasses) {
      const now = new Date()
      const endOfWeek = new Date()
      endOfWeek.setDate(endOfWeek.getDate() + 7)

      const classes = await studioManager.getStudioClasses(studioId, {
        includeBookingStats: true,
        startDate: now,
        endDate: endOfWeek
      })

      response.classes = classes
    }

    // Include analytics/stats if requested
    if (includeStats) {
      const stats = await studioManager.getStudioAnalytics(studioId, 'month')
      response.stats = stats
    }

    // Include staff bio information if requested (for studio profiles)
    if (includeBio) {
      const { data: staff } = await supabase
        .from('gym_staff')
        .select(`
          *,
          user:profiles(full_name, bio, profile_image)
        `)
        .eq('gym_id', studioId)
        .eq('status', 'active')
        .in('role', ['owner', 'manager', 'instructor'])

      response.staff = staff
    }

    // Get user's relationship to this studio if authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: userStaff } = await supabase
        .from('gym_staff')
        .select('role, permissions, status')
        .eq('gym_id', studioId)
        .eq('user_id', user.id)
        .single()

      if (userStaff) {
        response.userRole = {
          role: userStaff.role,
          permissions: userStaff.permissions,
          status: userStaff.status
        }
      }

      // Get user's booking history at this studio
      const { data: userBookings } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          created_at,
          fitness_class:fitness_classes(name, start_time)
        `)
        .eq('user_id', user.id)
        .eq('fitness_classes.gym_id', studioId)
        .order('created_at', { ascending: false })
        .limit(5)

      response.userBookingHistory = userBookings || []
    }

    // Calculate studio metrics for public view
    const { data: publicStats } = await supabase
      .from('fitness_classes')
      .select('id, category, average_rating')
      .eq('gym_id', studioId)
      .eq('status', 'scheduled')
      .gte('start_time', new Date().toISOString())

    if (publicStats) {
      const categories = [...new Set(publicStats.map(c => c.category).filter(Boolean))]
      const ratingsWithValues = publicStats.filter(c => c.average_rating && c.average_rating > 0)
      const averageRating = ratingsWithValues.length > 0 
        ? ratingsWithValues.reduce((sum, c) => sum + (c.average_rating || 0), 0) / ratingsWithValues.length
        : 0

      response.publicMetrics = {
        upcomingClasses: publicStats.length,
        categories,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: ratingsWithValues.length
      }
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Error fetching studio:', error)
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Studio not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch studio details', message: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/studios/[id] - Update studio information (owners/managers only)
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

    const { id: studioId } = params

    if (!studioId) {
      return NextResponse.json(
        { error: 'Studio ID is required' },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateStudioSchema.parse(body)

    // Check if user has permission to edit this studio
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const { data: staffRecord } = await supabase
      .from('gym_staff')
      .select('role, permissions')
      .eq('gym_id', studioId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    const isAdmin = userProfile?.role === 'admin'
    const isGymOwner = staffRecord?.role === 'owner'
    const isGymManager = staffRecord?.role === 'manager'
    const canEditStudio = staffRecord?.permissions?.includes('edit_studio')

    if (!isAdmin && !isGymOwner && !isGymManager && !canEditStudio) {
      return NextResponse.json(
        { error: 'Insufficient permissions to edit this studio' },
        { status: 403 }
      )
    }

    // Update the studio
    const updatedStudio = await studioManager.updateStudio(studioId, validatedData)

    // Log the update for audit trail
    await logStudioEvent({
      userId: user.id,
      studioId,
      action: 'updated',
      changes: Object.keys(validatedData)
    })

    return NextResponse.json({
      success: true,
      studio: updatedStudio,
      message: 'Studio updated successfully'
    })

  } catch (error: any) {
    console.error('Error updating studio:', error)

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
      { error: 'Failed to update studio', message: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/studios/[id] - Deactivate studio (admin only)
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

    const { id: studioId } = params
    const { searchParams } = new URL(request.url)
    const reason = searchParams.get('reason') || 'Deactivated by admin'
    const permanent = searchParams.get('permanent') === 'true'

    if (!studioId) {
      return NextResponse.json(
        { error: 'Studio ID is required' },
        { status: 400 }
      )
    }

    // Check if user is admin or studio owner
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const { data: staffRecord } = await supabase
      .from('gym_staff')
      .select('role')
      .eq('gym_id', studioId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    const isAdmin = userProfile?.role === 'admin'
    const isGymOwner = staffRecord?.role === 'owner'

    if (!isAdmin && !isGymOwner) {
      return NextResponse.json(
        { error: 'Insufficient permissions to deactivate this studio' },
        { status: 403 }
      )
    }

    // Get studio information first
    const studio = await studioManager.getStudio(studioId)

    // Check for active classes and bookings
    const { data: activeClasses } = await supabase
      .from('fitness_classes')
      .select(`
        id,
        name,
        start_time,
        bookings!inner(id, status)
      `)
      .eq('gym_id', studioId)
      .eq('status', 'scheduled')
      .gte('start_time', new Date().toISOString())

    const confirmedBookingsCount = activeClasses?.reduce((total, cls) => {
      return total + (cls.bookings?.filter(b => b.status === 'confirmed').length || 0)
    }, 0) || 0

    // If there are confirmed bookings, require special handling
    if (confirmedBookingsCount > 0 && !permanent) {
      return NextResponse.json({
        error: 'Cannot deactivate studio with active bookings',
        details: {
          activeClasses: activeClasses?.length || 0,
          confirmedBookings: confirmedBookingsCount,
          message: 'Cancel all future classes first or use permanent=true to force deactivation'
        }
      }, { status: 409 })
    }

    // Deactivate the studio
    await studioManager.updateStudio(studioId, {
      status: 'inactive',
      metadata: {
        deactivated_by: user.id,
        deactivated_at: new Date().toISOString(),
        deactivation_reason: reason,
        permanent
      }
    })

    let cancelledClasses = 0
    let refundedBookings = 0

    // If permanent deactivation, cancel all future classes
    if (permanent && activeClasses && activeClasses.length > 0) {
      const classIds = activeClasses.map(cls => cls.id)
      
      // Cancel all future classes
      await supabase
        .from('fitness_classes')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
          metadata: {
            cancelled_reason: 'Studio deactivated',
            cancelled_by: user.id
          }
        })
        .in('id', classIds)

      // Cancel all related bookings
      await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
          metadata: {
            cancelled_by_studio: true,
            cancellation_reason: 'Studio deactivated'
          }
        })
        .in('class_id', classIds)
        .in('status', ['confirmed', 'waitlisted'])

      // Process refunds
      for (const cls of activeClasses) {
        const confirmedBookings = cls.bookings?.filter(b => b.status === 'confirmed') || []
        
        for (const booking of confirmedBookings) {
          // Get class details for refund amount
          const { data: classDetails } = await supabase
            .from('fitness_classes')
            .select('credits_required')
            .eq('id', cls.id)
            .single()

          if (classDetails) {
            // Add refund transaction
            await supabase
              .from('credit_transactions')
              .insert({
                user_id: booking.user_id,
                amount: classDetails.credits_required,
                transaction_type: 'refund',
                description: `Refund: ${cls.name} (studio deactivated)`,
                reference_id: cls.id
              })

            // Update user's credit balance
            await supabase
              .rpc('update_user_credits', {
                user_id: booking.user_id,
                credit_change: classDetails.credits_required
              })
          }
        }
        
        refundedBookings += confirmedBookings.length
      }

      cancelledClasses = classIds.length
    }

    // Deactivate all staff memberships
    await supabase
      .from('gym_staff')
      .update({
        status: 'inactive',
        terminated_date: new Date().toISOString(),
        termination_reason: 'Studio deactivated'
      })
      .eq('gym_id', studioId)
      .eq('status', 'active')

    // Log the deactivation
    await logStudioEvent({
      userId: user.id,
      studioId,
      action: 'deactivated',
      reason,
      permanent,
      cancelledClasses,
      refundedBookings
    })

    return NextResponse.json({
      success: true,
      message: permanent 
        ? `Studio permanently deactivated. ${cancelledClasses} classes cancelled, ${refundedBookings} bookings refunded.`
        : 'Studio deactivated successfully.',
      details: {
        cancelledClasses,
        refundedBookings,
        permanent
      }
    })

  } catch (error: any) {
    console.error('Error deactivating studio:', error)
    return NextResponse.json(
      { error: 'Failed to deactivate studio', message: error.message },
      { status: 500 }
    )
  }
}

// Analytics logging function
async function logStudioEvent(event: {
  userId: string
  studioId: string
  action: string
  changes?: string[]
  reason?: string
  permanent?: boolean
  cancelledClasses?: number
  refundedBookings?: number
}) {
  // In a real implementation, you would log to an analytics service
  console.log('Studio event:', {
    ...event,
    timestamp: new Date().toISOString()
  })
}