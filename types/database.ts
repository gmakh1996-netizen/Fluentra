/**
 * Supabase database types.
 *
 * This file is hand-written for the FOUNDATION tables so the codebase type-checks
 * before the full schema is pushed. Once migrations 0001–0008 are applied, REGENERATE
 * the complete, authoritative version:
 *
 *     npm run db:types        # supabase gen types typescript --linked
 *
 * After that, this hand-written stub is fully replaced and every feature table
 * (lessons, ai_*, vocabulary, etc.) becomes strongly typed automatically.
 */

type Timestamp = string;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          role: Database["public"]["Enums"]["user_role"];
          subscription_tier: Database["public"]["Enums"]["subscription_tier"];
          onboarded: boolean;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: { id: string; display_name?: string | null; avatar_url?: string | null };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      user_settings: {
        Row: {
          user_id: string;
          theme: string;
          locale: string;
          notifications: Record<string, unknown>;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: { user_id: string; theme?: string; locale?: string };
        Update: Partial<Database["public"]["Tables"]["user_settings"]["Row"]>;
        Relationships: [];
      };
      languages: {
        Row: {
          id: string;
          code: string;
          name: string;
          native_name: string;
          flag_emoji: string | null;
          is_active: boolean;
          sort_order: number;
        };
        Insert: { code: string; name: string; native_name: string; flag_emoji?: string | null };
        Update: Partial<Database["public"]["Tables"]["languages"]["Row"]>;
        Relationships: [];
      };
      user_languages: {
        Row: {
          id: string;
          user_id: string;
          native_language_id: string;
          target_language_id: string;
          level: Database["public"]["Enums"]["cefr_level"];
          daily_goal_minutes: number;
          is_active: boolean;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          user_id: string;
          native_language_id: string;
          target_language_id: string;
          level?: Database["public"]["Enums"]["cefr_level"];
          daily_goal_minutes?: number;
        };
        Update: Partial<Database["public"]["Tables"]["user_languages"]["Row"]>;
        Relationships: [];
      };
      usage_limits: {
        Row: {
          user_id: string;
          period_date: string;
          ai_messages_used: number;
          ai_messages_limit: number;
          voice_seconds_used: number;
          voice_seconds_limit: number;
          updated_at: Timestamp;
        };
        Insert: { user_id: string; period_date?: string };
        Update: Partial<Database["public"]["Tables"]["usage_limits"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: { is_admin: { Args: Record<string, never>; Returns: boolean } };
    Enums: {
      user_role: "user" | "admin";
      subscription_tier: "free" | "pro" | "ultimate";
      cefr_level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
    };
  };
};
