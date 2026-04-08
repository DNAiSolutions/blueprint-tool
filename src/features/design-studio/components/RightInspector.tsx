import { useDesignStore } from '../store';
import { Button } from '@/components/ui/button';
import { Send, Sparkles, MousePointer2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function RightInspector() {
  const selectedLayerId = useDesignStore((s) => s.selectedLayerId);
  const project = useDesignStore((s) => s.project);
  const selectedCardId = useDesignStore((s) => s.selectedCardId);
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
      <div className="h-10 shrink-0 border-b border-border flex items-center px-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Inspector</span>
      </div>

      {/* Dynamic inspector body */}
      <div className="flex-1 overflow-auto scrollbar-thin p-3">
        {!selectedLayer ? (
          <div className="text-center py-8 px-2">
            <MousePointer2 className="h-5 w-5 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No layer selected</p>
            <p className="text-[11px] text-muted-foreground/60 mt-1">Click a layer in the canvas or sidebar to edit it</p>
          </div>
        ) : (
          <div className="text-center py-8 px-2">
            <p className="text-[11px] font-semibold text-accent">{selectedLayer.type}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Layer editor coming in Commit 2</p>
          </div>
        )}
      </div>

      {/* AI Copilot chat */}
      <div className="shrink-0 border-t border-border p-3 space-y-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-accent" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">AI Copilot</span>
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
