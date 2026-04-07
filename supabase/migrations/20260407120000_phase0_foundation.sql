-- ============================================
-- Phase 0: Foundation Migration
-- Adds client role, expands clients table,
-- creates 13 new tables for the full agency OS
-- ============================================

-- 1. Expand app_role enum to include 'client'
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client';

-- 2. Expand clients table with portal and operational columns
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS ghl_contact_id text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS ghl_location_id text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS subdomain text UNIQUE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS status text DEFAULT 'trial';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS onboarding_status text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS clone_photo_url text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS clone_recording_url text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS brand_kit jsonb DEFAULT '{}';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS package_tier text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS content_approval_mode text DEFAULT 'manual';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS portal_activated_at timestamptz;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS offboarded_at timestamptz;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS social_channels jsonb DEFAULT '{}';

-- 3. Pipeline opportunities (multi-pipeline tracking)
CREATE TABLE IF NOT EXISTS public.pipeline_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  pipeline text NOT NULL CHECK (pipeline IN ('new_leads', 'sales', 'onboarding')),
  stage text NOT NULL,
  ghl_opportunity_id text,
  deal_value numeric DEFAULT 0,
  assigned_agent text,
  entered_stage_at timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Agent tasks (job queue backbone)
CREATE TABLE IF NOT EXISTS public.agent_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  task_type text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical','high','medium','low')),
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','in_progress','review','done','failed','escalated')),
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  input_payload jsonb,
  output_payload jsonb,
  parent_task_id uuid REFERENCES public.agent_tasks(id),
  error_count int DEFAULT 0,
  last_error text,
  escalated_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Webhook events
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN ('ghl','stripe','vercel','heygen','other')),
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  processing_error text,
  agent_task_id uuid REFERENCES public.agent_tasks(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

-- 6. Content approvals
CREATE TABLE IF NOT EXISTS public.content_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id uuid REFERENCES public.scripts(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','revision_requested','auto_approved')),
  revision_number int DEFAULT 0,
  revision_notes text,
  auto_approve_at timestamptz,
  submitted_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Cost ledger (per-client API cost tracking)
CREATE TABLE IF NOT EXISTS public.cost_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  agent_task_id uuid REFERENCES public.agent_tasks(id) ON DELETE SET NULL,
  provider text NOT NULL,
  api_action text NOT NULL,
  cost_usd numeric NOT NULL DEFAULT 0,
  tokens_used int,
  duration_seconds numeric,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Client health scores
CREATE TABLE IF NOT EXISTS public.client_health_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  content_performance numeric DEFAULT 0,
  engagement_score numeric DEFAULT 0,
  payment_score numeric DEFAULT 0,
  portal_activity numeric DEFAULT 0,
  composite_score numeric DEFAULT 0,
  upsell_triggered boolean DEFAULT false,
  computed_at timestamptz NOT NULL DEFAULT now()
);

-- 9. Agreements
CREATE TABLE IF NOT EXISTS public.agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('service_agreement','proposal','scope_of_work')),
  content_md text,
  pdf_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','viewed','signed','expired')),
  ghl_document_id text,
  sent_at timestamptz,
  signed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 10. Content plans
CREATE TABLE IF NOT EXISTS public.content_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  plan_type text NOT NULL CHECK (plan_type IN ('60_day','90_day','custom')),
  pillars jsonb,
  weekly_cadence jsonb,
  posting_schedule jsonb,
  start_date date,
  status text DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 11. Video reviews
CREATE TABLE IF NOT EXISTS public.video_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  video_url text,
  status text DEFAULT 'requested' CHECK (status IN ('requested','uploaded','approved','published')),
  requested_at timestamptz DEFAULT now(),
  uploaded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 12. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  channel text DEFAULT 'portal' CHECK (channel IN ('portal','email','sms','whatsapp','slack')),
  read boolean DEFAULT false,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 13. Templates
CREATE TABLE IF NOT EXISTS public.templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('website','script','carousel','email_sequence','automation','content_plan','agreement')),
  industry text,
  name text NOT NULL,
  description text,
  template_data jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  usage_count int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 14. Cron registry
CREATE TABLE IF NOT EXISTS public.cron_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cron_expression text NOT NULL,
  agent_id text NOT NULL,
  prompt text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active','paused')),
  last_run timestamptz,
  next_run timestamptz,
  run_count int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 15. Client social channels
CREATE TABLE IF NOT EXISTS public.client_social_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  platform text NOT NULL,
  handle text,
  connected boolean DEFAULT false,
  ghl_connected boolean DEFAULT false,
  included_in_package boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- RLS Policies
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE public.pipeline_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cron_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_social_channels ENABLE ROW LEVEL SECURITY;

-- Admin/rep: full access to all tables
CREATE POLICY "Admin full access to pipeline_opportunities" ON public.pipeline_opportunities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to agent_tasks" ON public.agent_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to webhook_events" ON public.webhook_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to cost_ledger" ON public.cost_ledger FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to templates" ON public.templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to cron_registry" ON public.cron_registry FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Client-accessible tables: clients see only their own data
CREATE POLICY "Client access to own content_approvals" ON public.content_approvals FOR ALL TO authenticated
  USING (client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','rep')));

CREATE POLICY "Client access to own health_scores" ON public.client_health_scores FOR SELECT TO authenticated
  USING (client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','rep')));

CREATE POLICY "Client access to own agreements" ON public.agreements FOR SELECT TO authenticated
  USING (client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','rep')));

CREATE POLICY "Client access to own content_plans" ON public.content_plans FOR SELECT TO authenticated
  USING (client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','rep')));

CREATE POLICY "Client access to own video_reviews" ON public.video_reviews FOR ALL TO authenticated
  USING (client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','rep')));

CREATE POLICY "Users access own notifications" ON public.notifications FOR ALL TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Client access to own social_channels" ON public.client_social_channels FOR SELECT TO authenticated
  USING (client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','rep')));

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON public.agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent_id ON public.agent_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_client_id ON public.agent_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_opportunities_pipeline ON public.pipeline_opportunities(pipeline);
CREATE INDEX IF NOT EXISTS idx_pipeline_opportunities_client_id ON public.pipeline_opportunities(client_id);
CREATE INDEX IF NOT EXISTS idx_content_approvals_client_id ON public.content_approvals(client_id);
CREATE INDEX IF NOT EXISTS idx_content_approvals_status ON public.content_approvals(status);
CREATE INDEX IF NOT EXISTS idx_cost_ledger_client_id ON public.cost_ledger(client_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON public.webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_clients_auth_user_id ON public.clients(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.content_approvals;
