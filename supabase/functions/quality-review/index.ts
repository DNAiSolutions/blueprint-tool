// quality-review — Claude Vision quality agent for finished cards.
// Takes a rendered card (as a URL or base64 screenshot) + the card JSON
// and returns a structured critique: score, strengths, fixes, auto-patches.
//
// Request:
//   {
//     imageUrl?: string,            // URL to rendered PNG (preferred)
//     imageBase64?: string,         // or base64 data (without data: prefix)
//     mediaType?: string,           // e.g. 'image/png' (for base64 mode)
//     card: Card,                   // card JSON for context
//     audience?: string,            // e.g. 'local service business owners'
//     platform?: 'instagram'|'tiktok'|'linkedin'|'facebook',
//   }
//
// Response:
//   {
//     score: number,                // 0-100
//     verdict: 'ship'|'revise'|'rebuild',
//     strengths: string[],
//     fixes: Array<{ priority: 'high'|'medium'|'low', issue: string, suggestion: string }>,
//     autoPatches?: Patch[]         // optional — same shape as copilot-edit
//   }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  claudeComplete,
  type ClaudeContentBlock,
  corsHeaders,
  errorResponse,
  json,
  parseJsonFromClaude,
} from "../_shared/ai.ts";

interface QualityRequest {
  imageUrl?: string;
  imageBase64?: string;
  mediaType?: string;
  card: unknown;
  audience?: string;
  platform?: "instagram" | "tiktok" | "linkedin" | "facebook";
}

interface QualityResponse {
  score: number;
  verdict: "ship" | "revise" | "rebuild";
  strengths: string[];
  fixes: Array<{
    priority: "high" | "medium" | "low";
    issue: string;
    suggestion: string;
  }>;
  autoPatches?: unknown[];
}

const SYSTEM_PROMPT = `You are the Design Studio Quality Agent — a ruthless but
fair art director reviewing a finished social media card.

Judge by these criteria (weight each roughly equally):
1. HIERARCHY — is the eye led to one clear focal point?
2. LEGIBILITY — is every word readable at thumbnail size?
3. CONTRAST — does the text pop off the background?
4. BALANCE — does the composition feel intentional, not random?
5. BRAND — does it feel on-brand and not generic?
6. EMOTION — does it stop the scroll?
7. PLATFORM FIT — does it work on the target platform at thumbnail size?

Return ONLY valid JSON matching:
{
  "score": 0-100,
  "verdict": "ship" | "revise" | "rebuild",
  "strengths": ["...", "..."],
  "fixes": [
    { "priority": "high"|"medium"|"low", "issue": "...", "suggestion": "..." }
  ],
  "autoPatches": []
}

Verdict rules:
- 85+ = ship
- 65-84 = revise (list fixes)
- <65 = rebuild (list fixes, suggest different direction in notes)

Fixes must be specific and actionable — not "improve contrast" but
"lower the background overlay opacity to 0.35 so the red pops".
autoPatches is optional — include only if you can suggest concrete layer
patches following the same format as the copilot-edit tool.

No prose, no markdown, no code fences.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as QualityRequest;
    if (!body.card) return errorResponse("card is required", 400);
    if (!body.imageUrl && !body.imageBase64) {
      return errorResponse("imageUrl or imageBase64 is required", 400);
    }

    console.log("[quality-review]", {
      platform: body.platform,
      audience: body.audience,
      hasUrl: !!body.imageUrl,
    });

    const imageBlock: ClaudeContentBlock = body.imageUrl
      ? { type: "image", source: { type: "url", url: body.imageUrl } }
      : {
          type: "image",
          source: {
            type: "base64",
            media_type: body.mediaType ?? "image/png",
            data: body.imageBase64!,
          },
        };

    const context = JSON.stringify(
      {
        audience: body.audience ?? "general audience",
        platform: body.platform ?? "instagram",
        card: body.card,
      },
      null,
      2,
    );

    const raw = await claudeComplete(
      [
        {
          role: "user",
          content: [
            imageBlock,
            {
              type: "text",
              text: `Review this card for the following context:\n\n${context}`,
            },
          ],
        },
      ],
      { system: SYSTEM_PROMPT, maxTokens: 2500, temperature: 0.4 },
    );

    let parsed: QualityResponse;
    try {
      parsed = parseJsonFromClaude<QualityResponse>(raw);
    } catch (parseErr) {
      console.error("[quality-review] parse error:", parseErr, "raw:", raw.slice(0, 400));
      return errorResponse("Quality agent returned malformed JSON", 502);
    }

    // Clamp + sanity-check
    parsed.score = Math.max(0, Math.min(100, Number(parsed.score) || 0));
    if (!["ship", "revise", "rebuild"].includes(parsed.verdict)) {
      parsed.verdict = parsed.score >= 85 ? "ship" : parsed.score >= 65 ? "revise" : "rebuild";
    }
    if (!Array.isArray(parsed.strengths)) parsed.strengths = [];
    if (!Array.isArray(parsed.fixes)) parsed.fixes = [];

    return json(parsed);
  } catch (err) {
    console.error("[quality-review] error:", err);
    return errorResponse(err instanceof Error ? err.message : "Unknown error", 500);
  }
});
