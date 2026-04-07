import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  FileText,
  DollarSign,
  Radio,
  CheckCircle2,
  Circle,
  Bot,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data } = await supabase.from('tasks').select('*, clients(business_name)').order('created_at', { ascending: false }).limit(10);
      return data || [];
    },
  });

  const { data: aiLogs = [] } = useQuery({
    queryKey: ['ai_logs'],
    queryFn: async () => {
      const { data } = await supabase.from('ai_logs').select('*').order('created_at', { ascending: false }).limit(20);
      return data || [];
    },
  });

  const activeClients = clients.filter(c => c.pipeline_stage === 'live').length;
  const totalMRR = clients.reduce((sum, c) => sum + (Number(c.monthly_value) || 0), 0);
  const stageCount = (stage: string) => clients.filter(c => c.pipeline_stage === stage).length;

  const stages = [
    { label: 'Leads', key: 'leads', count: stageCount('leads') },
    { label: 'Audit', key: 'audit', count: stageCount('audit') },
    { label: 'Strategy', key: 'strategy', count: stageCount('strategy') },
    { label: 'Build', key: 'build', count: stageCount('build') },
    { label: 'Produce', key: 'produce', count: stageCount('produce') },
    { label: 'Live', key: 'live', count: stageCount('live') },
  ];

  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  return (
    <AppLayout>
      {/* Top Bar */}
      <header className="flex h-14 items-center justify-between border-b border-border px-6 shrink-0">
        <div>
          <h1 className="text-base font-bold uppercase tracking-wider font-mono">Dashboard</h1>
        </div>
        <div className="text-xs text-muted-foreground">
          Welcome back, <span className="text-foreground font-medium">{displayName}</span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6 scrollbar-thin">
        {/* Row 1: KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard
            label="Active Clients"
            value={activeClients}
            icon={Users}
            subtitle={`${clients.length} total`}
          />
          <KPICard
            label="Content Queue"
            value={0}
            icon={FileText}
            subtitle="0 scheduled"
          />
          <KPICard
            label="MRR"
            value={`$${totalMRR.toLocaleString()}`}
            icon={DollarSign}
          />
          <KPICard
            label="Leads This Week"
            value={0}
            icon={Radio}
            subtitle="0 qualified"
          />
        </div>

        {/* Row 2: Tasks + Calendar */}
        <div className="grid grid-cols-5 gap-4">
          {/* Today's Tasks (60%) */}
          <div className="col-span-3 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">Today's Tasks</h2>
              <span className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">View All</span>
            </div>
            {tasks.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No tasks yet"
                description="Tasks from your pipeline and content workflows will appear here."
              />
            ) : (
              <div className="space-y-0">
                <div className="grid grid-cols-[32px_1fr_120px_100px_80px] gap-2 text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b border-border">
                  <span>State</span>
                  <span>Task</span>
                  <span>Client</span>
                  <span>Module</span>
                  <span>Due</span>
                </div>
                {tasks.map((task: any) => (
                  <div key={task.id} className="grid grid-cols-[32px_1fr_120px_100px_80px] gap-2 items-center py-2.5 border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <Circle className={`h-4 w-4 ${task.is_completed ? 'text-success fill-success' : 'text-muted-foreground'}`} />
                    <span className="text-sm truncate">{task.description}</span>
                    <span className="text-xs text-muted-foreground truncate">{task.clients?.business_name || '—'}</span>
                    <span>{task.module ? <StatusBadge status={task.module} /> : '—'}</span>
                    <span className="text-xs text-muted-foreground">{task.due_date || '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content Calendar Mini (40%) */}
          <div className="col-span-2 rounded-lg border border-border bg-card p-4">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-4">Content Calendar</h2>
            <EmptyState
              icon={FileText}
              title="No content scheduled"
              description="Scheduled content will appear in a weekly calendar view."
              actionLabel="Go to Content Studio"
              onAction={() => navigate('/content')}
            />
          </div>
        </div>

        {/* Row 3: Pipeline Snapshot + Revenue */}
        <div className="grid grid-cols-2 gap-4">
          {/* Pipeline Snapshot */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">Pipeline Snapshot</h2>
              <span className="text-xs font-mono text-muted-foreground">Current Deals: {clients.length}</span>
            </div>
            <div className="space-y-2.5">
              {stages.map((stage) => {
                const maxCount = Math.max(...stages.map(s => s.count), 1);
                const width = Math.max((stage.count / maxCount) * 100, 8);
                return (
                  <div key={stage.key} className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate(`/pipeline?stage=${stage.key}`)}>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground w-20">{stage.label}</span>
                    <div className="flex-1 h-6 bg-muted/30 rounded overflow-hidden">
                      <div
                        className="h-full bg-accent/20 border border-accent/30 rounded flex items-center justify-end px-2 transition-all group-hover:bg-accent/30"
                        style={{ width: `${width}%` }}
                      >
                        <span className="text-[11px] font-bold text-accent">{stage.count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Progress */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-4">Revenue Progress</h2>
            <div className="flex items-end gap-3 mb-3">
              <span className="text-3xl font-bold">${totalMRR.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground mb-1">/ $15,000 goal</span>
              <span className="text-sm font-bold text-accent ml-auto mb-1">{Math.round((totalMRR / 15000) * 100)}%</span>
            </div>
            <div className="h-2.5 bg-muted/30 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${Math.min((totalMRR / 15000) * 100, 100)}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Growth</span>
                <span className="text-lg font-bold text-success">+0%</span>
              </div>
              <div className="rounded-lg border border-border p-3">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Churn Rate</span>
                <span className="text-lg font-bold">0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: AI Activity Feed */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Recent AI Activity Feed
            </h2>
            <span className="text-[10px] font-mono text-accent uppercase tracking-wider">System_Online</span>
          </div>
          {aiLogs.length === 0 ? (
            <div className="text-sm text-muted-foreground font-mono py-4">No AI activity yet. Dispatch commands from the AI Command Center.</div>
          ) : (
            <div className="space-y-1">
              {aiLogs.slice(0, 8).map((log: any) => (
                <div key={log.id} className="flex items-center gap-4 py-1.5 text-sm font-mono">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="text-muted-foreground">&gt;&gt;</span>
                  <span className="flex-1 truncate">{log.action}</span>
                  <StatusBadge status={log.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
