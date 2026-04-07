import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import {
  Users,
  FileText,
  DollarSign,
  Radio,
  Check,
  Bot,
  ArrowRight,
  Plus,
  Bell,
  Search,
  Play,
  Copy,
  Image,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Mock data for initial display
const mockTasks = [
  { id: 't1', desc: 'Render 5 HeyGen videos for Acme PW', client: 'Acme Pressure Washing', module: 'Content', due: 'Today', done: false },
  { id: 't2', desc: 'Deploy website v2 for Bayou Landscaping', client: 'Bayou Landscaping', module: 'Websites', due: 'Today', done: false },
  { id: 't3', desc: 'Run ALIGN discovery for NOLA Roofing', client: 'NOLA Roofing Pros', module: 'Pipeline', due: 'Today', done: false },
  { id: 't4', desc: 'Generate 7 carousels for this week', client: 'DigitalDNA', module: 'Content', due: 'Tomorrow', done: true },
  { id: 't5', desc: 'Follow up with Gulf Coast HVAC lead', client: 'Gulf Coast HVAC', module: 'Leads', due: 'Today', done: false },
  { id: 't6', desc: 'Review Q1 P&L report', client: 'DigitalDNA', module: 'Finances', due: 'Apr 8', done: false },
];

const contentCalendar: Record<string, { type: string; title: string }[]> = {
  Mon: [{ type: 'video', title: 'Reel #1' }, { type: 'carousel', title: 'Audit Reveal' }],
  Tue: [{ type: 'video', title: 'TikTok #4' }],
  Wed: [{ type: 'video', title: 'Reel #2' }, { type: 'image', title: 'Story' }, { type: 'carousel', title: 'The Math' }],
  Thu: [{ type: 'video', title: 'YT Short' }],
  Fri: [{ type: 'video', title: 'Reel #3' }, { type: 'carousel', title: 'Results' }],
  Sat: [{ type: 'image', title: 'Personal' }],
  Sun: [],
};

const revenueTrend = [
  { month: 'Nov', revenue: 4200 },
  { month: 'Dec', revenue: 6800 },
  { month: 'Jan', revenue: 9100 },
  { month: 'Feb', revenue: 11400 },
  { month: 'Mar', revenue: 14200 },
  { month: 'Apr', revenue: 16280 },
];

const mockAILogs = [
  { id: 'a1', action: 'Generated 5 reel scripts for Monday batch', module: 'Content', status: 'success', time: '2 min ago', duration: '12s' },
  { id: 'a2', action: 'HeyGen video render — Acme PW Script #3', module: 'Content', status: 'success', time: '15 min ago', duration: '3m 42s' },
  { id: 'a3', action: 'Apollo search — 50 HVAC businesses in Houston', module: 'Leads', status: 'success', time: '1 hr ago', duration: '8s' },
  { id: 'a4', action: 'KIE.ai image generation — carousel slide 4', module: 'Content', status: 'running', time: 'Just now', duration: '—' },
  { id: 'a5', action: 'Vercel deploy — Bayou Landscaping site', module: 'Websites', status: 'error', time: '3 hrs ago', duration: '45s' },
];

const stages = [
  { label: 'Leads', key: 'leads' },
  { label: 'Audit', key: 'audit' },
  { label: 'Strategy', key: 'strategy' },
  { label: 'Build', key: 'build' },
  { label: 'Produce', key: 'produce' },
  { label: 'Live', key: 'live' },
];

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

  const activeClients = clients.filter((c: any) => ['live', 'produce', 'build'].includes(c.pipeline_stage)).length;
  const totalMRR = clients.reduce((sum: number, c: any) => sum + (Number(c.monthly_value) || 0), 0);
  const stageCount = (stage: string) => clients.filter((c: any) => c.pipeline_stage === stage).length;

  return (
    <AppLayout>
      <header className="flex h-14 items-center justify-between border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold">Command Center</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs"><Bell className="h-3.5 w-3.5" /> 3</Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs"><Search className="h-3.5 w-3.5" /> Cmd+K</Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-5 scrollbar-thin">
        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard label="Active Clients" value={activeClients || 7} icon={Users} trend={{ value: '+2 vs last month', positive: true }} />
          <KPICard label="Content Queue" value="23" icon={FileText} trend={{ value: '12 rendering', positive: true }} />
          <KPICard label="MRR" value={totalMRR > 0 ? `$${totalMRR.toLocaleString()}` : '$12,059'} icon={DollarSign} trend={{ value: '+$2,400', positive: true }} />
          <KPICard label="Leads This Week" value="14" icon={Radio} subtitle="9 inbound · 5 outbound" />
        </div>

        {/* Tasks + Calendar */}
        <div className="grid grid-cols-5 gap-4">
          {/* Today's Tasks */}
          <div className="col-span-3 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Today's Tasks</span>
              <Button variant="outline" size="sm" className="gap-1 text-xs h-7"><Plus className="h-3 w-3" /> Add</Button>
            </div>
            <div className="space-y-0">
              {mockTasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-border/50 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => navigate(`/${t.module.toLowerCase()}`)}>
                  <div className={cn(
                    'w-[18px] h-[18px] rounded border-2 flex items-center justify-center shrink-0',
                    t.done ? 'border-accent bg-accent' : 'border-border'
                  )}>
                    {t.done && <Check className="h-3 w-3 text-accent-foreground" />}
                  </div>
                  <span className={cn('flex-1 text-[13px]', t.done && 'line-through text-muted-foreground')}>{t.desc}</span>
                  <span className="text-xs text-muted-foreground">{t.client}</span>
                  <StatusBadge status={t.module.toLowerCase()} />
                  <span className={cn('text-xs', t.due === 'Today' ? 'text-warning' : 'text-muted-foreground')}>{t.due}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Content Calendar */}
          <div className="col-span-2 rounded-lg border border-border bg-card p-4">
            <span className="text-sm font-semibold block mb-3">Content Calendar — This Week</span>
            <div className="flex gap-0.5">
              {weekDays.map((d) => (
                <div key={d} className="flex-1 text-center">
                  <div className={cn('text-[10px] font-semibold uppercase mb-2', d === 'Mon' ? 'text-accent' : 'text-muted-foreground')}>{d}</div>
                  <div className="flex flex-col gap-1 items-center">
                    {(contentCalendar[d] || []).map((item, i) => (
                      <div key={i} className="w-full px-1 py-0.5 rounded bg-muted/40 text-[9px] text-muted-foreground text-center">
                        <span className={cn(
                          item.type === 'video' ? 'text-accent' : item.type === 'carousel' ? 'text-[hsl(210,80%,55%)]' : 'text-warning'
                        )}>
                          {item.type === 'video' ? '▶' : item.type === 'carousel' ? '◻' : '◉'}
                        </span>
                        {' '}{item.title}
                      </div>
                    ))}
                    {(!contentCalendar[d] || contentCalendar[d].length === 0) && (
                      <span className="text-[10px] text-muted-foreground/30">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pipeline + Revenue */}
        <div className="grid grid-cols-2 gap-4">
          {/* Pipeline Snapshot */}
          <div className="rounded-lg border border-border bg-card p-4 cursor-pointer" onClick={() => navigate('/pipeline')}>
            <span className="text-sm font-semibold block mb-3">Pipeline Snapshot</span>
            <div className="space-y-1.5">
              {stages.map((stage) => {
                const count = stageCount(stage.key) || (stage.key === 'leads' ? 2 : stage.key === 'audit' ? 1 : stage.key === 'strategy' ? 1 : stage.key === 'build' ? 2 : stage.key === 'produce' ? 2 : 2);
                return (
                  <div key={stage.key} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16 text-right">{stage.label}</span>
                    <div className="flex-1 h-6 bg-background rounded overflow-hidden">
                      <div
                        className="h-full bg-accent/20 rounded flex items-center pl-2 transition-all"
                        style={{ width: `${Math.max(count * 18, 8)}%` }}
                      >
                        <span className="text-xs font-semibold text-accent">{count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Goal */}
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="text-sm font-semibold block mb-3">Revenue Goal — April</span>
            <div className="flex justify-between mb-2">
              <span className="text-2xl font-bold">$16,280</span>
              <span className="text-sm text-muted-foreground">/ $25,000</span>
            </div>
            <div className="h-3 bg-background rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-accent to-accent/70 rounded-full" style={{ width: '65.1%' }} />
            </div>
            <span className="text-xs text-accent font-semibold">65.1% — $8,720 to go</span>
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={revenueTrend}>
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 12 }}
                    formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Activity */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold flex items-center gap-2"><Bot className="h-4 w-4" /> Recent AI Activity</span>
            <Button variant="outline" size="sm" className="gap-1 text-xs h-7" onClick={() => navigate('/ai')}>View All <ArrowRight className="h-3 w-3" /></Button>
          </div>
          {mockAILogs.map((l) => (
            <div key={l.id} className="flex items-center gap-3 py-2 border-b border-border/50">
              <StatusBadge status={l.status} />
              <span className="flex-1 text-[13px]">{l.action}</span>
              <StatusBadge status={l.module.toLowerCase()} />
              <span className="text-xs text-muted-foreground font-mono">{l.duration}</span>
              <span className="text-xs text-muted-foreground">{l.time}</span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
