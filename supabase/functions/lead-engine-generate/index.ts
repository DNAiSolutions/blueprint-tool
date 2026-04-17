import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function invokeFunction<T>(name: string, body: Record<string, unknown>) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.error || `${name} failed with status ${response.status}`);
  }

  return data as T;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const now = new Date().toISOString();
  let submissionId: string | null = null;

  try {
    const body = await req.json();
    submissionId = body?.submissionId ?? null;
    if (!submissionId) {
      return new Response(JSON.stringify({ error: 'submissionId is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: submission, error: submissionError } = await supabase
      .from('lead_engine_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) throw submissionError ?? new Error('Submission not found');

    await supabase.from('lead_engine_submissions').update({ status: 'generating', updated_at: now }).eq('id', submissionId);
    await supabase.from('lead_engine_runs').update({ research_status: 'running', website_status: 'generating', last_error: null, updated_at: now }).eq('lead_engine_submission_id', submissionId);
    await supabase.from('websites').update({ website_stage: 'generating' }).eq('source_submission_id', submissionId).eq('source_type', 'lead_magnet');

    const intakePayload = (submission.intake_payload ?? {}) as Record<string, unknown>;
    const selectedServices = Array.isArray(submission.selected_services) ? submission.selected_services : [];

    const researchInput = {
      fullName: submission.contact_name ?? intakePayload.fullName ?? '',
      businessName: submission.business_name ?? intakePayload.businessName ?? '',
      email: submission.email ?? intakePayload.email ?? '',
      phone: submission.phone ?? intakePayload.phone ?? '',
      businessDescription: intakePayload.businessDescription ?? '',
      websiteUrl: submission.website_url ?? intakePayload.websiteUrl ?? '',
      industry: submission.industry ?? intakePayload.industry ?? '',
      targetAudience: intakePayload.targetAudience ?? '',
      serviceArea: intakePayload.serviceArea ?? '',
      brandColors: intakePayload.primaryColor ?? intakePayload.brandColors ?? '',
      featuresNeeded: intakePayload.featuresNeeded ?? '',
      videoGoals: intakePayload.videoGoals ?? '',
      brandTone: intakePayload.brandTone ?? '',
      googlePlaceId: intakePayload.googlePlaceId ?? '',
      logoUrl: intakePayload.logoUrl ?? '',
      headshotUrl: intakePayload.headshotUrl ?? '',
    };

    const research = await invokeFunction<Record<string, unknown>>('ai-research', researchInput);

    let stitch: Record<string, unknown> | null = null;
    let html: string | null = null;
    let previewUrl: string | null = null;

    if (selectedServices.includes('website')) {
      stitch = await invokeFunction<Record<string, unknown>>('generate-stitch-design', {
        mode: 'generate',
        businessName: submission.business_name ?? intakePayload.businessName ?? '',
        designBrief: (research as any)?.designBrief ?? '',
        brandColors: intakePayload.primaryColor ?? intakePayload.brandColors ?? '',
        styleDirection: (research as any)?.styleDirection ?? 'Cinematic Noir',
        headlineFont: intakePayload.headlineFont ?? 'INTER',
        bodyFont: intakePayload.bodyFont ?? 'INTER',
        logoUrl: intakePayload.logoUrl ?? '',
        primaryColor: intakePayload.primaryColor ?? '',
        secondaryColor: intakePayload.secondaryColor ?? '',
        accentColor: intakePayload.accentColor ?? '',
        colorMode: intakePayload.colorMode ?? 'DARK',
        roundness: intakePayload.roundness ?? 'ROUND_EIGHT',
        colorVariant: intakePayload.colorVariant ?? 'VIBRANT',
        brandTone: intakePayload.brandTone ?? '',
        industry: submission.industry ?? intakePayload.industry ?? '',
      });

      html = (stitch as any)?.html ?? (stitch as any)?.stitchHtml ?? null;
      previewUrl = (stitch as any)?.screenshotUrl ?? null;

      await supabase
        .from('websites')
        .update({
          website_stage: 'preview_ready',
          preview_url: previewUrl,
          stitch_project_id: (stitch as any)?.projectId ?? null,
          stitch_design_md: JSON.stringify(stitch),
          site_code: html,
        })
        .eq('source_submission_id', submissionId)
        .eq('source_type', 'lead_magnet');
    }

    await supabase.from('lead_engine_submissions').update({ status: 'preview_ready', updated_at: new Date().toISOString() }).eq('id', submissionId);
    await supabase.from('lead_engine_runs').update({
      research_status: 'completed',
      website_status: selectedServices.includes('website') ? 'preview_ready' : 'draft',
      content_status: selectedServices.includes('content') ? 'draft' : 'draft',
      preview_url: previewUrl,
      last_error: null,
      updated_at: new Date().toISOString(),
    }).eq('lead_engine_submission_id', submissionId);
    await supabase.from('lead_engine_onboarding').update({ status: 'ready_for_call', website_review_status: selectedServices.includes('website') ? 'preview_ready' : 'pending', updated_at: new Date().toISOString() }).eq('lead_engine_submission_id', submissionId);

    return new Response(JSON.stringify({ success: true, submissionId, research, stitch, html }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    try {
      if (submissionId) {
        await supabase.from('lead_engine_submissions').update({ status: 'new', updated_at: new Date().toISOString() }).eq('id', submissionId);
        await supabase.from('lead_engine_runs').update({ research_status: 'failed', website_status: 'failed', last_error: message, updated_at: new Date().toISOString() }).eq('lead_engine_submission_id', submissionId);
        await supabase.from('websites').update({ website_stage: 'draft' }).eq('source_submission_id', submissionId).eq('source_type', 'lead_magnet');
      }
    } catch {
      // ignore secondary error handling failures
    }

    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
