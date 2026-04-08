// CanvasArea — the middle viewport. Renders the active project's cards at
// true resolution (1080×1080 etc.) and scales the whole group by the current
// zoom. Clicking empty space deselects.

import { useDesignStore } from '../store';
import { CardRenderer } from './CardRenderer';
import { Frame } from 'lucide-react';

export function CanvasArea() {
  const project = useDesignStore((s) => s.project);
  const zoom = useDesignStore((s) => s.zoom);
  const selectCard = useDesignStore((s) => s.selectCard);

  return (
    <div
      className="flex-1 relative overflow-auto scrollbar-thin bg-[hsl(var(--surface-low))]"
      onClick={() => selectCard(null)}
    >
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: 'radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="min-h-full min-w-full flex items-center justify-center p-24">
        {project && project.cards.length > 0 ? (
          <div
            className="flex gap-10 items-start"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            {project.cards.map((card) => (
              <CardRenderer key={card.id} card={card} />
            ))}
          </div>
        ) : (
          <div className="text-center">
            <Frame className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No cards yet</p>
            <p className="text-xs text-muted-foreground/50 mt-1">
              Click "New card" in the toolbar to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
