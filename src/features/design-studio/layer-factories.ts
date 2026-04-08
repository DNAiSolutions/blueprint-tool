// Layer factories — build sensible defaults for each layer type.
// Used by panels (Assets, Brand, Effects) to add new layers without each one
// having to know every field a layer requires.

import type {
  Layer, SolidLayer, GradientLayer, LiquidGlassLayer, ImageLayer,
  VideoLayer, TextLayer, OverlayGradientLayer, NoiseLayer, VignetteLayer,
  Card,
} from './types';

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Center a w×h box inside the card. */
function center(card: Card, w: number, h: number): { x: number; y: number } {
  return { x: Math.round((card.width - w) / 2), y: Math.round((card.height - h) / 2) };
}

export function createSolidLayer(color = '#E51636'): SolidLayer {
  return { id: id('solid'), type: 'solid', color, visible: true, locked: false };
}

export function createGradientLayer(
  from = '#E51636',
  to = '#B0122B',
  angle = 180,
): GradientLayer {
  return {
    id: id('grad'),
    type: 'gradient',
    stops: [
      { color: from, position: 0 },
      { color: to, position: 1 },
    ],
    angle,
    visible: true,
    locked: false,
  };
}

export function createLiquidGlassLayer(card: Card): LiquidGlassLayer {
  const w = Math.min(card.width * 0.8, 800);
  const h = Math.min(card.height * 0.35, 400);
  const pos = center(card, w, h);
  return {
    id: id('glass'),
    type: 'liquid-glass',
    baseColor: 'rgba(255,255,255,0.12)',
    blur: 24,
    x: pos.x,
    y: pos.y,
    w,
    h,
    visible: true,
    locked: false,
  };
}

export function createImageLayer(url: string, card: Card): ImageLayer {
  // Default to filling the card — user can drag handles to resize/crop
  return {
    id: id('img'),
    type: 'image',
    url,
    x: 0,
    y: 0,
    w: card.width,
    h: card.height,
    rotation: 0,
    flipH: false,
    flipV: false,
    opacity: 1,
    blend: 'normal',
    visible: true,
    locked: false,
  };
}

export function createVideoLayer(url: string, card: Card): VideoLayer {
  return {
    id: id('vid'),
    type: 'video',
    url,
    x: 0,
    y: 0,
    w: card.width,
    h: card.height,
    loop: true,
    muted: true,
    opacity: 1,
    playbackRate: 1,
    visible: true,
    locked: false,
  };
}

export function createTextLayer(
  card: Card,
  content = 'Add your text',
  overrides: Partial<TextLayer> = {},
): TextLayer {
  const w = Math.min(card.width * 0.85, 900);
  return {
    id: id('text'),
    type: 'text',
    content,
    font: 'Inter',
    size: 64,
    weight: 700,
    color: '#1A1A1A',
    align: 'left',
    italic: false,
    x: Math.round((card.width - w) / 2),
    y: Math.round(card.height / 2 - 40),
    w,
    letterSpacing: 0,
    lineHeight: 1.1,
    visible: true,
    locked: false,
    ...overrides,
  };
}

export function createOverlayGradientLayer(
  direction: OverlayGradientLayer['direction'] = 'bottom',
  from = 'rgba(0,0,0,0)',
  to = 'rgba(0,0,0,0.8)',
): OverlayGradientLayer {
  return {
    id: id('ovg'),
    type: 'overlay-gradient',
    from,
    to,
    direction,
    visible: true,
    locked: false,
  };
}

export function createNoiseLayer(intensity = 0.1): NoiseLayer {
  return { id: id('noise'), type: 'noise', intensity, visible: true, locked: false };
}

export function createVignetteLayer(intensity = 0.4): VignetteLayer {
  return { id: id('vig'), type: 'vignette', intensity, visible: true, locked: false };
}

export type AnyLayer = Layer;
