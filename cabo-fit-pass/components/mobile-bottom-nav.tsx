'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Search, Calendar, Coins, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/classes', label: 'Browse', icon: Search },
  { href: '/bookings', label: 'Bookings', icon: Calendar },
  { href: '/credits', label: 'Credits', icon: Coins },
  { href: '/profile', label: 'Profile', icon: User },
] as const

export function MobileBottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors',
              active ? 'text-cabo-gold' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
