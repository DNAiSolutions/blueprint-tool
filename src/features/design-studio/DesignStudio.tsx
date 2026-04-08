// Design Studio — root component
// 3-panel layout: left sidebar (tabs) | center canvas | right inspector
// This is the Phase 1 skeleton. Canvas rendering and layer system come in Commit 2.

import { useEffect, useMemo } from 'react';
import { useDesignStore } from './store';
import { useDesignProjects } from './useDesignProjects';
import { DesignToolbar } from './components/DesignToolbar';
import { LeftSidebar } from './components/LeftSidebar';
import { CanvasArea } from './components/CanvasArea';
import { RightInspector } from './components/RightInspector';
import { ProjectGrid } from './components/ProjectGrid';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DesignStudioProps {
  /** Optional: scope this Design Studio instance to a specific client project */
  projectId?: string;
}

export function DesignStudio({ projectId }: DesignStudioProps) {
  const project = useDesignStore((s) => s.project);
  const setBrandKits = useDesignStore((s) => s.setBrandKits);
  const setActiveBrandKit = useDesignStore((s) => s.setActiveBrandKit);
  const activeBrandKitId = useDesignStore((s) => s.activeBrandKitId);

  const { brandKits, designProjects, loading } = useDesignProjects(projectId);

  // Sync brand kits into the store once loaded
  useEffect(() => {
    setBrandKits(brandKits);
    if (!activeBrandKitId && brandKits.length > 0) {
      const defaultKit = brandKits.find((k) => k.isDefault) ?? brandKits[0];
      setActiveBrandKit(defaultKit.id);
    }
  }, [brandKits, activeBrandKitId, setBrandKits, setActiveBrandKit]);

  // Landing state — no project open
  if (!project) {
    if (loading) {
      return (
        <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
          Loading Design Studio…
        </div>
      );
    }

    if (designProjects.length === 0) {
      return <EmptyDesignStudio projectId={projectId} />;
    }

    return <ProjectGrid projects={designProjects} />;
  }

  // Active project view — 3-panel canvas layout
  return (
    <div className="h-full flex flex-col bg-[hsl(var(--surface-low))]">
      <DesignToolbar />
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar />
        <CanvasArea />
        <RightInspector />
      </div>
    </div>
  );
}

function EmptyDesignStudio({ projectId }: { projectId?: string }) {
  return (
    <div className="h-full flex items-center justify-center p-12">
      <div className="max-w-md text-center">
        <div className="h-16 w-16 mx-auto mb-5 rounded-2xl bg-accent/10 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-accent" />
        </div>
        <h2 className="text-xl font-bold mb-2">Start your first design</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Build branded social posts for your clients in minutes. Stack layers, apply effects, and export in one click.
        </p>
        <div className="flex gap-2 justify-center">
          <Button size="sm">Create new project</Button>
          <Button variant="outline" size="sm">Load sample project</Button>
        </div>
      </div>
    </div>
  );
}
