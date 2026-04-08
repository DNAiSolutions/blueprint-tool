// Layer editors — dispatched by layer type from the RightInspector.
// Each editor mutates a single layer via updateLayer. Text content changes
// are pushed through updateLayerNoHistory + commitTransaction at mount so
// typing doesn't explode the history stack.

import { useDesignStore } from '../../store';
import type {
  Layer, SolidLayer, GradientLayer, LiquidGlassLayer, ImageLayer,
  VideoLayer, TextLayer, OverlayGradientLayer, NoiseLayer, VignetteLayer,
  BlendMode,
} from '../../types';
import {
  Field, Row, SectionTitle, ColorInput, NumberInput, SliderInput,
  SelectInput, TextInput, ToggleButtonGroup,
} from './InspectorPrimitives';
import { GOOGLE_FONTS, ensureFontLoaded } from '../../google-fonts';
import { AlignLeft, AlignCenter, AlignRight, Italic, FlipHorizontal, FlipVertical } from 'lucide-react';

interface EditorProps<T extends Layer> {
  cardId: string;
  layer: T;
}

const BLEND_MODES: BlendMode[] = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
  'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion',
];

// ---------- Solid ----------
function SolidEditor({ cardId, layer }: EditorProps<SolidLayer>) {
  const updateLayer = useDesignStore((s) => s.updateLayer);
  return (
    <>
      <SectionTitle>Solid fill</SectionTitle>
      <Field label="Color">
        <ColorInput value={layer.color} onChange={(color) => updateLayer(cardId, layer.id, { color })} />
      </Field>
    </>
  );
}

// ---------- Gradient ----------
function GradientEditor({ cardId, layer }: EditorProps<GradientLayer>) {
  const updateLayer = useDesignStore((s) => s.updateLayer);
  return (
    <>
      <SectionTitle>Gradient</SectionTitle>
      {layer.stops.map((stop, i) => (
        <Field key={i} label={`Stop ${i + 1}`}>
          <ColorInput
            value={stop.color}
            onChange={(color) => {
              const stops = layer.stops.map((s, idx) => (idx === i ? { ...s, color } : s));
              updateLayer(cardId, layer.id, { stops });
            }}
          />
        </Field>
      ))}
      <Field label="Angle">
        <NumberInput
          value={layer.angle}
          onChange={(angle) => updateLayer(cardId, layer.id, { angle })}
          min={0}
          max={360}
          suffix="°"
        />
      </Field>
    </>
  );
}

// ---------- Liquid Glass ----------
function LiquidGlassEditor({ cardId, layer }: EditorProps<LiquidGlassLayer>) {
  const updateLayer = useDesignStore((s) => s.updateLayer);
  return (
    <>
      <SectionTitle>Liquid glass</SectionTitle>
      <Field label="Base color (with alpha)">
        <ColorInput
          value={layer.baseColor}
          onChange={(baseColor) => updateLayer(cardId, layer.id, { baseColor })}
        />
      </Field>
      <Field label={`Blur · ${layer.blur}px`}>
        <SliderInput
          value={layer.blur}
          onChange={(blur) => updateLayer(cardId, layer.id, { blur })}
          min={0}
          max={80}
          step={1}
        />
      </Field>
      <PositionFields cardId={cardId} layer={layer} hasHeight />
    </>
  );
}

// ---------- Image ----------
function ImageEditor({ cardId, layer }: EditorProps<ImageLayer>) {
  const updateLayer = useDesignStore((s) => s.updateLayer);
  return (
    <>
      <SectionTitle>Image</SectionTitle>
      <Field label="URL">
        <TextInput
          value={layer.url}
          onChange={(url) => updateLayer(cardId, layer.id, { url })}
          placeholder="https://…"
        />
      </Field>
      <Field label={`Opacity · ${Math.round(layer.opacity * 100)}%`}>
        <SliderInput
          value={layer.opacity}
          onChange={(opacity) => updateLayer(cardId, layer.id, { opacity })}
        />
      </Field>
      <Field label="Blend mode">
        <SelectInput
          value={layer.blend}
          options={BLEND_MODES.map((m) => ({ value: m, label: m }))}
          onChange={(blend) => updateLayer(cardId, layer.id, { blend })}
        />
      </Field>
      <Field label="Rotation">
        <NumberInput
          value={layer.rotation}
          onChange={(rotation) => updateLayer(cardId, layer.id, { rotation })}
          min={-360}
          max={360}
          suffix="°"
        />
      </Field>
      <Field label="Flip">
        <div className="flex gap-1.5">
          <button
            onClick={() => updateLayer(cardId, layer.id, { flipH: !layer.flipH })}
            className={`flex-1 h-7 text-[11px] rounded border ${layer.flipH ? 'bg-accent text-accent-foreground border-accent' : 'border-border text-muted-foreground hover:text-foreground'}`}
          >
            <FlipHorizontal className="h-3 w-3 inline mr-1" /> H
          </button>
          <button
            onClick={() => updateLayer(cardId, layer.id, { flipV: !layer.flipV })}
            className={`flex-1 h-7 text-[11px] rounded border ${layer.flipV ? 'bg-accent text-accent-foreground border-accent' : 'border-border text-muted-foreground hover:text-foreground'}`}
          >
            <FlipVertical className="h-3 w-3 inline mr-1" /> V
          </button>
        </div>
      </Field>
      <PositionFields cardId={cardId} layer={layer} hasHeight />
    </>
  );
}

// ---------- Video ----------
function VideoEditor({ cardId, layer }: EditorProps<VideoLayer>) {
  const updateLayer = useDesignStore((s) => s.updateLayer);
  return (
    <>
      <SectionTitle>Video</SectionTitle>
      <Field label="URL">
        <TextInput
          value={layer.url}
          onChange={(url) => updateLayer(cardId, layer.id, { url })}
          placeholder="https://…"
        />
      </Field>
      <Field label={`Opacity · ${Math.round(layer.opacity * 100)}%`}>
        <SliderInput
          value={layer.opacity}
          onChange={(opacity) => updateLayer(cardId, layer.id, { opacity })}
        />
      </Field>
      <Row>
        <Field label="Loop">
          <button
            onClick={() => updateLayer(cardId, layer.id, { loop: !layer.loop })}
            className={`w-full h-7 text-[11px] rounded border ${layer.loop ? 'bg-accent text-accent-foreground border-accent' : 'border-border text-muted-foreground'}`}
          >
            {layer.loop ? 'On' : 'Off'}
          </button>
        </Field>
        <Field label="Muted">
          <button
            onClick={() => updateLayer(cardId, layer.id, { muted: !layer.muted })}
            className={`w-full h-7 text-[11px] rounded border ${layer.muted ? 'bg-accent text-accent-foreground border-accent' : 'border-border text-muted-foreground'}`}
          >
            {layer.muted ? 'On' : 'Off'}
          </button>
        </Field>
      </Row>
      <Field label="Playback rate">
        <NumberInput
          value={layer.playbackRate}
          onChange={(playbackRate) => updateLayer(cardId, layer.id, { playbackRate })}
          min={0.25}
          max={4}
          step={0.25}
          suffix="×"
        />
      </Field>
      <PositionFields cardId={cardId} layer={layer} hasHeight />
    </>
  );
}

// ---------- Text ----------
function TextEditor({ cardId, layer }: EditorProps<TextLayer>) {
  const updateLayer = useDesignStore((s) => s.updateLayer);
  return (
    <>
      <SectionTitle>Text</SectionTitle>
      <Field label="Content">
        <TextInput
          value={layer.content}
          onChange={(content) => updateLayer(cardId, layer.id, { content })}
          rows={3}
        />
      </Field>
      <Field label="Font">
        <SelectInput
          value={layer.font}
          options={GOOGLE_FONTS.map((f) => ({ value: f.name, label: f.name }))}
          onChange={(font) => {
            ensureFontLoaded(font);
            updateLayer(cardId, layer.id, { font });
          }}
        />
      </Field>
      <Row>
        <Field label="Size">
          <NumberInput
            value={layer.size}
            onChange={(size) => updateLayer(cardId, layer.id, { size })}
            min={8}
            max={400}
          />
        </Field>
        <Field label="Weight">
          <SelectInput
            value={String(layer.weight)}
            options={[300, 400, 500, 600, 700, 800, 900].map((w) => ({ value: String(w), label: String(w) }))}
            onChange={(w) => updateLayer(cardId, layer.id, { weight: Number(w) })}
          />
        </Field>
      </Row>
      <Field label="Color">
        <ColorInput
          value={layer.color}
          onChange={(color) => updateLayer(cardId, layer.id, { color })}
        />
      </Field>
      <Field label="Alignment">
        <ToggleButtonGroup
          value={layer.align}
          options={[
            { value: 'left', label: 'L', icon: <AlignLeft className="h-3 w-3" /> },
            { value: 'center', label: 'C', icon: <AlignCenter className="h-3 w-3" /> },
            { value: 'right', label: 'R', icon: <AlignRight className="h-3 w-3" /> },
          ]}
          onChange={(align) => updateLayer(cardId, layer.id, { align })}
        />
      </Field>
      <Field label="Style">
        <button
          onClick={() => updateLayer(cardId, layer.id, { italic: !layer.italic })}
          className={`w-full h-7 text-[11px] rounded border flex items-center justify-center gap-1 ${layer.italic ? 'bg-accent text-accent-foreground border-accent' : 'border-border text-muted-foreground'}`}
        >
          <Italic className="h-3 w-3" /> Italic
        </button>
      </Field>
      <Row>
        <Field label="Letter spacing">
          <NumberInput
            value={layer.letterSpacing}
            onChange={(letterSpacing) => updateLayer(cardId, layer.id, { letterSpacing })}
            min={-20}
            max={40}
            step={0.5}
          />
        </Field>
        <Field label="Line height">
          <NumberInput
            value={layer.lineHeight}
            onChange={(lineHeight) => updateLayer(cardId, layer.id, { lineHeight })}
            min={0.5}
            max={3}
            step={0.05}
          />
        </Field>
      </Row>
      <PositionFields cardId={cardId} layer={layer} />
    </>
  );
}

// ---------- Overlay Gradient ----------
function OverlayGradientEditor({ cardId, layer }: EditorProps<OverlayGradientLayer>) {
  const updateLayer = useDesignStore((s) => s.updateLayer);
  return (
    <>
      <SectionTitle>Overlay gradient</SectionTitle>
      <Field label="From">
        <ColorInput value={layer.from} onChange={(from) => updateLayer(cardId, layer.id, { from })} />
      </Field>
      <Field label="To">
        <ColorInput value={layer.to} onChange={(to) => updateLayer(cardId, layer.id, { to })} />
      </Field>
      <Field label="Direction">
        <SelectInput
          value={layer.direction}
          options={[
            { value: 'top', label: 'Top' },
            { value: 'bottom', label: 'Bottom' },
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
            { value: 'radial', label: 'Radial' },
          ]}
          onChange={(direction) => updateLayer(cardId, layer.id, { direction })}
        />
      </Field>
    </>
  );
}

// ---------- Noise ----------
function NoiseEditor({ cardId, layer }: EditorProps<NoiseLayer>) {
  const updateLayer = useDesignStore((s) => s.updateLayer);
  return (
    <>
      <SectionTitle>Noise</SectionTitle>
      <Field label={`Intensity · ${Math.round(layer.intensity * 100)}%`}>
        <SliderInput
          value={layer.intensity}
          onChange={(intensity) => updateLayer(cardId, layer.id, { intensity })}
          min={0}
          max={0.5}
          step={0.01}
        />
      </Field>
    </>
  );
}

// ---------- Vignette ----------
function VignetteEditor({ cardId, layer }: EditorProps<VignetteLayer>) {
  const updateLayer = useDesignStore((s) => s.updateLayer);
  return (
    <>
      <SectionTitle>Vignette</SectionTitle>
      <Field label={`Intensity · ${Math.round(layer.intensity * 100)}%`}>
        <SliderInput
          value={layer.intensity}
          onChange={(intensity) => updateLayer(cardId, layer.id, { intensity })}
          min={0}
          max={1}
          step={0.01}
        />
      </Field>
    </>
  );
}

// ---------- Shared X/Y/W/H fields ----------
function PositionFields({
  cardId,
  layer,
  hasHeight,
}: {
  cardId: string;
  layer: Layer & { x: number; y: number; w: number };
  hasHeight?: boolean;
}) {
  const updateLayer = useDesignStore((s) => s.updateLayer);
  return (
    <>
      <SectionTitle>Position</SectionTitle>
      <Row>
        <Field label="X">
          <NumberInput value={layer.x} onChange={(x) => updateLayer(cardId, layer.id, { x } as Partial<Layer>)} />
        </Field>
        <Field label="Y">
          <NumberInput value={layer.y} onChange={(y) => updateLayer(cardId, layer.id, { y } as Partial<Layer>)} />
        </Field>
      </Row>
      <Row>
        <Field label="W">
          <NumberInput value={layer.w} onChange={(w) => updateLayer(cardId, layer.id, { w } as Partial<Layer>)} />
        </Field>
        {hasHeight && 'h' in layer && (
          <Field label="H">
            <NumberInput
              value={(layer as unknown as { h: number }).h}
              onChange={(h) => updateLayer(cardId, layer.id, { h } as Partial<Layer>)}
            />
          </Field>
        )}
      </Row>
    </>
  );
}

// ---------- Dispatcher ----------
export function LayerEditor({ cardId, layer }: { cardId: string; layer: Layer }) {
  switch (layer.type) {
    case 'solid': return <SolidEditor cardId={cardId} layer={layer} />;
    case 'gradient': return <GradientEditor cardId={cardId} layer={layer} />;
    case 'liquid-glass': return <LiquidGlassEditor cardId={cardId} layer={layer} />;
    case 'image': return <ImageEditor cardId={cardId} layer={layer} />;
    case 'video': return <VideoEditor cardId={cardId} layer={layer} />;
    case 'text': return <TextEditor cardId={cardId} layer={layer} />;
    case 'overlay-gradient': return <OverlayGradientEditor cardId={cardId} layer={layer} />;
    case 'noise': return <NoiseEditor cardId={cardId} layer={layer} />;
    case 'vignette': return <VignetteEditor cardId={cardId} layer={layer} />;
    default: return null;
  }
}
