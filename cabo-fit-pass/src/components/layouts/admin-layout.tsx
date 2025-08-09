'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BarChart3,
  Users,
  Home,
  Settings,
  LogOut,
  Menu,
  Bell,
  Shield,
  Database,
  CreditCard,
  MapPin,
  AlertTriangle,
  UserCheck,
  FileText,
  TrendingUp
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

interface AdminLayoutProps {
  children: ReactNode
  className?: string
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: Home,
    description: 'System overview and key metrics'
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'Manage user accounts and profiles'
  },
  {
    name: 'Studios',
    href: '/admin/studios',
    icon: MapPin,
    description: 'Studio management and approval'
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Platform analytics and insights'
  },
  {
    name: 'Revenue',
    href: '/admin/revenue',
    icon: TrendingUp,
    description: 'Financial reports and revenue tracking'
  },
  {
    name: 'Credits',
    href: '/admin/credits',
    icon: CreditCard,
    description: 'Credit system management'
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: FileText,
    description: 'Generate system reports'
  },
  {
    name: 'System',
    href: '/admin/system',
    icon: Database,
    description: 'System health and maintenance'
  },
  {
    name: 'Security',
    href: '/admin/security',
    icon: Shield,
    description: 'Security settings and audit logs'
  }
]

const adminMenuItems = [
  { label: 'Profile', href: '/admin/profile', icon: UserCheck },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Audit Logs', href: '/admin/audit', icon: Shield },
  { label: 'System Health', href: '/admin/health', icon: AlertTriangle },
]

export function AdminLayout({ children, className }: AdminLayoutProps) {
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
    .toUpperCase() || 'A'

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
            <Link href="/admin/dashboard" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
                <Shield className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold">Admin Portal</span>
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
          {adminMenuItems.map((item) => {
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
            <Link href="/admin/dashboard" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
                <Shield className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="hidden font-bold sm:inline-block text-sm">
                  Admin Portal
                </span>
                <span className="hidden sm:inline-block text-xs text-muted-foreground">
                  CaboFitPass System
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

          {/* Admin Actions */}
          <div className="flex items-center space-x-4">
            {/* System Status */}
            <Badge variant="default" className="hidden sm:flex bg-green-100 text-green-800 border-green-200">
              <div className="mr-1 h-2 w-2 rounded-full bg-green-500"></div>
              System Healthy
            </Badge>

            {/* Admin Badge */}
            <Badge variant="destructive" className="hidden sm:flex">
              <Shield className="mr-1 h-3 w-3" />
              Admin
            </Badge>

            {/* Critical Alerts */}
            <Button variant="ghost" size="icon" className="hidden sm:flex relative">
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                !
              </div>
              <span className="sr-only">Critical alerts</span>
            </Button>

            {/* Admin User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full border-2 border-red-200">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-red-50 text-red-600">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.full_name || 'System Administrator'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <Badge variant="destructive" className="w-fit mt-1">
                      <Shield className="mr-1 h-3 w-3" />
                      Super Admin
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link href="/admin/system" className="flex items-center">
                    <Database className="mr-2 h-4 w-4" />
                    <span>System Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link href="/admin/security" className="flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Security Center</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {adminMenuItems.map((item) => {
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
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Warning Banner for Admin */}
      <div className="bg-red-50 border-b border-red-200">
        <div className="container py-2">
          <div className="flex items-center space-x-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-red-800">
              <strong>Administrator Mode:</strong> You have full system access. Please use these tools responsibly.
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={`container mx-auto py-6 ${className || ''}`}>
        {children}
      </main>
    </div>
  )
}