// RightInspector — dynamic controls for the selected layer + AI Copilot chat.
// Routes to a LayerEditor based on the layer's type. When nothing is
// selected, shows a hint. Copilot is wired to a console log + toast until
// Phase 2 ships the Claude integration.

import { useState } from 'react';
import { useDesignStore } from '../store';
import { Button } from '@/components/ui/button';
import { Send, Sparkles, MousePointer2, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { LayerEditor } from './inspector/LayerEditors';

export function RightInspector() {
  const selectedLayerId = useDesignStore((s) => s.selectedLayerId);
  const selectedCardId = useDesignStore((s) => s.selectedCardId);
  const project = useDesignStore((s) => s.project);
  const deleteLayer = useDesignStore((s) => s.deleteLayer);
  const duplicateLayer = useDesignStore((s) => s.duplicateLayer);
  const [copilotInput, setCopilotInput] = useState('');

  const selectedCard = project?.cards.find((c) => c.id === selectedCardId);
  const selectedLayer = selectedCard?.layers.find((l) => l.id === selectedLayerId);

  const handleCopilotSend = () => {
    if (!copilotInput.trim()) return;
    // Phase 2 — wire to Claude
    // eslint-disable-next-line no-console
    console.log('[DesignCopilot]', copilotInput);
    toast.message('Copilot coming in Phase 2', {
      description: 'Your prompt was logged to the console.',
    });
    setCopilotInput('');
  };

  return (
    <aside className="w-72 shrink-0 border-l border-border bg-card flex flex-col">
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

      {/* Dynamic inspector body */}
      <div className="flex-1 overflow-auto scrollbar-thin p-3 space-y-1">
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

      {/* AI Copilot chat */}
      <div className="shrink-0 border-t border-border p-3 space-y-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-accent" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            AI Copilot
          </span>
        </div>
        <textarea
          value={copilotInput}
          onChange={(e) => setCopilotInput(e.target.value)}
          placeholder="e.g. add gradient from bottom, flip image horizontally, move text up 40px"
          rows={3}
          className="w-full text-[11px] resize-none bg-[hsl(var(--surface-low))] border border-border rounded-md px-2 py-1.5 focus:border-accent/40 outline-none placeholder:text-muted-foreground/40"
        />
        <Button size="sm" className="w-full h-7 gap-1 text-xs" onClick={handleCopilotSend}>
          <Send className="h-3 w-3" /> Send
        </Button>
      </div>
    </aside>
  );
}
