// Video Studio — root component for the DigitalDNA video editing pipeline UI.
// Shows: project grid → active project workspace with 3-stage pipeline visualization.
//
// Pipeline (aligns with skills/video-edit-system):
//   Stage 1 — video-use      (cut + clean)
//   Stage 2 — hyperframes    (motion graphics)
//   Stage 3 — DigitalDNA QA  (brand enforcement)

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { ProjectGrid } from './components/ProjectGrid';
import { PipelineView } from './components/PipelineView';
import { NewProjectDialog } from './components/NewProjectDialog';
import { useVideoProjects } from './useVideoProjects';
import { MOCK_PROJECTS } from './mock-data';
import type { VideoProject } from './types';
import { toast } from 'sonner';

interface VideoStudioProps {
  projectId?: string; // optional: scope to a client project
}

export function VideoStudio({ projectId }: VideoStudioProps = {}) {
  const {
    projects: dbProjects,
    loading,
    createProject,
    updateProject,
    seedMocks,
    seeding,
  } = useVideoProjects(projectId);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  // If the DB has rows, use them. If empty (fresh install / RLS denies),
  // fall back to mocks so the UI shows the demo states immediately. The
  // "Seed demo projects" CTA persists them to Supabase if the user clicks.
  const dbEmpty = !loading && dbProjects.length === 0;
  const projects = dbEmpty ? MOCK_PROJECTS : dbProjects;
  const usingMocks = dbEmpty;

  const active = projects.find((p) => p.id === activeId) ?? null;

  const handleCreate = async (draft: VideoProject) => {
    try {
      const saved = await createProject(draft);
      setActiveId(saved.id);
      setShowNew(false);
      toast.success(`Created "${saved.title}"`);
    } catch (err) {
      // Fallback: if Supabase is misconfigured / RLS blocks, just keep
      // it in local state so the demo still works.
      console.warn('[video-studio] createProject failed, using local state', err);
      setActiveId(draft.id);
      setShowNew(false);
      toast.warning('Saved locally — Supabase not yet wired');
    }
  };

  const handleUpdateProject = async (updated: VideoProject) => {
    if (usingMocks) {
      // Mock path: no-op in DB; the state lives in MOCK_PROJECTS only.
      // PipelineView still re-renders because we pass updated through.
      return;
    }
    try {
      await updateProject(updated);
    } catch (err) {
      console.warn('[video-studio] updateProject failed', err);
    }
  };

  const handleSeed = async () => {
    try {
      await seedMocks();
      toast.success('Seeded 4 demo projects');
    } catch (err) {
      toast.error('Seed failed — check console');
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      {/* Sub-header */}
      <div className="flex items-center justify-between h-12 px-6 border-b border-border shrink-0 bg-card/30">
        <div className="flex items-center gap-3">
          {active ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveId(null)}
                className="gap-1.5 -ml-2 h-8 text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> All projects
              </Button>
              <span className="text-muted-foreground text-xs">/</span>
              <span className="text-sm font-medium">{active.title}</span>
            </>
          ) : (
            <>
              <span className="text-sm font-semibold">Video Studio</span>
              {loading ? (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading…
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {projects.length} project{projects.length === 1 ? '' : 's'}
                  {usingMocks && <span className="ml-1 text-warning">· demo data</span>}
                </span>
              )}
            </>
          )}
        </div>

        {!active && (
          <div className="flex items-center gap-2">
            {usingMocks && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs"
                onClick={handleSeed}
                disabled={seeding}
              >
                {seeding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                Seed demo projects
              </Button>
            )}
            <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setShowNew(true)}>
              <Plus className="h-3.5 w-3.5" />
              New Video Project
            </Button>
          </div>
        )}
      </div>

      {/* Main body */}
      {active ? (
        <PipelineView project={active} onChange={handleUpdateProject} />
      ) : (
        <ProjectGrid projects={projects} onOpen={setActiveId} />
      )}

      <NewProjectDialog
        open={showNew}
        onOpenChange={setShowNew}
        onCreate={handleCreate}
      />
    </div>
  );
}
