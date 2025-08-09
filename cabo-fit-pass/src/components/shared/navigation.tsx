'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  Calendar,
  CreditCard,
  Users,
  MapPin,
  Settings,
  Bell,
  User,
  Heart,
  History,
  BarChart3,
  Shield,
  ChevronDown,
  ChevronUp,
  Menu,
  X
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import type { Database } from '@/types/database.types'

type UserRole = Database['public']['Enums']['user_role']

interface NavigationItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  roles?: UserRole[]
  items?: NavigationItem[]
}

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const { user, profile } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  
  const userRole = profile?.role || 'user'

  // Navigation items based on role
  const getNavigationItems = (role: UserRole): NavigationItem[] => {
    const baseItems: NavigationItem[] = []

    // User navigation
    if (role === 'user') {
      baseItems.push(
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: Home,
          roles: ['user']
        },
        {
          title: 'Browse Classes',
          url: '/classes',
          icon: Calendar,
          roles: ['user']
        },
        {
          title: 'My Bookings',
          url: '/bookings',
          icon: Heart,
          roles: ['user']
        },
        {
          title: 'History',
          url: '/history',
          icon: History,
          roles: ['user']
        },
        {
          title: 'Credits',
          url: '/credits',
          icon: CreditCard,
          badge: profile?.monthly_credits?.toString(),
          roles: ['user']
        },
        {
          title: 'Studios',
          url: '/studios',
          icon: MapPin,
          roles: ['user']
        }
      )
    }

    // Studio staff navigation
    if (role === 'staff') {
      baseItems.push(
        {
          title: 'Dashboard',
          url: '/studio/dashboard',
          icon: Home,
          roles: ['staff']
        },
        {
          title: 'Classes',
          url: '/studio/classes',
          icon: Calendar,
          roles: ['staff'],
          items: [
            {
              title: 'All Classes',
              url: '/studio/classes',
              icon: Calendar,
              roles: ['staff']
            },
            {
              title: 'Create Class',
              url: '/studio/classes/new',
              icon: Calendar,
              roles: ['staff']
            },
            {
              title: 'Schedule',
              url: '/studio/schedule',
              icon: Calendar,
              roles: ['staff']
            }
          ]
        },
        {
          title: 'Bookings',
          url: '/studio/bookings',
          icon: Users,
          badge: '12', // Could be dynamic
          roles: ['staff']
        },
        {
          title: 'Members',
          url: '/studio/members',
          icon: Users,
          roles: ['staff']
        },
        {
          title: 'Analytics',
          url: '/studio/analytics',
          icon: BarChart3,
          roles: ['staff']
        }
      )
    }

    // Admin navigation
    if (role === 'admin') {
      baseItems.push(
        {
          title: 'Admin Dashboard',
          url: '/admin/dashboard',
          icon: Shield,
          roles: ['admin']
        },
        {
          title: 'User Management',
          url: '/admin/users',
          icon: Users,
          roles: ['admin'],
          items: [
            {
              title: 'All Users',
              url: '/admin/users',
              icon: Users,
              roles: ['admin']
            },
            {
              title: 'Pending Approval',
              url: '/admin/users/pending',
              icon: Users,
              badge: '3',
              roles: ['admin']
            },
            {
              title: 'Suspended',
              url: '/admin/users/suspended',
              icon: Users,
              roles: ['admin']
            }
          ]
        },
        {
          title: 'Studio Management',
          url: '/admin/studios',
          icon: MapPin,
          roles: ['admin']
        },
        {
          title: 'Analytics',
          url: '/admin/analytics',
          icon: BarChart3,
          roles: ['admin']
        },
        {
          title: 'System',
          url: '/admin/system',
          icon: Settings,
          roles: ['admin'],
          items: [
            {
              title: 'System Health',
              url: '/admin/system/health',
              icon: Settings,
              roles: ['admin']
            },
            {
              title: 'Security',
              url: '/admin/security',
              icon: Shield,
              roles: ['admin']
            },
            {
              title: 'Audit Logs',
              url: '/admin/audit',
              icon: History,
              roles: ['admin']
            }
          ]
        }
      )
    }

    // Common items for all roles
    baseItems.push(
      {
        title: 'Profile',
        url: '/profile',
        icon: User,
        roles: ['user', 'staff', 'admin']
      },
      {
        title: 'Settings',
        url: '/settings',
        icon: Settings,
        roles: ['user', 'staff', 'admin']
      },
      {
        title: 'Notifications',
        url: '/notifications',
        icon: Bell,
        badge: '2', // Could be dynamic
        roles: ['user', 'staff', 'admin']
      }
    )

    return baseItems.filter(item => !item.roles || item.roles.includes(role))
  }

  const navigationItems = getNavigationItems(userRole)

  const isItemActive = (url: string) => {
    if (url === '/dashboard' && pathname === '/') return true
    return pathname.startsWith(url) && url !== '/'
  }

  const hasActiveChild = (items: NavigationItem[]) => {
    return items.some(item => isItemActive(item.url))
  }

  return (
    <Sidebar className={className}>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>
              {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        {userRole === 'admin' && (
          <Badge variant="destructive" className="w-fit mt-2">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        )}
        {userRole === 'staff' && (
          <Badge variant="default" className="w-fit mt-2">
            Staff
          </Badge>
        )}
      </SidebarHeader>

      <Separator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = isItemActive(item.url)
                const hasChildren = item.items && item.items.length > 0
                
                if (hasChildren) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Collapsible 
                        defaultOpen={hasActiveChild(item.items!)}
                        className="group/collapsible"
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={cn(
                              "w-full justify-between",
                              isActive && "bg-accent text-accent-foreground"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{item.title}</span>
                              {item.badge && (
                                <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items!.map((subItem) => {
                              const SubIcon = subItem.icon
                              const isSubActive = isItemActive(subItem.url)
                              
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton 
                                    asChild 
                                    isActive={isSubActive}
                                  >
                                    <Link href={subItem.url}>
                                      <SubIcon className="h-4 w-4" />
                                      <span>{subItem.title}</span>
                                      {subItem.badge && (
                                        <Badge variant="secondary" className="ml-auto h-4 px-1 text-xs">
                                          {subItem.badge}
                                        </Badge>
                                      )}
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </SidebarMenuItem>
                  )
                }
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

// Wrapper component for easy usage
export function NavigationProvider({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Navigation />
      <div className="flex-1">
        <header className="border-b">
          <div className="flex h-14 items-center px-4 gap-4">
            <SidebarTrigger />
            <div className="flex-1" />
            {/* Additional header content can go here */}
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}