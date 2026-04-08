// copilot-edit — Claude-powered natural language layer editor.
// Takes an instruction like "make the headline bigger and move it up"
// and returns a set of structured patches the client can apply to the
// selected card's layers.
//
// Request:
//   {
//     instruction: string,
//     card: Card,              // full card JSON (layers + background)
//     selectedLayerId?: string // optional focus
//     brandColors?: Record<string, string>
//   }
//
// Response:
//   {
//     patches: Array<{
//       op: 'update' | 'add' | 'delete',
//       layerId?: string,
//       layer?: Layer,         // for add
//       updates?: Partial<Layer> // for update
//     }>,
//     explanation: string
//   }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  claudeComplete,
  corsHeaders,
  errorResponse,
  json,
  parseJsonFromClaude,
} from "../_shared/ai.ts";

interface CopilotRequest {
  instruction: string;
  card: unknown;
  selectedLayerId?: string;
  brandColors?: Record<string, string>;
}

interface Patch {
  op: "update" | "add" | "delete";
  layerId?: string;
  layer?: unknown;
  updates?: Record<string, unknown>;
}

interface CopilotResponse {
  patches: Patch[];
  explanation: string;
}

const SYSTEM_PROMPT = `You are the Design Studio Copilot — an expert designer who
edits a single social media card based on natural language instructions.

You will receive:
- The full card JSON (width, height, background, layers[])
- The user's instruction
- Optionally a selectedLayerId the user is focused on
- Optionally the active brand colors

Layer types available:
- solid       { color }
- gradient    { stops[{color,position}], angle }
- liquid-glass{ baseColor, blur, x, y, w, h }
- image       { url, x, y, w, h, rotation, flipH, flipV, opacity, blend }
- video       { url, x, y, w, h, loop, muted, opacity, playbackRate }
- text        { content, font, size, weight, color, align, italic, x, y, w, letterSpacing, lineHeight }
- overlay-gradient { from, to, direction: 'top'|'bottom'|'left'|'right'|'radial' }
- noise       { intensity: 0-1 }
- vignette    { intensity: 0-1 }

Positioned layers use integer pixel coordinates within card.width × card.height.

Return ONLY valid JSON (no prose, no code fences) matching:
{
  "patches": [
    { "op": "update", "layerId": "...", "updates": { ... } },
    { "op": "add", "layer": { "id": "layer-ai-...", "type": "...", ... } },
    { "op": "delete", "layerId": "..." }
  ],
  "explanation": "one-sentence summary of what you changed"
}

Rules:
- Keep changes minimal and targeted. Don't rewrite layers you weren't asked to touch.
- Preserve layer IDs on updates. New layers must get a unique ID starting with "layer-ai-".
- Respect brand colors if provided — prefer them over inventing new hexes.
- Text size should be readable: headlines 80-180pt, body 32-56pt on a 1080×1080 card.
- Position coordinates must stay within the card bounds.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as CopilotRequest;
    if (!body.instruction) return errorResponse("instruction is required", 400);
    if (!body.card) return errorResponse("card is required", 400);

    console.log("[copilot-edit]", { instruction: body.instruction.slice(0, 120) });

    const userContent = JSON.stringify(
      {
        instruction: body.instruction,
        selectedLayerId: body.selectedLayerId ?? null,
        brandColors: body.brandColors ?? null,
        card: body.card,
      },
      null,
      2,
    );

    const raw = await claudeComplete(
      [{ role: "user", content: userContent }],
      { system: SYSTEM_PROMPT, maxTokens: 3000, temperature: 0.4 },
    );

    let parsed: CopilotResponse;
    try {
      parsed = parseJsonFromClaude<CopilotResponse>(raw);
    } catch (parseErr) {
      console.error("[copilot-edit] parse error:", parseErr, "raw:", raw.slice(0, 400));
      return errorResponse("Copilot returned malformed JSON", 502);
    }

    if (!Array.isArray(parsed.patches)) parsed.patches = [];
    parsed.explanation = parsed.explanation ?? "Applied requested changes.";

    return json(parsed);
  } catch (err) {
    console.error("[copilot-edit] error:", err);
    return errorResponse(err instanceof Error ? err.message : "Unknown error", 500);
  }
});
