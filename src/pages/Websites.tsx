import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { useClientContext } from '@/hooks/useClientContext';
import { useTemplates } from '@/hooks/useTemplates';
import { cn } from '@/lib/utils';
import { Sparkles, Edit3, Eye, ExternalLink, Globe, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Website = Database['public']['Tables']['websites']['Row'];

/* ---------- Mock data fallback ---------- */
const MOCK_SITES = [
  { client: 'DigitalDNA', domain: 'digitaldna.agency', status: 'live', updated: 'Apr 4', mrr: 0, internal: true, deploy_url: 'https://digitaldna.agency' },
  { client: 'Acme Pressure Washing', domain: 'acmepressurewashing.com', status: 'live', updated: 'Apr 4', mrr: 97, internal: false, deploy_url: 'https://acmepressurewashing.com' },
  { client: 'Bayou Landscaping', domain: 'bayoulandscaping.com', status: 'needs_update', updated: 'Mar 28', mrr: 97, internal: false, deploy_url: null },
  { client: 'Magnolia Concrete', domain: 'magnoliaconcrete.com', status: 'live', updated: 'Apr 1', mrr: 97, internal: false, deploy_url: 'https://magnoliaconcrete.com' },
  { client: 'Tidewater Lawn Care', domain: 'tidewaterlawncare.com', status: 'draft', updated: 'Apr 5', mrr: 0, internal: false, deploy_url: null },
  { client: 'Pontchartrain Plumbing', domain: 'pontplumbing.com', status: 'draft', updated: 'Apr 3', mrr: 0, internal: false, deploy_url: null },
];

const MOCK_TEMPLATES = ['Pressure Washing', 'Landscaping', 'Roofing', 'HVAC', 'Painting', 'Plumbing', 'Fencing', 'Pool Services'];

function deployStatusIcon(status: string) {
  switch (status) {
    case 'live':
    case 'deployed':
      return <CheckCircle2 className="h-3.5 w-3.5 text-success" />;
    case 'needs_update':
    case 'error':
      return <AlertTriangle className="h-3.5 w-3.5 text-warning" />;
    case 'draft':
    case 'pending':
      return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
    default:
      return <Globe className="h-3.5 w-3.5 text-muted-foreground/50" />;
  }
}

export default function Websites() {
  const { selectedClient } = useClientContext();

  // Query real websites from Supabase
  const { data: dbSites = [] } = useQuery({
    queryKey: ['websites', selectedClient?.id],
    queryFn: async () => {
      let query = supabase.from('websites').select('*').order('created_at', { ascending: false });
      if (selectedClient) query = query.eq('client_id', selectedClient.id);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Website[];
    },
  });

  // Query real templates (category = 'website')
  const { templates: dbTemplates } = useTemplates({ category: 'website' });

  const hasRealData = dbSites.length > 0;

  // Build display rows
  const displaySites = hasRealData
    ? dbSites.map(s => ({
        id: s.id,
        client: s.client_id ?? 'Unassigned',
        domain: s.domain ?? 'No domain',
        status: s.deploy_status ?? 'draft',
        updated: s.last_deployed ? new Date(s.last_deployed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--',
        mrr: 0,
        internal: false,
        deploy_url: s.deploy_url,
      }))
    : (() => {
        if (!selectedClient) return MOCK_SITES;
        if (selectedClient.is_internal) return MOCK_SITES.filter(s => s.internal);
        return MOCK_SITES.filter(s => s.client === selectedClient.business_name);
      })();

  const displayTemplates = dbTemplates.length > 0
    ? dbTemplates.map(t => ({ name: t.name, id: t.id }))
    : MOCK_TEMPLATES.map(t => ({ name: t, id: t }));

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
        {/* Staging Preview Banner */}
        {hasRealData && dbSites.some(s => s.deploy_url && s.deploy_status !== 'deployed') && (
          <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
            <div className="text-xs font-mono font-semibold text-accent uppercase tracking-wider mb-2">Staging Previews Available</div>
            <div className="flex flex-wrap gap-2">
              {dbSites
                .filter(s => s.deploy_url && s.deploy_status !== 'deployed')
                .map(s => (
                  <a
                    key={s.id}
                    href={s.deploy_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-card border border-border hover:border-accent/40 text-xs transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {s.domain ?? s.id.slice(0, 8)}
                  </a>
                ))}
            </div>
          </div>
        )}

        {/* Sites Table */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className={cn('grid px-4 py-2.5 border-b border-border text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider', showClientCol ? 'grid-cols-[2fr_2fr_100px_80px_60px_200px]' : 'grid-cols-[2fr_100px_80px_60px_200px]')}>
            {showClientCol && <span>Client</span>}<span>Domain</span><span>Status</span><span>Updated</span><span>MRR</span><span>Actions</span>
          </div>
          {displaySites.map((s, i) => (
            <div key={i} className={cn('grid px-4 py-3 items-center text-[13px]', showClientCol ? 'grid-cols-[2fr_2fr_100px_80px_60px_200px]' : 'grid-cols-[2fr_100px_80px_60px_200px]', i % 2 === 0 ? 'bg-card' : 'bg-background')}>
              {showClientCol && (
                <span className="font-medium flex items-center gap-1.5">
                  {deployStatusIcon(s.status)}
                  {s.client}
                  {'internal' in s && s.internal && <span className="ml-1.5 text-[10px] text-primary font-mono">(internal)</span>}
                </span>
              )}
              <span className="text-[hsl(210,80%,55%)]">{s.domain}</span>
              <StatusBadge status={s.status} />
              <span className="text-xs text-muted-foreground">{s.updated}</span>
              <span className={cn('font-semibold', s.mrr > 0 ? 'text-accent' : 'text-muted-foreground')}>${s.mrr}</span>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="gap-1 text-xs h-7"><Edit3 className="h-3 w-3" /> Edit</Button>
                {s.deploy_url ? (
                  <a href={s.deploy_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="text-xs h-7"><Eye className="h-3 w-3" /></Button>
                  </a>
                ) : (
                  <Button variant="outline" size="sm" className="text-xs h-7" disabled><Eye className="h-3 w-3" /></Button>
                )}
                <Button size="sm" className="gap-1 text-xs h-7"><ExternalLink className="h-3 w-3" /> Deploy</Button>
              </div>
            </div>
          ))}
        </div>

        {/* Templates Grid */}
        <div>
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Website Templates</h2>
          <div className="grid grid-cols-4 gap-3">
            {displayTemplates.map(t => (
              <div key={t.id} className="bg-card border border-border rounded-lg p-4 cursor-pointer text-center hover:border-accent/40 transition-colors">
                <Globe className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <div className="text-[13px] font-medium">{t.name}</div>
                <div className="text-[11px] text-muted-foreground">Template</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
