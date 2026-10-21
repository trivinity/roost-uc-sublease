// Generated from the Supabase project schema (supabase/migrations). Re-generate after changing the database.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      email_allowlist: {
        Row: { created_at: string; email: string; note: string | null };
        Insert: { created_at?: string; email: string; note?: string | null };
        Update: { created_at?: string; email?: string; note?: string | null };
        Relationships: [];
      };
      listings: {
        Row: {
          address: string;
          amenities: string[];
          area: string;
          bedrooms: number;
          confirmed_at: string;
          created_at: string;
          description: string;
          end_date: string;
          fee_split_pct: number;
          furnished: boolean;
          google_place_id: string | null;
          host_detail: string;
          host_name: string;
          household: Json | null;
          id: string;
          is_sample: boolean;
          landlord_consent: boolean;
          lat: number;
          lng: number;
          owner_id: string | null;
          photos: string[];
          property_group: string | null;
          property_reviews: Json | null;
          rent: number;
          start_date: string;
          status: string;
          sublet_fee: number;
          thumbs: string[];
          title: string;
          transfer_type: string;
          unit_type: string;
          utilities_estimate: number;
          utilities_included: boolean;
        };
        Insert: {
          address: string;
          amenities?: string[];
          area?: string;
          bedrooms: number;
          confirmed_at?: string;
          created_at?: string;
          description?: string;
          end_date: string;
          fee_split_pct?: number;
          furnished: boolean;
          google_place_id?: string | null;
          host_detail?: string;
          host_name?: string;
          household?: Json | null;
          id?: string;
          is_sample?: boolean;
          landlord_consent: boolean;
          lat: number;
          lng: number;
          owner_id?: string | null;
          photos?: string[];
          property_group?: string | null;
          property_reviews?: Json | null;
          rent: number;
          start_date: string;
          status?: string;
          sublet_fee?: number;
          thumbs?: string[];
          title: string;
          transfer_type: string;
          unit_type: string;
          utilities_estimate?: number;
          utilities_included: boolean;
        };
        Update: {
          address?: string;
          amenities?: string[];
          area?: string;
          bedrooms?: number;
          confirmed_at?: string;
          created_at?: string;
          description?: string;
          end_date?: string;
          fee_split_pct?: number;
          furnished?: boolean;
          google_place_id?: string | null;
          host_detail?: string;
          host_name?: string;
          household?: Json | null;
          id?: string;
          is_sample?: boolean;
          landlord_consent?: boolean;
          lat?: number;
          lng?: number;
          owner_id?: string | null;
          photos?: string[];
          property_group?: string | null;
          property_reviews?: Json | null;
          rent?: number;
          start_date?: string;
          status?: string;
          sublet_fee?: number;
          thumbs?: string[];
          title?: string;
          transfer_type?: string;
          unit_type?: string;
          utilities_estimate?: number;
          utilities_included?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "listings_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: { body: string; created_at: string; id: number; kind: string; sender_id: string | null; thread_id: string };
        Insert: { body: string; created_at?: string; id?: never; kind?: string; sender_id?: string | null; thread_id: string };
        Update: { body?: string; created_at?: string; id?: never; kind?: string; sender_id?: string | null; thread_id?: string };
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "threads";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: { created_at: string; display_name: string; email: string; id: string; onboarded: boolean; prefs: Json | null; prefs_asked: boolean };
        Insert: { created_at?: string; display_name: string; email: string; id: string; onboarded?: boolean; prefs?: Json | null; prefs_asked?: boolean };
        Update: { created_at?: string; display_name?: string; email?: string; id?: string; onboarded?: boolean; prefs?: Json | null; prefs_asked?: boolean };
        Relationships: [];
      };
      reports: {
        Row: { created_at: string; id: number; listing_id: string; reason: string; reporter_id: string };
        Insert: { created_at?: string; id?: never; listing_id: string; reason: string; reporter_id: string };
        Update: { created_at?: string; id?: never; listing_id?: string; reason?: string; reporter_id?: string };
        Relationships: [
          {
            foreignKeyName: "reports_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      shortlist: {
        Row: { created_at: string; listing_id: string; user_id: string };
        Insert: { created_at?: string; listing_id: string; user_id: string };
        Update: { created_at?: string; listing_id?: string; user_id?: string };
        Relationships: [
          {
            foreignKeyName: "shortlist_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shortlist_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      threads: {
        Row: {
          created_at: string;
          host_id: string | null;
          host_name: string;
          host_read_at: string;
          host_shared: boolean;
          id: string;
          listing_id: string;
          listing_title: string;
          seeker_id: string;
          seeker_name: string;
          seeker_read_at: string;
          seeker_shared: boolean;
        };
        Insert: {
          created_at?: string;
          host_id?: string | null;
          host_name: string;
          host_read_at?: string;
          host_shared?: boolean;
          id?: string;
          listing_id: string;
          listing_title: string;
          seeker_id: string;
          seeker_name: string;
          seeker_read_at?: string;
          seeker_shared?: boolean;
        };
        Update: {
          created_at?: string;
          host_id?: string | null;
          host_name?: string;
          host_read_at?: string;
          host_shared?: boolean;
          id?: string;
          listing_id?: string;
          listing_title?: string;
          seeker_id?: string;
          seeker_name?: string;
          seeker_read_at?: string;
          seeker_shared?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "threads_host_id_fkey";
            columns: ["host_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "threads_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "threads_seeker_id_fkey";
            columns: ["seeker_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      get_contact: { Args: { p_thread: string }; Returns: string };
      mark_thread_read: { Args: { p_thread: string }; Returns: undefined };
      share_contact: { Args: { p_thread: string }; Returns: undefined };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
