// CardRenderer — one design card with its background + all layers rendered
// at true resolution. Handles layer selection, drag-to-move, drag-to-resize,
// and inline text editing. Pointer deltas are divided by zoom so drags feel
// 1:1 regardless of the viewport transform.

import { useRef, useState } from 'react';
import { useDesignStore } from '../store';
import type { Card, Layer } from '../types';
import { LayerRenderer, isPositionedLayer } from './LayerRenderer';
import { cn } from '@/lib/utils';

interface CardRendererProps {
  card: Card;
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

interface DragState {
  mode: 'move' | 'resize';
  handle?: ResizeHandle;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  origW: number;
  origH: number;
}

export function CardRenderer({ card }: CardRendererProps) {
  const zoom = useDesignStore((s) => s.zoom);
  const selectedCardId = useDesignStore((s) => s.selectedCardId);
  const selectedLayerId = useDesignStore((s) => s.selectedLayerId);
  const selectCard = useDesignStore((s) => s.selectCard);
  const selectLayer = useDesignStore((s) => s.selectLayer);
  const updateLayerNoHistory = useDesignStore((s) => s.updateLayerNoHistory);
  const commitTransaction = useDesignStore((s) => s.commitTransaction);

  const cardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const isCardSelected = selectedCardId === card.id;

  // Click an empty part of the card → select the card (not a layer)
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectCard(card.id);
  };

  // Click a layer → select it (don't propagate so card click doesn't re-fire)
  const handleLayerPointerDown = (e: React.PointerEvent, layer: Layer) => {
    if (layer.locked) return;
    e.stopPropagation();
    selectLayer(card.id, layer.id);

    if (!isPositionedLayer(layer)) return; // full-coverage layers don't drag
    if (editingTextId === layer.id) return; // text being edited — don't drag

    const hasHeight = 'h' in layer;
    commitTransaction();
    dragRef.current = {
      mode: 'move',
      startX: e.clientX,
      startY: e.clientY,
      origX: layer.x,
      origY: layer.y,
      origW: layer.w,
      origH: hasHeight ? (layer as { h: number }).h : 0,
    };
    (e.target as Element).setPointerCapture(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = (ev.clientX - d.startX) / zoom;
      const dy = (ev.clientY - d.startY) / zoom;
      updateLayerNoHistory(card.id, layer.id, {
        x: Math.round(d.origX + dx),
        y: Math.round(d.origY + dy),
      } as Partial<Layer>);
    };

    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Resize handle drag
  const handleResizeStart = (
    e: React.PointerEvent,
    layer: Layer,
    handle: ResizeHandle,
  ) => {
    if (!isPositionedLayer(layer)) return;
    e.stopPropagation();
    e.preventDefault();

    const hasHeight = 'h' in layer;
    commitTransaction();

    dragRef.current = {
      mode: 'resize',
      handle,
      startX: e.clientX,
      startY: e.clientY,
      origX: layer.x,
      origY: layer.y,
      origW: layer.w,
      origH: hasHeight ? (layer as { h: number }).h : 0,
    };

    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = (ev.clientX - d.startX) / zoom;
      const dy = (ev.clientY - d.startY) / zoom;

      let nx = d.origX;
      let ny = d.origY;
      let nw = d.origW;
      let nh = d.origH;

      if (handle.includes('e')) nw = Math.max(20, d.origW + dx);
      if (handle.includes('s')) nh = Math.max(20, d.origH + dy);
      if (handle.includes('w')) {
        nw = Math.max(20, d.origW - dx);
        nx = d.origX + (d.origW - nw);
      }
      if (handle.includes('n')) {
        nh = Math.max(20, d.origH - dy);
        ny = d.origY + (d.origH - nh);
      }

      const updates: Record<string, number> = { x: Math.round(nx), y: Math.round(ny), w: Math.round(nw) };
      if (hasHeight) updates.h = Math.round(nh);
      updateLayerNoHistory(card.id, layer.id, updates as Partial<Layer>);
    };

    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const handleTextDoubleClick = (e: React.MouseEvent, layer: Layer) => {
    if (layer.type !== 'text' || layer.locked) return;
    e.stopPropagation();
    setEditingTextId(layer.id);
  };

  const selectedLayer = card.layers.find((l) => l.id === selectedLayerId);

  return (
    <div className="flex flex-col items-start">
      {/* Card label */}
      <div
        className={cn(
          'text-[11px] font-mono uppercase tracking-wider mb-2 px-2 py-0.5 rounded',
          isCardSelected ? 'bg-accent text-accent-foreground' : 'bg-card/60 text-muted-foreground',
        )}
      >
        {card.name} · {card.width}×{card.height}
      </div>

      {/* The card itself — rendered at true resolution; parent scales it */}
      <div
        ref={cardRef}
        data-card-export={card.id}
        className={cn(
          'relative overflow-hidden bg-white shadow-2xl transition-shadow',
          isCardSelected && 'ring-2 ring-accent ring-offset-4 ring-offset-transparent',
        )}
        style={{ width: card.width, height: card.height }}
        onClick={handleCardClick}
      >
        {/* Background layer — rendered full-bleed */}
        <LayerRenderer layer={card.background} />

        {/* Stacked layers (bottom → top) */}
        {card.layers.map((layer) => {
          const isSelected = layer.id === selectedLayerId;
          const editing = editingTextId === layer.id;
          return (
            <div
              key={layer.id}
              onPointerDown={(e) => handleLayerPointerDown(e, layer)}
              onDoubleClick={(e) => handleTextDoubleClick(e, layer)}
              className={cn(
                'absolute inset-0',
                !layer.locked && 'cursor-move',
                layer.locked && 'pointer-events-none',
              )}
              style={{ zIndex: 1 }}
            >
              <LayerRenderer
                layer={layer}
                isEditingText={editing}
                onTextChange={(content) => {
                  if (layer.type === 'text') {
                    // Use updateLayer (with history) on commit
                    useDesignStore.getState().updateLayer(card.id, layer.id, { content } as Partial<Layer>);
                  }
                }}
                onTextBlur={() => setEditingTextId(null)}
              />
              {/* Selection outline for positioned layers */}
              {isSelected && !editing && isPositionedLayer(layer) && (
                <SelectionBox layer={layer} onResizeStart={handleResizeStart} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Selection box with 8 resize handles ----------
function SelectionBox({
  layer,
  onResizeStart,
}: {
  layer: Extract<Layer, { x: number; y: number }>;
  onResizeStart: (e: React.PointerEvent, layer: Layer, handle: ResizeHandle) => void;
}) {
  const hasHeight = 'h' in layer;
  const h = hasHeight ? (layer as { h: number }).h : 'auto';

  const handles: { key: ResizeHandle; style: React.CSSProperties; cursor: string }[] = [
    { key: 'nw', style: { left: -6, top: -6 }, cursor: 'nwse-resize' },
    { key: 'n', style: { left: '50%', top: -6, marginLeft: -6 }, cursor: 'ns-resize' },
    { key: 'ne', style: { right: -6, top: -6 }, cursor: 'nesw-resize' },
    { key: 'e', style: { right: -6, top: '50%', marginTop: -6 }, cursor: 'ew-resize' },
    { key: 'se', style: { right: -6, bottom: -6 }, cursor: 'nwse-resize' },
    { key: 's', style: { left: '50%', bottom: -6, marginLeft: -6 }, cursor: 'ns-resize' },
    { key: 'sw', style: { left: -6, bottom: -6 }, cursor: 'nesw-resize' },
    { key: 'w', style: { left: -6, top: '50%', marginTop: -6 }, cursor: 'ew-resize' },
  ];

  return (
    <div
      className="absolute pointer-events-none outline outline-2 outline-accent"
      style={{
        left: layer.x,
        top: layer.y,
        width: layer.w,
        height: h,
      }}
    >
      {hasHeight &&
        handles.map(({ key, style, cursor }) => (
          <div
            key={key}
            onPointerDown={(e) => onResizeStart(e, layer as Layer, key)}
            className="absolute w-3 h-3 bg-white border-2 border-accent rounded-sm pointer-events-auto"
            style={{ ...style, cursor }}
          />
        ))}
      {/* Text layers get only E/W handles since height is auto */}
      {!hasHeight &&
        ['e', 'w'].map((k) => {
          const style: React.CSSProperties =
            k === 'e'
              ? { right: -6, top: '50%', marginTop: -6, cursor: 'ew-resize' }
              : { left: -6, top: '50%', marginTop: -6, cursor: 'ew-resize' };
          return (
            <div
              key={k}
              onPointerDown={(e) => onResizeStart(e, layer as Layer, k as ResizeHandle)}
              className="absolute w-3 h-3 bg-white border-2 border-accent rounded-sm pointer-events-auto"
              style={style}
            />
          );
        })}
    </div>
  );
}
