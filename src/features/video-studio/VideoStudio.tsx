// Video Studio — root component for the DigitalDNA video editing pipeline UI.
// Shows: project grid → active project workspace with 3-stage pipeline visualization.
//
// Pipeline (aligns with skills/video-edit-system):
//   Stage 1 — video-use      (cut + clean)
//   Stage 2 — hyperframes    (motion graphics)
//   Stage 3 — DigitalDNA QA  (brand enforcement)

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { ProjectGrid } from './components/ProjectGrid';
import { PipelineView } from './components/PipelineView';
import { NewProjectDialog } from './components/NewProjectDialog';
import { MOCK_PROJECTS } from './mock-data';
import type { VideoProject } from './types';

interface VideoStudioProps {
  projectId?: string; // future: scope to a client project
}

export function VideoStudio({ projectId: _projectId }: VideoStudioProps = {}) {
  const [projects, setProjects] = useState<VideoProject[]>(MOCK_PROJECTS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const active = projects.find((p) => p.id === activeId) ?? null;

  const handleCreate = (draft: VideoProject) => {
    setProjects((prev) => [draft, ...prev]);
    setActiveId(draft.id);
    setShowNew(false);
  };

  const updateProject = (updated: VideoProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
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
              <span className="text-xs text-muted-foreground">
                {projects.length} project{projects.length === 1 ? '' : 's'}
              </span>
            </>
          )}
        </div>

        {!active && (
          <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setShowNew(true)}>
            <Plus className="h-3.5 w-3.5" />
            New Video Project
          </Button>
        )}
      </div>

      {/* Main body */}
      {active ? (
        <PipelineView project={active} onChange={updateProject} />
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
