import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Template = Database['public']['Tables']['templates']['Row'];
type TemplateInsert = Database['public']['Tables']['templates']['Insert'];
type TemplateUpdate = Database['public']['Tables']['templates']['Update'];

interface UseTemplatesOptions {
  category?: string;
  industry?: string;
}

export function useTemplates(options: UseTemplatesOptions = {}) {
  const { category, industry } = options;
  const queryClient = useQueryClient();
  const queryKey = ['templates', category, industry];

  const { data: templates = [], isLoading: loading } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('templates')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      if (category) query = query.eq('category', category);
      if (industry) query = query.eq('industry', industry);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Template[];
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (template: TemplateInsert) => {
      const { data, error } = await supabase
        .from('templates')
        .insert(template)
        .select()
        .single();
      if (error) throw error;
      return data as Template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TemplateUpdate }) => {
      const { data, error } = await supabase
        .from('templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const incrementUsage = useMutation({
    mutationFn: async (templateId: string) => {
      const target = templates.find((t) => t.id === templateId);
      const currentCount = target?.usage_count ?? 0;
      const { data, error } = await supabase
        .from('templates')
        .update({ usage_count: currentCount + 1 })
        .eq('id', templateId)
        .select()
        .single();
      if (error) throw error;
      return data as Template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  return { templates, loading, createTemplate, updateTemplate, incrementUsage };
}
