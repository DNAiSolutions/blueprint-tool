-- ============================================================
-- Projects & Support Tickets
-- One project per client — houses all services they purchase.
-- Support tickets flow from client portal into the project
-- and get picked up by agents.
-- ============================================================

-- 1. Projects table — one per client
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','completed','archived')),
  ghl_subaccount_id text,
  ghl_location_id text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id)
);

-- 2. Project services — which services this client is subscribed to
CREATE TABLE IF NOT EXISTS public.project_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  service_type text NOT NULL CHECK (service_type IN (
    'ai_content', 'website', 'growth_automations', 'client_acquisition',
    'social_media', 'seo', 'branding', 'custom'
  )),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','cancelled')),
  config jsonb DEFAULT '{}',
  activated_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_project_services_project ON public.project_services(project_id);
CREATE INDEX IF NOT EXISTS idx_project_services_type ON public.project_services(service_type);

-- 3. Support tickets — linked to projects, picked up by agents
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general' CHECK (category IN (
    'website_change', 'content_revision', 'bug_report', 'feature_request',
    'billing', 'automation', 'general'
  )),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','waiting_client','resolved','closed')),
  assigned_agent text,
  agent_task_id uuid REFERENCES public.agent_tasks(id),
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_project ON public.support_tickets(project_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_client ON public.support_tickets(client_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_projects_client ON public.projects(client_id);

-- 4. RLS policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Staff can see all projects
CREATE POLICY projects_staff_all ON public.projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','rep'))
  );

-- Clients see their own project
CREATE POLICY projects_client_own ON public.projects
  FOR SELECT USING (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
  );

-- Staff can manage all project services
CREATE POLICY project_services_staff_all ON public.project_services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','rep'))
  );

-- Clients see their own project services
CREATE POLICY project_services_client_own ON public.project_services
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.clients c ON c.id = p.client_id
      WHERE c.auth_user_id = auth.uid()
    )
  );

-- Staff can manage all tickets
CREATE POLICY support_tickets_staff_all ON public.support_tickets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','rep'))
  );

-- Clients can create and view their own tickets
CREATE POLICY support_tickets_client_select ON public.support_tickets
  FOR SELECT USING (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
  );

CREATE POLICY support_tickets_client_insert ON public.support_tickets
  FOR INSERT WITH CHECK (
    client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
  );

-- 5. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
