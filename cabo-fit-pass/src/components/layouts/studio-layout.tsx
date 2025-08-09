'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BarChart3,
  Calendar,
  Users,
  Home,
  Settings,
  LogOut,
  Menu,
  Bell,
  MapPin,
  Plus,
  DollarSign,
  Clock,
  Star
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { auth } from '@/lib/supabase/browser'
import { useAuth } from '@/hooks/use-auth'

interface StudioLayoutProps {
  children: ReactNode
  className?: string
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/studio/dashboard',
    icon: Home,
    description: 'Studio overview and metrics'
  },
  {
    name: 'Classes',
    href: '/studio/classes',
    icon: Calendar,
    description: 'Manage class schedules'
  },
  {
    name: 'Members',
    href: '/studio/members',
    icon: Users,
    description: 'View and manage members'
  },
  {
    name: 'Analytics',
    href: '/studio/analytics',
    icon: BarChart3,
    description: 'Performance metrics and reports'
  },
  {
    name: 'Revenue',
    href: '/studio/revenue',
    icon: DollarSign,
    description: 'Financial tracking and payouts'
  },
  {
    name: 'Schedule',
    href: '/studio/schedule',
    icon: Clock,
    description: 'Weekly class schedule'
  },
  {
    name: 'Reviews',
    href: '/studio/reviews',
    icon: Star,
    description: 'Member feedback and ratings'
  }
]

const studioMenuItems = [
  { label: 'Studio Profile', href: '/studio/profile', icon: MapPin },
  { label: 'Settings', href: '/studio/settings', icon: Settings },
  { label: 'Notifications', href: '/studio/notifications', icon: Bell },
]

export function StudioLayout({ children, className }: StudioLayoutProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'S'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const MobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="text-left">
            <Link href="/studio/dashboard" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <MapPin className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold">Studio Portal</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-8 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Icon className="h-5 w-5" />
                <div>
                  <div>{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <Separator className="my-6" />

        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start px-3 py-2 h-auto font-medium text-primary"
            asChild
          >
            <Link href="/studio/classes/new">
              <Plus className="mr-3 h-4 w-4" />
              Add New Class
            </Link>
          </Button>
          
          <Separator className="my-2" />
          
          {studioMenuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
          <Button
            variant="ghost"
            className="w-full justify-start px-3 py-2 h-auto font-medium text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <MobileNav />
            <Link href="/studio/dashboard" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="hidden font-bold sm:inline-block text-sm">
                  Studio Portal
                </span>
                <span className="hidden sm:inline-block text-xs text-muted-foreground">
                  CaboFitPass
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
            {navigation.slice(0, 4).map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
              <Link href="/studio/classes/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Class
              </Link>
            </Button>

            {/* Studio Status Badge */}
            <Badge variant="default" className="hidden sm:flex">
              <MapPin className="mr-1 h-3 w-3" />
              Active Studio
            </Badge>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
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
                      {profile?.full_name || 'Studio Manager'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <Badge variant="outline" className="w-fit mt-1">
                      {profile?.role === 'staff' ? 'Studio Staff' : 'Studio Owner'}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link href="/studio/classes/new" className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Add New Class</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {studioMenuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem key={item.label} asChild>
                      <Link href={item.href} className="flex items-center">
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`container mx-auto py-6 ${className || ''}`}>
        {children}
      </main>

      {/* Quick Action FAB for Mobile */}
      <div className="fixed bottom-6 right-6 sm:hidden">
        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg" asChild>
          <Link href="/studio/classes/new">
            <Plus className="h-6 w-6" />
            <span className="sr-only">Add new class</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}