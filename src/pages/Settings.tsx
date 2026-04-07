import { AppLayout } from '@/components/layout/AppLayout';
import { EmptyState } from '@/components/shared/EmptyState';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <AppLayout>
      <header className="flex h-14 items-center border-b border-border px-6 shrink-0">
        <h1 className="text-base font-bold uppercase tracking-wider font-mono">Settings</h1>
      </header>
      <div className="flex-1 overflow-auto p-6">
        <EmptyState icon={SettingsIcon} title="Settings coming soon" description="Integrations, brand settings, and account management." />
      </div>
    </AppLayout>
  );
}
