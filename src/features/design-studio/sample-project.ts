// Sample CFA LaPlace project — used by the "Load sample project" button so the
// Design Studio has real content to explore before the user creates anything.

import type { Card, DesignProject, Layer, SolidLayer, GradientLayer } from './types';
import { CARD_DIMENSIONS } from './types';

function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function makeBg(color: string): SolidLayer {
  return { id: id('bg'), type: 'solid', color, visible: true, locked: true };
}

function makeGradientBg(from: string, to: string, angle = 180): GradientLayer {
  return {
    id: id('bg'),
    type: 'gradient',
    stops: [
      { color: from, position: 0 },
      { color: to, position: 1 },
    ],
    angle,
    visible: true,
    locked: true,
  };
}

// ---------- CARD 1: Opening hook ----------
function card1(): Card {
  const { w, h } = CARD_DIMENSIONS['feed-square'];
  const layers: Layer[] = [
    // Full-bleed deep red gradient overlay
    {
      id: id('ovg'),
      type: 'overlay-gradient',
      from: 'rgba(10,10,10,0.00)',
      to: 'rgba(10,10,10,0.85)',
      direction: 'bottom',
      visible: true,
      locked: false,
    },
    // Headline
    {
      id: id('text'),
      type: 'text',
      content: 'NEW STORE\nNOW OPEN',
      font: 'Playfair Display',
      size: 132,
      weight: 900,
      color: '#F5F1E8',
      align: 'left',
      italic: false,
      x: 72,
      y: 640,
      w: 940,
      letterSpacing: -2,
      lineHeight: 1.0,
      visible: true,
      locked: false,
    },
    // Subhead
    {
      id: id('text'),
      type: 'text',
      content: 'Chick-fil-A LaPlace · Airline Hwy',
      font: 'Inter',
      size: 34,
      weight: 500,
      color: '#F5F1E8',
      align: 'left',
      italic: false,
      x: 72,
      y: 920,
      w: 940,
      letterSpacing: 0,
      lineHeight: 1.2,
      visible: true,
      locked: false,
    },
    // Subtle noise for texture
    { id: id('noise'), type: 'noise', intensity: 0.06, visible: true, locked: false },
    // Vignette for depth
    { id: id('vig'), type: 'vignette', intensity: 0.35, visible: true, locked: false },
  ];

  return {
    id: id('card'),
    name: 'Hook',
    format: 'feed-square',
    width: w,
    height: h,
    background: makeGradientBg('#B0122B', '#E51636', 200),
    layers,
  };
}

// ---------- CARD 2: Middle — liquid glass callout ----------
function card2(): Card {
  const { w, h } = CARD_DIMENSIONS['feed-square'];
  const layers: Layer[] = [
    // Liquid glass panel in the center
    {
      id: id('glass'),
      type: 'liquid-glass',
      baseColor: 'rgba(255,255,255,0.12)',
      blur: 24,
      x: 90,
      y: 340,
      w: 900,
      h: 400,
      visible: true,
      locked: false,
    },
    // Big number
    {
      id: id('text'),
      type: 'text',
      content: '4.9★',
      font: 'Playfair Display',
      size: 220,
      weight: 900,
      color: '#F5F1E8',
      align: 'center',
      italic: false,
      x: 90,
      y: 380,
      w: 900,
      letterSpacing: -4,
      lineHeight: 1.0,
      visible: true,
      locked: false,
    },
    // Sub line
    {
      id: id('text'),
      type: 'text',
      content: 'From 1,200+ guests',
      font: 'Inter',
      size: 36,
      weight: 500,
      color: 'rgba(245,241,232,0.85)',
      align: 'center',
      italic: false,
      x: 90,
      y: 640,
      w: 900,
      letterSpacing: 0,
      lineHeight: 1.2,
      visible: true,
      locked: false,
    },
    { id: id('noise'), type: 'noise', intensity: 0.05, visible: true, locked: false },
  ];

  return {
    id: id('card'),
    name: 'Proof',
    format: 'feed-square',
    width: w,
    height: h,
    background: makeGradientBg('#1A1A1A', '#B0122B', 170),
    layers,
  };
}

// ---------- CARD 3: Closing CTA ----------
function card3(): Card {
  const { w, h } = CARD_DIMENSIONS['feed-square'];
  const layers: Layer[] = [
    // Top wordmark
    {
      id: id('text'),
      type: 'text',
      content: 'VISIT US TODAY',
      font: 'Inter',
      size: 42,
      weight: 700,
      color: '#E51636',
      align: 'center',
      italic: false,
      x: 90,
      y: 140,
      w: 900,
      letterSpacing: 6,
      lineHeight: 1,
      visible: true,
      locked: false,
    },
    // Big headline
    {
      id: id('text'),
      type: 'text',
      content: 'Airline Hwy\n& I-10',
      font: 'Playfair Display',
      size: 150,
      weight: 900,
      color: '#1A1A1A',
      align: 'center',
      italic: false,
      x: 90,
      y: 360,
      w: 900,
      letterSpacing: -3,
      lineHeight: 1.05,
      visible: true,
      locked: false,
    },
    // Hours
    {
      id: id('text'),
      type: 'text',
      content: 'Mon–Sat · 6:30AM – 10PM',
      font: 'Inter',
      size: 34,
      weight: 500,
      color: '#1A1A1A',
      align: 'center',
      italic: false,
      x: 90,
      y: 800,
      w: 900,
      letterSpacing: 0,
      lineHeight: 1.2,
      visible: true,
      locked: false,
    },
    { id: id('vig'), type: 'vignette', intensity: 0.25, visible: true, locked: false },
  ];

  return {
    id: id('card'),
    name: 'CTA',
    format: 'feed-square',
    width: w,
    height: h,
    background: makeBg('#F5F1E8'),
    layers,
  };
}

export function buildSampleProject(): DesignProject {
  const now = new Date().toISOString();
  return {
    id: `sample-${Date.now()}`,
    projectId: null,
    name: 'CFA LaPlace · Grand Opening',
    brandKitId: 'cfa-laplace',
    layout: 'carousel',
    cards: [card1(), card2(), card3()],
    createdAt: now,
    updatedAt: now,
  };
}
