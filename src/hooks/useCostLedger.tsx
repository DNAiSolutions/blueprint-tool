import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type CostEntry = Database['public']['Tables']['cost_ledger']['Row'];
type CostEntryInsert = Database['public']['Tables']['cost_ledger']['Insert'];

interface UseCostLedgerOptions {
  clientId?: string;
  provider?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface CostStats {
  totalCost: number;
  costByProvider: Record<string, number>;
  costByClient: Record<string, number>;
  costThisMonth: number;
  totalEntries: number;
}

export function useCostLedger(options: UseCostLedgerOptions = {}) {
  const { clientId, provider, dateFrom, dateTo } = options;
  const queryClient = useQueryClient();
  const queryKey = ['cost_ledger', clientId, provider, dateFrom, dateTo];

  const { data: entries = [], isLoading: loading } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('cost_ledger')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientId) query = query.eq('client_id', clientId);
      if (provider) query = query.eq('provider', provider);
      if (dateFrom) query = query.gte('created_at', dateFrom);
      if (dateTo) query = query.lte('created_at', dateTo);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as CostEntry[];
    },
  });

  const stats: CostStats = (() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const costByProvider: Record<string, number> = {};
    const costByClient: Record<string, number> = {};
    let totalCost = 0;
    let costThisMonth = 0;

    for (const e of entries) {
      totalCost += Number(e.cost_usd);
      const pKey = e.provider || 'unknown';
      costByProvider[pKey] = (costByProvider[pKey] || 0) + Number(e.cost_usd);
      const cKey = e.client_id || 'unassigned';
      costByClient[cKey] = (costByClient[cKey] || 0) + Number(e.cost_usd);
      if (e.created_at >= monthStart) {
        costThisMonth += Number(e.cost_usd);
      }
    }

    return { totalCost, costByProvider, costByClient, costThisMonth, totalEntries: entries.length };
  })();

  const logCost = useMutation({
    mutationFn: async (entry: CostEntryInsert) => {
      const { data, error } = await supabase
        .from('cost_ledger')
        .insert(entry)
        .select()
        .single();
      if (error) throw error;
      return data as CostEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost_ledger'] });
    },
  });

  return { entries, loading, logCost, stats };
}
