import { useClientContext } from '@/hooks/useClientContext';
import { cn } from '@/lib/utils';
import { Building2, Globe, ChevronDown } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator,
} from '@/components/ui/select';

export function ContextBar() {
  const { selectedClientId, setSelectedClientId, internalClient, externalClients, isLoading } = useClientContext();

  if (isLoading) return null;

  return (
    <div className="flex h-10 items-center gap-3 border-b border-white/[0.04] bg-[hsl(var(--card))] px-6 shrink-0">
      <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Context</span>
      <Select
        value={selectedClientId || '__all__'}
        onValueChange={(v) => setSelectedClientId(v === '__all__' ? null : v)}
      >
        <SelectTrigger className="h-7 w-[240px] text-xs bg-background/50 border-white/[0.06]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">
            <span className="flex items-center gap-2">
              <Globe className="h-3 w-3 text-muted-foreground" />
              All Clients
            </span>
          </SelectItem>

          {internalClient && (
            <>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel className="text-[10px]">Internal</SelectLabel>
                <SelectItem value={internalClient.id}>
                  <span className="flex items-center gap-2">
                    <Building2 className="h-3 w-3 text-accent" />
                    {internalClient.business_name}
                  </span>
                </SelectItem>
              </SelectGroup>
            </>
          )}

          {externalClients.length > 0 && (
            <>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel className="text-[10px]">Clients</SelectLabel>
                {externalClients.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.business_name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </>
          )}
        </SelectContent>
      </Select>

      {selectedClientId && (
        <button
          onClick={() => setSelectedClientId(null)}
          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
