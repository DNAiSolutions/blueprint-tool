import { MISSION, ALL_AGENTS } from "../data/agents";
import { WORKFLOWS } from "../data/workflows";
import { CRONS } from "../data/crons";

export function WelcomeTab() {
  return (
    <div className="p-10 max-w-4xl mx-auto">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-[0.3em] text-cyan-300/80 mb-3">DigitalDNA Command</div>
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
          One console for every agent, every workflow, every signal.
        </h1>
        <p className="text-slate-300/80 text-base leading-relaxed max-w-2xl">{MISSION}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <StatCard label="Agents" value={ALL_AGENTS.length} />
        <StatCard label="Workflows" value={WORKFLOWS.length} />
        <StatCard label="Scheduled tasks" value={CRONS.filter((c) => c.enabled).length} />
        <StatCard label="Active views" value={7} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <InfoCard
          title="How to use this console"
          body="Use the tabs on the left to move between views. Agents shows live status. Flows lights up when agents run pipelines. Skill Trees maps what every agent can do. Crons is the weekly schedule. Team is the org chart."
        />
        <InfoCard
          title="Who's running it"
          body="The CEO agent orchestrates the room. She delegates to 8 specialists — content production, content intelligence, design, distribution, video, docs, and custom software — and reports up to Daysha."
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm">
      <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">{label}</div>
      <div className="text-3xl font-bold bg-gradient-to-r from-[#14E0E0] via-[#4A82E8] to-[#7E5BDC] bg-clip-text text-transparent">
        {value}
      </div>
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
    </div>
  );
}
