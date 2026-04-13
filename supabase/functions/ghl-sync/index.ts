// ghl-sync — Fetches pipelines, opportunities, and workflows from a GHL subaccount.
//
// Request:
//   GET ?action=pipelines&locationId=xxx
//   GET ?action=opportunities&pipelineId=xxx&locationId=xxx
//   GET ?action=workflows&locationId=xxx
//
// Response: JSON from GHL API v2

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GHL_BASE = "https://services.leadconnectorhq.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("GHL_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "GHL_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const locationId = url.searchParams.get("locationId");

  if (!action || !locationId) {
    return new Response(
      JSON.stringify({ error: "action and locationId are required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Version: "2021-07-28",
    "Content-Type": "application/json",
  };

  try {
    let endpoint: string;

    switch (action) {
      case "pipelines":
        endpoint = `${GHL_BASE}/opportunities/pipelines?locationId=${locationId}`;
        break;
      case "opportunities": {
        const pipelineId = url.searchParams.get("pipelineId");
        if (!pipelineId) {
          return new Response(
            JSON.stringify({ error: "pipelineId required for opportunities" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        endpoint = `${GHL_BASE}/opportunities/search?location_id=${locationId}&pipeline_id=${pipelineId}`;
        break;
      }
      case "workflows":
        endpoint = `${GHL_BASE}/workflows/?locationId=${locationId}`;
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    console.log(`[ghl-sync] ${action} → ${endpoint}`);

    const res = await fetch(endpoint, { headers });
    const data = await res.json();

    if (!res.ok) {
      console.error(`[ghl-sync] GHL API error ${res.status}:`, data);
      return new Response(
        JSON.stringify({ error: "GHL API error", status: res.status, details: data }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[ghl-sync] error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
