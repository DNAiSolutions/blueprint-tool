import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Send, Cpu, Brain, Coins, Activity } from 'lucide-react';
import { agents, getStatusColor, getAgentBgClass, type Agent } from './mockData';

export function AgentsTab() {
  return (
    <div className="h-full overflow-auto scrollbar-thin p-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const [message, setMessage] = useState('');

  return (
    <div className={cn(
      'rounded-lg bg-[hsl(var(--surface-low))] border border-[hsl(var(--ghost-border)/0.1)] p-4 transition-all hover:border-[hsl(var(--ghost-border)/0.25)]',
      agent.status === 'offline' && 'opacity-50'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={cn(
              'h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold',
              getAgentBgClass(agent.id)
            )}>
              {agent.avatar}
            </div>
            <div className={cn(
              'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[hsl(var(--surface-low))]',
              getStatusColor(agent.status)
            )} />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{agent.name}</h3>
            <p className="text-[11px] text-muted-foreground">{agent.role}</p>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      {/* Active Task */}
      {agent.activeTask && (
        <div className="mb-3 px-3 py-2 rounded-md bg-[hsl(var(--surface-high))] border border-[hsl(var(--ghost-border)/0.1)]">
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3 text-accent animate-misty-pulse shrink-0" />
            <span className="text-[11px] text-foreground/80 truncate">{agent.activeTask}</span>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Cpu className="h-3 w-3" />
          <span>{agent.skills.length} skills</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Brain className="h-3 w-3" />
          <span>{agent.memoryCount} mem</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Coins className="h-3 w-3" />
          <span>{(agent.tokensUsed / 1000).toFixed(0)}k tok</span>
        </div>
      </div>

      {/* Skills Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {agent.skills.slice(0, 3).map(skill => (
          <span key={skill} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[hsl(var(--surface-high))] text-muted-foreground border border-[hsl(var(--ghost-border)/0.1)]">
            {skill}
          </span>
        ))}
        {agent.skills.length > 3 && (
          <span className="px-1.5 py-0.5 text-[10px] text-muted-foreground/50">
            +{agent.skills.length - 3}
          </span>
        )}
      </div>

      {/* Message Input */}
      <div className="flex gap-1.5">
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={agent.status === 'offline' ? 'Agent offline' : `Message ${agent.shortName}...`}
          disabled={agent.status === 'offline'}
          className="flex-1 px-2.5 py-1.5 rounded-md bg-[hsl(var(--surface-high))] border border-[hsl(var(--ghost-border)/0.1)] text-xs font-mono focus:border-accent/40 outline-none disabled:opacity-40 text-foreground placeholder:text-muted-foreground/30"
        />
        <Button variant="outline" size="sm" disabled={agent.status === 'offline'} className="h-7 w-7 p-0">
          <Send className="h-3 w-3" />
        </Button>
      </div>

      {/* Footer */}
      <div className="mt-2 text-[10px] text-muted-foreground/40 text-right">
        Last active: {agent.lastActive}
      </div>
    </div>
  );
}
