
-- 1. Projects table
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  ghl_subaccount_id text,
  ghl_location_id text,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view projects" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update projects" ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete projects" ON public.projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Project Services table
CREATE TABLE public.project_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  service_type text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  config jsonb DEFAULT '{}'::jsonb,
  activated_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz
);

ALTER TABLE public.project_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view project_services" ON public.project_services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert project_services" ON public.project_services FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update project_services" ON public.project_services FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete project_services" ON public.project_services FOR DELETE TO authenticated USING (true);

-- 3. Support Tickets table
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'open',
  assigned_agent text,
  agent_task_id uuid,
  resolution_notes text,
  resolved_at timestamptz,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view support_tickets" ON public.support_tickets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert support_tickets" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update support_tickets" ON public.support_tickets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete support_tickets" ON public.support_tickets FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Pipeline Opportunities table
CREATE TABLE public.pipeline_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline text NOT NULL,
  stage text NOT NULL,
  deal_value numeric DEFAULT 0,
  assigned_agent text,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  notes text,
  entered_stage_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pipeline_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view pipeline_opportunities" ON public.pipeline_opportunities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert pipeline_opportunities" ON public.pipeline_opportunities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update pipeline_opportunities" ON public.pipeline_opportunities FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete pipeline_opportunities" ON public.pipeline_opportunities FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_pipeline_opportunities_updated_at BEFORE UPDATE ON public.pipeline_opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for pipeline_opportunities
ALTER PUBLICATION supabase_realtime ADD TABLE public.pipeline_opportunities;

-- 5. Design Brand Kits table
CREATE TABLE public.design_brand_kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text,
  name text NOT NULL,
  colors jsonb DEFAULT '{}'::jsonb,
  fonts jsonb DEFAULT '{"display":"Inter","body":"Inter"}'::jsonb,
  logos jsonb DEFAULT '[]'::jsonb,
  is_default boolean DEFAULT false,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.design_brand_kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view design_brand_kits" ON public.design_brand_kits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert design_brand_kits" ON public.design_brand_kits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update design_brand_kits" ON public.design_brand_kits FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete design_brand_kits" ON public.design_brand_kits FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 6. Design Projects table
CREATE TABLE public.design_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  brand_kit_id text,
  name text NOT NULL,
  layout text DEFAULT 'landscape',
  cards jsonb DEFAULT '[]'::jsonb,
  thumbnail_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.design_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view design_projects" ON public.design_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert design_projects" ON public.design_projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update design_projects" ON public.design_projects FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete design_projects" ON public.design_projects FOR DELETE TO authenticated USING (auth.uid() = user_id);
