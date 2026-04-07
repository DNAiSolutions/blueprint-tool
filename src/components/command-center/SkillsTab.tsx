import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Cpu, Hash, Clock, Zap } from 'lucide-react';
import { skills, agents, getAgentBgClass, getAgent } from './mockData';

export function SkillsTab() {
  const [filterAgent, setFilterAgent] = useState<string>('all');

  const filtered = filterAgent === 'all' ? skills : skills.filter(s => s.agentId === filterAgent);
  const totalUsage = filtered.reduce((sum, s) => sum + s.usageCount, 0);
  const totalTokens = filtered.reduce((sum, s) => sum + s.tokenCost * s.usageCount, 0);

  return (
    <div className="h-full flex flex-col">
      {/* Header Stats */}
      <div className="px-4 pt-3 pb-2 border-b border-[hsl(var(--ghost-border)/0.15)]">
        <div className="flex items-center justify-between mb-3">
          <div className="ai-label">Skill Registry</div>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><Cpu className="h-3 w-3" /> {filtered.length} skills</span>
            <span className="flex items-center gap-1"><Hash className="h-3 w-3" /> {totalUsage.toLocaleString()} uses</span>
            <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {(totalTokens / 1_000_000).toFixed(1)}M tokens</span>
          </div>
        </div>

        {/* Agent Filter */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setFilterAgent('all')}
            className={cn(
              'px-2.5 py-1 rounded text-[10px] font-medium border transition-colors',
              filterAgent === 'all'
                ? 'bg-accent/15 text-accent border-accent/30'
                : 'text-muted-foreground border-transparent hover:border-[hsl(var(--ghost-border)/0.3)]'
            )}
          >
            All Agents
          </button>
          {agents.map(agent => (
            <button
              key={agent.id}
              onClick={() => setFilterAgent(agent.id)}
              className={cn(
                'px-2.5 py-1 rounded text-[10px] font-medium border transition-colors',
                filterAgent === agent.id
                  ? getAgentBgClass(agent.id)
                  : 'text-muted-foreground border-transparent hover:border-[hsl(var(--ghost-border)/0.3)]'
              )}
            >
              {agent.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      <div className="flex-1 overflow-auto scrollbar-thin p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {filtered.map(skill => {
            const agent = getAgent(skill.agentId);
            const sizeClass = skill.tokenCost > 60_000 ? 'h-3 w-3' : skill.tokenCost > 30_000 ? 'h-2.5 w-2.5' : 'h-2 w-2';
            return (
              <div
                key={skill.id}
                className="group rounded-lg bg-[hsl(var(--surface-low))] border border-[hsl(var(--ghost-border)/0.1)] p-3 hover:border-[hsl(var(--ghost-border)/0.25)] transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn('rounded-full bg-accent/20', sizeClass)} />
                    <span className="text-xs font-mono font-semibold text-foreground">{skill.name}</span>
                  </div>
                  {agent && (
                    <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-medium border', getAgentBgClass(agent.id))}>
                      {agent.shortName}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mb-2 line-clamp-2">{skill.description}</p>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60">
                  <span className="flex items-center gap-1"><Zap className="h-2.5 w-2.5" /> {(skill.tokenCost / 1000).toFixed(0)}k tok</span>
                  <span className="flex items-center gap-1"><Hash className="h-2.5 w-2.5" /> {skill.usageCount} uses</span>
                  <span className="flex items-center gap-1 ml-auto"><Clock className="h-2.5 w-2.5" /> {skill.lastUsed}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
