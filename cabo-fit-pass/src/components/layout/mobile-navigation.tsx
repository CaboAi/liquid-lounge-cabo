'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Menu, 
  Home, 
  Search, 
  Calendar, 
  CreditCard, 
  User, 
  MapPin,
  BookOpen,
  Settings,
  LogOut,
  Bell,
  Heart
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useUserBookings } from '@/hooks/use-user-bookings'
import { cn } from '@/lib/utils'
import { FocusTrap } from '@/components/accessibility/focus-trap'
import { useLiveRegion } from '@/components/accessibility/live-region'
import { MenuNavigation } from '@/components/accessibility/keyboard-navigation'
import { ARIA, touchTarget, contrast, semantic, SkipNavigation } from '@/lib/utils/accessibility'

interface NavigationItem {
  href: string
  label: string
  icon: React.ComponentType<any>
  badge?: number
  requireAuth?: boolean
}

const navigationItems: NavigationItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: Home
  },
  {
    href: '/classes',
    label: 'Classes',
    icon: Search
  },
  {
    href: '/studios',
    label: 'Studios',
    icon: MapPin
  },
  {
    href: '/bookings',
    label: 'My Bookings',
    icon: Calendar,
    requireAuth: true
  },
  {
    href: '/credits',
    label: 'Credits',
    icon: CreditCard,
    requireAuth: true
  }
]

const userMenuItems = [
  {
    href: '/profile',
    label: 'Profile',
    icon: User
  },
  {
    href: '/favorites',
    label: 'Favorites',
    icon: Heart
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings
  }
]

export function MobileNavigation() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const { upcomingBookings } = useUserBookings({ statusFilter: ['confirmed'] })
  const { announce } = useLiveRegion()

  // Close sheet when route changes
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Announce navigation state changes
  useEffect(() => {
    if (open) {
      announce('Navigation menu opened')
    }
  }, [open, announce])

  const upcomingCount = upcomingBookings.length

  const handleNavItemClick = (label: string) => {
    announce(`Navigating to ${label}`)
    setOpen(false)
  }

  const handleSignOut = () => {
    announce('Signing out')
    signOut()
    setOpen(false)
  }

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        
        <SheetContent 
          id="mobile-navigation"
          side="left" 
          className="w-80 p-0"
          {...ARIA.dialog.modal('navigation-title', 'navigation-description')}
        >
          <FocusTrap isActive={open} initialFocus="first">
            <div className="sr-only">
              <p id="navigation-description">
                Main navigation menu with links to all sections of CaboFitPass. Use arrow keys to navigate and Enter to select.
              </p>
            </div>
            
            <SheetHeader className="border-b p-6">
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.profile_image || undefined} />
                    <AvatarFallback>
                      {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <SheetTitle className="text-base">
                      {profile?.full_name || 'User'}
                    </SheetTitle>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex-1">
                  <SheetTitle className="text-base">CaboFitPass</SheetTitle>
                  <p className="text-sm text-muted-foreground">
                    Your fitness journey in Los Cabos
                  </p>
                </div>
              )}
            </div>
          </SheetHeader>

          <nav className="flex-1 overflow-y-auto">
            <div className="px-6 py-4">
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  if (item.requireAuth && !user) return null
                  
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  const badgeCount = item.label === 'My Bookings' ? upcomingCount : item.badge

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isActive 
                          ? 'bg-accent text-accent-foreground' 
                          : 'text-muted-foreground'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </div>
                      {badgeCount > 0 && (
                        <Badge variant="secondary" className="h-5 min-w-[20px] text-xs">
                          {badgeCount}
                        </Badge>
                      )}
                    </Link>
                  )
                })}
              </div>

              {user && (
                <>
                  <div className="my-6 border-t" />
                  
                  <div className="space-y-1">
                    <h4 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Account
                    </h4>
                    
                    {userMenuItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            isActive 
                              ? 'bg-accent text-accent-foreground' 
                              : 'text-muted-foreground'
                          )}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      )
                    })}
                    
                    <button
                      onClick={signOut}
                      className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}

              {!user && (
                <>
                  <div className="my-6 border-t" />
                  
                  <div className="space-y-2">
                    <Link href="/auth/signin">
                      <Button className="w-full" size="sm">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button variant="outline" className="w-full" size="sm">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </nav>

          <div className="border-t p-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>CaboFitPass v1.0</span>
              <Link 
                href="/help" 
                className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Help
              </Link>
            </div>
          </div>
          </FocusTrap>
        </SheetContent>
      </Sheet>
    </div>
  )
}

// Bottom navigation for mobile
export function MobileBottomNavigation() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { upcomingBookings } = useUserBookings({ statusFilter: ['confirmed'] })
  const { announce } = useLiveRegion()

  const bottomNavItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home
    },
    {
      href: '/classes',
      label: 'Classes',
      icon: Search
    },
    {
      href: '/bookings',
      label: 'Bookings',
      icon: Calendar,
      badge: upcomingBookings.length,
      requireAuth: true
    },
    {
      href: '/credits',
      label: 'Credits',
      icon: CreditCard,
      requireAuth: true
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: User,
      requireAuth: true
    }
  ]

  if (!user) {
    return null
  }

  const handleNavItemClick = (label: string) => {
    announce(`Navigating to ${label}`)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <nav 
        className="flex"
        {...semantic.nav('Bottom navigation')}
        role="tablist"
        aria-label="Main navigation tabs"
      >
        {bottomNavItems.map((item) => {
          if (item.requireAuth && !user) return null
          
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center py-3 text-xs font-medium transition-colors hover:bg-accent',
                touchTarget.minSize,
                contrast.focusVisible,
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleNavItemClick(item.label)}
            >
              <div className="relative">
                <Icon className={cn('h-5 w-5 mb-1', isActive && 'text-primary')} />
                {item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -right-2 -top-2 h-4 min-w-[16px] p-0 text-[10px]"
                    aria-label={`${item.badge > 99 ? 'More than 99' : item.badge} ${item.badge === 1 ? 'notification' : 'notifications'}`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className={cn(isActive && 'text-primary')} aria-hidden="true">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

// Header for mobile with notifications
export function MobileHeader() {
  const { user, profile } = useAuth()
  const { announce } = useLiveRegion()

  const handleNotificationClick = () => {
    announce('Opening notifications')
  }

  return (
    <>
      <SkipNavigation />
      <header 
        className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
        {...semantic.banner()}
      >
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <MobileNavigation />
          
          <Link 
            href="/" 
            className={cn("flex items-center space-x-2", touchTarget.minSize, contrast.focusVisible)}
            aria-label="CaboFitPass home"
          >
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">CF</span>
            </div>
            <span className="font-semibold">CaboFitPass</span>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          {user && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("h-10 w-10 p-0", touchTarget.minSize, contrast.focusVisible)}
                onClick={handleNotificationClick}
                aria-label="View notifications"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
              </Button>
              
              <Link 
                href="/profile"
                className={cn(touchTarget.minSize, contrast.focusVisible, "rounded-full")}
                aria-label={`View profile for ${profile?.full_name || 'user'}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.profile_image || undefined} />
                  <AvatarFallback>
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          )}

          {!user && (
            <Link href="/auth/signin">
              <Button 
                size="sm" 
                className={cn(touchTarget.minSize, contrast.focusVisible)}
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
      </header>
      {/* Main content landmark for screen readers */}
      <div id="main-content" tabIndex={-1} />
    </>
  )
}