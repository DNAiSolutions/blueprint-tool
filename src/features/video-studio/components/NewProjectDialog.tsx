// NewProjectDialog — scaffold a new video project. Matches the shell
// script (scripts/new-project.sh) in the video-edit-system skill.

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Monitor, Smartphone } from 'lucide-react';
import { STAGES_DEFAULT, type VideoFormat, type VideoProject } from '../types';

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (project: VideoProject) => void;
}

const CLIENT_OPTIONS = [
  { tag: 'internal', name: 'DigitalDNA' },
  { tag: 'acme', name: 'Acme Pressure Washing' },
  { tag: 'nola', name: 'NOLA Roofing Pros' },
  { tag: 'bayou', name: 'Bayou Landscaping' },
];

export function NewProjectDialog({ open, onOpenChange, onCreate }: NewProjectDialogProps) {
  const [title, setTitle] = useState('');
  const [clientTag, setClientTag] = useState('internal');
  const [format, setFormat] = useState<VideoFormat>('longform');
  const [targetDuration, setTargetDuration] = useState('10-12 min');
  const [chaptersText, setChaptersText] = useState('');
  const [credibilityAnchor, setCredibilityAnchor] = useState('');
  const [midRollCta, setMidRollCta] = useState('');
  const [bridgeTitle, setBridgeTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const client = CLIENT_OPTIONS.find((c) => c.tag === clientTag) ?? CLIENT_OPTIONS[0];
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50);

    const chapters = chaptersText.split('\n').map((l) => l.trim()).filter(Boolean);

    const project: VideoProject = {
      id: `vp-${Date.now()}`,
      slug,
      title: title.trim(),
      clientName: client.name,
      clientTag: client.tag,
      format,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      width: format === 'shortform' ? 1080 : 1920,
      height: format === 'shortform' ? 1920 : 1080,
      fps: 30,
      sources: [],
      directives: {
        targetDuration: targetDuration.trim() || undefined,
        fillerWords: ['basically', 'kind of', 'so basically', 'at the end of the day'],
        skipRanges: [],
        chapters,
        preserve: [],
        credibilityAnchor: credibilityAnchor.trim() || undefined,
        midRollCta: midRollCta.trim() ? { copy: midRollCta.trim() } : undefined,
        bridge: bridgeTitle.trim() ? { nextVideoTitle: bridgeTitle.trim() } : undefined,
      },
      stages: STAGES_DEFAULT.map((s) => ({ ...s })),
    };

    onCreate(project);

    // Reset form
    setTitle('');
    setClientTag('internal');
    setFormat('longform');
    setTargetDuration('10-12 min');
    setChaptersText('');
    setCredibilityAnchor('');
    setMidRollCta('');
    setBridgeTitle('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>New Video Project</DialogTitle>
          <DialogDescription>
            Scaffold a new DigitalDNA video project. You can fill in all the directives
            now or add them later — the pipeline will ask for anything missing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="BREAKING: GoHighLevel Just Made AI FREE"
              required
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Client</Label>
              <Select value={clientTag} onValueChange={setClientTag}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CLIENT_OPTIONS.map((c) => (
                    <SelectItem key={c.tag} value={c.tag}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Target duration</Label>
              <Input
                value={targetDuration}
                onChange={(e) => setTargetDuration(e.target.value)}
                placeholder="10-12 min"
                className="text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Format</Label>
            <div className="grid grid-cols-2 gap-2">
              <FormatOption
                active={format === 'longform'}
                onClick={() => setFormat('longform')}
                icon={Monitor}
                label="Long-form"
                detail="1920×1080 · YouTube"
              />
              <FormatOption
                active={format === 'shortform'}
                onClick={() => setFormat('shortform')}
                icon={Smartphone}
                label="Short-form"
                detail="1080×1920 · Reels/Shorts"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Credibility anchor (spoken in first 25s)</Label>
            <Input
              value={credibilityAnchor}
              onChange={(e) => setCredibilityAnchor(e.target.value)}
              placeholder="I run a $400K/mo agency and I've been testing this for 72 hours"
              className="text-sm"
            />
          </div>

          {format === 'longform' && (
            <div className="space-y-1.5">
              <Label className="text-xs">
                Chapters <span className="text-muted-foreground">(one per line, min 3)</span>
              </Label>
              <Textarea
                value={chaptersText}
                onChange={(e) => setChaptersText(e.target.value)}
                placeholder={'What GoHighLevel Just Made Free\nInside the AI Employee Plan\nThe Real Cost Breakdown\nLive Demo with Maddie\'s Mobile Makeovers\nBottom Line — Who Should Upgrade'}
                rows={5}
                className="text-sm font-mono"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">Mid-roll CTA copy</Label>
            <Input
              value={midRollCta}
              onChange={(e) => setMidRollCta(e.target.value)}
              placeholder="Join the AI Business Blueprint community free"
              className="text-sm"
            />
          </div>

          {format === 'longform' && (
            <div className="space-y-1.5">
              <Label className="text-xs">Bridge end card — next video title</Label>
              <Input
                value={bridgeTitle}
                onChange={(e) => setBridgeTitle(e.target.value)}
                placeholder="I built a $10K/mo agency using just Claude"
                className="text-sm"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!title.trim()}>
              Create project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormatOption({ active, onClick, icon: Icon, label, detail }: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  detail: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-md border-2 transition-all text-left',
        active ? 'border-accent bg-accent/5' : 'border-border bg-card hover:border-accent/40',
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0', active ? 'text-accent' : 'text-muted-foreground')} />
      <div className="min-w-0">
        <div className="text-xs font-semibold">{label}</div>
        <div className="text-[10px] text-muted-foreground">{detail}</div>
      </div>
    </button>
  );
}
