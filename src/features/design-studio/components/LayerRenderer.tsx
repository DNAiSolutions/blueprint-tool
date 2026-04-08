// LayerRenderer — renders a single Layer inside a Card.
// Positioned layers (image/video/text/liquid-glass) get absolute x/y/w/h boxes.
// Full-coverage layers (solid/gradient/overlay-gradient/noise/vignette) stretch
// edge-to-edge (inset-0).

import type { Layer } from '../types';
import { cn } from '@/lib/utils';

interface LayerRendererProps {
  layer: Layer;
  /** Set when text layer is currently being inline-edited. */
  isEditingText?: boolean;
  /** Called when user types during inline text edit. */
  onTextChange?: (content: string) => void;
  /** Text editor blur handler. */
  onTextBlur?: () => void;
}

export function LayerRenderer({
  layer,
  isEditingText,
  onTextChange,
  onTextBlur,
}: LayerRendererProps) {
  if (!layer.visible) return null;

  switch (layer.type) {
    case 'solid':
      return <div className="absolute inset-0" style={{ backgroundColor: layer.color }} />;

    case 'gradient': {
      const stops = layer.stops.map((s) => `${s.color} ${Math.round(s.position * 100)}%`).join(', ');
      return (
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `linear-gradient(${layer.angle}deg, ${stops})` }}
        />
      );
    }

    case 'overlay-gradient': {
      const dir =
        layer.direction === 'top'
          ? 'to top'
          : layer.direction === 'bottom'
            ? 'to bottom'
            : layer.direction === 'left'
              ? 'to left'
              : layer.direction === 'right'
                ? 'to right'
                : 'circle';
      const bg =
        layer.direction === 'radial'
          ? `radial-gradient(${dir}, ${layer.from}, ${layer.to})`
          : `linear-gradient(${dir}, ${layer.from}, ${layer.to})`;
      return <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: bg }} />;
    }

    case 'noise': {
      // Inline SVG turbulence — consistent across browsers, no asset load.
      const svg = encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${layer.intensity * 2} 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`,
      );
      return (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,${svg}")`,
            opacity: Math.max(0, Math.min(1, layer.intensity * 4)),
          }}
        />
      );
    }

    case 'vignette':
      return (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 ${300 + layer.intensity * 600}px ${200 + layer.intensity * 400}px rgba(0,0,0,${layer.intensity})`,
          }}
        />
      );

    case 'liquid-glass':
      return (
        <div
          className="absolute rounded-[32px] border border-white/15 shadow-[0_30px_120px_rgba(0,0,0,0.35)]"
          style={{
            left: layer.x,
            top: layer.y,
            width: layer.w,
            height: layer.h,
            backgroundColor: layer.baseColor,
            backdropFilter: `blur(${layer.blur}px) saturate(1.2)`,
            WebkitBackdropFilter: `blur(${layer.blur}px) saturate(1.2)`,
          }}
        />
      );

    case 'image':
      return (
        <img
          src={layer.url}
          alt=""
          draggable={false}
          className="absolute object-cover select-none"
          style={{
            left: layer.x,
            top: layer.y,
            width: layer.w,
            height: layer.h,
            transform: `rotate(${layer.rotation}deg) scaleX(${layer.flipH ? -1 : 1}) scaleY(${layer.flipV ? -1 : 1})`,
            opacity: layer.opacity,
            mixBlendMode: layer.blend,
          }}
        />
      );

    case 'video':
      return (
        <video
          src={layer.url}
          autoPlay
          loop={layer.loop}
          muted={layer.muted}
          playsInline
          className="absolute object-cover pointer-events-none"
          style={{
            left: layer.x,
            top: layer.y,
            width: layer.w,
            height: layer.h,
            opacity: layer.opacity,
          }}
        />
      );

    case 'text': {
      const style: React.CSSProperties = {
        left: layer.x,
        top: layer.y,
        width: layer.w,
        fontFamily: `"${layer.font}", sans-serif`,
        fontSize: layer.size,
        fontWeight: layer.weight,
        color: layer.color,
        textAlign: layer.align,
        fontStyle: layer.italic ? 'italic' : 'normal',
        letterSpacing: layer.letterSpacing,
        lineHeight: layer.lineHeight,
        whiteSpace: 'pre-wrap',
      };

      if (isEditingText) {
        return (
          <div
            className={cn('absolute outline outline-2 outline-accent/70 outline-offset-2')}
            style={style}
            contentEditable
            suppressContentEditableWarning
            autoFocus
            onBlur={(e) => {
              onTextChange?.(e.currentTarget.innerText);
              onTextBlur?.();
            }}
            ref={(el) => {
              if (el && document.activeElement !== el) {
                el.focus();
                // Move cursor to end
                const range = document.createRange();
                range.selectNodeContents(el);
                range.collapse(false);
                const sel = window.getSelection();
                sel?.removeAllRanges();
                sel?.addRange(range);
              }
            }}
          >
            {layer.content}
          </div>
        );
      }

      return (
        <div className="absolute select-none" style={style}>
          {layer.content}
        </div>
      );
    }

    default:
      return null;
  }
}

// Helper — does this layer type have x/y positioning?
export function isPositionedLayer(
  layer: Layer,
): layer is Extract<Layer, { x: number; y: number }> {
  return 'x' in layer && 'y' in layer;
}
