// Design Studio — type definitions
// All layer types for the canvas system

export type LayerType =
  | 'solid'
  | 'gradient'
  | 'liquid-glass'
  | 'image'
  | 'video'
  | 'text'
  | 'overlay-gradient'
  | 'noise'
  | 'vignette';

export type BlendMode =
  | 'normal' | 'multiply' | 'screen' | 'overlay'
  | 'darken' | 'lighten' | 'color-dodge' | 'color-burn'
  | 'hard-light' | 'soft-light' | 'difference' | 'exclusion';

export type GradientStop = { color: string; position: number };

export type SolidLayer = {
  id: string;
  type: 'solid';
  color: string;
  visible: boolean;
  locked: boolean;
};

export type GradientLayer = {
  id: string;
  type: 'gradient';
  stops: GradientStop[];
  angle: number;
  visible: boolean;
  locked: boolean;
};

export type LiquidGlassLayer = {
  id: string;
  type: 'liquid-glass';
  baseColor: string;
  blur: number;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
  locked: boolean;
};

export type ImageLayer = {
  id: string;
  type: 'image';
  url: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  opacity: number;
  blend: BlendMode;
  visible: boolean;
  locked: boolean;
};

export type VideoLayer = {
  id: string;
  type: 'video';
  url: string;
  x: number;
  y: number;
  w: number;
  h: number;
  loop: boolean;
  muted: boolean;
  opacity: number;
  playbackRate: number;
  visible: boolean;
  locked: boolean;
};

export type TextLayer = {
  id: string;
  type: 'text';
  content: string;
  font: string;
  size: number;
  weight: number;
  color: string;
  align: 'left' | 'center' | 'right';
  italic: boolean;
  x: number;
  y: number;
  w: number;
  letterSpacing: number;
  lineHeight: number;
  visible: boolean;
  locked: boolean;
};

export type OverlayGradientLayer = {
  id: string;
  type: 'overlay-gradient';
  from: string;
  to: string;
  direction: 'top' | 'bottom' | 'left' | 'right' | 'radial';
  visible: boolean;
  locked: boolean;
};

export type NoiseLayer = {
  id: string;
  type: 'noise';
  intensity: number;
  visible: boolean;
  locked: boolean;
};

export type VignetteLayer = {
  id: string;
  type: 'vignette';
  intensity: number;
  visible: boolean;
  locked: boolean;
};

export type Layer =
  | SolidLayer
  | GradientLayer
  | LiquidGlassLayer
  | ImageLayer
  | VideoLayer
  | TextLayer
  | OverlayGradientLayer
  | NoiseLayer
  | VignetteLayer;

export type CardFormat = 'feed-square' | 'story' | 'portrait' | 'linkedin-wide';

export type Card = {
  id: string;
  name: string;
  format: CardFormat;
  width: number;
  height: number;
  background: SolidLayer | GradientLayer;
  layers: Layer[];
};

export type DesignLayout = 'single' | 'grid-3x2' | 'grid-2x1' | 'carousel';

export type BrandKit = {
  id: string;
  clientId: string | null;
  name: string;
  colors: Record<string, string>;
  fonts: { display: string; body: string };
  logos: string[];
  isDefault?: boolean;
};

export type DesignProject = {
  id: string;
  projectId: string | null;
  name: string;
  brandKitId: string | null;
  layout: DesignLayout;
  cards: Card[];
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export const CARD_DIMENSIONS: Record<CardFormat, { w: number; h: number }> = {
  'feed-square': { w: 1080, h: 1080 },
  'story': { w: 1080, h: 1920 },
  'portrait': { w: 1080, h: 1350 },
  'linkedin-wide': { w: 1200, h: 628 },
};
