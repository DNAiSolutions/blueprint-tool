import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

export interface ClientOption {
  id: string;
  business_name: string;
  is_internal: boolean;
  industry?: string | null;
  location?: string | null;
  pipeline_stage?: string;
}

interface ClientContextValue {
  selectedClientId: string | null; // null = "All"
  setSelectedClientId: (id: string | null) => void;
  clients: ClientOption[];
  internalClient: ClientOption | null;
  externalClients: ClientOption[];
  selectedClient: ClientOption | null;
  isLoading: boolean;
}

const ClientContext = createContext<ClientContextValue | undefined>(undefined);

export function ClientContextProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['client-context-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('clients')
        .select('id, business_name, is_internal, industry, location, pipeline_stage')
        .order('is_internal', { ascending: false })
        .order('business_name', { ascending: true });
      return (data || []) as ClientOption[];
    },
    enabled: !!user,
  });

  const internalClient = clients.find(c => c.is_internal) || null;
  const externalClients = clients.filter(c => !c.is_internal);
  const selectedClient = selectedClientId ? clients.find(c => c.id === selectedClientId) || null : null;

  return (
    <ClientContext.Provider value={{
      selectedClientId,
      setSelectedClientId,
      clients,
      internalClient,
      externalClients,
      selectedClient,
      isLoading,
    }}>
      {children}
    </ClientContext.Provider>
  );
}

const DEFAULT_VALUE: ClientContextValue = {
  selectedClientId: null,
  setSelectedClientId: () => {},
  clients: [],
  internalClient: null,
  externalClients: [],
  selectedClient: null,
  isLoading: true,
};

export function useClientContext() {
  const ctx = useContext(ClientContext);
  return ctx ?? DEFAULT_VALUE;
}
