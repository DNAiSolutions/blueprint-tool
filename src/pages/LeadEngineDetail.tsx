// @ts-nocheck
import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useLeadEngine } from '@/hooks/useLeadEngines';
import { supabase } from '@/integrations/supabase/client';
import { startLeadEngineGeneration } from '@/lib/lead-engine';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function LeadEngineDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [rerunning, setRerunning] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [savingOnboarding, setSavingOnboarding] = useState(false);
  const { data: submission, isLoading, refetch } = useLeadEngine(id);
  const [onboardingForm, setOnboardingForm] = useState({
    status: 'pending',
    confirmedServices: [] as string[],
    intakeChangesSummary: '',
    missingItemsSummary: '',
    websiteReviewStatus: 'pending',
    nextOwner: '',
    nextFollowUpAt: '',
    readyForFulfillment: false,
  });

  useEffect(() => {
    if (!submission) return;
    setOnboardingForm({
      status: submission.onboarding?.status ?? 'pending',
      confirmedServices: Array.isArray(submission.onboarding?.confirmed_services)
        ? submission.onboarding?.confirmed_services as string[]
        : Array.isArray(submission.selected_services)
        ? submission.selected_services as string[]
        : [],
      intakeChangesSummary: submission.onboarding?.intake_changes_summary ?? '',
      missingItemsSummary: submission.onboarding?.missing_items_summary ?? '',
      websiteReviewStatus: submission.onboarding?.website_review_status ?? 'pending',
      nextOwner: submission.onboarding?.next_owner ?? '',
      nextFollowUpAt: submission.onboarding?.next_follow_up_at ? String(submission.onboarding?.next_follow_up_at).slice(0, 16) : '',
      readyForFulfillment: submission.onboarding?.ready_for_fulfillment ?? false,
    });
  }, [submission]);

  const handleRerun = async () => {
    if (!id) return;
    setRerunning(true);
    try {
      const { error } = await supabase.functions.invoke('lead-engine-rerun', {
        body: { submissionId: id },
      });

      if (error) throw error;

      toast.success('Lead engine re-run queued');
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to queue lead engine re-run');
    } finally {
      setRerunning(false);
    }
  };

  const handleStartGeneration = async () => {
    if (!submission?.id) return;
    setGenerating(true);
    try {
      const result = await startLeadEngineGeneration(submission.id);
      if (!result.success) {
        throw new Error(result.error || 'Lead engine generation failed');
      }
      toast.success('Lead engine generation completed');
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate lead engine assets');
    } finally {
      setGenerating(false);
    }
  };

  const toggleConfirmedService = (service: string, checked: boolean) => {
    setOnboardingForm((prev) => ({
      ...prev,
      confirmedServices: checked
        ? [...prev.confirmedServices, service]
        : prev.confirmedServices.filter((item) => item !== service),
    }));
  };

  const handleSaveOnboarding = async () => {
    if (!submission?.id) return;
    setSavingOnboarding(true);
    try {
      const updates = {
        status: onboardingForm.status,
        confirmed_services: onboardingForm.confirmedServices,
        intake_changes_summary: onboardingForm.intakeChangesSummary || null,
        missing_items_summary: onboardingForm.missingItemsSummary || null,
        website_review_status: onboardingForm.websiteReviewStatus,
        next_owner: onboardingForm.nextOwner || null,
        next_follow_up_at: onboardingForm.nextFollowUpAt ? new Date(onboardingForm.nextFollowUpAt).toISOString() : null,
        ready_for_fulfillment: onboardingForm.readyForFulfillment,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('lead_engine_onboarding')
        .update(updates as any)
        .eq('lead_engine_submission_id', submission.id);

      if (error) throw error;

      toast.success('Onboarding prep updated');
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save onboarding prep');
    } finally {
      setSavingOnboarding(false);
    }
  };

  return (
    <AppLayout>
      <header className="flex h-14 items-center justify-between border-b border-border px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/lead-engines')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">{submission?.business_name ?? 'Lead Engine Detail'}</h1>
            <p className="text-xs text-muted-foreground font-mono">Team workspace for sample generation, review, and onboarding prep.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-1.5" disabled={generating || !submission} onClick={handleStartGeneration}>
            <RefreshCw className={generating ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
            {generating ? 'Generating…' : 'Start generation'}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" disabled={rerunning || !submission} onClick={handleRerun}>
            <RefreshCw className="h-3.5 w-3.5" />
            {rerunning ? 'Queueing re-run...' : 'Re-run generation'}
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 scrollbar-thin">
        {isLoading || !submission ? (
          <div className="text-sm text-muted-foreground">Loading lead engine...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-3">
              <InfoCard label="Source" value={submission.source_funnel ?? 'unknown_source'} badge="lead_magnet" />
              <InfoCard label="Website" value={submission.run?.website_status ?? 'draft'} badge={submission.run?.website_status ?? 'draft'} />
              <InfoCard label="Content" value={submission.run?.content_status ?? 'draft'} badge={submission.run?.content_status ?? 'draft'} />
              <InfoCard label="Onboarding" value={submission.onboarding?.status ?? 'pending'} badge={submission.onboarding?.status ?? 'pending'} />
            </div>

            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="intake">Intake</TabsTrigger>
                <TabsTrigger value="website">Website</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
                <TabsTrigger value="sync">Sync</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="pt-4">
                <div className="grid grid-cols-2 gap-6">
                  <Panel title="Business Context">
                    <Detail label="Business" value={submission.business_name} />
                    <Detail label="Contact" value={submission.contact_name} />
                    <Detail label="Email" value={submission.email} />
                    <Detail label="Phone" value={submission.phone} />
                    <Detail label="Industry" value={submission.industry} />
                    <Detail label="Website URL" value={submission.website_url} />
                  </Panel>

                  <Panel title="Run Summary">
                    <Detail label="Submission Status" value={submission.status} />
                    <Detail label="Research Status" value={submission.run?.research_status} />
                    <Detail label="Website Status" value={submission.run?.website_status} />
                    <Detail label="Content Status" value={submission.run?.content_status} />
                    <Detail label="CRM Sync Status" value={submission.run?.crm_sync_status} />
                  </Panel>
                </div>
              </TabsContent>

              <TabsContent value="intake" className="pt-4">
                <Panel title="Original Intake Snapshot">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-auto rounded-lg bg-background p-4 border border-border">
                    {JSON.stringify(submission.intake_payload ?? {}, null, 2)}
                  </pre>
                </Panel>
              </TabsContent>

              <TabsContent value="website" className="pt-4">
                <Panel title="Website Generation">
                  <Detail label="Website Status" value={submission.run?.website_status} />
                  <Detail label="Revision Status" value={submission.onboarding?.website_review_status} />
                  <Detail label="Preview URL" value={submission.run?.preview_url} />
                  <Detail label="Last Error" value={submission.run?.last_error} />
                  <p className="text-sm text-muted-foreground mt-4">This tab now connects to the first generation orchestration path. Research, Stitch output, and preview sync will continue to get richer as more donor logic from `vibe-clone` is ported.</p>
                </Panel>
              </TabsContent>

              <TabsContent value="content" className="pt-4">
                <Panel title="Content Generation">
                  <Detail label="Content Status" value={submission.run?.content_status} />
                  <Detail label="Video Status" value={submission.run?.video_status} />
                  <p className="text-sm text-muted-foreground mt-4">This tab will hold HeyGen job state, prompts, sample outputs, and re-run controls.</p>
                </Panel>
              </TabsContent>

              <TabsContent value="onboarding" className="pt-4">
                <div className="grid grid-cols-2 gap-6">
                  <Panel title="Collected Already">
                    <Detail label="Business Description" value={String((submission.intake_payload as any)?.businessDescription ?? '—')} />
                    <Detail label="Target Audience" value={String((submission.intake_payload as any)?.targetAudience ?? '—')} />
                    <Detail label="Service Area" value={String((submission.intake_payload as any)?.serviceArea ?? '—')} />
                    <Detail label="Brand Tone" value={String((submission.intake_payload as any)?.brandTone ?? '—')} />
                    <Detail label="Features Needed" value={String((submission.intake_payload as any)?.featuresNeeded ?? '—')} />
                    <p className="text-sm text-muted-foreground mt-4">Use the intake data above as the reference point. Only capture what changed or is still missing.</p>
                  </Panel>

                  <Panel title="Onboarding Prep">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Input value={onboardingForm.status} onChange={(e) => setOnboardingForm((prev) => ({ ...prev, status: e.target.value }))} placeholder="pending, ready_for_call, partial, completed" />
                      </div>

                      <div className="space-y-2">
                        <Label>Confirmed Services</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {['website', 'content', 'automations'].map((service) => (
                            <label key={service} className="flex items-center gap-2 rounded-lg border border-border p-2 cursor-pointer">
                              <Checkbox
                                checked={onboardingForm.confirmedServices.includes(service)}
                                onCheckedChange={(value) => toggleConfirmedService(service, value === true)}
                              />
                              <span className="text-sm capitalize">{service}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Website Review Status</Label>
                        <Input value={onboardingForm.websiteReviewStatus} onChange={(e) => setOnboardingForm((prev) => ({ ...prev, websiteReviewStatus: e.target.value }))} placeholder="pending, preview_ready, revision_requested, approved" />
                      </div>

                      <div className="space-y-2">
                        <Label>What changed from intake?</Label>
                        <Textarea value={onboardingForm.intakeChangesSummary} onChange={(e) => setOnboardingForm((prev) => ({ ...prev, intakeChangesSummary: e.target.value }))} rows={3} placeholder="Only note differences from the original intake." />
                      </div>

                      <div className="space-y-2">
                        <Label>Missing items / next needs</Label>
                        <Textarea value={onboardingForm.missingItemsSummary} onChange={(e) => setOnboardingForm((prev) => ({ ...prev, missingItemsSummary: e.target.value }))} rows={3} placeholder="Voice sample, account access, final approval items, etc." />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Next owner</Label>
                          <Input value={onboardingForm.nextOwner} onChange={(e) => setOnboardingForm((prev) => ({ ...prev, nextOwner: e.target.value }))} placeholder="CEO, ops, website-builder..." />
                        </div>
                        <div className="space-y-2">
                          <Label>Next follow-up</Label>
                          <Input type="datetime-local" value={onboardingForm.nextFollowUpAt} onChange={(e) => setOnboardingForm((prev) => ({ ...prev, nextFollowUpAt: e.target.value }))} />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 rounded-lg border border-border p-3 cursor-pointer">
                        <Checkbox checked={onboardingForm.readyForFulfillment} onCheckedChange={(value) => setOnboardingForm((prev) => ({ ...prev, readyForFulfillment: value === true }))} />
                        <span className="text-sm font-medium">Ready for fulfillment</span>
                      </label>

                      <div className="flex justify-end">
                        <Button onClick={handleSaveOnboarding} disabled={savingOnboarding}>
                          {savingOnboarding ? 'Saving…' : 'Save Onboarding Prep'}
                        </Button>
                      </div>
                    </div>
                  </Panel>
                </div>
              </TabsContent>

              <TabsContent value="sync" className="pt-4">
                <Panel title="Sync Status">
                  <Detail label="CRM Sync" value={submission.run?.crm_sync_status} />
                  <Detail label="Last Error" value={submission.run?.last_error} />
                  <p className="text-sm text-muted-foreground mt-4">Webhook/API event history will be added here in the next phase.</p>
                </Panel>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function InfoCard({ label, value, badge }: { label: string; value: string; badge: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">{label}</div>
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium">{value}</div>
        <StatusBadge status={badge} />
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="text-sm">{value || '—'}</div>
    </div>
  );
}
