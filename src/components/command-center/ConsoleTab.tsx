import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Send, Zap, ChevronRight, CornerDownLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { agents, getAgentBgClass } from './mockData';
import { useAgentOrchestration } from '@/hooks/useAgentOrchestration';
import type { Json } from '@/integrations/supabase/types';

interface ConsoleEntry {
  type: 'command' | 'response' | 'system';
  text: string;
  timestamp: string;
}

const QUICK_DISPATCH = [
  { label: 'Run Daily Briefing', agentId: 'ceo', taskType: 'daily_briefing' },
  { label: 'Check Client Health', agentId: 'ops-monitor', taskType: 'health_check' },
  { label: 'Generate Content Batch', agentId: 'content', taskType: 'batch_content' },
  { label: 'Sync GHL Pipeline', agentId: 'ceo', taskType: 'sync_pipeline' },
];

function now() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function ConsoleTab() {
  const [input, setInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('auto');
  const [history, setHistory] = useState<ConsoleEntry[]>([
    { type: 'system', text: 'DNAi Command IDE v1.0 — Connected. Ready for dispatch.', timestamp: now() },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { dispatchTask, isDispatching } = useAgentOrchestration();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const addEntry = (entry: ConsoleEntry) => {
    setHistory(prev => [...prev, entry]);
  };

  const resolveAgent = (text: string): string => {
    if (selectedAgent !== 'auto') return selectedAgent;
    const lower = text.toLowerCase();
    if (lower.includes('content') || lower.includes('script') || lower.includes('reel')) return 'content';
    if (lower.includes('lead') || lower.includes('prospect') || lower.includes('outreach')) return 'sales';
    if (lower.includes('design') || lower.includes('carousel') || lower.includes('brand')) return 'design';
    if (lower.includes('website') || lower.includes('deploy') || lower.includes('build')) return 'website-builder';
    if (lower.includes('social') || lower.includes('schedule') || lower.includes('post')) return 'social';
    if (lower.includes('health') || lower.includes('ops') || lower.includes('onboard')) return 'ops-monitor';
    return 'ceo';
  };

  const handleDispatch = async (agentId: string, taskType: string, displayText: string) => {
    addEntry({ type: 'command', text: displayText, timestamp: now() });

    try {
      const result = await dispatchTask(agentId, taskType, { command: displayText } as unknown as Json);
      addEntry({
        type: 'response',
        text: `Task dispatched successfully.\n  Agent: ${result.agent_id}\n  Type: ${result.task_type}\n  ID: ${result.taskId}\n  Status: ${result.status}`,
        timestamp: now(),
      });
    } catch {
      addEntry({
        type: 'response',
        text: `[mock] Command received by ${agentId}. Task type: ${taskType}\n  (Supabase dispatch failed — showing mock confirmation)`,
        timestamp: now(),
      });
    }
  };

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const agentId = resolveAgent(trimmed);
    const taskType = trimmed.length > 40 ? 'general_command' : trimmed.toLowerCase().replace(/\s+/g, '_');

    handleDispatch(agentId, taskType, trimmed);
    setInput('');
  };

  const handleQuickDispatch = (cmd: typeof QUICK_DISPATCH[number]) => {
    handleDispatch(cmd.agentId, cmd.taskType, cmd.label);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Quick Dispatch */}
      <div className="px-4 pt-3 pb-2 border-b border-[hsl(var(--ghost-border)/0.15)]">
        <div className="ai-label mb-2">Quick Dispatch</div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_DISPATCH.map((cmd, i) => (
            <button
              key={i}
              onClick={() => handleQuickDispatch(cmd)}
              disabled={isDispatching}
              className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[hsl(var(--surface-high))] hover:bg-[hsl(var(--surface-bright))] border border-[hsl(var(--ghost-border)/0.1)] hover:border-accent/30 transition-all text-[11px] disabled:opacity-50"
            >
              <Zap className="h-2.5 w-2.5 text-accent/60 group-hover:text-accent transition-colors" />
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">{cmd.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Output */}
      <div ref={scrollRef} className="flex-1 overflow-auto scrollbar-thin px-4 py-3 font-mono text-[12px] space-y-3">
        {history.map((entry, i) => (
          <div key={i} className="animate-fade-in">
            {entry.type === 'system' && (
              <div className="flex items-center gap-2 text-muted-foreground/60">
                <span className="text-[10px]">{entry.timestamp}</span>
                <span className="text-accent/40">sys</span>
                <span>{entry.text}</span>
              </div>
            )}
            {entry.type === 'command' && (
              <div className="flex items-start gap-2">
                <span className="text-[10px] text-muted-foreground/60 pt-0.5">{entry.timestamp}</span>
                <ChevronRight className="h-3 w-3 text-accent mt-0.5 shrink-0" />
                <span className="text-accent">{entry.text}</span>
              </div>
            )}
            {entry.type === 'response' && (
              <div className="flex items-start gap-2">
                <span className="text-[10px] text-muted-foreground/60 pt-0.5 shrink-0">{entry.timestamp}</span>
                <div className="ml-3 pl-3 border-l-2 border-accent/20 text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {entry.text.includes('successfully') ? (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-success inline shrink-0" />
                      <span>{entry.text}</span>
                    </span>
                  ) : entry.text.includes('mock') ? (
                    <span className="inline-flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-warning inline shrink-0" />
                      <span>{entry.text}</span>
                    </span>
                  ) : (
                    entry.text
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Cursor blink */}
        <div className="flex items-center gap-2 text-muted-foreground/40">
          <span className="text-[10px]">now</span>
          <ChevronRight className="h-3 w-3 text-accent/40" />
          <span className="inline-block w-2 h-4 bg-accent/60 animate-pulse" />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-[hsl(var(--ghost-border)/0.15)] px-4 py-3">
        {/* Agent selector */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Route to:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedAgent('auto')}
              className={cn(
                'px-2 py-0.5 rounded text-[10px] font-medium border transition-colors',
                selectedAgent === 'auto'
                  ? 'bg-accent/15 text-accent border-accent/30'
                  : 'text-muted-foreground border-transparent hover:border-[hsl(var(--ghost-border)/0.3)]'
              )}
            >
              Auto-detect
            </button>
            {agents.filter(a => a.status !== 'offline').map(agent => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-medium border transition-colors',
                  selectedAgent === agent.id
                    ? getAgentBgClass(agent.id)
                    : 'text-muted-foreground border-transparent hover:border-[hsl(var(--ghost-border)/0.3)]'
                )}
              >
                {agent.shortName}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter a command..."
              className="w-full p-3 pr-20 rounded-lg bg-[hsl(var(--surface-high))] border border-[hsl(var(--ghost-border)/0.15)] text-sm font-mono resize-none h-[52px] focus:border-accent/40 focus:ring-1 focus:ring-accent/20 outline-none text-foreground placeholder:text-muted-foreground/40 transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1 text-[10px] text-muted-foreground/30">
              <CornerDownLeft className="h-3 w-3" />
              <span>Send</span>
            </div>
          </div>
          <Button
            className="self-end gap-1.5 h-[52px] px-5"
            onClick={handleSubmit}
            disabled={isDispatching || !input.trim()}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
