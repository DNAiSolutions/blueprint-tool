import { TEAM_LEAD, AGENTS, MISSION } from "../data/agents";
import { PixelIcon } from "../PixelIcon";

export function TeamTab() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Team</h2>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">{MISSION}</p>
      </div>

      {/* Lead */}
      <div className="mb-12 flex justify-center">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#14E0E0]/20 via-[#4A82E8]/20 to-[#7E5BDC]/20 blur-xl" />
          <div className="relative rounded-3xl border border-slate-300 dark:border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div
                className="rounded-2xl p-3 flex-shrink-0"
                style={{ background: `${TEAM_LEAD.color}2A`, border: `1px solid ${TEAM_LEAD.color}66` }}
              >
                <PixelIcon name={TEAM_LEAD.icon} color={TEAM_LEAD.color} size={44} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-white bg-gradient-to-r from-[#14E0E0] to-[#7E5BDC] bg-clip-text text-transparent">
                    {TEAM_LEAD.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{TEAM_LEAD.name}</h3>
                <div className="text-xs text-slate-400">{TEAM_LEAD.role}</div>
              </div>
            </div>
            <p className="text-xs text-slate-300/80 leading-relaxed mt-4">{TEAM_LEAD.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-4">
              {TEAM_LEAD.skills.map((s) => (
                <span
                  key={s}
                  className="text-[10px] px-2 py-0.5 rounded-full border border-slate-300 dark:border-white/10 bg-white/5 text-slate-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Line connector */}
      <div className="flex justify-center mb-8">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* Agents grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {AGENTS.map((agent) => (
          <div
            key={agent.id}
            className="rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] p-4 hover:border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="rounded-lg p-1.5 flex-shrink-0"
                style={{ background: `${agent.color}22`, border: `1px solid ${agent.color}44` }}
              >
                <PixelIcon name={agent.icon} color={agent.color} size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-slate-900 dark:text-white font-semibold text-xs leading-tight">{agent.name}</div>
                <div className="text-[10px] text-slate-500">{agent.role}</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3 mb-3">{agent.description}</p>
            <div className="flex flex-wrap gap-1">
              {agent.skills.slice(0, 3).map((s) => (
                <span key={s} className="text-[9px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] text-slate-400">
                  {s}
                </span>
              ))}
              {agent.skills.length > 3 && (
                <span className="text-[9px] px-1.5 py-0.5 text-slate-500">+{agent.skills.length - 3}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
