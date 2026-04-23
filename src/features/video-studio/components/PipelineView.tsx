// PipelineView — the active project workspace.
// 3-panel layout:
//   Left:   Sources + directives
//   Center: Pipeline timeline (stages + video timeline visualization)
//   Right:  Inspector (stage logs, QA report, render controls)

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Play, Pause, Download, RotateCw, Monitor, Smartphone, Upload,
  Film, Video, Headphones, Mic, FileText, Layers, Plus, X,
  CheckCircle2, AlertTriangle, Clock, Loader2, Zap, Type, Sparkles,
  Terminal, ChevronDown, ChevronRight, ArrowRight,
} from 'lucide-react';
import type { VideoProject, Stage, QACheck, RawSource } from '../types';
import { formatDuration, progressOverall } from '../types';

interface PipelineViewProps {
  project: VideoProject;
  onChange: (p: VideoProject) => void;
}

type RightTab = 'stages' | 'directives' | 'qa';

export function PipelineView({ project, onChange }: PipelineViewProps) {
  const [rightTab, setRightTab] = useState<RightTab>(
    project.status === 'needs_fixes' || project.status === 'approved' ? 'qa' :
    project.status === 'processing' ? 'stages' : 'directives'
  );

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* LEFT: Sources */}
      <aside className="w-72 shrink-0 border-r border-border bg-card/40 flex flex-col min-h-0 overflow-hidden">
        <LeftPanel project={project} onChange={onChange} />
      </aside>

      {/* CENTER: Pipeline stages + timeline */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <CenterPanel project={project} onChange={onChange} />
      </main>

      {/* RIGHT: Inspector */}
      <aside className="w-[380px] shrink-0 border-l border-border bg-card/40 flex flex-col min-h-0 overflow-hidden">
        <RightPanel project={project} activeTab={rightTab} onTabChange={setRightTab} />
      </aside>
    </div>
  );
}

/* ------------------------ LEFT PANEL ------------------------ */

function LeftPanel({ project, onChange }: { project: VideoProject; onChange: (p: VideoProject) => void }) {
  const handleAddMock = () => {
    const id = `src-${Date.now()}`;
    const newSource: RawSource = {
      id,
      filename: `new_source_${project.sources.length + 1}.mp4`,
      role: 'cam_a',
      duration: 600,
      sizeMB: 850,
      uploadedAt: new Date().toISOString(),
    };
    onChange({ ...project, sources: [...project.sources, newSource], updatedAt: new Date().toISOString() });
  };

  return (
    <>
      <div className="px-4 h-10 flex items-center border-b border-border shrink-0">
        <h3 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Sources</h3>
      </div>
      <div className="flex-1 overflow-auto scrollbar-thin p-3 space-y-3">
        {/* Raw footage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase text-muted-foreground">Raw footage</span>
            <span className="text-[10px] text-muted-foreground">{project.sources.length}</span>
          </div>
          {project.sources.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-md p-4 text-center">
              <Upload className="h-4 w-4 text-muted-foreground mx-auto mb-1.5" />
              <p className="text-[11px] text-muted-foreground mb-2">Drop raw footage</p>
              <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={handleAddMock}>
                <Plus className="h-3 w-3" />
                Add source
              </Button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {project.sources.map((s) => (
                <SourceRow key={s.id} source={s} />
              ))}
              <Button variant="ghost" size="sm" className="w-full h-7 text-[10px] gap-1 text-muted-foreground" onClick={handleAddMock}>
                <Plus className="h-3 w-3" />
                Add more
              </Button>
            </div>
          )}
        </div>

        {/* Stage outputs */}
        <div className="pt-3 border-t border-border">
          <span className="text-[10px] font-mono uppercase text-muted-foreground mb-2 block">Pipeline output</span>
          <div className="space-y-1.5">
            <StageOutputRow
              label="edit/final.mp4"
              status={project.stages[0].status}
              description="video-use cut"
            />
            <StageOutputRow
              label="graphics/composition.html"
              status={project.stages[1].status}
              description="hyperframes"
            />
            <StageOutputRow
              label="FINAL.mp4"
              status={project.stages[1].status === 'complete' && project.stages[2].status === 'complete' ? 'complete' : project.stages[1].status}
              description="final master"
              highlight
            />
          </div>
        </div>

        {/* Spec */}
        <div className="pt-3 border-t border-border">
          <span className="text-[10px] font-mono uppercase text-muted-foreground mb-2 block">Spec</span>
          <div className="space-y-1 text-[11px]">
            <SpecRow label="Format" value={
              <span className="flex items-center gap-1">
                {project.format === 'shortform' ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                {project.width}×{project.height}
              </span>
            } />
            <SpecRow label="FPS" value={`${project.fps}`} />
            <SpecRow label="Duration" value={formatDuration(project.durationSeconds)} />
            <SpecRow label="Chapters" value={`${project.chapters?.length ?? 0}`} />
            <SpecRow label="Client" value={project.clientName} />
          </div>
        </div>
      </div>
    </>
  );
}

function SourceRow({ source }: { source: RawSource }) {
  const Icon = source.role === 'screen' ? Monitor :
               source.role === 'b_roll' ? Film :
               source.role === 'audio' ? Headphones : Video;
  const roleLabel = source.role.replace('_', ' ');
  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-background border border-border hover:border-accent/40 transition-colors">
      <div className="h-7 w-7 rounded bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-medium truncate">{source.filename}</div>
        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
          <span className="uppercase">{roleLabel}</span>
          {source.duration && <><span>·</span><span>{formatDuration(source.duration)}</span></>}
          {source.sizeMB && <><span>·</span><span>{source.sizeMB}MB</span></>}
        </div>
      </div>
    </div>
  );
}

function StageOutputRow({ label, status, description, highlight }: { label: string; status: Stage['status']; description: string; highlight?: boolean }) {
  const ready = status === 'complete';
  return (
    <div className={cn(
      'flex items-center gap-2 p-2 rounded-md border transition-colors',
      ready ? 'border-border bg-background' : 'border-dashed border-border/50 bg-background/50',
      highlight && ready && 'border-success/40 bg-success/5',
    )}>
      <div className={cn(
        'h-6 w-6 rounded flex items-center justify-center shrink-0',
        ready ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground',
      )}>
        {status === 'running' ? <Loader2 className="h-3 w-3 animate-spin" /> :
         ready ? <CheckCircle2 className="h-3 w-3" /> :
         <Clock className="h-3 w-3" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-mono truncate">{label}</div>
        <div className="text-[10px] text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-foreground">{value}</span>
    </div>
  );
}

/* ------------------------ CENTER PANEL ------------------------ */

function CenterPanel({ project, onChange }: { project: VideoProject; onChange: (p: VideoProject) => void }) {
  const [playing, setPlaying] = useState(false);
  const overall = progressOverall(project.stages);

  const handleRunPipeline = () => {
    // In prod: kick off server-side pipeline. For demo, advance stages.
    const next = { ...project, status: 'processing' as const, updatedAt: new Date().toISOString() };
    next.stages = next.stages.map((s, i) =>
      i === 0 ? { ...s, status: 'running' as const, progress: 0 } : s
    );
    onChange(next);
  };

  const canRun = project.sources.length > 0 && project.status === 'draft';
  const canRender = project.status === 'approved';

  return (
    <>
      {/* Action bar */}
      <div className="px-4 h-12 flex items-center justify-between border-b border-border shrink-0 bg-card/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px]">
            <div className="h-1.5 w-24 rounded-full bg-border overflow-hidden">
              <div className="h-full bg-accent transition-all" style={{ width: `${Math.round(overall * 100)}%` }} />
            </div>
            <span className="font-mono text-muted-foreground tabular-nums">{Math.round(overall * 100)}%</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {canRun && (
            <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={handleRunPipeline}>
              <Play className="h-3 w-3 fill-current" />
              Run Pipeline
            </Button>
          )}
          {project.status === 'processing' && (
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Pause className="h-3 w-3" />
              Pause
            </Button>
          )}
          {canRender && (
            <>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <RotateCw className="h-3 w-3" />
                Re-render
              </Button>
              <Button size="sm" className="h-8 gap-1.5 text-xs">
                <Download className="h-3 w-3" />
                Download FINAL.mp4
              </Button>
            </>
          )}
          {project.status === 'needs_fixes' && (
            <Button size="sm" className="h-8 gap-1.5 text-xs">
              <RotateCw className="h-3 w-3" />
              Fix & Re-run
            </Button>
          )}
        </div>
      </div>

      {/* Pipeline stage cards */}
      <div className="px-4 py-3 border-b border-border shrink-0 bg-background">
        <div className="flex items-stretch gap-2">
          {project.stages.map((stage, i) => (
            <div key={stage.id} className="flex items-stretch gap-2 flex-1">
              <StageCard stage={stage} />
              {i < project.stages.length - 1 && (
                <div className="flex items-center text-muted-foreground/50">
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Video preview + timeline */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 flex items-center justify-center bg-[hsl(240_10%_7%)] min-h-0 relative p-6">
          <div className={cn(
            'relative bg-[hsl(240_10%_4%)] rounded-md border border-border overflow-hidden shadow-2xl flex items-center justify-center',
            project.format === 'shortform' ? 'aspect-[9/16] max-h-full w-auto' : 'aspect-video w-full max-h-full',
          )}
            style={{ maxWidth: project.format === 'shortform' ? '320px' : '100%' }}
          >
            {/* Stage preview — visualize what the viewer sees */}
            <VideoPreviewMock project={project} playing={playing} />

            {/* Play/pause overlay */}
            <button
              onClick={() => setPlaying(!playing)}
              className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors group"
            >
              {!playing && (
                <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                  <Play className="h-6 w-6 text-black fill-current ml-1" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Timeline tracks */}
        <TimelineTracks project={project} />
      </div>
    </>
  );
}

function StageCard({ stage }: { stage: Stage }) {
  const statusStyles = {
    pending: 'border-border bg-card/50 text-muted-foreground',
    running: 'border-accent bg-accent/5 text-foreground shadow-[0_0_20px_hsl(var(--accent)/0.15)]',
    complete: 'border-success/40 bg-success/5 text-foreground',
    error: 'border-destructive bg-destructive/5 text-foreground',
    skipped: 'border-border/50 bg-card/30 text-muted-foreground opacity-60',
  } as const;

  const StatusIcon =
    stage.status === 'running' ? Loader2 :
    stage.status === 'complete' ? CheckCircle2 :
    stage.status === 'error' ? AlertTriangle :
    stage.status === 'skipped' ? X :
    Clock;

  return (
    <div className={cn(
      'flex-1 min-w-0 rounded-md border p-3 transition-all',
      statusStyles[stage.status],
    )}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-muted-foreground">STAGE {stage.id}</span>
          </div>
          <h4 className="text-sm font-semibold truncate">{stage.name}</h4>
        </div>
        <StatusIcon className={cn('h-4 w-4 shrink-0', stage.status === 'running' && 'animate-spin text-accent', stage.status === 'complete' && 'text-success', stage.status === 'error' && 'text-destructive')} />
      </div>
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-2">
        <Terminal className="h-3 w-3" />
        <span className="font-mono">{stage.tool}</span>
      </div>
      {stage.status === 'running' && stage.progress !== undefined && (
        <div className="h-1 rounded-full bg-border overflow-hidden">
          <div className="h-full bg-accent transition-all" style={{ width: `${Math.round(stage.progress * 100)}%` }} />
        </div>
      )}
      {stage.status === 'complete' && stage.completedAt && (
        <div className="text-[10px] text-muted-foreground font-mono">
          ✓ done · {new Date(stage.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
      {stage.status === 'pending' && (
        <div className="text-[10px] text-muted-foreground">awaiting previous stage</div>
      )}
    </div>
  );
}

function VideoPreviewMock({ project, playing: _playing }: { project: VideoProject; playing: boolean }) {
  // Visual mock of the rendered frame. Shows brand bug + caption + chapter indicator.
  const currentChapter = project.chapters?.[0];
  const sampleCaption = project.transcript?.[0];

  if (project.status === 'draft' && project.sources.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-6">
        <Upload className="h-10 w-10 mx-auto mb-2 opacity-40" />
        <p className="text-xs">No footage uploaded</p>
      </div>
    );
  }

  if (project.stages[0].status !== 'complete') {
    return (
      <div className="text-center text-muted-foreground p-6">
        <Loader2 className="h-10 w-10 mx-auto mb-2 opacity-40 animate-spin" />
        <p className="text-xs">Waiting on stage 1 cut...</p>
      </div>
    );
  }

  // Rich preview mock once stage 1 complete
  return (
    <div className="absolute inset-0">
      {/* Simulated talking-head background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(240_10%_15%)] via-[hsl(240_10%_8%)] to-[hsl(240_10%_4%)]" />

      {/* Chapter indicator (bottom left) */}
      {currentChapter && project.format === 'longform' && (
        <div className="absolute top-4 left-4 px-2 py-1 rounded bg-black/60 backdrop-blur text-[10px] font-mono">
          <span className="text-[hsl(186_100%_50%)]">CH {currentChapter.num}</span>
          <span className="text-white/80 ml-1.5">{currentChapter.title}</span>
        </div>
      )}

      {/* Mock caption */}
      {sampleCaption && (
        <div className={cn(
          'absolute left-1/2 -translate-x-1/2 text-center px-6',
          project.format === 'shortform' ? 'top-1/2 -translate-y-1/2' : 'bottom-[22%]'
        )}>
          <div className={cn(
            'font-extrabold uppercase inline-flex flex-wrap gap-x-2 gap-y-1 justify-center',
            project.format === 'shortform' ? 'text-2xl' : 'text-xl'
          )} style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
            {project.transcript?.slice(0, 5).map((w, i) => (
              <span key={i} className={cn(
                'drop-shadow-lg',
                w.highlight ? 'text-[hsl(186_100%_50%)]' : 'text-white',
              )} style={{
                textShadow: '0 2px 6px rgba(0,0,0,0.7), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
              }}>{w.word}</span>
            ))}
          </div>
        </div>
      )}

      {/* Brand bug (bottom right) */}
      {project.stages[1].status === 'complete' && (
        <div className="absolute bottom-3 right-3 text-[10px] font-bold text-white/60 tracking-wider">
          DNA
        </div>
      )}

      {/* Safe area guides */}
      <div className="absolute inset-[10%] border border-[hsl(186_100%_50%/0.1)] pointer-events-none" />
    </div>
  );
}

function TimelineTracks({ project }: { project: VideoProject }) {
  const duration = project.durationSeconds ?? 0;
  if (duration === 0) {
    return (
      <div className="h-32 border-t border-border bg-card/40 flex items-center justify-center">
        <span className="text-[11px] text-muted-foreground">Timeline available after stage 1 completes</span>
      </div>
    );
  }

  const pct = (t: number) => `${(t / duration) * 100}%`;

  return (
    <div className="border-t border-border bg-card/40 shrink-0 overflow-hidden">
      <div className="px-4 pt-2 pb-1 flex items-center gap-3">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Timeline</span>
        <span className="text-[10px] font-mono text-muted-foreground">{formatDuration(duration)}</span>
      </div>

      <div className="px-4 py-2 space-y-1">
        {/* Ruler */}
        <div className="relative h-5 border-b border-border/50">
          {Array.from({ length: 11 }, (_, i) => {
            const t = (duration / 10) * i;
            return (
              <div key={i} className="absolute top-0 flex flex-col items-start" style={{ left: `${i * 10}%` }}>
                <div className="h-1.5 w-px bg-border" />
                <span className="text-[9px] font-mono text-muted-foreground">{formatDuration(t)}</span>
              </div>
            );
          })}
        </div>

        {/* Video track */}
        <TrackLane icon={Video} label="Video">
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(210_80%_55%/0.35)] to-[hsl(210_80%_55%/0.2)] border border-[hsl(210_80%_55%/0.4)] rounded" />
          {project.cuts?.filter(c => c.type === 'angle_switch').map((c, i) => (
            <div key={i} className="absolute top-0 bottom-0 w-px bg-white/50" style={{ left: pct(c.atTime) }} />
          ))}
        </TrackLane>

        {/* B-roll */}
        <TrackLane icon={Film} label="B-roll">
          {project.cuts?.filter(c => c.type === 'b_roll_in').map((c, i) => {
            const endEvent = project.cuts?.find(e => e.type === 'b_roll_out' && e.atTime > c.atTime);
            const width = endEvent ? `${((endEvent.atTime - c.atTime) / duration) * 100}%` : '4%';
            return (
              <div key={i} className="absolute top-0 bottom-0 bg-[hsl(186_100%_50%/0.3)] border border-[hsl(186_100%_50%/0.5)] rounded" style={{ left: pct(c.atTime), width }}>
                <span className="absolute left-1 top-0.5 text-[9px] font-mono text-[hsl(186_100%_50%)]">{c.sourceFile}</span>
              </div>
            );
          })}
        </TrackLane>

        {/* Chapters */}
        <TrackLane icon={Layers} label="Chapters">
          {project.chapters?.map((ch) => (
            <div key={ch.num} className="absolute top-0 bottom-0 bg-[hsl(255_62%_69%/0.25)] border-l-2 border-[hsl(255_62%_69%)] rounded-r" style={{ left: pct(ch.startTime ?? 0), width: pct((ch.endTime ?? 0) - (ch.startTime ?? 0)) }}>
              <span className="absolute left-1 top-0.5 text-[9px] font-medium text-[hsl(255_62%_69%)] truncate max-w-full pr-1">
                CH {ch.num}: {ch.title}
              </span>
            </div>
          ))}
        </TrackLane>

        {/* Captions */}
        <TrackLane icon={Type} label="Captions">
          <div className="absolute inset-y-0 left-0 right-0 flex items-center gap-[1px] overflow-hidden">
            {project.transcript?.slice(0, 80).map((w, i) => (
              <div
                key={i}
                className={cn(
                  'h-3 rounded-[1px]',
                  w.highlight ? 'bg-[hsl(186_100%_50%/0.7)]' : 'bg-white/20',
                )}
                style={{ width: `${Math.max(0.5, (w.end - w.start) / duration * 100)}%` }}
              />
            ))}
          </div>
        </TrackLane>

        {/* Zoom punches */}
        <TrackLane icon={Zap} label="Zooms">
          {project.zooms?.map((z, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 bg-accent/40 border border-accent rounded flex items-center justify-center"
              style={{ left: pct(z.atTime), width: pct(z.duration) }}
            >
              <span className="text-[9px] font-mono text-accent-foreground px-1">{z.scale}x</span>
            </div>
          ))}
        </TrackLane>

        {/* Graphics (chapter cards, CTA, bridge) */}
        <TrackLane icon={Sparkles} label="Graphics">
          {project.graphics?.map((g, i) => {
            const tone =
              g.type === 'chapter_card' ? '255 62% 69%' :      // purple
              g.type === 'mid_roll_cta' ? '222 100% 50%' :    // primary
              g.type === 'bridge_end_card' ? '186 100% 50%' : // cyan
              g.type === 'text_pop' ? '0 0% 100%' :           // white
              '186 100% 50%';
            const label =
              g.type === 'chapter_card' ? 'CC' :
              g.type === 'mid_roll_cta' ? 'CTA' :
              g.type === 'bridge_end_card' ? 'END' :
              g.type === 'text_pop' ? 'POP' :
              '•';
            return (
              <div
                key={i}
                className="absolute top-0 bottom-0 rounded border"
                style={{
                  left: pct(g.atTime),
                  width: pct(g.duration),
                  backgroundColor: `hsl(${tone} / 0.3)`,
                  borderColor: `hsl(${tone} / 0.7)`,
                }}
              >
                <span
                  className="absolute left-1 top-0.5 text-[9px] font-mono font-bold"
                  style={{ color: `hsl(${tone})` }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </TrackLane>

        {/* Audio */}
        <TrackLane icon={Mic} label="Audio">
          <div className="absolute inset-0 flex items-center gap-[1px] px-px">
            {Array.from({ length: 160 }, (_, i) => {
              // Pseudo-random deterministic waveform
              const h = 20 + Math.abs(Math.sin(i * 0.7) * 60) + Math.abs(Math.cos(i * 0.3) * 20);
              return (
                <div key={i} className="flex-1 bg-muted-foreground/50 rounded-full" style={{ height: `${Math.min(100, h)}%` }} />
              );
            })}
          </div>
        </TrackLane>
      </div>
    </div>
  );
}

function TrackLane({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 shrink-0 flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] font-mono uppercase text-muted-foreground">{label}</span>
      </div>
      <div className="flex-1 relative h-6 bg-background/50 rounded border border-border/50 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

/* ------------------------ RIGHT PANEL ------------------------ */

function RightPanel({ project, activeTab, onTabChange }: { project: VideoProject; activeTab: RightTab; onTabChange: (t: RightTab) => void }) {
  const qaFailed = project.qaChecks?.filter(c => c.status === 'fail' && c.priority === 'P0').length ?? 0;
  const qaWarnings = project.qaChecks?.filter(c => c.status === 'warn').length ?? 0;

  return (
    <>
      <div className="flex border-b border-border shrink-0">
        {([
          { id: 'stages', label: 'Pipeline', icon: Terminal },
          { id: 'directives', label: 'Directives', icon: FileText },
          { id: 'qa', label: `QA${qaFailed ? ` (${qaFailed})` : qaWarnings ? ` (${qaWarnings}⚠)` : ''}`, icon: qaFailed ? AlertTriangle : CheckCircle2 },
        ] as const).map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={cn(
                'flex-1 px-3 py-2.5 text-[11px] font-medium border-b-2 transition-colors flex items-center justify-center gap-1.5',
                active ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className={cn('h-3.5 w-3.5', t.id === 'qa' && qaFailed > 0 && 'text-destructive')} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-4">
        {activeTab === 'stages' && <StagesTab project={project} />}
        {activeTab === 'directives' && <DirectivesTab project={project} />}
        {activeTab === 'qa' && <QATab project={project} />}
      </div>
    </>
  );
}

function StagesTab({ project }: { project: VideoProject }) {
  return (
    <div className="space-y-4">
      {project.stages.map((s) => (
        <StageDetailCard key={s.id} stage={s} />
      ))}
    </div>
  );
}

function StageDetailCard({ stage }: { stage: Stage }) {
  const [expanded, setExpanded] = useState(stage.status === 'running');
  const hasLogs = (stage.logs?.length ?? 0) > 0;

  return (
    <div className="rounded-md border border-border bg-background overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono text-muted-foreground shrink-0">S{stage.id}</span>
          <span className="text-xs font-semibold truncate">{stage.name}</span>
          <StageStatusBadge status={stage.status} />
        </div>
        {expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="border-t border-border p-3 space-y-2 bg-card/30">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Tool</span>
            <span className="font-mono">{stage.tool}</span>
          </div>
          {stage.progress !== undefined && (
            <>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-mono">{Math.round(stage.progress * 100)}%</span>
              </div>
              <div className="h-1 rounded-full bg-border overflow-hidden">
                <div className={cn('h-full transition-all', stage.status === 'complete' ? 'bg-success' : 'bg-accent')} style={{ width: `${Math.round(stage.progress * 100)}%` }} />
              </div>
            </>
          )}
          {stage.startedAt && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Started</span>
              <span className="font-mono">{new Date(stage.startedAt).toLocaleTimeString()}</span>
            </div>
          )}
          {stage.completedAt && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Done</span>
              <span className="font-mono">{new Date(stage.completedAt).toLocaleTimeString()}</span>
            </div>
          )}
          {hasLogs && (
            <div className="mt-2 pt-2 border-t border-border">
              <span className="text-[10px] uppercase font-mono text-muted-foreground block mb-1">Logs</span>
              <div className="rounded bg-[hsl(240_10%_4%)] p-2 font-mono text-[10px] leading-relaxed text-muted-foreground max-h-40 overflow-auto scrollbar-thin">
                {stage.logs!.map((line, i) => (
                  <div key={i} className="whitespace-pre-wrap">{line}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StageStatusBadge({ status }: { status: Stage['status'] }) {
  const style =
    status === 'complete' ? 'bg-success/15 text-success border-success/30' :
    status === 'running' ? 'bg-accent/15 text-accent border-accent/30' :
    status === 'error' ? 'bg-destructive/15 text-destructive border-destructive/30' :
    status === 'skipped' ? 'bg-muted text-muted-foreground border-border' :
    'bg-muted text-muted-foreground border-border';
  return (
    <span className={cn('text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border', style)}>
      {status}
    </span>
  );
}

function DirectivesTab({ project }: { project: VideoProject }) {
  const d = project.directives;
  return (
    <div className="space-y-4 text-[11px]">
      <Section title="Format">
        <InfoRow label="Type" value={project.format === 'shortform' ? 'Short-form (9:16)' : 'Long-form (16:9)'} />
        {d.targetDuration && <InfoRow label="Target duration" value={d.targetDuration} />}
      </Section>

      {d.credibilityAnchor && (
        <Section title="Credibility anchor">
          <p className="text-foreground italic">"{d.credibilityAnchor}"</p>
        </Section>
      )}

      <Section title={`Chapters (${d.chapters.length})`}>
        {d.chapters.length === 0 ? (
          <span className="text-muted-foreground">None yet — will auto-derive from transcript</span>
        ) : (
          <ol className="space-y-1">
            {d.chapters.map((ch, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="font-mono text-muted-foreground shrink-0">{i + 1}.</span>
                <span>{ch}</span>
              </li>
            ))}
          </ol>
        )}
      </Section>

      <Section title={`Filler words to remove (${d.fillerWords.length})`}>
        <div className="flex flex-wrap gap-1">
          {d.fillerWords.map((w) => (
            <span key={w} className="px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20 font-mono text-[10px]">
              {w}
            </span>
          ))}
          {d.fillerWords.length === 0 && <span className="text-muted-foreground">video-use defaults only</span>}
        </div>
      </Section>

      {d.skipRanges.length > 0 && (
        <Section title={`Skip ranges (${d.skipRanges.length})`}>
          <div className="space-y-1.5">
            {d.skipRanges.map((r, i) => (
              <div key={i} className="rounded border border-border bg-card/30 p-2">
                <div className="font-mono text-[10px] text-muted-foreground">{r.source}</div>
                <div className="font-mono">{r.from} → {r.to}</div>
                <div className="text-muted-foreground mt-0.5">{r.reason}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {d.preserve.length > 0 && (
        <Section title={`Must preserve (${d.preserve.length})`}>
          <div className="space-y-1.5">
            {d.preserve.map((p, i) => (
              <div key={i} className="rounded border border-success/30 bg-success/5 p-2">
                <div className="italic">"{p.phrase}"</div>
                <div className="text-muted-foreground mt-0.5 text-[10px]">{p.reason}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {d.midRollCta && (
        <Section title="Mid-roll CTA">
          <p className="text-foreground">{d.midRollCta.copy}</p>
          {d.midRollCta.url && <p className="text-muted-foreground text-[10px] font-mono mt-1">{d.midRollCta.url}</p>}
        </Section>
      )}

      {d.bridge && (
        <Section title="Bridge end card">
          <p className="text-foreground">{d.bridge.nextVideoTitle}</p>
          {d.bridge.nextVideoThumb && <p className="text-muted-foreground text-[10px] font-mono mt-1">{d.bridge.nextVideoThumb}</p>}
        </Section>
      )}

      <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5 mt-4">
        <FileText className="h-3 w-3" />
        Edit directives.md
      </Button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">{title}</div>
      <div>{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function QATab({ project }: { project: VideoProject }) {
  if (!project.qaChecks || project.qaChecks.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-xs">QA report available after pipeline completes</p>
      </div>
    );
  }

  const grouped = {
    P0: project.qaChecks.filter(c => c.priority === 'P0'),
    P1: project.qaChecks.filter(c => c.priority === 'P1'),
    advisory: project.qaChecks.filter(c => c.priority === 'advisory'),
  };

  const failCount = grouped.P0.filter(c => c.status === 'fail').length;
  const ready = failCount === 0;

  return (
    <div className="space-y-4">
      {/* Verdict */}
      <div className={cn(
        'rounded-md border p-3',
        ready ? 'border-success/40 bg-success/5' : 'border-destructive/40 bg-destructive/5',
      )}>
        <div className="flex items-center gap-2">
          {ready ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertTriangle className="h-4 w-4 text-destructive" />}
          <span className={cn('text-sm font-semibold', ready ? 'text-success' : 'text-destructive')}>
            {ready ? 'READY TO RENDER' : `${failCount} P0 failure${failCount === 1 ? '' : 's'} blocking render`}
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground mt-1">
          {grouped.P0.filter(c => c.status === 'pass').length}/{grouped.P0.length} P0 checks passed ·{' '}
          {grouped.P1.filter(c => c.status === 'pass').length}/{grouped.P1.length} P1 passed
        </div>
      </div>

      {/* Check groups */}
      {grouped.P0.length > 0 && <QAGroup title="P0 · Must pass before render" checks={grouped.P0} />}
      {grouped.P1.length > 0 && <QAGroup title="P1 · Warnings (non-blocking)" checks={grouped.P1} />}
      {grouped.advisory.length > 0 && <QAGroup title="Advisory · Improvement notes" checks={grouped.advisory} />}
    </div>
  );
}

function QAGroup({ title, checks }: { title: string; checks: QACheck[] }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">{title}</div>
      <div className="space-y-1.5">
        {checks.map((c) => (
          <QACheckRow key={c.id} check={c} />
        ))}
      </div>
    </div>
  );
}

function QACheckRow({ check }: { check: QACheck }) {
  const statusIcon =
    check.status === 'pass' ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> :
    check.status === 'fail' ? <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> :
    check.status === 'warn' ? <AlertTriangle className="h-3.5 w-3.5 text-warning" /> :
    <Clock className="h-3.5 w-3.5 text-muted-foreground" />;

  const borderStyle =
    check.status === 'pass' ? 'border-border' :
    check.status === 'fail' ? 'border-destructive/40 bg-destructive/5' :
    check.status === 'warn' ? 'border-warning/40 bg-warning/5' :
    'border-border';

  return (
    <div className={cn('rounded border p-2', borderStyle)}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{statusIcon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground">{check.id}</span>
            <span className="text-[11px] font-medium flex-1">{check.label}</span>
          </div>
          {check.detail && (
            <div className="text-[10px] text-muted-foreground mt-0.5">{check.detail}</div>
          )}
          {check.suggestedFix && (
            <div className="text-[10px] text-foreground bg-background rounded px-1.5 py-1 mt-1 border border-border">
              <span className="font-mono text-muted-foreground">fix:</span> {check.suggestedFix}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
