import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Flag, Calendar, Tag, AlertTriangle } from 'lucide-react';
import { useAgentTasks } from '@/hooks/useAgentTasks';
import { sprintTasks as mockSprintTasks, getAgent, getAgentBgClass, type SprintTask, type TaskColumn } from './mockData';

const columns: { key: TaskColumn; label: string; color: string }[] = [
  { key: 'backlog', label: 'Backlog', color: 'text-muted-foreground' },
  { key: 'in_progress', label: 'In Progress', color: 'text-accent' },
  { key: 'review', label: 'Review', color: 'text-warning' },
  { key: 'done', label: 'Done', color: 'text-success' },
];

const priorityConfig: Record<string, { color: string; label: string }> = {
  critical: { color: 'bg-destructive/15 text-destructive border-destructive/30', label: 'CRIT' },
  high: { color: 'bg-warning/15 text-warning border-warning/30', label: 'HIGH' },
  medium: { color: 'bg-accent/15 text-accent border-accent/30', label: 'MED' },
  low: { color: 'bg-muted text-muted-foreground border-border', label: 'LOW' },
};

// Map agent_tasks status -> TaskColumn
function mapStatusToColumn(status: string): TaskColumn {
  switch (status) {
    case 'queued': return 'backlog';
    case 'in_progress': return 'in_progress';
    case 'review': return 'review';
    case 'done': return 'done';
    case 'failed':
    case 'escalated':
      return 'backlog'; // shown with red indicator
    default: return 'backlog';
  }
}

export function SprintTab() {
  const { tasks: realTasks, loading } = useAgentTasks();

  // Convert real agent_tasks into SprintTask shape, fall back to mock data
  const sprintTasks: (SprintTask & { isErrorState?: boolean })[] = useMemo(() => {
    if (realTasks.length === 0) {
      return mockSprintTasks;
    }

    return realTasks.map((t) => ({
      id: t.id,
      title: t.task_type,
      description: (t.input_payload as any)?.description || t.last_error || t.task_type,
      priority: (t.priority || 'medium') as SprintTask['priority'],
      agentId: t.agent_id,
      column: mapStatusToColumn(t.status),
      dueDate: t.completed_at ? new Date(t.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null,
      tags: [t.status, ...(t.client_id ? ['client'] : [])],
      isErrorState: t.status === 'failed' || t.status === 'escalated',
    }));
  }, [realTasks]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-[hsl(var(--ghost-border)/0.15)] flex items-center justify-between">
        <div className="ai-label">Sprint Board</div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>{sprintTasks.filter(t => t.column === 'in_progress').length} in progress</span>
          <span>{sprintTasks.filter(t => t.column === 'done').length} completed</span>
          {realTasks.length > 0 && (
            <span className="text-accent">Live</span>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-auto scrollbar-thin p-4">
        <div className="grid grid-cols-4 gap-3 h-full min-h-[400px]">
          {columns.map(col => {
            const tasks = sprintTasks.filter(t => t.column === col.key);
            return (
              <div key={col.key} className="flex flex-col">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-[11px] font-semibold uppercase tracking-wider', col.color)}>
                      {col.label}
                    </span>
                    <span className="h-4 min-w-[16px] px-1 rounded-full bg-[hsl(var(--surface-high))] flex items-center justify-center text-[10px] font-mono text-muted-foreground">
                      {tasks.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-2">
                  {tasks.map(task => (
                    <TaskCard key={task.id} task={task} isErrorState={(task as any).isErrorState} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, isErrorState }: { task: SprintTask; isErrorState?: boolean }) {
  const agent = getAgent(task.agentId);
  const priority = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <div className={cn(
      'rounded-lg bg-[hsl(var(--surface-low))] border border-[hsl(var(--ghost-border)/0.1)] p-3 transition-all hover:border-[hsl(var(--ghost-border)/0.25)] cursor-default',
      task.column === 'done' && 'opacity-60',
      isErrorState && 'border-destructive/30'
    )}>
      {/* Priority + Agent */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1">
          {isErrorState && <AlertTriangle className="h-3 w-3 text-destructive" />}
          <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-mono font-bold border', priority.color)}>
            <Flag className="h-2 w-2 mr-0.5" />
            {priority.label}
          </span>
        </div>
        {agent && (
          <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-medium border', getAgentBgClass(agent.id))}>
            {agent.shortName}
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="text-[12px] font-semibold mb-1 leading-tight">{task.title}</h4>
      <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2">{task.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {task.tags.slice(0, 2).map(tag => (
            <span key={tag} className="flex items-center gap-0.5 text-[9px] text-muted-foreground/50">
              <Tag className="h-2 w-2" />{tag}
            </span>
          ))}
        </div>
        {task.dueDate && (
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground/50">
            <Calendar className="h-2.5 w-2.5" /> {task.dueDate}
          </span>
        )}
      </div>
    </div>
  );
}
