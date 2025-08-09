'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { auth, profiles, credits } from '@/lib/supabase/browser'
import type { Profile, UserCredits } from '@/types/database.types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  credits: UserCredits | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshCredits: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load user profile
  const loadProfile = async (userId: string) => {
    try {
      const userProfile = await profiles.getById(userId)
      setProfile(userProfile)
    } catch (error) {
      console.error('Error loading profile:', error)
      setProfile(null)
    }
  }

  // Load user credits
  const loadCredits = async (userId: string) => {
    try {
      const userCreditsData = await credits.getByUserId(userId)
      setUserCredits(userCreditsData)
    } catch (error) {
      console.error('Error loading credits:', error)
      setUserCredits(null)
    }
  }

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const currentUser = await auth.getUser()
        
        if (mounted) {
          setUser(currentUser)
          
          if (currentUser) {
            await Promise.all([
              loadProfile(currentUser.id),
              loadCredits(currentUser.id)
            ])
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
  }, [])

  // Listen for auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        await Promise.all([
          loadProfile(currentUser.id),
          loadCredits(currentUser.id)
        ])
      } else {
        setProfile(null)
        setUserCredits(null)
      }

      setLoading(false)

      // Handle auth events
      if (event === 'SIGNED_IN') {
        // User signed in
        console.log('User signed in:', currentUser?.email)
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        console.log('User signed out')
        router.push('/')
      } else if (event === 'TOKEN_REFRESHED') {
        // Token refreshed
        console.log('Token refreshed')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  // Auth methods
  const signIn = async (email: string, password: string) => {
    const { user: signedInUser } = await auth.signIn(email, password)
    if (signedInUser) {
      await Promise.all([
        loadProfile(signedInUser.id),
        loadCredits(signedInUser.id)
      ])
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    await auth.signUp(email, password, userData)
    // Profile and credits will be loaded via the auth state change listener
  }

  const signOut = async () => {
    await auth.signOut()
    setUser(null)
    setProfile(null)
    setUserCredits(null)
  }

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id)
    }
  }

  const refreshCredits = async () => {
    if (user) {
      await loadCredits(user.id)
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    credits: userCredits,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    refreshCredits,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}