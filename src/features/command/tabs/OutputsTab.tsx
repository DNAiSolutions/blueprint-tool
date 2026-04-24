import { useMemo, useState } from "react";
import {
  OUTPUTS,
  OUTPUT_TYPE_META,
  STATUS_META,
  type OutputStatus,
  type WorkflowOutput,
} from "../data/outputs";
import { WORKFLOWS } from "../data/workflows";
import { getAgent } from "../data/agents";
import { PixelIcon } from "../PixelIcon";

const STATUS_ORDER: OutputStatus[] = ["shipped", "approved", "in_review", "draft"];

export function OutputsTab() {
  const [wfFilter, setWfFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<OutputStatus | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return OUTPUTS.filter((o) => {
      if (wfFilter !== "all" && o.workflow !== wfFilter) return false;
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      return true;
    });
  }, [wfFilter, statusFilter]);

  const byStatus = useMemo(() => {
    const out: Record<OutputStatus, WorkflowOutput[]> = {
      shipped: [],
      approved: [],
      in_review: [],
      draft: [],
    };
    for (const o of filtered) out[o.status].push(o);
    for (const k of STATUS_ORDER) {
      out[k].sort((a, b) => b.producedAt.localeCompare(a.producedAt));
    }
    return out;
  }, [filtered]);

  const totals = useMemo(() => {
    const t = { shipped: 0, approved: 0, in_review: 0, draft: 0 };
    for (const o of OUTPUTS) t[o.status]++;
    return t;
  }, []);

  const selectedOutput = selected ? OUTPUTS.find((o) => o.id === selected) ?? null : null;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-baseline justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">Outputs</h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            What the flows are producing right now. Everything the agents ship — proposals, scripts, videos,
            carousels, emails, portals — lives here, grouped by status.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StatPill label="Shipped" value={totals.shipped} color="#7E5BDC" />
          <StatPill label="Approved" value={totals.approved} color="#14E0E0" />
          <StatPill label="In Review" value={totals.in_review} color="#FFB547" />
          <StatPill label="Draft" value={totals.draft} color="#606080" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center flex-wrap gap-2 mb-5">
        <Chip label="All flows" active={wfFilter === "all"} onClick={() => setWfFilter("all")} />
        {WORKFLOWS.map((w) => {
          const a = getAgent(w.agent);
          return (
            <Chip
              key={w.id}
              label={w.name}
              active={wfFilter === w.id}
              onClick={() => setWfFilter(w.id)}
              color={a?.color}
              icon={a ? <PixelIcon name={a.icon} color={a.color} size={12} /> : null}
            />
          );
        })}
        <div className="w-px h-4 bg-white/10 mx-1" />
        <Chip label="Any status" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
        {STATUS_ORDER.map((s) => (
          <Chip
            key={s}
            label={STATUS_META[s].label}
            active={statusFilter === s}
            onClick={() => setStatusFilter(s)}
            color={STATUS_META[s].color}
          />
        ))}
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATUS_ORDER.map((status) => {
          const items = byStatus[status];
          const meta = STATUS_META[status];
          return (
            <div
              key={status}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 min-h-[220px]"
            >
              <div className="flex items-center justify-between px-1 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}88` }}
                  />
                  <span className="text-[10px] uppercase tracking-widest text-slate-400">
                    {meta.label}
                  </span>
                </div>
                <span className="text-[10px] text-slate-600 font-mono">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.length === 0 && (
                  <div className="text-[11px] text-slate-600 italic px-2 py-4 text-center">nothing here</div>
                )}
                {items.map((o) => (
                  <OutputCard
                    key={o.id}
                    output={o}
                    selected={selected === o.id}
                    onClick={() => setSelected(o.id === selected ? null : o.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail */}
      {selectedOutput && (
        <OutputDetail output={selectedOutput} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">
      <span className="text-[10px] uppercase tracking-widest text-slate-500">{label}</span>
      <span className="text-sm font-bold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
  color,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
  icon?: React.ReactNode;
}) {
  const tint = color ?? "#14E0E0";
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] transition-all",
        active ? "text-white" : "text-slate-400 hover:text-white",
      ].join(" ")}
      style={
        active
          ? {
              background: `linear-gradient(90deg, ${tint}33, ${tint}11)`,
              border: `1px solid ${tint}77`,
              boxShadow: `0 0 10px ${tint}33`,
            }
          : {
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }
      }
    >
      {icon}
      {label}
    </button>
  );
}

function OutputCard({
  output,
  selected,
  onClick,
}: {
  output: WorkflowOutput;
  selected: boolean;
  onClick: () => void;
}) {
  const agent = getAgent(output.agent);
  const typeMeta = OUTPUT_TYPE_META[output.type];
  return (
    <button
      onClick={onClick}
      className={[
        "w-full text-left rounded-lg p-3 transition-all",
        selected
          ? "bg-white/[0.06] shadow-[0_0_14px_rgba(20,224,224,0.2)]"
          : "bg-white/[0.02] hover:bg-white/[0.04]",
      ].join(" ")}
      style={{ borderLeft: `2px solid ${typeMeta.color}` }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[10px] uppercase tracking-widest font-mono" style={{ color: typeMeta.color }}>
          {typeMeta.label}
        </span>
        {agent && (
          <>
            <span className="text-slate-700">·</span>
            <PixelIcon name={agent.icon} color={agent.color} size={10} />
            <span className="text-[10px] text-slate-500 truncate">{agent.name}</span>
          </>
        )}
      </div>
      <div className="text-[13px] text-white font-medium leading-tight line-clamp-2 mb-1">
        {output.title}
      </div>
      <div className="text-[11px] text-slate-400 leading-snug line-clamp-2">{output.summary}</div>
      <div className="text-[10px] text-slate-600 font-mono mt-2">{formatAge(output.producedAt)}</div>
    </button>
  );
}

function OutputDetail({ output, onClose }: { output: WorkflowOutput; onClose: () => void }) {
  const agent = getAgent(output.agent);
  const workflow = WORKFLOWS.find((w) => w.id === output.workflow);
  const typeMeta = OUTPUT_TYPE_META[output.type];
  const statusMeta = STATUS_META[output.status];
  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="rounded-xl px-3 py-2 text-xs font-mono flex-shrink-0"
            style={{ background: `${typeMeta.color}22`, border: `1px solid ${typeMeta.color}55`, color: typeMeta.color }}
          >
            {typeMeta.label}
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-base">{output.title}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {agent && (
                <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <PixelIcon name={agent.icon} color={agent.color} size={12} />
                  {agent.name}
                </span>
              )}
              <span className="text-slate-600">·</span>
              <span className="text-[11px] text-slate-400">{workflow?.name ?? output.workflow}</span>
              <span className="text-slate-600">·</span>
              <span
                className="text-[11px] px-2 py-0.5 rounded-full"
                style={{ background: `${statusMeta.color}22`, color: statusMeta.color }}
              >
                {statusMeta.label}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[11px] text-slate-500 font-mono">{formatAge(output.producedAt)}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white text-lg leading-none flex-shrink-0">
          ×
        </button>
      </div>
      <p className="text-[13px] text-slate-300 leading-relaxed">{output.summary}</p>
      {output.url && (
        <a
          href={output.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 mt-4 text-[12px] px-3 py-1 rounded-full border border-[#14E0E0]/40 bg-[#14E0E0]/10 text-[#14E0E0] hover:bg-[#14E0E0]/20 transition"
        >
          Open ↗
        </a>
      )}
    </div>
  );
}

function formatAge(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
