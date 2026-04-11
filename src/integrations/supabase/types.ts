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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_logs: {
        Row: {
          action: string
          created_at: string
          duration_ms: number | null
          full_input: string | null
          full_output: string | null
          id: string
          input_summary: string | null
          module: string | null
          output_summary: string | null
          status: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          duration_ms?: number | null
          full_input?: string | null
          full_output?: string | null
          id?: string
          input_summary?: string | null
          module?: string | null
          output_summary?: string | null
          status?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          duration_ms?: number | null
          full_input?: string | null
          full_output?: string | null
          id?: string
          input_summary?: string | null
          module?: string | null
          output_summary?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          business_name: string
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          industry: string | null
          is_internal: boolean
          location: string | null
          monthly_value: number | null
          phone: string | null
          pipeline_stage: string
          services: Json | null
          session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_name: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          is_internal?: boolean
          location?: string | null
          monthly_value?: number | null
          phone?: string | null
          pipeline_stage?: string
          services?: Json | null
          session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_name?: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          is_internal?: boolean
          location?: string | null
          monthly_value?: number | null
          phone?: string | null
          pipeline_stage?: string
          services?: Json | null
          session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      design_brand_kits: {
        Row: {
          client_id: string | null
          colors: Json | null
          created_at: string
          fonts: Json | null
          id: string
          is_default: boolean | null
          logos: Json | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          colors?: Json | null
          created_at?: string
          fonts?: Json | null
          id?: string
          is_default?: boolean | null
          logos?: Json | null
          name: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          client_id?: string | null
          colors?: Json | null
          created_at?: string
          fonts?: Json | null
          id?: string
          is_default?: boolean | null
          logos?: Json | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      design_projects: {
        Row: {
          brand_kit_id: string | null
          cards: Json | null
          created_at: string
          id: string
          layout: string | null
          name: string
          project_id: string | null
          thumbnail_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_kit_id?: string | null
          cards?: Json | null
          created_at?: string
          id?: string
          layout?: string | null
          name: string
          project_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          brand_kit_id?: string | null
          cards?: Json | null
          created_at?: string
          id?: string
          layout?: string | null
          name?: string
          project_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          api_key_encrypted: string | null
          config: Json | null
          created_at: string
          id: string
          last_tested: string | null
          provider: string
          status: string
          user_id: string
        }
        Insert: {
          api_key_encrypted?: string | null
          config?: Json | null
          created_at?: string
          id?: string
          last_tested?: string | null
          provider: string
          status?: string
          user_id: string
        }
        Update: {
          api_key_encrypted?: string | null
          config?: Json | null
          created_at?: string
          id?: string
          last_tested?: string | null
          provider?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          client_id: string | null
          created_at: string
          due_date: string | null
          id: string
          invoice_number: string
          line_items: Json
          paid_at: string | null
          sent_at: string | null
          status: string
          total: number
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          line_items?: Json
          paid_at?: string | null
          sent_at?: string | null
          status?: string
          total?: number
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          line_items?: Json
          paid_at?: string | null
          sent_at?: string | null
          status?: string
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          business_name: string | null
          client_id: string | null
          created_at: string
          email: string | null
          engagement_action: string | null
          enrichment_data: Json | null
          id: string
          industry: string | null
          name: string | null
          phone: string | null
          score: number | null
          source: string | null
          status: string
          user_id: string
        }
        Insert: {
          business_name?: string | null
          client_id?: string | null
          created_at?: string
          email?: string | null
          engagement_action?: string | null
          enrichment_data?: Json | null
          id?: string
          industry?: string | null
          name?: string | null
          phone?: string | null
          score?: number | null
          source?: string | null
          status?: string
          user_id: string
        }
        Update: {
          business_name?: string | null
          client_id?: string | null
          created_at?: string
          email?: string | null
          engagement_action?: string | null
          enrichment_data?: Json | null
          id?: string
          industry?: string | null
          name?: string | null
          phone?: string | null
          score?: number | null
          source?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_opportunities: {
        Row: {
          assigned_agent: string | null
          client_id: string | null
          created_at: string
          deal_value: number | null
          entered_stage_at: string
          id: string
          notes: string | null
          pipeline: string
          stage: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_agent?: string | null
          client_id?: string | null
          created_at?: string
          deal_value?: number | null
          entered_stage_at?: string
          id?: string
          notes?: string | null
          pipeline: string
          stage: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          assigned_agent?: string | null
          client_id?: string | null
          created_at?: string
          deal_value?: number | null
          entered_stage_at?: string
          id?: string
          notes?: string | null
          pipeline?: string
          stage?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_opportunities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      production_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error: string | null
          id: string
          job_type: string
          output_url: string | null
          provider_job_id: string | null
          script_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          job_type: string
          output_url?: string | null
          provider_job_id?: string | null
          script_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          job_type?: string
          output_url?: string | null
          provider_job_id?: string | null
          script_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_jobs_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_services: {
        Row: {
          activated_at: string
          cancelled_at: string | null
          config: Json | null
          id: string
          project_id: string
          service_type: string
          status: string
        }
        Insert: {
          activated_at?: string
          cancelled_at?: string | null
          config?: Json | null
          id?: string
          project_id: string
          service_type: string
          status?: string
        }
        Update: {
          activated_at?: string
          cancelled_at?: string | null
          config?: Json | null
          id?: string
          project_id?: string
          service_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_services_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_id: string
          created_at: string
          ghl_location_id: string | null
          ghl_subaccount_id: string | null
          id: string
          name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          ghl_location_id?: string | null
          ghl_subaccount_id?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          ghl_location_id?: string | null
          ghl_subaccount_id?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scripts: {
        Row: {
          caption: string | null
          client_id: string | null
          created_at: string
          duration_target: number | null
          follow_up_comment: string | null
          hook_method: string | null
          id: string
          metrics: Json | null
          offer: string | null
          pillar: string | null
          platforms: string[] | null
          published_at: string | null
          scheduled_at: string | null
          script_text: string | null
          status: string
          storyboard: Json | null
          title: string
          trigger_type: string | null
          user_id: string
          vac_type: string | null
        }
        Insert: {
          caption?: string | null
          client_id?: string | null
          created_at?: string
          duration_target?: number | null
          follow_up_comment?: string | null
          hook_method?: string | null
          id?: string
          metrics?: Json | null
          offer?: string | null
          pillar?: string | null
          platforms?: string[] | null
          published_at?: string | null
          scheduled_at?: string | null
          script_text?: string | null
          status?: string
          storyboard?: Json | null
          title: string
          trigger_type?: string | null
          user_id: string
          vac_type?: string | null
        }
        Update: {
          caption?: string | null
          client_id?: string | null
          created_at?: string
          duration_target?: number | null
          follow_up_comment?: string | null
          hook_method?: string | null
          id?: string
          metrics?: Json | null
          offer?: string | null
          pillar?: string | null
          platforms?: string[] | null
          published_at?: string | null
          scheduled_at?: string | null
          script_text?: string | null
          status?: string
          storyboard?: Json | null
          title?: string
          trigger_type?: string | null
          user_id?: string
          vac_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scripts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          agent_task_id: string | null
          assigned_agent: string | null
          category: string
          client_id: string | null
          created_at: string
          description: string | null
          id: string
          priority: string
          project_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_task_id?: string | null
          assigned_agent?: string | null
          category?: string
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          agent_task_id?: string | null
          assigned_agent?: string | null
          category?: string
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          client_id: string | null
          created_at: string
          description: string
          due_date: string | null
          id: string
          is_completed: boolean | null
          module: string | null
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          module?: string | null
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          module?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string | null
          client_id: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          is_recurring: boolean | null
          source: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          client_id?: string | null
          created_at?: string
          date: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          source?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          client_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          source?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
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
          role?: Database["public"]["Enums"]["app_role"]
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
      websites: {
        Row: {
          client_id: string | null
          created_at: string
          deploy_provider: string | null
          deploy_status: string
          deploy_url: string | null
          domain: string | null
          id: string
          last_deployed: string | null
          site_code: string | null
          stitch_design_md: string | null
          template: string | null
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          deploy_provider?: string | null
          deploy_status?: string
          deploy_url?: string | null
          domain?: string | null
          id?: string
          last_deployed?: string | null
          site_code?: string | null
          stitch_design_md?: string | null
          template?: string | null
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          deploy_provider?: string | null
          deploy_status?: string
          deploy_url?: string | null
          domain?: string | null
          id?: string
          last_deployed?: string | null
          site_code?: string | null
          stitch_design_md?: string | null
          template?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "websites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "rep"
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
      app_role: ["admin", "rep"],
    },
  },
} as const
