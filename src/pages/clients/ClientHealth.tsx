import { AppLayout } from '@/components/layout/AppLayout';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useClientHealth } from '@/hooks/useClientHealth';
import { cn } from '@/lib/utils';
import {
  HeartPulse, AlertTriangle, TrendingUp, Users, Clock,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/* ---------- mock data shown when DB is empty ---------- */
const MOCK_SCORES = [
  { client: 'Sparkle Clean Pros', content: 85, engagement: 78, payment: 100, portal: 60, composite: 82.15, upsell: true, date: 'Apr 5, 2026' },
  { client: 'Green Valley Landscaping', content: 72, engagement: 65, payment: 90, portal: 55, composite: 71.85, upsell: false, date: 'Apr 4, 2026' },
  { client: 'CoolBreeze HVAC', content: 45, engagement: 38, payment: 70, portal: 20, composite: 44.6, upsell: false, date: 'Apr 5, 2026' },
  { client: 'Precision Plumbing', content: 90, engagement: 88, payment: 100, portal: 75, composite: 89.2, upsell: true, date: 'Apr 3, 2026' },
  { client: 'Atlas Roofing Co', content: 60, engagement: 52, payment: 50, portal: 35, composite: 50.5, upsell: false, date: 'Apr 2, 2026' },
  { client: 'Elite Auto Detail', content: 35, engagement: 30, payment: 40, portal: 15, composite: 31, upsell: false, date: 'Apr 1, 2026' },
];

function compositeColor(score: number) {
  if (score > 80) return 'text-success';
  if (score >= 50) return 'text-warning';
  return 'text-destructive';
}

function formatDate(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ClientHealth() {
  const { scores, loading } = useClientHealth();

  // Fetch client names for real data display
  const clientIds = scores.map(s => s.client_id).filter(Boolean);
  const { data: clientNames = {} } = useQuery({
    queryKey: ['client_names', clientIds],
    queryFn: async () => {
      if (clientIds.length === 0) return {};
      const { data } = await supabase
        .from('clients')
        .select('id, business_name')
        .in('id', clientIds);
      const map: Record<string, string> = {};
      (data ?? []).forEach(c => { map[c.id] = c.business_name ?? c.id.slice(0, 8); });
      return map;
    },
    enabled: clientIds.length > 0,
  });

  const hasRealData = scores.length > 0;

  /* Build display rows — use real data if available, otherwise mock */
  const rows = hasRealData
    ? scores.map((s) => ({
        client: clientNames[s.client_id] ?? s.client_id.slice(0, 8) + '...',
        content: s.content_performance,
        engagement: s.engagement_score,
        payment: s.payment_score,
        portal: s.portal_activity,
        composite: s.composite_score,
        upsell: s.upsell_triggered,
        date: formatDate(s.computed_at),
      }))
    : MOCK_SCORES;

  const avgScore = rows.length > 0
    ? Math.round(rows.reduce((a, r) => a + r.composite, 0) / rows.length)
    : 0;
  const atRisk = rows.filter((r) => r.composite < 50).length;
  const upsellReady = rows.filter((r) => r.upsell).length;

  return (
    <AppLayout>
      <header className="flex items-center justify-between h-14 border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <HeartPulse className="h-5 w-5 text-accent" />
          Client Health
        </h1>
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {hasRealData
            ? `Last computed ${formatDate(scores[0].computed_at)}`
            : 'Showing sample data'}
        </span>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-4 scrollbar-thin">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard label="Average Score" value={avgScore} icon={HeartPulse} />
          <KPICard label="At Risk (<50)" value={atRisk} icon={AlertTriangle} />
          <KPICard label="Upsell Ready" value={upsellReady} icon={TrendingUp} />
          <KPICard label="Total Clients" value={rows.length} icon={Users} />
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Loading health scores...</div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr_0.7fr_0.9fr_0.6fr_1fr] px-4 py-2.5 border-b border-border text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Client</span>
              <span>Content</span>
              <span>Engage</span>
              <span>Payment</span>
              <span>Portal</span>
              <span>Composite</span>
              <span>Upsell</span>
              <span>Last Computed</span>
            </div>
            {rows.map((row, i) => (
              <div
                key={i}
                className={cn(
                  'grid grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr_0.7fr_0.9fr_0.6fr_1fr] px-4 py-3 items-center text-[13px]',
                  i % 2 === 0 ? 'bg-card' : 'bg-background',
                )}
              >
                <span className="font-medium truncate">{row.client}</span>
                <span className="text-muted-foreground">{row.content}%</span>
                <span className="text-muted-foreground">{row.engagement}%</span>
                <span className="text-muted-foreground">{row.payment}%</span>
                <span className="text-muted-foreground">{row.portal}%</span>
                <span className={cn('font-bold', compositeColor(row.composite))}>
                  {row.composite}
                </span>
                <span>
                  {row.upsell && <StatusBadge status="active" className="text-[9px]" />}
                </span>
                <span className="text-xs text-muted-foreground">{row.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
