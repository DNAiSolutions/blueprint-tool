import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GHL_WEBHOOK_SECRET = Deno.env.get("GHL_WEBHOOK_SECRET") ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface EventRouting {
  agent: string;
  taskType: string;
}

const EVENT_ROUTES: Record<string, EventRouting> = {
  "contact.created": { agent: "sales-agent", taskType: "enrich_lead" },
  "opportunity.stageChanged": { agent: "ceo", taskType: "update_pipeline" },
  "payment.received": { agent: "ops-monitor", taskType: "activate_onboarding" },
  "appointment.booked": { agent: "ceo", taskType: "prep_for_call" },
  "form.submitted": { agent: "intake-processor", taskType: "process_intake" },
};

// Events that should be logged but not create tasks
const LOG_ONLY_EVENTS = new Set(["conversation.updated"]);

Deno.serve(async (req: Request) => {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate webhook secret
  const webhookSecret = req.headers.get("x-webhook-secret") ?? "";
  if (GHL_WEBHOOK_SECRET && webhookSecret !== GHL_WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const eventType = (body.event_type as string) ?? (body.type as string) ?? "unknown";
  const source = (body.source as string) ?? "ghl";

  // 1. Log the webhook event
  const { data: webhookEvent, error: insertError } = await supabase
    .from("webhook_events")
    .insert({
      source,
      event_type: eventType,
      payload: body,
      processed: false,
    })
    .select()
    .single();

  if (insertError || !webhookEvent) {
    return new Response(
      JSON.stringify({ error: "Failed to log webhook event", detail: insertError?.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // 2. Route to agent task if applicable
  const routing = EVENT_ROUTES[eventType];

  if (routing) {
    try {
      const { data: agentTask, error: taskError } = await supabase
        .from("agent_tasks")
        .insert({
          agent_id: routing.agent,
          task_type: routing.taskType,
          priority: "medium",
          status: "queued",
          client_id: (body.client_id as string) ?? null,
          input_payload: body,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Mark webhook event as processed and link the task
      await supabase
        .from("webhook_events")
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
          agent_task_id: agentTask.id,
        })
        .eq("id", webhookEvent.id);

      return new Response(
        JSON.stringify({
          success: true,
          webhook_event_id: webhookEvent.id,
          agent_task_id: agentTask.id,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error creating agent task";

      // Mark webhook event with processing error
      await supabase
        .from("webhook_events")
        .update({
          processing_error: errorMessage,
          processed_at: new Date().toISOString(),
        })
        .eq("id", webhookEvent.id);

      return new Response(
        JSON.stringify({
          success: false,
          webhook_event_id: webhookEvent.id,
          error: errorMessage,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  // Log-only events (conversation.updated, etc.)
  if (LOG_ONLY_EVENTS.has(eventType)) {
    await supabase
      .from("webhook_events")
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
      })
      .eq("id", webhookEvent.id);
  }

  return new Response(
    JSON.stringify({
      success: true,
      webhook_event_id: webhookEvent.id,
      routed: false,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
