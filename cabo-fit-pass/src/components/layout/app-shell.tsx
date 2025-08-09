'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bell,
  Settings,
  User,
  LogOut,
  CreditCard,
  Shield
} from 'lucide-react'
import { Navigation } from '@/components/shared/navigation'
import { MobileMenu } from './mobile-menu'
import { Breadcrumbs } from './breadcrumbs'
import { useAuth } from '@/hooks/use-auth'
import { auth } from '@/lib/supabase/browser'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: ReactNode
  className?: string
  showBreadcrumbs?: boolean
  showUserMenu?: boolean
  pageTitle?: string
  pageDescription?: string
}

export function AppShell({
  children,
  className,
  showBreadcrumbs = true,
  showUserMenu = true,
  pageTitle,
  pageDescription
}: AppShellProps) {
  const { user, profile, credits, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const userInitials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || 'U'

  const getRoleDisplayName = (role?: string) => {
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

  const getRoleBadgeVariant = (role?: string) => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Navigation />
      <SidebarInset className="flex flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            
            {/* Mobile Menu for smaller screens */}
            <div className="lg:hidden">
              <MobileMenu />
            </div>
          </div>

          {/* Page Title */}
          {pageTitle && (
            <div className="flex-1">
              <h1 className="text-lg font-semibold">{pageTitle}</h1>
              {pageDescription && (
                <p className="text-sm text-muted-foreground">{pageDescription}</p>
              )}
            </div>
          )}

          {/* Spacer if no title */}
          {!pageTitle && <div className="flex-1" />}

          {/* User Menu */}
          {showUserMenu && (
            <div className="flex items-center gap-2">
              {/* Credits Badge for users */}
              {profile?.role === 'user' && credits !== undefined && (
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <CreditCard className="h-4 w-4 mr-1" />
                  {credits.current_balance} credits
                </Button>
              )}

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="hidden sm:flex relative">
                <Bell className="h-4 w-4" />
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                  2
                </div>
              </Button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <Badge variant={getRoleBadgeVariant(profile?.role)}>
                          {profile?.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                          {getRoleDisplayName(profile?.role)}
                        </Badge>
                        {profile?.role === 'user' && credits !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            {credits.current_balance} credits
                          </Badge>
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  {profile?.role === 'user' && (
                    <DropdownMenuItem onClick={() => router.push('/credits')}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Credits</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </header>

        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <div className="border-b px-4 py-2">
            <Breadcrumbs />
          </div>
        )}

        {/* Main Content */}
        <main className={cn("flex-1 flex flex-col", className)}>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}