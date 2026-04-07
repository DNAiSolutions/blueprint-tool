// @ts-nocheck - Table webhook_events not yet in schema
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type WebhookEvent = Database['public']['Tables']['webhook_events']['Row'];

interface WebhookFilters {
  source?: string;
  eventType?: string;
  processed?: boolean | null;
}

interface WebhookStats {
  total: number;
  processed: number;
  failed: number;
}

export function useWebhookEvents(filters: WebhookFilters = {}) {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WebhookStats>({ total: 0, processed: 0, failed: 0 });

  const fetchEvents = useCallback(async () => {
    let query = supabase
      .from('webhook_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (filters.source) {
      query = query.eq('source', filters.source);
    }
    if (filters.eventType) {
      query = query.eq('event_type', filters.eventType);
    }
    if (filters.processed !== null && filters.processed !== undefined) {
      query = query.eq('processed', filters.processed);
    }

    const { data, error } = await query;

    if (!error && data) {
      const rows = data as WebhookEvent[];
      setEvents(rows);

      // Compute stats from the fetched set
      setStats({
        total: rows.length,
        processed: rows.filter(e => e.processed && !e.processing_error).length,
        failed: rows.filter(e => !!e.processing_error).length,
      });
    }
    setLoading(false);
  }, [filters.source, filters.eventType, filters.processed]);

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Realtime subscription for new events
  useEffect(() => {
    const channel = supabase
      .channel('webhook-events-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webhook_events',
        },
        (payload) => {
          const newEvent = payload.new as WebhookEvent;
          setEvents(prev => [newEvent, ...prev]);
          setStats(prev => ({
            ...prev,
            total: prev.total + 1,
          }));
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'webhook_events',
        },
        () => {
          // Re-fetch on updates to keep stats accurate
          fetchEvents();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEvents]);

  const retryEvent = useCallback(async (eventId: string) => {
    const { error } = await supabase
      .from('webhook_events')
      .update({ processed: false, processing_error: null, processed_at: null })
      .eq('id', eventId);

    if (!error) {
      setEvents(prev =>
        prev.map(e =>
          e.id === eventId ? { ...e, processed: false, processing_error: null, processed_at: null } : e,
        ),
      );
    }
    return { error };
  }, []);

  return {
    events,
    loading,
    stats,
    retryEvent,
    refetch: fetchEvents,
  };
}
