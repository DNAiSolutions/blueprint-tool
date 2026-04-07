import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Clock, Play, Pause, Plus, Hash, CalendarClock } from 'lucide-react';
import { cronJobs, getAgent, getAgentBgClass, type CronJob } from './mockData';

export function SchedulerTab() {
  const [jobs, setJobs] = useState(cronJobs);

  const toggleJob = (id: string) => {
    setJobs(prev => prev.map(j =>
      j.id === id ? { ...j, status: j.status === 'active' ? 'paused' as const : 'active' as const } : j
    ));
  };

  const activeCount = jobs.filter(j => j.status === 'active').length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-[hsl(var(--ghost-border)/0.15)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="ai-label">Cron Scheduler</div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {activeCount} active</span>
            <span className="flex items-center gap-1"><Hash className="h-3 w-3" /> {jobs.reduce((s, j) => s + j.runCount, 0)} total runs</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
          <Plus className="h-3 w-3" /> New Job
        </Button>
      </div>

      {/* Jobs List */}
      <div className="flex-1 overflow-auto scrollbar-thin p-4 space-y-2">
        {jobs.map(job => (
          <CronJobCard key={job.id} job={job} onToggle={() => toggleJob(job.id)} />
        ))}
      </div>
    </div>
  );
}

function CronJobCard({ job, onToggle }: { job: CronJob; onToggle: () => void }) {
  const agent = getAgent(job.agentId);

  return (
    <div className={cn(
      'rounded-lg bg-[hsl(var(--surface-low))] border border-[hsl(var(--ghost-border)/0.1)] p-4 transition-all hover:border-[hsl(var(--ghost-border)/0.25)]',
      job.status === 'paused' && 'opacity-60'
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            'h-8 w-8 rounded-md flex items-center justify-center',
            job.status === 'active' ? 'bg-accent/15' : 'bg-[hsl(var(--surface-high))]'
          )}>
            <CalendarClock className={cn('h-4 w-4', job.status === 'active' ? 'text-accent' : 'text-muted-foreground')} />
          </div>
          <div>
            <h4 className="text-sm font-semibold">{job.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-mono text-accent/70">{job.cron}</span>
              {agent && (
                <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-medium border', getAgentBgClass(agent.id))}>
                  {agent.shortName}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={job.status} />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onToggle}
          >
            {job.status === 'active' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Prompt */}
      <div className="px-3 py-2 rounded-md bg-[hsl(var(--surface-high))] border border-[hsl(var(--ghost-border)/0.1)] mb-2">
        <p className="text-[11px] font-mono text-muted-foreground">{job.prompt}</p>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground/50">
        <span>Last: {job.lastRun || 'Never'}</span>
        <span>Next: {job.nextRun}</span>
        <span className="ml-auto font-mono">{job.runCount} runs</span>
      </div>
    </div>
  );
}
