import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MobileBottomNav } from './mobile-bottom-nav'

vi.mock('next/navigation', () => ({
  usePathname: () => '/classes',
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('MobileBottomNav', () => {
  it('renders exactly 4 anchor/link elements', () => {
    render(<MobileBottomNav />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(4)
  })

  it('renders link with href="/classes"', () => {
    render(<MobileBottomNav />)
    expect(screen.getByRole('link', { name: /browse/i })).toBeTruthy()
  })

  it('renders link with href="/bookings"', () => {
    render(<MobileBottomNav />)
    const link = screen.getByRole('link', { name: /bookings/i })
    expect(link.getAttribute('href')).toBe('/bookings')
  })

  it('renders link with href="/credits"', () => {
    render(<MobileBottomNav />)
    const link = screen.getByRole('link', { name: /credits/i })
    expect(link.getAttribute('href')).toBe('/credits')
  })

  it('renders link with href="/profile"', () => {
    render(<MobileBottomNav />)
    const link = screen.getByRole('link', { name: /profile/i })
    expect(link.getAttribute('href')).toBe('/profile')
  })
})
