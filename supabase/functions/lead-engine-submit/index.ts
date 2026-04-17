import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

interface LeadEngineSubmitRequest {
  userId: string;
  sourceFunnel?: string;
  niche?: string;
  contactName?: string;
  businessName?: string;
  industry?: string;
  email?: string;
  phone?: string;
  websiteUrl?: string;
  selectedServices?: string[];
  intakePayload?: Record<string, unknown>;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const body = (await req.json()) as LeadEngineSubmitRequest;
    if (!body.userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: submission, error: submissionError } = await supabase
      .from('lead_engine_submissions')
      .insert({
        user_id: body.userId,
        source_funnel: body.sourceFunnel ?? 'api',
        niche: body.niche ?? null,
        contact_name: body.contactName ?? null,
        business_name: body.businessName ?? null,
        industry: body.industry ?? null,
        email: body.email ?? null,
        phone: body.phone ?? null,
        website_url: body.websiteUrl ?? null,
        selected_services: body.selectedServices ?? [],
        intake_payload: body.intakePayload ?? {},
        status: 'new',
      })
      .select()
      .single();

    if (submissionError || !submission) throw submissionError ?? new Error('Failed to create submission');

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        user_id: body.userId,
        source: 'form',
        name: body.contactName ?? null,
        business_name: body.businessName ?? null,
        industry: body.industry ?? null,
        email: body.email ?? null,
        phone: body.phone ?? null,
        engagement_action: `Lead engine intake: ${body.sourceFunnel ?? 'api'}`,
        status: 'new',
        enrichment_data: body.intakePayload ?? {},
      })
      .select()
      .single();

    if (!leadError && lead?.id) {
      await supabase.from('lead_engine_submissions').update({ linked_lead_id: lead.id }).eq('id', submission.id);
      try {
        await supabase.from('pipeline_opportunities').insert({
          pipeline: 'new_leads',
          stage: 'new_lead',
          deal_value: 0,
          notes: body.businessName ?? 'Lead engine submission',
          source_ref_id: submission.id,
          assigned_agent: 'website-builder',
        } as any);
      } catch {
        // Fail soft until every environment has the exact pipeline schema.
      }
    }

    const { error: runError } = await supabase.from('lead_engine_runs').insert({
      lead_engine_submission_id: submission.id,
      research_status: 'pending',
      website_status: body.selectedServices?.includes('website') ? 'draft' : 'draft',
      content_status: body.selectedServices?.includes('content') ? 'draft' : 'draft',
      video_status: body.selectedServices?.includes('content') ? 'draft' : 'draft',
      crm_sync_status: 'pending',
    });

    if (runError) throw runError;

    const { error: onboardingError } = await supabase.from('lead_engine_onboarding').insert({
      lead_engine_submission_id: submission.id,
      status: 'pending',
      confirmed_services: body.selectedServices ?? [],
      website_review_status: 'pending',
    });

    if (onboardingError) throw onboardingError;

    if (body.selectedServices?.includes('website')) {
      const domain = body.websiteUrl ? new URL(body.websiteUrl).hostname.replace(/^www\./, '') : `${(body.businessName ?? 'sample-site').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.preview`;
      const { error: websiteError } = await supabase.from('websites').insert({
        user_id: body.userId,
        domain,
        source_type: 'lead_magnet',
        source_submission_id: submission.id,
        source_funnel: body.sourceFunnel ?? 'api',
        website_stage: 'draft',
        promotion_status: 'not_promoted',
        deploy_status: 'draft',
      });

      if (websiteError) throw websiteError;
    }

    return new Response(JSON.stringify({ success: true, submissionId: submission.id }), {
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
