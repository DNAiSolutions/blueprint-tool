import { supabase } from '@/integrations/supabase/client';

export interface LeadEngineGenerationResult {
  success: boolean;
  submissionId: string;
  research?: Record<string, unknown> | null;
  stitch?: Record<string, unknown> | null;
  html?: string | null;
  error?: string;
}

export async function startLeadEngineGeneration(submissionId: string): Promise<LeadEngineGenerationResult> {
  const { data, error } = await supabase.functions.invoke('lead-engine-generate', {
    body: { submissionId },
  });

  if (error) {
    throw new Error(error.message || 'Failed to start lead engine generation');
  }

  return data as LeadEngineGenerationResult;
}
