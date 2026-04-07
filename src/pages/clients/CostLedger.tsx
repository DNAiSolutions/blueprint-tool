import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KPICard } from '@/components/shared/KPICard';
import { useCostLedger } from '@/hooks/useCostLedger';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DollarSign, BarChart3, Cpu, TrendingUp, Clock,
} from 'lucide-react';

type DateRange = 'month' | '30d' | 'all';

function dateFromRange(range: DateRange): string | undefined {
  if (range === 'all') return undefined;
  const now = new Date();
  if (range === 'month') {
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }
  const d = new Date(now);
  d.setDate(d.getDate() - 30);
  return d.toISOString();
}

/* ---------- mock data ---------- */
interface MockClientCost {
  client: string;
  costs: Record<string, number>;
  revenue: number;
}

const MOCK_CLIENTS: MockClientCost[] = [
  { client: 'Sparkle Clean Pros', costs: { Claude: 32, HeyGen: 18, OpenArt: 6, Vercel: 1.5 }, revenue: 1297 },
  { client: 'Green Valley Landscaping', costs: { Claude: 28, HeyGen: 12, OpenArt: 4, Vercel: 0.8 }, revenue: 997 },
  { client: 'CoolBreeze HVAC', costs: { Claude: 40, HeyGen: 20, OpenArt: 8, Vercel: 2 }, revenue: 1797 },
  { client: 'Precision Plumbing', costs: { Claude: 22, HeyGen: 10, OpenArt: 3, Vercel: 0.5 }, revenue: 997 },
  { client: 'Atlas Roofing Co', costs: { Claude: 15, HeyGen: 8, OpenArt: 5, Vercel: 1 }, revenue: 797 },
];

function buildMockSummary() {
  const providerTotals: Record<string, number> = {};
  const clientRows = MOCK_CLIENTS.map((c) => {
    let total = 0;
    let topProvider = '';
    let topAmount = 0;
    let apiCalls = 0;
    for (const [p, v] of Object.entries(c.costs)) {
      total += v;
      providerTotals[p] = (providerTotals[p] || 0) + v;
      apiCalls += Math.round(v * 3.2);
      if (v > topAmount) { topAmount = v; topProvider = p; }
    }
    const margin = c.revenue - total;
    const marginPct = Math.round((margin / c.revenue) * 100);
    return { client: c.client, totalCost: total, revenue: c.revenue, margin, marginPct, topProvider, apiCalls };
  });
  const totalSpend = clientRows.reduce((a, r) => a + r.totalCost, 0);
  const totalRevenue = clientRows.reduce((a, r) => a + r.revenue, 0);
  const costPerClient = Math.round(totalSpend / clientRows.length * 100) / 100;
  const topProviderEntry = Object.entries(providerTotals).sort((a, b) => b[1] - a[1])[0];
  return { providerTotals, clientRows, totalSpend, totalRevenue, costPerClient, topProvider: topProviderEntry?.[0] ?? '--', totalMargin: totalRevenue - totalSpend };
}

const PROVIDER_COLORS: Record<string, string> = {
  Claude: 'bg-accent',
  HeyGen: 'bg-[hsl(270,60%,60%)]',
  OpenArt: 'bg-warning',
  Vercel: 'bg-success',
  GHL: 'bg-[hsl(210,80%,55%)]',
};

export default function CostLedger() {
  const [range, setRange] = useState<DateRange>('month');
  const dateFrom = dateFromRange(range);
  const { entries, loading, stats } = useCostLedger({ dateFrom: dateFrom ?? undefined });

  const hasRealData = entries.length > 0;
  const mock = buildMockSummary();

  const totalSpend = hasRealData ? stats.totalCost : mock.totalSpend;
  const costPerClient = hasRealData
    ? Object.keys(stats.costByClient).length > 0
      ? Math.round((stats.totalCost / Object.keys(stats.costByClient).length) * 100) / 100
      : 0
    : mock.costPerClient;
  const topProvider = hasRealData
    ? Object.entries(stats.costByProvider).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '--'
    : mock.topProvider;
  const totalMargin = hasRealData ? 0 : mock.totalMargin;

  const providerData = hasRealData ? stats.costByProvider : mock.providerTotals;
  const maxProviderCost = Math.max(...Object.values(providerData), 1);

  const clientRows = hasRealData
    ? Object.entries(stats.costByClient).map(([cid, cost]) => ({
        client: cid.slice(0, 12) + '...',
        totalCost: cost,
        revenue: 0,
        margin: 0,
        marginPct: 0,
        topProvider: '--',
        apiCalls: 0,
      }))
    : mock.clientRows;

  return (
    <AppLayout>
      <header className="flex items-center justify-between h-14 border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-accent" />
          Cost Ledger
        </h1>
        <div className="flex gap-1.5">
          {(['month', '30d', 'all'] as DateRange[]).map((r) => (
            <Button
              key={r}
              variant={range === r ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setRange(r)}
            >
              {r === 'month' ? 'This Month' : r === '30d' ? 'Last 30 Days' : 'All Time'}
            </Button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-4 scrollbar-thin">
        {!hasRealData && (
          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mb-1">
            <Clock className="h-3 w-3" /> Showing sample data
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard label="Total Spend" value={`$${totalSpend.toFixed(2)}`} icon={DollarSign} />
          <KPICard label="Cost / Client" value={`$${costPerClient.toFixed(2)}`} icon={BarChart3} />
          <KPICard label="Top Provider" value={topProvider} icon={Cpu} />
          <KPICard label="Margin" value={`$${totalMargin.toFixed(2)}`} icon={TrendingUp} />
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Loading cost data...</div>
        ) : (
          <>
            {/* By Provider */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">Cost by Provider</h3>
              <div className="space-y-2.5">
                {Object.entries(providerData)
                  .sort((a, b) => b[1] - a[1])
                  .map(([prov, cost]) => {
                    const pct = Math.round((cost / maxProviderCost) * 100);
                    const color = PROVIDER_COLORS[prov] ?? 'bg-muted-foreground';
                    return (
                      <div key={prov} className="flex items-center gap-3">
                        <span className="text-xs font-mono w-16 text-muted-foreground">{prov}</span>
                        <div className="flex-1 h-5 rounded bg-muted/40 overflow-hidden">
                          <div className={cn('h-full rounded', color)} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-semibold w-16 text-right">${cost.toFixed(2)}</span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* By Client */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.6fr_0.8fr_0.6fr] px-4 py-2.5 border-b border-border text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                <span>Client</span>
                <span>Total Cost</span>
                <span>Revenue</span>
                <span>Margin</span>
                <span>Margin %</span>
                <span>Top Provider</span>
                <span># Calls</span>
              </div>
              {clientRows.map((row, i) => (
                <div
                  key={i}
                  className={cn(
                    'grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.6fr_0.8fr_0.6fr] px-4 py-3 items-center text-[13px]',
                    i % 2 === 0 ? 'bg-card' : 'bg-background',
                  )}
                >
                  <span className="font-medium truncate">{row.client}</span>
                  <span className="text-destructive font-semibold">${row.totalCost.toFixed(2)}</span>
                  <span className="text-success font-semibold">${row.revenue.toFixed(2)}</span>
                  <span className={cn('font-semibold', row.margin >= 0 ? 'text-success' : 'text-destructive')}>
                    ${row.margin.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">{row.marginPct}%</span>
                  <span className="text-xs text-accent font-mono">{row.topProvider}</span>
                  <span className="text-xs text-muted-foreground">{row.apiCalls}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
