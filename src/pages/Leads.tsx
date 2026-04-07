import { AppLayout } from '@/components/layout/AppLayout';
import { EmptyState } from '@/components/shared/EmptyState';
import { Radio } from 'lucide-react';

export default function Leads() {
  return (
    <AppLayout>
      <header className="flex h-14 items-center border-b border-border px-6 shrink-0">
        <h1 className="text-base font-bold uppercase tracking-wider font-mono">Leads & Outreach</h1>
      </header>
      <div className="flex-1 overflow-auto p-6">
        <EmptyState icon={Radio} title="Lead Intelligence coming soon" description="Inbound signals, outbound discovery, sequences, and scoring." />
      </div>
    </AppLayout>
  );
}
