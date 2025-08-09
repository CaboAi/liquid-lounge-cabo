'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search,
  Calendar,
  MapPin,
  CreditCard,
  Users,
  BookOpen,
  Star,
  PlusCircle,
  RefreshCw,
  Filter,
  Compass,
  Heart
} from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ComponentType<any>
  action?: {
    label: string
    href?: string
    onClick?: () => void
    variant?: 'default' | 'outline' | 'secondary'
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  illustration?: React.ReactNode
  suggestions?: string[]
  compact?: boolean
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  secondaryAction,
  illustration,
  suggestions,
  compact = false
}: EmptyStateProps) {
  const containerClass = compact 
    ? "py-8 px-4" 
    : "py-16 px-6"

  return (
    <div className={`text-center ${containerClass}`}>
      {/* Illustration or Icon */}
      <div className="mb-6">
        {illustration || (
          Icon ? (
            <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <Icon className="h-12 w-12 text-muted-foreground" />
            </div>
          ) : (
            <div className="text-6xl mb-4">📭</div>
          )
        )}
      </div>

      {/* Content */}
      <div className={`space-y-4 ${compact ? 'max-w-sm' : 'max-w-md'} mx-auto`}>
        <div>
          <h3 className={`font-semibold ${compact ? 'text-lg' : 'text-xl'} text-foreground`}>
            {title}
          </h3>
          <p className="text-muted-foreground mt-2">
            {description}
          </p>
        </div>

        {/* Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Try:</p>
            <ul className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {action && (
              action.href ? (
                <Link href={action.href}>
                  <Button variant={action.variant || 'default'} className="w-full sm:w-auto">
                    {action.label}
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant={action.variant || 'default'} 
                  onClick={action.onClick}
                  className="w-full sm:w-auto"
                >
                  {action.label}
                </Button>
              )
            )}

            {secondaryAction && (
              secondaryAction.href ? (
                <Link href={secondaryAction.href}>
                  <Button variant="outline" className="w-full sm:w-auto">
                    {secondaryAction.label}
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={secondaryAction.onClick}
                  className="w-full sm:w-auto"
                >
                  {secondaryAction.label}
                </Button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Predefined empty states for common scenarios
export function NoClassesFound({ 
  onClearFilters,
  onBrowseAll
}: { 
  onClearFilters?: () => void
  onBrowseAll?: () => void 
}) {
  return (
    <EmptyState
      title="No classes found"
      description="We couldn't find any classes matching your criteria. Try adjusting your search or filters."
      icon={Search}
      action={{
        label: "Clear Filters",
        onClick: onClearFilters,
        variant: "outline"
      }}
      secondaryAction={onBrowseAll ? {
        label: "Browse All Classes",
        onClick: onBrowseAll
      } : undefined}
      suggestions={[
        "Remove location or date filters",
        "Try searching for different class types",
        "Check classes in nearby areas",
        "Look for classes on different dates"
      ]}
    />
  )
}

export function NoBookingsFound({ isUpcoming = false }: { isUpcoming?: boolean }) {
  return (
    <EmptyState
      title={isUpcoming ? "No upcoming bookings" : "No bookings yet"}
      description={
        isUpcoming 
          ? "You don't have any upcoming class bookings."
          : "You haven't booked any classes yet. Start your fitness journey!"
      }
      icon={Calendar}
      action={{
        label: "Browse Classes",
        href: "/classes"
      }}
      suggestions={[
        "Explore classes in your area",
        "Try different workout types",
        "Book classes in advance for better availability"
      ]}
    />
  )
}

export function NoStudiosFound({ 
  location,
  onExpandSearch 
}: { 
  location?: string
  onExpandSearch?: () => void
}) {
  return (
    <EmptyState
      title="No studios found"
      description={
        location 
          ? `No fitness studios found in ${location}. Try expanding your search area.`
          : "No fitness studios found in your area. Try expanding your search."
      }
      icon={MapPin}
      action={onExpandSearch ? {
        label: "Expand Search Area",
        onClick: onExpandSearch
      } : {
        label: "View All Studios",
        href: "/studios"
      }}
      suggestions={[
        "Try searching in nearby cities",
        "Remove location filters",
        "Check studios with online classes"
      ]}
    />
  )
}

export function NoCreditsFound() {
  return (
    <EmptyState
      title="No credits available"
      description="You don't have any credits to book classes. Purchase credits to start booking!"
      icon={CreditCard}
      action={{
        label: "Buy Credits",
        href: "/credits/purchase"
      }}
      secondaryAction={{
        label: "Learn More",
        href: "/credits/how-it-works"
      }}
    />
  )
}

export function NoFavoritesFound() {
  return (
    <EmptyState
      title="No favorites yet"
      description="You haven't added any classes or studios to your favorites. Start exploring!"
      icon={Heart}
      action={{
        label: "Discover Classes",
        href: "/classes"
      }}
      suggestions={[
        "Browse popular classes",
        "Explore studios near you",
        "Try different workout types"
      ]}
    />
  )
}

export function NoSearchResults({ query }: { query?: string }) {
  return (
    <EmptyState
      title="No results found"
      description={
        query 
          ? `No results found for "${query}". Try different keywords or browse our categories.`
          : "No results found. Try different search terms."
      }
      icon={Search}
      action={{
        label: "Browse Categories",
        href: "/classes"
      }}
      suggestions={[
        "Check spelling of search terms",
        "Try more general keywords",
        "Use different search terms",
        "Browse by category instead"
      ]}
    />
  )
}

export function NoMembersFound() {
  return (
    <EmptyState
      title="No members yet"
      description="Your studio doesn't have any members yet. Start promoting your classes to attract new members!"
      icon={Users}
      action={{
        label: "Promote Studio",
        href: "/studio/promote"
      }}
      secondaryAction={{
        label: "Create Class",
        href: "/studio/classes/new"
      }}
      suggestions={[
        "Add attractive class photos",
        "Offer intro specials",
        "Partner with local businesses",
        "Use social media marketing"
      ]}
    />
  )
}

export function NoAnalyticsData({ 
  period,
  onRefresh 
}: { 
  period?: string
  onRefresh?: () => void
}) {
  return (
    <EmptyState
      title="No data available"
      description={
        period 
          ? `No analytics data available for the selected ${period} period.`
          : "No analytics data available yet. Data will appear once you have bookings."
      }
      icon={BookOpen}
      action={onRefresh ? {
        label: "Refresh Data",
        onClick: onRefresh,
        variant: "outline"
      } : undefined}
      secondaryAction={{
        label: "View All Periods",
        onClick: () => window.location.reload()
      }}
      suggestions={[
        "Try a different time period",
        "Wait for more booking data",
        "Check your studio settings"
      ]}
      compact
    />
  )
}

export function ClassNotFound() {
  return (
    <EmptyState
      title="Class not found"
      description="The class you're looking for doesn't exist or may have been removed."
      icon={Compass}
      action={{
        label: "Browse Classes",
        href: "/classes"
      }}
      secondaryAction={{
        label: "Go Home",
        href: "/"
      }}
    />
  )
}

export function StudioNotFound() {
  return (
    <EmptyState
      title="Studio not found"
      description="The studio you're looking for doesn't exist or may have been removed."
      icon={MapPin}
      action={{
        label: "Browse Studios",
        href: "/studios"
      }}
      secondaryAction={{
        label: "Go Home",
        href: "/"
      }}
    />
  )
}

// Generic loading empty state
export function LoadingEmptyState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
        <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}

// Empty state with custom illustration
export function IllustratedEmptyState({ 
  illustration,
  title,
  description,
  actions
}: {
  illustration: React.ReactNode
  title: string
  description: string
  actions?: React.ReactNode
}) {
  return (
    <div className="text-center py-16 px-6">
      <div className="mb-8">
        {illustration}
      </div>
      <div className="max-w-md mx-auto space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-muted-foreground mt-2">{description}</p>
        </div>
        {actions && (
          <div className="flex justify-center">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}