// @ts-nocheck
import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useClientContext } from '@/hooks/useClientContext';
import { useTemplates } from '@/hooks/useTemplates';
import { cn } from '@/lib/utils';
import { Sparkles, Edit3, Eye, ExternalLink, Globe, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Website = Database['public']['Tables']['websites']['Row'];
type WebsiteSource = 'all' | 'lead_magnet' | 'client_project';
type WebsiteStage = 'all' | 'draft' | 'generating' | 'preview_ready' | 'revision_requested' | 'approved' | 'converted' | 'deployed';
type WebsiteRecord = Website & {
  source_type?: string | null;
  source_funnel?: string | null;
  website_stage?: string | null;
  promotion_status?: string | null;
};

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
  const queryClient = useQueryClient();
  const [sourceFilter, setSourceFilter] = useState<WebsiteSource>('all');
  const [stageFilter, setStageFilter] = useState<WebsiteStage>('all');
  const [reviewTarget, setReviewTarget] = useState<any | null>(null);
  const [reviewMode, setReviewMode] = useState<'approve' | 'revision'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Query real websites from Supabase
  const { data: dbSites = [] } = useQuery({
    queryKey: ['websites', selectedClient?.id],
    queryFn: async () => {
      let query = supabase.from('websites').select('*').order('created_at', { ascending: false });
      if (selectedClient) query = query.eq('client_id', selectedClient.id);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as WebsiteRecord[];
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
        website_stage: s.website_stage ?? s.deploy_status ?? 'draft',
        source_type: s.source_type ?? 'client_project',
        source_funnel: s.source_funnel ?? null,
        promotion_status: s.promotion_status ?? 'not_promoted',
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

  const filteredSites = useMemo(() => {
    return (displaySites as any[]).filter((site: any) => {
      const source = site.source_type ?? 'client_project';
      const stage = site.website_stage ?? site.status;
      const normalizedStage = site.status === 'live' ? 'deployed' : stage;

      const matchesSource = sourceFilter === 'all' || source === sourceFilter;
      const matchesStage = stageFilter === 'all' || normalizedStage === stageFilter;
      return matchesSource && matchesStage;
    });
  }, [displaySites, sourceFilter, stageFilter]);

  const showClientCol = !selectedClient;

  const handleReviewAction = async () => {
    if (!reviewTarget?.source_submission_id) return;

    setReviewLoading(true);
    try {
      const nextWebsiteStage = reviewMode === 'approve' ? 'approved' : 'revision_requested';
      const nextSubmissionStatus = reviewMode === 'approve' ? 'approved' : 'revision_requested';
      const nextOnboardingStatus = reviewMode === 'approve' ? 'ready_for_call' : 'partial';
      const now = new Date().toISOString();

      const { error: websiteError } = await supabase
        .from('websites')
        .update({ website_stage: nextWebsiteStage })
        .eq('id', reviewTarget.id);
      if (websiteError) throw websiteError;

      const { error: runError } = await supabase
        .from('lead_engine_runs')
        .update({ website_status: nextWebsiteStage, updated_at: now })
        .eq('lead_engine_submission_id', reviewTarget.source_submission_id);
      if (runError) throw runError;

      const { error: submissionError } = await supabase
        .from('lead_engine_submissions')
        .update({ status: nextSubmissionStatus, updated_at: now })
        .eq('id', reviewTarget.source_submission_id);
      if (submissionError) throw submissionError;

      const onboardingUpdates: Record<string, unknown> = {
        status: nextOnboardingStatus,
        website_review_status: nextWebsiteStage,
        updated_at: now,
      };

      if (reviewNotes.trim()) {
        if (reviewMode === 'revision') {
          onboardingUpdates.missing_items_summary = reviewNotes.trim();
        } else {
          onboardingUpdates.intake_changes_summary = reviewNotes.trim();
        }
      }

      const { error: onboardingError } = await supabase
        .from('lead_engine_onboarding')
        .update(onboardingUpdates as any)
        .eq('lead_engine_submission_id', reviewTarget.source_submission_id);
      if (onboardingError) throw onboardingError;

      toast.success(reviewMode === 'approve' ? 'Website sample approved' : 'Website sample marked for revision');
      setReviewTarget(null);
      setReviewNotes('');
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      queryClient.invalidateQueries({ queryKey: ['lead_engines'] });
      queryClient.invalidateQueries({ queryKey: ['lead_engine', reviewTarget.source_submission_id] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update website review state');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <AppLayout>
      <header className="flex h-14 items-center justify-between border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold">Website Builder</h1>
        <div className="flex gap-2">
          <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as WebsiteSource)}>
            <SelectTrigger className="w-[180px] text-xs">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="lead_magnet">Lead Magnet</SelectItem>
              <SelectItem value="client_project">Client Project</SelectItem>
            </SelectContent>
          </Select>
          <Select value={stageFilter} onValueChange={(value) => setStageFilter(value as WebsiteStage)}>
            <SelectTrigger className="w-[190px] text-xs">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="generating">Generating</SelectItem>
              <SelectItem value="preview_ready">Preview Ready</SelectItem>
              <SelectItem value="revision_requested">Revision Requested</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="deployed">Deployed</SelectItem>
            </SelectContent>
          </Select>
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
          {filteredSites.map((s, i) => (
            <div key={i} className={cn('grid px-4 py-3 items-center text-[13px]', showClientCol ? 'grid-cols-[2fr_2fr_100px_80px_60px_200px]' : 'grid-cols-[2fr_100px_80px_60px_200px]', i % 2 === 0 ? 'bg-card' : 'bg-background')}>
              {showClientCol && (
                <span className="font-medium flex items-center gap-1.5">
                  {deployStatusIcon(s.status)}
                  {s.client}
                  {'internal' in s && s.internal && <span className="ml-1.5 text-[10px] text-primary font-mono">(internal)</span>}
                </span>
              )}
              <div>
                <div className="text-[hsl(210,80%,55%)]">{s.domain}</div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  <StatusBadge status={s.source_type === 'lead_magnet' ? 'lead_magnet' : 'client_project'} />
                  <StatusBadge status={s.website_stage === 'live' ? 'deployed' : s.website_stage} />
                </div>
              </div>
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
                {s.source_type === 'lead_magnet' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => {
                        setReviewMode('approve');
                        setReviewNotes('');
                        setReviewTarget(s);
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => {
                        setReviewMode('revision');
                        setReviewNotes('');
                        setReviewTarget(s);
                      }}
                    >
                      Revision
                    </Button>
                  </>
                )}
                <Button size="sm" className="gap-1 text-xs h-7"><ExternalLink className="h-3 w-3" /> Deploy</Button>
              </div>
            </div>
          ))}
          {filteredSites.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">No websites match the selected source and stage filters.</div>
          )}
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
      <Dialog open={!!reviewTarget} onOpenChange={(open) => !open && setReviewTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{reviewMode === 'approve' ? 'Approve website sample' : 'Request one revision'}</DialogTitle>
            <DialogDescription>
              {reviewTarget?.domain} · {reviewTarget?.source_funnel ?? 'lead_magnet'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{reviewMode === 'approve' ? 'Approval notes' : 'Revision summary'}</Label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={5}
                placeholder={reviewMode === 'approve' ? 'Optional notes for the onboarding team or fulfillment handoff.' : 'Describe the one revision requested for this lead magnet website.'}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReviewTarget(null)}>Cancel</Button>
              <Button onClick={handleReviewAction} disabled={reviewLoading || (reviewMode === 'revision' && !reviewNotes.trim())}>
                {reviewLoading ? 'Saving…' : reviewMode === 'approve' ? 'Approve Sample' : 'Save Revision Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
