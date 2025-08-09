import { User } from '@supabase/auth-helpers-nextjs'
import type { Database, Profile } from '@/types/database.types'

type UserRole = Database['public']['Enums']['user_role']

/**
 * Check if a user has a specific role
 */
export function hasRole(profile: Profile | null, role: UserRole): boolean {
  return profile?.role === role
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(profile: Profile | null, roles: UserRole[]): boolean {
  return profile ? roles.includes(profile.role) : false
}

/**
 * Check if a user is an admin
 */
export function isAdmin(profile: Profile | null): boolean {
  return hasRole(profile, 'admin')
}

/**
 * Check if a user is staff (including admin)
 */
export function isStaff(profile: Profile | null): boolean {
  return hasAnyRole(profile, ['staff', 'admin'])
}

/**
 * Check if a user is a regular user
 */
export function isUser(profile: Profile | null): boolean {
  return hasRole(profile, 'user')
}

/**
 * Check if a user's email is verified
 */
export function isEmailVerified(user: User | null): boolean {
  return !!user?.email_confirmed_at
}

/**
 * Check if a user's profile is complete
 */
export function isProfileComplete(profile: Profile | null): boolean {
  if (!profile) return false
  
  const requiredFields = ['full_name', 'email']
  return requiredFields.every(field => {
    const value = profile[field as keyof Profile]
    return value !== null && value !== undefined && value !== ''
  })
}

/**
 * Check if a user can access admin features
 */
export function canAccessAdmin(profile: Profile | null): boolean {
  return isAdmin(profile)
}

/**
 * Check if a user can access studio features
 */
export function canAccessStudio(profile: Profile | null): boolean {
  return isStaff(profile)
}

/**
 * Get user display name from profile or user data
 */
export function getUserDisplayName(user: User | null, profile: Profile | null): string {
  if (profile?.full_name) {
    return profile.full_name
  }
  
  if (user?.user_metadata?.full_name) {
    return user.user_metadata.full_name
  }
  
  if (user?.user_metadata?.name) {
    return user.user_metadata.name
  }
  
  if (user?.email) {
    return user.email.split('@')[0]
  }
  
  return 'User'
}

/**
 * Get user avatar URL from profile or user data
 */
export function getUserAvatarUrl(user: User | null, profile: Profile | null): string | undefined {
  if (profile?.avatar_url) {
    return profile.avatar_url
  }
  
  if (user?.user_metadata?.avatar_url) {
    return user.user_metadata.avatar_url
  }
  
  if (user?.user_metadata?.picture) {
    return user.user_metadata.picture
  }
  
  return undefined
}

/**
 * Get user initials for avatar fallback
 */
export function getUserInitials(user: User | null, profile: Profile | null): string {
  const displayName = getUserDisplayName(user, profile)
  
  if (displayName === 'User') {
    return user?.email?.slice(0, 2).toUpperCase() || 'U'
  }
  
  return displayName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Check if user account is active
 */
export function isAccountActive(profile: Profile | null): boolean {
  return profile?.status === 'active'
}

/**
 * Check if user account is suspended
 */
export function isAccountSuspended(profile: Profile | null): boolean {
  return profile?.status === 'suspended'
}

/**
 * Check if user account is pending approval
 */
export function isAccountPending(profile: Profile | null): boolean {
  return profile?.status === 'pending'
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Administrator'
    case 'staff':
      return 'Studio Staff'
    case 'user':
      return 'Member'
    default:
      return 'User'
  }
}

/**
 * Get role badge color
 */
export function getRoleBadgeVariant(role: UserRole): 'default' | 'destructive' | 'outline' | 'secondary' {
  switch (role) {
    case 'admin':
      return 'destructive'
    case 'staff':
      return 'default'
    case 'user':
      return 'secondary'
    default:
      return 'outline'
  }
}

/**
 * Format user's last login time
 */
export function formatLastLogin(lastLogin: string | null): string {
  if (!lastLogin) return 'Never'
  
  const date = new Date(lastLogin)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString()
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0
  
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Password must be at least 8 characters long')
  }
  
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Password must contain at least one lowercase letter')
  }
  
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Password must contain at least one uppercase letter')
  }
  
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('Password must contain at least one number')
  }
  
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1
  } else {
    feedback.push('Password should contain at least one special character')
  }
  
  return {
    isValid: score >= 4,
    score,
    feedback
  }
}