import { useDesignStore } from '../store';
import type { DesignProject } from '../types';
import { Button } from '@/components/ui/button';
import { Plus, Frame, Clock } from 'lucide-react';

interface ProjectGridProps {
  projects: DesignProject[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  const setProject = useDesignStore((s) => s.setProject);

  return (
    <div className="h-full overflow-auto scrollbar-thin p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold">Design Studio</h2>
          <p className="text-xs text-muted-foreground">Your saved design projects</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New Project
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => setProject(p)}
            className="group text-left rounded-xl bg-card border border-border overflow-hidden hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all"
          >
            {/* Thumbnail */}
            <div className="aspect-[4/3] bg-muted flex items-center justify-center">
              {p.thumbnailUrl ? (
                <img src={p.thumbnailUrl} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <Frame className="h-8 w-8 text-muted-foreground/30" />
              )}
            </div>
            {/* Meta */}
            <div className="p-3">
              <p className="text-xs font-semibold group-hover:text-accent transition-colors truncate">{p.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Frame className="h-2.5 w-2.5" /> {p.cards.length} cards
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  {new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
