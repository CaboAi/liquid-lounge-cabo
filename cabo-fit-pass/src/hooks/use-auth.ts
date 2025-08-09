'use client'

import { useContext } from 'react'
import { AuthContext } from '@/providers/auth-provider'

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useUser() {
  const { user, loading } = useAuth()
  return { user, loading }
}

export function useProfile() {
  const { profile, loading } = useAuth()
  return { profile, loading }
}

export function useCredits() {
  const { credits, loading, refreshCredits } = useAuth()
  return { credits, loading, refreshCredits }
}