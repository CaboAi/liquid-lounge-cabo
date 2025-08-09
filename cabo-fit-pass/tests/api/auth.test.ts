/**
 * @jest-environment node
 */

import { createMocks } from 'node-mocks-http'
import type { NextApiRequest, NextApiResponse } from 'next'

// Mock handlers for authentication endpoints
const mockSupabaseAuth = {
  signUp: jest.fn(),
  signInWithPassword: jest.fn(),
  signOut: jest.fn(),
  getUser: jest.fn(),
  resetPasswordForEmail: jest.fn(),
}

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: mockSupabaseAuth,
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  })),
}))

// Mock API handlers
const signupHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password, fullName } = req.body

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Email, password, and full name are required'
      })
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password too short',
        details: 'Password must be at least 8 characters long'
      })
    }

    if (!email.includes('@')) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        details: 'Please provide a valid email address'
      })
    }

    // Mock Supabase signup call
    const { data, error } = await mockSupabaseAuth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        return res.status(409).json({
          error: 'User already exists',
          details: 'An account with this email already exists'
        })
      }
      throw error
    }

    return res.status(201).json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: fullName,
      },
      message: 'Account created successfully. Please check your email for verification.',
    })
  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: 'Failed to create account'
    })
  }
}

const signinHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing credentials',
        details: 'Email and password are required'
      })
    }

    // Mock Supabase signin call
    const { data, error } = await mockSupabaseAuth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return res.status(401).json({
          error: 'Invalid credentials',
          details: 'Email or password is incorrect'
        })
      }
      if (error.message.includes('Email not confirmed')) {
        return res.status(403).json({
          error: 'Email not verified',
          details: 'Please verify your email before signing in'
        })
      }
      throw error
    }

    return res.status(200).json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.full_name,
      },
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      expiresAt: data.session?.expires_at,
    })
  } catch (error) {
    console.error('Signin error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: 'Failed to sign in'
    })
  }
}

const signoutHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { error } = await mockSupabaseAuth.signOut()

    if (error) {
      throw error
    }

    return res.status(200).json({ 
      message: 'Signed out successfully' 
    })
  } catch (error) {
    console.error('Signout error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: 'Failed to sign out'
    })
  }
}

const forgotPasswordHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ 
        error: 'Missing email',
        details: 'Email address is required'
      })
    }

    if (!email.includes('@')) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        details: 'Please provide a valid email address'
      })
    }

    const { error } = await mockSupabaseAuth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXTAUTH_URL}/auth/reset-password`,
    })

    if (error) {
      throw error
    }

    return res.status(200).json({
      message: 'Password reset email sent. Please check your inbox.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: 'Failed to send password reset email'
    })
  }
}

describe('/api/auth/signup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates a new user account successfully', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'test@cabofitpass.com',
        password: 'password123',
        fullName: 'Test User',
      },
    })

    mockSupabaseAuth.signUp.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@cabofitpass.com',
        },
      },
      error: null,
    })

    await signupHandler(req, res)

    expect(res._getStatusCode()).toBe(201)
    const data = JSON.parse(res._getData())
    expect(data.user.email).toBe('test@cabofitpass.com')
    expect(data.user.name).toBe('Test User')
    expect(data.message).toContain('Account created successfully')
  })

  it('validates required fields', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'test@cabofitpass.com',
        // Missing password and fullName
      },
    })

    await signupHandler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Missing required fields')
  })

  it('validates email format', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'invalid-email',
        password: 'password123',
        fullName: 'Test User',
      },
    })

    await signupHandler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Invalid email format')
  })

  it('validates password length', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'test@cabofitpass.com',
        password: '123',
        fullName: 'Test User',
      },
    })

    await signupHandler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Password too short')
  })

  it('handles existing user error', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'existing@cabofitpass.com',
        password: 'password123',
        fullName: 'Test User',
      },
    })

    mockSupabaseAuth.signUp.mockResolvedValue({
      data: null,
      error: { message: 'User already registered' },
    })

    await signupHandler(req, res)

    expect(res._getStatusCode()).toBe(409)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('User already exists')
  })

  it('handles Supabase errors', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'test@cabofitpass.com',
        password: 'password123',
        fullName: 'Test User',
      },
    })

    mockSupabaseAuth.signUp.mockRejectedValue(new Error('Database error'))

    await signupHandler(req, res)

    expect(res._getStatusCode()).toBe(500)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Internal server error')
  })

  it('rejects non-POST requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    })

    await signupHandler(req, res)

    expect(res._getStatusCode()).toBe(405)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Method not allowed')
  })
})

describe('/api/auth/signin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('signs in user successfully', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'test@cabofitpass.com',
        password: 'password123',
      },
    })

    mockSupabaseAuth.signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@cabofitpass.com',
          user_metadata: { full_name: 'Test User' },
        },
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_at: 1234567890,
        },
      },
      error: null,
    })

    await signinHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.user.email).toBe('test@cabofitpass.com')
    expect(data.accessToken).toBe('mock-access-token')
    expect(data.refreshToken).toBe('mock-refresh-token')
  })

  it('validates required credentials', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'test@cabofitpass.com',
        // Missing password
      },
    })

    await signinHandler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Missing credentials')
  })

  it('handles invalid credentials', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'wrong@cabofitpass.com',
        password: 'wrongpassword',
      },
    })

    mockSupabaseAuth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials' },
    })

    await signinHandler(req, res)

    expect(res._getStatusCode()).toBe(401)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Invalid credentials')
  })

  it('handles unverified email', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'unverified@cabofitpass.com',
        password: 'password123',
      },
    })

    mockSupabaseAuth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Email not confirmed' },
    })

    await signinHandler(req, res)

    expect(res._getStatusCode()).toBe(403)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Email not verified')
  })

  it('handles server errors', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'test@cabofitpass.com',
        password: 'password123',
      },
    })

    mockSupabaseAuth.signInWithPassword.mockRejectedValue(new Error('Server error'))

    await signinHandler(req, res)

    expect(res._getStatusCode()).toBe(500)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Internal server error')
  })

  it('rejects non-POST requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    })

    await signinHandler(req, res)

    expect(res._getStatusCode()).toBe(405)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Method not allowed')
  })
})

describe('/api/auth/signout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('signs out user successfully', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    })

    mockSupabaseAuth.signOut.mockResolvedValue({
      error: null,
    })

    await signoutHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.message).toBe('Signed out successfully')
  })

  it('handles signout errors', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    })

    mockSupabaseAuth.signOut.mockRejectedValue(new Error('Signout failed'))

    await signoutHandler(req, res)

    expect(res._getStatusCode()).toBe(500)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Internal server error')
  })

  it('rejects non-POST requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    })

    await signoutHandler(req, res)

    expect(res._getStatusCode()).toBe(405)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Method not allowed')
  })
})

describe('/api/auth/forgot-password', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sends password reset email successfully', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'test@cabofitpass.com',
      },
    })

    mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({
      error: null,
    })

    await forgotPasswordHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.message).toContain('Password reset email sent')
    expect(mockSupabaseAuth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@cabofitpass.com',
      expect.objectContaining({
        redirectTo: expect.stringContaining('/auth/reset-password'),
      })
    )
  })

  it('validates email field', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        // Missing email
      },
    })

    await forgotPasswordHandler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Missing email')
  })

  it('validates email format', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'invalid-email',
      },
    })

    await forgotPasswordHandler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Invalid email format')
  })

  it('handles reset password errors', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: 'test@cabofitpass.com',
      },
    })

    mockSupabaseAuth.resetPasswordForEmail.mockRejectedValue(new Error('Email service error'))

    await forgotPasswordHandler(req, res)

    expect(res._getStatusCode()).toBe(500)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Internal server error')
  })

  it('rejects non-POST requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    })

    await forgotPasswordHandler(req, res)

    expect(res._getStatusCode()).toBe(405)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Method not allowed')
  })
})