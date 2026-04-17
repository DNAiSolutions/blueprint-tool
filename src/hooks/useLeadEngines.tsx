import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type LeadEngineSubmission = Database['public']['Tables']['lead_engine_submissions']['Row'];
type LeadEngineRun = Database['public']['Tables']['lead_engine_runs']['Row'];
type LeadEngineOnboarding = Database['public']['Tables']['lead_engine_onboarding']['Row'];

export interface LeadEngineRecord extends LeadEngineSubmission {
  run: LeadEngineRun | null;
  onboarding: LeadEngineOnboarding | null;
}

export function useLeadEngines() {
  return useQuery({
    queryKey: ['lead_engines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_engine_submissions')
        .select('*, lead_engine_runs(*), lead_engine_onboarding(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return ((data ?? []) as any[]).map((row) => ({
        ...row,
        run: row.lead_engine_runs?.[0] ?? null,
        onboarding: row.lead_engine_onboarding?.[0] ?? null,
      })) as LeadEngineRecord[];
    },
  });
}

export function useLeadEngine(id?: string) {
  return useQuery({
    queryKey: ['lead_engine', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_engine_submissions')
        .select('*, lead_engine_runs(*), lead_engine_onboarding(*)')
        .eq('id', id)
        .single();

      if (error) throw error;

      const row = data as any;
      return {
        ...row,
        run: row.lead_engine_runs?.[0] ?? null,
        onboarding: row.lead_engine_onboarding?.[0] ?? null,
      } as LeadEngineRecord;
    },
  });
}
