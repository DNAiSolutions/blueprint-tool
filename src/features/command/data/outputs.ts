// Outputs tab — artifacts produced by the workflows.
//
// Seeded sample data representing what each workflow ships. In production
// this becomes a Supabase table (workflow_outputs) populated by the agents
// themselves. The shape here is designed to map 1:1 to that future table.

export type OutputType =
  | "doc"
  | "video"
  | "carousel"
  | "caption"
  | "script"
  | "thumbnail"
  | "email"
  | "portal"
  | "design";

export type OutputStatus = "draft" | "in_review" | "approved" | "shipped";

export type WorkflowOutput = {
  id: string;
  workflow: string;
  agent: string;
  title: string;
  type: OutputType;
  status: OutputStatus;
  summary: string;
  producedAt: string; // ISO
  url?: string;
};

export const OUTPUT_TYPE_META: Record<OutputType, { label: string; color: string; icon: string }> = {
  doc:        { label: "Document", color: "#4A82E8", icon: "📄" },
  video:      { label: "Video",    color: "#7E5BDC", icon: "🎬" },
  carousel:   { label: "Carousel", color: "#14E0E0", icon: "🖼️" },
  caption:    { label: "Caption",  color: "#14E0E0", icon: "✍️" },
  script:     { label: "Script",   color: "#14E0E0", icon: "📝" },
  thumbnail:  { label: "Thumbnail",color: "#7E5BDC", icon: "🎨" },
  email:      { label: "Email",    color: "#4A82E8", icon: "✉️" },
  portal:     { label: "Portal",   color: "#4A82E8", icon: "🛠️" },
  design:     { label: "Design",   color: "#7E5BDC", icon: "🎨" },
};

export const STATUS_META: Record<OutputStatus, { label: string; color: string }> = {
  draft:     { label: "Draft",     color: "#606080" },
  in_review: { label: "In Review", color: "#FFB547" },
  approved:  { label: "Approved",  color: "#14E0E0" },
  shipped:   { label: "Shipped",   color: "#7E5BDC" },
};

// A week of sample outputs — one rep per workflow so every card has content.
// When the real table lands these get replaced by a Supabase query.
const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600 * 1000).toISOString();

export const OUTPUTS: WorkflowOutput[] = [
  // Blueprint → Deal Documents
  {
    id: "out-001",
    workflow: "blueprint-to-deal",
    agent: "ceo",
    title: "Proposal — Krewe of Dage",
    type: "doc",
    status: "approved",
    summary:
      "Full-system proposal with pricing tiers for event-activation automation: intake → waiver → check-in → reporting.",
    producedAt: hoursAgo(2),
  },
  {
    id: "out-002",
    workflow: "blueprint-to-deal",
    agent: "ceo",
    title: "SOW — Krewe of Dage v1",
    type: "doc",
    status: "in_review",
    summary: "Scope of work: 6 deliverables, 4 milestones, payment schedule. Awaiting Daysha sign-off before send.",
    producedAt: hoursAgo(2),
  },
  {
    id: "out-003",
    workflow: "blueprint-to-deal",
    agent: "ceo",
    title: "Service Agreement — Krewe of Dage",
    type: "doc",
    status: "draft",
    summary: "Final agreement template pre-filled with client details. Will generate after SOW is approved.",
    producedAt: hoursAgo(1),
  },

  // Weekly Content Batch
  {
    id: "out-010",
    workflow: "weekly-content-batch",
    agent: "content-producer",
    title: "Reel #1 — \"Stop chasing content ideas\"",
    type: "script",
    status: "approved",
    summary: "Hook Method 2 (contrarian). Pillar: systems. 42s. Ready for AI clone generation.",
    producedAt: hoursAgo(30),
  },
  {
    id: "out-011",
    workflow: "weekly-content-batch",
    agent: "content-producer",
    title: "Reel #2 — \"The $500/mo audit trick\"",
    type: "video",
    status: "shipped",
    summary: "HeyGen clone rendered, Remotion captions burned. Handed to Social Media Manager Mon 11:02am.",
    producedAt: hoursAgo(28),
  },
  {
    id: "out-012",
    workflow: "weekly-content-batch",
    agent: "content-producer",
    title: "Reel #3 — Case Study: contractor pipeline",
    type: "script",
    status: "draft",
    summary: "Long-form-to-reel adaptation. Waiting on b-roll from client portal before handoff to design.",
    producedAt: hoursAgo(26),
  },
  {
    id: "out-013",
    workflow: "weekly-content-batch",
    agent: "head-of-design",
    title: "Batch thumbnails — week of April 20",
    type: "thumbnail",
    status: "approved",
    summary: "7 YouTube thumbnails + 7 IG cover frames on brand gradient template. Passed design QA.",
    producedAt: hoursAgo(27),
  },

  // External Content → Flip Package
  {
    id: "out-020",
    workflow: "external-content-flip",
    agent: "content-repurposer",
    title: "Flip — HBR \"Why most AI rollouts stall\"",
    type: "carousel",
    status: "shipped",
    summary:
      "7-slide carousel adapting the HBR insight to service-biz ICP. Offer-to-Educate mode. Posted LinkedIn + IG.",
    producedAt: hoursAgo(8),
  },
  {
    id: "out-021",
    workflow: "external-content-flip",
    agent: "content-repurposer",
    title: "Flip — Alex Hormozi YT teardown",
    type: "script",
    status: "approved",
    summary: "Recreate mode. 90s reel script in Daysha's voice. Ready for Content Producer pickup.",
    producedAt: hoursAgo(12),
  },
  {
    id: "out-022",
    workflow: "external-content-flip",
    agent: "content-repurposer",
    title: "Flip — competitor newsletter breakdown",
    type: "email",
    status: "in_review",
    summary: "The Smelt — pulled the core frame, rebuilt as a Tuesday nurture email for lead pipeline.",
    producedAt: hoursAgo(6),
  },

  // Client Timelapse Video
  {
    id: "out-030",
    workflow: "client-timelapse",
    agent: "short-video-creator",
    title: "Timelapse — J&R Pressure Wash driveway",
    type: "video",
    status: "shipped",
    summary:
      "KIE.ai before/midway frames → 3 clips → FFmpeg merge w/ music bed. Vertical 9:16, caption written. Delivered 11:34am.",
    producedAt: hoursAgo(4),
  },
  {
    id: "out-031",
    workflow: "client-timelapse",
    agent: "short-video-creator",
    title: "Timelapse — GreenSide landscaping reveal",
    type: "video",
    status: "in_review",
    summary: "Midway frame flagged for re-gen — lighting mismatch. Re-running KIE image-to-image.",
    producedAt: hoursAgo(3),
  },

  // Client Onboarding → Go-Live
  {
    id: "out-040",
    workflow: "client-onboarding",
    agent: "doc-writer",
    title: "Welcome Pack — new client intake",
    type: "doc",
    status: "approved",
    summary: "Branded onboarding welcome doc with timeline, stakeholders, and kickoff agenda.",
    producedAt: hoursAgo(36),
  },
  {
    id: "out-041",
    workflow: "client-onboarding",
    agent: "head-of-design",
    title: "Brand Guide — client v1",
    type: "design",
    status: "approved",
    summary: "Color system, typography scale, logo variants, and component specs captured from brand intake call.",
    producedAt: hoursAgo(34),
  },
  {
    id: "out-042",
    workflow: "client-onboarding",
    agent: "custom-software-dev",
    title: "Client Portal — staging deploy",
    type: "portal",
    status: "in_review",
    summary: "Supabase + React portal: dashboard, brand vault, education hub, invoices. Passed codebase audit.",
    producedAt: hoursAgo(20),
    url: "https://staging.portal.example/krewe",
  },
  {
    id: "out-043",
    workflow: "client-onboarding",
    agent: "content-producer",
    title: "First 4 weeks of content — seeded",
    type: "script",
    status: "draft",
    summary: "28 pieces across pillar rotation. Scripts drafted; awaiting brand-guide approval before AI clone render.",
    producedAt: hoursAgo(18),
  },
];
