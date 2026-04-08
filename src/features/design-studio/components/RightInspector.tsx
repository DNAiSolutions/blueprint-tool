// RightInspector — dynamic controls for the selected layer + AI Copilot.
// Copilot sends the selected card's full JSON + the user's instruction to
// the `copilot-edit` edge function (Claude Sonnet 4.5), then applies the
// returned structured patches through the store as a single undo step.

import { useState, useRef, useEffect } from 'react';
import { useDesignStore } from '../store';
import { Button } from '@/components/ui/button';
import {
  Send, Sparkles, MousePointer2, Trash2, Copy, Loader2, CornerDownLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { LayerEditor } from './inspector/LayerEditors';
import { copilotEdit } from '../lib/ai-client';

interface CopilotTurn {
  id: string;
  instruction: string;
  explanation?: string;
  patchCount?: number;
  error?: string;
  patching: boolean;
}

export function RightInspector() {
  const selectedLayerId = useDesignStore((s) => s.selectedLayerId);
  const selectedCardId = useDesignStore((s) => s.selectedCardId);
  const project = useDesignStore((s) => s.project);
  const deleteLayer = useDesignStore((s) => s.deleteLayer);
  const duplicateLayer = useDesignStore((s) => s.duplicateLayer);
  const applyCopilotPatches = useDesignStore((s) => s.applyCopilotPatches);
  const brandKits = useDesignStore((s) => s.brandKits);
  const activeBrandKitId = useDesignStore((s) => s.activeBrandKitId);

  const [copilotInput, setCopilotInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [turns, setTurns] = useState<CopilotTurn[]>([]);
  const turnsEndRef = useRef<HTMLDivElement>(null);

  const selectedCard = project?.cards.find((c) => c.id === selectedCardId);
  const selectedLayer = selectedCard?.layers.find((l) => l.id === selectedLayerId);
  const activeBrandKit = brandKits.find((k) => k.id === activeBrandKitId);

  // Auto-scroll the history to the latest turn.
  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns]);

  const handleCopilotSend = async () => {
    const instruction = copilotInput.trim();
    if (!instruction) return;

    if (!selectedCard || !selectedCardId) {
      toast.error('Select a card first', {
        description: 'Click a card in the canvas or sidebar, then try again.',
      });
      return;
    }

    // Push a pending turn into the history list
    const turnId = `turn-${Date.now()}`;
    setTurns((prev) => [
      ...prev,
      { id: turnId, instruction, patching: true },
    ]);
    setCopilotInput('');
    setIsLoading(true);

    try {
      const result = await copilotEdit({
        instruction,
        card: selectedCard,
        selectedLayerId: selectedLayerId ?? undefined,
        brandColors: activeBrandKit?.colors,
      });

      applyCopilotPatches(selectedCardId, result.patches);

      setTurns((prev) =>
        prev.map((t) =>
          t.id === turnId
            ? {
                ...t,
                patching: false,
                explanation: result.explanation,
                patchCount: result.patches.length,
              }
            : t,
        ),
      );

      if (result.patches.length === 0) {
        toast.message('Copilot had no changes', {
          description: result.explanation || 'Try a more specific instruction.',
        });
      } else {
        toast.success(`Applied ${result.patches.length} change${result.patches.length === 1 ? '' : 's'}`, {
          description: result.explanation,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setTurns((prev) =>
        prev.map((t) => (t.id === turnId ? { ...t, patching: false, error: message } : t)),
      );
      toast.error('Copilot failed', { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl + Enter → send
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleCopilotSend();
    }
  };

  const canSend = !isLoading && copilotInput.trim().length > 0 && !!selectedCardId;

  return (
    <aside className="w-72 shrink-0 border-l border-border bg-card flex flex-col min-h-0">
      {/* Inspector header */}
      <div className="h-10 shrink-0 border-b border-border flex items-center justify-between px-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Inspector
        </span>
        {selectedLayer && selectedCardId && (
          <div className="flex gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              title="Duplicate (Cmd+D)"
              onClick={() => duplicateLayer(selectedCardId, selectedLayer.id)}
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:text-destructive"
              title="Delete (Del)"
              onClick={() => deleteLayer(selectedCardId, selectedLayer.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Dynamic inspector body — flex-1 min-h-0 so the copilot below stays pinned */}
      <div className="flex-1 min-h-0 overflow-auto scrollbar-thin p-3 space-y-1">
        {!selectedLayer || !selectedCardId ? (
          <div className="text-center py-8 px-2">
            <MousePointer2 className="h-5 w-5 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No layer selected</p>
            <p className="text-[11px] text-muted-foreground/60 mt-1">
              Click a layer in the canvas or sidebar to edit it
            </p>
          </div>
        ) : (
          <LayerEditor cardId={selectedCardId} layer={selectedLayer} />
        )}
      </div>

      {/* AI Copilot chat — pinned to bottom of the aside */}
      <div className="shrink-0 border-t border-border flex flex-col max-h-[50%]">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/60">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-accent" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              AI Copilot
            </span>
          </div>
          {turns.length > 0 && (
            <button
              onClick={() => setTurns([])}
              className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground"
              title="Clear history"
            >
              Clear
            </button>
          )}
        </div>

        {/* Conversation history */}
        {turns.length > 0 && (
          <div className="flex-1 min-h-0 overflow-auto scrollbar-thin px-3 py-2 space-y-2">
            {turns.map((turn) => (
              <div key={turn.id} className="space-y-1">
                <div className="flex items-start gap-1.5 text-[11px]">
                  <CornerDownLeft className="h-2.5 w-2.5 mt-0.5 text-muted-foreground/50 shrink-0" />
                  <span className="text-foreground/90">{turn.instruction}</span>
                </div>
                {turn.patching ? (
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70 pl-4">
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    Thinking…
                  </div>
                ) : turn.error ? (
                  <div className="text-[10px] text-destructive pl-4">
                    {turn.error}
                  </div>
                ) : (
                  <div className="pl-4 space-y-0.5">
                    <div className="text-[10px] text-muted-foreground/80 italic">
                      {turn.explanation}
                    </div>
                    {typeof turn.patchCount === 'number' && (
                      <div className="text-[9px] font-mono uppercase tracking-wider text-accent/70">
                        {turn.patchCount} patch{turn.patchCount === 1 ? '' : 'es'} applied
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={turnsEndRef} />
          </div>
        )}

        {/* Input + send */}
        <div className="shrink-0 p-3 space-y-2">
          <textarea
            value={copilotInput}
            onChange={(e) => setCopilotInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={
              selectedCardId
                ? 'e.g. make the headline bigger, add a noise layer, flip the image horizontally'
                : 'Select a card first'
            }
            rows={3}
            className="w-full text-[11px] resize-none bg-[hsl(var(--surface-low))] border border-border rounded-md px-2 py-1.5 focus:border-accent/40 outline-none placeholder:text-muted-foreground/40 disabled:opacity-50"
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="flex-1 h-7 gap-1 text-xs"
              onClick={handleCopilotSend}
              disabled={!canSend}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Send className="h-3 w-3" />
              )}
              {isLoading ? 'Thinking…' : 'Ask Copilot'}
            </Button>
            <span className="text-[9px] text-muted-foreground/50 font-mono">⌘⏎</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
