export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      async_messages: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          intent: string | null
          is_answered: boolean
          message_text: string
          sender_id: string
          topic: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          intent?: string | null
          is_answered?: boolean
          message_text: string
          sender_id: string
          topic: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          intent?: string | null
          is_answered?: boolean
          message_text?: string
          sender_id?: string
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "async_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_queue: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          intent: string
          matched_session_id: string | null
          role: string | null
          specific: string | null
          status: string
          topic: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          intent: string
          matched_session_id?: string | null
          role?: string | null
          specific?: string | null
          status?: string
          topic: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          intent?: string
          matched_session_id?: string | null
          role?: string | null
          specific?: string | null
          status?: string
          topic?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_queue_matched_session_id_fkey"
            columns: ["matched_session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ban_expires_at: string | null
          created_at: string
          display_name: string | null
          id: string
          report_count: number
          safety_accepted_at: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          ban_expires_at?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          report_count?: number
          safety_accepted_at?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          ban_expires_at?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          report_count?: number
          safety_accepted_at?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reported_user_id: string
          reporter_id: string
          session_id: string | null
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reported_user_id: string
          reporter_id: string
          session_id?: string | null
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_ratings: {
        Row: {
          badge: string | null
          created_at: string
          id: string
          private_note: string | null
          rated_user_id: string
          rater_id: string
          session_id: string
          stars: number | null
        }
        Insert: {
          badge?: string | null
          created_at?: string
          id?: string
          private_note?: string | null
          rated_user_id: string
          rater_id: string
          session_id: string
          stars?: number | null
        }
        Update: {
          badge?: string | null
          created_at?: string
          id?: string
          private_note?: string | null
          rated_user_id?: string
          rater_id?: string
          session_id?: string
          stars?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_ratings_rated_user_id_fkey"
            columns: ["rated_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_ratings_rater_id_fkey"
            columns: ["rater_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_ratings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          flagged_for_review: boolean
          id: string
          intent_a: string | null
          intent_b: string | null
          participant_a: string | null
          participant_b: string | null
          specific: string | null
          started_at: string
          status: string
          topic: string
          user1_id: string | null
          user1_intent: string | null
          user1_role: string | null
          user2_id: string | null
          user2_intent: string | null
          user2_role: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          flagged_for_review?: boolean
          id?: string
          intent_a?: string | null
          intent_b?: string | null
          participant_a?: string | null
          participant_b?: string | null
          specific?: string | null
          started_at?: string
          status?: string
          topic: string
          user1_id?: string | null
          user1_intent?: string | null
          user1_role?: string | null
          user2_id?: string | null
          user2_intent?: string | null
          user2_role?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          flagged_for_review?: boolean
          id?: string
          intent_a?: string | null
          intent_b?: string | null
          participant_a?: string | null
          participant_b?: string | null
          specific?: string | null
          started_at?: string
          status?: string
          topic?: string
          user1_id?: string | null
          user1_intent?: string | null
          user1_role?: string | null
          user2_id?: string | null
          user2_intent?: string | null
          user2_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_participant_a_fkey"
            columns: ["participant_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_participant_b_fkey"
            columns: ["participant_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      async_messages_own: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string | null
          intent: string | null
          is_answered: boolean | null
          message_text: string | null
          sender_id: string | null
          topic: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          intent?: string | null
          is_answered?: boolean | null
          message_text?: string | null
          sender_id?: string | null
          topic?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          intent?: string | null
          is_answered?: boolean | null
          message_text?: string | null
          sender_id?: string | null
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "async_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      async_messages_public: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string | null
          intent: string | null
          message_text: string | null
          topic: string | null
        }
        Relationships: []
      }
      received_rating_feedback_by_topic: {
        Row: {
          avg_stars: number | null
          badge_count: number | null
          calm_count: number | null
          last_rating_at: string | null
          listener_count: number | null
          present_count: number | null
          rating_count: number | null
          supportive_count: number | null
          topic: string | null
        }
        Relationships: []
      }
      received_rating_feedback_recent: {
        Row: {
          badge: string | null
          created_at: string | null
          feedback_id: string | null
          stars: number | null
          topic: string | null
        }
        Relationships: []
      }
      session_ratings_public: {
        Row: {
          avg_stars: number | null
          badge_count: number | null
          calm_count: number | null
          helpful_count: number | null
          kind_count: number | null
          listener_count: number | null
          present_count: number | null
          rated_user_id: string | null
          rating_count: number | null
          supportive_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_ratings_rated_user_id_fkey"
            columns: ["rated_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_safety_guidelines: { Args: never; Returns: string }
      answer_async_message: {
        Args: { p_message_id: string }
        Returns: undefined
      }
      cancel_match_queue: { Args: never; Returns: undefined }
      cleanup_expired_async_messages: { Args: never; Returns: undefined }
      create_matched_session: {
        Args: {
          p_intent_a: string
          p_intent_b: string
          p_participant_a: string
          p_participant_b: string
          p_specific: string
          p_topic: string
        }
        Returns: string
      }
      end_session: {
        Args: { p_duration_seconds: number; p_session_id: string }
        Returns: undefined
      }
      ensure_own_profile: { Args: never; Returns: string }
      find_or_create_match: {
        Args: {
          p_allow_talker_fallback?: boolean
          p_intent: string
          p_role: string
          p_specific: string
          p_topic: string
        }
        Returns: {
          matched: boolean
          other_intent: string
          other_specific: string
          other_user_id: string
          session_id: string
        }[]
      }
      is_session_participant: {
        Args: { input_session_id: string; input_user_id: string }
        Returns: boolean
      }
      submit_session_rating: {
        Args: {
          p_badge?: string
          p_private_note?: string
          p_session_id: string
          p_stars?: number
        }
        Returns: string
      }
      submit_session_report: {
        Args: { p_details?: string; p_reason: string; p_session_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
