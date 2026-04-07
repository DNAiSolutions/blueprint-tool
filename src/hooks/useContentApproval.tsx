// @ts-nocheck - Table content_approvals not yet in schema
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ContentApproval = Database['public']['Tables']['content_approvals']['Row'];

export function useContentApproval() {
  const [approvals, setApprovals] = useState<ContentApproval[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = useCallback(async () => {
    const { data, error } = await supabase
      .from('content_approvals')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setApprovals(data as ContentApproval[]);
    }
    setLoading(false);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('content-approvals-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_approvals',
        },
        () => {
          fetchApprovals();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchApprovals]);

  const submitForApproval = useCallback(async (scriptId: string, clientId: string) => {
    const autoApproveAt = new Date();
    autoApproveAt.setDate(autoApproveAt.getDate() + 5);

    const { data, error } = await supabase
      .from('content_approvals')
      .insert({
        script_id: scriptId,
        client_id: clientId,
        status: 'pending',
        revision_number: 0,
        submitted_at: new Date().toISOString(),
        auto_approve_at: autoApproveAt.toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      setApprovals(prev => [data as ContentApproval, ...prev]);
    }
    return { data: data as ContentApproval | null, error };
  }, []);

  const approve = useCallback(async (approvalId: string) => {
    const { data, error } = await supabase
      .from('content_approvals')
      .update({
        status: 'approved',
        responded_at: new Date().toISOString(),
      })
      .eq('id', approvalId)
      .select()
      .single();

    if (!error && data) {
      setApprovals(prev =>
        prev.map(a => (a.id === approvalId ? (data as ContentApproval) : a)),
      );
    }
    return { data: data as ContentApproval | null, error };
  }, []);

  const requestRevision = useCallback(async (approvalId: string, notes: string) => {
    // First fetch the current approval to check revision count
    const current = approvals.find(a => a.id === approvalId);
    if (!current) return { data: null, error: new Error('Approval not found') };

    const newRevisionNumber = current.revision_number + 1;
    const newStatus = newRevisionNumber >= 3 ? 'escalated' : 'revision_requested';

    const { data, error } = await supabase
      .from('content_approvals')
      .update({
        status: newStatus,
        revision_number: newRevisionNumber,
        revision_notes: notes,
        responded_at: new Date().toISOString(),
      })
      .eq('id', approvalId)
      .select()
      .single();

    if (!error && data) {
      setApprovals(prev =>
        prev.map(a => (a.id === approvalId ? (data as ContentApproval) : a)),
      );
    }
    return { data: data as ContentApproval | null, error };
  }, [approvals]);

  const getClientApprovals = useCallback(
    (clientId: string) => {
      return approvals.filter(a => a.client_id === clientId);
    },
    [approvals],
  );

  return {
    approvals,
    loading,
    submitForApproval,
    approve,
    requestRevision,
    getClientApprovals,
    refetch: fetchApprovals,
  };
}
