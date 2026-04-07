import { AppLayout } from '@/components/layout/AppLayout';
import { EmptyState } from '@/components/shared/EmptyState';
import { DollarSign } from 'lucide-react';

export default function Finances() {
  return (
    <AppLayout>
      <header className="flex h-14 items-center border-b border-border px-6 shrink-0">
        <h1 className="text-base font-bold uppercase tracking-wider font-mono">Finances</h1>
      </header>
      <div className="flex-1 overflow-auto p-6">
        <EmptyState icon={DollarSign} title="Finance module coming soon" description="Revenue tracking, expenses, invoices, and P&L reports." />
      </div>
    </AppLayout>
  );
}
