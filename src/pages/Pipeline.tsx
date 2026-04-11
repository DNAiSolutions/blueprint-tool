// @ts-nocheck
import { useState, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePipelineOps, PIPELINE_STAGES } from '@/hooks/usePipelineOps';
import { cn } from '@/lib/utils';
import {
  Plus, X, Globe, Film, MessageSquare, BarChart3, GitBranch, GripVertical,
  Check, Play, Bot, Eye, Target, CreditCard, FileText, Maximize2, DollarSign, User, Loader2,
  List, LayoutGrid, ArrowUpDown, Search, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { EmbeddedCanvas } from '@/components/canvas/EmbeddedCanvas';
import { useAgentTasks } from '@/hooks/useAgentTasks';
import { useNavigate } from 'react-router-dom';

// Pipeline stages for the unified client lifecycle
const CLIENT_STAGES = [
  { key: 'new_lead', label: 'New Lead', color: 'hsl(var(--muted-foreground))' },
  { key: 'discovery', label: 'Discovery', color: 'hsl(210,80%,55%)' },
  { key: 'proposal', label: 'Proposal', color: 'hsl(var(--accent))' },
  { key: 'onboarding', label: 'Onboarding', color: 'hsl(var(--warning))' },
  { key: 'active', label: 'Active', color: 'hsl(var(--success))' },
] as const;

type ClientStage = typeof CLIENT_STAGES[number]['key'];
type PipelineTab = 'all' | 'new_leads' | 'sales' | 'onboarding';
type ViewMode = 'kanban' | 'table';

const TABS: { key: PipelineTab; label: string }[] = [
  { key: 'all', label: 'All Clients' },
  { key: 'new_leads', label: 'New Leads' },
  { key: 'sales', label: 'Sales' },
  { key: 'onboarding', label: 'Onboarding' },
];

export default function Pipeline() {
  const { user } = useAuth();
  const { createSession } = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [drawerTab, setDrawerTab] = useState('overview');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [discoveryFullscreen, setDiscoveryFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<PipelineTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Real pipeline data for sub-pipeline tabs
  const pipelineType = activeTab !== 'all' ? activeTab : undefined;
  const { opportunities, loading: pipelineLoading, updateStage: updatePipelineStage, createOpportunity, stats } = usePipelineOps({
    pipeline: pipelineType as 'new_leads' | 'sales' | 'onboarding' | undefined,
  });

  // Clients query (unified view)
  const { data: dbClients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const clients = dbClients;

  const filteredClients = searchQuery
    ? clients.filter((c: any) =>
        c.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.industry?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : clients;

  const updateClientStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const { error } = await supabase.from('clients').update({ pipeline_stage: stage }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  });

  const drawerTabs = ['overview', 'discovery', 'readiness', 'audit', 'strategy', 'website', 'content', 'comms', 'billing'];

  // Stats
  const totalMRR = clients.reduce((sum: number, c: any) => sum + (Number(c.monthly_value) || 0), 0);
  const activeClients = clients.filter((c: any) => c.pipeline_stage === 'active' || c.pipeline_stage === 'live' || c.pipeline_stage === 'produce').length;

  return (
    <AppLayout>
      <header className="flex h-14 items-center justify-between border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-accent" />
          Pipeline
        </h1>
        <div className="flex gap-2 items-center">
          {/* View Mode Toggle */}
          <div className="flex bg-card rounded-md border border-border overflow-hidden">
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'px-2.5 py-1.5 text-xs font-medium transition-colors flex items-center gap-1',
                viewMode === 'kanban' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="h-3 w-3" /> Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'px-2.5 py-1.5 text-xs font-medium transition-colors flex items-center gap-1',
                viewMode === 'table' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="h-3 w-3" /> Table
            </button>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setShowAddModal(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Client
          </Button>
        </div>
      </header>

      {/* Pipeline Tab Bar + Search */}
      <div className="flex items-center justify-between border-b border-border px-6 shrink-0">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-4 py-2.5 text-xs font-medium border-b-2 transition-colors',
                activeTab === tab.key
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
              {tab.key === 'all' && clients.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-muted text-muted-foreground rounded-full px-1.5">
                  {clients.length}
                </span>
              )}
              {tab.key !== 'all' && activeTab === tab.key && stats.totalCount > 0 && (
                <span className="ml-1.5 text-[10px] bg-accent/15 text-accent rounded-full px-1.5">
                  {stats.totalCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients..."
            className="pl-8 pr-3 py-1.5 rounded-md bg-card border border-border text-xs w-48 focus:border-accent/40 focus:ring-1 focus:ring-accent/20 outline-none text-foreground placeholder:text-muted-foreground/40"
          />
        </div>
      </div>

      {/* KPI Strip */}
      {activeTab === 'all' && (
        <div className="flex items-center gap-6 px-6 py-2.5 border-b border-border/50 bg-card/50">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Clients</span>
            <span className="text-sm font-bold">{clients.length}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Active</span>
            <span className="text-sm font-bold text-success">{activeClients}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">MRR</span>
            <span className="text-sm font-bold text-accent">${totalMRR.toLocaleString()}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Pipeline Value</span>
            <span className="text-sm font-bold">${stats.totalDealValue.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'all' ? (
          viewMode === 'kanban' ? (
            <AllClientsKanban
              clients={filteredClients}
              onDrop={(clientId, stage) => updateClientStageMutation.mutate({ id: clientId, stage })}
              onSelectClient={(client) => { setSelectedClient(client); setDrawerTab('overview'); }}
              onOpenProject={(client) => navigate(`/projects?client=${client.id}`)}
            />
          ) : (
            <AllClientsTable
              clients={filteredClients}
              onSelectClient={(client) => { setSelectedClient(client); setDrawerTab('overview'); }}
              onOpenProject={(client) => navigate(`/projects?client=${client.id}`)}
            />
          )
        ) : (
          <PipelineKanbanWithAgents
            pipeline={activeTab as 'new_leads' | 'sales' | 'onboarding'}
            opportunities={opportunities}
            loading={pipelineLoading}
            onDrop={(oppId, stage) => updatePipelineStage.mutate({ id: oppId, stage })}
            onSelectOpp={(opp) => { setSelectedClient(opp); setDrawerTab('overview'); }}
          />
        )}
      </div>

      {/* Client Drawer */}
      {selectedClient && (
        <ClientDrawer
          client={selectedClient}
          drawerTab={drawerTab}
          setDrawerTab={setDrawerTab}
          drawerTabs={drawerTabs}
          discoveryFullscreen={discoveryFullscreen}
          setDiscoveryFullscreen={setDiscoveryFullscreen}
          onClose={() => setSelectedClient(null)}
          onNavigateToProject={() => navigate(`/projects?client=${selectedClient.id}`)}
        />
      )}

      {showAddModal && <AddClientModal onClose={() => setShowAddModal(false)} activePipeline={activeTab} />}
    </AppLayout>
  );
}

// ─── Client Drawer ───
function ClientDrawer({ client, drawerTab, setDrawerTab, drawerTabs, discoveryFullscreen, setDiscoveryFullscreen, onClose, onNavigateToProject }: any) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={cn(
        "relative bg-card h-full overflow-hidden animate-slide-in-right flex flex-col shadow-[-8px_0_24px_rgba(0,0,0,0.3)]",
        drawerTab === 'discovery' && discoveryFullscreen ? 'w-full' : 'w-[520px]'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <div className="text-lg font-semibold">{client.business_name || client.notes || client.stage}</div>
            <div className="text-xs text-muted-foreground">
              {client.contact_name ? `${client.contact_name} · ${client.location || ''}` : client.pipeline ? `${client.pipeline} pipeline` : ''}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {client.business_name && (
              <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={onNavigateToProject}>
                Open Project <ChevronRight className="h-3 w-3" />
              </Button>
            )}
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1"><X className="h-5 w-5" /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-border px-3 shrink-0 scrollbar-thin">
          {drawerTabs.map((tab: string) => (
            <button key={tab} onClick={() => setDrawerTab(tab)}
              className={cn(
                'px-3 py-2.5 text-xs font-medium capitalize whitespace-nowrap border-b-2 transition-colors',
                drawerTab === tab ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
              )}>{tab}</button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          {drawerTab === 'overview' && <DrawerOverview client={client} />}
          {drawerTab === 'discovery' && client.business_name && (
            <DiscoveryTab
              client={client}
              onSessionCreated={() => {}}
              fullscreen={discoveryFullscreen}
              onToggleFullscreen={() => setDiscoveryFullscreen(!discoveryFullscreen)}
            />
          )}
          {drawerTab === 'readiness' && (
            <div className="space-y-4">
              <div className="text-center py-6">
                <div className="text-5xl font-bold text-accent">72%</div>
                <div className="text-sm text-muted-foreground mt-1">AI Readiness Score</div>
              </div>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-5">
                <Bot className="h-8 w-8 text-accent mb-2" strokeWidth={1.5} />
                <div className="text-[13px] text-muted-foreground text-center">ALIGN AI Readiness scoring breakdown</div>
              </div>
            </div>
          )}
          {drawerTab === 'content' && (
            <EmptyState icon={Film} title="No content scripts yet" actionLabel="Create First Script" onAction={() => {}} />
          )}
          {!['overview', 'discovery', 'readiness', 'content'].includes(drawerTab) && (
            <EmptyState
              icon={drawerTab === 'audit' ? Eye : drawerTab === 'strategy' ? Target : drawerTab === 'website' ? Globe : drawerTab === 'comms' ? MessageSquare : drawerTab === 'billing' ? CreditCard : FileText}
              title={`${drawerTab.charAt(0).toUpperCase() + drawerTab.slice(1)} tab`}
              actionLabel={`Set Up ${drawerTab.charAt(0).toUpperCase() + drawerTab.slice(1)}`}
              onAction={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Drawer Overview ───
function DrawerOverview({ client }: { client: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Industry', value: client.industry },
          { label: client.deal_value !== undefined ? 'Deal Value' : 'MRR', value: client.deal_value !== undefined ? `$${Number(client.deal_value).toLocaleString()}` : Number(client.monthly_value) > 0 ? `$${Number(client.monthly_value).toLocaleString()}/mo` : '—', accent: true },
          { label: 'Email', value: client.email, link: true },
          { label: 'Phone', value: client.phone },
          { label: 'Location', value: client.location },
          { label: 'Stage', value: client.pipeline_stage },
        ].map(({ label, value, accent, link }) => (
          <div key={label} className="p-3 rounded-md bg-background">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
            <div className={cn('text-[13px]', accent && 'text-accent font-semibold', link && 'text-[hsl(210,80%,55%)]')}>{value || '—'}</div>
          </div>
        ))}
      </div>

      {/* Services */}
      {client.services && (
        <div className="p-3 rounded-md bg-background">
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Services</div>
          <div className="flex gap-1.5 flex-wrap">
            {Array.isArray(client.services) && client.services.length > 0 ? client.services.map((s: string) => (
              <StatusBadge key={s} status={s} />
            )) : <span className="text-xs text-muted-foreground">None yet</span>}
          </div>
        </div>
      )}

      {/* Stage Progress */}
      {client.pipeline_stage && (
        <div className="p-3 rounded-md bg-background">
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-3">Pipeline Progress</div>
          <div className="flex items-center gap-1">
            {CLIENT_STAGES.map((s, i) => {
              const stageIdx = CLIENT_STAGES.findIndex(st => st.key === client.pipeline_stage);
              const isActive = i <= stageIdx;
              return (
                <div key={s.key} className="flex items-center gap-1">
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center',
                    isActive ? 'bg-accent' : 'bg-muted'
                  )}>
                    {i < stageIdx ? <Check className="h-3 w-3 text-accent-foreground" /> : i === stageIdx ? <div className="w-2 h-2 rounded-full bg-accent-foreground" /> : null}
                  </div>
                  {i < CLIENT_STAGES.length - 1 && <div className={cn('w-4 h-0.5', isActive && i < stageIdx ? 'bg-accent' : 'bg-muted')} />}
                </div>
              );
            })}
          </div>
          <div className="flex gap-1 mt-1.5">
            {CLIENT_STAGES.map(s => <span key={s.key} className="text-[9px] text-muted-foreground w-6 text-center">{s.label.slice(0,4)}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pipeline Kanban with Agent Task Overlay ───
function PipelineKanbanWithAgents(props: {
  pipeline: 'new_leads' | 'sales' | 'onboarding';
  opportunities: any[];
  loading: boolean;
  onDrop: (oppId: string, stage: string) => void;
  onSelectOpp: (opp: any) => void;
}) {
  const { tasks: agentTasks } = useAgentTasks({ status: 'in_progress' });
  const tasksByClient: Record<string, { agent_id: string; task_type: string; status: string }[]> = {};
  agentTasks.forEach((t: any) => {
    if (t.client_id) {
      if (!tasksByClient[t.client_id]) tasksByClient[t.client_id] = [];
      tasksByClient[t.client_id].push({ agent_id: t.agent_id, task_type: t.task_type, status: t.status });
    }
  });
  return <PipelineKanban {...props} agentTasksByClient={tasksByClient} />;
}

// ─── Pipeline Kanban (Sub-pipeline) ───
function PipelineKanban({
  pipeline, opportunities, loading, onDrop, onSelectOpp, agentTasksByClient = {},
}: {
  pipeline: 'new_leads' | 'sales' | 'onboarding';
  opportunities: any[];
  loading: boolean;
  onDrop: (oppId: string, stage: string) => void;
  onSelectOpp: (opp: any) => void;
  agentTasksByClient?: Record<string, any[]>;
}) {
  const stages = PIPELINE_STAGES[pipeline];
  return (
    <div className="flex gap-3 min-w-max h-full">
      {stages.map((stage) => {
        const stageOpps = opportunities.filter((o: any) => o.stage === stage.key);
        return (
          <div key={stage.key} className="w-[280px] flex flex-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { const oppId = e.dataTransfer.getData('oppId'); if (oppId) onDrop(oppId, stage.key); }}
          >
            <div className="flex items-center gap-2 py-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
              <span className="text-xs font-semibold uppercase tracking-wider">{stage.label}</span>
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2">{stageOpps.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
              {stageOpps.length === 0 && !loading && <div className="text-center py-8 text-xs text-muted-foreground/50">Drop here</div>}
              {stageOpps.map((opp: any) => (
                <div key={opp.id} draggable onDragStart={(e) => e.dataTransfer.setData('oppId', opp.id)}
                  onClick={() => onSelectOpp(opp)}
                  className="rounded-lg border border-border bg-card p-3 cursor-pointer hover:border-accent/40 transition-colors"
                >
                  <div className="text-sm font-semibold mb-1">{opp.notes || opp.stage}</div>
                  {Number(opp.deal_value) > 0 && (
                    <div className="text-[13px] text-accent font-semibold mb-1 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />${Number(opp.deal_value).toLocaleString()}
                    </div>
                  )}
                  {opp.assigned_agent && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-accent/10 text-accent border border-accent/20 mb-1">
                      <User className="h-2.5 w-2.5" />{opp.assigned_agent}
                    </span>
                  )}
                  <div className="text-[11px] text-muted-foreground">
                    {opp.entered_stage_at ? `Entered ${new Date(opp.entered_stage_at).toLocaleDateString()}` : `Created ${new Date(opp.created_at).toLocaleDateString()}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── All Clients Kanban ───
function AllClientsKanban({ clients, onDrop, onSelectClient, onOpenProject }: {
  clients: any[]; onDrop: (id: string, stage: string) => void; onSelectClient: (c: any) => void; onOpenProject: (c: any) => void;
}) {
  return (
    <div className="flex gap-3 min-w-max h-full">
      {CLIENT_STAGES.map((stage) => {
        const stageClients = clients.filter((c: any) => c.pipeline_stage === stage.key);
        return (
          <div key={stage.key} className="w-[280px] flex flex-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { const id = e.dataTransfer.getData('clientId'); if (id) onDrop(id, stage.key); }}
          >
            <div className="flex items-center gap-2 py-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
              <span className="text-xs font-semibold uppercase tracking-wider">{stage.label}</span>
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2">{stageClients.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
              {stageClients.length === 0 && <div className="text-center py-8 text-xs text-muted-foreground/50">Drop here</div>}
              {stageClients.map((client: any) => (
                <div key={client.id} draggable
                  onDragStart={(e) => e.dataTransfer.setData('clientId', client.id)}
                  onClick={() => onSelectClient(client)}
                  className="rounded-lg border border-border bg-card p-3 cursor-pointer hover:border-accent/40 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-semibold">{client.business_name}</div>
                    {client.is_internal && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-accent/15 text-accent">INTERNAL</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mb-1.5">{client.contact_name} · {client.location}</div>
                  {Number(client.monthly_value) > 0 && (
                    <div className="text-[13px] text-accent font-semibold mb-1">${Number(client.monthly_value).toLocaleString()}/mo</div>
                  )}
                  <div className="flex gap-1.5 mt-2">
                    {client.industry && <span className="text-[10px] text-muted-foreground/60 bg-muted px-1.5 py-0.5 rounded">{client.industry}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── All Clients Table ───
function AllClientsTable({ clients, onSelectClient, onOpenProject }: {
  clients: any[]; onSelectClient: (c: any) => void; onOpenProject: (c: any) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="grid grid-cols-[2fr_1fr_1fr_100px_100px_80px] px-4 py-2.5 border-b border-border text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
        <span>Business</span><span>Contact</span><span>Industry</span><span>Stage</span><span>MRR</span><span></span>
      </div>
      {clients.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">No clients yet. Add your first client above.</div>
      ) : (
        clients.map((client: any, i: number) => (
          <div key={client.id}
            onClick={() => onSelectClient(client)}
            className={cn(
              'grid grid-cols-[2fr_1fr_1fr_100px_100px_80px] px-4 py-3 items-center text-[13px] cursor-pointer hover:bg-muted/50 transition-colors',
              i % 2 === 0 ? 'bg-card' : 'bg-background'
            )}
          >
            <div>
              <span className="font-semibold">{client.business_name}</span>
              {client.is_internal && <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-accent/15 text-accent">INTERNAL</span>}
              <div className="text-[11px] text-muted-foreground">{client.location}</div>
            </div>
            <span className="text-muted-foreground">{client.contact_name || '—'}</span>
            <span className="text-muted-foreground">{client.industry || '—'}</span>
            <StatusBadge status={client.pipeline_stage} />
            <span className={cn('font-semibold', Number(client.monthly_value) > 0 ? 'text-accent' : 'text-muted-foreground')}>
              {Number(client.monthly_value) > 0 ? `$${Number(client.monthly_value).toLocaleString()}` : '—'}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onOpenProject(client); }}
              className="text-[10px] text-muted-foreground hover:text-accent transition-colors flex items-center gap-1"
            >
              Project <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Add Client Modal ───
function AddClientModal({ onClose, activePipeline }: { onClose: () => void; activePipeline: PipelineTab }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { createOpportunity } = usePipelineOps();
  const isPipelineMode = activePipeline !== 'all';

  const [form, setForm] = useState({
    business_name: '', contact_name: '', email: '', phone: '',
    industry: '', location: '', monthly_value: '',
    pipeline_stage: 'new_lead' as ClientStage,
    deal_value: '', assigned_agent: '', notes: '',
  });

  const createClientMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('clients').insert({
        business_name: form.business_name,
        contact_name: form.contact_name,
        email: form.email,
        phone: form.phone,
        industry: form.industry,
        location: form.location,
        monthly_value: Number(form.monthly_value) || 0,
        pipeline_stage: form.pipeline_stage,
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); toast.success('Client added'); onClose(); },
    onError: (e: any) => toast.error(e.message),
  });

  const handleCreateOpportunity = async () => {
    const pipeline = activePipeline as 'new_leads' | 'sales' | 'onboarding';
    const firstStage = PIPELINE_STAGES[pipeline][0].key;
    createOpportunity.mutate({
      pipeline,
      stage: firstStage,
      deal_value: Number(form.deal_value) || 0,
      assigned_agent: form.assigned_agent || null,
      notes: form.notes || form.business_name,
    }, {
      onSuccess: () => { toast.success('Opportunity created'); onClose(); },
      onError: (e: any) => toast.error(e.message),
    });
  };

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-[440px] bg-card border border-border rounded-xl p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">{isPipelineMode ? 'Add Opportunity' : 'Add Client'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">{isPipelineMode ? 'Name / Label *' : 'Business Name *'}</Label>
            <Input value={isPipelineMode ? form.notes : form.business_name} onChange={e => set(isPipelineMode ? 'notes' : 'business_name', e.target.value)} placeholder={isPipelineMode ? 'Opportunity name' : 'Acme Corp'} className="mt-1" />
          </div>
          {isPipelineMode ? (
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Deal Value ($)</Label><Input value={form.deal_value} onChange={e => set('deal_value', e.target.value)} type="number" className="mt-1" /></div>
              <div><Label className="text-xs">Assigned Agent</Label><Input value={form.assigned_agent} onChange={e => set('assigned_agent', e.target.value)} className="mt-1" placeholder="e.g. Sales" /></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Contact Name</Label><Input value={form.contact_name} onChange={e => set('contact_name', e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs">Industry</Label><Input value={form.industry} onChange={e => set('industry', e.target.value)} className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Email</Label><Input value={form.email} onChange={e => set('email', e.target.value)} type="email" className="mt-1" /></div>
                <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={e => set('phone', e.target.value)} className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Location</Label><Input value={form.location} onChange={e => set('location', e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs">Monthly Value ($)</Label><Input value={form.monthly_value} onChange={e => set('monthly_value', e.target.value)} type="number" className="mt-1" /></div>
              </div>
              <div>
                <Label className="text-xs">Pipeline Stage</Label>
                <Select value={form.pipeline_stage} onValueChange={(v) => set('pipeline_stage', v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{CLIENT_STAGES.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          {isPipelineMode ? (
            <Button className="flex-1" disabled={!form.notes.trim() || createOpportunity.isPending} onClick={handleCreateOpportunity}>
              {createOpportunity.isPending ? 'Adding...' : 'Add Opportunity'}
            </Button>
          ) : (
            <Button className="flex-1" disabled={!form.business_name.trim() || createClientMutation.isPending} onClick={() => createClientMutation.mutate()}>
              {createClientMutation.isPending ? 'Adding...' : 'Add Client'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Discovery Tab ───
function DiscoveryTab({ client, onSessionCreated, fullscreen, onToggleFullscreen }: {
  client: any; onSessionCreated: (sessionId: string) => void; fullscreen: boolean; onToggleFullscreen: () => void;
}) {
  const { createSession } = useSession();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [localSessionId, setLocalSessionId] = useState<string | null>(client.session_id || null);

  const handleStartSession = useCallback(async () => {
    const session = createSession(client.business_name, client.industry || undefined);
    setLocalSessionId(session.id);
    if (user && client.id) {
      await supabase.from('clients').update({ session_id: session.id }).eq('id', client.id);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
    onSessionCreated(session.id);
    toast.success('Discovery session started');
  }, [client, createSession, user, queryClient, onSessionCreated]);

  if (!localSessionId) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] rounded-lg bg-[hsl(var(--surface-low))]">
        <GitBranch className="h-10 w-10 text-primary mb-3" strokeWidth={1.5} />
        <div className="text-base font-semibold mb-1">ALIGN Discovery Canvas</div>
        <div className="text-[13px] text-muted-foreground text-center max-w-[280px] mb-4">
          Map {client.business_name}'s operations, quantify revenue leakage, and assess AI readiness.
        </div>
        <Button size="sm" className="gap-1.5" onClick={handleStartSession}>
          <Play className="h-3.5 w-3.5" /> Start Discovery Session
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", fullscreen ? "fixed inset-0 z-[60] bg-background" : "h-[600px]")}>
      <div className="flex items-center justify-between px-3 py-2 shrink-0">
        <span className="ai-label">Discovery — {client.business_name}</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleFullscreen}>
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          {fullscreen && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleFullscreen}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-hidden rounded-lg">
        <EmbeddedCanvas sessionId={localSessionId} compact hideReadiness />
      </div>
    </div>
  );
}
