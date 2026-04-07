import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { RefreshCw, Link, Wifi, Brain, Palette, Target, Globe, CreditCard } from 'lucide-react';
import { integrations, type IntegrationCategory } from './mockData';

const categoryConfig: Record<IntegrationCategory, { label: string; icon: typeof Brain }> = {
  ai: { label: 'AI & Agents', icon: Brain },
  content: { label: 'Content & Media', icon: Palette },
  sales: { label: 'Sales & Prospecting', icon: Target },
  crm: { label: 'CRM & Communication', icon: Wifi },
  deploy: { label: 'Deploy & Hosting', icon: Globe },
  payments: { label: 'Payments', icon: CreditCard },
};

export function ConnectionsTab() {
  const grouped: Record<string, typeof integrations> = {};
  integrations.forEach(int => {
    if (!grouped[int.category]) grouped[int.category] = [];
    grouped[int.category].push(int);
  });

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const errorCount = integrations.filter(i => i.status === 'error').length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-[hsl(var(--ghost-border)/0.15)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="ai-label">Connections</div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 text-success">
              <Wifi className="h-3 w-3" /> {connectedCount} connected
            </span>
            {errorCount > 0 && (
              <span className="flex items-center gap-1 text-destructive">
                {errorCount} error{errorCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
          <RefreshCw className="h-3 w-3" /> Test All
        </Button>
      </div>

      {/* Integration Groups */}
      <div className="flex-1 overflow-auto scrollbar-thin p-4 space-y-5">
        {(Object.entries(categoryConfig) as [IntegrationCategory, typeof categoryConfig[IntegrationCategory]][]).map(([key, config]) => {
          const items = grouped[key];
          if (!items?.length) return null;
          const CatIcon = config.icon;

          return (
            <div key={key}>
              <div className="flex items-center gap-2 mb-2">
                <CatIcon className="h-3.5 w-3.5 text-accent/60" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{config.label}</span>
                <div className="flex-1 h-px bg-[hsl(var(--ghost-border)/0.1)]" />
              </div>
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
                {items.map(int => (
                  <div
                    key={int.id}
                    className={cn(
                      'rounded-lg bg-[hsl(var(--surface-low))] border p-3 transition-all hover:border-[hsl(var(--ghost-border)/0.25)]',
                      int.status === 'error' ? 'border-destructive/20' : 'border-[hsl(var(--ghost-border)/0.1)]',
                      int.status === 'disconnected' && 'opacity-50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{int.name}</span>
                      </div>
                      <div className={cn(
                        'h-2 w-2 rounded-full',
                        int.status === 'connected' ? 'bg-success' : int.status === 'error' ? 'bg-destructive animate-pulse' : 'bg-muted-foreground/30'
                      )} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-2">{int.description}</p>
                    <div className="flex items-center justify-between">
                      <StatusBadge status={int.status} />
                      <div className="flex gap-1">
                        {int.status !== 'disconnected' && (
                          <span className="text-[10px] font-mono text-muted-foreground/40">{int.lastPing}</span>
                        )}
                        {int.status === 'connected' && (
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                            <RefreshCw className="h-2.5 w-2.5 text-muted-foreground/50" />
                          </Button>
                        )}
                        {int.status === 'disconnected' && (
                          <Button variant="outline" size="sm" className="gap-1 text-[10px] h-5 px-2">
                            <Link className="h-2.5 w-2.5" /> Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
