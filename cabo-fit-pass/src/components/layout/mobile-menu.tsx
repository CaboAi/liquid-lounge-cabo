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
  Menu,
  X,
  LogOut,
  ChevronRight
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useAuth } from '@/hooks/use-auth'
import { auth } from '@/lib/supabase/browser'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database.types'

type UserRole = Database['public']['Enums']['user_role']

interface NavigationItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  roles?: UserRole[]
  items?: NavigationItem[]
  external?: boolean
}

interface MobileMenuProps {
  className?: string
}

export function MobileMenu({ className }: MobileMenuProps) {
  const { user, profile, credits } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const userRole = profile?.role || 'user'

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const getNavigationItems = (role: UserRole): NavigationItem[] => {
    const sections: { title: string; items: NavigationItem[] }[] = []

    // Main Navigation based on role
    if (role === 'user') {
      sections.push({
        title: 'Main',
        items: [
          { title: 'Dashboard', url: '/dashboard', icon: Home },
          { title: 'Browse Classes', url: '/classes', icon: Calendar },
          { title: 'My Bookings', url: '/bookings', icon: Heart },
          { title: 'History', url: '/history', icon: History },
          { title: 'Credits', url: '/credits', icon: CreditCard, badge: credits?.current_balance?.toString() },
          { title: 'Studios', url: '/studios', icon: MapPin },
        ]
      })
    } else if (role === 'staff') {
      sections.push({
        title: 'Studio',
        items: [
          { title: 'Dashboard', url: '/studio/dashboard', icon: Home },
          { title: 'Classes', url: '/studio/classes', icon: Calendar },
          { title: 'Bookings', url: '/studio/bookings', icon: Users, badge: '12' },
          { title: 'Members', url: '/studio/members', icon: Users },
          { title: 'Analytics', url: '/studio/analytics', icon: BarChart3 },
        ]
      })
    } else if (role === 'admin') {
      sections.push({
        title: 'Administration',
        items: [
          { title: 'Dashboard', url: '/admin/dashboard', icon: Shield },
          { title: 'Users', url: '/admin/users', icon: Users },
          { title: 'Studios', url: '/admin/studios', icon: MapPin },
          { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
          { title: 'System', url: '/admin/system', icon: Settings },
        ]
      })
    }

    // Common items for all roles
    sections.push({
      title: 'Account',
      items: [
        { title: 'Profile', url: '/profile', icon: User },
        { title: 'Settings', url: '/settings', icon: Settings },
        { title: 'Notifications', url: '/notifications', icon: Bell, badge: '2' },
      ]
    })

    // Flatten into single array with section headers
    const flatItems: NavigationItem[] = []
    sections.forEach((section, index) => {
      if (index > 0) {
        flatItems.push({ title: section.title, url: '', icon: () => null, roles: [] }) // Section header
      }
      flatItems.push(...section.items)
    })

    return flatItems
  }

  const navigationItems = getNavigationItems(userRole)

  const isItemActive = (url: string) => {
    if (!url) return false
    if (url === '/dashboard' && pathname === '/') return true
    return pathname.startsWith(url) && url !== '/'
  }

  const userInitials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || 'U'

  const getRoleDisplayName = (role: string) => {
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive' as const
      case 'staff':
        return 'default' as const
      case 'user':
        return 'secondary' as const
      default:
        return 'outline' as const
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("lg:hidden", className)}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open mobile menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-4 pb-0">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <SheetTitle className="text-base font-semibold truncate">
                {profile?.full_name || 'User'}
              </SheetTitle>
              <SheetDescription className="text-sm truncate">
                {user?.email}
              </SheetDescription>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getRoleBadgeVariant(userRole)} className="text-xs">
                  {userRole === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                  {getRoleDisplayName(userRole)}
                </Badge>
                {userRole === 'user' && credits !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    {credits.current_balance} credits
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <Separator className="mt-4" />

        {/* Navigation */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-1">
            {navigationItems.map((item, index) => {
              const Icon = item.icon
              const isActive = isItemActive(item.url)
              
              // Section header
              if (!item.url) {
                return (
                  <div key={`section-${index}`} className="px-3 py-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {item.title}
                    </h4>
                  </div>
                )
              }

              return (
                <Link
                  key={item.url}
                  href={item.url}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-accent text-accent-foreground font-medium"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  {item.external && (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Link>
              )
            })}
          </div>
        </ScrollArea>

        <Separator />

        {/* Footer Actions */}
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
            onClick={() => {
              setOpen(false)
              handleSignOut()
            }}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}