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
import { cn } from '@/lib/utils';
import {
  Plus, X, Globe, Film, MessageSquare, BarChart3, GitBranch, GripVertical,
  Check, Play, Bot, Eye, Target, CreditCard, FileText, Maximize2,
} from 'lucide-react';
import { toast } from 'sonner';
import { EmbeddedCanvas } from '@/components/canvas/EmbeddedCanvas';

const STAGES = [
  { key: 'leads', label: 'Leads', color: 'hsl(var(--muted-foreground))' },
  { key: 'audit', label: 'Audit', color: 'hsl(var(--warning))' },
  { key: 'strategy', label: 'Strategy', color: 'hsl(210,80%,55%)' },
  { key: 'build', label: 'Build', color: 'hsl(var(--accent))' },
  { key: 'produce', label: 'Produce', color: 'hsl(var(--success))' },
  { key: 'live', label: 'Live', color: 'hsl(var(--success))' },
] as const;

type PipelineStage = typeof STAGES[number]['key'];

const mockClients = [
  { id: 'm1', business_name: 'Acme Pressure Washing', contact_name: 'John Smith', industry: 'Pressure Washing', location: 'Metairie, LA', email: 'john@acmepw.com', phone: '(504) 555-0101', pipeline_stage: 'build', services: ['content', 'website'], monthly_value: 1356, days_in_stage: 12 },
  { id: 'm2', business_name: 'Bayou Landscaping', contact_name: 'Maria Garcia', industry: 'Landscaping', location: 'Kenner, LA', email: 'maria@bayouland.com', phone: '(504) 555-0202', pipeline_stage: 'produce', services: ['content', 'automations'], monthly_value: 1697, days_in_stage: 8 },
  { id: 'm3', business_name: 'NOLA Roofing Pros', contact_name: 'David Chen', industry: 'Roofing', location: 'New Orleans, LA', email: 'david@nolaroof.com', phone: '(504) 555-0303', pipeline_stage: 'audit', services: ['content', 'website', 'automations'], monthly_value: 2150, days_in_stage: 3 },
  { id: 'm4', business_name: 'Delta Pool Services', contact_name: 'Sarah Wilson', industry: 'Pool Services', location: 'Slidell, LA', email: 'sarah@deltapool.com', phone: '(985) 555-0404', pipeline_stage: 'live', services: ['content'], monthly_value: 1200, days_in_stage: 45 },
  { id: 'm5', business_name: 'Crescent City Painting', contact_name: 'James Brown', industry: 'Painting', location: 'Gretna, LA', email: 'james@ccpainting.com', phone: '(504) 555-0505', pipeline_stage: 'strategy', services: ['website', 'automations'], monthly_value: 497, days_in_stage: 5 },
  { id: 'm6', business_name: 'Gulf Coast HVAC', contact_name: 'Lisa Martinez', industry: 'HVAC', location: 'Hammond, LA', email: 'lisa@gulfhvac.com', phone: '(985) 555-0606', pipeline_stage: 'leads', services: [], monthly_value: 0, days_in_stage: 1 },
  { id: 'm7', business_name: 'Magnolia Concrete', contact_name: 'Robert Taylor', industry: 'Concrete', location: 'Mandeville, LA', email: 'rob@magconcrete.com', phone: '(985) 555-0707', pipeline_stage: 'live', services: ['content', 'website'], monthly_value: 1453, days_in_stage: 60 },
  { id: 'm8', business_name: 'Pelican Fencing', contact_name: 'Amy Nguyen', industry: 'Fencing', location: 'Covington, LA', email: 'amy@pelfen.com', phone: '(985) 555-0808', pipeline_stage: 'leads', services: [], monthly_value: 0, days_in_stage: 2 },
  { id: 'm9', business_name: 'Tidewater Lawn Care', contact_name: 'Marcus Johnson', industry: 'Lawn Care', location: 'Houma, LA', email: 'marcus@tidewaterlawn.com', phone: '(985) 555-0909', pipeline_stage: 'produce', services: ['content', 'website', 'automations'], monthly_value: 2347, days_in_stage: 15 },
  { id: 'm10', business_name: 'Pontchartrain Plumbing', contact_name: 'Kevin Williams', industry: 'Plumbing', location: 'Metairie, LA', email: 'kevin@pontplumb.com', phone: '(504) 555-1010', pipeline_stage: 'build', services: ['content', 'website'], monthly_value: 1356, days_in_stage: 7 },
];

export default function Pipeline() {
  const { user } = useAuth();
  const { createSession } = useSession();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [drawerTab, setDrawerTab] = useState('overview');
  const [viewMode, setViewMode] = useState('kanban');
  const [discoveryFullscreen, setDiscoveryFullscreen] = useState(false);

  const { data: dbClients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  // Use DB clients if available, otherwise mock
  const clients = dbClients.length > 0 ? dbClients : mockClients;

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const { error } = await supabase.from('clients').update({ pipeline_stage: stage }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  });

  const drawerTabs = ['overview', 'discovery', 'readiness', 'audit', 'strategy', 'website', 'content', 'comms', 'billing'];

  return (
    <AppLayout>
      <header className="flex h-14 items-center justify-between border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold">Pipeline</h1>
        <div className="flex gap-2 items-center">
          <div className="flex bg-card rounded-md border border-border overflow-hidden">
            {['kanban', 'table', 'timeline'].map(v => (
              <button key={v} onClick={() => setViewMode(v)} className={cn(
                'px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                viewMode === v ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}>{v}</button>
            ))}
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setShowAddModal(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Client
          </Button>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-3 min-w-max h-full">
          {STAGES.map((stage) => {
            const stageClients = clients.filter((c: any) => c.pipeline_stage === stage.key);
            return (
              <div key={stage.key} className="w-[280px] flex flex-col"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const clientId = e.dataTransfer.getData('clientId');
                  if (clientId && !clientId.startsWith('m')) {
                    updateStageMutation.mutate({ id: clientId, stage: stage.key });
                  }
                }}
              >
                {/* Column Header */}
                <div className="flex items-center gap-2 py-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="text-xs font-semibold uppercase tracking-wider">{stage.label}</span>
                  <span className="text-xs text-muted-foreground bg-muted rounded-full px-2">{stageClients.length}</span>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
                  {stageClients.map((client: any) => (
                    <div
                      key={client.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('clientId', client.id)}
                      onClick={() => { setSelectedClient(client); setDrawerTab('overview'); }}
                      className="rounded-lg border border-border bg-card p-3 cursor-pointer hover:border-accent/40 transition-colors group"
                    >
                      <div className="text-sm font-semibold mb-1">{client.business_name}</div>
                      <div className="text-xs text-muted-foreground mb-1.5">{client.contact_name} · {client.location}</div>
                      {Number(client.monthly_value) > 0 && (
                        <div className="text-[13px] text-accent font-semibold mb-1">
                          ${Number(client.monthly_value).toLocaleString()}/mo · {(client.services || []).join(' + ')}
                        </div>
                      )}
                      <div className="text-[11px] text-muted-foreground">{stage.label} · {client.days_in_stage || '—'} days</div>
                      <div className="flex gap-1.5 mt-2">
                        {(client.services || []).includes('website') && <Globe className="h-3.5 w-3.5 text-[hsl(210,80%,55%)]" />}
                        {(client.services || []).includes('content') && <Film className="h-3.5 w-3.5 text-accent" />}
                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                        <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Client Drawer */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedClient(null)} />
          <div className="relative w-[500px] bg-card border-l border-border h-full overflow-hidden animate-slide-in-right flex flex-col shadow-[-8px_0_24px_rgba(0,0,0,0.3)]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div>
                <div className="text-lg font-semibold">{selectedClient.business_name}</div>
                <div className="text-xs text-muted-foreground">{selectedClient.contact_name} · {selectedClient.location}</div>
              </div>
              <button onClick={() => setSelectedClient(null)} className="text-muted-foreground hover:text-foreground p-1"><X className="h-5 w-5" /></button>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-border px-3 shrink-0 scrollbar-thin">
              {drawerTabs.map((tab) => (
                <button key={tab} onClick={() => setDrawerTab(tab)}
                  className={cn(
                    'px-3 py-2.5 text-xs font-medium capitalize whitespace-nowrap border-b-2 transition-colors',
                    drawerTab === tab ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}>{tab}</button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
              {drawerTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Industry', value: selectedClient.industry },
                      { label: 'MRR', value: Number(selectedClient.monthly_value) > 0 ? `$${Number(selectedClient.monthly_value).toLocaleString()}/mo` : '—', accent: true },
                      { label: 'Email', value: selectedClient.email, link: true },
                      { label: 'Phone', value: selectedClient.phone },
                    ].map(({ label, value, accent, link }) => (
                      <div key={label} className="p-3 rounded-md bg-background">
                        <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
                        <div className={cn('text-[13px]', accent && 'text-accent font-semibold', link && 'text-[hsl(210,80%,55%)]')}>{value || '—'}</div>
                      </div>
                    ))}
                  </div>
                  {/* Services */}
                  <div className="p-3 rounded-md bg-background">
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Services</div>
                    <div className="flex gap-1.5">
                      {(selectedClient.services || []).length > 0 ? (selectedClient.services || []).map((s: string) => (
                        <StatusBadge key={s} status={s} />
                      )) : <span className="text-xs text-muted-foreground">None yet</span>}
                    </div>
                  </div>
                  {/* Stage History */}
                  <div className="p-3 rounded-md bg-background">
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-3">Stage History</div>
                    <div className="flex items-center gap-1">
                      {STAGES.map((s, i) => {
                        const stageIdx = STAGES.findIndex(st => st.key === selectedClient.pipeline_stage);
                        const isActive = i <= stageIdx;
                        return (
                          <div key={s.key} className="flex items-center gap-1">
                            <div className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center',
                              isActive ? 'bg-accent' : 'bg-muted'
                            )}>
                              {i < stageIdx ? <Check className="h-3 w-3 text-accent-foreground" /> : i === stageIdx ? <div className="w-2 h-2 rounded-full bg-accent-foreground" /> : null}
                            </div>
                            {i < STAGES.length - 1 && <div className={cn('w-4 h-0.5', isActive && i < stageIdx ? 'bg-accent' : 'bg-muted')} />}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-1 mt-1.5">
                      {STAGES.map(s => <span key={s.key} className="text-[9px] text-muted-foreground w-6 text-center">{s.label.slice(0,3)}</span>)}
                    </div>
                  </div>
                </div>
              )}
              {drawerTab === 'discovery' && (
                <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-border rounded-lg">
                  <GitBranch className="h-10 w-10 text-accent mb-3" strokeWidth={1.5} />
                  <div className="text-base font-semibold mb-1">ALIGN Discovery Canvas</div>
                  <div className="text-[13px] text-muted-foreground text-center max-w-[280px] mb-4">Existing ALIGN canvas with nodes, connectors, questions, and funnel mapping loads here</div>
                  <Button size="sm" className="gap-1.5"><Play className="h-3.5 w-3.5" /> Start Discovery Session</Button>
                </div>
              )}
              {drawerTab === 'readiness' && (
                <div className="space-y-4">
                  <div className="text-center py-6">
                    <div className="text-5xl font-bold text-accent">72%</div>
                    <div className="text-sm text-muted-foreground mt-1">AI Readiness Score</div>
                  </div>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-5">
                    <Bot className="h-8 w-8 text-accent mb-2" strokeWidth={1.5} />
                    <div className="text-[13px] text-muted-foreground text-center">ALIGN AI Readiness panel embeds here with full scoring breakdown and recommendations</div>
                  </div>
                </div>
              )}
              {drawerTab === 'content' && (
                <EmptyState icon={Film} title="No content scripts yet" actionLabel="Create First Script" onAction={() => {}} />
              )}
              {!['overview', 'discovery', 'readiness', 'content'].includes(drawerTab) && (
                <EmptyState
                  icon={drawerTab === 'audit' ? Eye : drawerTab === 'strategy' ? Target : drawerTab === 'website' ? Globe : drawerTab === 'comms' ? MessageSquare : drawerTab === 'billing' ? CreditCard : FileText}
                  title={`${drawerTab.charAt(0).toUpperCase() + drawerTab.slice(1)} tab for ${selectedClient.business_name}`}
                  actionLabel={`Set Up ${drawerTab.charAt(0).toUpperCase() + drawerTab.slice(1)}`}
                  onAction={() => {}}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {showAddModal && <AddClientModal onClose={() => setShowAddModal(false)} />}
    </AppLayout>
  );
}

function AddClientModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ business_name: '', contact_name: '', email: '', phone: '', industry: '', location: '', monthly_value: '', pipeline_stage: 'leads' as PipelineStage });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('clients').insert({ ...form, monthly_value: Number(form.monthly_value) || 0, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); toast.success('Client added'); onClose(); },
    onError: (e: any) => toast.error(e.message),
  });

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-[440px] bg-card border border-border rounded-xl p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Add Client</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="space-y-3">
          <div><Label className="text-xs">Business Name *</Label><Input value={form.business_name} onChange={e => set('business_name', e.target.value)} placeholder="Acme Corp" className="mt-1" /></div>
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
              <SelectContent>{STAGES.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" disabled={!form.business_name.trim() || createMutation.isPending} onClick={() => createMutation.mutate()}>
            {createMutation.isPending ? 'Adding...' : 'Add Client'}
          </Button>
        </div>
      </div>
    </div>
  );
}
