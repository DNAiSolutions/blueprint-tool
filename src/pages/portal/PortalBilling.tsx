import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { KPICard } from '@/components/shared/KPICard';
import { useAuth } from '@/hooks/useAuth';
import { useCostLedger } from '@/hooks/useCostLedger';
import { CreditCard, Receipt, Calendar, CheckCircle2 } from 'lucide-react';

const mockInvoices = [
  { id: '1', number: 'INV-001', amount: '$1,297.00', date: 'Apr 1, 2026', status: 'paid' },
  { id: '2', number: 'INV-002', amount: '$1,297.00', date: 'Mar 1, 2026', status: 'paid' },
  { id: '3', number: 'INV-003', amount: '$1,297.00', date: 'Feb 1, 2026', status: 'paid' },
];

export default function PortalBilling() {
  const { clientRecord, isAdmin } = useAuth();
  const { stats } = useCostLedger(
    clientRecord?.id ? { clientId: clientRecord.id } : {},
  );

  const packageTier = clientRecord?.package_tier ?? 'Growth';
  const hasRealCosts = isAdmin && stats.totalCost > 0;
  const costDisplay = hasRealCosts ? `$${stats.totalCost.toFixed(2)}` : '$1,297.00';

  return (
    <AppLayout>
      <header className="flex items-center h-14 border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold">Billing</h1>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-4 scrollbar-thin">
        <div className="grid grid-cols-3 gap-4">
          <KPICard label="Current Package" value={packageTier} subtitle={`${costDisplay}/mo`} icon={CreditCard} />
          <KPICard label="Next Payment" value="May 1" subtitle={costDisplay} icon={Calendar} />
          <KPICard label="Payment Status" value="Current" subtitle="All invoices paid" icon={CheckCircle2} />
        </div>

        <div className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Receipt className="h-4 w-4 text-accent" /> Invoice History
            </h3>
          </div>
          {mockInvoices.map((inv) => (
            <div key={inv.id} className="flex items-center gap-4 px-4 py-3 border-b border-border/30 last:border-0">
              <span className="text-xs font-mono text-muted-foreground w-20">{inv.number}</span>
              <span className="text-xs flex-1">{inv.date}</span>
              <span className="text-sm font-semibold">{inv.amount}</span>
              <StatusBadge status={inv.status} />
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
