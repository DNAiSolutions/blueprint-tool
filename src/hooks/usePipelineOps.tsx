import { useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type PipelineOpportunity = Database['public']['Tables']['pipeline_opportunities']['Row'];
type PipelineInsert = Database['public']['Tables']['pipeline_opportunities']['Insert'];
type PipelineType = 'new_leads' | 'sales' | 'onboarding';

export const PIPELINE_STAGES: Record<PipelineType, { key: string; label: string; color: string }[]> = {
  new_leads: [
    { key: 'new_lead', label: 'New Lead', color: 'hsl(var(--muted-foreground))' },
    { key: 'website', label: 'Website', color: 'hsl(210,80%,55%)' },
    { key: 'content_trial', label: 'Content Trial', color: 'hsl(var(--accent))' },
    { key: 'trial_over', label: 'Trial Over', color: 'hsl(var(--warning))' },
    { key: 'converted', label: 'Converted', color: 'hsl(var(--success))' },
  ],
  sales: [
    { key: 'discovery_call', label: 'Discovery Call', color: 'hsl(var(--muted-foreground))' },
    { key: 'blueprint_call', label: 'Blueprint Call', color: 'hsl(210,80%,55%)' },
    { key: 'send_proposal', label: 'Send Proposal', color: 'hsl(var(--accent))' },
    { key: 'proposal_signed', label: 'Proposal Signed', color: 'hsl(var(--warning))' },
    { key: 'invoice_paid', label: 'Invoice Paid', color: 'hsl(var(--success))' },
  ],
  onboarding: [
    { key: 'need_to_onboard', label: 'Need to Onboard', color: 'hsl(var(--muted-foreground))' },
    { key: 'onboard_call_booked', label: 'Onboard Call Booked', color: 'hsl(var(--accent))' },
    { key: 'onboarded', label: 'Onboarded', color: 'hsl(var(--success))' },
  ],
};

interface UsePipelineOpsOptions {
  pipeline?: PipelineType;
}

export function usePipelineOps(options: UsePipelineOpsOptions = {}) {
  const { pipeline } = options;
  const queryClient = useQueryClient();
  const queryKey = ['pipeline_opportunities', pipeline ?? 'all'];

  // ---------- FETCH ----------
  const { data: opportunities = [], isLoading: loading } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('pipeline_opportunities')
        .select('*')
        .order('created_at', { ascending: true });

      if (pipeline) {
        query = query.eq('pipeline', pipeline);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as PipelineOpportunity[];
    },
  });

  // ---------- REALTIME ----------
  useEffect(() => {
    const channel = supabase
      .channel(`pipeline_ops_${pipeline ?? 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pipeline_opportunities',
          ...(pipeline ? { filter: `pipeline=eq.${pipeline}` } : {}),
        },
        () => {
          queryClient.invalidateQueries({ queryKey });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pipeline, queryClient, queryKey]);

  // ---------- MUTATIONS ----------
  const createOpportunity = useMutation({
    mutationFn: async (opp: PipelineInsert) => {
      const { data, error } = await supabase
        .from('pipeline_opportunities')
        .insert(opp)
        .select()
        .single();
      if (error) throw error;
      return data as PipelineOpportunity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateStage = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const { data, error } = await supabase
        .from('pipeline_opportunities')
        .update({ stage, entered_stage_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as PipelineOpportunity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteOpportunity = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pipeline_opportunities')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // ---------- COMPUTED STATS ----------
  const stats = useMemo(() => {
    const countPerStage: Record<string, number> = {};
    let totalDealValue = 0;

    for (const opp of opportunities) {
      countPerStage[opp.stage] = (countPerStage[opp.stage] || 0) + 1;
      totalDealValue += Number(opp.deal_value) || 0;
    }

    return { countPerStage, totalDealValue, totalCount: opportunities.length };
  }, [opportunities]);

  return {
    opportunities,
    loading,
    createOpportunity,
    updateStage,
    deleteOpportunity,
    stats,
  };
}
