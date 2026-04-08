import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database, Json } from '@/integrations/supabase/types';
import type { BrandKit, Card, DesignProject, DesignLayout } from './types';
import { SEED_BRAND_KITS } from './seed-brand-kits';

type DbBrandKit = Database['public']['Tables']['design_brand_kits']['Row'];
type DbDesignProject = Database['public']['Tables']['design_projects']['Row'];

function dbKitToBrandKit(row: DbBrandKit): BrandKit {
  return {
    id: row.id,
    clientId: row.client_id,
    name: row.name,
    colors: (row.colors as Record<string, string>) ?? {},
    fonts: (row.fonts as { display: string; body: string }) ?? { display: 'Inter', body: 'Inter' },
    logos: (row.logos as string[]) ?? [],
    isDefault: row.is_default ?? false,
  };
}

function dbProjectToDesignProject(row: DbDesignProject): DesignProject {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    brandKitId: row.brand_kit_id,
    layout: row.layout as DesignLayout,
    cards: (row.cards as unknown as Card[]) ?? [],
    thumbnailUrl: row.thumbnail_url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useDesignProjects(projectId?: string) {
  const qc = useQueryClient();

  // ---------- BRAND KITS ----------
  const { data: brandKits = [], isLoading: kitsLoading } = useQuery({
    queryKey: ['design_brand_kits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('design_brand_kits')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const mapped = (data ?? []).map(dbKitToBrandKit);
      return mapped.length > 0 ? mapped : SEED_BRAND_KITS;
    },
  });

  // ---------- DESIGN PROJECTS ----------
  const { data: designProjects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['design_projects', projectId],
    queryFn: async () => {
      let query = supabase
        .from('design_projects')
        .select('*')
        .order('updated_at', { ascending: false });
      if (projectId) query = query.eq('project_id', projectId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map(dbProjectToDesignProject);
    },
  });

  // ---------- SAVE PROJECT ----------
  const saveProject = useMutation({
    mutationFn: async (project: DesignProject) => {
      const payload = {
        id: project.id,
        project_id: project.projectId,
        brand_kit_id: project.brandKitId,
        name: project.name,
        layout: project.layout,
        cards: project.cards as unknown as Json,
        thumbnail_url: project.thumbnailUrl ?? null,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('design_projects')
        .upsert(payload)
        .select()
        .single();
      if (error) throw error;
      return dbProjectToDesignProject(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['design_projects'] }),
  });

  // ---------- CREATE PROJECT ----------
  const createProject = useMutation({
    mutationFn: async (input: { name: string; layout: DesignLayout; brandKitId: string | null; projectId: string | null }) => {
      const { data, error } = await supabase
        .from('design_projects')
        .insert({
          name: input.name,
          layout: input.layout,
          brand_kit_id: input.brandKitId,
          project_id: input.projectId,
          cards: [] as unknown as Json,
        })
        .select()
        .single();
      if (error) throw error;
      return dbProjectToDesignProject(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['design_projects'] }),
  });

  // ---------- DELETE PROJECT ----------
  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('design_projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['design_projects'] }),
  });

  // ---------- SAVE BRAND KIT ----------
  const saveBrandKit = useMutation({
    mutationFn: async (kit: BrandKit) => {
      const { data, error } = await supabase
        .from('design_brand_kits')
        .upsert({
          id: kit.id.startsWith('cfa-') || kit.id.startsWith('digital') ? undefined : kit.id,
          client_id: kit.clientId,
          name: kit.name,
          colors: kit.colors as unknown as Json,
          fonts: kit.fonts as unknown as Json,
          logos: kit.logos as unknown as Json,
          is_default: kit.isDefault ?? false,
        })
        .select()
        .single();
      if (error) throw error;
      return dbKitToBrandKit(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['design_brand_kits'] }),
  });

  return {
    brandKits,
    designProjects,
    loading: kitsLoading || projectsLoading,
    saveProject: saveProject.mutateAsync,
    createProject: createProject.mutateAsync,
    deleteProject: deleteProject.mutateAsync,
    saveBrandKit: saveBrandKit.mutateAsync,
  };
}
