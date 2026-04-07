import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { useClientContext } from '@/hooks/useClientContext';
import { cn } from '@/lib/utils';
import { Zap, Plus, Play, Pause, RefreshCw, Settings, FileText } from 'lucide-react';

const mockAutomations = [
  { id: 'au1', name: 'New Lead Nurture Sequence', client: 'DigitalDNA', isInternal: true, type: 'GHL Workflow', status: 'active', triggers: "New contact tag: 'inbound-lead'", lastRun: '2 hrs ago' },
  { id: 'au2', name: 'Blueprint Call Reminder', client: 'DigitalDNA', isInternal: true, type: 'GHL Workflow', status: 'active', triggers: 'Appointment booked', lastRun: '5 hrs ago' },
  { id: 'au3', name: 'Missed Call Text-Back', client: 'Acme Pressure Washing', isInternal: false, type: 'GHL Workflow', status: 'active', triggers: 'Missed call detected', lastRun: '1 hr ago' },
  { id: 'au4', name: 'Review Request (After Service)', client: 'Acme Pressure Washing', isInternal: false, type: 'GHL Workflow', status: 'active', triggers: 'Invoice paid', lastRun: '3 hrs ago' },
  { id: 'au5', name: 'Missed Call Text-Back', client: 'Bayou Landscaping', isInternal: false, type: 'GHL Workflow', status: 'active', triggers: 'Missed call detected', lastRun: '6 hrs ago' },
  { id: 'au6', name: 'Appointment Reminder', client: 'Delta Pool Services', isInternal: false, type: 'GHL Workflow', status: 'paused', triggers: 'Appointment 24h before', lastRun: '2 days ago' },
  { id: 'au7', name: 'Monthly Content Report Email', client: 'DigitalDNA', isInternal: true, type: 'GHL Workflow', status: 'active', triggers: '1st of month', lastRun: 'Apr 1' },
  { id: 'au8', name: 'Review Request (After Service)', client: 'Magnolia Concrete', isInternal: false, type: 'GHL Workflow', status: 'active', triggers: 'Invoice paid', lastRun: '12 hrs ago' },
];

export default function Automations() {
  const [subTab, setSubTab] = useState('workflows');
  const tabs = ['workflows', 'triggers', 'logs', 'templates'];
  const { selectedClient } = useClientContext();

  const filtered = mockAutomations.filter(a => {
    if (!selectedClient) return true;
    if (selectedClient.is_internal) return a.isInternal;
    return a.client === selectedClient.business_name;
  });

  const showClientCol = !selectedClient;
  const activeCount = filtered.filter(a => a.status === 'active').length;
  const pausedCount = filtered.filter(a => a.status === 'paused').length;

  return (
    <AppLayout>
      <header className="flex h-14 items-center justify-between border-b border-border px-6 shrink-0">
        <h1 className="text-lg font-bold">Automations</h1>
        <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> New Workflow</Button>
      </header>

      <div className="flex border-b border-border px-6 shrink-0">
        {tabs.map(t => (
          <button key={t} onClick={() => setSubTab(t)} className={cn(
            'px-4 py-2.5 text-[13px] font-medium capitalize border-b-2 transition-colors',
            subTab === t ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
          )}>{t}</button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-6 scrollbar-thin">
        {subTab === 'workflows' && (
          <>
            {/* Stats */}
            <div className="flex gap-4 mb-5">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card">
                <Play className="h-3.5 w-3.5 text-success" />
                <span className="text-sm font-semibold">{activeCount}</span>
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card">
                <Pause className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-semibold">{pausedCount}</span>
                <span className="text-xs text-muted-foreground">Paused</span>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className={cn('grid px-4 py-2.5 border-b border-border text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider', showClientCol ? 'grid-cols-[2fr_1fr_1fr_2fr_100px_100px]' : 'grid-cols-[2fr_1fr_2fr_100px_100px]')}>
                <span>Workflow</span>{showClientCol && <span>Client</span>}<span>Type</span><span>Trigger</span><span>Status</span><span>Last Run</span>
              </div>
              {filtered.map((a, i) => (
                <div key={a.id} className={cn('grid px-4 py-3 items-center text-[13px] cursor-pointer hover:bg-muted/30 transition-colors', showClientCol ? 'grid-cols-[2fr_1fr_1fr_2fr_100px_100px]' : 'grid-cols-[2fr_1fr_2fr_100px_100px]', i % 2 === 0 ? 'bg-card' : 'bg-background')}>
                  <span className="font-medium flex items-center gap-2">
                    <Zap className={cn('h-3.5 w-3.5', a.status === 'active' ? 'text-primary' : 'text-muted-foreground')} />
                    {a.name}
                  </span>
                  {showClientCol && (
                    <span className={cn('text-xs', a.isInternal ? 'text-primary font-medium' : 'text-muted-foreground')}>
                      {a.client}
                    </span>
                  )}
                  <span className="text-muted-foreground">{a.type}</span>
                  <span className="text-xs text-muted-foreground">{a.triggers}</span>
                  <StatusBadge status={a.status} />
                  <span className="text-xs text-muted-foreground">{a.lastRun}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {subTab !== 'workflows' && (
          <EmptyState
            icon={subTab === 'triggers' ? Zap : subTab === 'logs' ? RefreshCw : FileText}
            title={`${subTab.charAt(0).toUpperCase() + subTab.slice(1)} view`}
            actionLabel={`Open ${subTab.charAt(0).toUpperCase() + subTab.slice(1)}`}
            onAction={() => {}}
          />
        )}
      </div>
    </AppLayout>
  );
}
