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
      api_keys: {
        Row: {
          api_key: string
          company_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          key_name: string
          last_used_at: string | null
          rate_limit: number | null
          scopes: string[] | null
          user_id: string
        }
        Insert: {
          api_key: string
          company_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name: string
          last_used_at?: string | null
          rate_limit?: number | null
          scopes?: string[] | null
          user_id: string
        }
        Update: {
          api_key?: string
          company_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name?: string
          last_used_at?: string | null
          rate_limit?: number | null
          scopes?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      api_usage_logs: {
        Row: {
          api_key_id: string
          created_at: string | null
          endpoint: string
          id: string
          ip_address: unknown | null
          method: string
          response_time_ms: number | null
          status_code: number
          user_agent: string | null
        }
        Insert: {
          api_key_id: string
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: unknown | null
          method: string
          response_time_ms?: number | null
          status_code: number
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: unknown | null
          method?: string
          response_time_ms?: number | null
          status_code?: number
          user_agent?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_branch: string | null
          bank_ifsc_code: string | null
          bank_name: string | null
          city: string | null
          contact_number: string | null
          created_at: string | null
          email_id: string | null
          gstin: string | null
          id: string
          logo: string | null
          name: string
          pan: string | null
          pincode: string | null
          registered_address_line1: string | null
          registered_address_line2: string | null
          registered_city: string | null
          registered_pincode: string | null
          registered_state: string | null
          state: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_branch?: string | null
          bank_ifsc_code?: string | null
          bank_name?: string | null
          city?: string | null
          contact_number?: string | null
          created_at?: string | null
          email_id?: string | null
          gstin?: string | null
          id?: string
          logo?: string | null
          name: string
          pan?: string | null
          pincode?: string | null
          registered_address_line1?: string | null
          registered_address_line2?: string | null
          registered_city?: string | null
          registered_pincode?: string | null
          registered_state?: string | null
          state?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_branch?: string | null
          bank_ifsc_code?: string | null
          bank_name?: string | null
          city?: string | null
          contact_number?: string | null
          created_at?: string | null
          email_id?: string | null
          gstin?: string | null
          id?: string
          logo?: string | null
          name?: string
          pan?: string | null
          pincode?: string | null
          registered_address_line1?: string | null
          registered_address_line2?: string | null
          registered_city?: string | null
          registered_pincode?: string | null
          registered_state?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          company_id: string
          created_at: string | null
          credit_note_counter: number | null
          current_financial_year: string
          default_template: string | null
          id: string
          invoice_counter: number | null
          invoice_prefix: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          credit_note_counter?: number | null
          current_financial_year?: string
          default_template?: string | null
          id?: string
          invoice_counter?: number | null
          invoice_prefix?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          credit_note_counter?: number | null
          current_financial_year?: string
          default_template?: string | null
          id?: string
          invoice_counter?: number | null
          invoice_prefix?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      counters: {
        Row: {
          counter: number
          created_at: string | null
          key: string
          updated_at: string | null
        }
        Insert: {
          counter: number
          created_at?: string | null
          key: string
          updated_at?: string | null
        }
        Update: {
          counter?: number
          created_at?: string | null
          key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_note_items: {
        Row: {
          created_at: string | null
          credit_note_id: string
          gst_rate: number
          hsn_code: string | null
          id: string
          invoice_item_id: string
          price: number
          product_id: string | null
          product_name: string
          quantity: number
          unit: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credit_note_id: string
          gst_rate: number
          hsn_code?: string | null
          id?: string
          invoice_item_id: string
          price: number
          product_id?: string | null
          product_name: string
          quantity: number
          unit: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credit_note_id?: string
          gst_rate?: number
          hsn_code?: string | null
          id?: string
          invoice_item_id?: string
          price?: number
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_note_items_credit_note_id_fkey"
            columns: ["credit_note_id"]
            isOneToOne: false
            referencedRelation: "credit_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_note_items_invoice_item_id_fkey"
            columns: ["invoice_item_id"]
            isOneToOne: false
            referencedRelation: "invoice_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_note_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_notes: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cgst: number | null
          company_id: string
          created_at: string | null
          credit_note_date: string
          credit_note_number: string
          financial_year: string
          id: string
          igst: number | null
          invoice_id: string
          reason: string | null
          sgst: number | null
          status: string
          subtotal: number
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cgst?: number | null
          company_id: string
          created_at?: string | null
          credit_note_date: string
          credit_note_number: string
          financial_year: string
          id?: string
          igst?: number | null
          invoice_id: string
          reason?: string | null
          sgst?: number | null
          status?: string
          subtotal: number
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cgst?: number | null
          company_id?: string
          created_at?: string | null
          credit_note_date?: string
          credit_note_number?: string
          financial_year?: string
          id?: string
          igst?: number | null
          invoice_id?: string
          reason?: string | null
          sgst?: number | null
          status?: string
          subtotal?: number
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          billing_address_line1: string | null
          billing_address_line2: string | null
          billing_city: string | null
          billing_pincode: string | null
          billing_state: string | null
          category: string | null
          created_at: string | null
          email: string | null
          gstin: string | null
          id: string
          name: string
          phone: string | null
          shipping_address_line1: string | null
          shipping_address_line2: string | null
          shipping_city: string | null
          shipping_pincode: string | null
          shipping_state: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_pincode?: string | null
          billing_state?: string | null
          category?: string | null
          created_at?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          name: string
          phone?: string | null
          shipping_address_line1?: string | null
          shipping_address_line2?: string | null
          shipping_city?: string | null
          shipping_pincode?: string | null
          shipping_state?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_pincode?: string | null
          billing_state?: string | null
          category?: string | null
          created_at?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          name?: string
          phone?: string | null
          shipping_address_line1?: string | null
          shipping_address_line2?: string | null
          shipping_city?: string | null
          shipping_pincode?: string | null
          shipping_state?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string | null
          description: string | null
          discount_rate: number | null
          gst_rate: number
          hsn_code: string | null
          id: string
          invoice_id: string
          price: number
          product_id: string | null
          product_name: string
          quantity: number
          unit: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_rate?: number | null
          gst_rate: number
          hsn_code?: string | null
          id?: string
          invoice_id: string
          price: number
          product_id?: string | null
          product_name: string
          quantity: number
          unit: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_rate?: number | null
          gst_rate?: number
          hsn_code?: string | null
          id?: string
          invoice_id?: string
          price?: number
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cgst: number | null
          company_id: string
          created_at: string | null
          customer_id: string
          due_date: string | null
          financial_year: string
          id: string
          igst: number | null
          invoice_date: string
          invoice_number: string
          invoice_prefix: string | null
          notes: string | null
          sgst: number | null
          status: string
          subtotal: number
          template: string | null
          terms_and_conditions: string | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cgst?: number | null
          company_id: string
          created_at?: string | null
          customer_id: string
          due_date?: string | null
          financial_year?: string
          id?: string
          igst?: number | null
          invoice_date: string
          invoice_number: string
          invoice_prefix?: string | null
          notes?: string | null
          sgst?: number | null
          status: string
          subtotal: number
          template?: string | null
          terms_and_conditions?: string | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cgst?: number | null
          company_id?: string
          created_at?: string | null
          customer_id?: string
          due_date?: string | null
          financial_year?: string
          id?: string
          igst?: number | null
          invoice_date?: string
          invoice_number?: string
          invoice_prefix?: string | null
          notes?: string | null
          sgst?: number | null
          status?: string
          subtotal?: number
          template?: string | null
          terms_and_conditions?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: string
          payment_id: string | null
          payment_method: string | null
          status: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          status: string
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          status?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          gst_rate: number
          hsn_code: string | null
          id: string
          name: string
          price: number
          unit: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          gst_rate: number
          hsn_code?: string | null
          id?: string
          name: string
          price: number
          unit: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          gst_rate?: number
          hsn_code?: string | null
          id?: string
          name?: string
          price?: number
          unit?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          active: boolean
          billing_cycle: string | null
          created_at: string | null
          discount_percent: number | null
          end_date: string | null
          id: string
          last_payment_date: string | null
          next_billing_date: string | null
          payment_id: string | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          razorpay_customer_id: string | null
          razorpay_subscription_id: string | null
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean
          billing_cycle?: string | null
          created_at?: string | null
          discount_percent?: number | null
          end_date?: string | null
          id?: string
          last_payment_date?: string | null
          next_billing_date?: string | null
          payment_id?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          start_date?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean
          billing_cycle?: string | null
          created_at?: string | null
          discount_percent?: number | null
          end_date?: string | null
          id?: string
          last_payment_date?: string | null
          next_billing_date?: string | null
          payment_id?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          company_id: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          company_id: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by: string
          role: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          company_id?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_usage: {
        Row: {
          company_id: string
          created_at: string | null
          credit_notes_count: number | null
          customers_count: number | null
          id: string
          invoices_count: number | null
          month_year: string
          products_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          credit_notes_count?: number | null
          customers_count?: number | null
          id?: string
          invoices_count?: number | null
          month_year: string
          products_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          credit_notes_count?: number | null
          customers_count?: number | null
          id?: string
          invoices_count?: number | null
          month_year?: string
          products_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_usage_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_perform_action: {
        Args: { p_user_id: string; p_company_id: string; p_action_type: string }
        Returns: boolean
      }
      get_current_financial_year: {
        Args: { input_date?: string }
        Returns: string
      }
      get_next_credit_note_number: {
        Args: {
          p_company_id: string
          p_financial_year: string
          p_prefix?: string
        }
        Returns: string
      }
      get_next_invoice_number: {
        Args: {
          p_company_id: string
          p_financial_year: string
          p_prefix?: string
        }
        Returns: string
      }
      get_subscription_limits: {
        Args: { plan_type: Database["public"]["Enums"]["subscription_plan"] }
        Returns: Json
      }
      increment_usage: {
        Args: { p_user_id: string; p_company_id: string; p_action_type: string }
        Returns: undefined
      }
      initialize_user_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      subscription_plan: "freemium" | "premium" | "starter" | "professional"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      subscription_plan: ["freemium", "premium", "starter", "professional"],
    },
  },
} as const
