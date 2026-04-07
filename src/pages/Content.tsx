import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { useClientContext } from '@/hooks/useClientContext';
import { cn } from '@/lib/utils';
import {
  Plus, ChevronLeft, ChevronRight, Filter, Play, Copy, Image,
  Eye, CheckCircle, FileText,
} from 'lucide-react';

const mockScripts = [
  { id: 's1', title: 'Stop Paying $3,200/mo for Dead Leads', client: 'Acme Pressure Washing', clientTag: 'acme', pillar: 'The Math', platform: 'Instagram Reels', status: 'approved', scheduledAt: 'Apr 7' },
  { id: 's2', title: 'Your GBP is Costing You $50K/yr', client: 'NOLA Roofing Pros', clientTag: 'nola', pillar: 'The Math', platform: 'TikTok', status: 'draft', scheduledAt: null },
  { id: 's3', title: 'I Built a Content Machine for $97/mo', client: 'DigitalDNA', clientTag: 'internal', pillar: 'Behind the Build', platform: 'YouTube Shorts', status: 'in_production', scheduledAt: 'Apr 8' },
  { id: 's4', title: 'Why Your Website is Invisible', client: 'Bayou Landscaping', clientTag: 'bayou', pillar: 'Systems Thinking', platform: 'Instagram Reels', status: 'scheduled', scheduledAt: 'Apr 9' },
  { id: 's5', title: 'This HVAC Company Gets 40 Calls/Week', client: 'DigitalDNA', clientTag: 'internal', pillar: 'Industry Spotlights', platform: 'TikTok', status: 'published', scheduledAt: 'Apr 4' },
  { id: 's6', title: 'The $97 Website That Outperforms $5K Builds', client: 'DigitalDNA', clientTag: 'internal', pillar: 'Proof & Results', platform: 'Instagram Reels', status: 'in_review', scheduledAt: 'Apr 10' },
];

const CLIENT_COLORS: Record<string, string> = {
  internal: 'hsl(var(--primary))',
  acme: 'hsl(210,80%,55%)',
  nola: 'hsl(var(--warning))',
  bayou: 'hsl(var(--success))',
};

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const contentCalendar: Record<string, { type: string; title: string; client: string; clientTag: string }[]> = {
  Mon: [{ type: 'video', title: 'Reel #1', client: 'DigitalDNA', clientTag: 'internal' }, { type: 'carousel', title: 'Audit Reveal', client: 'DigitalDNA', clientTag: 'internal' }],
  Tue: [{ type: 'video', title: 'TikTok #4', client: 'Acme Pressure Washing', clientTag: 'acme' }],
  Wed: [{ type: 'video', title: 'Reel #2', client: 'DigitalDNA', clientTag: 'internal' }, { type: 'image', title: 'Story', client: 'DigitalDNA', clientTag: 'internal' }, { type: 'carousel', title: 'The Math', client: 'NOLA Roofing', clientTag: 'nola' }],
  Thu: [{ type: 'video', title: 'YT Short', client: 'Bayou Landscaping', clientTag: 'bayou' }],
  Fri: [{ type: 'video', title: 'Reel #3', client: 'DigitalDNA', clientTag: 'internal' }, { type: 'carousel', title: 'Results', client: 'DigitalDNA', clientTag: 'internal' }],
  Sat: [{ type: 'image', title: 'Personal', client: 'DigitalDNA', clientTag: 'internal' }],
  Sun: [],
};

const productionJobs = [
  { status: 'running', title: 'Stop Paying $3,200/mo', client: 'Acme PW', clientTag: 'acme', type: 'Video', provider: 'HeyGen', eta: '3 min' },
  { status: 'queued', title: 'Your GBP is Costing You', client: 'NOLA Roofing', clientTag: 'nola', type: 'Video', provider: 'HeyGen', eta: '12 min' },
  { status: 'success', title: 'Carousel — Audit Reveal', client: 'DigitalDNA', clientTag: 'internal', type: 'Image', provider: 'KIE.ai', eta: 'Done' },
  { status: 'success', title: 'Voiceover — $97 Website', client: 'DigitalDNA', clientTag: 'internal', type: 'Voice', provider: 'Eleven Labs', eta: 'Done' },
  { status: 'error', title: 'Industry Spotlight HVAC', client: 'DigitalDNA', clientTag: 'internal', type: 'Video', provider: 'HeyGen', eta: 'Failed' },
];

export default function Content() {
  const [subTab, setSubTab] = useState('calendar');
  const tabs = ['calendar', 'scripts', 'production', 'review', 'published', 'templates'];
  const { selectedClient, internalClient } = useClientContext();

  // Filter helper: match by client name (mock data uses names, real data would use client_id)
  const matchesContext = (clientName: string) => {
    if (!selectedClient) return true; // "All"
    if (selectedClient.is_internal) return clientName === 'DigitalDNA';
    return clientName === selectedClient.business_name;
  };

  const filteredScripts = mockScripts.filter(s => matchesContext(s.client));
  const filteredJobs = productionJobs.filter(j => matchesContext(j.client));
  const showClientCol = !selectedClient; // show client column in "All" mode

  return (
    <AppLayout>
      <header className="flex h-14 items-center justify-between border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold">Content Studio</h1>
        <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> New Script</Button>
      </header>

      <div className="flex border-b border-border px-6 shrink-0">
        {tabs.map(t => (
          <button key={t} onClick={() => setSubTab(t)} className={cn(
            'px-4 py-2.5 text-[13px] font-medium capitalize border-b-2 transition-colors',
            subTab === t ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
          )}>{t}</button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-6 scrollbar-thin">
        {/* Calendar */}
        {subTab === 'calendar' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2 items-center">
                <span className="text-base font-semibold">April 6–12, 2026</span>
                <ChevronLeft className="h-4 w-4 text-muted-foreground cursor-pointer" />
                <ChevronRight className="h-4 w-4 text-muted-foreground cursor-pointer" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1 text-xs"><Filter className="h-3 w-3" /> Filter</Button>
                <Button variant="outline" size="sm" className="text-xs">Week</Button>
                <Button variant="outline" size="sm" className="text-xs">Month</Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((d, i) => {
                const dayItems = (contentCalendar[d] || []).filter(item => matchesContext(item.client));
                return (
                  <div key={d}>
                    <div className={cn('text-[11px] font-semibold uppercase text-center py-2 border-b border-border', i === 0 ? 'text-accent' : 'text-muted-foreground')}>{d} · Apr {6 + i}</div>
                    <div className="flex flex-col gap-1 py-2 min-h-[120px]">
                      {dayItems.map((item, j) => (
                        <div key={j} className="px-2 py-1.5 rounded-md bg-card border border-border text-xs cursor-pointer hover:border-accent/40 transition-colors" style={{ borderLeftWidth: 3, borderLeftColor: CLIENT_COLORS[item.clientTag] || 'hsl(var(--border))' }}>
                          <div className="flex items-center gap-1">
                            {item.type === 'video' ? <Play className="h-2.5 w-2.5 text-accent" /> : item.type === 'carousel' ? <Copy className="h-2.5 w-2.5 text-[hsl(210,80%,55%)]" /> : <Image className="h-2.5 w-2.5 text-warning" />}
                            <span>{item.title}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{showClientCol ? item.client : 'IG Reels'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scripts */}
        {subTab === 'scripts' && (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className={cn('grid px-4 py-2.5 border-b border-border text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider', showClientCol ? 'grid-cols-[2fr_1fr_1fr_1fr_100px_80px]' : 'grid-cols-[2fr_1fr_1fr_100px_80px]')}>
              <span>Title</span>{showClientCol && <span>Client</span>}<span>Pillar</span><span>Platform</span><span>Status</span><span>Date</span>
            </div>
            {filteredScripts.map((s, i) => (
              <div key={s.id} className={cn('grid px-4 py-3 items-center text-[13px] cursor-pointer hover:bg-muted/30 transition-colors', showClientCol ? 'grid-cols-[2fr_1fr_1fr_1fr_100px_80px]' : 'grid-cols-[2fr_1fr_1fr_100px_80px]', i % 2 === 0 ? 'bg-card' : 'bg-background')}>
                <span className="font-medium">{s.title}</span>
                {showClientCol && <span className="text-muted-foreground">{s.client}</span>}
                <StatusBadge status={s.pillar.toLowerCase().replace(/\s/g, '_')} />
                <span className="text-muted-foreground">{s.platform}</span>
                <StatusBadge status={s.status} />
                <span className="text-xs text-muted-foreground">{s.scheduledAt || '—'}</span>
              </div>
            ))}
          </div>
        )}

        {/* Production */}
        {subTab === 'production' && (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-[80px_2fr_1fr_1fr_1fr_80px] px-4 py-2.5 border-b border-border text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Status</span><span>Script</span><span>Client</span><span>Type</span><span>Provider</span><span>ETA</span>
            </div>
            {filteredJobs.map((j, i) => (
              <div key={i} className={cn('grid grid-cols-[80px_2fr_1fr_1fr_1fr_80px] px-4 py-3 items-center text-[13px]', i % 2 === 0 ? 'bg-card' : 'bg-background')}>
                <StatusBadge status={j.status} />
                <span>{j.title}</span>
                <span className="text-muted-foreground">{j.client}</span>
                <span className="text-muted-foreground">{j.type}</span>
                <span className="text-muted-foreground">{j.provider}</span>
                <span className={cn('text-xs', j.eta === 'Failed' ? 'text-destructive' : 'text-muted-foreground')}>{j.eta}</span>
              </div>
            ))}
          </div>
        )}

        {/* Other tabs */}
        {!['calendar', 'scripts', 'production'].includes(subTab) && (
          <EmptyState
            icon={subTab === 'review' ? Eye : subTab === 'published' ? CheckCircle : FileText}
            title={`${subTab.charAt(0).toUpperCase() + subTab.slice(1)} view`}
            actionLabel={`Open ${subTab.charAt(0).toUpperCase() + subTab.slice(1)}`}
            onAction={() => {}}
          />
        )}
      </div>
    </AppLayout>
  );
}
