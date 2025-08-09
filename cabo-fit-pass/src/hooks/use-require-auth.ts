'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './use-auth'
import type { Database } from '@/types/database.types'

type UserRole = Database['public']['Enums']['user_role']

interface UseRequireAuthOptions {
  redirectTo?: string
  requireRole?: UserRole | UserRole[]
  requireEmailVerified?: boolean
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { 
    redirectTo = '/login', 
    requireRole, 
    requireEmailVerified = false 
  } = options
  
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    // Check if user is authenticated
    if (!user) {
      const currentPath = window.location.pathname
      const redirectUrl = `${redirectTo}?redirectTo=${encodeURIComponent(currentPath)}`
      router.push(redirectUrl)
      return
    }

    // Check email verification
    if (requireEmailVerified && !user.email_confirmed_at) {
      router.push(`/verify-email?email=${encodeURIComponent(user.email || '')}`)
      return
    }

    // Check role requirements
    if (requireRole && profile) {
      const requiredRoles = Array.isArray(requireRole) ? requireRole : [requireRole]
      
      if (!requiredRoles.includes(profile.role)) {
        // Redirect based on user's actual role
        switch (profile.role) {
          case 'admin':
            router.push('/admin/dashboard')
            break
          case 'staff':
            router.push('/studio/dashboard')
            break
          case 'user':
            router.push('/dashboard')
            break
          default:
            router.push('/dashboard')
        }
        return
      }
    }
  }, [user, profile, loading, router, redirectTo, requireRole, requireEmailVerified])

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    hasRequiredRole: requireRole ? (
      profile ? (
        Array.isArray(requireRole) 
          ? requireRole.includes(profile.role)
          : profile.role === requireRole
      ) : false
    ) : true,
    isEmailVerified: !requireEmailVerified || !!user?.email_confirmed_at,
  }
}

// Specialized hooks for different user types
export function useRequireUser(redirectTo?: string) {
  return useRequireAuth({
    redirectTo,
    requireRole: 'user',
    requireEmailVerified: true,
  })
}

export function useRequireStaff(redirectTo?: string) {
  return useRequireAuth({
    redirectTo,
    requireRole: ['staff', 'admin'], // Staff or admin can access studio features
    requireEmailVerified: true,
  })
}

export function useRequireAdmin(redirectTo?: string) {
  return useRequireAuth({
    redirectTo,
    requireRole: 'admin',
    requireEmailVerified: true,
  })
}

export function useRequireEmailVerified(redirectTo?: string) {
  return useRequireAuth({
    redirectTo,
    requireEmailVerified: true,
  })
}