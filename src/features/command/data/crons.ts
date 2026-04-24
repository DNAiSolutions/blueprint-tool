export type CronJob = {
  id: string;
  name: string;
  cron: string;
  enabled: boolean;
  agent: string;
  description: string;
};

export const CRONS: CronJob[] = [
  { id: "daily-briefing", name: "Daily CEO briefing (7:30am)", cron: "30 7 * * 1-5", enabled: true, agent: "ceo", description: "Prioritized sales + ops briefing: calendar, hot deals, agent status, today's priorities." },
  { id: "pipeline-review", name: "Weekly pipeline review (Mon 9am)", cron: "0 9 * * 1", enabled: true, agent: "ceo", description: "Analyze pipeline health, flag stale deals, generate the week's focus list." },
  { id: "content-batch-day", name: "Weekly content batch (Mon 10am)", cron: "0 10 * * 1", enabled: true, agent: "content-producer", description: "Produce 7-script weekly batch across the pillar rotation." },
  { id: "trend-scan", name: "Content trend scan (Tue + Thu 10:30am)", cron: "30 10 * * 2,4", enabled: true, agent: "content-repurposer", description: "Scan external sources for repurpose-worthy content." },
  { id: "social-schedule", name: "Social distribution sweep (daily 8am)", cron: "0 8 * * *", enabled: true, agent: "social-media-manager", description: "Post approved content across IG, LinkedIn, TikTok, YouTube." },
  { id: "social-metrics", name: "Weekly engagement report (Fri 4pm)", cron: "0 16 * * 5", enabled: true, agent: "social-media-manager", description: "Pull engagement metrics, generate performance report." },
  { id: "design-qa-sweep", name: "Design QA sweep (Wed 2pm)", cron: "0 14 * * 3", enabled: true, agent: "head-of-design", description: "Review creative output for brand consistency." },
  { id: "client-timelapse-batch", name: "Client timelapse batch (Thu 11am)", cron: "0 11 * * 4", enabled: true, agent: "short-video-creator", description: "Generate timelapse videos from client project photos." },
  { id: "sop-review", name: "Monthly SOP review (1st of month 9am)", cron: "0 9 1 * *", enabled: true, agent: "doc-writer", description: "Review internal SOPs and client handoff docs for freshness." },
  { id: "portal-health", name: "Client portal health check (daily 6am)", cron: "0 6 * * *", enabled: true, agent: "custom-software-dev", description: "Run health checks on deployed client portals." },
  { id: "memory-consolidate", name: "Memory consolidation (Sun 10pm)", cron: "0 22 * * 0", enabled: true, agent: "ceo", description: "Merge duplicate memory entries, prune stale facts." },
];
