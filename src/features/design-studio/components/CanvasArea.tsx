import { useDesignStore } from '../store';
import { Frame } from 'lucide-react';

export function CanvasArea() {
  const project = useDesignStore((s) => s.project);
  const zoom = useDesignStore((s) => s.zoom);

  return (
    <div className="flex-1 relative overflow-hidden bg-[hsl(var(--surface-low))]">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Canvas viewport */}
      <div className="relative h-full w-full flex items-center justify-center">
        {project && project.cards.length > 0 ? (
          <div
            className="flex gap-8 items-start"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            {project.cards.map((card) => (
              <div
                key={card.id}
                className="bg-white shadow-2xl relative overflow-hidden"
                style={{ width: card.width, height: card.height }}
              >
                {/* Layer rendering comes in Commit 2 */}
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 text-6xl">
                  {card.name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <Frame className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No cards yet</p>
            <p className="text-xs text-muted-foreground/50 mt-1">Click "New card" in the toolbar to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
