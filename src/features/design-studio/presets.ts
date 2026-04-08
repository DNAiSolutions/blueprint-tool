// One-click effect presets for the Effects panel. Each preset returns an
// array of layers that will be added to the selected card on top of its
// existing stack.

import type { Card, Layer } from './types';
import {
  createGradientLayer, createLiquidGlassLayer, createNoiseLayer,
  createOverlayGradientLayer, createVignetteLayer,
} from './layer-factories';

export interface EffectPreset {
  id: string;
  name: string;
  description: string;
  category: 'gradients' | 'glass' | 'texture' | 'cinematic';
  build: (card: Card) => Layer[];
}

export const EFFECT_PRESETS: EffectPreset[] = [
  // ---------- Gradients ----------
  {
    id: 'bottom-fade',
    name: 'Bottom fade',
    description: 'Darken the bottom for legible headlines',
    category: 'gradients',
    build: () => [createOverlayGradientLayer('bottom', 'rgba(0,0,0,0)', 'rgba(10,10,10,0.85)')],
  },
  {
    id: 'top-fade',
    name: 'Top fade',
    description: 'Darken the top third',
    category: 'gradients',
    build: () => [createOverlayGradientLayer('top', 'rgba(0,0,0,0)', 'rgba(10,10,10,0.7)')],
  },
  {
    id: 'radial-spot',
    name: 'Radial spotlight',
    description: 'Focus attention on the center',
    category: 'gradients',
    build: () => [createOverlayGradientLayer('radial', 'rgba(255,255,255,0.15)', 'rgba(0,0,0,0.65)')],
  },
  {
    id: 'brand-gradient-bg',
    name: 'Brand gradient',
    description: 'Red → deep red 180° background',
    category: 'gradients',
    build: () => [createGradientLayer('#E51636', '#B0122B', 180)],
  },

  // ---------- Glass ----------
  {
    id: 'liquid-glass-card',
    name: 'Liquid glass card',
    description: 'iOS-style blurred panel',
    category: 'glass',
    build: (card) => [createLiquidGlassLayer(card)],
  },
  {
    id: 'glass-stack',
    name: 'Glass + bottom fade',
    description: 'Glass panel over a bottom vignette',
    category: 'glass',
    build: (card) => [
      createOverlayGradientLayer('bottom', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.65)'),
      createLiquidGlassLayer(card),
    ],
  },

  // ---------- Texture ----------
  {
    id: 'film-noise',
    name: 'Film noise',
    description: 'Analog film grain',
    category: 'texture',
    build: () => [createNoiseLayer(0.12)],
  },
  {
    id: 'heavy-grain',
    name: 'Heavy grain',
    description: 'Pronounced texture for posters',
    category: 'texture',
    build: () => [createNoiseLayer(0.22)],
  },

  // ---------- Cinematic ----------
  {
    id: 'cinematic-vignette',
    name: 'Cinematic vignette',
    description: 'Strong darkening toward edges',
    category: 'cinematic',
    build: () => [createVignetteLayer(0.55)],
  },
  {
    id: 'subtle-vignette',
    name: 'Subtle vignette',
    description: 'Light darkening for depth',
    category: 'cinematic',
    build: () => [createVignetteLayer(0.3)],
  },
  {
    id: 'film-look',
    name: 'Full film look',
    description: 'Vignette + grain + bottom fade',
    category: 'cinematic',
    build: () => [
      createOverlayGradientLayer('bottom', 'rgba(0,0,0,0)', 'rgba(10,10,10,0.55)'),
      createNoiseLayer(0.1),
      createVignetteLayer(0.45),
    ],
  },
];
