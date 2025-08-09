import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client for authentication
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Authenticate with Supabase
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (authError || !authData.user) {
            console.error('Supabase auth error:', authError)
            return null
          }

          // Get user profile from profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single()

          if (profileError) {
            console.error('Profile fetch error:', profileError)
            // If no profile exists, create a basic one
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                id: authData.user.id,
                email: authData.user.email,
                full_name: authData.user.user_metadata?.full_name || null,
                role: 'user',
                monthly_credits: 4,
              })

            if (createError) {
              console.error('Profile creation error:', createError)
            }
          }

          // Return user object for NextAuth
          return {
            id: authData.user.id,
            email: authData.user.email!,
            name: profile?.full_name || authData.user.user_metadata?.full_name || authData.user.email,
            image: profile?.avatar_url || authData.user.user_metadata?.avatar_url || null,
            role: profile?.role || 'user',
            credits: profile?.monthly_credits || 4,
          }
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.credits = (user as any).credits
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
        ;(session.user as any).credits = token.credits
      }
      return session
    }
  }
}

import NextAuth from 'next-auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
