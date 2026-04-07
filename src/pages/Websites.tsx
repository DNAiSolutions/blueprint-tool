import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { useClientContext } from '@/hooks/useClientContext';
import { cn } from '@/lib/utils';
import { Sparkles, Edit3, Eye, ExternalLink, Globe } from 'lucide-react';

const sites = [
  { client: 'DigitalDNA', domain: 'digitaldna.agency', status: 'live', updated: 'Apr 4', mrr: 0, internal: true },
  { client: 'Acme Pressure Washing', domain: 'acmepressurewashing.com', status: 'live', updated: 'Apr 4', mrr: 97, internal: false },
  { client: 'Bayou Landscaping', domain: 'bayoulandscaping.com', status: 'needs_update', updated: 'Mar 28', mrr: 97, internal: false },
  { client: 'Magnolia Concrete', domain: 'magnoliaconcrete.com', status: 'live', updated: 'Apr 1', mrr: 97, internal: false },
  { client: 'Tidewater Lawn Care', domain: 'tidewaterlawncare.com', status: 'draft', updated: 'Apr 5', mrr: 0, internal: false },
  { client: 'Pontchartrain Plumbing', domain: 'pontplumbing.com', status: 'draft', updated: 'Apr 3', mrr: 0, internal: false },
];

const templates = ['Pressure Washing', 'Landscaping', 'Roofing', 'HVAC', 'Painting', 'Plumbing', 'Fencing', 'Pool Services'];

export default function Websites() {
  const { selectedClient } = useClientContext();

  const filteredSites = sites.filter(s => {
    if (!selectedClient) return true;
    if (selectedClient.is_internal) return s.internal;
    return s.client === selectedClient.business_name;
  });

  const showClientCol = !selectedClient;

  return (
    <AppLayout>
      <header className="flex h-14 items-center justify-between border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold">Website Builder</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs">Templates</Button>
          <Button size="sm" className="gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Generate New Site</Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6 scrollbar-thin">
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className={cn('grid px-4 py-2.5 border-b border-border text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider', showClientCol ? 'grid-cols-[2fr_2fr_100px_80px_60px_200px]' : 'grid-cols-[2fr_100px_80px_60px_200px]')}>
            {showClientCol && <span>Client</span>}<span>Domain</span><span>Status</span><span>Updated</span><span>MRR</span><span>Actions</span>
          </div>
          {filteredSites.map((s, i) => (
            <div key={i} className={cn('grid px-4 py-3 items-center text-[13px]', showClientCol ? 'grid-cols-[2fr_2fr_100px_80px_60px_200px]' : 'grid-cols-[2fr_100px_80px_60px_200px]', i % 2 === 0 ? 'bg-card' : 'bg-background')}>
              {showClientCol && <span className="font-medium">{s.client}{s.internal && <span className="ml-1.5 text-[10px] text-primary font-mono">(internal)</span>}</span>}
              <span className="text-[hsl(210,80%,55%)]">{s.domain}</span>
              <StatusBadge status={s.status} />
              <span className="text-xs text-muted-foreground">{s.updated}</span>
              <span className={cn('font-semibold', s.mrr > 0 ? 'text-accent' : 'text-muted-foreground')}>${s.mrr}</span>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="gap-1 text-xs h-7"><Edit3 className="h-3 w-3" /> Edit</Button>
                <Button variant="outline" size="sm" className="text-xs h-7"><Eye className="h-3 w-3" /></Button>
                <Button size="sm" className="gap-1 text-xs h-7"><ExternalLink className="h-3 w-3" /> Deploy</Button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-3">
          {templates.map(t => (
            <div key={t} className="bg-card border border-border rounded-lg p-4 cursor-pointer text-center hover:border-accent/40 transition-colors">
              <Globe className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <div className="text-[13px] font-medium">{t}</div>
              <div className="text-[11px] text-muted-foreground">Template</div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
