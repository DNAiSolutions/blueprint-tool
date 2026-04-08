// analyze-image — Claude Vision analysis of inspiration images.
// Used by the "Inspire" feature to reverse-engineer color palettes,
// typography vibes, and layout strategies from a reference image.
//
// Request:  { imageUrl: string; purpose?: 'palette' | 'layout' | 'full' }
// Response: { analysis: { palette: string[]; mood: string; layout: string;
//                         fonts: string; notes: string } }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  claudeComplete,
  corsHeaders,
  errorResponse,
  json,
  parseJsonFromClaude,
} from "../_shared/ai.ts";

interface AnalyzeRequest {
  imageUrl: string;
  purpose?: "palette" | "layout" | "full";
}

interface Analysis {
  palette: string[];
  mood: string;
  layout: string;
  fonts: string;
  notes: string;
}

const SYSTEM_PROMPT = `You are an expert art director analyzing design inspiration.
Given a reference image, extract the visual DNA so a designer can recreate the
vibe in a new composition.

Return ONLY valid JSON matching this exact shape:
{
  "palette": ["#HEX","#HEX","#HEX","#HEX","#HEX"],
  "mood": "one-sentence emotional description",
  "layout": "brief layout strategy (grid, rule of thirds, negative space usage, focal point)",
  "fonts": "font pairing suggestion (display + body)",
  "notes": "2-3 sentences on what makes this work — specific, actionable"
}

No markdown, no prose, no code fences. Exactly 5 hex colors in the palette.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as AnalyzeRequest;
    if (!body.imageUrl) return errorResponse("imageUrl is required", 400);

    console.log("[analyze-image]", { imageUrl: body.imageUrl.slice(0, 120) });

    const raw = await claudeComplete(
      [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "url", url: body.imageUrl },
            },
            {
              type: "text",
              text: body.purpose === "palette"
                ? "Focus on the color palette and mood. Still return the full JSON shape."
                : body.purpose === "layout"
                ? "Focus on layout strategy and typography. Still return the full JSON shape."
                : "Extract the full visual DNA.",
            },
          ],
        },
      ],
      { system: SYSTEM_PROMPT, maxTokens: 1200, temperature: 0.5 },
    );

    let analysis: Analysis;
    try {
      analysis = parseJsonFromClaude<Analysis>(raw);
    } catch (parseErr) {
      console.error("[analyze-image] parse error:", parseErr, "raw:", raw);
      return errorResponse("Claude returned malformed JSON", 502);
    }

    // Sanitize — ensure palette is exactly 5 hex strings
    if (!Array.isArray(analysis.palette)) analysis.palette = [];
    analysis.palette = analysis.palette
      .filter((c) => typeof c === "string" && /^#?[0-9a-f]{3,8}$/i.test(c))
      .map((c) => (c.startsWith("#") ? c : `#${c}`))
      .slice(0, 5);

    return json({ analysis });
  } catch (err) {
    console.error("[analyze-image] error:", err);
    return errorResponse(err instanceof Error ? err.message : "Unknown error", 500);
  }
});
