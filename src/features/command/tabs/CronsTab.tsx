import { useMemo, useState } from "react";
import { CRONS, type CronJob } from "../data/crons";
import { getAgent } from "../data/agents";
import { PixelIcon } from "../PixelIcon";
import {
  parseCron,
  cronDays,
  cronFirstHour,
  cronFirstMinute,
  formatTime,
  DAYS,
  type ParsedCron,
} from "../data/cron-parser";

// We render 6am–10pm on a 7-column grid (Sun..Sat).
const START_HOUR = 6;
const END_HOUR = 22;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

type Placed = {
  cron: CronJob;
  parsed: ParsedCron;
  day: number;   // 0..6 Sun..Sat
  hour: number;
  minute: number;
};

export function CronsTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { placed, monthly, unplaced } = useMemo(() => {
    const placed: Placed[] = [];
    const monthly: { cron: CronJob; parsed: ParsedCron }[] = [];
    const unplaced: CronJob[] = [];
    for (const c of CRONS) {
      const p = parseCron(c.cron);
      if (!p) {
        unplaced.push(c);
        continue;
      }
      if (p.isMonthly) {
        monthly.push({ cron: c, parsed: p });
        continue;
      }
      const hour = cronFirstHour(p);
      const minute = cronFirstMinute(p);
      for (const day of cronDays(p)) {
        if (hour < START_HOUR || hour > END_HOUR) {
          // out of visible window — still tracked in "early/late" group
          continue;
        }
        placed.push({ cron: c, parsed: p, day, hour, minute });
      }
    }
    return { placed, monthly, unplaced };
  }, []);

  const earlyLate = useMemo(
    () =>
      CRONS.filter((c) => {
        const p = parseCron(c.cron);
        if (!p || p.isMonthly) return false;
        const h = cronFirstHour(p);
        return h < START_HOUR || h > END_HOUR;
      }),
    []
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-6 flex items-baseline justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">Crons</h2>
          <p className="text-sm text-slate-400">
            Weekly schedule of agent tasks. Color-coded by owning agent.
          </p>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          {CRONS.filter((c) => c.enabled).length} active · {CRONS.length} total
        </div>
      </div>

      {/* Weekly grid */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 overflow-x-auto mb-6">
        <div
          className="grid min-w-[900px]"
          style={{ gridTemplateColumns: "60px repeat(7, minmax(0, 1fr))" }}
        >
          {/* Header row */}
          <div />
          {DAYS.map((d, i) => (
            <div
              key={d}
              className="text-[10px] uppercase tracking-widest text-slate-500 text-center pb-2 border-b border-white/5"
            >
              {d}
              {i === 1 && <span className="ml-1 text-[#14E0E0]/70">·</span>}
            </div>
          ))}

          {/* Hour rows */}
          {HOURS.map((h) => (
            <HourRow key={h} hour={h} placed={placed} selectedId={selectedId} onSelect={setSelectedId} />
          ))}
        </div>
      </div>

      {/* Selected cron detail */}
      {selectedId && (
        <SelectedPanel
          cron={CRONS.find((c) => c.id === selectedId)!}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* Monthly + off-grid lists */}
      <div className="grid md:grid-cols-2 gap-4">
        {monthly.length > 0 && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">
              Monthly
            </div>
            <div className="space-y-2">
              {monthly.map(({ cron }) => (
                <CronListRow key={cron.id} cron={cron} onClick={() => setSelectedId(cron.id)} />
              ))}
            </div>
          </div>
        )}
        {earlyLate.length > 0 && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">
              Outside window (before 6am / after 10pm)
            </div>
            <div className="space-y-2">
              {earlyLate.map((cron) => (
                <CronListRow key={cron.id} cron={cron} onClick={() => setSelectedId(cron.id)} />
              ))}
            </div>
          </div>
        )}
        {unplaced.length > 0 && (
          <div className="rounded-2xl border border-[#FF5577]/30 bg-[#FF5577]/5 p-4">
            <div className="text-[10px] uppercase tracking-widest text-[#FF5577] mb-3">
              Unparseable
            </div>
            <div className="space-y-2">
              {unplaced.map((cron) => (
                <CronListRow key={cron.id} cron={cron} onClick={() => setSelectedId(cron.id)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HourRow({
  hour,
  placed,
  selectedId,
  onSelect,
}: {
  hour: number;
  placed: Placed[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <div className="text-[10px] font-mono text-slate-600 text-right pr-2 pt-1 border-t border-white/5">
        {formatTime(hour, 0)}
      </div>
      {[0, 1, 2, 3, 4, 5, 6].map((day) => {
        const events = placed.filter((p) => p.day === day && p.hour === hour);
        return (
          <div
            key={day}
            className="relative border-t border-l border-white/5 min-h-[48px] py-1 px-1"
          >
            {events.map((e) => (
              <CronChip
                key={e.cron.id + "-" + day}
                event={e}
                selected={selectedId === e.cron.id}
                onSelect={() => onSelect(e.cron.id)}
              />
            ))}
          </div>
        );
      })}
    </>
  );
}

function CronChip({
  event,
  selected,
  onSelect,
}: {
  event: Placed;
  selected: boolean;
  onSelect: () => void;
}) {
  const agent = getAgent(event.cron.agent);
  const color = agent?.color ?? "#A5A5C2";
  return (
    <button
      onClick={onSelect}
      className={[
        "w-full text-left rounded-md px-2 py-1 mb-1 transition-all",
        "text-[10px] leading-tight truncate",
        selected
          ? "bg-white/10 shadow-[0_0_12px_rgba(20,224,224,0.3)]"
          : "hover:bg-white/[0.04]",
      ].join(" ")}
      style={{
        background: selected
          ? `linear-gradient(90deg, ${color}33, ${color}11)`
          : `${color}18`,
        borderLeft: `2px solid ${color}`,
      }}
      title={event.cron.name}
    >
      <div className="flex items-center gap-1">
        <span className="text-[9px] font-mono text-white/70 flex-shrink-0">
          {formatTime(event.hour, event.minute)}
        </span>
      </div>
      <div className="text-white/90 truncate">{event.cron.name.replace(/\s*\([^)]*\)\s*$/, "")}</div>
    </button>
  );
}

function CronListRow({ cron, onClick }: { cron: CronJob; onClick: () => void }) {
  const agent = getAgent(cron.agent);
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/[0.04] transition-all"
      style={{ borderLeft: `2px solid ${agent?.color ?? "#A5A5C2"}` }}
    >
      {agent && <PixelIcon name={agent.icon} color={agent.color} size={18} />}
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-white/90 truncate">{cron.name}</div>
        <div className="text-[10px] text-slate-500 font-mono">{cron.cron}</div>
      </div>
      <span
        className={
          "h-1.5 w-1.5 rounded-full flex-shrink-0 " +
          (cron.enabled ? "bg-[#14E0E0]" : "bg-slate-700")
        }
      />
    </button>
  );
}

function SelectedPanel({ cron, onClose }: { cron: CronJob; onClose: () => void }) {
  const agent = getAgent(cron.agent);
  const parsed = parseCron(cron.cron);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {agent && (
            <div
              className="rounded-xl p-2 flex-shrink-0"
              style={{ background: `${agent.color}22`, border: `1px solid ${agent.color}44` }}
            >
              <PixelIcon name={agent.icon} color={agent.color} size={28} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-semibold text-base mb-0.5">{cron.name}</h3>
            <div className="text-[11px] text-slate-500 font-mono mb-2">
              <span
                className={
                  "inline-block h-1.5 w-1.5 rounded-full mr-1.5 " +
                  (cron.enabled ? "bg-[#14E0E0]" : "bg-slate-700")
                }
              />
              {cron.cron} · {agent?.name ?? cron.agent}
            </div>
            <p className="text-[13px] text-slate-300 leading-relaxed">{cron.description}</p>
            {parsed && !parsed.isMonthly && (
              <div className="text-[11px] text-slate-400 mt-3 font-mono">
                Runs {formatTime(cronFirstHour(parsed), cronFirstMinute(parsed))} ·{" "}
                {cronDays(parsed)
                  .map((d) => DAYS[d])
                  .join(", ")}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-white text-lg leading-none flex-shrink-0"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
