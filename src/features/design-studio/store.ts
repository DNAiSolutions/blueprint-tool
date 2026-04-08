// Design Studio — Zustand store
// Scoped to the Design Studio feature. Do not import into global state.

import { create } from 'zustand';
import type { DesignProject, Card, Layer, BrandKit } from './types';

const MAX_HISTORY = 50;

interface DesignStudioState {
  // ---------- CURRENT PROJECT ----------
  project: DesignProject | null;
  setProject: (project: DesignProject | null) => void;

  // ---------- SELECTION ----------
  selectedCardId: string | null;
  selectedLayerId: string | null;
  selectCard: (id: string | null) => void;
  selectLayer: (cardId: string, layerId: string | null) => void;

  // ---------- VIEWPORT ----------
  zoom: number;
  panX: number;
  panY: number;
  setZoom: (z: number) => void;
  setPan: (x: number, y: number) => void;
  resetView: () => void;

  // ---------- SIDEBAR TAB ----------
  sidebarTab: 'layers' | 'assets' | 'brand' | 'fonts' | 'effects';
  setSidebarTab: (tab: 'layers' | 'assets' | 'brand' | 'fonts' | 'effects') => void;

  // ---------- BRAND KITS ----------
  brandKits: BrandKit[];
  activeBrandKitId: string | null;
  setBrandKits: (kits: BrandKit[]) => void;
  setActiveBrandKit: (id: string | null) => void;

  // ---------- CARD / LAYER MUTATIONS ----------
  addCard: (card: Card) => void;
  updateCard: (cardId: string, updates: Partial<Card>) => void;
  deleteCard: (cardId: string) => void;
  duplicateCard: (cardId: string) => void;

  addLayer: (cardId: string, layer: Layer) => void;
  updateLayer: (cardId: string, layerId: string, updates: Partial<Layer>) => void;
  updateLayerNoHistory: (cardId: string, layerId: string, updates: Partial<Layer>) => void;
  duplicateLayer: (cardId: string, layerId: string) => void;
  deleteLayer: (cardId: string, layerId: string) => void;
  reorderLayers: (cardId: string, fromIdx: number, toIdx: number) => void;
  toggleLayerVisibility: (cardId: string, layerId: string) => void;
  toggleLayerLock: (cardId: string, layerId: string) => void;
  commitTransaction: () => void;

  // ---------- HISTORY ----------
  history: DesignProject[];
  historyIndex: number;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // ---------- RESET ----------
  reset: () => void;
}

const initialState = {
  project: null,
  selectedCardId: null,
  selectedLayerId: null,
  zoom: 0.35,
  panX: 0,
  panY: 0,
  sidebarTab: 'layers' as const,
  brandKits: [],
  activeBrandKitId: null,
  history: [],
  historyIndex: -1,
};

export const useDesignStore = create<DesignStudioState>((set, get) => ({
  ...initialState,

  setProject: (project) =>
    set({
      project,
      history: project ? [project] : [],
      historyIndex: project ? 0 : -1,
      // Auto-select first card on open so the Layers panel has something to show
      selectedCardId: project?.cards[0]?.id ?? null,
      selectedLayerId: null,
    }),
  selectCard: (id) => set({ selectedCardId: id, selectedLayerId: null }),
  selectLayer: (cardId, layerId) => set({ selectedCardId: cardId, selectedLayerId: layerId }),

  setZoom: (z) => set({ zoom: Math.max(0.1, Math.min(2, z)) }),
  setPan: (x, y) => set({ panX: x, panY: y }),
  resetView: () => set({ zoom: 0.35, panX: 0, panY: 0 }),

  setSidebarTab: (tab) => set({ sidebarTab: tab }),

  setBrandKits: (kits) => set({ brandKits: kits }),
  setActiveBrandKit: (id) => set({ activeBrandKitId: id }),

  addCard: (card) => {
    const { project, pushHistory } = get();
    if (!project) return;
    pushHistory();
    set({ project: { ...project, cards: [...project.cards, card], updatedAt: new Date().toISOString() } });
  },

  updateCard: (cardId, updates) => {
    const { project, pushHistory } = get();
    if (!project) return;
    pushHistory();
    set({
      project: {
        ...project,
        cards: project.cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  deleteCard: (cardId) => {
    const { project, pushHistory } = get();
    if (!project) return;
    pushHistory();
    set({
      project: { ...project, cards: project.cards.filter((c) => c.id !== cardId), updatedAt: new Date().toISOString() },
      selectedCardId: null,
      selectedLayerId: null,
    });
  },

  duplicateCard: (cardId) => {
    const { project, pushHistory } = get();
    if (!project) return;
    const card = project.cards.find((c) => c.id === cardId);
    if (!card) return;
    pushHistory();
    const newCard: Card = { ...card, id: `card-${Date.now()}`, name: `${card.name} Copy` };
    set({ project: { ...project, cards: [...project.cards, newCard], updatedAt: new Date().toISOString() } });
  },

  addLayer: (cardId, layer) => {
    const { project, pushHistory } = get();
    if (!project) return;
    pushHistory();
    set({
      project: {
        ...project,
        cards: project.cards.map((c) => (c.id === cardId ? { ...c, layers: [...c.layers, layer] } : c)),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  updateLayer: (cardId, layerId, updates) => {
    const { project, pushHistory } = get();
    if (!project) return;
    pushHistory();
    set({
      project: {
        ...project,
        cards: project.cards.map((c) =>
          c.id === cardId
            ? { ...c, layers: c.layers.map((l) => (l.id === layerId ? ({ ...l, ...updates } as Layer) : l)) }
            : c,
        ),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  // Called every frame during drag/resize — does NOT push history. Pair with
  // commitTransaction() on pointer down to snapshot the starting state.
  updateLayerNoHistory: (cardId, layerId, updates) => {
    const { project } = get();
    if (!project) return;
    set({
      project: {
        ...project,
        cards: project.cards.map((c) =>
          c.id === cardId
            ? { ...c, layers: c.layers.map((l) => (l.id === layerId ? ({ ...l, ...updates } as Layer) : l)) }
            : c,
        ),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  duplicateLayer: (cardId, layerId) => {
    const { project, pushHistory } = get();
    if (!project) return;
    const card = project.cards.find((c) => c.id === cardId);
    const layer = card?.layers.find((l) => l.id === layerId);
    if (!card || !layer) return;
    pushHistory();
    const dup: Layer = JSON.parse(JSON.stringify(layer));
    // Offset positioned layers slightly so the copy is visible
    if ('x' in dup && 'y' in dup) {
      (dup as unknown as { x: number; y: number }).x += 40;
      (dup as unknown as { x: number; y: number }).y += 40;
    }
    (dup as { id: string }).id = `layer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set({
      project: {
        ...project,
        cards: project.cards.map((c) =>
          c.id === cardId ? { ...c, layers: [...c.layers, dup] } : c,
        ),
        updatedAt: new Date().toISOString(),
      },
      selectedLayerId: (dup as { id: string }).id,
    });
  },

  // Snapshot current state to history. Call on pointer-down before a drag.
  commitTransaction: () => {
    const { pushHistory } = get();
    pushHistory();
  },

  deleteLayer: (cardId, layerId) => {
    const { project, pushHistory } = get();
    if (!project) return;
    pushHistory();
    set({
      project: {
        ...project,
        cards: project.cards.map((c) =>
          c.id === cardId ? { ...c, layers: c.layers.filter((l) => l.id !== layerId) } : c,
        ),
        updatedAt: new Date().toISOString(),
      },
      selectedLayerId: null,
    });
  },

  reorderLayers: (cardId, fromIdx, toIdx) => {
    const { project, pushHistory } = get();
    if (!project) return;
    pushHistory();
    set({
      project: {
        ...project,
        cards: project.cards.map((c) => {
          if (c.id !== cardId) return c;
          const next = [...c.layers];
          const [moved] = next.splice(fromIdx, 1);
          next.splice(toIdx, 0, moved);
          return { ...c, layers: next };
        }),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  toggleLayerVisibility: (cardId, layerId) => {
    const { project } = get();
    if (!project) return;
    set({
      project: {
        ...project,
        cards: project.cards.map((c) =>
          c.id === cardId
            ? { ...c, layers: c.layers.map((l) => (l.id === layerId ? ({ ...l, visible: !l.visible } as Layer) : l)) }
            : c,
        ),
      },
    });
  },

  toggleLayerLock: (cardId, layerId) => {
    const { project } = get();
    if (!project) return;
    set({
      project: {
        ...project,
        cards: project.cards.map((c) =>
          c.id === cardId
            ? { ...c, layers: c.layers.map((l) => (l.id === layerId ? ({ ...l, locked: !l.locked } as Layer) : l)) }
            : c,
        ),
      },
    });
  },

  // ---------- HISTORY ----------
  pushHistory: () => {
    const { project, history, historyIndex } = get();
    if (!project) return;
    // Drop future states if we branched from the middle of history
    const trimmed = history.slice(0, historyIndex + 1);
    const next = [...trimmed, JSON.parse(JSON.stringify(project))];
    if (next.length > MAX_HISTORY) next.shift();
    set({ history: next, historyIndex: next.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    set({ project: JSON.parse(JSON.stringify(prev)), historyIndex: historyIndex - 1 });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    set({ project: JSON.parse(JSON.stringify(next)), historyIndex: historyIndex + 1 });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },

  reset: () => set(initialState),
}));
