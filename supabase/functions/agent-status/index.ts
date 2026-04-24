// agent-status
// ─────────────────────────────────────────────────────────────────────
// Live agent status endpoint for the Command Center.
//
// POST /functions/v1/agent-status
//   body: { agent: string, status: 'active'|'waiting'|'recent'|'idle'|'offline', task?: string }
//   → upserts into public.agent_status, returns { success: true }
//
// GET /functions/v1/agent-status
//   → returns { agents: [{agent_id,status,task,updated_at,ageMin,display_status}] }
//
// display_status derives "recent" from updated_at when an agent is idle
// but completed within the last 5 minutes — matches the RUBRIC spec.
//
// verify_jwt = false so hooks from any agent framework (Claude Code,
// OpenClaw, Antigravity, external cron services) can POST without auth.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const VALID_STATUSES = new Set(["active", "waiting", "recent", "idle", "offline"]);
const IDLE_MS = 5 * 60 * 1000;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  if (req.method === "POST") {
    let body: { agent?: string; status?: string; task?: string };
    try {
      body = await req.json();
    } catch {
      return json({ error: "invalid json" }, 400);
    }
    const agent = (body.agent || "").toLowerCase().trim();
    const status = (body.status || "").toLowerCase().trim();
    const task = (body.task || "").slice(0, 200);

    if (!agent) return json({ error: "agent required" }, 400);
    if (!VALID_STATUSES.has(status)) return json({ error: "invalid status" }, 400);

    const { error } = await supabase
      .from("agent_status")
      .upsert(
        { agent_id: agent, status, task, updated_at: new Date().toISOString() },
        { onConflict: "agent_id" }
      );

    if (error) return json({ error: error.message }, 500);
    return json({ success: true });
  }

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("agent_status")
      .select("agent_id,status,task,updated_at")
      .order("updated_at", { ascending: false });

    if (error) return json({ error: error.message }, 500);

    const now = Date.now();
    const agents = (data || []).map((row) => {
      const updatedAt = new Date(row.updated_at).getTime();
      const ageMs = now - updatedAt;
      const ageMin = Math.max(0, Math.floor(ageMs / 60000));
      let displayStatus = row.status;
      if (row.status === "idle" && ageMs < IDLE_MS && updatedAt > 0) {
        displayStatus = "recent";
      }
      return {
        agent_id: row.agent_id,
        status: row.status,
        display_status: displayStatus,
        task: row.task,
        updated_at: row.updated_at,
        ageMin,
      };
    });
    return json({ agents, timestamp: now });
  }

  return json({ error: "method not allowed" }, 405);
});
