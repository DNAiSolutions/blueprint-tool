import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type SocialChannel = Database['public']['Tables']['client_social_channels']['Row'];
type SocialChannelInsert = Database['public']['Tables']['client_social_channels']['Insert'];
type SocialChannelUpdate = Database['public']['Tables']['client_social_channels']['Update'];

export function useSocialChannels() {
  const [channels, setChannels] = useState<SocialChannel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChannels = useCallback(async () => {
    const { data, error } = await supabase
      .from('client_social_channels')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setChannels(data as SocialChannel[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const addChannel = useCallback(async (channel: SocialChannelInsert) => {
    const { data, error } = await supabase
      .from('client_social_channels')
      .insert(channel)
      .select()
      .single();

    if (!error && data) {
      setChannels(prev => [data as SocialChannel, ...prev]);
    }
    return { data: data as SocialChannel | null, error };
  }, []);

  const updateChannel = useCallback(async (id: string, updates: SocialChannelUpdate) => {
    const { data, error } = await supabase
      .from('client_social_channels')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setChannels(prev => prev.map(c => (c.id === id ? (data as SocialChannel) : c)));
    }
    return { data: data as SocialChannel | null, error };
  }, []);

  const getClientChannels = useCallback(
    (clientId: string) => {
      return channels.filter(c => c.client_id === clientId);
    },
    [channels],
  );

  return {
    channels,
    loading,
    addChannel,
    updateChannel,
    getClientChannels,
    refetch: fetchChannels,
  };
}
