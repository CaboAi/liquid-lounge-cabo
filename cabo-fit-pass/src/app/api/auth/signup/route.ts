import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { Database } from '@/types/database.types'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  accountType: z.enum(['user', 'studio'], {
    required_error: 'Account type is required',
  }),
  phone: z.string().optional(),
  marketingConsent: z.boolean().default(false),
})

type SignupRequest = z.infer<typeof signupSchema>

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = signupSchema.parse(body)

    const { email, password, fullName, accountType, phone, marketingConsent } = validatedData

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          account_type: accountType,
          phone: phone || null,
          marketing_consent: marketingConsent,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (authError) {
      console.error('Auth signup error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 400 }
      )
    }

    // Create profile record
    const profileData = {
      id: authData.user.id,
      email: email,
      full_name: fullName,
      phone: phone || null,
      role: accountType === 'studio' ? 'staff' as const : 'user' as const,
      status: 'active' as const,
      monthly_credits: accountType === 'user' ? 4 : 0, // Give users 4 credits, studios get 0
      marketing_consent: marketingConsent,
      timezone: 'America/Mazatlan', // Default to Los Cabos timezone
      locale: 'en',
      waiver_signed: false,
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)

    if (profileError) {
      console.error('Profile creation error:', profileError)
      
      // If profile creation fails, we should clean up the auth user
      // But Supabase doesn't allow deleting users from client side
      // This would need to be handled by a webhook or admin function
      
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    // If the account type is 'studio', we might want to create additional records
    if (accountType === 'studio') {
      // This could include creating a gym record or gym staff record
      // For now, we'll just set the role to 'staff' which was done above
      
      // TODO: Implement studio onboarding flow
      // - Create gym record
      // - Create gym_staff record
      // - Send welcome email with studio setup instructions
    }

    // Successful signup response
    const responseData = {
      user: {
        id: authData.user.id,
        email: authData.user.email,
        email_confirmed_at: authData.user.email_confirmed_at,
        full_name: fullName,
        account_type: accountType,
      },
      session: authData.session,
      message: authData.user.email_confirmed_at 
        ? 'Account created successfully' 
        : 'Account created! Please check your email to verify your account.',
      needsEmailVerification: !authData.user.email_confirmed_at,
    }

    return NextResponse.json(responseData, { status: 201 })

  } catch (error: any) {
    console.error('Signup API error:', error)

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

    // Handle other errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}