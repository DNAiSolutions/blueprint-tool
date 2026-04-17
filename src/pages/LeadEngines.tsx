import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AddLeadEngineDialog } from '@/components/forms/AddLeadEngineDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeadEngines } from '@/hooks/useLeadEngines';
import { Search, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type EngineFilter = 'all' | 'new' | 'generating' | 'preview_ready' | 'revision_requested' | 'converted';

export default function LeadEngines() {
  const navigate = useNavigate();
  const { data: submissions = [], isLoading } = useLeadEngines();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EngineFilter>('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  const filtered = useMemo(() => {
    return submissions.filter((submission) => {
      const websiteStatus = submission.run?.website_status ?? 'draft';
      const matchesStatus = statusFilter === 'all' || websiteStatus === statusFilter || submission.status === statusFilter;
      const matchesSource = sourceFilter === 'all' || submission.source_funnel === sourceFilter;
      const searchText = `${submission.business_name ?? ''} ${submission.contact_name ?? ''} ${submission.email ?? ''}`.toLowerCase();
      const matchesSearch = !search || searchText.includes(search.toLowerCase());
      return matchesStatus && matchesSource && matchesSearch;
    });
  }, [search, sourceFilter, statusFilter, submissions]);

  const sources = Array.from(new Set(submissions.map((submission) => submission.source_funnel).filter(Boolean))) as string[];

  return (
    <AppLayout>
      <header className="flex h-14 items-center justify-between border-b border-border px-6 shrink-0">
        <div>
          <h1 className="text-lg font-bold">Lead Engines</h1>
          <p className="text-xs text-muted-foreground font-mono">Reusable lead magnet runs, previews, and onboarding prep.</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowCreateDialog(true)}>
          <Sparkles className="h-3.5 w-3.5" />
          New Engine Intake
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6 scrollbar-thin">
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Submissions" value={String(submissions.length)} />
          <StatCard label="Generating" value={String(submissions.filter((item) => item.run?.website_status === 'generating').length)} />
          <StatCard label="Preview Ready" value={String(submissions.filter((item) => item.run?.website_status === 'preview_ready').length)} />
          <StatCard label="Converted" value={String(submissions.filter((item) => item.run?.website_status === 'converted').length)} />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Search business, contact, or email..." />
          </div>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as EngineFilter)}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="new">New intake</SelectItem>
              <SelectItem value="generating">Generating</SelectItem>
              <SelectItem value="preview_ready">Preview ready</SelectItem>
              <SelectItem value="revision_requested">Revision requested</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="Source funnel" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {sources.map((source) => (
                <SelectItem key={source} value={source}>{source}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-[2fr_1.3fr_1fr_1fr_1fr_1fr_180px] px-4 py-2.5 border-b border-border text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Business</span>
            <span>Source</span>
            <span>Services</span>
            <span>Website</span>
            <span>Content</span>
            <span>Onboarding</span>
            <span>Actions</span>
          </div>

          {isLoading ? (
            <div className="px-4 py-8 text-sm text-muted-foreground text-center">Loading lead engines...</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-8 text-sm text-muted-foreground text-center">No lead engine submissions found.</div>
          ) : filtered.map((submission, index) => {
            const services = Array.isArray(submission.selected_services) ? submission.selected_services : [];
            const websiteStatus = submission.run?.website_status ?? 'draft';
            const contentStatus = submission.run?.content_status ?? 'draft';
            const onboardingStatus = submission.onboarding?.status ?? 'pending';

            return (
              <div
                key={submission.id}
                className={cn(
                  'grid grid-cols-[2fr_1.3fr_1fr_1fr_1fr_1fr_180px] px-4 py-3 items-center text-[13px]',
                  index % 2 === 0 ? 'bg-card' : 'bg-background'
                )}
              >
                <div>
                  <div className="font-medium">{submission.business_name ?? 'Untitled submission'}</div>
                  <div className="text-xs text-muted-foreground">{submission.contact_name ?? 'No contact'} · {submission.email ?? 'No email'}</div>
                </div>
                <div>
                  <StatusBadge status="lead_magnet" className="mr-1" />
                  <div className="text-xs text-muted-foreground mt-1">{submission.source_funnel ?? 'unknown_source'}</div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {services.length > 0 ? services.slice(0, 2).map((service) => (
                    <StatusBadge key={String(service)} status={String(service)} />
                  )) : <span className="text-xs text-muted-foreground">No services</span>}
                </div>
                <StatusBadge status={websiteStatus} />
                <StatusBadge status={contentStatus} />
                <StatusBadge status={onboardingStatus} />
                <div className="flex gap-1.5 justify-end">
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate(`/lead-engines/${submission.id}`)}>
                    <ExternalLink className="h-3 w-3" />
                    Open
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs" disabled>
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <AddLeadEngineDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </AppLayout>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
