export type Json = string | number | boolean | null | Json[] | { [key: string]: Json | undefined }

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: { id: string; user_id: string; class_id: string; status: string; credits_charged: number; booked_at: string; cancelled_at: string | null }
        Insert: { id?: string; user_id: string; class_id: string; status?: string; credits_charged: number; booked_at?: string; cancelled_at?: string | null }
        Update: { id?: string; user_id?: string; class_id?: string; status?: string; credits_charged?: number; booked_at?: string; cancelled_at?: string | null }
        Relationships: []
      }
      classes: {
        Row: { id: string; studio_id: string; instructor_id: string | null; title: string; description: string | null; class_type: string; difficulty_level: string; scheduled_at: string; duration_minutes: number; credit_cost: number; max_capacity: number; is_cancelled: boolean; cancellation_window_hours: number; created_at: string }
        Insert: { id?: string; studio_id: string; instructor_id?: string | null; title: string; description?: string | null; class_type: string; difficulty_level?: string; scheduled_at: string; duration_minutes?: number; credit_cost?: number; max_capacity?: number; is_cancelled?: boolean; cancellation_window_hours?: number; created_at?: string }
        Update: { id?: string; studio_id?: string; instructor_id?: string | null; title?: string; description?: string | null; class_type?: string; difficulty_level?: string; scheduled_at?: string; duration_minutes?: number; credit_cost?: number; max_capacity?: number; is_cancelled?: boolean; cancellation_window_hours?: number; created_at?: string }
        Relationships: []
      }
      credit_transactions: {
        Row: { id: string; user_id: string; amount: number; type: string; reference_id: string | null; note: string | null; created_at: string }
        Insert: { id?: string; user_id: string; amount: number; type: string; reference_id?: string | null; note?: string | null; created_at?: string }
        Update: Record<string, never>
        Relationships: []
      }
      instructors: {
        Row: { id: string; studio_id: string; name: string; bio: string | null; avatar_url: string | null; specialties: string[]; created_at: string }
        Insert: { id?: string; studio_id: string; name: string; bio?: string | null; avatar_url?: string | null; specialties?: string[]; created_at?: string }
        Update: { id?: string; studio_id?: string; name?: string; bio?: string | null; avatar_url?: string | null; specialties?: string[]; created_at?: string }
        Relationships: []
      }
      plans: {
        Row: { id: string; name: string; credits: number; price_cents: number; stripe_price_id: string | null; validity_days: number; is_active: boolean; created_at: string }
        Insert: { id?: string; name: string; credits: number; price_cents: number; stripe_price_id?: string | null; validity_days?: number; is_active?: boolean; created_at?: string }
        Update: { id?: string; name?: string; credits?: number; price_cents?: number; stripe_price_id?: string | null; validity_days?: number; is_active?: boolean; created_at?: string }
        Relationships: []
      }
      profiles: {
        Row: { id: string; full_name: string | null; avatar_url: string | null; phone: string | null; locale: string; role: string; credits: number; created_at: string; updated_at: string }
        Insert: { id: string; full_name?: string | null; avatar_url?: string | null; phone?: string | null; locale?: string; role?: string; credits?: number; created_at?: string; updated_at?: string }
        Update: { id?: string; full_name?: string | null; avatar_url?: string | null; phone?: string | null; locale?: string; role?: string; credits?: number; created_at?: string; updated_at?: string }
        Relationships: []
      }
      studios: {
        Row: { id: string; name: string; slug: string; description: string | null; address: string | null; logo_url: string | null; cover_url: string | null; is_active: boolean; owner_id: string | null; created_at: string }
        Insert: { id?: string; name: string; slug: string; description?: string | null; address?: string | null; logo_url?: string | null; cover_url?: string | null; is_active?: boolean; owner_id?: string | null; created_at?: string }
        Update: { id?: string; name?: string; slug?: string; description?: string | null; address?: string | null; logo_url?: string | null; cover_url?: string | null; is_active?: boolean; owner_id?: string | null; created_at?: string }
        Relationships: []
      }
      subscriptions: {
        Row: { id: string; user_id: string; plan_id: string; stripe_subscription_id: string | null; status: string; current_period_start: string; current_period_end: string; credits_remaining: number; rollover_percentage: number; rollover_cap_credits: number; created_at: string }
        Insert: { id?: string; user_id: string; plan_id: string; stripe_subscription_id?: string | null; status?: string; current_period_start: string; current_period_end: string; credits_remaining?: number; rollover_percentage?: number; rollover_cap_credits?: number; created_at?: string }
        Update: { id?: string; user_id?: string; plan_id?: string; stripe_subscription_id?: string | null; status?: string; current_period_start?: string; current_period_end?: string; credits_remaining?: number; rollover_percentage?: number; rollover_cap_credits?: number; created_at?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}