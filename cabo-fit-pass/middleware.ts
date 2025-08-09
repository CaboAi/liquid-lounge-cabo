import { withAuth } from "next-auth/middleware"

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    // Add any custom middleware logic here if needed
    console.log("NextAuth middleware - User authenticated:", !!req.nextauth.token)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth routes without token
        if (req.nextUrl.pathname.startsWith('/auth/')) {
          return true
        }
        
        // Allow access to home page and public routes
        if (req.nextUrl.pathname === '/' || 
            req.nextUrl.pathname.startsWith('/api/auth') ||
            req.nextUrl.pathname.startsWith('/_next') ||
            req.nextUrl.pathname.startsWith('/public')) {
          return true
        }

        // Require token for protected routes
        if (req.nextUrl.pathname.startsWith('/dashboard') ||
            req.nextUrl.pathname.startsWith('/profile') ||
            req.nextUrl.pathname.startsWith('/bookings') ||
            req.nextUrl.pathname.startsWith('/admin')) {
          return !!token
        }

        // Allow all other routes by default
        return true
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}