# DNAi System Blueprint
## The Complete Autonomous Agency OS

> **Last Updated:** 2026-04-07
> **Owner:** Daysha Blount, CEO of DigitalDNA
> **Purpose:** Single reference document for building the full AI-powered agency operation

---

## 1. THE CLIENT LIFECYCLE STATE MACHINE

Every client passes through **3 pipelines** in sequence. Each stage has an **owning agent**, **trigger**, and **exit condition**.

### Pipeline 1: New Leads
*GHL Pipeline: "01. New Leads"*

```
Ads/Organic ──► [New Lead] ──► [Website] ──► [Content Trial] ──► [Trial Over] ──► [Converted]
                    │              │               │                   │               │
                    │              │               │                   │               ▼
                    │              │               │                   │         Moves to Sales
                    │              │               │                   │         Pipeline
                    │              │               │                   ▼
                    │              │               │            Nurture Sequence
                    │              │               │            (GHL workflow)
                    │              │               ▼
                    │              │         HeyGen clone from photo
                    │              │         OpenArt 6 posts (3+3)
                    │              │         Delivered via portal preview
                    │              ▼
                    │        Stitch MCP builds site
                    │        from GMB via Firecrawl
                    │        Client previews staging URL
                    ▼
              AI creates contact in GHL
              Sales Agent enriches lead
              Welcome SMS + email via GHL
```

| Stage | Owner Agent | Trigger | Exit Condition | GHL Automation |
|-------|------------|---------|----------------|----------------|
| New Lead | Sales Agent | Ad form submission / webhook | Lead data enriched, GHL contact created | Welcome sequence starts |
| Website | Custom Dev (via Website Builder) | Lead enters stage | Staging preview URL delivered, client views it | Notification: "Your preview site is ready" |
| Content Trial | Content Producer | Website stage complete | 6 posts + HeyGen sample delivered | Notification: "Your content samples are ready" |
| Trial Over - Nurture | CEO Agent | 14 days elapsed OR client declines | Client converts OR exits nurture after 30 days | Nurture email/SMS sequence (7 touchpoints) |
| Converted | CEO Agent | Client says yes to free trial deliverables | Opportunity created in Sales Pipeline | Auto-move to Sales Pipeline, Discovery Call stage |

### Pipeline 2: Sales
*GHL Pipeline: "2. Sales Pipeline"*

```
[Discovery Call] ──► [Blueprint Call] ──► [Send Proposal] ──► [Proposal Signed] ──► [Invoice Paid]
      │                    │                    │                     │                    │
      │                    │                    │                     │                    ▼
      │                    │                    │                     │              Moves to
      │                    │                    │                     │              Onboarding
      │                    │                    │                     ▼
      │                    │                    │               Agreement signed
      │                    │                    │               (DocuSign/GHL)
      │                    │                    ▼
      │                    │              Agreement + invoice
      │                    │              created in PM tool
      │                    │              sent via GHL
      │                    ▼
      │              CEO Agent processes
      │              transcript into brief
      │              (7-pass extraction)
      ▼
  ALIGN framework
  Sales Agent + CEO
  Miro visual mapping
```

| Stage | Owner Agent | Trigger | Exit Condition | GHL Automation |
|-------|------------|---------|----------------|----------------|
| Discovery Call | Sales Agent + CEO | Converted from New Leads | Call completed, notes captured | Calendar booking link sent |
| Blueprint Call | CEO Agent | Discovery call done | Transcript processed via 7-pass extraction, brief created | Calendar booking, pre-call questionnaire |
| Send Proposal | CEO Agent | Blueprint brief approved by Daysha | Proposal + agreement sent to client | Proposal delivery email |
| Proposal Signed | CEO Agent | Client signs agreement | Agreement status = signed | Confirmation email + next steps |
| Invoice Paid | CEO Agent | Payment received (GHL/Stripe) | Payment confirmed, receipt sent | Payment confirmation, moves to Onboarding |

### Pipeline 3: Onboarding
*GHL Pipeline: "3. Onboarding"*

```
[Need to Onboard] ──► [Onboard Call Booked] ──► [Onboarded]
        │                       │                      │
        │                       │                      ▼
        │                       │                Active Client
        │                       │                (ongoing operations)
        │                       ▼
        │                Strategy intake form
        │                Clone recording instructions
        │                60-90 day content plan
        ▼
  Portal access created (client role)
  Onboarding checklist generated
  Social account connect link sent
  Package tier + channels configured
```

| Stage | Owner Agent | Trigger | Exit Condition | GHL Automation |
|-------|------------|---------|----------------|----------------|
| Need to Onboard | Ops Monitor | Invoice paid | Portal access created, onboarding checklist generated | Welcome to portal email + SMS |
| Onboard Call Booked | CEO Agent | Portal activated | Call scheduled, strategy intake form submitted | Calendar booking, pre-call form |
| Onboarded | CEO Agent + Ops Monitor | All checklist items complete | First content batch scheduled, website live, automations active | "You're live!" email + 7-day check-in scheduled |

### Post-Onboarding: Active Client Operations

```
┌──────────────────────────────────────────────────────────────┐
│                    ACTIVE CLIENT LOOP                          │
│                                                                │
│   Weekly Content Cycle:                                        │
│   ┌─────────┐    ┌──────────┐    ┌─────────┐    ┌──────────┐ │
│   │ Script  │───►│ Produce  │───►│ Review  │───►│ Schedule │ │
│   │ (Agent) │    │ (Agent)  │    │ (Client)│    │ (Agent)  │ │
│   └─────────┘    └──────────┘    └─────────┘    └──────────┘ │
│        │                              │                        │
│        │                    3 revisions max                    │
│        │                    Auto-approve @ 5 days              │
│        │                              │                        │
│   Content Producer            Portal + SMS + Slack             │
│   creates weekly batch        notification on ready            │
│                                                                │
│   Monthly Health Check:                                        │
│   ┌──────────┐    ┌───────────┐    ┌──────────┐              │
│   │ Compute  │───►│ Upsell?  │───►│ Execute  │              │
│   │ Health   │    │ (AI eval) │    │ Upsell   │              │
│   │ Score    │    └───────────┘    └──────────┘              │
│   └──────────┘         │                                      │
│        │          Portal noti +                                │
│        │          email + SMS                                  │
│   Engagement +                                                 │
│   Payment +                                                    │
│   Portal Activity                                              │
│                                                                │
│   Video Review Request: Month 1 milestone → portal upload      │
│                                                                │
│   Error Handling:                                              │
│   Agent self-check → 2 errors/hour → WhatsApp escalation      │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. AGENT-TO-OPERATION MAPPING

### Your Actual Agent Org Chart (from ceo-agent/)

```
                         DAYSHA (Human)
                              │
                         CEO AGENT
                    (Strategic Orchestrator)
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        WEBSITE BUILDER  CONTENT PRODUCER  OPS MONITOR
        (Head of Build)  (Head of Content) (Head of Ops)
              │               │               │
        ┌─────┼─────┐    ┌───┤           ┌───┼────┐
        │           │    │   │           │   │    │
    Automation  Custom  Social  Content  Intake QA  Doc
    Builder     Dev    Media   Intel.   Proc. Test Writer
                       Manager
        │
    ┌───┤
    │   │
   GHL  GHL
   Eng. Template
```

### Agent Assignments Per Pipeline Stage

| Pipeline | Stage | Primary Agent | Supporting Agents | Tools Used |
|----------|-------|--------------|-------------------|------------|
| **New Leads** | New Lead | Sales Agent | CEO Agent | Apollo, GHL API |
| | Website | Custom Dev | Website Builder | Firecrawl, Stitch MCP, Vercel |
| | Content Trial | Content Producer | Head of Design | HeyGen, OpenArt |
| | Trial Over | CEO Agent | Sales Agent | GHL workflows |
| | Converted | CEO Agent | Sales Agent | GHL API |
| **Sales** | Discovery Call | Sales Agent | CEO Agent | ALIGN framework, Fathom |
| | Blueprint Call | CEO Agent | Intake Processor | 7-pass extraction |
| | Send Proposal | CEO Agent | Doc Writer | Claude (agreement gen), GHL |
| | Proposal Signed | CEO Agent | — | GHL |
| | Invoice Paid | CEO Agent | Ops Monitor | GHL/Stripe |
| **Onboarding** | Need to Onboard | Ops Monitor | Custom Dev | Supabase (portal), GHL |
| | Onboard Call Booked | CEO Agent | — | GHL calendar |
| | Onboarded | CEO Agent | All agents | All tools |
| **Active** | Content Cycle | Content Producer | Social Media Mgr, Head of Design | HeyGen, OpenArt, GHL Social |
| | Health Check | Ops Monitor | CEO Agent | Analytics APIs |
| | Upsell | Sales Agent | CEO Agent | GHL, portal notifications |
| **Off-boarding** | Exit | Ops Monitor | Custom Dev | Export tools, GHL |

---

## 3. GHL vs PM TOOL — WHAT LIVES WHERE

### GHL Handles (External CRM Layer)
- SMS messaging to leads and clients
- Email sequences and one-off emails
- Social media posting to client channels (IG, FB, TikTok, LinkedIn)
- Payment processing (invoices, subscriptions, one-time)
- Calendar booking (discovery calls, blueprint calls, onboard calls)
- Pipeline stage tracking (mirror of PM tool — GHL is the execution layer)
- Form hosting for lead capture (ad landing pages)
- Reputation management (review requests)

### PM Tool Handles (Internal Command Center)
- Agent orchestration and task queue
- Content production pipeline (scripts, approvals, revisions)
- Website management (staging, preview, deployment)
- Client portal (all client-facing features)
- Agreement generation (Claude creates, GHL delivers)
- Cost tracking per client
- Health scoring and upsell intelligence
- Template library
- Webhook event processing
- Sprint/task management
- Memory and knowledge base
- Analytics dashboards
- Financial reporting with margin analysis

### Sync Points (Webhook-Driven)
```
GHL ──webhook──► PM Tool Webhook Handler ──► Agent Task Queue

Events:
  contact.created       → Sales Agent: enrich lead
  opportunity.stageChanged → CEO Agent: update pipeline_opportunities
  payment.received      → Ops Monitor: activate onboarding
  payment.failed        → GHL: retry + email sequence
  appointment.booked    → CEO Agent: prep for call
  form.submitted        → Intake Processor: process intake
  conversation.updated  → Log to activity feed
```

```
PM Tool ──API call──► GHL

Actions:
  Create/update contact
  Move opportunity stage
  Send SMS/email
  Create/send invoice
  Post to social channels
  Trigger workflow
```

---

## 4. DATABASE SCHEMA EXPANSION

### New Tables (13)

```sql
-- 1. Multi-pipeline opportunity tracking (replaces single pipeline_stage on clients)
CREATE TABLE pipeline_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  pipeline text NOT NULL CHECK (pipeline IN ('new_leads', 'sales', 'onboarding')),
  stage text NOT NULL,
  ghl_opportunity_id text,
  deal_value numeric DEFAULT 0,
  assigned_agent text,
  entered_stage_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Agent task queue (the backbone of all automation)
CREATE TABLE agent_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  task_type text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('critical','high','medium','low')),
  status text DEFAULT 'queued' CHECK (status IN ('queued','in_progress','review','done','failed','escalated')),
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  input_payload jsonb,
  output_payload jsonb,
  parent_task_id uuid REFERENCES agent_tasks(id),
  error_count int DEFAULT 0,
  last_error text,
  escalated_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 3. Webhook event log
CREATE TABLE webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN ('ghl','stripe','vercel','heygen','other')),
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  agent_task_id uuid REFERENCES agent_tasks(id),
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- 4. Content approval workflow
CREATE TABLE content_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id uuid REFERENCES scripts(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','revision_requested','auto_approved')),
  revision_number int DEFAULT 0,
  revision_notes text,
  auto_approve_at timestamptz,
  submitted_at timestamptz DEFAULT now(),
  responded_at timestamptz
);

-- 5. Per-client cost tracking
CREATE TABLE cost_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  agent_task_id uuid REFERENCES agent_tasks(id),
  provider text NOT NULL,
  api_action text NOT NULL,
  cost_usd numeric DEFAULT 0,
  tokens_used int,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- 6. Client health scores
CREATE TABLE client_health_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  content_performance numeric DEFAULT 0,
  engagement_score numeric DEFAULT 0,
  payment_score numeric DEFAULT 0,
  portal_activity numeric DEFAULT 0,
  composite_score numeric DEFAULT 0,
  upsell_triggered boolean DEFAULT false,
  computed_at timestamptz DEFAULT now()
);

-- 7. Agreements (proposals, SOWs, service agreements)
CREATE TABLE agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  type text CHECK (type IN ('service_agreement','proposal','scope_of_work')),
  content_md text,
  pdf_url text,
  status text DEFAULT 'draft' CHECK (status IN ('draft','sent','viewed','signed','expired')),
  ghl_document_id text,
  sent_at timestamptz,
  signed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 8. Content plans (60/90 day strategies)
CREATE TABLE content_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  plan_type text CHECK (plan_type IN ('60_day','90_day','custom')),
  pillars jsonb,
  weekly_cadence jsonb,
  posting_schedule jsonb,
  start_date date,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now()
);

-- 9. Video reviews (client testimonials)
CREATE TABLE video_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  video_url text,
  status text DEFAULT 'requested' CHECK (status IN ('requested','uploaded','approved','published')),
  requested_at timestamptz DEFAULT now(),
  uploaded_at timestamptz
);

-- 10. Notifications (cross-channel)
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  channel text DEFAULT 'portal' CHECK (channel IN ('portal','email','sms','whatsapp','slack')),
  read boolean DEFAULT false,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- 11. Template library
CREATE TABLE templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text CHECK (category IN ('website','script','carousel','email_sequence','automation','content_plan','agreement')),
  industry text,
  name text NOT NULL,
  description text,
  template_data jsonb NOT NULL,
  usage_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 12. Cron job registry (persistent scheduled tasks)
CREATE TABLE cron_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cron_expression text NOT NULL,
  agent_id text NOT NULL,
  prompt text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active','paused')),
  last_run timestamptz,
  next_run timestamptz,
  run_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 13. Social channel tracking per client
CREATE TABLE client_social_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  platform text NOT NULL,
  handle text,
  connected boolean DEFAULT false,
  ghl_connected boolean DEFAULT false,
  included_in_package boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

### Columns to Add to Existing `clients` Table

```sql
ALTER TABLE clients ADD COLUMN auth_user_id uuid REFERENCES auth.users(id);
ALTER TABLE clients ADD COLUMN ghl_contact_id text;
ALTER TABLE clients ADD COLUMN ghl_location_id text;
ALTER TABLE clients ADD COLUMN subdomain text UNIQUE;
ALTER TABLE clients ADD COLUMN status text DEFAULT 'trial';
ALTER TABLE clients ADD COLUMN onboarding_status text;
ALTER TABLE clients ADD COLUMN clone_photo_url text;
ALTER TABLE clients ADD COLUMN clone_recording_url text;
ALTER TABLE clients ADD COLUMN brand_kit jsonb DEFAULT '{}';
ALTER TABLE clients ADD COLUMN package_tier text;
ALTER TABLE clients ADD COLUMN content_approval_mode text DEFAULT 'manual';
ALTER TABLE clients ADD COLUMN portal_activated_at timestamptz;
ALTER TABLE clients ADD COLUMN offboarded_at timestamptz;
```

### Role Expansion

```sql
ALTER TYPE app_role ADD VALUE 'client';
```

---

## 5. NEW ROUTES & PAGES

### Client Portal (role: client)

| Route | Component | Purpose |
|-------|-----------|---------|
| `/portal` | PortalDashboard | Service status, health score, notifications, quick actions |
| `/portal/content` | PortalContent | View content, approve/revise, upload assets, auto-approve timer |
| `/portal/website` | PortalWebsite | View staging/live site, request changes |
| `/portal/brand` | PortalBrand | Upload clone photo, recording, brand assets, logos |
| `/portal/onboarding` | PortalOnboarding | Checklist: intake form, clone setup, social connect, strategy |
| `/portal/billing` | PortalBilling | Invoice history, payment status, package details |
| `/portal/reviews` | PortalReviews | Upload video review (requested after 1 month) |
| `/portal/education` | PortalEducation | Dashboard tips, marketing guides, AI-generated pain point content |

### Admin Expansion

| Route | Component | Purpose |
|-------|-----------|---------|
| `/agents` | AgentDashboard | Task queue across all agents, handoff visualization |
| `/agents/:agentId` | AgentDetail | Single agent tasks, performance, cost, memory |
| `/webhooks` | WebhookLog | Event log, routing rules, retry failed |
| `/costs` | CostLedger | Per-client cost breakdown, margin analysis |
| `/templates` | TemplateLibrary | Industry templates for all asset types |
| `/health` | ClientHealth | Health scores, churn prediction, upsell triggers |
| `/onboarding` | OnboardingPipeline | Kanban for onboarding stages |

---

## 6. NEW HOOKS

| Hook | Purpose |
|------|---------|
| `useAgentTasks` | CRUD + realtime for agent_tasks. Filters by agent, status, client. Powers Sprint board + Agent dashboard. |
| `usePipelineOps` | Multi-pipeline CRUD. Replaces single pipeline_stage. |
| `useContentApproval` | Approval flow: submit, approve, revise (max 3), auto-approve at 5 days. |
| `useCostLedger` | Aggregate costs by client/provider/period. |
| `useClientHealth` | Compute composite health score. Trigger upsell notifications. |
| `useWebhookEvents` | Subscribe to webhook_events realtime. Route to agent tasks. |
| `useNotifications` | Realtime subscription, unread count, mark-as-read. |
| `useClientPortal` | Fetch all portal data for a client user. |
| `useGHLSync` | GHL API wrapper: contacts, opportunities, conversations. |
| `useTemplates` | CRUD for template library by industry/category. |
| `useRoleGuard` | Current user role + permissions. Gates portal vs admin. |
| `useSocialChannels` | Track connected vs package channels per client. Trigger fallback notifications. |

---

## 7. BUILD PHASES

### Phase 0: Foundation (Week 1-2)
> Everything else depends on this.

- [ ] Run Supabase migrations (all 13 new tables + clients columns + role expansion)
- [ ] Build `useRoleGuard` hook
- [ ] Update `ProtectedRoute` to support `requireClient` prop
- [ ] Update `useAuth` to expose `isClient`, `clientRecord`
- [ ] Update `Sidebar` to show portal nav for client role, admin nav for admin/rep
- [ ] Update `App.tsx` with all new routes + role-based redirect (client → `/portal`)
- [ ] Build `useNotifications` hook with realtime

### Phase 1: Multi-Pipeline + Agent Queue (Week 2-3)
> The operational backbone.

- [ ] Build `usePipelineOps` hook
- [ ] Refactor `Pipeline.tsx` — 3 pipeline tabs matching GHL (New Leads, Sales, Onboarding)
- [ ] Build `useAgentTasks` hook with realtime
- [ ] Wire AI Command IDE Sprint board to real `agent_tasks`
- [ ] Wire AI Command IDE Activity tab to real `ai_logs`
- [ ] Wire Dashboard "Today's Tasks" and "Recent AI Activity" to same data sources
- [ ] Build agent handoff protocol — when task completes, auto-create downstream task

### Phase 2: Webhook Orchestration + GHL Sync (Week 3-4)
> Connects GHL to the agent workforce.

- [ ] Create Supabase Edge Function: `handle-ghl-webhook`
- [ ] Build webhook routing: event_type → agent_task creation
- [ ] Build `useGHLSync` hook
- [ ] Build `useWebhookEvents` hook
- [ ] Build `WebhookLog.tsx` page
- [ ] Wire `Leads.tsx` to real data + GHL contact sync
- [ ] Configure GHL webhook endpoints pointing to Supabase

### Phase 3: Content Approval + Client Portal (Week 4-6)
> The client-facing product.

- [ ] Build `useContentApproval` hook (3 revisions, auto-approve at 5 days)
- [ ] Build `useClientPortal` hook
- [ ] Build all portal pages: Dashboard, Content, Website, Brand, Onboarding, Billing, Reviews, Education
- [ ] Build `useSocialChannels` hook + fallback notifications
- [ ] Wire `Content.tsx` scripts/production to real DB
- [ ] Build content revision flow: agent fixes → human approves → portal noti + text + Slack
- [ ] Build `OnboardingPipeline.tsx` page with checklist per client

### Phase 4: Cost Tracking + Health + Templates (Week 6-7)
> Business intelligence layer.

- [ ] Build `useCostLedger` hook
- [ ] Build `CostLedger.tsx` page — per-client margins
- [ ] Build `useClientHealth` hook — composite scoring
- [ ] Build `ClientHealth.tsx` page — health dashboard with upsell triggers
- [ ] Build `useTemplates` hook
- [ ] Build `TemplateLibrary.tsx` page
- [ ] Build `PortalReviews.tsx` — video review upload after 1 month
- [ ] Wire `Finances.tsx` to real transactions + cost ledger

### Phase 5: Agent Orchestration + Error Handling (Week 7-8)
> Autonomous operations.

- [ ] Build agent self-check: validate output before marking done
- [ ] Build error escalation: 2 errors/hour → `escalated` status → WhatsApp notification
- [ ] Build rate limit queue: per-provider limits (HeyGen, OpenArt, Stitch)
- [ ] Wire Console commands to real agent task creation
- [ ] Build AI-driven upsell triggers: analytics → health score → notification (portal + email + text)
- [ ] Build agreement generation: Claude creates → PM tool stores → GHL delivers

### Phase 6: Website Control + Off-boarding + Polish (Week 8-9)
> Full lifecycle completion.

- [ ] Build website staging preview flow (Vercel preview URLs)
- [ ] Wire `Websites.tsx` to real data + deploy controls + template library
- [ ] Build off-boarding flow: pause all tasks/crons, export design files, remove clone, archive data
- [ ] Configure subdomain routing for client portals
- [ ] Seed template library with industry templates (PW, Landscaping, HVAC, Roofing, Painting)
- [ ] Wire all remaining mock data to real DB across every page

---

## 8. SOCIAL MEDIA CHANNEL HANDLING

### Rules
1. When client connects social accounts via GHL link, webhook updates `client_social_channels`
2. Agent checks: connected channels vs package-included channels
3. If **fewer channels connected than purchased**: email + portal notification asking them to connect remaining
4. If **more channels connected than purchased**: email informing we'll only post to included channels, with upsell CTA for additional channels
5. If **channel disconnects mid-service**: pause posting to that channel, notify client via SMS + portal, retry connection check in 24 hours

### Package-to-Channel Mapping
| Package | Channels Included |
|---------|------------------|
| Content Starter ($297-1,297) | 1 channel |
| Growth ($1,297-2,500) | 2 channels |
| Full Acquisition ($2,500-5,000) | 3 channels |
| Enterprise ($5,000+) | All connected channels |

---

## 9. ERROR HANDLING & ESCALATION PROTOCOL

```
Agent receives task
        │
        ▼
Execute task
        │
   ┌────┴────┐
   │         │
Success    Error
   │         │
   ▼         ▼
Self-check  Increment error_count
output      Log error to last_error
   │         │
   │    ┌────┴────┐
   │    │         │
   │  <2 errors  >=2 errors
   │  this hour   this hour
   │    │         │
   │    ▼         ▼
   │  Retry     Set status = 'escalated'
   │  task      Send WhatsApp to Daysha
   │            Send Slack alert
   │            Create notification
   │
   ▼
Mark complete
Trigger handoff
(create downstream task)
```

---

## 10. CONTENT APPROVAL FLOW

```
Content Producer creates script
        │
        ▼
Submit to client (status: pending)
Set auto_approve_at = now + 5 days
Notify: portal + SMS + Slack
        │
   ┌────┴──────────────────┐
   │                       │
Client responds        5 days pass
   │                       │
   ├── Approved            ▼
   │   └── Status: approved    Status: auto_approved
   │       Move to scheduling  Move to scheduling
   │       Notify Social Mgr   Notify Social Mgr
   │
   ├── Revision requested (revision_number < 3)
   │   └── Status: revision_requested
   │       Agent fixes content
   │       Human (Daysha) approves agent output
   │       Resubmit to client
   │       Reset auto_approve_at
   │
   └── Revision requested (revision_number >= 3)
       └── Escalate to Daysha
           Human handles revision
```

---

## 11. OFF-BOARDING PROTOCOL

1. Set `clients.status = 'offboarding'`
2. Pause all `agent_tasks` for this client
3. Pause all `cron_registry` jobs referencing this client
4. Cancel any pending `content_approvals`
5. Generate website design file export (ZIP)
6. Delete HeyGen clone data (photo + recording)
7. Cancel GHL workflows and sequences for this contact
8. Send off-boarding confirmation email via GHL
9. Set `clients.status = 'offboarded'`, `clients.offboarded_at = now()`
10. Retain data for 90 days, then archive

---

## 12. UPSELL INTELLIGENCE TRIGGERS

| Signal | Condition | Upsell | Delivery |
|--------|-----------|--------|----------|
| Content engagement growing | > 20% MoM for 2+ months | More content / higher package | Portal + email + text |
| High website traffic | > 500 visits/mo | Paid ads management | Portal + email + text |
| Client uploads frequently | > 5 uploads/month | Bigger content package | Portal notification |
| Good payment history | 3+ months on time | Annual discount offer | Email |
| Low engagement | < 5% engagement rate | Strategy pivot meeting | CEO Agent escalation |
| Missing channels | Purchased 1, has 3 social | Additional channel posting | Portal + email |
| Growth plateau | Engagement flat 3+ months | Full client acquisition system | Sales Agent outreach |
| Video review submitted | Published review | Referral program offer | Email + text |

---

## 13. CLIENT PORTAL EDUCATION SYSTEM (Paid Clients Only)

### Content Types
1. **Dashboard tutorials** — How to use the portal, approve content, track services
2. **Marketing tips** — Industry-specific marketing guides (AI-generated based on client vertical)
3. **Systems education** — How GHL works, understanding automations, reading analytics
4. **AI-generated insights** — Based on client's pain points from intake form and ongoing analytics
5. **Video walkthroughs** — Screen recordings of their specific setup

### Gating
- Trial clients: NO portal access
- Paid clients: Full access to all education content
- Content is generated per-client based on their industry, package, and pain points

---

## 14. TECHNOLOGY STACK SUMMARY

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Vite + shadcn + Tailwind | PM Tool + Client Portal (same app) |
| Backend | Supabase (Postgres + Auth + Edge Functions + Realtime) | Data, auth, webhooks, realtime |
| CRM | GoHighLevel | SMS, email, social posting, payments, calendar |
| AI Backbone | Claude (Anthropic) via MCP | Agent orchestration, content gen, agreement gen |
| Video | HeyGen + Eleven Labs | AI clone videos, voice cloning |
| Images | OpenArt | Social media post generation |
| Websites | Google Stitch MCP + Firecrawl | Auto-generate client sites from GMB |
| Hosting | Vercel | PM Tool + client websites |
| Scheduling | GHL Social Planner | Social media posting to client channels |
| Monitoring | WhatsApp + Slack | Agent escalation alerts |
| Payments | GHL Payments / Stripe | Invoicing, subscriptions |
