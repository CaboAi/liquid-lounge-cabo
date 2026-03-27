export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      booking_submissions: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone_number: string;
          preferred_therapy: string;
          preferred_date: string;
          preferred_time: string;
          service_location: string;
          additional_info: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          phone_number: string;
          preferred_therapy: string;
          preferred_date: string;
          preferred_time: string;
          service_location: string;
          additional_info?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone_number?: string;
          preferred_therapy?: string;
          preferred_date?: string;
          preferred_time?: string;
          service_location?: string;
          additional_info?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: "admin" | "user";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: "admin" | "user";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: "admin" | "user";
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: "admin" | "user";
    };
    CompositeTypes: Record<string, never>;
  };
}
