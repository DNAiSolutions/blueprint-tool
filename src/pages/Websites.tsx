import { AppLayout } from '@/components/layout/AppLayout';
import { EmptyState } from '@/components/shared/EmptyState';
import { Globe } from 'lucide-react';

export default function Websites() {
  return (
    <AppLayout>
      <header className="flex h-14 items-center border-b border-border px-6 shrink-0">
        <h1 className="text-base font-bold uppercase tracking-wider font-mono">Websites</h1>
      </header>
      <div className="flex-1 overflow-auto p-6">
        <EmptyState icon={Globe} title="Website Builder coming soon" description="Build, manage, and deploy client websites from here." />
      </div>
    </AppLayout>
  );
}
