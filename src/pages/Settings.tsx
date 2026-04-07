import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { RefreshCw, X, Link, Edit3 } from 'lucide-react';

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

export default function SettingsPage() {
  const [subTab, setSubTab] = useState('integrations');
  const tabs = ['integrations', 'brand', 'account'];

  return (
    <AppLayout>
      <header className="flex h-14 items-center border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold">Settings</h1>
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
        {subTab === 'integrations' && (
          <div className="grid grid-cols-2 gap-3">
            {integrations.map(int => (
              <div key={int.name} className={cn('bg-card border rounded-lg p-4', int.status === 'error' ? 'border-destructive/30' : 'border-border')}>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{int.icon}</span>
                    <span className="text-sm font-semibold">{int.name}</span>
                  </div>
                  <StatusBadge status={int.status} />
                </div>
                <Input
                  type="password"
                  placeholder="API Key"
                  defaultValue={int.status === 'connected' ? '••••••••••••' : ''}
                  readOnly
                  className="mb-2 text-sm"
                />
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" className="gap-1 text-xs h-7"><RefreshCw className="h-3 w-3" /> Test</Button>
                  <Button variant="outline" size="sm" className="text-xs h-7">Save</Button>
                  {int.status === 'connected' && <Button variant="destructive" size="sm" className="gap-1 text-xs h-7"><X className="h-3 w-3" /> Disconnect</Button>}
                </div>
              </div>
            ))}
          </div>
        )}

        {subTab === 'brand' && (
          <div className="space-y-4 max-w-xl">
            <div className="bg-card border border-border rounded-lg p-4">
              <span className="text-sm font-semibold block mb-3">Brand Identity</span>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Business Name</label>
                  <Input defaultValue="DigitalDNA" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Tagline</label>
                  <Input defaultValue="Your Business. Our AI. Real Growth." />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-accent border-2 border-border" />
                    <Input defaultValue="#00D4AA" className="w-32" />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <span className="text-sm font-semibold block mb-2">Brand Voice Reference</span>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Confident. Direct. Data-driven. Speaks to local service business owners as equals, not students. Leads with specifics, not fluff. Always ties back to real numbers and real outcomes.
              </p>
              <p className="text-xs text-[hsl(210,80%,55%)] mt-2">Full reference: brand-voice-reference.md</p>
            </div>
          </div>
        )}

        {subTab === 'account' && (
          <div className="max-w-md">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-[hsl(210,80%,55%)] flex items-center justify-center text-2xl font-bold text-accent-foreground">D</div>
                <div>
                  <div className="text-lg font-semibold">Daysha</div>
                  <div className="text-[13px] text-muted-foreground">dna@digitaldna.agency</div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1 text-xs"><Edit3 className="h-3 w-3" /> Edit Profile</Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
