'use client'

import { Fragment } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

interface BreadcrumbsProps {
  className?: string
  maxItems?: number
  showHome?: boolean
}

interface BreadcrumbSegment {
  label: string
  href: string
  isActive?: boolean
}

export function Breadcrumbs({ 
  className, 
  maxItems = 3,
  showHome = true 
}: BreadcrumbsProps) {
  const pathname = usePathname()
  const { profile } = useAuth()
  
  const userRole = profile?.role || 'user'

  // Generate breadcrumb segments from pathname
  const generateBreadcrumbs = (): BreadcrumbSegment[] => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbSegment[] = []

    // Home breadcrumb
    if (showHome) {
      const homeHref = getHomePath(userRole)
      breadcrumbs.push({
        label: 'Home',
        href: homeHref,
        isActive: pathname === homeHref
      })
    }

    // Build breadcrumbs from URL segments
    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === segments.length - 1
      
      breadcrumbs.push({
        label: formatSegmentLabel(segment, segments, index),
        href: currentPath,
        isActive: isLast
      })
    })

    return breadcrumbs
  }

  const getHomePath = (role: string): string => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard'
      case 'staff':
        return '/studio/dashboard'
      case 'user':
      default:
        return '/dashboard'
    }
  }

  const formatSegmentLabel = (segment: string, allSegments: string[], index: number): string => {
    // Custom labels for specific routes
    const labelMap: Record<string, string> = {
      // Dashboard routes
      dashboard: 'Dashboard',
      
      // User routes
      classes: 'Browse Classes',
      bookings: 'My Bookings',
      history: 'Class History',
      credits: 'Credits',
      studios: 'Studios',
      profile: 'Profile',
      settings: 'Settings',
      notifications: 'Notifications',
      
      // Studio routes
      studio: 'Studio',
      members: 'Members',
      analytics: 'Analytics',
      schedule: 'Schedule',
      
      // Admin routes
      admin: 'Admin',
      users: 'User Management',
      system: 'System',
      security: 'Security',
      audit: 'Audit Logs',
      
      // Common routes
      new: 'New',
      edit: 'Edit',
      create: 'Create',
      pending: 'Pending',
      suspended: 'Suspended',
      health: 'System Health',
    }

    // Check if we have a custom label
    if (labelMap[segment]) {
      return labelMap[segment]
    }

    // Handle dynamic routes (IDs, etc.)
    if (isUuid(segment) || isNumericId(segment)) {
      // Look at the previous segment to determine context
      const prevSegment = index > 0 ? allSegments[index - 1] : ''
      
      if (prevSegment === 'classes') {
        return 'Class Details'
      } else if (prevSegment === 'users') {
        return 'User Details'
      } else if (prevSegment === 'bookings') {
        return 'Booking Details'
      } else if (prevSegment === 'studios') {
        return 'Studio Details'
      }
      
      return 'Details'
    }

    // Default: capitalize first letter and replace hyphens/underscores with spaces
    return segment
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  const isUuid = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  const isNumericId = (str: string): boolean => {
    return /^\d+$/.test(str)
  }

  const breadcrumbs = generateBreadcrumbs()
  
  // Don't show breadcrumbs on home page
  if (breadcrumbs.length <= 1 && showHome) {
    return null
  }

  // Handle overflow when there are too many items
  const shouldCollapse = breadcrumbs.length > maxItems
  let visibleBreadcrumbs = breadcrumbs

  if (shouldCollapse) {
    const firstItems = breadcrumbs.slice(0, 1) // Always show first
    const lastItems = breadcrumbs.slice(-2) // Always show last 2
    const hiddenItems = breadcrumbs.slice(1, -2) // Items to hide in dropdown
    
    visibleBreadcrumbs = [
      ...firstItems,
      ...lastItems
    ]
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {shouldCollapse ? (
          <>
            {/* First item */}
            <BreadcrumbItem>
              {visibleBreadcrumbs[0].isActive ? (
                <BreadcrumbPage>
                  {visibleBreadcrumbs[0].label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={visibleBreadcrumbs[0].href}>
                    {visibleBreadcrumbs[0].label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            
            <BreadcrumbSeparator />
            
            {/* Collapsed items dropdown */}
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  <BreadcrumbEllipsis className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {breadcrumbs.slice(1, -2).map((crumb, index) => (
                    <DropdownMenuItem key={`hidden-${index}`} asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            
            <BreadcrumbSeparator />
            
            {/* Last two items */}
            {visibleBreadcrumbs.slice(-2).map((crumb, index) => (
              <Fragment key={`visible-${index}`}>
                <BreadcrumbItem>
                  {crumb.isActive ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < visibleBreadcrumbs.slice(-2).length - 1 && (
                  <BreadcrumbSeparator />
                )}
              </Fragment>
            ))}
          </>
        ) : (
          // No collapse needed, show all items
          breadcrumbs.map((crumb, index) => (
            <Fragment key={index}>
              <BreadcrumbItem>
                {crumb.isActive ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

// Custom breadcrumb component for manual control
interface CustomBreadcrumbsProps {
  items: { label: string; href?: string }[]
  className?: string
}

export function CustomBreadcrumbs({ items, className }: CustomBreadcrumbsProps) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, index) => (
          <Fragment key={index}>
            <BreadcrumbItem>
              {item.href && index < items.length - 1 ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}