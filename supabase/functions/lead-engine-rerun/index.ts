import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const { submissionId } = await req.json();
    if (!submissionId) {
      return new Response(JSON.stringify({ error: 'submissionId is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const now = new Date().toISOString();

    const { error: submissionError } = await supabase
      .from('lead_engine_submissions')
      .update({ status: 'generating', updated_at: now })
      .eq('id', submissionId);

    if (submissionError) throw submissionError;

    const { error: runError } = await supabase
      .from('lead_engine_runs')
      .update({ research_status: 'pending', website_status: 'generating', content_status: 'generating', video_status: 'generating', last_error: null, updated_at: now })
      .eq('lead_engine_submission_id', submissionId);

    if (runError) throw runError;

    const { error: websiteError } = await supabase
      .from('websites')
      .update({ website_stage: 'generating', deploy_status: 'draft' })
      .eq('source_submission_id', submissionId)
      .eq('source_type', 'lead_magnet');

    if (websiteError) throw websiteError;

    return new Response(JSON.stringify({ success: true, submissionId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
