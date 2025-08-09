import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database.types'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard'

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    
    const errorUrl = new URL('/login', requestUrl.origin)
    errorUrl.searchParams.set('error', error)
    if (errorDescription) {
      errorUrl.searchParams.set('error_description', errorDescription)
    }
    
    return NextResponse.redirect(errorUrl)
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    try {
      // Exchange the code for a session
      const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code)

      if (authError) {
        throw authError
      }

      if (data.user) {
        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, role, status')
          .eq('id', data.user.id)
          .single()

        if (profileError || !profile) {
          // Create profile if it doesn't exist
          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
              avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
              role: 'user',
              status: 'active',
              monthly_credits: 4, // Default credits
            })

          if (createProfileError) {
            console.error('Error creating profile:', createProfileError)
            // Continue anyway - profile creation can be handled later
          }
        }

        // Update last login
        await supabase
          .from('profiles')
          .update({
            last_login_at: new Date().toISOString(),
            login_count: supabase.raw('login_count + 1'),
          })
          .eq('id', data.user.id)

        // Successful authentication - redirect to intended destination
        const successUrl = new URL(redirectTo, requestUrl.origin)
        return NextResponse.redirect(successUrl)
      }
    } catch (error) {
      console.error('Error during auth callback:', error)
      
      const errorUrl = new URL('/login', requestUrl.origin)
      errorUrl.searchParams.set('error', 'callback_error')
      errorUrl.searchParams.set('error_description', 'Authentication failed. Please try again.')
      
      return NextResponse.redirect(errorUrl)
    }
  }

  // If no code and no error, redirect to login
  const loginUrl = new URL('/login', requestUrl.origin)
  loginUrl.searchParams.set('error', 'no_code')
  loginUrl.searchParams.set('error_description', 'No authentication code received.')
  
  return NextResponse.redirect(loginUrl)
}

export async function POST(request: NextRequest) {
  // Handle POST requests for manual session exchange if needed
  return new NextResponse('Method not allowed', { status: 405 })
}