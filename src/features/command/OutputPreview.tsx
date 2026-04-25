// OutputPreview — renders an output artifact inline based on its type.
//
// Shared between the card view (compact) and the full-screen lightbox.
// Unsupported types fall back to a neutral placeholder so the grid stays
// visually consistent.

import { useState } from "react";
import { Play } from "lucide-react";
import type { WorkflowOutput } from "./data/outputs";
import { OUTPUT_TYPE_META } from "./data/outputs";

type Size = "card" | "detail" | "lightbox";

export function OutputPreview({
  output,
  size = "card",
  onExpand,
}: {
  output: WorkflowOutput;
  size?: Size;
  onExpand?: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const isPlayable =
    output.type === "video" ||
    output.mimeType === "video/mp4" ||
    output.mimeType === "video/webm";

  const isImage =
    output.type === "image" ||
    output.type === "carousel" ||
    output.type === "thumbnail" ||
    output.type === "design" ||
    (output.mimeType?.startsWith("image/") ?? false);

  const isWebsiteLike = output.type === "website" || output.type === "portal";

  const containerClass =
    size === "card"
      ? "aspect-video w-full rounded-lg overflow-hidden relative bg-black/40"
      : size === "detail"
      ? "aspect-video w-full rounded-xl overflow-hidden relative bg-black/50"
      : "w-full rounded-xl overflow-hidden relative bg-black/70";

  // VIDEO
  if (isPlayable) {
    if (!output.fileUrl) {
      return (
        <PosterFallback
          output={output}
          containerClass={containerClass}
          label="Render pending"
        />
      );
    }
    if (size === "lightbox" || playing) {
      return (
        <div className={containerClass}>
          <video
            src={output.fileUrl}
            poster={output.thumbnailUrl}
            controls
            autoPlay={playing}
            className="w-full h-full object-contain bg-black"
          />
        </div>
      );
    }
    return (
      <button
        className={containerClass + " group"}
        onClick={(e) => {
          e.stopPropagation();
          if (onExpand) onExpand();
          else setPlaying(true);
        }}
        aria-label="Play video"
      >
        {output.thumbnailUrl && (
          <img
            src={output.thumbnailUrl}
            alt={output.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
          <div className="rounded-full p-3 bg-gradient-to-br from-[#14E0E0] to-[#7E5BDC] shadow-[0_0_24px_rgba(126,91,220,0.5)] group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
        </div>
        {output.metadata?.durationSec && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-mono text-white">
            {formatDuration(output.metadata.durationSec)}
          </div>
        )}
      </button>
    );
  }

  // IMAGE / DESIGN / CAROUSEL / THUMBNAIL
  if (isImage) {
    const src = output.fileUrl || output.thumbnailUrl;
    if (!src)
      return <PosterFallback output={output} containerClass={containerClass} label="Rendering" />;
    return (
      <button
        className={containerClass + " group"}
        onClick={(e) => {
          e.stopPropagation();
          onExpand?.();
        }}
        aria-label="View image"
      >
        <img
          src={src}
          alt={output.title}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
        />
      </button>
    );
  }

  // WEBSITE / PORTAL — prefer screenshot if we have one, otherwise embed iframe in lightbox
  if (isWebsiteLike) {
    if (size === "lightbox" && output.externalUrl) {
      return (
        <div className={containerClass + " aspect-video"}>
          <iframe
            src={output.externalUrl}
            className="w-full h-full"
            title={output.title}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      );
    }
    const src = output.thumbnailUrl || output.fileUrl;
    if (!src)
      return <PosterFallback output={output} containerClass={containerClass} label="Deploying" />;
    return (
      <button
        className={containerClass + " group"}
        onClick={(e) => {
          e.stopPropagation();
          onExpand?.();
        }}
        aria-label="View website preview"
      >
        <img
          src={src}
          alt={output.title}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
        />
        {output.externalUrl && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-[10px] font-mono text-[#14E0E0]">
            LIVE
          </div>
        )}
      </button>
    );
  }

  // DOC / SCRIPT / CAPTION / EMAIL — show text preview
  const body = output.metadata?.bodyText;
  if (body) {
    return (
      <div
        className={[
          containerClass,
          "bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 aspect-auto min-h-[120px] p-3 overflow-hidden",
        ].join(" ")}
        onClick={(e) => {
          e.stopPropagation();
          onExpand?.();
        }}
      >
        <pre className="text-[10px] text-slate-300 whitespace-pre-wrap leading-snug line-clamp-6 font-mono">
          {body}
        </pre>
      </div>
    );
  }

  return <PosterFallback output={output} containerClass={containerClass} />;
}

function PosterFallback({
  output,
  containerClass,
  label,
}: {
  output: WorkflowOutput;
  containerClass: string;
  label?: string;
}) {
  const tint = OUTPUT_TYPE_META[output.type].color;
  return (
    <div
      className={containerClass + " flex items-center justify-center"}
      style={{
        background: `linear-gradient(135deg, ${tint}18, ${tint}04 60%, rgba(0,0,0,0.4))`,
      }}
    >
      <div className="text-center">
        <div
          className="text-[10px] uppercase tracking-widest font-mono mb-1"
          style={{ color: tint }}
        >
          {OUTPUT_TYPE_META[output.type].label}
        </div>
        {label && <div className="text-[11px] text-slate-400">{label}</div>}
      </div>
    </div>
  );
}

function formatDuration(s: number): string {
  if (s < 60) return `0:${s.toString().padStart(2, "0")}`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
