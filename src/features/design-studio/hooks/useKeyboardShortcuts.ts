// Keyboard shortcuts for the Design Studio canvas.
// Only active while a project is open. Bails out if the user is typing inside
// an input/textarea/contentEditable so we never hijack form input.

import { useEffect } from 'react';
import { useDesignStore } from '../store';
import type { Layer } from '../types';

const NUDGE = 1;
const NUDGE_BIG = 10;

function isEditingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditingTarget(e.target)) return;

      const state = useDesignStore.getState();
      const { project, selectedCardId, selectedLayerId } = state;
      if (!project) return;

      const meta = e.metaKey || e.ctrlKey;

      // Undo / Redo
      if (meta && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) state.redo();
        else state.undo();
        return;
      }

      // Duplicate
      if (meta && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedCardId && selectedLayerId) {
          state.duplicateLayer(selectedCardId, selectedLayerId);
        } else if (selectedCardId) {
          state.duplicateCard(selectedCardId);
        }
        return;
      }

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedCardId && selectedLayerId) {
          e.preventDefault();
          state.deleteLayer(selectedCardId, selectedLayerId);
        }
        return;
      }

      // Arrow nudge
      if (e.key.startsWith('Arrow') && selectedCardId && selectedLayerId) {
        const card = project.cards.find((c) => c.id === selectedCardId);
        const layer = card?.layers.find((l) => l.id === selectedLayerId);
        if (!layer || !('x' in layer && 'y' in layer)) return;

        e.preventDefault();
        const step = e.shiftKey ? NUDGE_BIG : NUDGE;
        const positioned = layer as Layer & { x: number; y: number };
        const next = { x: positioned.x, y: positioned.y };
        if (e.key === 'ArrowLeft') next.x -= step;
        if (e.key === 'ArrowRight') next.x += step;
        if (e.key === 'ArrowUp') next.y -= step;
        if (e.key === 'ArrowDown') next.y += step;

        state.updateLayer(selectedCardId, selectedLayerId, next as Partial<Layer>);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
