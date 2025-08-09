import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database.types'

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  try {
    // Get the current user before signing out
    const { data: { user } } = await supabase.auth.getUser()

    // Sign out the user
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Error signing out:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Log the signout activity (optional)
    if (user) {
      // You could log signout activity here if needed
      console.log(`User ${user.id} signed out at ${new Date().toISOString()}`)
    }

    // Return success response
    return NextResponse.json(
      { message: 'Signed out successfully' },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Signout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests for signout (for direct URL access)
  const requestUrl = new URL(request.url)
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  try {
    // Get the current user before signing out
    const { data: { user } } = await supabase.auth.getUser()

    // Sign out the user
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Error signing out:', error)
    }

    // Log the signout activity (optional)
    if (user) {
      console.log(`User ${user.id} signed out at ${new Date().toISOString()}`)
    }

    // Redirect to home page or login page
    const redirectTo = requestUrl.searchParams.get('redirectTo') || '/'
    const redirectUrl = new URL(redirectTo, requestUrl.origin)
    
    // Add a success message to the URL
    redirectUrl.searchParams.set('message', 'You have been signed out successfully')
    
    return NextResponse.redirect(redirectUrl)

  } catch (error: any) {
    console.error('Signout error:', error)
    
    // Redirect to home page even if there's an error
    const redirectUrl = new URL('/', requestUrl.origin)
    redirectUrl.searchParams.set('error', 'signout_error')
    
    return NextResponse.redirect(redirectUrl)
  }
}

// Handle other HTTP methods
export async function PUT(request: NextRequest) {
  return new NextResponse('Method not allowed', { status: 405 })
}

export async function DELETE(request: NextRequest) {
  return new NextResponse('Method not allowed', { status: 405 })
}

export async function PATCH(request: NextRequest) {
  return new NextResponse('Method not allowed', { status: 405 })
}