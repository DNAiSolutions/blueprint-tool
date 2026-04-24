import { ALL_AGENTS, AgentStatus } from "../data/agents";
import { PixelIcon } from "../PixelIcon";
import type { StatusMap } from "../useAgentStatuses";

type Props = {
  statuses?: StatusMap;
};

const statusMeta: Record<AgentStatus, { label: string; dot: string; pulse: boolean }> = {
  active:  { label: "Active",  dot: "bg-[#14E0E0] shadow-[0_0_10px_rgba(20,224,224,0.8)]", pulse: true },
  waiting: { label: "Waiting", dot: "bg-[#FF5577] shadow-[0_0_10px_rgba(255,85,119,0.8)]", pulse: true },
  recent:  { label: "Recent",  dot: "bg-[#FFB547] shadow-[0_0_8px_rgba(255,181,71,0.6)]", pulse: false },
  idle:    { label: "Idle",    dot: "bg-slate-600", pulse: false },
  offline: { label: "Offline", dot: "bg-slate-800", pulse: false },
};

export function AgentsTab({ statuses = {} }: Props) {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-1">Agents</h2>
        <p className="text-sm text-slate-400">Live status for every specialist on the DigitalDNA team.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_AGENTS.map((agent) => {
          const entry = statuses[agent.id];
          const status: AgentStatus = entry?.displayStatus ?? "idle";
          const task = entry?.task;
          const meta = statusMeta[status];
          return (
            <div
              key={agent.id}
              className="group rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="rounded-xl p-2 flex-shrink-0"
                  style={{ background: `${agent.color}22`, border: `1px solid ${agent.color}44` }}
                >
                  <PixelIcon name={agent.icon} color={agent.color} size={32} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`h-2 w-2 rounded-full ${meta.dot} ${meta.pulse ? "animate-pulse" : ""}`} />
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">{meta.label}</span>
                  </div>
                  <h3 className="text-white font-semibold text-sm leading-tight">{agent.name}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">{agent.role}</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-3">{agent.description}</p>
              {task ? (
                <div className="text-[11px] font-mono text-cyan-300/80 truncate border-t border-white/5 pt-2">
                  ▸ {task}
                </div>
              ) : (
                <div className="text-[11px] font-mono text-slate-600 border-t border-white/5 pt-2">— no active task</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
