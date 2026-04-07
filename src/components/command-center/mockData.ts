// ============================================
// DNAi Command IDE — Mock Data & Types
// ============================================

export type AgentStatus = 'online' | 'busy' | 'idle' | 'offline';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskColumn = 'backlog' | 'in_progress' | 'review' | 'done';
export type MemoryType = 'user' | 'feedback' | 'project' | 'reference';
export type CronStatus = 'active' | 'paused';
export type IntegrationStatus = 'connected' | 'error' | 'disconnected';
export type IntegrationCategory = 'ai' | 'content' | 'sales' | 'crm' | 'deploy' | 'payments';

// --- Agents ---
export interface Agent {
  id: string;
  name: string;
  shortName: string;
  role: string;
  status: AgentStatus;
  avatar: string;
  skills: string[];
  activeTask: string | null;
  tokensUsed: number;
  memoryCount: number;
  lastActive: string;
}

export const agents: Agent[] = [
  // === LEADERSHIP ===
  {
    id: 'ceo',
    name: 'CEO Agent',
    shortName: 'CEO',
    role: 'Strategic Orchestrator',
    status: 'online',
    avatar: 'C',
    skills: ['align-sales-system', 'blueprint-processing', 'pipeline-review', 'daily-briefing', 'forecast', 'delegation-orchestration'],
    activeTask: 'Running morning pipeline review',
    tokensUsed: 284_000,
    memoryCount: 14,
    lastActive: '2 min ago',
  },
  // === TEAM LEADS ===
  {
    id: 'website-builder',
    name: 'Website Builder',
    shortName: 'Build',
    role: 'Head of Build',
    status: 'online',
    avatar: 'W',
    skills: ['website-design', 'client-onboarding', 'operating-pipeline', 'stitch-mcp', 'anf-framework'],
    activeTask: 'Building Bayou Landscaping site via Stitch',
    tokensUsed: 620_000,
    memoryCount: 18,
    lastActive: '5 min ago',
  },
  {
    id: 'content',
    name: 'Content Producer',
    shortName: 'Content',
    role: 'Head of Content',
    status: 'busy',
    avatar: 'P',
    skills: ['content-production-system', 'timelapse-video', 'reel-scripting', 'heygen-render', 'batch-production', 'cc-system', 'content-repurpose'],
    activeTask: 'Generating 7 reel scripts for weekly batch',
    tokensUsed: 512_000,
    memoryCount: 8,
    lastActive: 'Just now',
  },
  {
    id: 'ops-monitor',
    name: 'Ops Monitor',
    shortName: 'Ops',
    role: 'Head of Operations',
    status: 'online',
    avatar: 'O',
    skills: ['client-onboarding', 'operating-pipeline', 'health-scoring', '4x-guarantee-tracking', 'deliverable-timeline'],
    activeTask: 'Running client health scores for 3 active clients',
    tokensUsed: 178_000,
    memoryCount: 12,
    lastActive: '10 min ago',
  },
  // === SPECIALIZED AGENTS ===
  {
    id: 'sales',
    name: 'Sales Agent',
    shortName: 'Sales',
    role: 'Outreach & Deal Pipeline',
    status: 'online',
    avatar: 'S',
    skills: ['align-sales-system', 'prospect', 'draft-outreach', 'call-prep', 'account-research', 'competitive-intelligence', 'deal-documents'],
    activeTask: 'Enriching 25 HVAC leads in Houston',
    tokensUsed: 156_000,
    memoryCount: 10,
    lastActive: '8 min ago',
  },
  {
    id: 'design',
    name: 'Head of Design',
    shortName: 'Design',
    role: 'Brand & Creative Direction',
    status: 'idle',
    avatar: 'D',
    skills: ['design-system', 'creative-production', 'social-media-design', 'brand-guide', 'carousel-framework'],
    activeTask: null,
    tokensUsed: 198_000,
    memoryCount: 6,
    lastActive: '45 min ago',
  },
  {
    id: 'social',
    name: 'Social Media Manager',
    shortName: 'Social',
    role: 'Distribution & Scheduling',
    status: 'online',
    avatar: 'M',
    skills: ['content-distribution-system', 'platform-formatting', 'engagement-tracking', 'weekly-report'],
    activeTask: 'Scheduling Tuesday batch to IG + LinkedIn',
    tokensUsed: 134_000,
    memoryCount: 5,
    lastActive: '12 min ago',
  },
  {
    id: 'dev',
    name: 'Custom Software Dev',
    shortName: 'Dev',
    role: 'Full-Stack Engineering',
    status: 'offline',
    avatar: 'V',
    skills: ['codebase-audit', 'lovable-build', 'supabase-backend', 'api-integration', 'portal-build'],
    activeTask: null,
    tokensUsed: 890_000,
    memoryCount: 22,
    lastActive: '3 hrs ago',
  },
  {
    id: 'automation',
    name: 'Automation Builder',
    shortName: 'Auto',
    role: 'GHL Workflow Engineering',
    status: 'idle',
    avatar: 'A',
    skills: ['ghl-engineering', 'ghl-template-delivery', 'ghl-workflow-replicator', 'automation-philosophy'],
    activeTask: null,
    tokensUsed: 245_000,
    memoryCount: 9,
    lastActive: '1 hr ago',
  },
  {
    id: 'intake',
    name: 'Intake Processor',
    shortName: 'Intake',
    role: 'Client Data Processing',
    status: 'idle',
    avatar: 'I',
    skills: ['client-onboarding', '7-pass-extraction', 'industry-templates'],
    activeTask: null,
    tokensUsed: 98_000,
    memoryCount: 4,
    lastActive: '2 hrs ago',
  },
  {
    id: 'qa',
    name: 'QA Tester',
    shortName: 'QA',
    role: 'Build Verification',
    status: 'idle',
    avatar: 'Q',
    skills: ['build-qa', 'website-checklist', 'ghl-checklist', 'content-checklist'],
    activeTask: null,
    tokensUsed: 65_000,
    memoryCount: 3,
    lastActive: '4 hrs ago',
  },
  {
    id: 'doc-writer',
    name: 'Doc Writer',
    shortName: 'Docs',
    role: 'SOPs & Documentation',
    status: 'idle',
    avatar: 'W',
    skills: ['sop-documentation', 'handoff-guides', 'training-materials', 'client-docs'],
    activeTask: null,
    tokensUsed: 72_000,
    memoryCount: 7,
    lastActive: '1 day ago',
  },
  {
    id: 'researcher',
    name: 'Researcher',
    shortName: 'Research',
    role: 'Market Intelligence',
    status: 'idle',
    avatar: 'R',
    skills: ['research-intelligence', 'competitor-analysis', 'industry-benchmarking'],
    activeTask: null,
    tokensUsed: 110_000,
    memoryCount: 5,
    lastActive: '6 hrs ago',
  },
  {
    id: 'content-intel',
    name: 'Content Intelligence',
    shortName: 'Intel',
    role: 'Trend Detection & Strategy',
    status: 'online',
    avatar: 'T',
    skills: ['content-intelligence', 'trend-detection', 'content-calendar', 'channel-analysis'],
    activeTask: 'Scanning for outlier videos in pressure washing niche',
    tokensUsed: 145_000,
    memoryCount: 6,
    lastActive: '15 min ago',
  },
  {
    id: 'ghl-engineer',
    name: 'HighLevel Engineer',
    shortName: 'GHL',
    role: 'GHL Platform Expert',
    status: 'idle',
    avatar: 'G',
    skills: ['ghl-engineering', 'pipeline-config', 'workflow-design', 'form-routing', 'compliance-mapping'],
    activeTask: null,
    tokensUsed: 188_000,
    memoryCount: 8,
    lastActive: '3 hrs ago',
  },
];

// --- Skills ---
export interface Skill {
  id: string;
  name: string;
  agentId: string;
  description: string;
  tokenCost: number;
  usageCount: number;
  lastUsed: string;
  category: string;
}

export const skills: Skill[] = [
  { id: 's1', name: 'align-sales-system', agentId: 'ceo', description: 'Run ALIGN discovery framework for closing agency clients', tokenCost: 45_000, usageCount: 28, lastUsed: '1 hr ago', category: 'sales' },
  { id: 's2', name: 'blueprint-processing', agentId: 'ceo', description: 'Process blueprint call transcripts into structured briefs', tokenCost: 32_000, usageCount: 15, lastUsed: '2 days ago', category: 'operations' },
  { id: 's3', name: 'pipeline-review', agentId: 'ceo', description: 'Analyze pipeline health, prioritize deals, flag risks', tokenCost: 28_000, usageCount: 42, lastUsed: '2 min ago', category: 'sales' },
  { id: 's4', name: 'daily-briefing', agentId: 'ceo', description: 'Morning briefing with prioritized task list', tokenCost: 15_000, usageCount: 89, lastUsed: 'Today 7:00 AM', category: 'operations' },
  { id: 's5', name: 'content-production', agentId: 'content', description: 'Full scripting and video production pipeline', tokenCost: 65_000, usageCount: 134, lastUsed: 'Just now', category: 'content' },
  { id: 's6', name: 'timelapse-video', agentId: 'content', description: 'AI timelapse transformation from single photo', tokenCost: 48_000, usageCount: 67, lastUsed: '3 hrs ago', category: 'content' },
  { id: 's7', name: 'reel-scripting', agentId: 'content', description: 'Viralish 4-hook reel script framework', tokenCost: 22_000, usageCount: 201, lastUsed: '15 min ago', category: 'content' },
  { id: 's8', name: 'heygen-render', agentId: 'content', description: 'HeyGen AI clone video generation', tokenCost: 8_000, usageCount: 89, lastUsed: '1 hr ago', category: 'content' },
  { id: 's9', name: 'design-system', agentId: 'design', description: 'Create brand identity and UI/UX design specs', tokenCost: 55_000, usageCount: 12, lastUsed: '2 days ago', category: 'design' },
  { id: 's10', name: 'carousel-framework', agentId: 'design', description: '7-slide narrative carousel creation', tokenCost: 35_000, usageCount: 45, lastUsed: '45 min ago', category: 'design' },
  { id: 's11', name: 'prospect', agentId: 'sales', description: 'ICP-to-leads pipeline with enrichment', tokenCost: 38_000, usageCount: 56, lastUsed: '8 min ago', category: 'sales' },
  { id: 's12', name: 'draft-outreach', agentId: 'sales', description: 'Research prospect then draft personalized outreach', tokenCost: 25_000, usageCount: 78, lastUsed: '20 min ago', category: 'sales' },
  { id: 's13', name: 'call-prep', agentId: 'sales', description: 'Prepare for sales call with account context', tokenCost: 30_000, usageCount: 34, lastUsed: '1 day ago', category: 'sales' },
  { id: 's14', name: 'codebase-audit', agentId: 'dev', description: 'Pre-build discovery to prevent duplicate work', tokenCost: 42_000, usageCount: 18, lastUsed: '3 hrs ago', category: 'engineering' },
  { id: 's15', name: 'portal-build', agentId: 'dev', description: 'Build custom dashboards with Supabase + React', tokenCost: 120_000, usageCount: 8, lastUsed: '1 day ago', category: 'engineering' },
  { id: 's16', name: 'content-distribution', agentId: 'social', description: 'Schedule and distribute across all platforms', tokenCost: 18_000, usageCount: 156, lastUsed: '12 min ago', category: 'social' },
  { id: 's17', name: 'engagement-tracking', agentId: 'social', description: 'Pull metrics and generate performance reports', tokenCost: 12_000, usageCount: 42, lastUsed: '1 hr ago', category: 'social' },
  { id: 's18', name: 'creative-production', agentId: 'design', description: 'Marketing graphics, ad creatives, AI image generation', tokenCost: 40_000, usageCount: 33, lastUsed: '2 hrs ago', category: 'design' },
];

// --- Cron Jobs ---
export interface CronJob {
  id: string;
  name: string;
  cron: string;
  agentId: string;
  prompt: string;
  status: CronStatus;
  lastRun: string | null;
  nextRun: string;
  runCount: number;
}

export const cronJobs: CronJob[] = [
  { id: 'c1', name: 'Morning Briefing', cron: '0 7 * * 1-5', agentId: 'ceo', prompt: 'Run daily briefing: review pipeline, flag urgent tasks, summarize overnight activity', status: 'active', lastRun: 'Today 7:00 AM', nextRun: 'Tomorrow 7:00 AM', runCount: 89 },
  { id: 'c2', name: 'Weekly Content Batch', cron: '0 9 * * 1', agentId: 'content', prompt: 'Produce this week\'s content batch — 7 scripts across the pillar rotation', status: 'active', lastRun: 'Mon 9:00 AM', nextRun: 'Next Mon 9:00 AM', runCount: 12 },
  { id: 'c3', name: 'Pipeline Health Check', cron: '0 12 * * 1-5', agentId: 'ceo', prompt: 'Run pipeline health check: stale deals, missing follow-ups, conversion bottlenecks', status: 'active', lastRun: 'Today 12:00 PM', nextRun: 'Tomorrow 12:00 PM', runCount: 64 },
  { id: 'c4', name: 'Social Post Scheduling', cron: '0 8 * * *', agentId: 'social', prompt: 'Check approved content queue and schedule today\'s posts across IG, LinkedIn, TikTok', status: 'active', lastRun: 'Today 8:00 AM', nextRun: 'Tomorrow 8:00 AM', runCount: 45 },
  { id: 'c5', name: 'Lead Enrichment Sweep', cron: '0 10 * * 2,4', agentId: 'sales', prompt: 'Enrich any new leads added this week that are missing email or phone data', status: 'active', lastRun: 'Tue 10:00 AM', nextRun: 'Thu 10:00 AM', runCount: 22 },
  { id: 'c6', name: 'Weekly Performance Report', cron: '0 17 * * 5', agentId: 'social', prompt: 'Generate weekly social media performance report with engagement metrics and recommendations', status: 'paused', lastRun: 'Last Fri 5:00 PM', nextRun: 'Paused', runCount: 8 },
];

// --- Sprint Tasks ---
export interface SprintTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  agentId: string;
  column: TaskColumn;
  dueDate: string | null;
  tags: string[];
}

export const sprintTasks: SprintTask[] = [
  { id: 't1', title: 'Weekly content batch — 7 reel scripts', description: 'Produce 7 scripts using pillar rotation for Mon-Sun', priority: 'high', agentId: 'content', column: 'in_progress', dueDate: 'Apr 7', tags: ['content', 'batch'] },
  { id: 't2', title: 'Enrich 50 HVAC leads — Houston', description: 'Apollo search + enrichment for HVAC businesses in Houston metro', priority: 'high', agentId: 'sales', column: 'in_progress', dueDate: 'Apr 8', tags: ['leads', 'apollo'] },
  { id: 't3', title: 'Blueprint brief — Krewe of Dage', description: 'Process transcript from blueprint call into structured brief', priority: 'critical', agentId: 'ceo', column: 'review', dueDate: 'Apr 7', tags: ['blueprint', 'sales'] },
  { id: 't4', title: 'Carousel templates — Q2 campaign', description: 'Design 5 carousel templates for Q2 campaign launch', priority: 'medium', agentId: 'design', column: 'backlog', dueDate: 'Apr 12', tags: ['design', 'carousel'] },
  { id: 't5', title: 'Bayou Landscaping site fixes', description: 'Fix Vercel deploy error and update hero section copy', priority: 'high', agentId: 'dev', column: 'backlog', dueDate: 'Apr 9', tags: ['website', 'bug'] },
  { id: 't6', title: 'Schedule Tuesday social batch', description: 'Format and schedule approved content for IG + LinkedIn + TikTok', priority: 'medium', agentId: 'social', column: 'in_progress', dueDate: 'Apr 8', tags: ['social', 'scheduling'] },
  { id: 't7', title: 'HeyGen renders — Acme PW batch', description: 'Render 5 approved scripts as AI clone videos', priority: 'medium', agentId: 'content', column: 'backlog', dueDate: 'Apr 10', tags: ['content', 'heygen'] },
  { id: 't8', title: 'Client portal — waiver tracking', description: 'Add waiver tracking feature to Krewe of Dage portal', priority: 'low', agentId: 'dev', column: 'backlog', dueDate: 'Apr 14', tags: ['engineering', 'portal'] },
  { id: 't9', title: 'Morning briefing cron audit', description: 'Review and optimize daily briefing prompt for accuracy', priority: 'low', agentId: 'ceo', column: 'done', dueDate: null, tags: ['operations', 'cron'] },
  { id: 't10', title: 'Competitive intel — PW market', description: 'Research top 5 pressure washing competitors in Gulf Coast', priority: 'medium', agentId: 'sales', column: 'done', dueDate: null, tags: ['sales', 'research'] },
];

// --- Memory ---
export interface MemoryEntry {
  id: string;
  name: string;
  type: MemoryType;
  agentId: string;
  description: string;
  content: string;
  updatedAt: string;
}

export const memoryEntries: MemoryEntry[] = [
  { id: 'm1', name: 'user_role', type: 'user', agentId: 'ceo', description: 'Daysha\'s role and agency context', content: 'Daysha Blount is CEO of DigitalDNA (DNAi Solutions), a digital marketing agency. She runs sales, content production, and client delivery. Prefers autonomous agent work with check-ins at milestones. Deep knowledge of GHL, Lovable, Supabase, and AI tooling.', updatedAt: '2 days ago' },
  { id: 'm2', name: 'feedback_terse', type: 'feedback', agentId: 'ceo', description: 'User prefers terse responses, no trailing summaries', content: 'Stop summarizing what you just did at the end of every response. Daysha can read the diff.\n\n**Why:** Wastes time, feels patronizing.\n**How to apply:** Keep responses short. Lead with action, not explanation.', updatedAt: '5 days ago' },
  { id: 'm3', name: 'project_blueprint_tool', type: 'project', agentId: 'dev', description: 'Blueprint tool is the internal PM/AI command center', content: 'The blueprint-tool repo is DigitalDNA\'s internal project management and AI command center. Built with Lovable (React + Vite + shadcn). Houses ALIGN session canvas, pipeline, content, and AI command modules.\n\n**Why:** Central tool for running the agency.\n**How to apply:** All new features should integrate with existing ALIGN design system.', updatedAt: '1 day ago' },
  { id: 'm4', name: 'ref_ghl_workspace', type: 'reference', agentId: 'sales', description: 'GHL sub-account structure for clients', content: 'Each client gets their own GHL sub-account. Pipeline stages: Lead > Audit > Strategy > Build > Produce > Live. Automations trigger on stage changes. API key stored in .env as GHL_API_KEY.', updatedAt: '1 week ago' },
  { id: 'm5', name: 'feedback_bundled_prs', type: 'feedback', agentId: 'dev', description: 'Prefer bundled PRs for refactors over many small ones', content: 'For refactors, user prefers one bundled PR over many small ones. Splitting would just be churn.\n\n**Why:** Less review overhead, easier to see full picture.\n**How to apply:** When refactoring, batch related changes into a single PR.', updatedAt: '3 days ago' },
  { id: 'm6', name: 'project_content_pipeline', type: 'project', agentId: 'content', description: 'Weekly content production cadence', content: 'Weekly batch: 7 scripts (1/day), pillar rotation across client ICPs. Scripts go through: Draft > Review > Approved > Rendered > Scheduled. HeyGen for AI clone, Eleven Labs for voice.\n\n**Why:** Consistency = growth. Missing a day breaks momentum.\n**How to apply:** Monday batch must be ready by 9 AM. Flag any blockers by Sunday night.', updatedAt: 'Today' },
  { id: 'm7', name: 'ref_apollo_workspace', type: 'reference', agentId: 'sales', description: 'Apollo workspace for lead prospecting', content: 'Apollo workspace: DNAi Solutions. Sequences: "Cold Outreach v2", "Warm Re-engage", "Post-Audit Follow-up". Daily enrichment limit: 100 contacts. API key in .env as APOLLO_API_KEY.', updatedAt: '4 days ago' },
  { id: 'm8', name: 'user_design_prefs', type: 'user', agentId: 'design', description: 'Daysha\'s design aesthetic preferences', content: 'Prefers dark, ethereal UI aesthetic. Cyan accent (#81ecff). No heavy borders — use ghost-level dividers. Glassmorphism for elevated surfaces. IBM Plex Mono for data/metrics. Ambient glow shadows, not drop shadows.', updatedAt: '6 days ago' },
];

// --- Activity Log ---
export interface ActivityEntry {
  id: string;
  action: string;
  agentId: string;
  module: string;
  status: 'success' | 'running' | 'error' | 'queued';
  time: string;
  duration: string;
}

export const activityLog: ActivityEntry[] = [
  { id: 'a1', action: 'Generated 7 reel scripts for weekly batch', agentId: 'content', module: 'Content', status: 'success', time: '3 min ago', duration: '18s' },
  { id: 'a2', action: 'Morning pipeline review completed', agentId: 'ceo', module: 'Pipeline', status: 'success', time: '12 min ago', duration: '8s' },
  { id: 'a3', action: 'Enriching 25 HVAC leads — Houston batch', agentId: 'sales', module: 'Leads', status: 'running', time: 'Just now', duration: '—' },
  { id: 'a4', action: 'Scheduled 4 posts to IG + LinkedIn', agentId: 'social', module: 'Social', status: 'success', time: '15 min ago', duration: '5s' },
  { id: 'a5', action: 'HeyGen render — Acme PW Script #3', agentId: 'content', module: 'Content', status: 'success', time: '45 min ago', duration: '3m 42s' },
  { id: 'a6', action: 'Vercel deploy — Bayou Landscaping site', agentId: 'dev', module: 'Websites', status: 'error', time: '2 hrs ago', duration: '45s' },
  { id: 'a7', action: 'Apollo search — 50 HVAC businesses', agentId: 'sales', module: 'Leads', status: 'success', time: '3 hrs ago', duration: '12s' },
  { id: 'a8', action: 'KIE.ai carousel generation — slide 4/7', agentId: 'design', module: 'Design', status: 'success', time: '4 hrs ago', duration: '2m 15s' },
  { id: 'a9', action: 'Blueprint brief processed — Krewe of Dage', agentId: 'ceo', module: 'Pipeline', status: 'success', time: '5 hrs ago', duration: '22s' },
  { id: 'a10', action: 'Weekly performance report generated', agentId: 'social', module: 'Social', status: 'success', time: 'Yesterday', duration: '14s' },
];

// --- Integrations ---
export interface Integration {
  id: string;
  name: string;
  icon: string;
  status: IntegrationStatus;
  category: IntegrationCategory;
  description: string;
  lastPing: string;
}

export const integrations: Integration[] = [
  { id: 'i1', name: 'Claude MCP', icon: 'brain', status: 'connected', category: 'ai', description: 'Anthropic Claude agent backbone', lastPing: '< 1s' },
  { id: 'i2', name: 'HeyGen', icon: 'video', status: 'connected', category: 'content', description: 'AI avatar video generation', lastPing: '2s' },
  { id: 'i3', name: 'Eleven Labs', icon: 'mic', status: 'connected', category: 'content', description: 'Voice cloning and TTS', lastPing: '1s' },
  { id: 'i4', name: 'KIE.ai', icon: 'image', status: 'connected', category: 'content', description: 'AI image generation', lastPing: '3s' },
  { id: 'i5', name: 'Apollo', icon: 'search', status: 'connected', category: 'sales', description: 'Lead enrichment and prospecting', lastPing: '1s' },
  { id: 'i6', name: 'GoHighLevel', icon: 'smartphone', status: 'connected', category: 'crm', description: 'CRM, pipeline, automations', lastPing: '2s' },
  { id: 'i7', name: 'Blotato', icon: 'calendar', status: 'connected', category: 'content', description: 'Social media scheduling', lastPing: '1s' },
  { id: 'i8', name: 'Vercel', icon: 'triangle', status: 'error', category: 'deploy', description: 'Website hosting and deploys', lastPing: 'Timeout' },
  { id: 'i9', name: 'Supabase', icon: 'database', status: 'connected', category: 'deploy', description: 'Database and auth backend', lastPing: '< 1s' },
  { id: 'i10', name: 'Stripe', icon: 'credit-card', status: 'connected', category: 'payments', description: 'Payment processing', lastPing: '1s' },
  { id: 'i11', name: 'Canva', icon: 'palette', status: 'disconnected', category: 'content', description: 'Design templates and editing', lastPing: '—' },
  { id: 'i12', name: 'WaveSpeed', icon: 'waves', status: 'connected', category: 'content', description: 'Video processing pipeline', lastPing: '2s' },
  { id: 'i13', name: 'Slack', icon: 'hash', status: 'connected', category: 'crm', description: 'Team communication', lastPing: '< 1s' },
  { id: 'i14', name: 'Google Calendar', icon: 'calendar-days', status: 'connected', category: 'crm', description: 'Scheduling and events', lastPing: '1s' },
  { id: 'i15', name: 'Gmail', icon: 'mail', status: 'connected', category: 'crm', description: 'Email integration', lastPing: '1s' },
  { id: 'i16', name: 'Telegram', icon: 'send', status: 'connected', category: 'ai', description: 'Agent messaging channel', lastPing: '< 1s' },
  { id: 'i17', name: 'Fal AI', icon: 'sparkles', status: 'connected', category: 'ai', description: 'Image model inference', lastPing: '2s' },
  { id: 'i18', name: 'Netlify', icon: 'globe', status: 'disconnected', category: 'deploy', description: 'Static site hosting', lastPing: '—' },
];

// --- Docs / File Tree ---
export interface DocFile {
  id: string;
  name: string;
  agentId: string;
  type: 'config' | 'memory' | 'cron' | 'skill';
  content: string;
}

export const docFiles: DocFile[] = [
  {
    id: 'd1', name: 'CLAUDE.md', agentId: 'ceo', type: 'config',
    content: `# CEO Agent — CLAUDE.md

## Identity
You are the CEO Agent for DigitalDNA (DNAi Solutions).
You orchestrate all other agents and own the sales pipeline.

## Responsibilities
- Run daily morning briefings (7 AM cron)
- Process blueprint call transcripts
- Monitor pipeline health and flag risks
- Coordinate cross-agent task delegation

## Guardrails
- Never delete files without explicit approval
- Always confirm before sending external messages
- Keep responses terse — Daysha reads the diffs

## Memory
Read memory files from ./memory/ on session startup.
Recreate crons from ./cronregistry.json on restart.`,
  },
  {
    id: 'd2', name: 'cronregistry.json', agentId: 'ceo', type: 'cron',
    content: `{
  "crons": [
    {
      "name": "Morning Briefing",
      "schedule": "0 7 * * 1-5",
      "prompt": "Run daily briefing: pipeline, tasks, overnight activity",
      "agent": "ceo"
    },
    {
      "name": "Pipeline Health Check",
      "schedule": "0 12 * * 1-5",
      "prompt": "Check for stale deals and missing follow-ups",
      "agent": "ceo"
    },
    {
      "name": "Weekly Content Batch",
      "schedule": "0 9 * * 1",
      "prompt": "Produce 7 scripts across pillar rotation",
      "agent": "content"
    }
  ]
}`,
  },
  {
    id: 'd3', name: 'CLAUDE.md', agentId: 'content', type: 'config',
    content: `# Content Producer — CLAUDE.md

## Identity
You are the Content Producer for DigitalDNA.
You handle all script writing, video production, and batch workflows.

## Tools
- HeyGen: AI clone video generation
- Eleven Labs: Voice cloning
- KIE.ai: Image generation
- Remotion: Motion graphics

## Weekly Cadence
- Monday 9 AM: Generate 7 reel scripts
- Tuesday-Thursday: Render approved scripts
- Friday: Batch schedule for next week

## Output Standards
- Scripts use Viralish 4-hook framework
- All videos 9:16 aspect ratio
- Captions included in every render`,
  },
  {
    id: 'd4', name: 'memory.md', agentId: 'ceo', type: 'memory',
    content: `# CEO Agent Memory Index

- [User Role](user_role.md) — Daysha is CEO of DigitalDNA
- [Terse Responses](feedback_terse.md) — No trailing summaries
- [Pipeline Stages](ref_ghl_workspace.md) — GHL sub-account structure
- [Blueprint Tool](project_blueprint_tool.md) — Internal PM/AI tool
- [Content Cadence](project_content_pipeline.md) — Weekly batch schedule`,
  },
];

// --- Console Mock Output ---
export const consoleHistory: Array<{ type: 'command' | 'response' | 'system'; text: string; timestamp: string }> = [
  { type: 'system', text: 'DNAi Command IDE v1.0 — Connected to 4/6 agents', timestamp: '7:00 AM' },
  { type: 'system', text: '[cron] Morning Briefing triggered — routing to CEO Agent', timestamp: '7:00 AM' },
  { type: 'response', text: '## Morning Briefing — Apr 7, 2026\n\n**Pipeline:** 12 active deals ($48,200 weighted)\n- 2 deals stale > 7 days (Bayou Landscaping, Gulf Coast HVAC)\n- 1 deal in review stage needs follow-up (Krewe of Dage)\n\n**Content:** 7 scripts due today (Monday batch)\n- 3 approved from last week pending HeyGen render\n\n**Action Items:**\n1. Follow up on Krewe of Dage blueprint\n2. Kick off weekly content batch\n3. Fix Vercel deploy for Bayou Landscaping', timestamp: '7:01 AM' },
  { type: 'command', text: 'Produce this week\'s content batch — 7 scripts across the pillar rotation', timestamp: '9:00 AM' },
  { type: 'response', text: 'Routing to **Content Producer**...\n\nGenerating 7 reel scripts:\n1. [done] Mon — Pressure Washing: "3 things your driveway is begging you to do"\n2. [done] Tue — Landscaping: "Your neighbors hired us. Here\'s what happened."\n3. [done] Wed — HVAC: "The $200 mistake every homeowner makes in summer"\n4. [done] Thu — Roofing: "We found this during a free inspection"\n5. [done] Fri — Painting: "POV: Your house gets a glow-up"\n6. [done] Sat — General: "How we run 12 client accounts with 2 people"\n7. [done] Sun — Behind the scenes: "What AI content production actually looks like"\n\nAll 7 scripts generated. Ready for review in Content module.', timestamp: '9:01 AM' },
];

// --- Quick Commands ---
export const quickCommands = [
  { label: 'Weekly content batch', command: 'Produce this week\'s content batch — 7 scripts across the pillar rotation', agentId: 'content' },
  { label: 'Find 50 leads', command: 'Find 50 HVAC businesses in Houston with enrichment', agentId: 'sales' },
  { label: 'Pipeline review', command: 'Run full pipeline review with risk flags', agentId: 'ceo' },
  { label: 'Render approved scripts', command: 'Render all approved scripts in HeyGen', agentId: 'content' },
  { label: 'Generate carousels', command: 'Generate 7 carousels for this week', agentId: 'design' },
  { label: 'Schedule social batch', command: 'Schedule today\'s approved posts across IG, LinkedIn, TikTok', agentId: 'social' },
  { label: 'Morning briefing', command: 'Run daily briefing now', agentId: 'ceo' },
  { label: 'Audit live websites', command: 'Audit all live client websites for issues', agentId: 'dev' },
];

// --- Helpers ---
export function getAgent(id: string): Agent | undefined {
  return agents.find(a => a.id === id);
}

export function getAgentColor(id: string): string {
  const colors: Record<string, string> = {
    ceo: 'hsl(191, 100%, 75%)',
    content: 'hsl(270, 60%, 60%)',
    design: 'hsl(28, 85%, 55%)',
    sales: 'hsl(145, 65%, 45%)',
    dev: 'hsl(207, 90%, 60%)',
    social: 'hsl(340, 70%, 60%)',
  };
  return colors[id] || 'hsl(210, 15%, 55%)';
}

export function getAgentBgClass(id: string): string {
  const classes: Record<string, string> = {
    ceo: 'bg-accent/15 text-accent border-accent/30',
    content: 'bg-[hsl(270,60%,60%)]/15 text-[hsl(270,60%,60%)] border-[hsl(270,60%,60%)]/30',
    design: 'bg-[hsl(28,85%,55%)]/15 text-[hsl(28,85%,55%)] border-[hsl(28,85%,55%)]/30',
    sales: 'bg-success/15 text-success border-success/30',
    dev: 'bg-[hsl(207,90%,60%)]/15 text-[hsl(207,90%,60%)] border-[hsl(207,90%,60%)]/30',
    social: 'bg-[hsl(340,70%,60%)]/15 text-[hsl(340,70%,60%)] border-[hsl(340,70%,60%)]/30',
  };
  return classes[id] || 'bg-muted text-muted-foreground border-border';
}

export function getStatusColor(status: AgentStatus): string {
  switch (status) {
    case 'online': return 'bg-success';
    case 'busy': return 'bg-warning';
    case 'idle': return 'bg-muted-foreground';
    case 'offline': return 'bg-destructive/50';
  }
}
