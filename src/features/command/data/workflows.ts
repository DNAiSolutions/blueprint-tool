export type Workflow = {
  id: string;
  name: string;
  description: string;
  agent: string;
  agentName: string;
  skills: { id: string; name: string; description: string }[];
};

export const WORKFLOWS: Workflow[] = [
  {
    id: "blueprint-to-deal",
    name: "Blueprint → Deal Documents",
    description: "Process a blueprint call transcript into a structured brief, then generate proposal + SOW + service agreement.",
    agent: "ceo",
    agentName: "CEO",
    skills: [
      { id: "align-discovery", name: "ALIGN Discovery", description: "Run the ALIGN framework on the call." },
      { id: "blueprint-processing", name: "Blueprint Processing", description: "Extract systems needed, timeline, budget, requirements." },
      { id: "generate-proposal", name: "Generate Proposal", description: "Turn the brief into a branded proposal document." },
      { id: "generate-sow", name: "Generate SOW", description: "Draft scope of work with deliverables and acceptance criteria." },
      { id: "generate-agreement", name: "Service Agreement", description: "Final agreement with payment terms and e-sign." },
    ],
  },
  {
    id: "weekly-content-batch",
    name: "Weekly Content Batch",
    description: "Produce 7 pieces of content across the pillar rotation — script, clone video, design handoff, schedule.",
    agent: "content-producer",
    agentName: "Content Producer",
    skills: [
      { id: "pillar-rotation", name: "Pillar Rotation", description: "Pick 7 topics balancing Educate / Case Study / POV." },
      { id: "viralish-scripting", name: "Viralish Scripting", description: "4 hook methods + reverse design process." },
      { id: "heygen-clone", name: "HeyGen + Eleven Labs", description: "Generate AI clone videos with matched voice." },
      { id: "remotion-motion", name: "Remotion Motion Graphics", description: "Captions, b-roll, pattern interrupts." },
      { id: "handoff-design", name: "Handoff to Design", description: "Package thumbnails + static brief for design." },
      { id: "handoff-distribution", name: "Handoff to Social", description: "Platform-specific captions for distribution." },
    ],
  },
  {
    id: "external-content-flip",
    name: "External Content → Flip Package",
    description: "Repurpose external content into a full DigitalDNA multi-format package.",
    agent: "content-repurposer",
    agentName: "Content Repurposer",
    skills: [
      { id: "ingest-source", name: "Ingest Source", description: "Pull transcript / article / PDF / social post." },
      { id: "extract-insight", name: "Extract Core Insight", description: "Find the single most valuable insight to rebuild." },
      { id: "select-mode", name: "Select Flip Mode", description: "Offer-to-Educate / Recreate / The Flip / The Smelt." },
      { id: "rebuild-voice", name: "Rebuild in Voice", description: "Rewrite for DigitalDNA ICP in Daysha's voice." },
      { id: "multi-format", name: "Multi-Format Output", description: "Reel, carousel, caption, long-form, email." },
    ],
  },
  {
    id: "client-timelapse",
    name: "Client Timelapse Video",
    description: "Turn a single after photo into a platform-ready transformation video.",
    agent: "short-video-creator",
    agentName: "Short Video Creator",
    skills: [
      { id: "ingest-after", name: "Ingest After Photo", description: "Receive finished project photo + brand context." },
      { id: "generate-before", name: "Generate Before / Midway", description: "KIE.ai image-to-image generation." },
      { id: "frames-to-video", name: "Frames → Video", description: "KIE.ai frames-to-video for transformation clips." },
      { id: "ffmpeg-merge", name: "FFmpeg Merge + Music", description: "Merge, music bed, vertical crop." },
      { id: "caption-ship", name: "Caption + Hand Off", description: "Platform caption, hand to Social Media Manager." },
    ],
  },
  {
    id: "client-onboarding",
    name: "Client Onboarding → Go-Live",
    description: "From signed agreement through build, handoff, and first campaign launch.",
    agent: "ceo",
    agentName: "CEO (orchestrator)",
    skills: [
      { id: "welcome-pack", name: "Welcome Pack", description: "Doc Writer generates branded onboarding doc." },
      { id: "brand-intake", name: "Brand Intake", description: "Head of Design captures brand + builds guide." },
      { id: "build-portal", name: "Build Portal", description: "Custom Software Dev builds client dashboard." },
      { id: "content-seed", name: "Content Seed", description: "Content Producer seeds first 4 weeks." },
      { id: "go-live-handoff", name: "Go-Live Handoff", description: "Doc Writer packages handoff; Social launches." },
    ],
  },
];
