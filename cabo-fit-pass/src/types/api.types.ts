/**
 * API response and request types for CaboFitPass
 */

import type { FitnessClass, Gym, Booking, Profile, CreditTransaction } from './database.types'

// Common API response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  statusCode?: number
}

// Paginated response
export interface PaginatedResponse<T = any> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Error response
export interface ApiError {
  error: string
  message: string
  code?: string
  statusCode: number
  details?: Array<{
    field: string
    message: string
  }>
}

// Authentication responses
export interface AuthResponse {
  user: {
    id: string
    email: string
    role: 'user' | 'studio_owner' | 'admin'
  }
  session: {
    access_token: string
    refresh_token: string
    expires_at: number
  }
  profile?: Profile
}

export interface RefreshTokenResponse {
  access_token: string
  expires_at: number
}

// Class-related API types
export interface ClassListResponse {
  classes: Array<FitnessClass & {
    gym?: Gym
    spotsLeft: number
    isWaitlisted: boolean
    userBooking?: Booking
  }>
  totalCount: number
  filters: {
    categories: string[]
    difficulties: string[]
    instructors: string[]
    locations: string[]
  }
}

export interface ClassDetailResponse {
  fitnessClass: FitnessClass & {
    gym?: Gym
  }
  availability: {
    spotsLeft: number
    totalSpots: number
    waitlistCount: number
    isAvailable: boolean
    isWaitlistAvailable: boolean
  }
  userBooking?: Booking
  reviews: Array<{
    id: string
    rating: number
    comment?: string
    created_at: string
    user: {
      full_name: string
    }
  }>
  averageRating: number
}

export interface CreateClassRequest {
  name: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  intensity: 'low' | 'moderate' | 'high' | 'extreme'
  duration: number
  maxParticipants: number
  creditsRequired: number
  instructorName: string
  startTime: string
  location: string
  requirements?: string[]
  equipmentNeeded?: string[]
  tags?: string[]
}

export interface UpdateClassRequest extends Partial<CreateClassRequest> {}

// Booking-related API types
export interface BookingListResponse {
  bookings: Array<Booking & {
    fitness_class?: FitnessClass & {
      gym?: Gym
    }
    canCancel: boolean
    canReschedule: boolean
    canCheckIn: boolean
  }>
  stats: {
    totalBookings: number
    confirmedBookings: number
    cancelledBookings: number
    attendedClasses: number
    noShowCount: number
    creditsSpent: number
    attendanceRate: number
  }
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface BookClassRequest {
  classId: string
  acceptWaitlist?: boolean
  agreeToPolicy: boolean
  emergencyContact?: string
  specialRequirements?: string
}

export interface BookClassResponse {
  success: boolean
  booking: Booking
  fitnessClass: FitnessClass
  isWaitlisted: boolean
  message: string
  creditsSpent: number
}

export interface CancelBookingResponse {
  success: boolean
  booking: Booking
  refundAmount: number
  message: string
}

export interface RescheduleBookingRequest {
  newClassId: string
  reason: string
}

export interface RescheduleBookingResponse {
  success: boolean
  oldBooking: Booking
  newBooking: Booking
  creditDifference: number
  message: string
}

export interface CheckInRequest {
  location?: {
    lat: number
    lng: number
  }
}

// Credit-related API types
export interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  bonus?: number
  popular?: boolean
  description?: string
  validityDays?: number
}

export interface PurchaseCreditsRequest {
  packageId: string
  paymentMethodId: string
  billingAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  savePaymentMethod?: boolean
}

export interface PurchaseCreditsResponse {
  success: boolean
  transaction: CreditTransaction
  newBalance: number
  package: CreditPackage
  paymentIntent?: {
    id: string
    status: string
    client_secret?: string
  }
}

export interface CreditBalanceResponse {
  currentBalance: number
  pendingCredits: number
  expiringCredits: Array<{
    amount: number
    expirationDate: string
    daysUntilExpiration: number
  }>
  recentTransactions: CreditTransaction[]
}

// Studio-related API types
export interface StudioListResponse {
  studios: Array<Gym & {
    distance?: number
    upcomingClasses: number
    averageRating: number
    totalReviews: number
  }>
  totalCount: number
  userLocation?: {
    lat: number
    lng: number
  }
}

export interface StudioDetailResponse {
  studio: Gym
  classes?: FitnessClass[]
  stats?: {
    totalClasses: number
    totalBookings: number
    totalRevenue: number
    averageRating: number
    utilizationRate: number
  }
  staff?: Array<{
    id: string
    role: string
    user: {
      full_name: string
      bio?: string
      profile_image?: string
    }
  }>
  userRole?: {
    role: string
    permissions: string[]
    status: string
  }
  userBookingHistory?: Array<{
    id: string
    status: string
    created_at: string
    fitness_class: {
      name: string
      start_time: string
    }
  }>
  publicMetrics: {
    upcomingClasses: number
    categories: string[]
    averageRating: number
    totalReviews: number
  }
}

export interface CreateStudioRequest {
  name: string
  description: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  website?: string
  latitude?: number
  longitude?: number
  amenities?: string[]
  operatingHours?: Record<string, {
    open: string
    close: string
    closed?: boolean
  }>
}

export interface UpdateStudioRequest extends Partial<CreateStudioRequest> {}

// Analytics API types
export interface StudioAnalyticsResponse {
  metrics: {
    totalClasses: number
    totalBookings: number
    totalRevenue: number
    averageRating: number
    utilizationRate: number
    monthlyGrowth: number
    revenueGrowth: number
  }
  revenueData: Array<{
    date: string
    revenue: number
    bookings: number
    classes: number
  }>
  categoryPerformance: Array<{
    category: string
    bookings: number
    revenue: number
    averageRating: number
    utilizationRate: number
  }>
  memberInsights: {
    totalMembers: number
    newMembersThisMonth: number
    returningMembers: number
    churnRate: number
    averageBookingsPerMember: number
    topMembers: Array<{
      id: string
      name: string
      totalBookings: number
      totalSpent: number
      favoriteCategory: string
    }>
  }
  peakHours: Array<{
    hour: number
    day: string
    bookings: number
    utilization: number
  }>
  topPerformingClasses: Array<{
    id: string
    name: string
    bookings: number
    revenue: number
    rating: number
  }>
}

export interface UserAnalyticsResponse {
  stats: {
    totalBookings: number
    totalCreditsSpent: number
    favoriteCategories: string[]
    favoriteInstructors: string[]
    favoriteStudios: string[]
    attendanceRate: number
    averageClassesPerMonth: number
    totalClassesAttended: number
  }
  activity: Array<{
    date: string
    classesBooked: number
    classesAttended: number
    creditsSpent: number
  }>
  goals: {
    monthlyTarget?: number
    progress: number
    streakDays: number
    achievements: string[]
  }
}

// Search API types
export interface SearchFilters {
  query?: string
  category?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  intensity?: 'low' | 'moderate' | 'high' | 'extreme'
  instructor?: string
  location?: string
  date?: string
  timeOfDay?: 'morning' | 'afternoon' | 'evening'
  minDuration?: number
  maxDuration?: number
  minCredits?: number
  maxCredits?: number
  availability?: 'available' | 'waitlist' | 'all'
  sortBy?: 'time' | 'popularity' | 'credits' | 'rating' | 'distance'
  latitude?: number
  longitude?: number
  radius?: number
  limit?: number
  offset?: number
}

export interface SearchResponse {
  classes: FitnessClass[]
  studios: Gym[]
  totalCount: number
  hasMore: boolean
  suggestions?: string[]
  filters: {
    categories: string[]
    difficulties: string[]
    instructors: string[]
    locations: string[]
  }
}

export interface SearchSuggestionsResponse {
  suggestions: Array<{
    type: 'class' | 'instructor' | 'category' | 'studio'
    value: string
    count?: number
  }>
  popular: string[]
}

// Review API types
export interface CreateReviewRequest {
  classId: string
  rating: number
  comment?: string
  wouldRecommend?: boolean
  instructorRating?: number
  facilityRating?: number
}

export interface ReviewListResponse {
  reviews: Array<{
    id: string
    rating: number
    comment?: string
    created_at: string
    user: {
      full_name: string
      profile_image?: string
    }
    fitness_class?: {
      name: string
      start_time: string
    }
    studio?: {
      name: string
    }
    helpful_votes: number
    user_found_helpful?: boolean
  }>
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

// Notification API types
export interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  classReminders: boolean
  bookingConfirmations: boolean
  cancellationAlerts: boolean
  promotions: boolean
  weeklyDigest: boolean
}

export interface Notification {
  id: string
  type: 'booking_confirmation' | 'class_reminder' | 'cancellation' | 'promotion' | 'system'
  title: string
  message: string
  read: boolean
  created_at: string
  action_url?: string
  metadata?: Record<string, any>
}

export interface NotificationListResponse {
  notifications: Notification[]
  unreadCount: number
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

// Payment API types
export interface PaymentMethod {
  id: string
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay'
  last4?: string
  brand?: string
  exp_month?: number
  exp_year?: number
  is_default: boolean
  created_at: string
}

export interface PaymentMethodListResponse {
  paymentMethods: PaymentMethod[]
  defaultMethod?: PaymentMethod
}

export interface CreatePaymentMethodRequest {
  token: string
  type: 'card' | 'paypal'
  setAsDefault?: boolean
}

// Subscription API types (for future premium features)
export interface Subscription {
  id: string
  status: 'active' | 'canceled' | 'past_due' | 'paused'
  plan: {
    id: string
    name: string
    price: number
    interval: 'month' | 'year'
    features: string[]
  }
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
}

// Admin API types
export interface AdminStatsResponse {
  overview: {
    totalUsers: number
    totalStudios: number
    totalClasses: number
    totalBookings: number
    totalRevenue: number
  }
  growth: {
    userGrowth: number
    studioGrowth: number
    revenueGrowth: number
  }
  topStudios: Array<{
    id: string
    name: string
    bookings: number
    revenue: number
    rating: number
  }>
  recentActivity: Array<{
    type: string
    description: string
    timestamp: string
    user?: string
    studio?: string
  }>
}

// Webhook types (for handling external events)
export interface WebhookEvent {
  id: string
  type: string
  created: number
  data: {
    object: any
  }
  livemode: boolean
}

// File upload types
export interface FileUploadResponse {
  url: string
  filename: string
  size: number
  contentType: string
  uploadedAt: string
}

// Batch operation types
export interface BatchOperationRequest<T = any> {
  operation: 'create' | 'update' | 'delete'
  items: T[]
}

export interface BatchOperationResponse {
  success: boolean
  processed: number
  failed: number
  errors?: Array<{
    index: number
    error: string
  }>
}

// Export/import types
export interface ExportRequest {
  format: 'csv' | 'json' | 'xlsx'
  filters?: Record<string, any>
  columns?: string[]
}

export interface ExportResponse {
  downloadUrl: string
  expiresAt: string
  fileSize: number
  recordCount: number
}