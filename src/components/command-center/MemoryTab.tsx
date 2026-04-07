import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Brain, Search, User, MessageSquare, Folder, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { memoryEntries, agents, getAgentBgClass, getAgent, type MemoryType } from './mockData';

const typeConfig: Record<MemoryType, { icon: typeof User; label: string; color: string }> = {
  user: { icon: User, label: 'User', color: 'bg-accent/15 text-accent border-accent/30' },
  feedback: { icon: MessageSquare, label: 'Feedback', color: 'bg-warning/15 text-warning border-warning/30' },
  project: { icon: Folder, label: 'Project', color: 'bg-[hsl(270,60%,60%)]/15 text-[hsl(270,60%,60%)] border-[hsl(270,60%,60%)]/30' },
  reference: { icon: BookOpen, label: 'Reference', color: 'bg-[hsl(207,90%,60%)]/15 text-[hsl(207,90%,60%)] border-[hsl(207,90%,60%)]/30' },
};

export function MemoryTab() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = memoryEntries.filter(m => {
    if (filterType !== 'all' && m.type !== filterType) return false;
    if (filterAgent !== 'all' && m.agentId !== filterAgent) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-[hsl(var(--ghost-border)/0.15)] space-y-2">
        <div className="flex items-center justify-between">
          <div className="ai-label">Memory Bank</div>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Brain className="h-3 w-3" /> {filtered.length} entries
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search memories..."
            className="w-full pl-7 pr-3 py-1.5 rounded-md bg-[hsl(var(--surface-high))] border border-[hsl(var(--ghost-border)/0.1)] text-xs focus:border-accent/40 outline-none text-foreground placeholder:text-muted-foreground/30"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="flex gap-1">
            <span className="text-[10px] text-muted-foreground/50 self-center mr-1">Type:</span>
            <button
              onClick={() => setFilterType('all')}
              className={cn('px-2 py-0.5 rounded text-[10px] font-medium border transition-colors', filterType === 'all' ? 'bg-accent/15 text-accent border-accent/30' : 'text-muted-foreground border-transparent')}
            >All</button>
            {(Object.keys(typeConfig) as MemoryType[]).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn('px-2 py-0.5 rounded text-[10px] font-medium border transition-colors capitalize', filterType === type ? typeConfig[type].color : 'text-muted-foreground border-transparent')}
              >{type}</button>
            ))}
          </div>
          <div className="flex gap-1">
            <span className="text-[10px] text-muted-foreground/50 self-center mr-1">Agent:</span>
            <button
              onClick={() => setFilterAgent('all')}
              className={cn('px-2 py-0.5 rounded text-[10px] font-medium border transition-colors', filterAgent === 'all' ? 'bg-accent/15 text-accent border-accent/30' : 'text-muted-foreground border-transparent')}
            >All</button>
            {agents.map(a => (
              <button
                key={a.id}
                onClick={() => setFilterAgent(a.id)}
                className={cn('px-2 py-0.5 rounded text-[10px] font-medium border transition-colors', filterAgent === a.id ? getAgentBgClass(a.id) : 'text-muted-foreground border-transparent')}
              >{a.shortName}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Memory List */}
      <div className="flex-1 overflow-auto scrollbar-thin p-4 space-y-2">
        {filtered.map(mem => {
          const config = typeConfig[mem.type];
          const TypeIcon = config.icon;
          const agent = getAgent(mem.agentId);
          const isExpanded = expandedId === mem.id;

          return (
            <div
              key={mem.id}
              className="rounded-lg bg-[hsl(var(--surface-low))] border border-[hsl(var(--ghost-border)/0.1)] transition-all hover:border-[hsl(var(--ghost-border)/0.25)]"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : mem.id)}
                className="w-full flex items-center gap-3 p-3 text-left"
              >
                {isExpanded ? <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" /> : <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                <TypeIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-mono font-semibold">{mem.name}</span>
                  <span className="text-[11px] text-muted-foreground ml-2">{mem.description}</span>
                </div>
                <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-medium border shrink-0', config.color)}>
                  {config.label}
                </span>
                {agent && (
                  <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-medium border shrink-0', getAgentBgClass(agent.id))}>
                    {agent.shortName}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground/40 shrink-0">{mem.updatedAt}</span>
              </button>

              {isExpanded && (
                <div className="px-4 pb-3 pt-0">
                  <div className="ml-6 p-3 rounded-md bg-[hsl(var(--surface-high))] border border-[hsl(var(--ghost-border)/0.1)] text-[12px] font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed">
                    {mem.content}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
