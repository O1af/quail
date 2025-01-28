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
      full_count: {
        Row: {
          april_2025: number | null
          august_2025: number | null
          december_2025: number | null
          february_2025: number | null
          id: string
          january_2025: number | null
          july_2025: number | null
          june_2025: number | null
          march_2025: number | null
          may_2025: number | null
          november_2025: number | null
          october_2025: number | null
          september_2025: number | null
        }
        Insert: {
          april_2025?: number | null
          august_2025?: number | null
          december_2025?: number | null
          february_2025?: number | null
          id: string
          january_2025?: number | null
          july_2025?: number | null
          june_2025?: number | null
          march_2025?: number | null
          may_2025?: number | null
          november_2025?: number | null
          october_2025?: number | null
          september_2025?: number | null
        }
        Update: {
          april_2025?: number | null
          august_2025?: number | null
          december_2025?: number | null
          february_2025?: number | null
          id?: string
          january_2025?: number | null
          july_2025?: number | null
          june_2025?: number | null
          march_2025?: number | null
          may_2025?: number | null
          november_2025?: number | null
          october_2025?: number | null
          september_2025?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "full_count_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      full_tokens: {
        Row: {
          april_2025: number | null
          august_2025: number | null
          december_2025: number | null
          february_2025: number | null
          id: string
          january_2025: number | null
          july_2025: number | null
          june_2025: number | null
          march_2025: number | null
          may_2025: number | null
          november_2025: number | null
          october_2025: number | null
          september_2025: number | null
        }
        Insert: {
          april_2025?: number | null
          august_2025?: number | null
          december_2025?: number | null
          february_2025?: number | null
          id: string
          january_2025?: number | null
          july_2025?: number | null
          june_2025?: number | null
          march_2025?: number | null
          may_2025?: number | null
          november_2025?: number | null
          october_2025?: number | null
          september_2025?: number | null
        }
        Update: {
          april_2025?: number | null
          august_2025?: number | null
          december_2025?: number | null
          february_2025?: number | null
          id?: string
          january_2025?: number | null
          july_2025?: number | null
          june_2025?: number | null
          march_2025?: number | null
          may_2025?: number | null
          november_2025?: number | null
          october_2025?: number | null
          september_2025?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "full_tokens_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mini_count: {
        Row: {
          april_2025: number | null
          august_2025: number | null
          december_2025: number | null
          february_2025: number | null
          id: string
          january_2025: number | null
          july_2025: number | null
          june_2025: number | null
          march_2025: number | null
          may_2025: number | null
          november_2025: number | null
          october_2025: number | null
          september_2025: number | null
        }
        Insert: {
          april_2025?: number | null
          august_2025?: number | null
          december_2025?: number | null
          february_2025?: number | null
          id: string
          january_2025?: number | null
          july_2025?: number | null
          june_2025?: number | null
          march_2025?: number | null
          may_2025?: number | null
          november_2025?: number | null
          october_2025?: number | null
          september_2025?: number | null
        }
        Update: {
          april_2025?: number | null
          august_2025?: number | null
          december_2025?: number | null
          february_2025?: number | null
          id?: string
          january_2025?: number | null
          july_2025?: number | null
          june_2025?: number | null
          march_2025?: number | null
          may_2025?: number | null
          november_2025?: number | null
          october_2025?: number | null
          september_2025?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mini_count_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mini_tokens: {
        Row: {
          april_2025: number | null
          august_2025: number | null
          december_2025: number | null
          february_2025: number | null
          id: string
          january_2025: number | null
          july_2025: number | null
          june_2025: number | null
          march_2025: number | null
          may_2025: number | null
          november_2025: number | null
          october_2025: number | null
          september_2025: number | null
        }
        Insert: {
          april_2025?: number | null
          august_2025?: number | null
          december_2025?: number | null
          february_2025?: number | null
          id: string
          january_2025?: number | null
          july_2025?: number | null
          june_2025?: number | null
          march_2025?: number | null
          may_2025?: number | null
          november_2025?: number | null
          october_2025?: number | null
          september_2025?: number | null
        }
        Update: {
          april_2025?: number | null
          august_2025?: number | null
          december_2025?: number | null
          february_2025?: number | null
          id?: string
          january_2025?: number | null
          july_2025?: number | null
          june_2025?: number | null
          march_2025?: number | null
          may_2025?: number | null
          november_2025?: number | null
          october_2025?: number | null
          september_2025?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mini_tokens_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          customer_id: string | null
          email: string | null
          end_at: string | null
          full_name: string | null
          id: string
          inCancellationPeriod: boolean | null
          subscription_id: string | null
          tier: string
        }
        Insert: {
          avatar_url?: string | null
          customer_id?: string | null
          email?: string | null
          end_at?: string | null
          full_name?: string | null
          id: string
          inCancellationPeriod?: boolean | null
          subscription_id?: string | null
          tier?: string
        }
        Update: {
          avatar_url?: string | null
          customer_id?: string | null
          email?: string | null
          end_at?: string | null
          full_name?: string | null
          id?: string
          inCancellationPeriod?: boolean | null
          subscription_id?: string | null
          tier?: string
        }
        Relationships: []
      }
      sql_usage: {
        Row: {
          april_2025: number | null
          august_2025: number | null
          december_2025: number | null
          february_2025: number | null
          id: string
          january_2025: number | null
          july_2025: number | null
          june_2025: number | null
          march_2025: number | null
          may_2025: number | null
          november_2025: number | null
          october_2025: number | null
          september_2025: number | null
        }
        Insert: {
          april_2025?: number | null
          august_2025?: number | null
          december_2025?: number | null
          february_2025?: number | null
          id: string
          january_2025?: number | null
          july_2025?: number | null
          june_2025?: number | null
          march_2025?: number | null
          may_2025?: number | null
          november_2025?: number | null
          october_2025?: number | null
          september_2025?: number | null
        }
        Update: {
          april_2025?: number | null
          august_2025?: number | null
          december_2025?: number | null
          february_2025?: number | null
          id?: string
          january_2025?: number | null
          july_2025?: number | null
          june_2025?: number | null
          march_2025?: number | null
          may_2025?: number | null
          november_2025?: number | null
          october_2025?: number | null
          september_2025?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sql_usage_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_column: {
        Args: {
          p_user_id: string
          p_column_name: string
        }
        Returns: undefined
      }
      increment_full_count: {
        Args: {
          p_user_id: string
          p_column_name: string
        }
        Returns: undefined
      }
      increment_full_tokens: {
        Args: {
          p_user_id: string
          p_column_name: string
          p_increment_value: number
        }
        Returns: undefined
      }
      increment_mini_count: {
        Args: {
          p_user_id: string
          p_column_name: string
        }
        Returns: undefined
      }
      increment_mini_tokens: {
        Args: {
          p_user_id: string
          p_column_name: string
          p_increment_value: number
        }
        Returns: undefined
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
