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
}

interface GeneratedQuestion {
  id: string;
  question: string;
  type: 'text' | 'select' | 'multi-select' | 'number' | 'yes-no';
  options?: string[];
  hint?: string;
  followUpNodeType?: string;
}

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

    const { industry, currentStage, previousAnswers, existingNodes } = body;

    // Build context for the AI
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

Return a JSON array with 2-4 question objects. Each must have:
- id: unique string starting with "ai_fulfill_" followed by a number
- question: the question text (clear, conversational)
- type: one of "text", "select", "multi-select", "number", "yes-no"
- options: array of strings (only for select/multi-select, 3-6 options)
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

Based on this context, generate 2-4 follow-up questions to deeply understand their fulfillment process. Focus on the "what happens next?" chain of events.`;

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
          : 'text',
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
