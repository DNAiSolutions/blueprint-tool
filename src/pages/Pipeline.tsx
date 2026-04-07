import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import {
  Plus,
  X,
  Globe,
  Film,
  MessageCircle,
  BarChart3,
  GitBranch,
  GripVertical,
} from 'lucide-react';
import { toast } from 'sonner';

const STAGES = [
  { key: 'leads', label: 'Leads' },
  { key: 'audit', label: 'Audit' },
  { key: 'strategy', label: 'Strategy' },
  { key: 'build', label: 'Build' },
  { key: 'produce', label: 'Produce' },
  { key: 'live', label: 'Live' },
] as const;

type PipelineStage = typeof STAGES[number]['key'];

export default function Pipeline() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [drawerTab, setDrawerTab] = useState('overview');

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const { error } = await supabase.from('clients').update({ pipeline_stage: stage }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  });

  const drawerTabs = ['Overview', 'Discovery', 'Readiness', 'Audit', 'Strategy', 'Website', 'Content', 'Comms', 'Billing'];

  return (
    <AppLayout>
      {/* Top Bar */}
      <header className="flex h-14 items-center justify-between border-b border-border px-6 shrink-0">
        <h1 className="text-base font-bold uppercase tracking-wider font-mono">Pipeline</h1>
        <Button size="sm" className="gap-1.5" onClick={() => setShowAddModal(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add Client
        </Button>
      </header>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 min-w-max h-full">
          {STAGES.map((stage) => {
            const stageClients = clients.filter((c: any) => c.pipeline_stage === stage.key);
            return (
              <div
                key={stage.key}
                className="w-[280px] flex flex-col rounded-lg bg-muted/20 border border-border/50"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const clientId = e.dataTransfer.getData('clientId');
                  if (clientId) {
                    updateStageMutation.mutate({ id: clientId, stage: stage.key });
                  }
                }}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={stage.key} />
                    <span className="text-xs font-mono text-muted-foreground">{String(stageClients.length).padStart(2, '0')}</span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
                  {stageClients.length === 0 ? (
                    <div className="text-center py-8 text-xs text-muted-foreground">No clients</div>
                  ) : (
                    stageClients.map((client: any) => (
                      <div
                        key={client.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('clientId', client.id)}
                        onClick={() => { setSelectedClient(client); setDrawerTab('overview'); }}
                        className="rounded-lg border border-border bg-card p-3 cursor-pointer hover:border-accent/40 transition-colors group"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm font-semibold truncate pr-2">{client.business_name}</p>
                          <GripVertical className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                        </div>
                        {client.contact_name && (
                          <p className="text-xs text-muted-foreground truncate">{client.contact_name}{client.location ? ` · ${client.location}` : ''}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-mono text-accent font-semibold">
                            {Number(client.monthly_value) > 0 ? `$${Number(client.monthly_value).toLocaleString()}/mo` : '—'}
                          </span>
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-pointer" />
                            <Film className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-pointer" />
                            <MessageCircle className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-pointer" />
                            <BarChart3 className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-pointer" />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
          <div className="relative w-[480px] bg-card border-l border-border h-full overflow-hidden animate-slide-in-right flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div>
                <p className="text-[10px] font-mono text-accent uppercase tracking-wider">Align Module</p>
                <h2 className="text-xl font-bold">{selectedClient.business_name}</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedClient(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-border px-2 shrink-0 scrollbar-thin">
              {drawerTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDrawerTab(tab.toLowerCase())}
                  className={cn(
                    'px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2',
                    drawerTab === tab.toLowerCase()
                      ? 'border-accent text-accent'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
              {drawerTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Contact', value: selectedClient.contact_name || '—' },
                      { label: 'Industry', value: selectedClient.industry || '—' },
                      { label: 'Location', value: selectedClient.location || '—' },
                      { label: 'Email', value: selectedClient.email || '—' },
                      { label: 'Phone', value: selectedClient.phone || '—' },
                      { label: 'Monthly Value', value: Number(selectedClient.monthly_value) > 0 ? `$${Number(selectedClient.monthly_value).toLocaleString()}` : '—' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{label}</span>
                        <p className="text-sm font-medium mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Stage</span>
                    <div className="mt-1"><StatusBadge status={selectedClient.pipeline_stage} /></div>
                  </div>
                </div>
              )}
              {drawerTab === 'discovery' && (
                <div className="text-center py-12">
                  <GitBranch className="h-8 w-8 text-accent mx-auto mb-3" />
                  <p className="text-sm font-semibold mb-1">ALIGN Discovery Canvas</p>
                  <p className="text-xs text-muted-foreground mb-4">The full discovery canvas will be embedded here, loaded from the client's ALIGN session.</p>
                  <Button size="sm" variant="outline" onClick={() => {
                    if (selectedClient.session_id) {
                      window.open(`/canvas/${selectedClient.session_id}`, '_blank');
                    } else {
                      toast.info('No ALIGN session linked to this client yet.');
                    }
                  }}>
                    {selectedClient.session_id ? 'Open Canvas' : 'Link ALIGN Session'}
                  </Button>
                </div>
              )}
              {drawerTab === 'readiness' && (
                <div className="text-center py-12">
                  <div className="text-4xl font-bold text-accent mb-1">—</div>
                  <p className="text-sm text-muted-foreground">AI Readiness score will appear after completing a discovery session.</p>
                </div>
              )}
              {['audit', 'strategy', 'website', 'content', 'comms', 'billing'].includes(drawerTab) && (
                <EmptyState
                  icon={GitBranch}
                  title={`${drawerTab.charAt(0).toUpperCase() + drawerTab.slice(1)} coming soon`}
                  description={`This section will contain ${drawerTab} details for ${selectedClient.business_name}.`}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && <AddClientModal onClose={() => setShowAddModal(false)} />}
    </AppLayout>
  );
}

function AddClientModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    industry: '',
    location: '',
    monthly_value: '',
    pipeline_stage: 'leads' as PipelineStage,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('clients').insert({
        ...form,
        monthly_value: Number(form.monthly_value) || 0,
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client added');
      onClose();
    },
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
          <div>
            <Label className="text-xs">Business Name *</Label>
            <Input value={form.business_name} onChange={e => set('business_name', e.target.value)} placeholder="Acme Corp" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Contact Name</Label>
              <Input value={form.contact_name} onChange={e => set('contact_name', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Industry</Label>
              <Input value={form.industry} onChange={e => set('industry', e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Email</Label>
              <Input value={form.email} onChange={e => set('email', e.target.value)} type="email" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Phone</Label>
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Location</Label>
              <Input value={form.location} onChange={e => set('location', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Monthly Value ($)</Label>
              <Input value={form.monthly_value} onChange={e => set('monthly_value', e.target.value)} type="number" className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Pipeline Stage</Label>
            <Select value={form.pipeline_stage} onValueChange={(v) => set('pipeline_stage', v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STAGES.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
              </SelectContent>
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
