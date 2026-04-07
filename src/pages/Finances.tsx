import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, Upload, DollarSign, Receipt, FileText, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell,
} from 'recharts';

const mockTransactions = [
  { id: 'tr1', date: 'Apr 5', desc: 'Acme Pressure Washing — Monthly', amount: 1356, category: 'Revenue', type: 'income', client: 'Acme PW' },
  { id: 'tr2', date: 'Apr 5', desc: 'Delta Pool Services — Monthly', amount: 1200, category: 'Revenue', type: 'income', client: 'Delta Pool' },
  { id: 'tr3', date: 'Apr 4', desc: 'HeyGen Pro Subscription', amount: -59, category: 'Software', type: 'expense', client: null },
  { id: 'tr4', date: 'Apr 4', desc: 'Magnolia Concrete — Monthly', amount: 1453, category: 'Revenue', type: 'income', client: 'Magnolia' },
  { id: 'tr5', date: 'Apr 3', desc: 'Eleven Labs Creator Plan', amount: -22, category: 'Software', type: 'expense', client: null },
  { id: 'tr6', date: 'Apr 3', desc: 'Apollo.io Pro', amount: -99, category: 'Software', type: 'expense', client: null },
  { id: 'tr7', date: 'Apr 2', desc: 'Tidewater Lawn Care — Monthly', amount: 2347, category: 'Revenue', type: 'income', client: 'Tidewater' },
];

const revenueByService = [
  { name: 'AI Content', value: 8400, color: 'hsl(var(--accent))' },
  { name: 'Websites', value: 3880, color: 'hsl(210,80%,55%)' },
  { name: 'Automations', value: 2800, color: 'hsl(var(--warning))' },
  { name: 'One-time', value: 1200, color: 'hsl(var(--success))' },
];

const revenueTrend = [
  { month: 'Nov', revenue: 4200 }, { month: 'Dec', revenue: 6800 },
  { month: 'Jan', revenue: 9100 }, { month: 'Feb', revenue: 11400 },
  { month: 'Mar', revenue: 14200 }, { month: 'Apr', revenue: 16280 },
];

const totalRevenue = mockTransactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
const totalExpenses = Math.abs(mockTransactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0));

export default function Finances() {
  const [subTab, setSubTab] = useState('overview');
  const tabs = ['overview', 'revenue', 'expenses', 'bank', 'invoices', 'reports'];

  return (
    <AppLayout>
      <header className="flex h-14 items-center justify-between border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold">Finances</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1 text-xs"><Upload className="h-3 w-3" /> Upload Statement</Button>
          <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Create Invoice</Button>
        </div>
      </header>

      <div className="flex border-b border-border px-6 shrink-0">
        {tabs.map(t => (
          <button key={t} onClick={() => setSubTab(t)} className={cn(
            'px-4 py-2.5 text-[13px] font-medium capitalize border-b-2 transition-colors',
            subTab === t ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
          )}>{t}</button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-5 scrollbar-thin">
        {subTab === 'overview' && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-4 gap-4">
              <KPICard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} trend={{ value: '+18% vs March', positive: true }} />
              <KPICard label="Total Expenses" value={`$${totalExpenses.toLocaleString()}`} icon={Receipt} trend={{ value: '-4% vs March', positive: false }} />
              <KPICard label="Net Profit" value={`$${(totalRevenue - totalExpenses).toLocaleString()}`} icon={DollarSign} trend={{ value: '+22%', positive: true }} />
              <KPICard label="MRR" value="$12,059" icon={DollarSign} trend={{ value: '+$2,400 growth', positive: true }} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <span className="text-sm font-semibold block mb-3">Revenue by Service</span>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={revenueByService} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={100} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 12 }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {revenueByService.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <span className="text-sm font-semibold block mb-3">Revenue Trend</span>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={revenueTrend}>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 12 }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--accent))' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Transactions */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border text-sm font-semibold">Recent Transactions</div>
              {mockTransactions.map((t, i) => (
                <div key={t.id} className={cn('grid grid-cols-[80px_2fr_1fr_1fr_80px] px-4 py-2.5 items-center text-[13px]', i % 2 === 0 ? 'bg-card' : 'bg-background')}>
                  <span className="text-xs text-muted-foreground">{t.date}</span>
                  <span>{t.desc}</span>
                  <span className={cn('font-semibold', t.type === 'income' ? 'text-success' : 'text-destructive')}>
                    {t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">{t.category}</span>
                  <StatusBadge status={t.type === 'income' ? 'success' : 'error'} />
                </div>
              ))}
            </div>
          </>
        )}

        {subTab !== 'overview' && (
          <EmptyState
            icon={subTab === 'revenue' ? DollarSign : subTab === 'expenses' ? Receipt : subTab === 'bank' ? Upload : subTab === 'invoices' ? FileText : BarChart3}
            title={`${subTab.charAt(0).toUpperCase() + subTab.slice(1)} view`}
            actionLabel={`Open ${subTab.charAt(0).toUpperCase() + subTab.slice(1)}`}
            onAction={() => {}}
          />
        )}
      </div>
    </AppLayout>
  );
}
