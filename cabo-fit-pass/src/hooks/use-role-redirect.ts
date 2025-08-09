'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './use-auth'

/**
 * Hook to redirect users to their appropriate dashboard based on role
 * Useful for landing pages or after authentication
 */
export function useRoleRedirect(defaultPath = '/dashboard') {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading || !user) return

    if (profile) {
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
          router.push(defaultPath)
      }
    } else {
      // If no profile exists yet, go to default
      router.push(defaultPath)
    }
  }, [user, profile, loading, router, defaultPath])

  return {
    user,
    profile,
    loading,
    redirecting: !loading && !!user,
  }
}

/**
 * Get the appropriate dashboard path for a user role
 */
export function getDashboardPath(role?: string): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'staff':
      return '/studio/dashboard'
    case 'user':
      return '/dashboard'
    default:
      return '/dashboard'
  }
}

/**
 * Check if user has permission to access a role-specific route
 */
export function hasRoleAccess(userRole?: string, requiredRole?: string | string[]): boolean {
  if (!userRole || !requiredRole) return false

  if (typeof requiredRole === 'string') {
    return userRole === requiredRole || userRole === 'admin' // Admins can access anything
  }

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole) || userRole === 'admin'
  }

  return false
}