export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      athletes: {
        Row: {
          created_at: string
          full_name: string
          id: string
          rfid_tag: string | null
          status: boolean
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          rfid_tag?: string | null
          status?: boolean
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          rfid_tag?: string | null
          status?: boolean
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      consumptions: {
        Row: {
          amount: number
          athlete_id: string
          client_id: string | null
          created_at: string
          id: string
          recorded_by: string
          remarks: string | null
          transaction_date: string
          transaction_time: string
        }
        Insert: {
          amount: number
          athlete_id: string
          client_id?: string | null
          created_at?: string
          id?: string
          recorded_by: string
          remarks?: string | null
          transaction_date?: string
          transaction_time?: string
        }
        Update: {
          amount?: number
          athlete_id?: string
          client_id?: string | null
          created_at?: string
          id?: string
          recorded_by?: string
          remarks?: string | null
          transaction_date?: string
          transaction_time?: string
        }
        Relationships: []
      }
      remark_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          label: string
          sort_order: number
          status: boolean
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          label: string
          sort_order?: number
          status?: boolean
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          label?: string
          sort_order?: number
          status?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          role_id: string
          status: boolean
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          role_id: string
          status?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          role_id?: string
          status?: boolean
        }
        Relationships: []
      }
      role_permissions: {
        Row: { permission: string; role_id: string }
        Insert: { permission: string; role_id: string }
        Update: { permission?: string; role_id?: string }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      athlete_daily_balance: {
        Row: {
          athlete_id: string | null
          consumed_today: number | null
          daily_allowance: number | null
          full_name: string | null
          remaining_today: number | null
          rfid_tag: string | null
          status: boolean | null
          student_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_administrator: { Args: never; Returns: boolean }
      record_consumption: {
        Args: {
          p_amount: number
          p_athlete_id: string
          p_client_id?: string
          p_recorded_by: string
          p_remarks?: string
        }
        Returns: { consumption_id: string; remaining_balance: number }[]
      }
      user_has_permission: { Args: { p_permission: string }; Returns: boolean }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export const DAILY_ALLOWANCE = 200
