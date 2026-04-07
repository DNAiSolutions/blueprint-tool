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
      agent_tasks: {
        Row: {
          id: string
          agent_id: string
          task_type: string
          priority: string
          status: string
          client_id: string | null
          input_payload: Json | null
          output_payload: Json | null
          parent_task_id: string | null
          error_count: number
          last_error: string | null
          escalated_at: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          task_type: string
          priority?: string
          status?: string
          client_id?: string | null
          input_payload?: Json | null
          output_payload?: Json | null
          parent_task_id?: string | null
          error_count?: number
          last_error?: string | null
          escalated_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          task_type?: string
          priority?: string
          status?: string
          client_id?: string | null
          input_payload?: Json | null
          output_payload?: Json | null
          parent_task_id?: string | null
          error_count?: number
          last_error?: string | null
          escalated_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "agent_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      agreements: {
        Row: {
          id: string
          client_id: string | null
          type: string
          content_md: string | null
          pdf_url: string | null
          status: string
          ghl_document_id: string | null
          sent_at: string | null
          signed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          type: string
          content_md?: string | null
          pdf_url?: string | null
          status?: string
          ghl_document_id?: string | null
          sent_at?: string | null
          signed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          type?: string
          content_md?: string | null
          pdf_url?: string | null
          status?: string
          ghl_document_id?: string | null
          sent_at?: string | null
          signed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agreements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
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
      client_health_scores: {
        Row: {
          id: string
          client_id: string
          content_performance: number
          engagement_score: number
          payment_score: number
          portal_activity: number
          composite_score: number
          upsell_triggered: boolean
          computed_at: string
        }
        Insert: {
          id?: string
          client_id: string
          content_performance?: number
          engagement_score?: number
          payment_score?: number
          portal_activity?: number
          composite_score?: number
          upsell_triggered?: boolean
          computed_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          content_performance?: number
          engagement_score?: number
          payment_score?: number
          portal_activity?: number
          composite_score?: number
          upsell_triggered?: boolean
          computed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_health_scores_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_social_channels: {
        Row: {
          id: string
          client_id: string | null
          platform: string
          handle: string | null
          connected: boolean
          ghl_connected: boolean
          included_in_package: boolean
          created_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          platform: string
          handle?: string | null
          connected?: boolean
          ghl_connected?: boolean
          included_in_package?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          platform?: string
          handle?: string | null
          connected?: boolean
          ghl_connected?: boolean
          included_in_package?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_social_channels_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          auth_user_id: string | null
          brand_kit: Json | null
          business_name: string
          clone_photo_url: string | null
          clone_recording_url: string | null
          contact_name: string | null
          content_approval_mode: string | null
          created_at: string
          email: string | null
          ghl_contact_id: string | null
          ghl_location_id: string | null
          id: string
          industry: string | null
          is_internal: boolean
          location: string | null
          monthly_value: number | null
          offboarded_at: string | null
          onboarding_status: string | null
          package_tier: string | null
          phone: string | null
          pipeline_stage: string
          portal_activated_at: string | null
          services: Json | null
          session_id: string | null
          social_channels: Json | null
          status: string | null
          subdomain: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_user_id?: string | null
          brand_kit?: Json | null
          business_name: string
          clone_photo_url?: string | null
          clone_recording_url?: string | null
          contact_name?: string | null
          content_approval_mode?: string | null
          created_at?: string
          email?: string | null
          ghl_contact_id?: string | null
          ghl_location_id?: string | null
          id?: string
          industry?: string | null
          is_internal?: boolean
          location?: string | null
          monthly_value?: number | null
          offboarded_at?: string | null
          onboarding_status?: string | null
          package_tier?: string | null
          phone?: string | null
          pipeline_stage?: string
          portal_activated_at?: string | null
          services?: Json | null
          session_id?: string | null
          social_channels?: Json | null
          status?: string | null
          subdomain?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_user_id?: string | null
          brand_kit?: Json | null
          business_name?: string
          clone_photo_url?: string | null
          clone_recording_url?: string | null
          contact_name?: string | null
          content_approval_mode?: string | null
          created_at?: string
          email?: string | null
          ghl_contact_id?: string | null
          ghl_location_id?: string | null
          id?: string
          industry?: string | null
          is_internal?: boolean
          location?: string | null
          monthly_value?: number | null
          offboarded_at?: string | null
          onboarding_status?: string | null
          package_tier?: string | null
          phone?: string | null
          pipeline_stage?: string
          portal_activated_at?: string | null
          services?: Json | null
          session_id?: string | null
          social_channels?: Json | null
          status?: string | null
          subdomain?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_approvals: {
        Row: {
          id: string
          script_id: string | null
          client_id: string | null
          status: string
          revision_number: number
          revision_notes: string | null
          auto_approve_at: string | null
          submitted_at: string | null
          responded_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          script_id?: string | null
          client_id?: string | null
          status?: string
          revision_number?: number
          revision_notes?: string | null
          auto_approve_at?: string | null
          submitted_at?: string | null
          responded_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          script_id?: string | null
          client_id?: string | null
          status?: string
          revision_number?: number
          revision_notes?: string | null
          auto_approve_at?: string | null
          submitted_at?: string | null
          responded_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_approvals_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_approvals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      content_plans: {
        Row: {
          id: string
          client_id: string | null
          plan_type: string
          pillars: Json | null
          weekly_cadence: Json | null
          posting_schedule: Json | null
          start_date: string | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          plan_type: string
          pillars?: Json | null
          weekly_cadence?: Json | null
          posting_schedule?: Json | null
          start_date?: string | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          plan_type?: string
          pillars?: Json | null
          weekly_cadence?: Json | null
          posting_schedule?: Json | null
          start_date?: string | null
          status?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_ledger: {
        Row: {
          id: string
          client_id: string | null
          agent_task_id: string | null
          provider: string
          api_action: string
          cost_usd: number
          tokens_used: number | null
          duration_seconds: number | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          agent_task_id?: string | null
          provider: string
          api_action: string
          cost_usd?: number
          tokens_used?: number | null
          duration_seconds?: number | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          agent_task_id?: string | null
          provider?: string
          api_action?: string
          cost_usd?: number
          tokens_used?: number | null
          duration_seconds?: number | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_ledger_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_ledger_agent_task_id_fkey"
            columns: ["agent_task_id"]
            isOneToOne: false
            referencedRelation: "agent_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      cron_registry: {
        Row: {
          id: string
          name: string
          cron_expression: string
          agent_id: string
          prompt: string
          status: string | null
          last_run: string | null
          next_run: string | null
          run_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          cron_expression: string
          agent_id: string
          prompt: string
          status?: string | null
          last_run?: string | null
          next_run?: string | null
          run_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          cron_expression?: string
          agent_id?: string
          prompt?: string
          status?: string | null
          last_run?: string | null
          next_run?: string | null
          run_count?: number
          created_at?: string
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
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          channel: string | null
          read: boolean
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body?: string | null
          channel?: string | null
          read?: boolean
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          body?: string | null
          channel?: string | null
          read?: boolean
          metadata?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      pipeline_opportunities: {
        Row: {
          id: string
          client_id: string | null
          pipeline: string
          stage: string
          ghl_opportunity_id: string | null
          deal_value: number
          assigned_agent: string | null
          entered_stage_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          pipeline: string
          stage: string
          ghl_opportunity_id?: string | null
          deal_value?: number
          assigned_agent?: string | null
          entered_stage_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          pipeline?: string
          stage?: string
          ghl_opportunity_id?: string | null
          deal_value?: number
          assigned_agent?: string | null
          entered_stage_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
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
      templates: {
        Row: {
          id: string
          category: string
          industry: string | null
          name: string
          description: string | null
          template_data: Json
          is_active: boolean
          usage_count: number
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          industry?: string | null
          name: string
          description?: string | null
          template_data?: Json
          is_active?: boolean
          usage_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          industry?: string | null
          name?: string
          description?: string | null
          template_data?: Json
          is_active?: boolean
          usage_count?: number
          created_at?: string
        }
        Relationships: []
      }
      video_reviews: {
        Row: {
          id: string
          client_id: string | null
          video_url: string | null
          status: string | null
          requested_at: string | null
          uploaded_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          video_url?: string | null
          status?: string | null
          requested_at?: string | null
          uploaded_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          video_url?: string | null
          status?: string | null
          requested_at?: string | null
          uploaded_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          id: string
          source: string
          event_type: string
          payload: Json
          processed: boolean
          processing_error: string | null
          agent_task_id: string | null
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          source: string
          event_type: string
          payload: Json
          processed?: boolean
          processing_error?: string | null
          agent_task_id?: string | null
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          source?: string
          event_type?: string
          payload?: Json
          processed?: boolean
          processing_error?: string | null
          agent_task_id?: string | null
          created_at?: string
          processed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_agent_task_id_fkey"
            columns: ["agent_task_id"]
            isOneToOne: false
            referencedRelation: "agent_tasks"
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
      app_role: "admin" | "rep" | "client"
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
      app_role: ["admin", "rep", "client"],
    },
  },
} as const
