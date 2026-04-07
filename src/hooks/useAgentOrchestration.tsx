import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAgentTasks } from './useAgentTasks';
import { useCostLedger } from './useCostLedger';
import type { Json } from '@/integrations/supabase/types';

interface DispatchResult {
  taskId: string;
  agent_id: string;
  task_type: string;
  status: string;
}

interface WorkloadEntry {
  agent_id: string;
  count: number;
}

export function useAgentOrchestration() {
  const { createTask, updateTask } = useAgentTasks();
  const { logCost } = useCostLedger();

  // ---------- DISPATCH ----------
  const dispatchTask = useCallback(
    async (
      agentId: string,
      taskType: string,
      payload?: Json,
      clientId?: string,
      priority?: string,
    ): Promise<DispatchResult> => {
      const task = await createTask.mutateAsync({
        agent_id: agentId,
        task_type: taskType,
        priority: priority ?? 'medium',
        status: 'queued',
        client_id: clientId ?? null,
        input_payload: payload ?? null,
      });

      // Log a cost entry for task creation (zero-cost placeholder until actual provider cost is known)
      try {
        await logCost.mutateAsync({
          agent_task_id: task.id,
          client_id: clientId ?? null,
          provider: 'dnai',
          api_action: `dispatch:${taskType}`,
          cost_usd: 0,
        });
      } catch {
        // cost logging is non-critical — don't block dispatch
      }

      return {
        taskId: task.id,
        agent_id: task.agent_id,
        task_type: task.task_type,
        status: task.status,
      };
    },
    [createTask, logCost],
  );

  // ---------- ESCALATE ----------
  const escalateTask = useCallback(
    async (taskId: string) => {
      const updated = await updateTask.mutateAsync({
        id: taskId,
        updates: {
          status: 'escalated',
          escalated_at: new Date().toISOString(),
        },
      });

      // Create a notification for staff — use the current user's auth id
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'escalation',
          title: 'Task Escalated',
          body: `Agent task ${taskId} has been escalated and requires manual review.`,
          channel: 'portal',
        });
      }

      return updated;
    },
    [updateTask],
  );

  // ---------- CHECK ERROR RATE ----------
  const checkErrorRate = useCallback(
    async (agentId: string): Promise<{ failedCount: number; escalated: boolean }> => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { data: failedTasks, error } = await supabase
        .from('agent_tasks')
        .select('id')
        .eq('agent_id', agentId)
        .eq('status', 'failed')
        .gte('created_at', oneHourAgo);

      if (error) throw error;

      const failedCount = failedTasks?.length ?? 0;

      if (failedCount >= 2) {
        // Auto-escalate all failed tasks in the window
        for (const t of failedTasks ?? []) {
          await escalateTask(t.id);
        }

        // Create a WhatsApp notification for the admin
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'error_rate_alert',
            title: `High Error Rate: ${agentId}`,
            body: `Agent "${agentId}" has ${failedCount} failed tasks in the last hour. Tasks auto-escalated.`,
            channel: 'whatsapp',
          });
        }

        return { failedCount, escalated: true };
      }

      return { failedCount, escalated: false };
    },
    [escalateTask],
  );

  // ---------- GET AGENT WORKLOAD ----------
  const getAgentWorkload = useCallback(async (): Promise<WorkloadEntry[]> => {
    const { data, error } = await supabase
      .from('agent_tasks')
      .select('agent_id')
      .eq('status', 'in_progress');

    if (error) throw error;

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      counts[row.agent_id] = (counts[row.agent_id] || 0) + 1;
    }

    return Object.entries(counts).map(([agent_id, count]) => ({ agent_id, count }));
  }, []);

  // ---------- RUN HANDOFF ----------
  const runHandoff = useCallback(
    async (completedTaskId: string) => {
      // Fetch the completed task
      const { data: completed, error: fetchErr } = await supabase
        .from('agent_tasks')
        .select('*')
        .eq('id', completedTaskId)
        .single();

      if (fetchErr || !completed) throw fetchErr ?? new Error('Task not found');

      const payload = completed.output_payload as Record<string, unknown> | null;

      if (!payload || typeof payload !== 'object' || !payload.next_agent || !payload.next_task_type) {
        return null; // No handoff needed
      }

      // Create downstream task
      const downstream = await createTask.mutateAsync({
        agent_id: String(payload.next_agent),
        task_type: String(payload.next_task_type),
        priority: (payload.next_priority as string) || 'medium',
        status: 'queued',
        client_id: completed.client_id ?? null,
        parent_task_id: completedTaskId,
        input_payload: (payload.next_input as Json) ?? null,
      });

      // Log cost for handoff
      try {
        await logCost.mutateAsync({
          agent_task_id: downstream.id,
          client_id: completed.client_id ?? null,
          provider: 'dnai',
          api_action: `handoff:${String(payload.next_task_type)}`,
          cost_usd: 0,
        });
      } catch {
        // non-critical
      }

      return downstream;
    },
    [createTask, logCost],
  );

  return {
    dispatchTask,
    escalateTask,
    checkErrorRate,
    getAgentWorkload,
    runHandoff,
    isDispatching: createTask.isPending,
  };
}
