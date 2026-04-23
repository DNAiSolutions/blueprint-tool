-- ============================================================
-- Video Studio
-- DigitalDNA's 3-stage video editing pipeline inside Content Studio.
--   Stage 1: video-use (cut + clean)
--   Stage 2: hyperframes (motion graphics)
--   Stage 3: DigitalDNA QA (brand enforcement)
--
-- Projects link to the existing `projects` table (client folders).
-- Raw footage lives in `video_sources` with Supabase Storage paths.
-- Pipeline state + stage outputs are stored inline as jsonb for simplicity;
-- can be normalized into a `video_pipeline_runs` table later if we need
-- per-run history.
-- ============================================================

-- 1. video_projects — one row per video being produced
CREATE TABLE IF NOT EXISTS public.video_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identity
  slug text NOT NULL,
  title text NOT NULL,
  client_name text,               -- denormalized for display
  client_tag text,                -- denormalized tag for color styling

  -- Format
  format text NOT NULL CHECK (format IN ('longform','shortform')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft','ready','processing','qa_review','needs_fixes','approved','published'
  )),
  width integer NOT NULL,
  height integer NOT NULL,
  fps integer NOT NULL DEFAULT 30,
  duration_seconds numeric,

  -- Inputs — the directives.md contents as structured JSON
  -- Shape: { targetDuration, fillerWords[], skipRanges[], chapters[],
  --          preserve[], credibilityAnchor, midRollCta, bridge }
  directives jsonb NOT NULL DEFAULT '{
    "fillerWords": [],
    "skipRanges": [],
    "chapters": [],
    "preserve": []
  }'::jsonb,

  -- Stage 1 output (video-use)
  transcript jsonb,               -- TranscriptWord[]  { word, start, end, highlight }
  cuts jsonb,                     -- CutEvent[]        { type, atTime, sourceFile, reason }
  chapters jsonb,                 -- Chapter[]         { num, title, startTime, endTime }

  -- Stage 2 output (hyperframes)
  graphics jsonb,                 -- GraphicEvent[]    { type, atTime, duration, props }
  zooms jsonb,                    -- ZoomCue[]         { atTime, duration, scale, reason }

  -- Stage 3 output (QA)
  qa_checks jsonb,                -- QACheck[]         { id, label, priority, status, detail, suggestedFix }
  qa_verdict text CHECK (qa_verdict IS NULL OR qa_verdict IN ('ready','blocked','pending')),

  -- Pipeline state — array of 3 stages
  stages jsonb NOT NULL DEFAULT '[
    {"id": 1, "name": "Cut & Clean", "tool": "video-use", "status": "pending"},
    {"id": 2, "name": "Motion Graphics", "tool": "hyperframes", "status": "pending"},
    {"id": 3, "name": "Style QA", "tool": "DigitalDNA QA", "status": "pending"}
  ]'::jsonb,

  -- Artifacts
  thumbnail_url text,
  final_render_url text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_video_projects_project ON public.video_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_video_projects_user ON public.video_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_video_projects_status ON public.video_projects(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_video_projects_slug_user ON public.video_projects(user_id, slug);

-- 2. video_sources — raw footage files, one per upload
CREATE TABLE IF NOT EXISTS public.video_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_project_id uuid REFERENCES public.video_projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,

  filename text NOT NULL,
  storage_path text NOT NULL,     -- Supabase Storage path (bucket: video-sources)
  role text NOT NULL CHECK (role IN ('cam_a','cam_b','screen','b_roll','audio')),
  duration_seconds numeric,
  size_mb numeric,

  uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_video_sources_project ON public.video_sources(video_project_id);

-- 3. updated_at trigger for video_projects
CREATE OR REPLACE FUNCTION public.video_projects_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_video_projects_updated_at ON public.video_projects;
CREATE TRIGGER trg_video_projects_updated_at
BEFORE UPDATE ON public.video_projects
FOR EACH ROW EXECUTE FUNCTION public.video_projects_set_updated_at();

-- 4. RLS policies — staff can manage all, users own their rows
ALTER TABLE public.video_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY video_projects_staff_all ON public.video_projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','rep'))
  );

CREATE POLICY video_sources_staff_all ON public.video_sources
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','rep'))
  );

CREATE POLICY video_projects_own ON public.video_projects
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY video_sources_own ON public.video_sources
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Realtime — so stage progress updates stream to the UI while the
--    pipeline runner is writing to stages[] during video-use / hyperframes
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_sources;

-- 6. Storage bucket for raw footage (skipped if already exists)
-- Note: in Supabase, storage buckets are created via the storage API / dashboard,
-- but for idempotent migrations we insert into storage.buckets directly.
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('video-sources', 'video-sources', false, 5368709120)  -- 5 GB per file
ON CONFLICT (id) DO NOTHING;

-- Staff can read/write anything in video-sources
CREATE POLICY IF NOT EXISTS video_sources_staff_storage ON storage.objects
  FOR ALL USING (
    bucket_id = 'video-sources'
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','rep'))
  );

-- Users can read/write their own folder (scoped by user id prefix)
CREATE POLICY IF NOT EXISTS video_sources_own_storage ON storage.objects
  FOR ALL USING (
    bucket_id = 'video-sources'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
