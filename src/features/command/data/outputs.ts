// Outputs — artifacts produced by the workflows.
//
// Every output row corresponds to a file an agent shipped. The shape here
// is the target Supabase table schema (workflow_outputs) — once the
// `workflow-run` edge function lands, agents + pipelines will populate
// this table and these seeded fixtures go away.
//
// `runId` groups outputs that came from the same workflow run, so the
// Outputs tab can render the whole pipeline (e.g. timelapse:
// before.jpg → midway.jpg → clip1.mp4 → final.mp4 + caption) as a
// single timeline instead of unrelated cards.

export type OutputType =
  | "doc"
  | "video"
  | "image"
  | "carousel"
  | "caption"
  | "script"
  | "thumbnail"
  | "email"
  | "portal"
  | "design"
  | "website";

export type OutputStatus = "draft" | "in_review" | "approved" | "shipped";

export type WorkflowOutput = {
  id: string;
  runId?: string;                // groups outputs from the same run
  stepIndex?: number;            // order within the run
  workflow: string;
  agent: string;
  title: string;
  type: OutputType;
  status: OutputStatus;
  summary: string;
  producedAt: string;            // ISO
  fileUrl?: string;              // signed storage URL or public URL
  mimeType?: string;             // video/mp4, image/png, application/pdf, text/markdown, etc.
  thumbnailUrl?: string;         // poster frame for videos, preview for docs
  externalUrl?: string;          // open-in-new-tab (staging portals, live websites)
  metadata?: {
    durationSec?: number;
    width?: number;
    height?: number;
    caption?: string;
    hashtags?: string[];
    platform?: string;
    bodyText?: string;           // for scripts / captions / emails
  };
};

export const OUTPUT_TYPE_META: Record<OutputType, { label: string; color: string }> = {
  doc:        { label: "Document",  color: "#4A82E8" },
  video:      { label: "Video",     color: "#7E5BDC" },
  image:      { label: "Image",     color: "#14E0E0" },
  carousel:   { label: "Carousel",  color: "#14E0E0" },
  caption:    { label: "Caption",   color: "#14E0E0" },
  script:     { label: "Script",    color: "#14E0E0" },
  thumbnail:  { label: "Thumbnail", color: "#7E5BDC" },
  email:      { label: "Email",     color: "#4A82E8" },
  portal:     { label: "Portal",    color: "#4A82E8" },
  design:     { label: "Design",    color: "#7E5BDC" },
  website:    { label: "Website",   color: "#4A82E8" },
};

export const STATUS_META: Record<OutputStatus, { label: string; color: string }> = {
  draft:     { label: "Draft",     color: "#606080" },
  in_review: { label: "In Review", color: "#FFB547" },
  approved:  { label: "Approved",  color: "#14E0E0" },
  shipped:   { label: "Shipped",   color: "#7E5BDC" },
};

// Sample media hosted by Google — safe, public, long-lived. Replaced at
// runtime once real outputs live in Supabase Storage.
const SAMPLE = {
  videoMp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  videoPoster: "https://picsum.photos/seed/vid/800/1200",
  imgPressure: "https://picsum.photos/seed/driveway-before/900/1200",
  imgPressureMid: "https://picsum.photos/seed/driveway-mid/900/1200",
  imgLandscapeBefore: "https://picsum.photos/seed/landscape-before/900/1200",
  imgLandscapeMid: "https://picsum.photos/seed/landscape-mid/900/1200",
  imgThumbnails: "https://picsum.photos/seed/thumbs/1200/900",
  imgBrand: "https://picsum.photos/seed/brand-guide/1000/1400",
  imgCarousel: "https://picsum.photos/seed/carousel/1080/1350",
  imgPortalScreenshot: "https://picsum.photos/seed/portal/1400/900",
  imgWebsite: "https://picsum.photos/seed/website/1600/1000",
};

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600 * 1000).toISOString();

export const OUTPUTS: WorkflowOutput[] = [
  // ───── Blueprint → Deal Documents (run 001) ──────────────────────
  {
    id: "out-001",
    runId: "run-blueprint-001",
    stepIndex: 0,
    workflow: "blueprint-to-deal",
    agent: "ceo",
    title: "Proposal — Krewe of Dage",
    type: "doc",
    status: "approved",
    summary: "Full-system proposal with pricing tiers for event-activation automation: intake → waiver → check-in → reporting.",
    producedAt: hoursAgo(2),
    mimeType: "application/pdf",
    metadata: { bodyText: "Event Activation Automation Proposal\n\nClient: Krewe of Dage\nPrepared by: DigitalDNA\n\nScope covers:\n• Intake form + waiver + payment flow\n• Day-of check-in (QR + GHL sync)\n• Post-event reporting dashboard\n..." },
  },
  {
    id: "out-002",
    runId: "run-blueprint-001",
    stepIndex: 1,
    workflow: "blueprint-to-deal",
    agent: "ceo",
    title: "SOW — Krewe of Dage v1",
    type: "doc",
    status: "in_review",
    summary: "6 deliverables, 4 milestones, payment schedule. Awaiting Daysha sign-off before send.",
    producedAt: hoursAgo(2),
    mimeType: "application/pdf",
    metadata: { bodyText: "Scope of Work — v1\n\nDeliverables:\n1. GHL intake form (configured + tested)\n2. Waiver e-sign flow\n3. Supabase event_registrations table + sync\n..." },
  },
  {
    id: "out-003",
    runId: "run-blueprint-001",
    stepIndex: 2,
    workflow: "blueprint-to-deal",
    agent: "ceo",
    title: "Service Agreement — Krewe of Dage",
    type: "doc",
    status: "draft",
    summary: "Final agreement template pre-filled with client details. Generates after SOW is approved.",
    producedAt: hoursAgo(1),
    mimeType: "application/pdf",
  },

  // ───── Weekly Content Batch (run 010 — this week) ────────────────
  {
    id: "out-010",
    runId: "run-content-batch-010",
    stepIndex: 0,
    workflow: "weekly-content-batch",
    agent: "content-producer",
    title: "Reel #1 — Stop chasing content ideas",
    type: "script",
    status: "approved",
    summary: "Hook Method 2 (contrarian). Pillar: systems. 42s. Ready for AI clone generation.",
    producedAt: hoursAgo(30),
    mimeType: "text/markdown",
    metadata: {
      durationSec: 42,
      bodyText: "HOOK (0-3s): You're not running out of content ideas. You're running out of systems to turn them into content.\n\nBODY (3-32s): Every service business owner I talk to has the same problem — they know what they want to say, but by the time they get to recording, the moment's gone. The fix isn't more ideas. The fix is a system that turns a Tuesday morning thought into a Friday night reel — automatically.\n\nCTA (32-42s): That's what we build at DigitalDNA. Not content. The machine that makes the content.",
    },
  },
  {
    id: "out-011",
    runId: "run-content-batch-010",
    stepIndex: 1,
    workflow: "weekly-content-batch",
    agent: "content-producer",
    title: "Reel #2 — The $500/mo audit trick",
    type: "video",
    status: "shipped",
    summary: "HeyGen clone rendered, Remotion captions burned. Handed to Social Media Manager Mon 11:02am.",
    producedAt: hoursAgo(28),
    mimeType: "video/mp4",
    fileUrl: SAMPLE.videoMp4,
    thumbnailUrl: SAMPLE.videoPoster,
    metadata: {
      durationSec: 38,
      width: 1080,
      height: 1920,
      caption: "The one audit trick that saves most service businesses $500+/month. No gatekeeping. 👇\n\nFull system walkthrough in comments.",
      hashtags: ["#smallbiz", "#automation", "#digitaldna", "#servicebiz", "#systems"],
      platform: "Instagram",
    },
  },
  {
    id: "out-012",
    runId: "run-content-batch-010",
    stepIndex: 2,
    workflow: "weekly-content-batch",
    agent: "content-producer",
    title: "Reel #3 — Contractor pipeline case study",
    type: "script",
    status: "draft",
    summary: "Long-form-to-reel adaptation. Waiting on b-roll from client portal before handoff.",
    producedAt: hoursAgo(26),
    mimeType: "text/markdown",
  },
  {
    id: "out-013",
    runId: "run-content-batch-010",
    stepIndex: 3,
    workflow: "weekly-content-batch",
    agent: "head-of-design",
    title: "Batch thumbnails — week of April 20",
    type: "thumbnail",
    status: "approved",
    summary: "7 YouTube thumbnails + 7 IG cover frames on brand gradient template. Passed design QA.",
    producedAt: hoursAgo(27),
    mimeType: "image/jpeg",
    fileUrl: SAMPLE.imgThumbnails,
    thumbnailUrl: SAMPLE.imgThumbnails,
  },

  // ───── External Content → Flip Package (run 020) ─────────────────
  {
    id: "out-020",
    runId: "run-flip-020",
    stepIndex: 0,
    workflow: "external-content-flip",
    agent: "content-repurposer",
    title: "Flip — HBR \"Why most AI rollouts stall\"",
    type: "carousel",
    status: "shipped",
    summary: "7-slide carousel adapting the HBR insight to service-biz ICP. Offer-to-Educate mode. Posted LinkedIn + IG.",
    producedAt: hoursAgo(8),
    mimeType: "image/jpeg",
    fileUrl: SAMPLE.imgCarousel,
    thumbnailUrl: SAMPLE.imgCarousel,
    metadata: {
      platform: "LinkedIn + Instagram",
      caption: "7 reasons most AI rollouts never ship — and the service-biz fix for each. Swipe →",
    },
  },
  {
    id: "out-021",
    runId: "run-flip-020",
    stepIndex: 1,
    workflow: "external-content-flip",
    agent: "content-repurposer",
    title: "Flip — Alex Hormozi YT teardown",
    type: "script",
    status: "approved",
    summary: "Recreate mode. 90s reel script in Daysha's voice. Ready for Content Producer pickup.",
    producedAt: hoursAgo(12),
    mimeType: "text/markdown",
    metadata: {
      durationSec: 90,
      bodyText: "HOOK: Hormozi's right about lead magnets. He's wrong about how most people apply it to service businesses.\n\nBODY: Here's the gap...",
    },
  },
  {
    id: "out-022",
    runId: "run-flip-020",
    stepIndex: 2,
    workflow: "external-content-flip",
    agent: "content-repurposer",
    title: "Flip — competitor newsletter breakdown",
    type: "email",
    status: "in_review",
    summary: "The Smelt — pulled the core frame, rebuilt as a Tuesday nurture email.",
    producedAt: hoursAgo(6),
    mimeType: "text/html",
    metadata: {
      bodyText: "Subject: The quiet reason your automations aren't landing\n\nHey {{first_name}},\n\nI noticed something this week reading three of our competitor's newsletters...",
    },
  },

  // ───── Client Timelapse Video — run 030 (full pipeline shown) ────
  {
    id: "out-030a",
    runId: "run-timelapse-030",
    stepIndex: 0,
    workflow: "client-timelapse",
    agent: "short-video-creator",
    title: "Before frame — driveway (Nano Banana)",
    type: "image",
    status: "approved",
    summary: "KIE.ai image-to-image output: 'grimy, algae-streaked driveway' from the after photo.",
    producedAt: hoursAgo(4),
    mimeType: "image/jpeg",
    fileUrl: SAMPLE.imgPressure,
    thumbnailUrl: SAMPLE.imgPressure,
    metadata: { width: 1080, height: 1920 },
  },
  {
    id: "out-030b",
    runId: "run-timelapse-030",
    stepIndex: 1,
    workflow: "client-timelapse",
    agent: "short-video-creator",
    title: "Midway frame — driveway (half-clean)",
    type: "image",
    status: "approved",
    summary: "KIE.ai image-to-image: 50% cleaned driveway — the reveal tipping point.",
    producedAt: hoursAgo(4),
    mimeType: "image/jpeg",
    fileUrl: SAMPLE.imgPressureMid,
    thumbnailUrl: SAMPLE.imgPressureMid,
    metadata: { width: 1080, height: 1920 },
  },
  {
    id: "out-030c",
    runId: "run-timelapse-030",
    stepIndex: 2,
    workflow: "client-timelapse",
    agent: "short-video-creator",
    title: "Final — J&R Pressure Wash driveway",
    type: "video",
    status: "shipped",
    summary: "Kling 1.5 animation of the 3-frame sequence, FFmpeg merge w/ music bed, vertical 9:16. Delivered 11:34am.",
    producedAt: hoursAgo(4),
    mimeType: "video/mp4",
    fileUrl: SAMPLE.videoMp4,
    thumbnailUrl: SAMPLE.imgPressureMid,
    metadata: {
      durationSec: 18,
      width: 1080,
      height: 1920,
      caption: "18 seconds that took 4 hours IRL. 🫧 — J&R Pressure Wash",
      hashtags: ["#pressurewashing", "#transformation", "#satisfying", "#smallbiz"],
      platform: "Instagram Reels",
    },
  },

  // ───── Client Timelapse — run 031 (in-progress, re-gen) ──────────
  {
    id: "out-031a",
    runId: "run-timelapse-031",
    stepIndex: 0,
    workflow: "client-timelapse",
    agent: "short-video-creator",
    title: "Before frame — GreenSide landscaping",
    type: "image",
    status: "approved",
    summary: "KIE.ai image-to-image output: pre-landscape, overgrown yard.",
    producedAt: hoursAgo(3),
    mimeType: "image/jpeg",
    fileUrl: SAMPLE.imgLandscapeBefore,
    thumbnailUrl: SAMPLE.imgLandscapeBefore,
  },
  {
    id: "out-031b",
    runId: "run-timelapse-031",
    stepIndex: 1,
    workflow: "client-timelapse",
    agent: "short-video-creator",
    title: "Midway frame — lighting mismatch",
    type: "image",
    status: "in_review",
    summary: "Flagged for re-gen — lighting doesn't match before/after. Re-running KIE image-to-image.",
    producedAt: hoursAgo(3),
    mimeType: "image/jpeg",
    fileUrl: SAMPLE.imgLandscapeMid,
    thumbnailUrl: SAMPLE.imgLandscapeMid,
  },

  // ───── Client Onboarding → Go-Live (run 040) ─────────────────────
  {
    id: "out-040",
    runId: "run-onboarding-040",
    stepIndex: 0,
    workflow: "client-onboarding",
    agent: "doc-writer",
    title: "Welcome Pack — new client intake",
    type: "doc",
    status: "approved",
    summary: "Branded onboarding welcome doc with timeline, stakeholders, and kickoff agenda.",
    producedAt: hoursAgo(36),
    mimeType: "application/pdf",
    metadata: { bodyText: "Welcome to DigitalDNA 👋\n\nYou're about to watch a machine get built..." },
  },
  {
    id: "out-041",
    runId: "run-onboarding-040",
    stepIndex: 1,
    workflow: "client-onboarding",
    agent: "head-of-design",
    title: "Brand Guide — client v1",
    type: "design",
    status: "approved",
    summary: "Color system, typography scale, logo variants, component specs from brand intake call.",
    producedAt: hoursAgo(34),
    mimeType: "image/jpeg",
    fileUrl: SAMPLE.imgBrand,
    thumbnailUrl: SAMPLE.imgBrand,
  },
  {
    id: "out-042",
    runId: "run-onboarding-040",
    stepIndex: 2,
    workflow: "client-onboarding",
    agent: "custom-software-dev",
    title: "Client Portal — staging deploy",
    type: "portal",
    status: "in_review",
    summary: "Supabase + React portal: dashboard, brand vault, education hub, invoices. Passed codebase audit.",
    producedAt: hoursAgo(20),
    mimeType: "image/png",
    thumbnailUrl: SAMPLE.imgPortalScreenshot,
    externalUrl: "https://staging.portal.example/krewe",
  },
  {
    id: "out-043",
    runId: "run-onboarding-040",
    stepIndex: 3,
    workflow: "client-onboarding",
    agent: "content-producer",
    title: "First 4 weeks of content — seeded",
    type: "script",
    status: "draft",
    summary: "28 pieces across pillar rotation. Scripts drafted; awaiting brand-guide approval before AI clone render.",
    producedAt: hoursAgo(18),
    mimeType: "text/markdown",
  },

  // ───── Standalone website preview (demonstrates the website type) ─
  {
    id: "out-050",
    workflow: "client-onboarding",
    agent: "custom-software-dev",
    title: "Marketing site — J&R Pressure Wash",
    type: "website",
    status: "shipped",
    summary: "Lovable-built single-page marketing site. 7-section layout, GHL form embed, mobile-first.",
    producedAt: hoursAgo(48),
    mimeType: "image/png",
    thumbnailUrl: SAMPLE.imgWebsite,
    externalUrl: "https://jr-pressure-wash.example.com",
  },
];
