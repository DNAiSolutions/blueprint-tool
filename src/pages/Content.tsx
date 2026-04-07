import { AppLayout } from '@/components/layout/AppLayout';
import { EmptyState } from '@/components/shared/EmptyState';
import { Film } from 'lucide-react';

export default function Content() {
  return (
    <AppLayout>
      <header className="flex h-14 items-center border-b border-border px-6 shrink-0">
        <h1 className="text-base font-bold uppercase tracking-wider font-mono">Content Studio</h1>
      </header>
      <div className="flex-1 overflow-auto p-6">
        <EmptyState
          icon={Film}
          title="Content Studio coming soon"
          description="Calendar, script editor, production queue, and publishing tools will live here."
        />
      </div>
    </AppLayout>
  );
}
