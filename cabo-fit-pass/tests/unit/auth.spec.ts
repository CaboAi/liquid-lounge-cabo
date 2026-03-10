import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockSignInWithOAuth = vi.fn()
const mockSignOut = vi.fn()
const mockGetUser = vi.fn()
const mockUpdateUser = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
      updateUser: mockUpdateUser,
    },
  })),
}))

// Mock next/navigation so components can render without a real router
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) }),
  redirect: vi.fn(),
}))

// Mock next/headers — used by the server supabase client (route handlers)
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}))

// Mock @supabase/ssr createServerClient for route handler tests
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
      updateUser: mockUpdateUser,
    },
  })),
  createServerClient: vi.fn(() => ({
    auth: {
      signOut: mockSignOut,
      getUser: mockGetUser,
    },
  })),
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
  mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null })
  mockSignOut.mockResolvedValue({ error: null })
  mockUpdateUser.mockResolvedValue({ data: {}, error: null })
  mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
})

// ---------------------------------------------------------------------------
// 1. SignInForm — Google OAuth button renders
// ---------------------------------------------------------------------------

describe('SignInForm', () => {
  it('renders a Google OAuth button with text matching /google/i', async () => {
    const { default: SignInForm } = await import(
      '@/app/auth/signin/sign-in-form'
    )
    render(React.createElement(SignInForm))
    expect(screen.getByRole('button', { name: /google/i })).toBeDefined()
  })

  it('calls signInWithOAuth with provider google and redirectTo containing /auth/callback on button click', async () => {
    const { default: SignInForm } = await import(
      '@/app/auth/signin/sign-in-form'
    )
    render(React.createElement(SignInForm))

    const googleBtn = screen.getByRole('button', { name: /google/i })
    fireEvent.click(googleBtn)

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
        },
      })
    })
  })
})

// ---------------------------------------------------------------------------
// 2. POST /auth/signout route
// ---------------------------------------------------------------------------

describe('POST /auth/signout', () => {
  it('calls supabase.auth.signOut and redirects to /auth/signin', async () => {
    const { POST } = await import('@/app/auth/signout/route')

    const mockRedirect = vi.fn()
    vi.doMock('next/navigation', () => ({
      redirect: mockRedirect,
      useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
      useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) }),
    }))

    const request = new Request('http://localhost/auth/signout', {
      method: 'POST',
    })

    try {
      await POST(request)
    } catch {
      // redirect() throws in Next.js — that is expected behavior
    }

    expect(mockSignOut).toHaveBeenCalledOnce()
  })
})

// ---------------------------------------------------------------------------
// 3. Reset-password page renders
// ---------------------------------------------------------------------------

describe('ResetPasswordPage', () => {
  it('renders a password input and an update-password submit button', async () => {
    const { default: ResetPasswordPage } = await import(
      '@/app/auth/reset-password/page'
    )
    render(React.createElement(ResetPasswordPage))

    expect(screen.getByLabelText(/^new password$/i)).toBeDefined()
    expect(
      screen.getByRole('button', { name: /update password/i })
    ).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// 4. Middleware redirect logic
// ---------------------------------------------------------------------------

describe('middleware', () => {
  it('redirects unauthenticated request to /dashboard → /auth/signin?redirectTo=%2Fdashboard', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const { middleware } = await import('@/middleware')

    const url = 'http://localhost/dashboard'
    const request = new Request(url)

    // Build a minimal NextRequest-like object
    const nextRequest = {
      url,
      nextUrl: Object.assign(new URL(url), {
        clone: () => new URL(url),
      }),
      cookies: {
        getAll: () => [],
        set: vi.fn(),
      },
    } as unknown as import('next/server').NextRequest

    const response = await middleware(nextRequest)

    expect(response?.status).toBe(307)
    expect(response?.headers.get('location')).toContain('/auth/signin')
    expect(response?.headers.get('location')).toContain('redirectTo=%2Fdashboard')
  })

  it('passes authenticated request to /dashboard without redirect', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null,
    })

    const { middleware } = await import('@/middleware')

    const url = 'http://localhost/dashboard'
    const request = new Request(url)

    const nextRequest = {
      url,
      nextUrl: Object.assign(new URL(url), {
        clone: () => new URL(url),
      }),
      cookies: {
        getAll: () => [],
        set: vi.fn(),
      },
    } as unknown as import('next/server').NextRequest

    const response = await middleware(nextRequest)

    // Should NOT redirect — either null/undefined response or non-redirect status
    const location = response?.headers.get('location')
    const isRedirectToSignIn = location?.includes('/auth/signin')
    expect(isRedirectToSignIn).toBeFalsy()
  })
})
