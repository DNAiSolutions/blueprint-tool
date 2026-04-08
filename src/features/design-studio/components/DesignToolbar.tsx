import { useDesignStore } from '../store';
import { Button } from '@/components/ui/button';
import { Save, Download, Plus, Minus, Undo2, Redo2, LayoutGrid, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CARD_DIMENSIONS } from '../types';
import type { Card, CardFormat, SolidLayer } from '../types';

export function DesignToolbar() {
  const project = useDesignStore((s) => s.project);
  const setProject = useDesignStore((s) => s.setProject);
  const addCard = useDesignStore((s) => s.addCard);
  const zoom = useDesignStore((s) => s.zoom);
  const setZoom = useDesignStore((s) => s.setZoom);
  const undo = useDesignStore((s) => s.undo);
  const redo = useDesignStore((s) => s.redo);
  const canUndo = useDesignStore((s) => s.canUndo());
  const canRedo = useDesignStore((s) => s.canRedo());
  const brandKits = useDesignStore((s) => s.brandKits);
  const activeBrandKitId = useDesignStore((s) => s.activeBrandKitId);
  const setActiveBrandKit = useDesignStore((s) => s.setActiveBrandKit);

  if (!project) return null;

  const handleNewCard = () => {
    // Default to feed-square, match first card if present
    const format: CardFormat = (project.cards[0]?.format ?? 'feed-square') as CardFormat;
    const dims = CARD_DIMENSIONS[format];
    const bg: SolidLayer = {
      id: `bg-${Date.now()}`,
      type: 'solid',
      color: '#F5F1E8',
      visible: true,
      locked: true,
    };
    const newCard: Card = {
      id: `card-${Date.now()}`,
      name: `Card ${project.cards.length + 1}`,
      format,
      width: dims.w,
      height: dims.h,
      background: bg,
      layers: [],
    };
    addCard(newCard);
  };

  return (
    <div className="h-11 shrink-0 border-b border-border bg-card flex items-center px-3 gap-3">
      {/* Left — back + project name + brand kit */}
      <div className="flex items-center gap-2 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          title="Back to project grid"
          onClick={() => setProject(null)}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <span className="text-sm font-semibold truncate max-w-[180px]">{project.name}</span>
        <span className="text-muted-foreground/30">·</span>
        <select
          value={activeBrandKitId ?? ''}
          onChange={(e) => setActiveBrandKit(e.target.value || null)}
          className="text-xs bg-transparent border border-border rounded px-1.5 py-0.5 hover:border-accent/40 focus:border-accent outline-none"
        >
          {brandKits.map((k) => (
            <option key={k.id} value={k.id}>{k.name}</option>
          ))}
        </select>
      </div>

      {/* Center — layout + new card */}
      <div className="flex-1 flex items-center justify-center gap-2">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <LayoutGrid className="h-3 w-3" />
          <span className="capitalize">{project.layout.replace('-', ' ')}</span>
        </div>
        <span className="text-muted-foreground/30">·</span>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleNewCard}>
          <Plus className="h-3 w-3" /> New card
        </Button>
      </div>

      {/* Right — undo/redo, zoom, save, export */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!canUndo} onClick={undo}>
          <Undo2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!canRedo} onClick={redo}>
          <Redo2 className="h-3.5 w-3.5" />
        </Button>

        <div className="flex items-center gap-0.5 mx-2 rounded border border-border px-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(zoom - 0.1)}>
            <Minus className="h-3 w-3" />
          </Button>
          <span className={cn('text-[11px] font-mono w-10 text-center text-muted-foreground')}>{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(zoom + 0.1)}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
          <Save className="h-3 w-3" /> Save
        </Button>
        <Button size="sm" className="h-7 gap-1.5 text-xs">
          <Download className="h-3 w-3" /> Export
        </Button>
      </div>
    </div>
  );
}
