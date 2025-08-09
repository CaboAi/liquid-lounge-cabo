/**
 * Database Type Definitions for Cabo Fit Pass
 * Generated from enhanced Supabase schema
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      user_credits: {
        Row: UserCredits
        Insert: UserCreditsInsert
        Update: UserCreditsUpdate
      }
      credit_transactions: {
        Row: CreditTransaction
        Insert: CreditTransactionInsert
        Update: CreditTransactionUpdate
      }
      profile_settings: {
        Row: ProfileSettings
        Insert: ProfileSettingsInsert
        Update: ProfileSettingsUpdate
      }
      gyms: {
        Row: Gym
        Insert: GymInsert
        Update: GymUpdate
      }
      gym_amenities: {
        Row: GymAmenity
        Insert: GymAmenityInsert
        Update: GymAmenityUpdate
      }
      gym_images: {
        Row: GymImage
        Insert: GymImageInsert
        Update: GymImageUpdate
      }
      gym_staff: {
        Row: GymStaff
        Insert: GymStaffInsert
        Update: GymStaffUpdate
      }
      gym_reviews: {
        Row: GymReview
        Insert: GymReviewInsert
        Update: GymReviewUpdate
      }
      gym_operating_hours: {
        Row: GymOperatingHours
        Insert: GymOperatingHoursInsert
        Update: GymOperatingHoursUpdate
      }
      classes: {
        Row: Class
        Insert: ClassInsert
        Update: ClassUpdate
      }
      class_categories: {
        Row: ClassCategory
        Insert: ClassCategoryInsert
        Update: ClassCategoryUpdate
      }
      class_category_assignments: {
        Row: ClassCategoryAssignment
        Insert: ClassCategoryAssignmentInsert
        Update: ClassCategoryAssignmentUpdate
      }
      class_templates: {
        Row: ClassTemplate
        Insert: ClassTemplateInsert
        Update: ClassTemplateUpdate
      }
      class_waitlist: {
        Row: ClassWaitlist
        Insert: ClassWaitlistInsert
        Update: ClassWaitlistUpdate
      }
      class_check_ins: {
        Row: ClassCheckIn
        Insert: ClassCheckInInsert
        Update: ClassCheckInUpdate
      }
      bookings: {
        Row: Booking
        Insert: BookingInsert
        Update: BookingUpdate
      }
      booking_history: {
        Row: BookingHistory
        Insert: BookingHistoryInsert
        Update: BookingHistoryUpdate
      }
      booking_reminders: {
        Row: BookingReminder
        Insert: BookingReminderInsert
        Update: BookingReminderUpdate
      }
      booking_payments: {
        Row: BookingPayment
        Insert: BookingPaymentInsert
        Update: BookingPaymentUpdate
      }
      payments: {
        Row: Payment
        Insert: PaymentInsert
        Update: PaymentUpdate
      }
      plans: {
        Row: Plan
        Insert: PlanInsert
        Update: PlanUpdate
      }
      subscriptions: {
        Row: Subscription
        Insert: SubscriptionInsert
        Update: SubscriptionUpdate
      }
      workouts: {
        Row: Workout
        Insert: WorkoutInsert
        Update: WorkoutUpdate
      }
    }
    Views: {
      // Add any views here in the future
    }
    Functions: {
      get_user_profile: {
        Args: { user_uuid?: string }
        Returns: {
          id: string
          username: string | null
          full_name: string | null
          email: string | null
          avatar_url: string | null
          role: string | null
          monthly_credits: number | null
          status: string | null
        }[]
      }
      get_user_credits: {
        Args: { user_uuid?: string }
        Returns: {
          user_id: string
          current_balance: number
          monthly_allocation: number
          lifetime_earned: number
          lifetime_spent: number
          last_reset_at: string
        }[]
      }
      get_user_booking_history: {
        Args: { user_uuid: string; limit_count?: number }
        Returns: {
          booking_id: string
          class_title: string
          gym_name: string
          class_start: string
          booking_status: string
          credits_used: number
          amount_paid: number
          confirmation_code: string
          created_at: string
        }[]
      }
    }
    Enums: {
      user_status: 'active' | 'suspended' | 'deleted'
      user_role: 'user' | 'admin' | 'staff'
      gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
      gym_status: 'active' | 'inactive' | 'maintenance'
      staff_type: 'owner' | 'manager' | 'instructor' | 'trainer' | 'receptionist' | 'maintenance'
      amenity_type: 'equipment' | 'service' | 'facility' | 'accessibility' | 'comfort'
      image_type: 'logo' | 'hero' | 'gallery' | 'equipment' | 'facility' | 'staff'
      review_status: 'pending' | 'approved' | 'rejected' | 'flagged'
      difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels'
      class_status: 'scheduled' | 'cancelled' | 'completed' | 'in_progress'
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'waitlisted'
      payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
      payment_method: 'credits' | 'stripe' | 'cash' | 'bank_transfer' | 'comp' | 'refund'
      booking_source: 'app' | 'web' | 'staff' | 'phone' | 'walk_in' | 'import'
      cancellation_reason: 'user_request' | 'class_cancelled' | 'no_show' | 'system' | 'admin'
      check_in_method: 'manual' | 'qr_code' | 'nfc' | 'app'
      transaction_type: 'earned' | 'spent' | 'bonus' | 'refund' | 'expired' | 'monthly_reset' | 'admin_adjustment' | 'referral_bonus'
      reference_type: 'booking' | 'subscription' | 'plan' | 'admin' | 'system'
      reminder_type: '24_hours' | '2_hours' | '30_minutes' | 'custom'
      delivery_method: 'email' | 'sms' | 'push' | 'in_app'
      currency: 'USD' | 'MXN' | 'CAD'
      subscription_status: 'pending' | 'active' | 'cancelled' | 'expired' | 'paused'
    }
  }
}

// =====================================================================================
// CORE TYPE DEFINITIONS
// =====================================================================================

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  email: string | null
  avatar_url: string | null
  phone: string | null
  role: Database['public']['Enums']['user_role']
  status: Database['public']['Enums']['user_status']
  monthly_credits: number
  date_of_birth: string | null
  gender: Database['public']['Enums']['gender'] | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  fitness_goals: string[] | null
  medical_conditions: string[] | null
  preferred_class_types: string[] | null
  timezone: string
  locale: string
  marketing_consent: boolean
  waiver_signed: boolean
  waiver_signed_at: string | null
  last_login_at: string | null
  login_count: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface UserCredits {
  id: string
  user_id: string
  current_balance: number
  lifetime_earned: number
  lifetime_spent: number
  monthly_allocation: number
  bonus_credits: number
  expires_at: string | null
  reset_day_of_month: number
  last_reset_at: string
  created_at: string
  updated_at: string
}

export interface CreditTransaction {
  id: string
  user_id: string
  transaction_type: Database['public']['Enums']['transaction_type']
  amount: number
  balance_before: number
  balance_after: number
  description: string
  reference_type: Database['public']['Enums']['reference_type'] | null
  reference_id: string | null
  admin_user_id: string | null
  metadata: Record<string, any>
  created_at: string
}

export interface ProfileSettings {
  id: string
  user_id: string
  notifications_email: boolean
  notifications_sms: boolean
  notifications_push: boolean
  notification_preferences: {
    booking_confirmation: boolean
    class_reminder: boolean
    class_cancellation: boolean
    credit_low_balance: boolean
    monthly_reset: boolean
    promotional: boolean
  }
  privacy_settings: {
    profile_visible: boolean
    workout_stats_visible: boolean
    allow_friend_requests: boolean
  }
  app_preferences: {
    theme: 'light' | 'dark' | 'system'
    language: string
    default_view: string
    show_completed_workouts: boolean
  }
  created_at: string
  updated_at: string
}

export interface Gym {
  id: string
  name: string
  description: string | null
  location: string | null
  phone: string | null
  email: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  logo_url: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state_province: string | null
  postal_code: string | null
  country: string
  latitude: number | null
  longitude: number | null
  timezone: string
  status: Database['public']['Enums']['gym_status']
  verified: boolean
  featured: boolean
  rating: number | null
  total_reviews: number
  capacity: number | null
  parking_available: boolean
  accessibility_features: string[] | null
  operating_hours: Record<string, any>
  contact_person: string | null
  contact_title: string | null
  emergency_contact: string | null
  license_number: string | null
  insurance_expiry: string | null
  created_at: string
  updated_at: string
}

export interface GymAmenity {
  id: string
  gym_id: string
  amenity_type: Database['public']['Enums']['amenity_type']
  name: string
  description: string | null
  icon: string | null
  available: boolean
  additional_cost: boolean
  cost_amount: number | null
  priority: number
  created_at: string
}

export interface GymImage {
  id: string
  gym_id: string
  image_url: string
  image_type: Database['public']['Enums']['image_type']
  alt_text: string | null
  caption: string | null
  display_order: number
  is_primary: boolean
  created_at: string
}

export interface GymStaff {
  id: string
  gym_id: string
  profile_id: string | null
  staff_type: Database['public']['Enums']['staff_type']
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  bio: string | null
  specializations: string[] | null
  certifications: string[] | null
  experience_years: number | null
  hourly_rate: number | null
  avatar_url: string | null
  social_links: Record<string, any>
  availability: Record<string, any>
  active: boolean
  hire_date: string | null
  created_at: string
  updated_at: string
}

export interface GymReview {
  id: string
  gym_id: string
  user_id: string
  rating: number
  title: string | null
  review_text: string | null
  pros: string[] | null
  cons: string[] | null
  would_recommend: boolean | null
  visited_date: string | null
  review_status: Database['public']['Enums']['review_status']
  helpful_votes: number
  reported_count: number
  moderator_notes: string | null
  created_at: string
  updated_at: string
}

export interface GymOperatingHours {
  id: string
  gym_id: string
  day_of_week: number
  open_time: string | null
  close_time: string | null
  is_closed: boolean
  special_hours_note: string | null
  created_at: string
}

export interface Class {
  id: string
  gym_id: string
  instructor_id: string | null
  title: string
  description: string | null
  starts_at: string
  ends_at: string | null
  duration_minutes: number
  difficulty_level: Database['public']['Enums']['difficulty_level']
  class_type: string
  max_capacity: number
  min_capacity: number
  current_bookings: number
  waitlist_count: number
  credit_cost: number
  drop_in_price: number | null
  early_booking_hours: number
  late_cancellation_hours: number
  class_status: Database['public']['Enums']['class_status']
  cancellation_reason: string | null
  special_instructions: string | null
  equipment_needed: string[] | null
  tags: string[] | null
  image_url: string | null
  is_recurring: boolean
  recurring_pattern: Record<string, any> | null
  room_location: string | null
  price: number | null // Legacy field
  capacity: number | null // Legacy field
  created_at: string
  updated_at: string
}

export interface ClassCategory {
  id: string
  name: string
  slug: string
  description: string | null
  color_hex: string | null
  icon: string | null
  parent_category_id: string | null
  display_order: number
  is_active: boolean
  created_at: string
}

export interface ClassCategoryAssignment {
  id: string
  class_id: string
  category_id: string
  created_at: string
}

export interface ClassTemplate {
  id: string
  gym_id: string
  name: string
  description: string | null
  instructor_id: string | null
  duration_minutes: number
  difficulty_level: Database['public']['Enums']['difficulty_level']
  class_type: string
  max_capacity: number
  min_capacity: number
  credit_cost: number
  drop_in_price: number | null
  early_booking_hours: number
  late_cancellation_hours: number
  special_instructions: string | null
  equipment_needed: string[] | null
  tags: string[] | null
  image_url: string | null
  room_location: string | null
  recurring_schedule: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ClassWaitlist {
  id: string
  class_id: string
  user_id: string
  position: number
  auto_book: boolean
  notification_sent: boolean
  expires_at: string | null
  created_at: string
}

export interface ClassCheckIn {
  id: string
  class_id: string
  user_id: string
  booking_id: string | null
  check_in_method: Database['public']['Enums']['check_in_method']
  checked_in_at: string
  checked_in_by: string | null
  late_arrival: boolean
  notes: string | null
}

export interface Booking {
  id: string
  user_id: string
  class_id: string
  booking_status: Database['public']['Enums']['booking_status']
  payment_status: Database['public']['Enums']['payment_status']
  credits_used: number
  amount_paid: number
  currency: Database['public']['Enums']['currency']
  payment_method: Database['public']['Enums']['payment_method'] | null
  stripe_payment_intent_id: string | null
  booking_source: Database['public']['Enums']['booking_source']
  booked_by: string | null
  checked_in: boolean
  check_in_time: string | null
  cancelled_at: string | null
  cancellation_reason: Database['public']['Enums']['cancellation_reason'] | null
  refund_amount: number
  refund_credits: number
  late_cancellation: boolean
  special_requests: string | null
  admin_notes: string | null
  confirmation_code: string | null
  reminded_at: string | null
  type: string | null // Legacy field
  completed_at: string | null // Legacy field
  notes: string | null // Legacy field
  created_at: string
  updated_at: string
}

export interface BookingHistory {
  id: string
  booking_id: string
  previous_status: string | null
  new_status: string | null
  changed_by: string | null
  change_reason: string | null
  change_details: Record<string, any>
  created_at: string
}

export interface BookingReminder {
  id: string
  booking_id: string
  reminder_type: Database['public']['Enums']['reminder_type']
  scheduled_at: string
  sent_at: string | null
  delivery_method: Database['public']['Enums']['delivery_method']
  status: string
  failure_reason: string | null
  created_at: string
}

export interface BookingPayment {
  id: string
  booking_id: string
  payment_type: string
  amount: number
  currency: Database['public']['Enums']['currency']
  credits_amount: number
  payment_method: string
  stripe_payment_intent_id: string | null
  stripe_charge_id: string | null
  payment_status: Database['public']['Enums']['payment_status']
  failure_reason: string | null
  processed_at: string | null
  metadata: Record<string, any>
  created_at: string
}

export interface Payment {
  id: string
  user_id: string
  subscription_id: string | null
  booking_id: string | null
  payment_type: string
  amount: number
  currency: Database['public']['Enums']['currency']
  credits_amount: number
  status: Database['public']['Enums']['payment_status']
  stripe_payment_intent_id: string | null
  payment_method: string | null
  processed_at: string | null
  failure_reason: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Plan {
  id: string
  name: string
  price: number
  duration_days: number | null
  description: string | null
  features: Record<string, any> | null
  is_active: boolean
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: Database['public']['Enums']['subscription_status']
  start_date: string | null
  end_date: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

export interface Workout {
  id: string
  class_id: string
  user_id: string
  duration: number | null
  calories_burned: number | null
  notes: string | null
  completed_at: string
  created_at: string
}

// =====================================================================================
// INSERT TYPES (for creating new records)
// =====================================================================================

export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type UserCreditsInsert = Omit<UserCredits, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type CreditTransactionInsert = Omit<CreditTransaction, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type ProfileSettingsInsert = Omit<ProfileSettings, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type GymInsert = Omit<Gym, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type GymAmenityInsert = Omit<GymAmenity, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type GymImageInsert = Omit<GymImage, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type GymStaffInsert = Omit<GymStaff, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type GymReviewInsert = Omit<GymReview, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type GymOperatingHoursInsert = Omit<GymOperatingHours, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type ClassInsert = Omit<Class, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type ClassCategoryInsert = Omit<ClassCategory, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type ClassCategoryAssignmentInsert = Omit<ClassCategoryAssignment, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type ClassTemplateInsert = Omit<ClassTemplate, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type ClassWaitlistInsert = Omit<ClassWaitlist, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type ClassCheckInInsert = Omit<ClassCheckIn, 'id'> & {
  id?: string
}

export type BookingInsert = Omit<Booking, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type BookingHistoryInsert = Omit<BookingHistory, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type BookingReminderInsert = Omit<BookingReminder, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type BookingPaymentInsert = Omit<BookingPayment, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type PaymentInsert = Omit<Payment, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type PlanInsert = Omit<Plan, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type SubscriptionInsert = Omit<Subscription, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type WorkoutInsert = Omit<Workout, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

// =====================================================================================
// UPDATE TYPES (for updating existing records)
// =====================================================================================

export type ProfileUpdate = Partial<ProfileInsert>
export type UserCreditsUpdate = Partial<UserCreditsInsert>
export type CreditTransactionUpdate = Partial<CreditTransactionInsert>
export type ProfileSettingsUpdate = Partial<ProfileSettingsInsert>
export type GymUpdate = Partial<GymInsert>
export type GymAmenityUpdate = Partial<GymAmenityInsert>
export type GymImageUpdate = Partial<GymImageInsert>
export type GymStaffUpdate = Partial<GymStaffInsert>
export type GymReviewUpdate = Partial<GymReviewInsert>
export type GymOperatingHoursUpdate = Partial<GymOperatingHoursInsert>
export type ClassUpdate = Partial<ClassInsert>
export type ClassCategoryUpdate = Partial<ClassCategoryInsert>
export type ClassCategoryAssignmentUpdate = Partial<ClassCategoryAssignmentInsert>
export type ClassTemplateUpdate = Partial<ClassTemplateInsert>
export type ClassWaitlistUpdate = Partial<ClassWaitlistInsert>
export type ClassCheckInUpdate = Partial<ClassCheckInInsert>
export type BookingUpdate = Partial<BookingInsert>
export type BookingHistoryUpdate = Partial<BookingHistoryInsert>
export type BookingReminderUpdate = Partial<BookingReminderInsert>
export type BookingPaymentUpdate = Partial<BookingPaymentInsert>
export type PaymentUpdate = Partial<PaymentInsert>
export type PlanUpdate = Partial<PlanInsert>
export type SubscriptionUpdate = Partial<SubscriptionInsert>
export type WorkoutUpdate = Partial<WorkoutInsert>

// =====================================================================================
// UTILITY TYPES
// =====================================================================================

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Relationship types for joined queries
export interface ClassWithGym extends Class {
  gym: Gym
  instructor?: GymStaff
}

export interface BookingWithClass extends Booking {
  class: ClassWithGym
}

export interface UserWithCredits extends Profile {
  user_credits: UserCredits
  profile_settings: ProfileSettings
}

export interface GymWithDetails extends Gym {
  amenities: GymAmenity[]
  images: GymImage[]
  operating_hours: GymOperatingHours[]
  staff: GymStaff[]
}

export interface ClassWithCategories extends Class {
  categories: ClassCategory[]
  gym: Gym
  instructor?: GymStaff
}

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  total_pages: number
}

// Search and filter types
export interface ClassFilters {
  gym_id?: string
  category_id?: string
  difficulty_level?: Database['public']['Enums']['difficulty_level']
  date_from?: string
  date_to?: string
  available_spots?: boolean
  instructor_id?: string
  class_type?: string
  tags?: string[]
}

export interface GymFilters {
  city?: string
  featured?: boolean
  verified?: boolean
  amenity_types?: Database['public']['Enums']['amenity_type'][]
  rating_min?: number
  has_availability?: boolean
}

// Form types for UI components
export interface BookingFormData {
  class_id: string
  payment_method: Database['public']['Enums']['payment_method']
  special_requests?: string
  use_credits?: boolean
}

export interface ProfileFormData {
  full_name: string
  email: string
  phone?: string
  date_of_birth?: string
  gender?: Database['public']['Enums']['gender']
  fitness_goals?: string[]
  medical_conditions?: string[]
  emergency_contact_name?: string
  emergency_contact_phone?: string
}

export interface GymReviewFormData {
  rating: number
  title?: string
  review_text?: string
  pros?: string[]
  cons?: string[]
  would_recommend?: boolean
  visited_date?: string
}