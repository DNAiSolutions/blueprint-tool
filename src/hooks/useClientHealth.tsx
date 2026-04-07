import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type HealthScore = Database['public']['Tables']['client_health_scores']['Row'];

interface ScoreInputs {
  content_performance: number;
  engagement_score: number;
  payment_score: number;
  portal_activity: number;
}

export function useClientHealth() {
  const queryClient = useQueryClient();
  const queryKey = ['client_health_scores'];

  const { data: scores = [], isLoading: loading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_health_scores')
        .select('*')
        .order('computed_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as HealthScore[];
    },
  });

  const computeScore = useMutation({
    mutationFn: async ({
      clientId,
      scores: s,
    }: {
      clientId: string;
      scores: ScoreInputs;
    }) => {
      const composite =
        s.content_performance * 0.3 +
        s.engagement_score * 0.25 +
        s.payment_score * 0.25 +
        s.portal_activity * 0.2;

      const upsell_triggered = composite > 80 && s.engagement_score > 70;

      const { data, error } = await supabase
        .from('client_health_scores')
        .insert({
          client_id: clientId,
          content_performance: s.content_performance,
          engagement_score: s.engagement_score,
          payment_score: s.payment_score,
          portal_activity: s.portal_activity,
          composite_score: Math.round(composite * 100) / 100,
          upsell_triggered,
          computed_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data as HealthScore;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const getLatestScore = (clientId: string): HealthScore | undefined => {
    return scores.find((s) => s.client_id === clientId);
  };

  return { scores, loading, computeScore, getLatestScore };
}
