import { AppLayout } from '@/components/layout/AppLayout';
import { EmptyState } from '@/components/shared/EmptyState';
import { Bot } from 'lucide-react';

export default function AICommand() {
  return (
    <AppLayout>
      <header className="flex h-14 items-center border-b border-border px-6 shrink-0">
        <h1 className="text-base font-bold uppercase tracking-wider font-mono">AI Command Center</h1>
      </header>
      <div className="flex-1 overflow-auto p-6">
        <EmptyState icon={Bot} title="AI Command Center coming soon" description="Quick dispatch, console, activity log, and integrations." />
      </div>
    </AppLayout>
  );
}
