// @ts-nocheck - Tables referenced here (agent_tasks) not yet in schema
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database, Json } from '@/integrations/supabase/types';

type AgentTask = Database['public']['Tables']['agent_tasks']['Row'];
type AgentTaskInsert = Database['public']['Tables']['agent_tasks']['Insert'];
type AgentTaskUpdate = Database['public']['Tables']['agent_tasks']['Update'];

interface UseAgentTasksOptions {
  agentId?: string;
  status?: string;
  clientId?: string;
  priority?: string;
}

export function useAgentTasks(options: UseAgentTasksOptions = {}) {
  const { agentId, status, clientId, priority } = options;
  const queryClient = useQueryClient();
  const queryKey = ['agent_tasks', agentId, status, clientId, priority];

  // ---------- FETCH ----------
  const { data: tasks = [], isLoading: loading } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('agent_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (agentId) query = query.eq('agent_id', agentId);
      if (status) query = query.eq('status', status);
      if (clientId) query = query.eq('client_id', clientId);
      if (priority) query = query.eq('priority', priority);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as AgentTask[];
    },
  });

  // ---------- REALTIME ----------
  useEffect(() => {
    const channel = supabase
      .channel(`agent_tasks_${agentId ?? 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_tasks',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['agent_tasks'] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId, queryClient]);

  // ---------- CREATE ----------
  const createTask = useMutation({
    mutationFn: async (task: AgentTaskInsert) => {
      const { data, error } = await supabase
        .from('agent_tasks')
        .insert(task)
        .select()
        .single();
      if (error) throw error;
      return data as AgentTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent_tasks'] });
    },
  });

  // ---------- UPDATE ----------
  const updateTask = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: AgentTaskUpdate }) => {
      const { data, error } = await supabase
        .from('agent_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as AgentTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent_tasks'] });
    },
  });

  // ---------- COMPLETE WITH HANDOFF ----------
  const completeTask = useMutation({
    mutationFn: async ({ id, outputPayload }: { id: string; outputPayload?: Json }) => {
      // 1. Mark the task done
      const { data: completed, error: completeError } = await supabase
        .from('agent_tasks')
        .update({
          status: 'done',
          completed_at: new Date().toISOString(),
          ...(outputPayload !== undefined ? { output_payload: outputPayload } : {}),
        })
        .eq('id', id)
        .select()
        .single();

      if (completeError) throw completeError;

      // 2. Check for handoff: if output_payload has next_agent + next_task_type, create downstream task
      const payload = (outputPayload ?? completed?.output_payload) as Record<string, unknown> | null;
      if (payload && typeof payload === 'object' && payload.next_agent && payload.next_task_type) {
        const { error: handoffError } = await supabase
          .from('agent_tasks')
          .insert({
            agent_id: String(payload.next_agent),
            task_type: String(payload.next_task_type),
            priority: (payload.next_priority as string) || 'medium',
            status: 'queued',
            client_id: completed?.client_id ?? null,
            parent_task_id: id,
            input_payload: (payload.next_input as Json) ?? null,
          });
        if (handoffError) throw handoffError;
      }

      return completed as AgentTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent_tasks'] });
    },
  });

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    completeTask,
  };
}
