// LayersPanel — list of layers in the currently selected card.
// Click to select, drag to reorder, toggle eye to hide, toggle lock to lock.

import { useDesignStore } from '../store';
import type { Layer, LayerType } from '../types';
import {
  Eye, EyeOff, Lock, Unlock, Square, Droplet, Image as ImageIcon,
  Video, Type, Sparkles, Grid3x3, CircleDot, Trash2, GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LAYER_ICONS: Record<LayerType, React.ComponentType<{ className?: string }>> = {
  solid: Square,
  gradient: Droplet,
  'liquid-glass': Sparkles,
  image: ImageIcon,
  video: Video,
  text: Type,
  'overlay-gradient': Droplet,
  noise: Grid3x3,
  vignette: CircleDot,
};

function layerLabel(layer: Layer): string {
  switch (layer.type) {
    case 'text':
      return layer.content.slice(0, 24) || 'Text';
    case 'image':
      return 'Image';
    case 'video':
      return 'Video';
    case 'liquid-glass':
      return 'Liquid glass';
    case 'gradient':
      return 'Gradient';
    case 'solid':
      return 'Solid';
    case 'overlay-gradient':
      return 'Overlay';
    case 'noise':
      return 'Noise';
    case 'vignette':
      return 'Vignette';
    default:
      return 'Layer';
  }
}

export function LayersPanel() {
  const project = useDesignStore((s) => s.project);
  const selectedCardId = useDesignStore((s) => s.selectedCardId);
  const selectedLayerId = useDesignStore((s) => s.selectedLayerId);
  const selectLayer = useDesignStore((s) => s.selectLayer);
  const toggleLayerVisibility = useDesignStore((s) => s.toggleLayerVisibility);
  const toggleLayerLock = useDesignStore((s) => s.toggleLayerLock);
  const deleteLayer = useDesignStore((s) => s.deleteLayer);
  const reorderLayers = useDesignStore((s) => s.reorderLayers);

  if (!project) {
    return <EmptyLayers message="Open a project to see its layers." />;
  }

  const card =
    project.cards.find((c) => c.id === selectedCardId) ?? project.cards[0];

  if (!card) {
    return <EmptyLayers message="No cards in this project yet." />;
  }

  // Render top-to-bottom (index 0 = bottom of stack, so reverse for UX)
  const layers = [...card.layers].reverse();

  return (
    <div>
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {card.name}
        </span>
        <span className="text-[10px] text-muted-foreground/60">{card.layers.length} layers</span>
      </div>

      <div className="space-y-0.5">
        {layers.map((layer, revIdx) => {
          const realIdx = card.layers.length - 1 - revIdx;
          const Icon = LAYER_ICONS[layer.type];
          const isSelected = layer.id === selectedLayerId;

          return (
            <div
              key={layer.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', String(realIdx));
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const fromIdx = Number(e.dataTransfer.getData('text/plain'));
                if (!Number.isNaN(fromIdx) && fromIdx !== realIdx) {
                  reorderLayers(card.id, fromIdx, realIdx);
                }
              }}
              onClick={() => selectLayer(card.id, layer.id)}
              className={cn(
                'group flex items-center gap-1.5 px-1.5 py-1.5 rounded cursor-pointer transition-colors',
                isSelected
                  ? 'bg-accent/15 text-foreground'
                  : 'hover:bg-muted/40 text-muted-foreground',
              )}
            >
              <GripVertical className="h-3 w-3 text-muted-foreground/40 shrink-0" />
              <Icon className={cn('h-3 w-3 shrink-0', isSelected && 'text-accent')} />
              <span className={cn('flex-1 text-[11px] truncate', isSelected && 'font-medium')}>
                {layerLabel(layer)}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLayerVisibility(card.id, layer.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity"
                title={layer.visible ? 'Hide' : 'Show'}
              >
                {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLayerLock(card.id, layer.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity"
                title={layer.locked ? 'Unlock' : 'Lock'}
              >
                {layer.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteLayer(card.id, layer.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                title="Delete layer"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyLayers({ message }: { message: string }) {
  return (
    <div className="text-center py-8 px-2">
      <p className="text-[11px] text-muted-foreground/70">{message}</p>
    </div>
  );
}
