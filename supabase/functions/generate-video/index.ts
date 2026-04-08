// generate-video — Fal.ai Kling 3.0 image-to-video for Design Studio.
// Animates a still image into a 5s/10s looping clip. Used by the "Animate"
// action on an image layer.
//
// Request:
//   {
//     imageUrl: string,       // source frame
//     prompt?: string,        // motion description
//     duration?: 5 | 10,
//     aspect?: '1:1' | '9:16' | '4:5' | '16:9',
//   }
//
// Response: { video: { url: string; duration: number } }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, errorResponse, falRun, json } from "../_shared/ai.ts";

interface GenerateVideoRequest {
  imageUrl: string;
  prompt?: string;
  duration?: 5 | 10;
  aspect?: "1:1" | "9:16" | "4:5" | "16:9";
}

interface FalVideoResult {
  video?: { url: string; duration?: number };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as GenerateVideoRequest;
    if (!body.imageUrl) {
      return errorResponse("imageUrl is required", 400);
    }

    const duration = body.duration ?? 5;
    const prompt = body.prompt ?? "Subtle cinematic motion, gentle camera drift, soft parallax";
    const aspectRatio = body.aspect === "9:16" ? "9:16"
      : body.aspect === "4:5" ? "4:5"
      : body.aspect === "16:9" ? "16:9"
      : "1:1";

    console.log("[generate-video]", { duration, prompt: prompt.slice(0, 80) });

    // Fal's Kling v1.6 / v2 standard image-to-video endpoint.
    const result = await falRun<FalVideoResult>(
      "fal-ai/kling-video/v1.6/standard/image-to-video",
      {
        image_url: body.imageUrl,
        prompt,
        duration: String(duration),
        aspect_ratio: aspectRatio,
      },
      { timeoutMs: 300_000, pollMs: 3000 },
    );

    const video = result.video;
    if (!video?.url) return errorResponse("Fal returned no video", 502);

    return json({
      video: { url: video.url, duration: video.duration ?? duration },
    });
  } catch (err) {
    console.error("[generate-video] error:", err);
    return errorResponse(err instanceof Error ? err.message : "Unknown error", 500);
  }
});
