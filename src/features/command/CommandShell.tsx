import { useState } from "react";
import {
  Home,
  Users as UsersIcon,
  Workflow,
  Sparkles,
  CalendarDays,
  Network,
  Grid3x3,
  Package,
  Terminal,
  KanbanSquare,
  Brain,
  FileText,
} from "lucide-react";
import { WelcomeTab } from "./tabs/WelcomeTab";
import { AgentsTab } from "./tabs/AgentsTab";
import { TeamTab } from "./tabs/TeamTab";
import { IconsTab } from "./tabs/IconsTab";
import { CronsTab } from "./tabs/CronsTab";
import { FlowsTab } from "./tabs/FlowsTab";
import { SkillTreesTab } from "./tabs/SkillTreesTab";
import { OutputsTab } from "./tabs/OutputsTab";
import { ALL_AGENTS, type AgentStatus } from "./data/agents";
import { PixelIcon } from "./PixelIcon";
import { useAgentStatuses } from "./useAgentStatuses";
// Blueprint-tool keepers from the old AICommand — preserved alongside
// the RUBRIC views per the merge plan.
import { ConsoleTab } from "@/components/command-center/ConsoleTab";
import { SprintTab } from "@/components/command-center/SprintTab";
import { MemoryTab } from "@/components/command-center/MemoryTab";
import { DocsTab } from "@/components/command-center/DocsTab";

type TabKey =
  | "welcome"
  | "agents"
  | "flows"
  | "outputs"
  | "skill-trees"
  | "crons"
  | "team"
  | "icons"
  | "console"
  | "sprint"
  | "memory"
  | "docs";

type TabDef = {
  key: TabKey;
  label: string;
  icon: typeof Home;
  group?: "rubric" | "blueprint";
};

// Tabs are grouped into two sections in the sidebar: the RUBRIC views
// that came with the Command Center port, and the blueprint-tool
// keepers that were already in AICommand before the port (Console for
// agent dispatch, Sprint for kanban, Memory for long-term context,
// Docs for agent documentation).
const TABS: TabDef[] = [
  { key: "welcome", label: "Welcome", icon: Home, group: "rubric" },
  { key: "agents", label: "Agents", icon: UsersIcon, group: "rubric" },
  { key: "flows", label: "Flows", icon: Workflow, group: "rubric" },
  { key: "outputs", label: "Outputs", icon: Package, group: "rubric" },
  { key: "skill-trees", label: "Skill Trees", icon: Sparkles, group: "rubric" },
  { key: "crons", label: "Crons", icon: CalendarDays, group: "rubric" },
  { key: "team", label: "Team", icon: Network, group: "rubric" },
  { key: "icons", label: "Icons", icon: Grid3x3, group: "rubric" },
  { key: "console", label: "Console", icon: Terminal, group: "blueprint" },
  { key: "sprint", label: "Sprint", icon: KanbanSquare, group: "blueprint" },
  { key: "memory", label: "Memory", icon: Brain, group: "blueprint" },
  { key: "docs", label: "Docs", icon: FileText, group: "blueprint" },
];

const dotClass: Record<AgentStatus, string> = {
  active:  "bg-[#14E0E0] shadow-[0_0_8px_rgba(20,224,224,0.8)] animate-pulse",
  waiting: "bg-[#FF5577] shadow-[0_0_8px_rgba(255,85,119,0.8)] animate-pulse",
  recent:  "bg-[#FFB547] shadow-[0_0_6px_rgba(255,181,71,0.6)]",
  idle:    "bg-slate-700",
  offline: "bg-slate-800",
};

export function CommandShell() {
  const [active, setActive] = useState<TabKey>("welcome");
  const { statuses } = useAgentStatuses();
  const activeCount = Object.values(statuses).filter(
    (s) => s.displayStatus === "active" || s.displayStatus === "waiting"
  ).length;

  return (
    <div
      className="flex text-white font-sans"
      style={{
        height: "100vh", // blueprint-tool: renders standalone, no wrapper header
        background:
          "radial-gradient(1100px 700px at 18% -10%, rgba(20,224,224,0.08), transparent 55%), radial-gradient(1200px 800px at 100% 120%, rgba(126,91,220,0.10), transparent 60%), #0A0A12",
      }}
    >
      {/* Sub-sidebar */}
      <aside className="w-60 flex-shrink-0 border-r border-white/5 flex flex-col">
        {/* Brand */}
        <div className="px-4 pt-6 pb-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <BrandHelix />
            <div className="leading-none">
              <div className="text-[17px] font-bold tracking-tight">
                <span className="text-white">Digital</span>
                <span className="bg-gradient-to-r from-[#14E0E0] via-[#4A82E8] to-[#7E5BDC] bg-clip-text text-transparent">
                  DNA
                </span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 mt-1">
                Command Center
              </div>
            </div>
          </div>
          <div className="text-[9px] uppercase tracking-widest text-slate-600 mt-4">
            We build the machine
          </div>
        </div>

        {/* Agent status rail */}
        <div className="px-3 py-3 border-b border-white/5">
          <div className="text-[9px] uppercase tracking-widest text-slate-500 px-2 mb-2">
            Agents
          </div>
          <div className="space-y-0.5">
            {ALL_AGENTS.map((a) => {
              const entry = statuses[a.id];
              const s: AgentStatus = entry?.displayStatus ?? "idle";
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/[0.03] cursor-default"
                  title={entry?.task ? `${a.name} — ${entry.task}` : a.name}
                >
                  <PixelIcon name={a.icon} color={a.color} size={14} />
                  <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${dotClass[s]}`} />
                  <span className="text-[11px] text-slate-400 truncate">{a.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {TABS.map((t, i) => {
            const Icon = t.icon;
            const isActive = active === t.key;
            const prev = TABS[i - 1];
            const showDivider = prev && prev.group !== t.group;
            return (
              <div key={t.key}>
                {showDivider && (
                  <div className="my-2 pt-2 px-3 text-[9px] uppercase tracking-widest text-slate-600 border-t border-white/5">
                    Blueprint
                  </div>
                )}
                <button
                  onClick={() => setActive(t.key)}
                  className={[
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-[13px] font-medium text-left transition-all",
                    isActive
                      ? "bg-gradient-to-r from-[#14E0E0]/18 via-[#4A82E8]/14 to-[#7E5BDC]/18 text-white shadow-[inset_0_0_0_1px_rgba(20,224,224,0.25),0_0_18px_rgba(20,224,224,0.25)]"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]",
                  ].join(" ")}
                >
                  <Icon className={"h-3.5 w-3.5 " + (isActive ? "text-[#14E0E0]" : "opacity-60")} />
                  {t.label}
                </button>
              </div>
            );
          })}
        </nav>

        <div className="px-4 pb-4 text-[9px] text-slate-600 leading-relaxed">
          Created by <a className="hover:text-slate-400" href="https://robolabs.so" target="_blank" rel="noreferrer">RoboLabs</a> ·{" "}
          Learn more at <a className="hover:text-slate-400" href="https://robonuggets.com" target="_blank" rel="noreferrer">RoboNuggets</a>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 flex-shrink-0 border-b border-white/5 flex items-center justify-between px-6">
          <div className="text-[12px] uppercase tracking-[0.22em] text-slate-400 font-mono">
            {TABS.find((t) => t.key === active)?.label}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span
              className={
                "h-1.5 w-1.5 rounded-full " +
                (activeCount > 0
                  ? "bg-[#14E0E0] animate-pulse shadow-[0_0_8px_rgba(20,224,224,0.8)]"
                  : "bg-slate-600")
              }
            />
            {activeCount > 0 ? `${activeCount} active` : "idle"}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {active === "welcome" && <WelcomeTab />}
          {active === "agents" && <AgentsTab statuses={statuses} />}
          {active === "team" && <TeamTab />}
          {active === "icons" && <IconsTab />}
          {active === "flows" && <FlowsTab />}
          {active === "skill-trees" && <SkillTreesTab />}
          {active === "crons" && <CronsTab />}
          {active === "outputs" && <OutputsTab />}
          {active === "console" && (
            <div className="h-full">
              <ConsoleTab />
            </div>
          )}
          {active === "sprint" && (
            <div className="h-full">
              <SprintTab />
            </div>
          )}
          {active === "memory" && (
            <div className="h-full">
              <MemoryTab />
            </div>
          )}
          {active === "docs" && (
            <div className="h-full">
              <DocsTab />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function BrandHelix() {
  return (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none" className="flex-shrink-0">
      <defs>
        <linearGradient id="ddnaHelix" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#14E0E0" />
          <stop offset="55%" stopColor="#4A82E8" />
          <stop offset="100%" stopColor="#7E5BDC" />
        </linearGradient>
      </defs>
      <g stroke="url(#ddnaHelix)" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M10 10 Q24 24 38 10" />
        <path d="M10 24 Q24 38 38 24" />
        <path d="M10 38 Q24 24 38 38" opacity="0.55" />
      </g>
      <g fill="url(#ddnaHelix)">
        <circle cx="10" cy="10" r="2.2" />
        <circle cx="38" cy="10" r="2.2" />
        <circle cx="10" cy="24" r="2.2" />
        <circle cx="38" cy="24" r="2.2" />
        <circle cx="10" cy="38" r="2.2" />
        <circle cx="38" cy="38" r="2.2" />
      </g>
    </svg>
  );
}
