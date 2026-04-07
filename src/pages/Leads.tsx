import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Search, MessageSquare, Plus, Users, Mail, Target, Star, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';

const mockLeads = [
  { id: 'l1', source: 'instagram_comment', icon: '📸', name: 'Tony Rivera', business: 'Rivera Roofing', industry: 'Roofing', action: 'Commented "AUDIT"', score: 85, status: 'new' },
  { id: 'l2', source: 'tiktok_dm', icon: '🎵', name: 'Michelle Lee', business: "Lee's Landscaping", industry: 'Landscaping', action: "DM'd asking about AI content", score: 72, status: 'contacted' },
  { id: 'l3', source: 'bio_link', icon: '🔗', name: 'Carlos Mendez', business: 'Mendez Concrete', industry: 'Concrete', action: 'Clicked bio link', score: 45, status: 'new' },
  { id: 'l4', source: 'form', icon: '📋', name: 'Jennifer Park', business: 'Park HVAC Solutions', industry: 'HVAC', action: 'Filled out contact form', score: 90, status: 'qualified' },
  { id: 'l5', source: 'apollo', icon: '🔍', name: 'Derek Washington', business: 'DW Painting Co', industry: 'Painting', action: 'Apollo enriched', score: 60, status: 'new' },
];

export default function Leads() {
  const [subTab, setSubTab] = useState('inbound');
  const tabs = ['inbound', 'outbound', 'sequences', 'ads', 'scoring'];

  return (
    <AppLayout>
      <header className="flex h-14 items-center justify-between border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold">Leads & Outreach</h1>
        <Button size="sm" className="gap-1.5"><Search className="h-3.5 w-3.5" /> Search Apollo</Button>
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
        {subTab === 'inbound' && (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-[40px_1.5fr_1.5fr_1fr_2fr_60px_90px_180px] px-4 py-2.5 border-b border-border text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
              <span></span><span>Name</span><span>Business</span><span>Industry</span><span>Action</span><span>Score</span><span>Status</span><span>Actions</span>
            </div>
            {mockLeads.map((l, i) => (
              <div key={l.id} className={cn('grid grid-cols-[40px_1.5fr_1.5fr_1fr_2fr_60px_90px_180px] px-4 py-3 items-center text-[13px]', i % 2 === 0 ? 'bg-card' : 'bg-background')}>
                <span className="text-lg">{l.icon}</span>
                <span className="font-medium">{l.name}</span>
                <span className="text-muted-foreground">{l.business}</span>
                <span className="text-muted-foreground">{l.industry}</span>
                <span className="text-xs text-muted-foreground">{l.action}</span>
                <span className={cn('font-semibold', l.score >= 80 ? 'text-success' : l.score >= 50 ? 'text-warning' : 'text-muted-foreground')}>{l.score}</span>
                <StatusBadge status={l.status} />
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" className="gap-1 text-xs h-7"><MessageSquare className="h-3 w-3" /> DM</Button>
                  <Button variant="outline" size="sm" className="gap-1 text-xs h-7"><Plus className="h-3 w-3" /> Pipeline</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {subTab === 'outbound' && (
          <div>
            <div className="flex gap-2 mb-4 p-4 bg-card rounded-lg border border-border">
              <Input placeholder="Industry" className="flex-1" />
              <Input placeholder="Location" className="flex-1" />
              <Input placeholder="Title" className="flex-1" />
              <Button className="gap-1.5"><Search className="h-3.5 w-3.5" /> Search</Button>
            </div>
            <EmptyState icon={Users} title="Run a search to find prospects via Apollo" actionLabel="Search Now" onAction={() => {}} />
          </div>
        )}

        {!['inbound', 'outbound'].includes(subTab) && (
          <EmptyState
            icon={subTab === 'sequences' ? Mail : subTab === 'ads' ? Target : subTab === 'scoring' ? Star : FileText}
            title={`${subTab.charAt(0).toUpperCase() + subTab.slice(1)} view`}
          />
        )}
      </div>
    </AppLayout>
  );
}
