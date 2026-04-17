import { cn } from '@/lib/utils';

const variants: Record<string, string> = {
  live: 'bg-success/15 text-success border-success/30',
  active: 'bg-success/15 text-success border-success/30',
  success: 'bg-success/15 text-success border-success/30',
  paid: 'bg-success/15 text-success border-success/30',
  pending: 'bg-warning/15 text-warning border-warning/30',
  in_review: 'bg-warning/15 text-warning border-warning/30',
  preview_ready: 'bg-[hsl(210,80%,55%)]/15 text-[hsl(210,80%,55%)] border-[hsl(210,80%,55%)]/30',
  revision_requested: 'bg-warning/15 text-warning border-warning/30',
  scheduled: 'bg-warning/15 text-warning border-warning/30',
  draft: 'bg-muted text-muted-foreground border-border',
  generating: 'bg-accent/15 text-accent border-accent/30',
  error: 'bg-destructive/15 text-destructive border-destructive/30',
  failed: 'bg-destructive/15 text-destructive border-destructive/30',
  overdue: 'bg-destructive/15 text-destructive border-destructive/30',
  new: 'bg-accent/15 text-accent border-accent/30',
  info: 'bg-[hsl(210,80%,55%)]/15 text-[hsl(210,80%,55%)] border-[hsl(210,80%,55%)]/30',
  running: 'bg-accent/15 text-accent border-accent/30',
  completed: 'bg-success/15 text-success border-success/30',
  connected: 'bg-success/15 text-success border-success/30',
  disconnected: 'bg-muted text-muted-foreground border-border',
  converted: 'bg-success/15 text-success border-success/30',
  deployed: 'bg-success/15 text-success border-success/30',
  lead_magnet: 'bg-[hsl(270,60%,60%)]/15 text-[hsl(270,60%,60%)] border-[hsl(270,60%,60%)]/30',
  client_project: 'bg-muted text-muted-foreground border-border',
  // Pipeline stages
  leads: 'bg-[hsl(210,80%,55%)]/15 text-[hsl(210,80%,55%)] border-[hsl(210,80%,55%)]/30',
  audit: 'bg-warning/15 text-warning border-warning/30',
  strategy: 'bg-[hsl(270,60%,60%)]/15 text-[hsl(270,60%,60%)] border-[hsl(270,60%,60%)]/30',
  build: 'bg-accent/15 text-accent border-accent/30',
  produce: 'bg-[hsl(28,80%,55%)]/15 text-[hsl(28,80%,55%)] border-[hsl(28,80%,55%)]/30',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = status.toLowerCase().replace(/[\s-]/g, '_');
  const style = variants[key] || variants.draft;
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider border',
      style,
      className
    )}>
      {status}
    </span>
  );
}
