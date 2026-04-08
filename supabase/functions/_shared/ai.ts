// Shared helpers for Design Studio Phase 2 edge functions.
// - CORS headers
// - Typed Fal.ai client (queue-based submit + poll)
// - Typed Anthropic Claude client (messages + vision)
//
// This file intentionally has no side effects at import time and uses only
// Deno.env at request time so missing keys degrade gracefully.

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function errorResponse(message: string, status = 500): Response {
  return json({ error: message }, status);
}

/**
 * Strip query strings (which may hold signed Supabase Storage tokens)
 * so we can log URLs without leaking credentials.
 */
export function safeUrlForLog(url: string): string {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    return "[unparseable-url]";
  }
}

// ---------- Fal.ai ----------
// Fal.ai uses a queue-based API. We submit a job, then poll until done.
// Docs: https://fal.ai/docs/reference/rest

const FAL_BASE = "https://queue.fal.run";

function requireFalKey(): string {
  const key = Deno.env.get("FAL_KEY");
  if (!key) throw new Error("FAL_KEY is not configured in Supabase secrets");
  return key;
}

export async function falRun<T = unknown>(
  model: string,
  input: Record<string, unknown>,
  opts: { timeoutMs?: number; pollMs?: number } = {},
): Promise<T> {
  const key = requireFalKey();
  const timeoutMs = opts.timeoutMs ?? 180_000;
  const pollMs = opts.pollMs ?? 1500;

  // 1. Submit
  const submitRes = await fetch(`${FAL_BASE}/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!submitRes.ok) {
    const body = await submitRes.text();
    throw new Error(`Fal submit failed: ${submitRes.status} ${body}`);
  }

  const submitData = await submitRes.json();
  const requestId = submitData.request_id as string | undefined;
  if (!requestId) throw new Error("Fal submit did not return request_id");

  const statusUrl = `${FAL_BASE}/${model}/requests/${requestId}/status`;
  const resultUrl = `${FAL_BASE}/${model}/requests/${requestId}`;

  // 2. Poll
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    await new Promise((r) => setTimeout(r, pollMs));
    const statusRes = await fetch(statusUrl, {
      headers: { Authorization: `Key ${key}` },
    });
    if (!statusRes.ok) continue;
    const status = await statusRes.json();
    if (status.status === "COMPLETED") {
      const resultRes = await fetch(resultUrl, {
        headers: { Authorization: `Key ${key}` },
      });
      if (!resultRes.ok) {
        throw new Error(`Fal result fetch failed: ${resultRes.status}`);
      }
      return (await resultRes.json()) as T;
    }
    if (status.status === "FAILED") {
      throw new Error(`Fal job failed: ${JSON.stringify(status)}`);
    }
  }
  throw new Error(`Fal job timed out after ${timeoutMs}ms`);
}

// ---------- Anthropic Claude ----------

const ANTHROPIC_BASE = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-4-5-20250929";

function requireAnthropicKey(): string {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new Error("ANTHROPIC_API_KEY is not configured in Supabase secrets");
  return key;
}

export type ClaudeTextBlock = { type: "text"; text: string };
export type ClaudeImageBlock = {
  type: "image";
  source: { type: "base64"; media_type: string; data: string }
    | { type: "url"; url: string };
};
export type ClaudeContentBlock = ClaudeTextBlock | ClaudeImageBlock;

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string | ClaudeContentBlock[];
}

export interface ClaudeRequestOptions {
  system?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export async function claudeComplete(
  messages: ClaudeMessage[],
  opts: ClaudeRequestOptions = {},
): Promise<string> {
  const key = requireAnthropicKey();
  const res = await fetch(ANTHROPIC_BASE, {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model ?? DEFAULT_MODEL,
      max_tokens: opts.maxTokens ?? 2000,
      temperature: opts.temperature ?? 0.7,
      system: opts.system,
      messages,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Claude error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const blocks = (data.content ?? []) as Array<{ type: string; text?: string }>;
  return blocks
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

// Parse fenced JSON from a Claude response. Claude loves wrapping in ```json.
export function parseJsonFromClaude<T = unknown>(raw: string): T {
  let s = raw.trim();
  if (s.startsWith("```json")) s = s.slice(7);
  else if (s.startsWith("```")) s = s.slice(3);
  if (s.endsWith("```")) s = s.slice(0, -3);
  s = s.trim();
  // Sometimes Claude puts prose before the JSON — slice from first { or [.
  const firstBrace = Math.min(
    ...["{", "["].map((c) => {
      const i = s.indexOf(c);
      return i === -1 ? Infinity : i;
    }),
  );
  if (firstBrace !== Infinity && firstBrace > 0) s = s.slice(firstBrace);
  return JSON.parse(s) as T;
}
