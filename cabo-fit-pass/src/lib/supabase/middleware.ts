/**
 * Supabase Middleware for Next.js App Router
 * Handles authentication state refresh and routing protection
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

/**
 * Middleware to handle Supabase authentication
 * Must be configured in middleware.ts at project root
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get the pathname from the request
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/bookings',
    '/credits',
    '/settings',
  ]

  // Define auth routes (redirect if already logged in)
  const authRoutes = [
    '/login',
    '/signup',
    '/auth',
  ]

  // Define admin routes
  const adminRoutes = [
    '/admin',
  ]

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if current route is auth-related
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if current route is admin-related
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Handle authentication logic
  if (!user) {
    // User is not authenticated
    if (isProtectedRoute || isAdminRoute) {
      // Redirect to login with callback URL
      const redirectUrl = url.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  } else {
    // User is authenticated
    if (isAuthRoute && pathname !== '/auth/callback') {
      // Redirect authenticated users away from auth pages
      const redirectUrl = url.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    // Check admin access for admin routes
    if (isAdminRoute) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (!profile || profile.role !== 'admin') {
          // Redirect non-admin users to dashboard
          const redirectUrl = url.clone()
          redirectUrl.pathname = '/dashboard'
          return NextResponse.redirect(redirectUrl)
        }
      } catch (error) {
        // Error fetching profile, redirect to dashboard
        const redirectUrl = url.clone()
        redirectUrl.pathname = '/dashboard'
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}

/**
 * Utility function to check if a route requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/bookings',
    '/credits',
    '/settings',
    '/admin',
  ]

  return protectedRoutes.some(route => pathname.startsWith(route))
}

/**
 * Utility function to check if a route is auth-related
 */
export function isAuthRoute(pathname: string): boolean {
  const authRoutes = [
    '/login',
    '/signup',
    '/auth',
  ]

  return authRoutes.some(route => pathname.startsWith(route))
}

/**
 * Utility function to check if a route requires admin privileges
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin')
}

/**
 * Higher-order component for protecting pages
 */
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    requireAuth?: boolean
    requireAdmin?: boolean
    redirectTo?: string
  } = {}
) {
  return function AuthenticatedComponent(props: P) {
    // This would be implemented in individual page components
    // using the useAuth hook or server-side checks
    return <WrappedComponent {...props} />
  }
}