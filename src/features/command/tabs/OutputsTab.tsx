import { useEffect, useMemo, useState } from "react";
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
import { OutputPreview } from "../OutputPreview";
import { Download, ExternalLink, Copy, X, LayoutGrid, GitBranch } from "lucide-react";

const STATUS_ORDER: OutputStatus[] = ["shipped", "approved", "in_review", "draft"];

type ViewMode = "status" | "runs";

export function OutputsTab() {
  const [wfFilter, setWfFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<OutputStatus | "all">("all");
  const [view, setView] = useState<ViewMode>("status");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return OUTPUTS.filter((o) => {
      if (wfFilter !== "all" && o.workflow !== wfFilter) return false;
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      return true;
    });
  }, [wfFilter, statusFilter]);

  const totals = useMemo(() => {
    const t = { shipped: 0, approved: 0, in_review: 0, draft: 0 };
    for (const o of OUTPUTS) t[o.status]++;
    return t;
  }, []);

  const lightboxOutput = lightbox ? OUTPUTS.find((o) => o.id === lightbox) ?? null : null;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-baseline justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-1">Outputs</h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            What the flows are producing right now. Videos, carousels, docs, designs, websites — every artifact the
            agents ship lives here with an inline preview and download.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StatPill label="Shipped" value={totals.shipped} color="#7E5BDC" />
          <StatPill label="Approved" value={totals.approved} color="#14E0E0" />
          <StatPill label="In Review" value={totals.in_review} color="#FFB547" />
          <StatPill label="Draft" value={totals.draft} color="#606080" />
        </div>
      </div>

      {/* View toggle + filters */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
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
        <div className="flex items-center p-0.5 rounded-full border border-slate-300 dark:border-white/10 bg-white dark:bg-white/[0.02]">
          <ViewBtn active={view === "status"} onClick={() => setView("status")} icon={<LayoutGrid className="w-3 h-3" />}>
            By status
          </ViewBtn>
          <ViewBtn active={view === "runs"} onClick={() => setView("runs")} icon={<GitBranch className="w-3 h-3" />}>
            By run
          </ViewBtn>
        </div>
      </div>

      {view === "status" ? (
        <StatusBoard filtered={filtered} onExpand={setLightbox} />
      ) : (
        <RunsBoard filtered={filtered} onExpand={setLightbox} />
      )}

      {lightboxOutput && <Lightbox output={lightboxOutput} onClose={() => setLightbox(null)} />}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// VIEW A — kanban by status
// ────────────────────────────────────────────────────────────────────

function StatusBoard({
  filtered,
  onExpand,
}: {
  filtered: WorkflowOutput[];
  onExpand: (id: string) => void;
}) {
  const byStatus = useMemo(() => {
    const out: Record<OutputStatus, WorkflowOutput[]> = {
      shipped: [],
      approved: [],
      in_review: [],
      draft: [],
    };
    for (const o of filtered) out[o.status].push(o);
    for (const k of STATUS_ORDER) out[k].sort((a, b) => b.producedAt.localeCompare(a.producedAt));
    return out;
  }, [filtered]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATUS_ORDER.map((status) => {
        const items = byStatus[status];
        const meta = STATUS_META[status];
        return (
          <div
            key={status}
            className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] p-3 min-h-[220px]"
          >
            <div className="flex items-center justify-between px-1 mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}88` }}
                />
                <span className="text-[10px] uppercase tracking-widest text-slate-400">{meta.label}</span>
              </div>
              <span className="text-[10px] text-slate-600 font-mono">{items.length}</span>
            </div>
            <div className="space-y-3">
              {items.length === 0 && (
                <div className="text-[11px] text-slate-600 italic px-2 py-4 text-center">nothing here</div>
              )}
              {items.map((o) => (
                <OutputCard key={o.id} output={o} onExpand={() => onExpand(o.id)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// VIEW B — grouped by workflow run
// ────────────────────────────────────────────────────────────────────

function RunsBoard({
  filtered,
  onExpand,
}: {
  filtered: WorkflowOutput[];
  onExpand: (id: string) => void;
}) {
  const grouped = useMemo(() => {
    // run groups keyed by runId; ungrouped items keyed by "solo:<id>"
    const groups = new Map<string, WorkflowOutput[]>();
    for (const o of filtered) {
      const key = o.runId ?? "solo:" + o.id;
      const arr = groups.get(key) ?? [];
      arr.push(o);
      groups.set(key, arr);
    }
    // Sort each group by stepIndex then producedAt
    const result: { key: string; items: WorkflowOutput[] }[] = [];
    for (const [key, items] of groups) {
      items.sort((a, b) => {
        if (a.stepIndex != null && b.stepIndex != null) return a.stepIndex - b.stepIndex;
        return a.producedAt.localeCompare(b.producedAt);
      });
      result.push({ key, items });
    }
    // Sort groups by newest item
    result.sort((a, b) => {
      const newestA = a.items[a.items.length - 1]?.producedAt ?? "";
      const newestB = b.items[b.items.length - 1]?.producedAt ?? "";
      return newestB.localeCompare(newestA);
    });
    return result;
  }, [filtered]);

  return (
    <div className="space-y-6">
      {grouped.map(({ key, items }) => (
        <RunGroup key={key} items={items} onExpand={onExpand} />
      ))}
    </div>
  );
}

function RunGroup({
  items,
  onExpand,
}: {
  items: WorkflowOutput[];
  onExpand: (id: string) => void;
}) {
  const first = items[0];
  const workflow = WORKFLOWS.find((w) => w.id === first.workflow);
  const agent = getAgent(first.agent);
  const isSolo = items.length === 1 && first.runId == null;

  return (
    <div
      className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] p-4"
      style={
        agent
          ? { borderLeft: `3px solid ${agent.color}`, paddingLeft: "15px" }
          : undefined
      }
    >
      {/* Run header */}
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          {agent && (
            <div
              className="rounded-xl p-2 flex-shrink-0"
              style={{ background: `${agent.color}22`, border: `1px solid ${agent.color}44` }}
            >
              <PixelIcon name={agent.icon} color={agent.color} size={22} />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-slate-900 dark:text-white font-semibold text-[15px]">{workflow?.name ?? first.workflow}</h3>
              {!isSolo && (
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-slate-300 dark:border-white/10 text-slate-400 font-mono">
                  {items.length} steps
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {agent?.name ?? first.agent} · {formatAge(items[items.length - 1].producedAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline strip */}
      {!isSolo && (
        <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
          {items.map((o, i) => {
            const meta = STATUS_META[o.status];
            return (
              <div key={o.id} className="flex items-center gap-1 flex-shrink-0">
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                  style={{
                    background: `${meta.color}15`,
                    border: `1px solid ${meta.color}44`,
                    color: meta.color,
                  }}
                >
                  {i + 1}. {OUTPUT_TYPE_META[o.type].label}
                </span>
                {i < items.length - 1 && <span className="text-slate-700 text-xs">→</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Output cards in a row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {items.map((o) => (
          <OutputCard key={o.id} output={o} onExpand={() => onExpand(o.id)} dense />
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// CARD
// ────────────────────────────────────────────────────────────────────

function OutputCard({
  output,
  onExpand,
  dense = false,
}: {
  output: WorkflowOutput;
  onExpand: () => void;
  dense?: boolean;
}) {
  const agent = getAgent(output.agent);
  const typeMeta = OUTPUT_TYPE_META[output.type];
  const statusMeta = STATUS_META[output.status];
  return (
    <div
      className="rounded-xl bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:border-white/10 transition-all overflow-hidden"
      style={{ borderLeft: `2px solid ${typeMeta.color}` }}
    >
      <OutputPreview output={output} size="card" onExpand={onExpand} />
      <div className={dense ? "p-2.5" : "p-3"}>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] uppercase tracking-widest font-mono" style={{ color: typeMeta.color }}>
            {typeMeta.label}
          </span>
          <span className="text-slate-700">·</span>
          <span
            className="text-[9px] px-1.5 py-0 rounded-full"
            style={{ background: `${statusMeta.color}22`, color: statusMeta.color }}
          >
            {statusMeta.label}
          </span>
        </div>
        <div className="text-[13px] text-white font-medium leading-tight line-clamp-2 mb-1">{output.title}</div>
        {!dense && (
          <div className="text-[11px] text-slate-400 leading-snug line-clamp-2 mb-2">{output.summary}</div>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 min-w-0">
            {agent && <PixelIcon name={agent.icon} color={agent.color} size={10} />}
            <span className="truncate">{agent?.name ?? output.agent}</span>
          </div>
          <div className="text-[10px] text-slate-600 font-mono flex-shrink-0">{formatAge(output.producedAt)}</div>
        </div>
        <div className="flex items-center gap-1 mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            className="text-[10px] px-2 py-1 rounded-full border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-200 dark:bg-white/[0.08] text-slate-300 hover:text-white"
          >
            Open
          </button>
          {output.fileUrl && (
            <a
              href={output.fileUrl}
              download
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-200 dark:bg-white/[0.08] text-slate-300 hover:text-white"
              title="Download"
            >
              <Download className="w-2.5 h-2.5" />
            </a>
          )}
          {output.externalUrl && (
            <a
              href={output.externalUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border border-[#14E0E0]/30 bg-[#14E0E0]/10 text-[#14E0E0] hover:bg-[#14E0E0]/20"
              title="Open external"
            >
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// LIGHTBOX
// ────────────────────────────────────────────────────────────────────

function Lightbox({ output, onClose }: { output: WorkflowOutput; onClose: () => void }) {
  const agent = getAgent(output.agent);
  const workflow = WORKFLOWS.find((w) => w.id === output.workflow);
  const typeMeta = OUTPUT_TYPE_META[output.type];
  const statusMeta = STATUS_META[output.status];
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copyLink = () => {
    const url = output.fileUrl ?? output.externalUrl;
    if (!url) return;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#10101C] border border-slate-300 dark:border-white/10 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-4 border-b border-slate-200 dark:border-white/5">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="rounded-xl px-3 py-2 text-xs font-mono flex-shrink-0"
              style={{ background: `${typeMeta.color}22`, border: `1px solid ${typeMeta.color}55`, color: typeMeta.color }}
            >
              {typeMeta.label}
            </div>
            <div className="min-w-0">
              <h3 className="text-slate-900 dark:text-white font-semibold text-base">{output.title}</h3>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap text-[11px]">
                {agent && (
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <PixelIcon name={agent.icon} color={agent.color} size={12} />
                    {agent.name}
                  </span>
                )}
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">{workflow?.name ?? output.workflow}</span>
                <span className="text-slate-600">·</span>
                <span
                  className="px-2 py-0.5 rounded-full"
                  style={{ background: `${statusMeta.color}22`, color: statusMeta.color }}
                >
                  {statusMeta.label}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-500 font-mono">{formatAge(output.producedAt)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white flex-shrink-0" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="max-w-3xl mx-auto">
            <OutputPreview output={output} size="lightbox" />
            <p className="text-[13px] text-slate-300 leading-relaxed mt-4">{output.summary}</p>

            {output.metadata?.bodyText && (
              <div className="mt-4 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] p-4">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-mono">
                  Body
                </div>
                <pre className="text-[12px] text-slate-300 whitespace-pre-wrap leading-relaxed font-mono">
                  {output.metadata.bodyText}
                </pre>
              </div>
            )}

            {output.metadata?.caption && (
              <div className="mt-4 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] p-4">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-mono">
                  Caption
                </div>
                <div className="text-[13px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {output.metadata.caption}
                </div>
                {output.metadata.hashtags && output.metadata.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {output.metadata.hashtags.map((h) => (
                      <span
                        key={h}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[#14E0E0]/10 text-[#14E0E0] border border-[#14E0E0]/20"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(output.metadata?.durationSec ||
              output.metadata?.width ||
              output.metadata?.platform) && (
              <div className="mt-4 flex items-center gap-3 flex-wrap text-[11px] text-slate-500 font-mono">
                {output.metadata.durationSec && <span>⏱ {output.metadata.durationSec}s</span>}
                {output.metadata.width && output.metadata.height && (
                  <span>
                    📐 {output.metadata.width}×{output.metadata.height}
                  </span>
                )}
                {output.metadata.platform && <span>📱 {output.metadata.platform}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 dark:border-white/5 flex-wrap">
          {(output.fileUrl || output.externalUrl) && (
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-200 dark:bg-white/[0.08] text-slate-300 hover:text-white"
            >
              <Copy className="w-3 h-3" />
              {copied ? "copied" : "copy link"}
            </button>
          )}
          {output.fileUrl && (
            <a
              href={output.fileUrl}
              download
              className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-200 dark:bg-white/[0.08] text-slate-300 hover:text-white"
            >
              <Download className="w-3 h-3" />
              download
            </a>
          )}
          {output.externalUrl && (
            <a
              href={output.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border border-[#14E0E0]/30 bg-[#14E0E0]/10 text-[#14E0E0] hover:bg-[#14E0E0]/20"
            >
              <ExternalLink className="w-3 h-3" />
              open
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// small UI pieces
// ────────────────────────────────────────────────────────────────────

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-slate-300 dark:border-white/10 bg-white dark:bg-white/[0.02]">
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

function ViewBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] transition-all",
        active
          ? "bg-gradient-to-r from-[#14E0E0]/20 to-[#7E5BDC]/20 text-white shadow-[inset_0_0_0_1px_rgba(20,224,224,0.3)]"
          : "text-slate-400 hover:text-white",
      ].join(" ")}
    >
      {icon}
      {children}
    </button>
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
