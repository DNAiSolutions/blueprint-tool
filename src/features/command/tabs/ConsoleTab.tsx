// ConsoleTab — a built-in command line for the Command Center.
//
// Drives the agent-status edge function manually so you can smoke-test
// the live status pipeline without leaving the dashboard. Also streams
// every realtime agent_status row change into the log so it doubles as
// an activity feed when agents are working.
//
// Commands:
//   ping <agent> <status> [task...]   POST status to Supabase
//   status | ls                       Print current statuses
//   reset                             Set every agent to idle
//   agents                            List agent ids
//   help                              Print command list
//   clear                             Clear the log
//
// Examples:
//   ping content-producer active writing this week's batch
//   ping ceo idle
//   reset
//
// Up/down arrow keys recall recent commands. Enter to run.

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ALL_AGENTS, type AgentStatus } from "../data/agents";

const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL;
const STATUS_VALUES: AgentStatus[] = ["active", "waiting", "recent", "idle", "offline"];
const VALID_AGENT_IDS = new Set(ALL_AGENTS.map((a) => a.id));

type Line = {
  id: number;
  kind: "in" | "out" | "err" | "info" | "event";
  text: string;
  ts: number;
};

const HELP = [
  "Commands:",
  "  ping <agent> <status> [task...]   set an agent's status (active|waiting|recent|idle|offline)",
  "  status | ls                       list current statuses",
  "  agents                            list agent ids",
  "  reset                             set every agent to idle",
  "  clear                             clear the log",
  "  help                              this message",
  "",
  "Tip: ↑/↓ recall history. Tab does nothing yet (sorry).",
].join("\n");

let lineIdSeq = 1;

export function ConsoleTab() {
  const [lines, setLines] = useState<Line[]>([
    {
      id: lineIdSeq++,
      kind: "info",
      text: `DigitalDNA Command Console — type 'help' for commands. Streaming agent_status realtime events.`,
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const supabaseFn = useMemo(
    () => SUPABASE_URL.replace(/\/$/, "") + "/functions/v1/agent-status",
    []
  );

  // Autoscroll on new lines
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [lines]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Realtime subscription — every status row change becomes a log event
  useEffect(() => {
    const channel = supabase
      .channel("console-agent-status")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agent_status" },
        (payload) => {
          const row: any = payload.new ?? payload.old;
          if (!row?.agent_id) return;
          const verb = payload.eventType === "DELETE" ? "deleted" : "→";
          const task = row.task ? `  "${row.task}"` : "";
          push(
            "event",
            `[${nowHM()}] ${row.agent_id} ${verb} ${row.status ?? ""}${task}`
          );
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function push(kind: Line["kind"], text: string) {
    setLines((prev) => {
      const next = [...prev, { id: lineIdSeq++, kind, text, ts: Date.now() }];
      // cap at 500 lines
      return next.length > 500 ? next.slice(-500) : next;
    });
  }

  async function run(cmd: string) {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    push("in", "> " + trimmed);
    setHistory((h) => [...h, trimmed]);
    setHistoryIdx(-1);
    setBusy(true);

    const [name, ...rest] = trimmed.split(/\s+/);
    try {
      switch (name.toLowerCase()) {
        case "help":
        case "?":
          push("out", HELP);
          break;
        case "clear":
          setLines([]);
          break;
        case "agents":
          push(
            "out",
            ALL_AGENTS.map((a) => `  ${a.id.padEnd(22)}  ${a.name}`).join("\n")
          );
          break;
        case "status":
        case "ls": {
          const r = await fetch(supabaseFn, { method: "GET" });
          if (!r.ok) {
            push("err", `GET failed (${r.status})`);
            break;
          }
          const data = await r.json();
          const rows = (data.agents || []) as any[];
          if (rows.length === 0) push("out", "(no rows)");
          else {
            const out = rows
              .map(
                (a) =>
                  `  ${a.agent_id.padEnd(22)}  ${a.display_status.padEnd(8)}  ${
                    a.task ? '"' + a.task + '"' : ""
                  }`
              )
              .join("\n");
            push("out", out);
          }
          break;
        }
        case "reset": {
          push("info", "Resetting all 9 agents → idle…");
          for (const a of ALL_AGENTS) {
            await postStatus(supabaseFn, a.id, "idle", "");
          }
          push("out", "ok — all idle");
          break;
        }
        case "ping": {
          const [agentArg, statusArg, ...taskParts] = rest;
          if (!agentArg || !statusArg) {
            push("err", "usage: ping <agent> <status> [task...]");
            break;
          }
          const agent = agentArg.toLowerCase();
          const status = statusArg.toLowerCase() as AgentStatus;
          if (!VALID_AGENT_IDS.has(agent)) {
            push(
              "err",
              `unknown agent '${agent}' — run 'agents' to list valid ids`
            );
            break;
          }
          if (!STATUS_VALUES.includes(status)) {
            push(
              "err",
              `invalid status '${statusArg}' — must be one of: ${STATUS_VALUES.join(", ")}`
            );
            break;
          }
          const task = taskParts.join(" ");
          const res = await postStatus(supabaseFn, agent, status, task);
          if (res.ok) push("out", `ok — ${agent} → ${status}`);
          else push("err", `ping failed: ${res.error}`);
          break;
        }
        default:
          push("err", `unknown command '${name}' — try 'help'`);
      }
    } catch (e: any) {
      push("err", "exception: " + (e?.message ?? String(e)));
    } finally {
      setBusy(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const v = input;
      setInput("");
      run(v);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const next = historyIdx < 0 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(next);
      setInput(history[next]);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx < 0) return;
      const next = historyIdx + 1;
      if (next >= history.length) {
        setHistoryIdx(-1);
        setInput("");
      } else {
        setHistoryIdx(next);
        setInput(history[next]);
      }
      return;
    }
  }

  return (
    <div className="flex flex-col h-full min-h-[640px] p-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">Console</h2>
          <p className="text-sm text-slate-400">
            Built-in terminal for the Command Center. POST agent statuses, query the live state, and watch
            realtime events stream in.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <QuickBtn onClick={() => run("status")} disabled={busy}>status</QuickBtn>
          <QuickBtn
            onClick={() =>
              run("ping content-producer active smoke test from console")
            }
            disabled={busy}
          >
            smoke test
          </QuickBtn>
          <QuickBtn onClick={() => run("reset")} disabled={busy}>reset all</QuickBtn>
          <QuickBtn onClick={() => run("clear")} disabled={busy}>clear</QuickBtn>
        </div>
      </div>

      {/* Log */}
      <div
        ref={logRef}
        className="flex-1 min-h-0 rounded-2xl border border-white/5 bg-black/40 p-4 overflow-y-auto font-mono text-[12.5px] leading-relaxed"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((l) => (
          <pre
            key={l.id}
            className={
              "whitespace-pre-wrap break-words " +
              (l.kind === "in"
                ? "text-white"
                : l.kind === "out"
                ? "text-slate-300"
                : l.kind === "err"
                ? "text-[#FF5577]"
                : l.kind === "info"
                ? "text-slate-500 italic"
                : "text-[#14E0E0]/85") // event
            }
          >
            {l.text}
          </pre>
        ))}
      </div>

      {/* Input */}
      <div className="mt-3 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 focus-within:border-[#14E0E0]/50 focus-within:shadow-[0_0_18px_rgba(20,224,224,0.15)] transition-all">
        <span className="text-[#14E0E0] font-mono text-sm">▸</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          disabled={busy}
          placeholder='type a command — e.g. "ping content-producer active drafting reel"'
          className="flex-1 bg-transparent outline-none text-white font-mono text-[13px] placeholder:text-slate-600 disabled:opacity-50"
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
        />
        {busy && <span className="text-[10px] text-slate-500 font-mono">running…</span>}
      </div>
    </div>
  );
}

async function postStatus(
  url: string,
  agent: string,
  status: AgentStatus,
  task: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent, status, task }),
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      return { ok: false, error: `HTTP ${r.status}${txt ? ": " + txt.slice(0, 120) : ""}` };
    }
    const data = await r.json().catch(() => ({}));
    if (data?.success) return { ok: true };
    return { ok: false, error: JSON.stringify(data) };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? String(e) };
  }
}

function QuickBtn({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="text-[11px] px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
    >
      {children}
    </button>
  );
}

function nowHM(): string {
  const d = new Date();
  return (
    d.getHours().toString().padStart(2, "0") +
    ":" +
    d.getMinutes().toString().padStart(2, "0") +
    ":" +
    d.getSeconds().toString().padStart(2, "0")
  );
}
