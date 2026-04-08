-- ============================================================
-- Design Studio
-- AI-powered social media design canvas inside Content Studio.
-- Brand kits link to existing clients (one per client).
-- Design projects link to existing projects (client folders).
-- ============================================================

-- 1. Design brand kits — linked to clients
CREATE TABLE IF NOT EXISTS public.design_brand_kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  colors jsonb NOT NULL DEFAULT '{}',
  fonts jsonb NOT NULL DEFAULT '{}',
  logos jsonb DEFAULT '[]'::jsonb,
  is_default boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_design_brand_kits_client ON public.design_brand_kits(client_id);
CREATE INDEX IF NOT EXISTS idx_design_brand_kits_user ON public.design_brand_kits(user_id);

-- 2. Design projects — linked to client projects
CREATE TABLE IF NOT EXISTS public.design_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_kit_id uuid REFERENCES public.design_brand_kits(id) ON DELETE SET NULL,
  name text NOT NULL,
  layout text NOT NULL DEFAULT 'single' CHECK (layout IN ('single','grid-3x2','grid-2x1','carousel')),
  cards jsonb NOT NULL DEFAULT '[]'::jsonb,
  thumbnail_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_design_projects_project ON public.design_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_design_projects_user ON public.design_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_design_projects_brand_kit ON public.design_projects(brand_kit_id);

-- 3. Design assets — scoped to design projects
CREATE TABLE IF NOT EXISTS public.design_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  design_project_id uuid REFERENCES public.design_projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('image','video')),
  url text NOT NULL,
  source text CHECK (source IN ('upload','nano-banana','kling','url')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_design_assets_project ON public.design_assets(design_project_id);

-- 4. RLS policies
ALTER TABLE public.design_brand_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_assets ENABLE ROW LEVEL SECURITY;

-- Staff (admin/rep) can manage all design data
CREATE POLICY design_brand_kits_staff_all ON public.design_brand_kits
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','rep'))
  );

CREATE POLICY design_projects_staff_all ON public.design_projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','rep'))
  );

CREATE POLICY design_assets_staff_all ON public.design_assets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','rep'))
  );

-- Users own their rows (fallback for non-staff)
CREATE POLICY design_brand_kits_own ON public.design_brand_kits
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY design_projects_own ON public.design_projects
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY design_assets_own ON public.design_assets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.design_projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.design_assets;
