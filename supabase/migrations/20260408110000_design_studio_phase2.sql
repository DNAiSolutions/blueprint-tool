-- ============================================================
-- Design Studio — Phase 2 (AI Layer)
-- Adds template library, version history, prompt library, and
-- links design projects to content calendar events.
-- ============================================================

-- 1. Templates — reusable design starting points
CREATE TABLE IF NOT EXISTS public.design_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  category text,
  -- Stored as a full card snapshot (same shape as design_projects.cards[0])
  card jsonb NOT NULL,
  thumbnail_url text,
  is_global boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_design_templates_user ON public.design_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_design_templates_client ON public.design_templates(client_id);
CREATE INDEX IF NOT EXISTS idx_design_templates_category ON public.design_templates(category);

-- 2. Version history — lightweight snapshot log per design project
CREATE TABLE IF NOT EXISTS public.design_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  design_project_id uuid REFERENCES public.design_projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  label text,
  cards jsonb NOT NULL,
  thumbnail_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_design_versions_project ON public.design_versions(design_project_id);

-- 3. Prompt library — reusable AI prompts with tags
CREATE TABLE IF NOT EXISTS public.design_prompt_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  name text NOT NULL,
  prompt text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('background','image','video','copy','edit')),
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_design_prompt_library_user ON public.design_prompt_library(user_id);
CREATE INDEX IF NOT EXISTS idx_design_prompt_library_kind ON public.design_prompt_library(kind);

-- 4. Link design projects to content calendar events (optional)
ALTER TABLE public.design_projects
  ADD COLUMN IF NOT EXISTS linked_event_id uuid;

CREATE INDEX IF NOT EXISTS idx_design_projects_linked_event
  ON public.design_projects(linked_event_id);

-- 5. RLS policies
ALTER TABLE public.design_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_prompt_library ENABLE ROW LEVEL SECURITY;

-- Staff (admin/rep) can manage all
CREATE POLICY design_templates_staff_all ON public.design_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','rep'))
  );

CREATE POLICY design_versions_staff_all ON public.design_versions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','rep'))
  );

CREATE POLICY design_prompt_library_staff_all ON public.design_prompt_library
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','rep'))
  );

-- Users own their rows (fallback)
CREATE POLICY design_templates_own ON public.design_templates
  FOR ALL USING (auth.uid() = user_id OR is_global = true)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY design_versions_own ON public.design_versions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY design_prompt_library_own ON public.design_prompt_library
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.design_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.design_versions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.design_prompt_library;
