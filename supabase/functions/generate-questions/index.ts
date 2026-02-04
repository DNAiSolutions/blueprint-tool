import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GenerateQuestionsRequest {
  industry: string;
  currentStage: 'fulfillment' | 'review' | 'custom';
  previousAnswers: {
    leadSources?: string[];
    intakeMethods?: string[];
    qualificationCriteria?: string[];
    closeProcess?: string;
    fulfillmentStart?: string;
  };
  existingNodes: Array<{ type: string; label: string }>;
  // Chain mode for fulfillment "what happens next" questions
  chainMode?: boolean;
  lastFulfillmentStep?: string;
  fulfillmentChainDepth?: number;
}

interface GeneratedQuestion {
  id: string;
  question: string;
  type: 'text' | 'select' | 'multi-select' | 'number' | 'yes-no';
  options?: string[];
  hint?: string;
  followUpNodeType?: string;
}

// Common fulfillment step options for chain mode
const FULFILLMENT_CHAIN_OPTIONS = [
  'Send confirmation to customer',
  'Send prep instructions',
  'Call customer',
  'Text status update',
  'Assign technician/staff',
  'Assign project manager',
  'Team briefing/handoff',
  'Order materials/parts',
  'Prepare equipment',
  'Complete pre-job checklist',
  'Verify address/access',
  'Confirm appointment (day before)',
  'Travel to site',
  'Perform the work/service',
  'Get client approval',
  'Take before/after photos',
  'Final walkthrough with client',
  'Collect signature',
  'Process payment',
  'Send invoice',
  'Clean up / pack up',
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body: GenerateQuestionsRequest = await req.json();
    console.log("[generate-questions] Request:", JSON.stringify(body, null, 2));

    const { industry, currentStage, previousAnswers, existingNodes, chainMode, lastFulfillmentStep, fulfillmentChainDepth = 0 } = body;

    // CHAIN MODE: Generate single "what happens next" question
    if (chainMode && lastFulfillmentStep) {
      console.log("[generate-questions] Chain mode - generating follow-up for:", lastFulfillmentStep);
      
      const chainSystemPrompt = `You are a business process expert helping map a ${industry} business's fulfillment workflow step by step.

The user just described this step in their fulfillment process: "${lastFulfillmentStep}"

Generate ONE follow-up question asking what happens IMMEDIATELY AFTER this step.

Return a JSON object with:
- id: "ai_chain_${fulfillmentChainDepth + 1}"
- question: A conversational question asking what happens next (e.g., "After ${lastFulfillmentStep}, what's the next step?")
- type: "multi-select"
- options: Array of 5-7 likely next steps for a ${industry} business (include "This is the final step" as the last option)
- hint: Optional coaching tip for the sales rep

IMPORTANT: 
1. Make options specific to ${industry} when possible
2. Always include "This is the final step" as the last option
3. Return ONLY valid JSON, no other text`;

      const chainResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: chainSystemPrompt },
            { role: "user", content: `Generate the next question for step: "${lastFulfillmentStep}"` },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!chainResponse.ok) {
        console.error("[generate-questions] Chain mode AI error:", chainResponse.status);
        // Fallback to generic "what's next" question
        return new Response(
          JSON.stringify({
            questions: [{
              id: `ai_chain_${fulfillmentChainDepth + 1}`,
              question: `After "${lastFulfillmentStep}", what happens next?`,
              type: 'multi-select',
              options: [...FULFILLMENT_CHAIN_OPTIONS.slice(0, 6), 'This is the final step'],
              hint: 'Select the next step in your process',
              followUpNodeType: 'fulfillment',
            }],
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const chainData = await chainResponse.json();
      const chainContent = chainData.choices?.[0]?.message?.content;
      
      try {
        let cleanContent = chainContent.trim();
        if (cleanContent.startsWith("```json")) cleanContent = cleanContent.slice(7);
        if (cleanContent.startsWith("```")) cleanContent = cleanContent.slice(3);
        if (cleanContent.endsWith("```")) cleanContent = cleanContent.slice(0, -3);
        cleanContent = cleanContent.trim();

        const chainQuestion = JSON.parse(cleanContent);
        
        return new Response(
          JSON.stringify({
            questions: [{
              id: chainQuestion.id || `ai_chain_${fulfillmentChainDepth + 1}`,
              question: chainQuestion.question,
              type: chainQuestion.type || 'multi-select',
              options: chainQuestion.options || [...FULFILLMENT_CHAIN_OPTIONS.slice(0, 6), 'This is the final step'],
              hint: chainQuestion.hint,
              followUpNodeType: 'fulfillment',
            }],
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (parseErr) {
        console.error("[generate-questions] Chain parse error:", parseErr);
        // Fallback
        return new Response(
          JSON.stringify({
            questions: [{
              id: `ai_chain_${fulfillmentChainDepth + 1}`,
              question: `What happens after "${lastFulfillmentStep}"?`,
              type: 'multi-select',
              options: [...FULFILLMENT_CHAIN_OPTIONS.slice(0, 6), 'This is the final step'],
              hint: 'Select the next step in your process',
              followUpNodeType: 'fulfillment',
            }],
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // STANDARD MODE: Generate batch of fulfillment questions
    const leadSourcesText = previousAnswers.leadSources?.length 
      ? previousAnswers.leadSources.join(', ') 
      : 'not specified';
    
    const intakeMethodsText = previousAnswers.intakeMethods?.length 
      ? previousAnswers.intakeMethods.join(', ') 
      : 'not specified';
    
    const qualificationText = previousAnswers.qualificationCriteria?.length 
      ? previousAnswers.qualificationCriteria.join(', ') 
      : 'no formal qualification';
    
    const closeProcessText = previousAnswers.closeProcess || 'not specified';
    const fulfillmentStartText = previousAnswers.fulfillmentStart || 'not specified';

    const existingNodesText = existingNodes.length > 0
      ? existingNodes.map(n => `${n.type}: ${n.label}`).join('\n- ')
      : 'none yet';

    const systemPrompt = `You are an expert business process analyst helping map a ${industry} business's fulfillment workflow.

Your task is to generate 2-4 targeted questions to understand what happens AFTER the sale closes.

The goal is to uncover:
1. Specific steps in their delivery/fulfillment process
2. Handoffs between people or systems
3. Customer communication touchpoints
4. Quality checks or follow-up procedures
5. Potential bottlenecks or drop-off points

Generate questions that are:
- Specific to the ${industry} industry
- Building upon what they've already told us
- Focused on actionable, mappable steps
- Phrased conversationally but professionally
- Using multi-select format with relevant options

Return a JSON array with 2-4 question objects. Each must have:
- id: unique string starting with "ai_fulfill_" followed by a number
- question: the question text (clear, conversational)
- type: one of "text", "select", "multi-select", "number", "yes-no" (prefer multi-select)
- options: array of strings (for select/multi-select, 4-7 options relevant to ${industry})
- hint: optional coaching hint for the sales rep
- followUpNodeType: optional, one of "fulfillment", "handoff", "workflow", "review"

IMPORTANT: Return ONLY the JSON array, no other text.`;

    const userPrompt = `Business context:
- Industry: ${industry}
- Lead sources: ${leadSourcesText}
- Intake methods: ${intakeMethodsText}
- Qualification criteria: ${qualificationText}
- Close process: ${closeProcessText}
- What they said happens after close: ${fulfillmentStartText}

Existing workflow nodes:
- ${existingNodesText}

Based on this context, generate 2-4 follow-up questions to deeply understand their fulfillment process. Focus on the "what happens next?" chain of events. Use multi-select questions with industry-specific options.`;

    console.log("[generate-questions] Calling Lovable AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[generate-questions] AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("[generate-questions] AI response received");

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let questions: GeneratedQuestion[];
    try {
      // Clean up the response (remove markdown code blocks if present)
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();

      questions = JSON.parse(cleanContent);
      
      if (!Array.isArray(questions)) {
        throw new Error("Response is not an array");
      }

      // Validate and sanitize each question
      questions = questions.map((q, i) => ({
        id: q.id || `ai_fulfill_${i + 1}`,
        question: String(q.question || ""),
        type: ['text', 'select', 'multi-select', 'number', 'yes-no'].includes(q.type) 
          ? q.type 
          : 'multi-select',
        options: Array.isArray(q.options) ? q.options.map(String) : undefined,
        hint: q.hint ? String(q.hint) : undefined,
        followUpNodeType: q.followUpNodeType ? String(q.followUpNodeType) : undefined,
      })).filter(q => q.question.length > 0);

      console.log("[generate-questions] Parsed", questions.length, "questions");

    } catch (parseError) {
      console.error("[generate-questions] Failed to parse AI response:", parseError);
      console.log("[generate-questions] Raw content:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    return new Response(
      JSON.stringify({ questions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[generate-questions] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        questions: [] // Return empty array so client can use fallback
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
