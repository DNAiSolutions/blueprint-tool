// @ts-nocheck - Columns/tables not yet in schema
import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OffboardResult {
  success: boolean;
  clientId: string;
  stepsCompleted: string[];
  error?: string;
}

export function useOffboarding() {
  const [loading, setLoading] = useState(false);

  // ---------- OFFBOARD CLIENT ----------
  const offboardClient = useCallback(async (clientId: string): Promise<OffboardResult> => {
    setLoading(true);
    const stepsCompleted: string[] = [];

    try {
      // 1. Set status to 'offboarding'
      const { error: statusErr } = await supabase
        .from('clients')
        .update({ status: 'offboarding' })
        .eq('id', clientId);
      if (statusErr) throw statusErr;
      stepsCompleted.push('status_offboarding');

      // 2. Cancel all pending agent_tasks (set to 'failed' with last_error since DB constraint may not include 'cancelled')
      const { error: tasksErr } = await supabase
        .from('agent_tasks')
        .update({ status: 'failed', last_error: 'Client offboarded' })
        .eq('client_id', clientId)
        .in('status', ['queued', 'in_progress']);
      if (tasksErr) throw tasksErr;
      stepsCompleted.push('agent_tasks_cancelled');

      // 3. Cancel pending content_approvals
      const { error: approvalsErr } = await supabase
        .from('content_approvals')
        .update({ status: 'rejected', revision_notes: 'Client offboarded — auto-cancelled' })
        .eq('client_id', clientId)
        .in('status', ['pending', 'submitted']);
      if (approvalsErr) throw approvalsErr;
      stepsCompleted.push('content_approvals_cancelled');

      // 4. Clear clone assets
      const { error: cloneErr } = await supabase
        .from('clients')
        .update({ clone_photo_url: null, clone_recording_url: null })
        .eq('id', clientId);
      if (cloneErr) throw cloneErr;
      stepsCompleted.push('clone_assets_cleared');

      // 5. Create notification for the client's auth user
      const { data: clientData } = await supabase
        .from('clients')
        .select('auth_user_id, business_name')
        .eq('id', clientId)
        .single();

      if (clientData?.auth_user_id) {
        await supabase.from('notifications').insert({
          user_id: clientData.auth_user_id,
          type: 'offboarding',
          title: 'Account Deactivated',
          body: `Your account for ${clientData.business_name ?? 'your business'} has been deactivated. Contact support if you believe this is an error.`,
          channel: 'portal',
        });
        stepsCompleted.push('client_notified');
      } else {
        stepsCompleted.push('client_notified_skipped_no_auth_user');
      }

      // 6. Finalize offboarding
      const { error: finalErr } = await supabase
        .from('clients')
        .update({
          status: 'offboarded',
          offboarded_at: new Date().toISOString(),
        })
        .eq('id', clientId);
      if (finalErr) throw finalErr;
      stepsCompleted.push('status_offboarded');

      return { success: true, clientId, stepsCompleted };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error during offboarding';
      return { success: false, clientId, stepsCompleted, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- REACTIVATE CLIENT ----------
  const reactivateClient = useCallback(async (clientId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({ status: 'active', offboarded_at: null })
        .eq('id', clientId);

      if (error) throw error;

      // Notify the client
      const { data: clientData } = await supabase
        .from('clients')
        .select('auth_user_id, business_name')
        .eq('id', clientId)
        .single();

      if (clientData?.auth_user_id) {
        await supabase.from('notifications').insert({
          user_id: clientData.auth_user_id,
          type: 'reactivation',
          title: 'Account Reactivated',
          body: `Welcome back! Your account for ${clientData.business_name ?? 'your business'} has been reactivated.`,
          channel: 'portal',
        });
      }

      return { success: true, clientId };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error during reactivation';
      return { success: false, clientId, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { offboardClient, reactivateClient, loading };
}
