import { useState } from 'react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Activity, CheckCircle2, AlertCircle, Loader2, Clock } from 'lucide-react';
import { activityLog, agents, getAgentBgClass, getAgent } from './mockData';

const statusIcons: Record<string, typeof CheckCircle2> = {
  success: CheckCircle2,
  running: Loader2,
  error: AlertCircle,
  queued: Clock,
};

export function ActivityTab() {
  const [filterAgent, setFilterAgent] = useState<string>('all');

  const filtered = filterAgent === 'all'
    ? activityLog
    : activityLog.filter(a => a.agentId === filterAgent);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-[hsl(var(--ghost-border)/0.15)]">
        <div className="flex items-center justify-between mb-2">
          <div className="ai-label">Activity Feed</div>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Activity className="h-3 w-3" /> {filtered.length} entries
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setFilterAgent('all')}
            className={cn(
              'px-2.5 py-1 rounded text-[10px] font-medium border transition-colors',
              filterAgent === 'all' ? 'bg-accent/15 text-accent border-accent/30' : 'text-muted-foreground border-transparent'
            )}
          >All</button>
          {agents.map(a => (
            <button
              key={a.id}
              onClick={() => setFilterAgent(a.id)}
              className={cn(
                'px-2.5 py-1 rounded text-[10px] font-medium border transition-colors',
                filterAgent === a.id ? getAgentBgClass(a.id) : 'text-muted-foreground border-transparent'
              )}
            >{a.shortName}</button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        {filtered.map((entry, i) => {
          const StatusIcon = statusIcons[entry.status] || CheckCircle2;
          const agent = getAgent(entry.agentId);

          return (
            <div
              key={entry.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--ghost-border)/0.08)] transition-colors hover:bg-[hsl(var(--surface-high)/0.5)]',
                i % 2 === 0 ? 'bg-transparent' : 'bg-[hsl(var(--surface-low)/0.3)]'
              )}
            >
              {/* Status Icon */}
              <StatusIcon className={cn(
                'h-3.5 w-3.5 shrink-0',
                entry.status === 'success' && 'text-success',
                entry.status === 'running' && 'text-accent animate-spin',
                entry.status === 'error' && 'text-destructive',
                entry.status === 'queued' && 'text-muted-foreground',
              )} />

              {/* Action */}
              <span className="flex-1 text-[12px] text-foreground/80 min-w-0 truncate">
                {entry.action}
              </span>

              {/* Agent Badge */}
              {agent && (
                <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-medium border shrink-0', getAgentBgClass(agent.id))}>
                  {agent.shortName}
                </span>
              )}

              {/* Module */}
              <StatusBadge status={entry.module.toLowerCase()} className="shrink-0" />

              {/* Duration */}
              <span className="text-[11px] font-mono text-muted-foreground/50 w-14 text-right shrink-0">
                {entry.duration}
              </span>

              {/* Time */}
              <span className="text-[11px] text-muted-foreground/40 w-20 text-right shrink-0">
                {entry.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
