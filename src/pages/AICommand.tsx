import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Zap, Send, RefreshCw, Link, FileText, X } from 'lucide-react';

const quickCommands = [
  'Write 20 scripts for this week',
  'Generate storyboards for pending scripts',
  'Render approved scripts in HeyGen',
  'Find 50 HVAC businesses in Houston',
  'Generate 7 carousels for this week',
  'Build weekly content report',
  'Audit all live client websites',
  'Run full pipeline report',
];

const mockAILogs = [
  { id: 'a1', action: 'Generated 5 reel scripts for Monday batch', module: 'Content', status: 'success', time: '2 min ago', duration: '12s' },
  { id: 'a2', action: 'HeyGen video render — Acme PW Script #3', module: 'Content', status: 'success', time: '15 min ago', duration: '3m 42s' },
  { id: 'a3', action: 'Apollo search — 50 HVAC businesses in Houston', module: 'Leads', status: 'success', time: '1 hr ago', duration: '8s' },
  { id: 'a4', action: 'KIE.ai image generation — carousel slide 4', module: 'Content', status: 'running', time: 'Just now', duration: '—' },
  { id: 'a5', action: 'Vercel deploy — Bayou Landscaping site', module: 'Websites', status: 'error', time: '3 hrs ago', duration: '45s' },
];

const integrations = [
  { name: 'Claude MCP', icon: '🤖', status: 'connected' },
  { name: 'HeyGen', icon: '🎥', status: 'connected' },
  { name: 'Eleven Labs', icon: '🎙️', status: 'connected' },
  { name: 'KIE.ai', icon: '🖼️', status: 'connected' },
  { name: 'Apollo', icon: '🔍', status: 'connected' },
  { name: 'GoHighLevel', icon: '📱', status: 'connected' },
  { name: 'Blotato', icon: '📅', status: 'connected' },
  { name: 'Vercel', icon: '▲', status: 'error' },
  { name: 'Netlify', icon: '◆', status: 'disconnected' },
  { name: 'Stitch', icon: '🧵', status: 'disconnected' },
  { name: 'Stripe', icon: '💳', status: 'connected' },
  { name: 'Canva', icon: '🎨', status: 'disconnected' },
  { name: 'WaveSpeed', icon: '🌊', status: 'connected' },
];

export default function AICommand() {
  const [subTab, setSubTab] = useState('console');
  const tabs = ['console', 'activity', 'connections', 'templates'];

  return (
    <AppLayout>
      <header className="flex h-14 items-center border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold">AI Command Center</h1>
      </header>

      <div className="flex border-b border-border px-6 shrink-0">
        {tabs.map(t => (
          <button key={t} onClick={() => setSubTab(t)} className={cn(
            'px-4 py-2.5 text-[13px] font-medium capitalize border-b-2 transition-colors',
            subTab === t ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
          )}>{t}</button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4 scrollbar-thin">
        {subTab === 'console' && (
          <>
            {/* Quick Dispatch */}
            <div className="grid grid-cols-4 gap-2">
              {quickCommands.map((cmd, i) => (
                <button key={i} className="p-3 bg-card border border-border rounded-lg text-left text-xs font-medium hover:border-accent/40 transition-colors">
                  <Zap className="h-3.5 w-3.5 text-accent mb-1" />
                  <div>{cmd}</div>
                </button>
              ))}
            </div>
            {/* Command Input */}
            <div className="flex gap-2">
              <textarea placeholder="Enter a custom command for Claude..." className="flex-1 p-3 rounded-lg border border-border bg-card text-sm resize-none h-[60px] focus:border-accent outline-none" />
              <Button className="self-end gap-1.5"><Send className="h-3.5 w-3.5" /> Send</Button>
            </div>
            {/* Response */}
            <div className="bg-card border border-border rounded-lg p-4 min-h-[200px] font-mono text-sm text-muted-foreground">
              <div className="text-accent">{'>'} Waiting for command...</div>
              <div className="mt-3 border-t border-border pt-3 text-xs">
                Last output: Generated 5 reel scripts for Monday batch (12s)
              </div>
            </div>
          </>
        )}

        {subTab === 'activity' && (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {mockAILogs.map((l, i) => (
              <div key={l.id} className={cn('flex items-center gap-3 px-4 py-3 border-b border-border/50', i % 2 === 0 ? 'bg-card' : 'bg-background')}>
                <StatusBadge status={l.status} />
                <span className="flex-1 text-[13px]">{l.action}</span>
                <StatusBadge status={l.module.toLowerCase()} />
                <span className="text-xs text-muted-foreground font-mono">{l.duration}</span>
                <span className="text-xs text-muted-foreground">{l.time}</span>
              </div>
            ))}
          </div>
        )}

        {subTab === 'connections' && (
          <div className="grid grid-cols-3 gap-3">
            {integrations.map(int => (
              <div key={int.name} className={cn('bg-card border rounded-lg p-4', int.status === 'error' ? 'border-destructive/30' : 'border-border')}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{int.icon}</span>
                    <span className="text-sm font-semibold">{int.name}</span>
                  </div>
                  <div className={cn('w-2 h-2 rounded-full', int.status === 'connected' ? 'bg-success' : int.status === 'error' ? 'bg-destructive' : 'bg-muted-foreground')} />
                </div>
                <StatusBadge status={int.status} />
                <div className="flex gap-1.5 mt-3">
                  <Button variant="outline" size="sm" className="gap-1 text-xs h-7"><RefreshCw className="h-3 w-3" /> Test</Button>
                  {int.status === 'disconnected' && <Button size="sm" className="gap-1 text-xs h-7"><Link className="h-3 w-3" /> Connect</Button>}
                </div>
              </div>
            ))}
          </div>
        )}

        {subTab === 'templates' && <EmptyState icon={FileText} title="No saved prompt templates yet" actionLabel="Create Template" onAction={() => {}} />}
      </div>
    </AppLayout>
  );
}
