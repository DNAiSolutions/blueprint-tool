-- Lead Engines phase 1
-- Adds reusable lead magnet submission/run/onboarding tracking and
-- extends websites so sample sites can live in the same website domain
-- with clear source and lifecycle filters.

CREATE TABLE IF NOT EXISTS public.lead_engine_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source_funnel text,
  niche text,
  lead_engine_type text NOT NULL DEFAULT 'lead_magnet',
  contact_name text,
  business_name text,
  industry text,
  email text,
  phone text,
  website_url text,
  selected_services jsonb DEFAULT '[]'::jsonb,
  intake_payload jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'generating', 'preview_ready', 'revision_requested', 'approved', 'converted', 'archived')),
  linked_lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  linked_client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_engine_submissions_source_idx ON public.lead_engine_submissions(source_funnel, status);
CREATE INDEX IF NOT EXISTS lead_engine_submissions_user_idx ON public.lead_engine_submissions(user_id, created_at DESC);

ALTER TABLE public.lead_engine_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view lead_engine_submissions"
ON public.lead_engine_submissions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert lead_engine_submissions"
ON public.lead_engine_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update lead_engine_submissions"
ON public.lead_engine_submissions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete lead_engine_submissions"
ON public.lead_engine_submissions FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.lead_engine_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_engine_submission_id uuid NOT NULL,
  research_status text NOT NULL DEFAULT 'pending' CHECK (research_status IN ('pending', 'running', 'completed', 'failed')),
  website_status text NOT NULL DEFAULT 'draft' CHECK (website_status IN ('draft', 'generating', 'preview_ready', 'revision_requested', 'approved', 'converted', 'deployed', 'failed')),
  content_status text NOT NULL DEFAULT 'draft' CHECK (content_status IN ('draft', 'generating', 'preview_ready', 'approved', 'failed')),
  video_status text NOT NULL DEFAULT 'draft' CHECK (video_status IN ('draft', 'generating', 'preview_ready', 'approved', 'failed')),
  crm_sync_status text NOT NULL DEFAULT 'pending' CHECK (crm_sync_status IN ('pending', 'queued', 'synced', 'failed')),
  preview_url text,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lead_engine_runs_submission_id_fkey FOREIGN KEY (lead_engine_submission_id) REFERENCES public.lead_engine_submissions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS lead_engine_runs_submission_idx ON public.lead_engine_runs(lead_engine_submission_id, website_status);

ALTER TABLE public.lead_engine_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view lead_engine_runs"
ON public.lead_engine_runs FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.lead_engine_submissions s
    WHERE s.id = lead_engine_runs.lead_engine_submission_id
  )
);

CREATE POLICY "Staff can manage lead_engine_runs"
ON public.lead_engine_runs FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'rep')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'rep')
  )
);

CREATE TABLE IF NOT EXISTS public.lead_engine_onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_engine_submission_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready_for_call', 'partial', 'completed')),
  confirmed_services jsonb DEFAULT '[]'::jsonb,
  intake_changes_summary text,
  missing_items_summary text,
  website_review_status text DEFAULT 'pending' CHECK (website_review_status IN ('pending', 'preview_ready', 'revision_requested', 'approved')),
  next_owner text,
  next_follow_up_at timestamptz,
  ready_for_fulfillment boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lead_engine_onboarding_submission_id_fkey FOREIGN KEY (lead_engine_submission_id) REFERENCES public.lead_engine_submissions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS lead_engine_onboarding_submission_idx ON public.lead_engine_onboarding(lead_engine_submission_id, status);

ALTER TABLE public.lead_engine_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view lead_engine_onboarding"
ON public.lead_engine_onboarding FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.lead_engine_submissions s
    WHERE s.id = lead_engine_onboarding.lead_engine_submission_id
  )
);

CREATE POLICY "Staff can manage lead_engine_onboarding"
ON public.lead_engine_onboarding FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'rep')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'rep')
  )
);

ALTER TABLE public.websites
  ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'client_project',
  ADD COLUMN IF NOT EXISTS source_submission_id uuid,
  ADD COLUMN IF NOT EXISTS source_funnel text,
  ADD COLUMN IF NOT EXISTS website_stage text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS promotion_status text NOT NULL DEFAULT 'not_promoted',
  ADD COLUMN IF NOT EXISTS preview_url text,
  ADD COLUMN IF NOT EXISTS stitch_project_id text;

ALTER TABLE public.websites
  DROP CONSTRAINT IF EXISTS websites_source_submission_id_fkey;

ALTER TABLE public.websites
  ADD CONSTRAINT websites_source_submission_id_fkey
  FOREIGN KEY (source_submission_id) REFERENCES public.lead_engine_submissions(id) ON DELETE SET NULL;

ALTER TABLE public.websites
  DROP CONSTRAINT IF EXISTS websites_source_type_check;

ALTER TABLE public.websites
  ADD CONSTRAINT websites_source_type_check CHECK (source_type IN ('lead_magnet', 'client_project'));

ALTER TABLE public.websites
  DROP CONSTRAINT IF EXISTS websites_website_stage_check;

ALTER TABLE public.websites
  ADD CONSTRAINT websites_website_stage_check CHECK (website_stage IN ('draft', 'generating', 'preview_ready', 'revision_requested', 'approved', 'converted', 'deployed'));

ALTER TABLE public.websites
  DROP CONSTRAINT IF EXISTS websites_promotion_status_check;

ALTER TABLE public.websites
  ADD CONSTRAINT websites_promotion_status_check CHECK (promotion_status IN ('not_promoted', 'promoted_to_client', 'archived'));

CREATE INDEX IF NOT EXISTS websites_source_idx ON public.websites(source_type, website_stage, promotion_status);
CREATE INDEX IF NOT EXISTS websites_submission_idx ON public.websites(source_submission_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_engine_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_engine_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_engine_onboarding;
