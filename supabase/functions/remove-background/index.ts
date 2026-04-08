// remove-background — BRIA RMBG 2.0 via Fal.ai.
// Turns an image into a clean PNG cutout for layering on top of
// Design Studio backgrounds.
//
// Request:  { imageUrl: string }
// Response: { image: { url: string } }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, errorResponse, falRun, json } from "../_shared/ai.ts";

interface RemoveBgRequest {
  imageUrl: string;
}

interface FalBgResult {
  image?: { url: string };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as RemoveBgRequest;
    if (!body.imageUrl) return errorResponse("imageUrl is required", 400);

    console.log("[remove-background]", { imageUrl: body.imageUrl.slice(0, 120) });

    const result = await falRun<FalBgResult>("fal-ai/bria/background/remove", {
      image_url: body.imageUrl,
    });

    if (!result.image?.url) return errorResponse("Fal returned no image", 502);

    return json({ image: { url: result.image.url } });
  } catch (err) {
    console.error("[remove-background] error:", err);
    return errorResponse(err instanceof Error ? err.message : "Unknown error", 500);
  }
});
