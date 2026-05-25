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
      certificate_templates: {
        Row: {
          certificate_type: Database["public"]["Enums"]["certificate_type"]
          created_at: string
          date_x: number
          date_y: number
          event_x: number
          event_y: number
          font_size: number
          id: string
          name_x: number
          name_y: number
          template_path: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          certificate_type: Database["public"]["Enums"]["certificate_type"]
          created_at?: string
          date_x?: number
          date_y?: number
          event_x?: number
          event_y?: number
          font_size?: number
          id?: string
          name_x?: number
          name_y?: number
          template_path: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          certificate_type?: Database["public"]["Enums"]["certificate_type"]
          created_at?: string
          date_x?: number
          date_y?: number
          event_x?: number
          event_y?: number
          font_size?: number
          id?: string
          name_x?: number
          name_y?: number
          template_path?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      certificates_issued: {
        Row: {
          certificate_path: string | null
          certificate_type: Database["public"]["Enums"]["certificate_type"]
          created_at: string
          error_message: string | null
          event_id: string | null
          id: string
          issued_by: string | null
          recipient_email: string
          recipient_name: string
          sent_at: string | null
          status: Database["public"]["Enums"]["certificate_status"]
        }
        Insert: {
          certificate_path?: string | null
          certificate_type: Database["public"]["Enums"]["certificate_type"]
          created_at?: string
          error_message?: string | null
          event_id?: string | null
          id?: string
          issued_by?: string | null
          recipient_email: string
          recipient_name: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["certificate_status"]
        }
        Update: {
          certificate_path?: string | null
          certificate_type?: Database["public"]["Enums"]["certificate_type"]
          created_at?: string
          error_message?: string | null
          event_id?: string | null
          id?: string
          issued_by?: string | null
          recipient_email?: string
          recipient_name?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["certificate_status"]
        }
        Relationships: [
          {
            foreignKeyName: "certificates_issued_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          admin_user_id: string | null
          coordinator_email: string
          coordinator_name: string
          coordinator_phone: string | null
          created_at: string
          description: string
          id: string
          logo_url: string | null
          member_count: number | null
          name: string
          status: Database["public"]["Enums"]["club_status"]
          updated_at: string
        }
        Insert: {
          admin_user_id?: string | null
          coordinator_email: string
          coordinator_name: string
          coordinator_phone?: string | null
          created_at?: string
          description: string
          id?: string
          logo_url?: string | null
          member_count?: number | null
          name: string
          status?: Database["public"]["Enums"]["club_status"]
          updated_at?: string
        }
        Update: {
          admin_user_id?: string | null
          coordinator_email?: string
          coordinator_name?: string
          coordinator_phone?: string | null
          created_at?: string
          description?: string
          id?: string
          logo_url?: string | null
          member_count?: number | null
          name?: string
          status?: Database["public"]["Enums"]["club_status"]
          updated_at?: string
        }
        Relationships: []
      }
      event_photos: {
        Row: {
          caption: string | null
          created_at: string
          event_id: string
          id: string
          photo_url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          event_id: string
          id?: string
          photo_url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          event_id?: string
          id?: string
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_photos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          club_id: string
          created_at: string
          created_by: string | null
          description: string
          event_date: string
          event_time: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          max_participants: number | null
          name: string
          poster_url: string | null
          registration_deadline: string
          report_attendance: number | null
          report_expenses: number | null
          report_feedback_rating: number | null
          report_submitted_at: string | null
          report_summary: string | null
          status: Database["public"]["Enums"]["event_status"]
          updated_at: string
          venue: string
        }
        Insert: {
          club_id: string
          created_at?: string
          created_by?: string | null
          description: string
          event_date: string
          event_time: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          max_participants?: number | null
          name: string
          poster_url?: string | null
          registration_deadline: string
          report_attendance?: number | null
          report_expenses?: number | null
          report_feedback_rating?: number | null
          report_submitted_at?: string | null
          report_summary?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
          venue: string
        }
        Update: {
          club_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          event_date?: string
          event_time?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          max_participants?: number | null
          name?: string
          poster_url?: string | null
          registration_deadline?: string
          report_attendance?: number | null
          report_expenses?: number | null
          report_feedback_rating?: number | null
          report_submitted_at?: string | null
          report_summary?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: Database["public"]["Enums"]["registration_status"]
          student_email: string
          student_id: string
          student_name: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: Database["public"]["Enums"]["registration_status"]
          student_email: string
          student_id: string
          student_name: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: Database["public"]["Enums"]["registration_status"]
          student_email?: string
          student_id?: string
          student_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_event_registration_counts: {
        Args: { _event_ids: string[] }
        Returns: {
          event_id: string
          registration_count: number
        }[]
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "club_admin" | "student"
      certificate_status: "pending" | "generated" | "sent" | "failed"
      certificate_type: "community_service" | "general_proficiency" | "sal_activity"
      club_status: "pending" | "approved" | "rejected"
      event_status:
        | "pending"
        | "approved"
        | "rejected"
        | "upcoming"
        | "ongoing"
        | "completed"
        | "cancelled"
      event_type:
        | "workshop"
        | "fest"
        | "competition"
        | "seminar"
        | "cultural"
        | "sports"
        | "tech"
        | "other"
      registration_status: "confirmed" | "cancelled" | "waitlist" | "attended"
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
    Enums: {
      app_role: ["admin", "club_admin", "student"],
      certificate_status: ["pending", "generated", "sent", "failed"],
      certificate_type: ["community_service", "general_proficiency", "sal_activity"],
      club_status: ["pending", "approved", "rejected"],
      event_status: [
        "pending",
        "approved",
        "rejected",
        "upcoming",
        "ongoing",
        "completed",
        "cancelled",
      ],
      event_type: [
        "workshop",
        "fest",
        "competition",
        "seminar",
        "cultural",
        "sports",
        "tech",
        "other",
      ],
      registration_status: ["confirmed", "cancelled", "waitlist", "attended"],
    },
  },
} as const
