import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Circle, Bot, Cpu, Clock, Brain, FolderTree } from 'lucide-react';
import { agents, skills, cronJobs, memoryEntries, getStatusColor, type Agent } from './mockData';

interface AgentExplorerProps {
  selectedAgentId: string | null;
  onSelectAgent: (id: string | null) => void;
}

type ExplorerSection = 'agents' | 'skills' | 'crons' | 'memory';

export function AgentExplorer({ selectedAgentId, onSelectAgent }: AgentExplorerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ agents: true });

  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const sections: { key: ExplorerSection; label: string; icon: typeof Bot; count: number }[] = [
    { key: 'agents', label: 'Agents', icon: Bot, count: agents.filter(a => a.status !== 'offline').length },
    { key: 'skills', label: 'Skills', icon: Cpu, count: skills.length },
    { key: 'crons', label: 'Scheduled', icon: Clock, count: cronJobs.filter(c => c.status === 'active').length },
    { key: 'memory', label: 'Memory', icon: Brain, count: memoryEntries.length },
  ];

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--surface))] border-r border-[hsl(var(--ghost-border)/0.15)]">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[hsl(var(--ghost-border)/0.15)]">
        <div className="flex items-center gap-2">
          <FolderTree className="h-3.5 w-3.5 text-accent" />
          <span className="ai-label">Explorer</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto scrollbar-thin py-1">
        {sections.map(section => {
          const Icon = section.icon;
          const isExpanded = expanded[section.key];
          return (
            <div key={section.key}>
              <button
                onClick={() => toggle(section.key)}
                className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                <Icon className="h-3 w-3" />
                <span className="flex-1 text-left">{section.label}</span>
                <span className="text-[10px] font-mono text-muted-foreground/60">{section.count}</span>
              </button>

              {isExpanded && section.key === 'agents' && (
                <div className="pb-1">
                  {agents.map(agent => (
                    <AgentRow
                      key={agent.id}
                      agent={agent}
                      isSelected={selectedAgentId === agent.id}
                      onSelect={() => onSelectAgent(selectedAgentId === agent.id ? null : agent.id)}
                    />
                  ))}
                </div>
              )}

              {isExpanded && section.key === 'skills' && (
                <div className="pb-1">
                  {skills.slice(0, 8).map(skill => (
                    <button
                      key={skill.id}
                      className="w-full flex items-center gap-2 px-5 py-1 text-[12px] text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--surface-high))] transition-colors"
                    >
                      <Cpu className="h-2.5 w-2.5 shrink-0 text-accent/50" />
                      <span className="truncate font-mono">{skill.name}</span>
                    </button>
                  ))}
                  <div className="px-5 py-1 text-[10px] text-muted-foreground/50 font-mono">
                    +{skills.length - 8} more...
                  </div>
                </div>
              )}

              {isExpanded && section.key === 'crons' && (
                <div className="pb-1">
                  {cronJobs.map(cron => (
                    <button
                      key={cron.id}
                      className="w-full flex items-center gap-2 px-5 py-1 text-[12px] text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--surface-high))] transition-colors"
                    >
                      <Circle className={cn('h-1.5 w-1.5 shrink-0', cron.status === 'active' ? 'fill-success text-success' : 'fill-muted-foreground/30 text-muted-foreground/30')} />
                      <span className="truncate">{cron.name}</span>
                      <span className="ml-auto text-[10px] font-mono text-muted-foreground/40">{cron.cron}</span>
                    </button>
                  ))}
                </div>
              )}

              {isExpanded && section.key === 'memory' && (
                <div className="pb-1">
                  {memoryEntries.map(mem => (
                    <button
                      key={mem.id}
                      className="w-full flex items-center gap-2 px-5 py-1 text-[12px] text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--surface-high))] transition-colors"
                    >
                      <Brain className="h-2.5 w-2.5 shrink-0 text-accent/50" />
                      <span className="truncate">{mem.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status footer */}
      <div className="px-3 py-2 border-t border-[hsl(var(--ghost-border)/0.15)] space-y-1">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Agents Online</span>
          <span className="font-mono">{agents.filter(a => a.status !== 'offline').length}/{agents.length}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Active Crons</span>
          <span className="font-mono">{cronJobs.filter(c => c.status === 'active').length}</span>
        </div>
      </div>
    </div>
  );
}

function AgentRow({ agent, isSelected, onSelect }: { agent: Agent; isSelected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-1.5 text-[12px] transition-colors',
        isSelected
          ? 'bg-accent/10 text-accent'
          : 'text-foreground/80 hover:bg-[hsl(var(--surface-high))]'
      )}
    >
      <div className="relative">
        <div className={cn(
          'h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold',
          isSelected ? 'bg-accent/20 text-accent' : 'bg-[hsl(var(--surface-high))] text-muted-foreground'
        )}>
          {agent.avatar}
        </div>
        <div className={cn('absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[hsl(var(--surface))]', getStatusColor(agent.status))} />
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="truncate font-medium">{agent.shortName}</div>
      </div>
      {agent.status === 'busy' && (
        <div className="h-1.5 w-1.5 rounded-full bg-warning animate-misty-pulse" />
      )}
    </button>
  );
}
