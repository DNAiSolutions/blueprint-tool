
# DigitalDNA Command Center — Implementation Plan

## Approach
Build incrementally in phases. ALIGN components are preserved and embedded — never rebuilt. Single admin user (Daysha), dark-only theme.

---

## Phase 1: Foundation (This Session)

### 1A. Database Migration
Create all new tables: `clients`, `scripts`, `production_jobs`, `websites`, `leads`, `transactions`, `invoices`, `ai_logs`, `integrations`, `tasks` — with RLS policies (admin-only access via existing `has_role` function).

### 1B. Design System Update
- Update `index.css` with new color tokens from the spec (`--bg-primary: #0A1628`, `--bg-surface: #111827`, `--accent: #00D4AA`, etc.)
- Add Inter + JetBrains Mono fonts
- Update Tailwind config with new semantic tokens

### 1C. Navigation Shell
- Collapsible sidebar (240px expanded / 64px collapsed) with all 8 modules
- `AppLayout.tsx` wrapper component
- Update routing in `App.tsx` for all module paths

### 1D. Dashboard (`/`)
- 4 KPI cards (Active Clients, Content Queue, MRR, Leads This Week)
- Today's Tasks table
- Content Calendar mini (week strip)
- Pipeline Snapshot (horizontal bars per stage)
- Revenue Progress bar
- AI Activity Feed

### 1E. Pipeline Module (`/pipeline`)
- Kanban board with 6 columns (Leads → Live)
- Draggable client cards
- Client Detail Drawer (480px, right slide)
  - **Discovery tab**: embeds existing ALIGN canvas + question panel
  - **Readiness tab**: embeds existing ALIGN AI Readiness panel
  - Overview, Audit, Strategy, Website, Content, Comms, Billing tabs (shells)
- Add Client modal

---

## Phase 2: Content Studio (Next Session)
- Calendar, Script Editor, Metadata Panel, Storyboard Builder
- Production Queue with realtime status
- Review Grid, Published Table

## Phase 3: Websites, Leads, AI Command (Following Sessions)
## Phase 4: Finances, Settings (Final Sessions)

---

## Key Decisions
1. **Existing ALIGN routes**: `/canvas/:sessionId` stays working. Dashboard replaces the session list at `/`.
2. **Design tokens**: New color system applied globally; ALIGN components inherit the updated tokens.
3. **No external API integrations yet**: Edge function stubs created, actual API calls added when keys are configured.
4. **Font**: Using Inter (not Plus Jakarta Sans from the reference screenshots — those are from a different project). Using the spec's Inter + JetBrains Mono.

## What Gets Built Now
Phase 1 (1A–1E) — the navigation shell, design system, database, Dashboard, and Pipeline with ALIGN embedding.
