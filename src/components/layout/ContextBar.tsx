import { useState, useRef, useEffect } from 'react';
import { useClientContext } from '@/hooks/useClientContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';
import { ChevronDown, Globe, Building2, X } from 'lucide-react';

export function ContextBar() {
  const { selectedClientId, setSelectedClientId, internalClient, externalClients, clients, selectedClient, isLoading } = useClientContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (isLoading) return null;

  const isInternal = selectedClient?.is_internal;
  const label = !selectedClientId ? 'All — Agency + Clients' : selectedClient?.business_name || 'All';

  return (
    <div ref={ref} className="relative z-50 flex items-center gap-3 h-11 px-6 bg-card border-b border-white/[0.04] shrink-0">
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em]">Context</span>

      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium min-w-[220px] transition-colors',
          isInternal ? 'bg-primary/[0.08] border border-primary/20' : 'bg-background/50 border border-white/[0.06]'
        )}
      >
        <div className={cn(
          'w-2 h-2 rounded-full shrink-0',
          !selectedClientId ? 'bg-[hsl(210,80%,55%)]' : isInternal ? 'bg-primary' : 'bg-warning'
        )} />
        <span className="flex-1 text-left text-foreground">{label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {/* Context message */}
      {selectedClientId && (
        <button onClick={() => setSelectedClientId(null)} className="text-xs text-muted-foreground hover:text-foreground underline transition-colors">
          Clear filter
        </button>
      )}
      <span className={cn('text-xs', !selectedClientId ? 'text-muted-foreground' : isInternal ? 'text-primary' : 'text-warning')}>
        {!selectedClientId && 'Showing everything — internal + all clients'}
        {isInternal && 'Viewing DigitalDNA internal operations'}
        {selectedClientId && !isInternal && `Viewing ${selectedClient?.business_name} only`}
      </span>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-[72px] mt-1 w-[320px] bg-card border border-white/[0.06] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] max-h-[400px] overflow-auto z-[999]">
          {/* All option */}
          <button
            onClick={() => { setSelectedClientId(null); setOpen(false); }}
            className={cn('w-full flex items-center gap-3 px-4 py-3 text-[13px] border-b border-white/[0.04] transition-colors', !selectedClientId ? 'bg-muted/30' : 'hover:bg-muted/20')}
          >
            <div className="w-2 h-2 rounded-full bg-[hsl(210,80%,55%)]" />
            <span className="font-semibold text-foreground">All — Agency + Clients</span>
          </button>

          {/* Internal section */}
          {internalClient && (
            <>
              <div className="px-4 pt-2.5 pb-1 text-[10px] font-bold text-primary uppercase tracking-[0.1em]">Internal</div>
              <button
                onClick={() => { setSelectedClientId(internalClient.id); setOpen(false); }}
                className={cn('w-full flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.04] transition-colors', selectedClientId === internalClient.id ? 'bg-muted/30' : 'hover:bg-muted/20')}
              >
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-[hsl(210,80%,55%)] flex items-center justify-center text-[11px] font-bold text-white shrink-0">D</div>
                <div className="text-left">
                  <div className="text-[13px] font-semibold text-foreground">DigitalDNA</div>
                  <div className="text-[11px] text-muted-foreground">Your agency content, site, automations</div>
                </div>
              </button>
            </>
          )}

          {/* Clients section */}
          {externalClients.length > 0 && (
            <>
              <div className="px-4 pt-2.5 pb-1 text-[10px] font-bold text-warning uppercase tracking-[0.1em]">Clients</div>
              {externalClients.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedClientId(c.id); setOpen(false); }}
                  className={cn('w-full flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.04] transition-colors', selectedClientId === c.id ? 'bg-muted/30' : 'hover:bg-muted/20')}
                >
                  <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-[11px] font-semibold text-muted-foreground shrink-0">
                    {c.business_name[0]}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-foreground truncate">{c.business_name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {(c as any).industry || ''}{(c as any).industry && (c as any).location ? ' · ' : ''}{(c as any).location || ''}
                    </div>
                  </div>
                  {(c as any).pipeline_stage && <StatusBadge status={(c as any).pipeline_stage} />}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
