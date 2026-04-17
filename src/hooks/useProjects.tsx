// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectService = Database['public']['Tables']['project_services']['Row'];

interface UseProjectsOptions {
  clientId?: string;
  status?: string;
}

export function useProjects(opts: UseProjectsOptions = {}) {
  const qc = useQueryClient();

  // ---------- FETCH PROJECTS ----------
  const { data: projects = [], isLoading: loading } = useQuery({
    queryKey: ['projects', opts.clientId, opts.status],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (opts.clientId) query = query.eq('client_id', opts.clientId);
      if (opts.status) query = query.eq('status', opts.status);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

  // ---------- FETCH PROJECT SERVICES (for all loaded projects) ----------
  const projectIds = projects.map(p => p.id);
  const { data: services = [] } = useQuery({
    queryKey: ['project_services', projectIds],
    queryFn: async () => {
      if (projectIds.length === 0) return [];
      const { data, error } = await supabase
        .from('project_services')
        .select('*')
        .in('project_id', projectIds);
      if (error) throw error;
      return (data ?? []) as ProjectService[];
    },
    enabled: projectIds.length > 0,
  });

  // ---------- REALTIME ----------
  useEffect(() => {
    const channel = supabase
      .channel('projects_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        qc.invalidateQueries({ queryKey: ['projects'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  // ---------- CREATE PROJECT ----------
  const createProject = useMutation({
    mutationFn: async (input: { clientId: string; name: string; ghlSubaccountId?: string; ghlLocationId?: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          client_id: input.clientId,
          name: input.name,
          ghl_subaccount_id: input.ghlSubaccountId ?? null,
          ghl_location_id: input.ghlLocationId ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });

  // ---------- UPDATE PROJECT ----------
  const updateProject = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
      const { error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });

  // ---------- ADD SERVICE ----------
  const addService = useMutation({
    mutationFn: async (input: { projectId: string; serviceType: string; config?: Record<string, unknown> }) => {
      const { data, error } = await supabase
        .from('project_services')
        .insert({
          project_id: input.projectId,
          service_type: input.serviceType,
          config: input.config ?? {},
        })
        .select()
        .single();
      if (error) throw error;
      return data as ProjectService;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project_services'] }),
  });

  // ---------- REMOVE SERVICE ----------
  const removeService = useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase
        .from('project_services')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', serviceId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project_services'] }),
  });

  // ---------- HELPERS ----------
  const getProjectServices = (projectId: string) =>
    services.filter(s => s.project_id === projectId && s.status === 'active');

  const getProjectByClientId = (clientId: string) =>
    projects.find(p => p.client_id === clientId);

  return {
    projects,
    services,
    loading,
    createProject: createProject.mutateAsync,
    updateProject: updateProject.mutateAsync,
    addService: addService.mutateAsync,
    removeService: removeService.mutateAsync,
    getProjectServices,
    getProjectByClientId,
  };
}
