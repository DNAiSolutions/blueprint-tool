// generate-image — Fal.ai image generation for Design Studio.
// Supports three models:
//   - nano-banana (Google's fast image model for backgrounds + photorealism)
//   - flux        (high-quality FLUX pro / dev for cinematic compositions)
//   - ideogram    (best for text/typography inside images)
//
// Request:
//   {
//     prompt: string,
//     model?: 'nano-banana' | 'flux' | 'ideogram',
//     aspect?: '1:1' | '9:16' | '4:5' | '16:9',
//     numImages?: number,
//     negativePrompt?: string,
//     seed?: number,
//     // Optional reference image for image-to-image
//     imageUrl?: string,
//   }
//
// Response: { images: { url: string; width: number; height: number }[] }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, errorResponse, falRun, json } from "../_shared/ai.ts";

type Model = "nano-banana" | "flux" | "ideogram";
type Aspect = "1:1" | "9:16" | "4:5" | "16:9";

interface GenerateImageRequest {
  prompt: string;
  model?: Model;
  aspect?: Aspect;
  numImages?: number;
  negativePrompt?: string;
  seed?: number;
  imageUrl?: string;
}

interface FalImage {
  url: string;
  width?: number;
  height?: number;
}

interface FalImageResult {
  images?: FalImage[];
  image?: FalImage;
}

// Map our aspect labels to the per-model input format.
function aspectToSize(aspect: Aspect): { width: number; height: number } {
  switch (aspect) {
    case "9:16": return { width: 1080, height: 1920 };
    case "4:5": return { width: 1080, height: 1350 };
    case "16:9": return { width: 1920, height: 1080 };
    case "1:1":
    default:
      return { width: 1080, height: 1080 };
  }
}

// FLUX Pro / Dev accepts named `image_size` enums — safer than a custom
// object. `4:5` has no exact enum so we fall back to `portrait_4_3` which
// is the closest shape.
function aspectToFluxSize(aspect: Aspect): string {
  switch (aspect) {
    case "9:16": return "portrait_16_9";
    case "4:5": return "portrait_4_3";
    case "16:9": return "landscape_16_9";
    case "1:1":
    default: return "square_hd";
  }
}

function modelToFalPath(model: Model, hasRef: boolean): string {
  switch (model) {
    case "nano-banana":
      // Nano Banana (Gemini image model). Use edit endpoint when ref is present.
      return hasRef
        ? "fal-ai/nano-banana/edit"
        : "fal-ai/nano-banana";
    case "ideogram":
      return "fal-ai/ideogram/v2";
    case "flux":
    default:
      return hasRef
        ? "fal-ai/flux/dev/image-to-image"
        : "fal-ai/flux-pro/v1.1";
  }
}

function buildFalInput(
  model: Model,
  body: GenerateImageRequest,
): Record<string, unknown> {
  const { prompt, aspect = "1:1", numImages = 1, negativePrompt, seed, imageUrl } = body;
  const { width, height } = aspectToSize(aspect);

  const base: Record<string, unknown> = {
    prompt,
    num_images: Math.max(1, Math.min(4, numImages)),
  };
  if (seed !== undefined) base.seed = seed;
  if (negativePrompt) base.negative_prompt = negativePrompt;

  if (model === "nano-banana") {
    // Nano Banana accepts `aspect_ratio` style.
    base.aspect_ratio =
      aspect === "1:1" ? "1:1"
      : aspect === "9:16" ? "9:16"
      : aspect === "4:5" ? "4:5"
      : "16:9";
    if (imageUrl) base.image_urls = [imageUrl];
    return base;
  }

  if (model === "ideogram") {
    // Ideogram v2 expects lowercase ratios like "1:1", "9:16", "16:9".
    // `4:5` isn't in the v2 enum — fall back to "3:4" which is the closest.
    base.aspect_ratio =
      aspect === "1:1" ? "1:1"
      : aspect === "9:16" ? "9:16"
      : aspect === "4:5" ? "3:4"
      : "16:9";
    base.style = "general";
    return base;
  }

  // FLUX — image_size is an enum string, not an object.
  base.image_size = aspectToFluxSize(aspect);
  if (imageUrl) {
    base.image_url = imageUrl;
    base.strength = 0.8;
  }
  // Width/height are unused by FLUX enum mode but surface the requested
  // logical size so the client has a fallback when the response omits them.
  void width;
  void height;
  return base;
}

function extractImages(result: FalImageResult): FalImage[] {
  if (Array.isArray(result.images) && result.images.length > 0) return result.images;
  if (result.image) return [result.image];
  return [];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as GenerateImageRequest;
    if (!body.prompt || typeof body.prompt !== "string") {
      return errorResponse("prompt is required", 400);
    }

    const model: Model = body.model ?? "flux";
    const falPath = modelToFalPath(model, Boolean(body.imageUrl));
    const input = buildFalInput(model, body);

    console.log("[generate-image]", { model, falPath, prompt: body.prompt.slice(0, 80) });

    const result = await falRun<FalImageResult>(falPath, input);
    const images = extractImages(result).map((img) => ({
      url: img.url,
      width: img.width ?? aspectToSize(body.aspect ?? "1:1").width,
      height: img.height ?? aspectToSize(body.aspect ?? "1:1").height,
    }));

    if (images.length === 0) {
      return errorResponse("Fal returned no images", 502);
    }

    return json({ images, model });
  } catch (err) {
    console.error("[generate-image] error:", err);
    return errorResponse(err instanceof Error ? err.message : "Unknown error", 500);
  }
});
