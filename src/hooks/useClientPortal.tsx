import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useContentApproval } from './useContentApproval';
import { useNotifications } from './useNotifications';

interface HealthScore {
  composite_score: number;
  content_performance: number;
  engagement_score: number;
  payment_score: number;
  portal_activity: number;
  computed_at: string;
}

export function useClientPortal() {
  const { clientRecord } = useAuth();
  const { approvals, loading: approvalsLoading, approve, requestRevision } = useContentApproval();
  const { notifications, unreadCount } = useNotifications();
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  const fetchHealthScore = useCallback(async () => {
    if (!clientRecord) {
      setHealthLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('client_health_scores')
      .select('composite_score, content_performance, engagement_score, payment_score, portal_activity, computed_at')
      .eq('client_id', clientRecord.id)
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setHealthScore(data as HealthScore);
    }
    setHealthLoading(false);
  }, [clientRecord]);

  useEffect(() => {
    fetchHealthScore();
  }, [fetchHealthScore]);

  const contentApprovals = clientRecord
    ? approvals.filter(a => a.client_id === clientRecord.id)
    : [];

  const loading = approvalsLoading || healthLoading;

  return {
    client: clientRecord,
    contentApprovals,
    notifications,
    unreadCount,
    healthScore,
    loading,
    approve,
    requestRevision,
  };
}
