// ProjectGrid — list of all video projects with at-a-glance pipeline status.
// Each card shows: thumbnail, title, client, format badge, pipeline dots, status.

import { cn } from '@/lib/utils';
import { Film, Monitor, Smartphone, Clock, CheckCircle2, AlertTriangle, Upload, Loader2 } from 'lucide-react';
import { formatDuration, progressOverall, type VideoProject, type ProjectStatus } from '../types';

interface ProjectGridProps {
  projects: VideoProject[];
  onOpen: (id: string) => void;
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: 'Draft',
  ready: 'Ready to run',
  processing: 'Processing',
  qa_review: 'QA review',
  needs_fixes: 'Needs fixes',
  approved: 'Approved',
  published: 'Published',
};

const STATUS_STYLE: Record<ProjectStatus, string> = {
  draft: 'bg-muted text-muted-foreground border-border',
  ready: 'bg-accent/10 text-accent border-accent/30',
  processing: 'bg-[hsl(210,80%,55%)]/10 text-[hsl(210,80%,55%)] border-[hsl(210,80%,55%)]/30',
  qa_review: 'bg-warning/10 text-warning border-warning/30',
  needs_fixes: 'bg-destructive/10 text-destructive border-destructive/30',
  approved: 'bg-success/10 text-success border-success/30',
  published: 'bg-success/15 text-success border-success/40',
};

function StatusIcon({ status }: { status: ProjectStatus }) {
  const Icon =
    status === 'draft' ? Upload :
    status === 'ready' ? Clock :
    status === 'processing' ? Loader2 :
    status === 'qa_review' ? Clock :
    status === 'needs_fixes' ? AlertTriangle :
    CheckCircle2;
  return (
    <Icon className={cn('h-3 w-3', status === 'processing' && 'animate-spin')} />
  );
}

export function ProjectGrid({ projects, onOpen }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-12">
        <div className="max-w-sm">
          <Film className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-semibold mb-1">No video projects yet</h3>
          <p className="text-xs text-muted-foreground">
            Start a new project to upload raw footage and run it through the DigitalDNA pipeline.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6 scrollbar-thin">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} onOpen={() => onOpen(p.id)} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project, onOpen }: { project: VideoProject; onOpen: () => void }) {
  const overallProgress = progressOverall(project.stages);
  const aspectClass = project.format === 'shortform' ? 'aspect-[9/16] max-h-56' : 'aspect-video';
  const FormatIcon = project.format === 'shortform' ? Smartphone : Monitor;

  return (
    <button
      onClick={onOpen}
      className="group text-left rounded-lg border border-border bg-card hover:border-accent/50 hover:shadow-lg transition-all overflow-hidden flex flex-col"
    >
      {/* Thumbnail */}
      <div className={cn('relative bg-[hsl(240_10%_7%)] border-b border-border overflow-hidden flex items-center justify-center', aspectClass)}>
        {project.thumbnailUrl ? (
          // Placeholder — real thumbs come from Supabase Storage in prod
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-[hsl(255_62%_69%/0.25)] to-[hsl(222_100%_50%/0.15)]" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted/40 to-muted/10" />
        )}
        <Film className="h-8 w-8 text-muted-foreground/30 relative z-10" />

        {/* Format + duration badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className="flex items-center gap-1 bg-background/80 backdrop-blur px-1.5 py-0.5 rounded border border-border text-[10px] font-medium">
            <FormatIcon className="h-3 w-3" />
            {project.format === 'shortform' ? '9:16' : '16:9'}
          </span>
          {project.durationSeconds !== undefined && (
            <span className="bg-background/80 backdrop-blur px-1.5 py-0.5 rounded border border-border text-[10px] font-mono">
              {formatDuration(project.durationSeconds)}
            </span>
          )}
        </div>

        {/* Status pill */}
        <div className={cn(
          'absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium',
          STATUS_STYLE[project.status],
        )}>
          <StatusIcon status={project.status} />
          {STATUS_LABEL[project.status]}
        </div>

        {/* Progress bar */}
        {project.status === 'processing' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-border">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${Math.round(overallProgress * 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3 flex-1 flex flex-col gap-2">
        <div>
          <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-accent transition-colors">
            {project.title}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{project.clientName}</p>
        </div>

        {/* Stage dots */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground mt-auto">
          {project.stages.map((s) => (
            <div
              key={s.id}
              title={`Stage ${s.id} — ${s.name}: ${s.status}`}
              className={cn(
                'h-1.5 flex-1 rounded-full',
                s.status === 'complete' && 'bg-success',
                s.status === 'running' && 'bg-accent animate-pulse',
                s.status === 'error' && 'bg-destructive',
                s.status === 'pending' && 'bg-border',
                s.status === 'skipped' && 'bg-muted',
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{project.sources.length} source{project.sources.length === 1 ? '' : 's'}</span>
          <span className="font-mono">{project.slug}</span>
        </div>
      </div>
    </button>
  );
}
