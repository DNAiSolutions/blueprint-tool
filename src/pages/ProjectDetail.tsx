// @ts-nocheck
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { KPICard } from '@/components/shared/KPICard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useProjects } from '@/hooks/useProjects';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { useContentApproval } from '@/hooks/useContentApproval';
import { useAgentTasks } from '@/hooks/useAgentTasks';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import {
  ArrowLeft, FolderKanban, LayoutDashboard, Sparkles, Globe, Zap,
  LifeBuoy, Plus, CheckCircle2, Clock, AlertTriangle, ExternalLink,
  Send, Bot, Target, LayoutGrid, Settings2, Palette, Search,
  RefreshCw, MessageSquare, ArrowRight, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

type Website = Database['public']['Tables']['websites']['Row'];

const SERVICE_LABELS: Record<string, string> = {
  ai_content: 'AI Content', website: 'Website', growth_automations: 'Growth Automations',
  client_acquisition: 'Client Acquisition', social_media: 'Social Media',
  branding: 'Branding', seo: 'SEO', custom: 'Custom',
};

const SERVICE_ICONS: Record<string, typeof Globe> = {
  ai_content: Sparkles, website: Globe, growth_automations: Zap,
  client_acquisition: Target, social_media: LayoutGrid,
  branding: Palette, seo: Search, custom: Settings2,
};

type TabId = 'overview' | 'content' | 'website' | 'automations' | 'support';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, services } = useProjects();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const project = projects.find(p => p.id === id);
  const projectServices = services.filter(s => s.project_id === id && s.status === 'active');
  const serviceTypes = projectServices.map(s => s.service_type);

  const { data: clientName } = useQuery({
    queryKey: ['client_name', project?.client_id],
    queryFn: async () => {
      if (!project?.client_id) return null;
      const { data } = await supabase.from('clients').select('business_name').eq('id', project.client_id).single();
      return data?.business_name ?? null;
    },
    enabled: !!project?.client_id,
  });

  // If no real project, check if we came from a client context
  const searchParams = new URLSearchParams(window.location.search);
  const clientIdParam = searchParams.get('client');

  const { data: clientFromParam } = useQuery({
    queryKey: ['client_for_project', clientIdParam],
    queryFn: async () => {
      if (!clientIdParam) return null;
      const { data } = await supabase.from('clients').select('*').eq('id', clientIdParam).single();
      return data;
    },
    enabled: !!clientIdParam && !project,
  });

  const hasRealData = !!project;
  const displayName = hasRealData ? (clientName ?? project.name) : (clientFromParam?.business_name ?? 'Project');
  const displayStatus = hasRealData ? project.status : 'active';
  const displayServices = hasRealData ? serviceTypes : ['ai_content', 'website', 'growth_automations'];
  const ghlLocationId = hasRealData ? project.ghl_location_id : null;

  const tabs: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  ];
  if (displayServices.includes('ai_content') || displayServices.includes('social_media')) {
    tabs.push({ id: 'content', label: 'Content', icon: Sparkles });
  }
  if (displayServices.includes('website')) {
    tabs.push({ id: 'website', label: 'Website', icon: Globe });
  }
  if (displayServices.includes('growth_automations') || displayServices.includes('client_acquisition')) {
    tabs.push({ id: 'automations', label: 'Automations', icon: Zap });
  }
  tabs.push({ id: 'support', label: 'Support', icon: LifeBuoy });

  return (
    <AppLayout>
      <header className="border-b border-border px-6 shrink-0">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/projects')} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <FolderKanban className="h-5 w-5 text-accent" />
            <h1 className="text-lg font-bold">{displayName}</h1>
            <StatusBadge status={displayStatus} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Settings2 className="h-3 w-3" /> Settings
            </Button>
          </div>
        </div>
        <div className="flex gap-1 -mb-px">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors',
                  activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                )}>
                <Icon className="h-3.5 w-3.5" />{tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 scrollbar-thin">
        {activeTab === 'overview' && <OverviewTab name={displayName} services={displayServices} projectId={id} hasRealData={hasRealData} />}
        {activeTab === 'content' && <ContentTab projectId={id} clientId={project?.client_id} hasRealData={hasRealData} />}
        {activeTab === 'website' && <WebsiteTab clientId={project?.client_id} hasRealData={hasRealData} />}
        {activeTab === 'automations' && <AutomationsTab projectId={id} ghlLocationId={ghlLocationId} hasRealData={hasRealData} />}
        {activeTab === 'support' && <SupportTab projectId={id} clientId={project?.client_id} hasRealData={hasRealData} />}
      </div>
    </AppLayout>
  );
}

/* ================================================================
   OVERVIEW TAB
   ================================================================ */
function OverviewTab({ name, services, projectId, hasRealData }: { name: string; services: string[]; projectId?: string; hasRealData: boolean }) {
  const { tickets } = useSupportTickets(projectId ? { projectId } : {});
  const openTickets = hasRealData ? tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length : 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Active Services" value={services.length} icon={FolderKanban} />
        <KPICard label="Open Tickets" value={openTickets} icon={LifeBuoy} />
        <KPICard label="Agent Tasks" value={hasRealData ? '—' : '3'} subtitle="Active" icon={Bot} />
        <KPICard label="Health Score" value={hasRealData ? '—' : '92'} icon={CheckCircle2} />
      </div>
      <div className="rounded-lg bg-card border border-border p-5">
        <h3 className="text-sm font-semibold mb-3">Active Services</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {services.map(svc => {
            const Icon = SERVICE_ICONS[svc] ?? Settings2;
            return (
              <div key={svc} className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50">
                <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-semibold">{SERVICE_LABELS[svc] ?? svc}</p>
                  <p className="text-[10px] text-muted-foreground">Active</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="rounded-lg bg-card border border-border p-5">
        <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {[
            { text: `Content batch submitted for ${name}`, time: '2 hours ago', icon: Sparkles },
            { text: 'Website hero image updated by website-builder agent', time: '5 hours ago', icon: Globe },
            { text: 'Support ticket picked up by support agent', time: '1 day ago', icon: LifeBuoy },
            { text: 'Weekly automation report generated', time: '2 days ago', icon: Zap },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-3 p-2 rounded-md hover:bg-background/50 transition-colors">
                <Icon className="h-3.5 w-3.5 text-accent/60 shrink-0" />
                <span className="text-xs flex-1">{item.text}</span>
                <span className="text-[10px] text-muted-foreground/50">{item.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   CONTENT TAB
   ================================================================ */
function ContentTab({ projectId, clientId, hasRealData }: { projectId?: string; clientId?: string; hasRealData: boolean }) {
  const { approvals } = useContentApproval();
  const clientApprovals = clientId ? approvals.filter(a => a.client_id === clientId) : [];
  const useReal = hasRealData && clientApprovals.length > 0;

  const MOCK_CONTENT = [
    { id: '1', title: 'Mon — "3 things your driveway is begging you to do"', status: 'approved', revision: 0, date: 'Apr 7' },
    { id: '2', title: 'Tue — "Your neighbors hired us."', status: 'pending', revision: 0, date: 'Apr 8' },
    { id: '3', title: 'Wed — "The $200 mistake every homeowner makes"', status: 'pending', revision: 1, date: 'Apr 9' },
    { id: '4', title: 'Thu — "Before and after that speaks for itself"', status: 'pending', revision: 0, date: 'Apr 10' },
    { id: '5', title: 'Fri — "Why we turn down 30% of leads"', status: 'approved', revision: 0, date: 'Apr 11' },
  ];

  const displayContent = useReal
    ? clientApprovals.map(a => ({ id: a.id, title: `Content #${a.revision_number}`, status: a.status, revision: a.revision_number, date: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }))
    : MOCK_CONTENT;

  const pending = displayContent.filter(c => c.status === 'pending').length;
  const approved = displayContent.filter(c => c.status === 'approved').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <KPICard label="Total Pieces" value={displayContent.length} icon={Sparkles} />
        <KPICard label="Pending Approval" value={pending} icon={Clock} />
        <KPICard label="Approved" value={approved} icon={CheckCircle2} />
      </div>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[2fr_100px_60px_80px] px-4 py-2.5 border-b border-border text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
          <span>Content</span><span>Status</span><span>Rev</span><span>Date</span>
        </div>
        {displayContent.map((item, i) => (
          <div key={item.id} className={cn('grid grid-cols-[2fr_100px_60px_80px] px-4 py-3 items-center text-[13px]', i % 2 === 0 ? 'bg-card' : 'bg-background')}>
            <span className="font-medium truncate">{item.title}</span>
            <StatusBadge status={item.status} />
            <span className="text-xs text-muted-foreground">{item.revision}</span>
            <span className="text-xs text-muted-foreground">{item.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   WEBSITE TAB
   ================================================================ */
function WebsiteTab({ clientId, hasRealData }: { clientId?: string; hasRealData: boolean }) {
  const { data: website } = useQuery({
    queryKey: ['project_website', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const { data, error } = await supabase.from('websites').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (error) throw error;
      return data as Website | null;
    },
    enabled: !!clientId,
  });

  const domain = website?.domain ?? 'digitaldna.agency';
  const deployUrl = website?.deploy_url ?? null;
  const deployStatus = website?.deploy_status ?? 'live';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <KPICard label="Domain" value={domain} icon={Globe} />
        <KPICard label="Status" value={deployStatus === 'deployed' || deployStatus === 'live' ? 'Live' : deployStatus} icon={CheckCircle2} />
        <KPICard label="Last Deploy" value={website?.last_deployed ? new Date(website.last_deployed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Apr 4'} icon={RefreshCw} />
      </div>
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Live Preview</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs"><RefreshCw className="h-3 w-3" /> Request Changes</Button>
            {deployUrl ? (
              <a href={deployUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="gap-1.5 text-xs"><ExternalLink className="h-3 w-3" /> View Site</Button>
              </a>
            ) : (
              <Button size="sm" className="gap-1.5 text-xs" disabled><ExternalLink className="h-3 w-3" /> View Site</Button>
            )}
          </div>
        </div>
        {deployUrl ? (
          <div className="rounded-lg border border-border overflow-hidden aspect-video">
            <iframe src={deployUrl} title="Website Preview" className="w-full h-full" sandbox="allow-scripts allow-same-origin" />
          </div>
        ) : (
          <div className="rounded-lg bg-muted border border-border aspect-video flex items-center justify-center">
            <div className="text-center">
              <Globe className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Website preview</p>
              <p className="text-xs text-muted-foreground/50 mt-1">{domain}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   AUTOMATIONS TAB — Live GHL integration
   ================================================================ */
function AutomationsTab({ projectId, ghlLocationId, hasRealData }: { projectId?: string; ghlLocationId?: string | null; hasRealData: boolean }) {
  const [syncing, setSyncing] = useState(false);

  // Fetch GHL pipelines
  const { data: ghlPipelines, isLoading: pipelinesLoading, refetch: refetchPipelines } = useQuery({
    queryKey: ['ghl_pipelines', ghlLocationId],
    queryFn: async () => {
      if (!ghlLocationId) return null;
      const { data, error } = await supabase.functions.invoke('ghl-sync', {
        body: null,
        headers: { 'Content-Type': 'application/json' },
      });
      // Use query params approach
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ghl-sync?action=pipelines&locationId=${ghlLocationId}`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!res.ok) throw new Error('Failed to fetch GHL pipelines');
      return res.json();
    },
    enabled: !!ghlLocationId,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  // Fetch GHL workflows
  const { data: ghlWorkflows, isLoading: workflowsLoading, refetch: refetchWorkflows } = useQuery({
    queryKey: ['ghl_workflows', ghlLocationId],
    queryFn: async () => {
      if (!ghlLocationId) return null;
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ghl-sync?action=workflows&locationId=${ghlLocationId}`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!res.ok) throw new Error('Failed to fetch GHL workflows');
      return res.json();
    },
    enabled: !!ghlLocationId,
    staleTime: 5 * 60 * 1000,
  });

  const handleSync = async () => {
    setSyncing(true);
    try {
      await Promise.all([refetchPipelines(), refetchWorkflows()]);
      toast.success('GHL data synced');
    } catch {
      toast.error('Sync failed');
    }
    setSyncing(false);
  };

  const pipelines = ghlPipelines?.pipelines ?? [];
  const workflows = ghlWorkflows?.workflows ?? [];

  // Mock data for when GHL isn't connected
  const MOCK_PIPELINES = [
    { name: 'New Leads', stages: [{ name: 'New', count: 8 }, { name: 'Contacted', count: 5 }, { name: 'Qualified', count: 3 }, { name: 'Booked', count: 2 }] },
    { name: 'Sales Pipeline', stages: [{ name: 'Proposal Sent', count: 4 }, { name: 'Negotiation', count: 2 }, { name: 'Won', count: 6 }, { name: 'Lost', count: 1 }] },
  ];

  const MOCK_WORKFLOWS = [
    { name: 'New Lead → SMS Follow-up', status: 'active', runs: 234, lastRun: '2 hours ago' },
    { name: 'Missed Call Text-Back', status: 'active', runs: 89, lastRun: '45 min ago' },
    { name: 'Review Request (7 day)', status: 'active', runs: 56, lastRun: '1 day ago' },
    { name: 'Re-engagement Campaign', status: 'paused', runs: 12, lastRun: '2 weeks ago' },
    { name: 'Appointment Reminder', status: 'active', runs: 178, lastRun: '3 hours ago' },
  ];

  const showPipelines = ghlLocationId && pipelines.length > 0 ? pipelines : MOCK_PIPELINES;
  const showWorkflows = ghlLocationId && workflows.length > 0
    ? workflows.map((w: any) => ({ name: w.name, status: w.status === 'published' ? 'active' : 'paused', runs: 0, lastRun: '—' }))
    : MOCK_WORKFLOWS;

  const isLive = !!ghlLocationId;

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className={cn(
        'flex items-center justify-between p-3 rounded-lg border',
        isLive ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'
      )}>
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full', isLive ? 'bg-success animate-pulse' : 'bg-warning')} />
          <span className="text-xs font-medium">
            {isLive ? 'Connected to GHL Subaccount' : 'GHL not connected — showing sample data'}
          </span>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleSync} disabled={syncing || !isLive}>
          {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          {syncing ? 'Syncing...' : 'Sync from GHL'}
        </Button>
      </div>

      {/* GHL Pipelines */}
      <div className="rounded-lg bg-card border border-border p-5">
        <h3 className="text-sm font-semibold mb-4">GHL Pipelines</h3>
        <div className="space-y-4">
          {showPipelines.map((pipeline: any) => (
            <div key={pipeline.name ?? pipeline.id}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{pipeline.name}</p>
              <div className="flex gap-2">
                {(pipeline.stages ?? []).map((stage: any) => (
                  <div key={stage.name ?? stage.id} className="flex-1 p-3 rounded-lg bg-background border border-border/50 text-center">
                    <p className="text-lg font-bold text-accent">{stage.count ?? 0}</p>
                    <p className="text-[10px] text-muted-foreground">{stage.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Automations / Workflows */}
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50">
          <h3 className="text-sm font-semibold">Active Automations</h3>
        </div>
        <div className="grid grid-cols-[2fr_80px_80px_100px] px-4 py-2 border-b border-border/30 text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
          <span>Automation</span><span>Status</span><span>Runs</span><span>Last Run</span>
        </div>
        {showWorkflows.map((auto: any, i: number) => (
          <div key={auto.name} className={cn('grid grid-cols-[2fr_80px_80px_100px] px-4 py-3 items-center text-[13px]', i % 2 === 0 ? 'bg-card' : 'bg-background')}>
            <span className="font-medium flex items-center gap-2">
              <Zap className={cn('h-3 w-3', auto.status === 'active' ? 'text-accent' : 'text-muted-foreground/40')} />
              {auto.name}
            </span>
            <StatusBadge status={auto.status} />
            <span className="text-xs text-muted-foreground font-mono">{auto.runs}</span>
            <span className="text-xs text-muted-foreground">{auto.lastRun}</span>
          </div>
        ))}
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-3 gap-4">
        <KPICard label="Total Automation Runs" value="569" subtitle="Last 30 days" icon={Zap} />
        <KPICard label="Leads Generated" value="47" subtitle="+12 this week" icon={Target} trend={{ value: '+34%', positive: true }} />
        <KPICard label="Appointments Booked" value="18" subtitle="Last 30 days" icon={CheckCircle2} />
      </div>
    </div>
  );
}

/* ================================================================
   SUPPORT TAB
   ================================================================ */
function SupportTab({ projectId, clientId, hasRealData }: { projectId?: string; clientId?: string; hasRealData: boolean }) {
  const { tickets, stats } = useSupportTickets(projectId ? { projectId } : {});
  const useReal = hasRealData && tickets.length > 0;

  const MOCK_TICKETS = [
    { id: '1', title: 'Update hero image on homepage', category: 'website_change', priority: 'normal', status: 'in_progress', agent: 'website-builder', created: 'Apr 6' },
    { id: '2', title: 'Fix mobile nav on service page', category: 'bug_report', priority: 'high', status: 'open', agent: null, created: 'Apr 7' },
  ];

  const displayTickets = useReal
    ? tickets.map(t => ({ id: t.id, title: t.title, category: t.category, priority: t.priority, status: t.status, agent: t.assigned_agent, created: new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }))
    : MOCK_TICKETS;

  const categoryLabels: Record<string, string> = {
    website_change: 'Website', content_revision: 'Content', bug_report: 'Bug',
    feature_request: 'Feature', billing: 'Billing', automation: 'Automation', general: 'General',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Open" value={useReal ? stats.open : 1} icon={AlertTriangle} />
        <KPICard label="In Progress" value={useReal ? stats.inProgress : 1} icon={Clock} />
        <KPICard label="Resolved" value={useReal ? stats.resolved : 5} icon={CheckCircle2} />
        <KPICard label="Total" value={displayTickets.length} icon={LifeBuoy} />
      </div>
      <div className="flex justify-end">
        <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> New Ticket</Button>
      </div>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[2fr_80px_70px_90px_100px_80px] px-4 py-2.5 border-b border-border text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
          <span>Ticket</span><span>Category</span><span>Priority</span><span>Status</span><span>Agent</span><span>Created</span>
        </div>
        {displayTickets.map((ticket, i) => (
          <div key={ticket.id} className={cn('grid grid-cols-[2fr_80px_70px_90px_100px_80px] px-4 py-3 items-center text-[13px]', i % 2 === 0 ? 'bg-card' : 'bg-background')}>
            <span className="font-medium truncate flex items-center gap-2">
              <MessageSquare className="h-3 w-3 text-muted-foreground/50 shrink-0" />
              {ticket.title}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">{categoryLabels[ticket.category] ?? ticket.category}</span>
            <span className={cn('text-[10px] font-semibold', ticket.priority === 'urgent' ? 'text-destructive' : ticket.priority === 'high' ? 'text-warning' : 'text-muted-foreground')}>
              {ticket.priority}
            </span>
            <StatusBadge status={ticket.status} />
            <span className="text-[10px] font-mono text-muted-foreground">
              {ticket.agent ? (
                <span className="flex items-center gap-1"><Bot className="h-2.5 w-2.5 text-accent" />{ticket.agent}</span>
              ) : (
                <span className="text-muted-foreground/40">Unassigned</span>
              )}
            </span>
            <span className="text-xs text-muted-foreground">{ticket.created}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
