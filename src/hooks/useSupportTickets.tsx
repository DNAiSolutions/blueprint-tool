import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import type { Database, Json } from '@/integrations/supabase/types';

type SupportTicket = Database['public']['Tables']['support_tickets']['Row'];

interface UseTicketsOptions {
  projectId?: string;
  clientId?: string;
  status?: string;
}

export function useSupportTickets(opts: UseTicketsOptions = {}) {
  const qc = useQueryClient();

  // ---------- FETCH TICKETS ----------
  const { data: tickets = [], isLoading: loading } = useQuery({
    queryKey: ['support_tickets', opts.projectId, opts.clientId, opts.status],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (opts.projectId) query = query.eq('project_id', opts.projectId);
      if (opts.clientId) query = query.eq('client_id', opts.clientId);
      if (opts.status) query = query.eq('status', opts.status);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as SupportTicket[];
    },
  });

  // ---------- REALTIME ----------
  useEffect(() => {
    const channel = supabase
      .channel('support_tickets_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
        qc.invalidateQueries({ queryKey: ['support_tickets'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  // ---------- CREATE TICKET ----------
  const createTicket = useMutation({
    mutationFn: async (input: {
      projectId: string;
      clientId: string;
      title: string;
      description?: string;
      category?: string;
      priority?: string;
    }) => {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          project_id: input.projectId,
          client_id: input.clientId,
          title: input.title,
          description: input.description ?? null,
          category: input.category ?? 'general',
          priority: input.priority ?? 'normal',
        })
        .select()
        .single();
      if (error) throw error;
      return data as SupportTicket;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['support_tickets'] }),
  });

  // ---------- ASSIGN TO AGENT ----------
  const assignAgent = useMutation({
    mutationFn: async ({ ticketId, agentId }: { ticketId: string; agentId: string }) => {
      // Create an agent task for this ticket
      const { data: task, error: taskErr } = await supabase
        .from('agent_tasks')
        .insert({
          agent_id: agentId,
          task_type: 'support_ticket',
          priority: 'high',
          status: 'queued',
          input_payload: { ticket_id: ticketId } as unknown as Json,
        })
        .select()
        .single();
      if (taskErr) throw taskErr;

      // Link the task to the ticket and set in_progress
      const { error } = await supabase
        .from('support_tickets')
        .update({
          assigned_agent: agentId,
          agent_task_id: task.id,
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId);
      if (error) throw error;

      return task;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['support_tickets'] });
      qc.invalidateQueries({ queryKey: ['agent_tasks'] });
    },
  });

  // ---------- RESOLVE TICKET ----------
  const resolveTicket = useMutation({
    mutationFn: async ({ ticketId, notes }: { ticketId: string; notes?: string }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          status: 'resolved',
          resolution_notes: notes ?? null,
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['support_tickets'] }),
  });

  // ---------- UPDATE STATUS ----------
  const updateStatus = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', ticketId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['support_tickets'] }),
  });

  // ---------- STATS ----------
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  return {
    tickets,
    loading,
    stats,
    createTicket: createTicket.mutateAsync,
    assignAgent: assignAgent.mutateAsync,
    resolveTicket: resolveTicket.mutateAsync,
    updateStatus: updateStatus.mutateAsync,
  };
}
