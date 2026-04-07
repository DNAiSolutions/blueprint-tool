
-- Clients table (links to ALIGN sessions)
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id uuid,
  business_name text NOT NULL,
  contact_name text,
  industry text,
  location text,
  email text,
  phone text,
  pipeline_stage text NOT NULL DEFAULT 'leads' CHECK (pipeline_stage IN ('leads','audit','strategy','build','produce','live')),
  services jsonb DEFAULT '[]'::jsonb,
  monthly_value numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update clients" ON public.clients FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete clients" ON public.clients FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Content Scripts
CREATE TABLE public.scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL,
  pillar text,
  offer text,
  vac_type text,
  trigger_type text,
  hook_method text,
  duration_target int,
  script_text text,
  storyboard jsonb,
  caption text,
  follow_up_comment text,
  platforms text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_review','approved','in_production','scheduled','published')),
  scheduled_at timestamptz,
  published_at timestamptz,
  metrics jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view scripts" ON public.scripts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert scripts" ON public.scripts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update scripts" ON public.scripts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete scripts" ON public.scripts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Production Jobs
CREATE TABLE public.production_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id uuid REFERENCES public.scripts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  job_type text NOT NULL CHECK (job_type IN ('heygen_video','kieai_image','elevenlabs_voice','wavespeed_video','remotion_graphics')),
  provider_job_id text,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','processing','completed','failed')),
  output_url text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.production_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view production_jobs" ON public.production_jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert production_jobs" ON public.production_jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update production_jobs" ON public.production_jobs FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Websites
CREATE TABLE public.websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  domain text,
  template text,
  stitch_design_md text,
  site_code text,
  deploy_provider text CHECK (deploy_provider IN ('vercel','netlify')),
  deploy_url text,
  deploy_status text NOT NULL DEFAULT 'draft' CHECK (deploy_status IN ('draft','deploying','live','error')),
  last_deployed timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view websites" ON public.websites FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert websites" ON public.websites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update websites" ON public.websites FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete websites" ON public.websites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Leads
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text CHECK (source IN ('instagram_comment','instagram_dm','tiktok_dm','tiktok_comment','facebook','form','apollo','ad_click','bio_link','referral','other')),
  name text,
  business_name text,
  industry text,
  email text,
  phone text,
  engagement_action text,
  score int DEFAULT 0,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','converted','lost')),
  enrichment_data jsonb,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view leads" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update leads" ON public.leads FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete leads" ON public.leads FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Financial Transactions
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL,
  description text,
  amount numeric NOT NULL,
  category text,
  type text NOT NULL CHECK (type IN ('income','expense')),
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  is_recurring boolean DEFAULT false,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','bank_upload','stripe','ghl')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view transactions" ON public.transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update transactions" ON public.transactions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete transactions" ON public.transactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Invoices
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  invoice_number text NOT NULL,
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','paid','overdue','cancelled')),
  due_date date,
  sent_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view invoices" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update invoices" ON public.invoices FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- AI Activity Logs
CREATE TABLE public.ai_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  module text,
  input_summary text,
  output_summary text,
  full_input text,
  full_output text,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running','success','error')),
  duration_ms int,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view ai_logs" ON public.ai_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert ai_logs" ON public.ai_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update ai_logs" ON public.ai_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Integration Settings
CREATE TABLE public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL,
  api_key_encrypted text,
  status text NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected','disconnected','error')),
  last_tested timestamptz,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own integrations" ON public.integrations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own integrations" ON public.integrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own integrations" ON public.integrations FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own integrations" ON public.integrations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Tasks (for dashboard)
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  description text NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  module text,
  due_date date,
  is_completed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view tasks" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update tasks" ON public.tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete tasks" ON public.tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.production_jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scripts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
