export type CommandAgent = {
  id: string;
  name: string;
  color: string;
  icon: string;
  role: string;
  description: string;
  skills: string[];
};

export type TeamLead = CommandAgent & { badge: string };

export type AgentStatus = "active" | "waiting" | "recent" | "idle" | "offline";

export const MISSION =
  "We don't do marketing. We build the machine. DigitalDNA designs AI-powered content systems, marketing automation, and digital infrastructure that generate predictable revenue for service-based businesses — so owners stop surviving and start scaling.";

export const TEAM_LEAD: TeamLead = {
  id: "ceo",
  name: "CEO",
  badge: "Lead",
  role: "Strategy, Sales & Orchestration",
  description:
    "The orchestrator. Runs the ALIGN discovery sales framework, processes blueprint briefs into deal docs, handles strategy + delegation, and keeps the whole agent team shipping against mission priorities. Reports directly to Daysha.",
  skills: [
    "ALIGN Sales System",
    "Blueprint Processing",
    "Deal Documents",
    "Strategy",
    "Orchestration",
    "Delegation",
    "Prioritization",
  ],
  icon: "Crown",
  color: "#7E5BDC",
};

export const AGENTS: CommandAgent[] = [
  {
    id: "content-producer",
    name: "Content Producer",
    role: "Head of Content Production",
    description:
      "Scripts and produces video content for DigitalDNA + clients. Runs the Viralish reel framework, long-form YouTube production, AI clone videos (HeyGen + Eleven Labs), Remotion motion graphics, and the weekly 7-script batch workflow.",
    skills: [
      "Reel Scripting",
      "Long-Form Video",
      "AI Clone Production",
      "HeyGen",
      "Eleven Labs",
      "Remotion",
      "Weekly Batching",
      "Hook Architecture",
    ],
    icon: "Spark",
    color: "#14E0E0",
  },
  {
    id: "content-repurposer",
    name: "Content Repurposer",
    role: "Head of Content Intelligence",
    description:
      "Transforms external content (YouTube, transcripts, articles, PDFs, competitor posts) into DigitalDNA-branded multi-format packages using the 5-Step Flip Framework. Modes: Offer-to-Educate, Recreate, The Flip, The Smelt.",
    skills: ["Flip Framework", "Offer-to-Educate", "Recreate Mode", "The Smelt", "Multi-Format Packaging", "ICP Translation"],
    icon: "Drift",
    color: "#4A82E8",
  },
  {
    id: "head-of-design",
    name: "Head of Design",
    role: "Creative Direction & Brand Identity",
    description:
      "Creative director for DigitalDNA + clients. Owns brand identity systems, UI/UX specs, marketing visuals, ad creatives, and design QA. Produces brand guides, component specs, wireframes, and creative production briefs.",
    skills: ["Brand Identity", "Design Systems", "UI/UX Specs", "Creative Production", "Ad Creatives", "Figma Specs", "Design QA"],
    icon: "Apex",
    color: "#7E5BDC",
  },
  {
    id: "social-media-manager",
    name: "Social Media Manager",
    role: "Distribution & Engagement",
    description:
      "Schedules and distributes content across IG, LinkedIn, TikTok, YouTube. Handles platform-specific formatting, hashtag strategy, engagement monitoring, and weekly performance reports.",
    skills: ["Scheduling", "Platform Formatting", "Engagement Tracking", "Performance Reporting", "Algorithm Optimization", "Hashtag Strategy"],
    icon: "Orb",
    color: "#14E0E0",
  },
  {
    id: "social-media-designer",
    name: "Social Media Designer",
    role: "Social Visual Production",
    description:
      "Designs scroll-stopping social content — carousels (7-slide narrative framework), static ads, brand graphics — using Nano Banana AI image generation and Canva integration. Ships work through a built-in Quality Agent.",
    skills: ["Carousel Framework", "Nano Banana", "KIE.ai", "Canva", "Static Ads", "Quality Review"],
    icon: "Rune",
    color: "#4A82E8",
  },
  {
    id: "short-video-creator",
    name: "Short Video Creator",
    role: "Timelapse & Transformation Video",
    description:
      "Creates viral AI timelapse transformation videos from a single after photo for local service businesses. Runs KIE.ai image-to-image + frames-to-video, FFmpeg merge, music, and platform-ready vertical output with captions.",
    skills: ["Timelapse Video", "KIE.ai Image-to-Image", "Frames-to-Video", "FFmpeg", "Vertical Formatting", "Caption Writing"],
    icon: "Phantom",
    color: "#7E5BDC",
  },
  {
    id: "doc-writer",
    name: "Doc Writer",
    role: "SOPs, Handoffs & Client Docs",
    description:
      "Writes SOPs, client-facing documentation, training materials, handoff guides, and onboarding welcome docs. Produces annotated step-by-step guides and client-ready process documentation.",
    skills: ["SOP Writing", "Client Handoff Docs", "Training Materials", "Onboarding Docs", "Screenshot Annotation", "Process Documentation"],
    icon: "Sentinel",
    color: "#14E0E0",
  },
  {
    id: "custom-software-dev",
    name: "Custom Software Dev",
    role: "Portals, Dashboards & AI Tools",
    description:
      "Builds custom dashboards, portals, AI agents, and internal tools using Claude Code + Lovable + Supabase. Handles React/TypeScript frontends, Supabase backends, API integrations. Reports to the Website Builder.",
    skills: ["React/TypeScript", "Supabase", "Lovable", "API Integrations", "Codebase Audit", "Feature Development"],
    icon: "Fortress",
    color: "#4A82E8",
  },
];

export const ALL_AGENTS: CommandAgent[] = [TEAM_LEAD, ...AGENTS];

export function getAgent(id: string): CommandAgent | undefined {
  return ALL_AGENTS.find((a) => a.id === id);
}
