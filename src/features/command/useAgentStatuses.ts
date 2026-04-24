// Live agent status hook for the Command Center.
//
// Subscribes to postgres_changes on public.agent_status and maintains a
// Record<agent_id, { status, task, updatedAt, displayStatus }> in state.
// Also re-computes `recent` locally on a 30s timer so that an agent that
// went idle 3 minutes ago correctly flips from "recent" → "idle" at the
// 5-minute mark without needing a server round-trip.

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AgentStatus } from "./data/agents";

const IDLE_MS = 5 * 60 * 1000;

export type StatusEntry = {
  status: AgentStatus;          // raw status stored in db
  displayStatus: AgentStatus;   // status after "recent" derivation
  task: string;
  updatedAt: number;            // ms epoch
};

export type StatusMap = Record<string, StatusEntry>;

type Row = {
  agent_id: string;
  status: AgentStatus;
  task: string | null;
  updated_at: string;
};

function deriveDisplay(status: AgentStatus, updatedAt: number): AgentStatus {
  if (status !== "idle") return status;
  if (!updatedAt) return "idle";
  return Date.now() - updatedAt < IDLE_MS ? "recent" : "idle";
}

function rowToEntry(row: Row): StatusEntry {
  const updatedAt = new Date(row.updated_at).getTime();
  return {
    status: row.status,
    displayStatus: deriveDisplay(row.status, updatedAt),
    task: row.task || "",
    updatedAt,
  };
}

export function useAgentStatuses(): { statuses: StatusMap; loading: boolean } {
  const [statuses, setStatuses] = useState<StatusMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("agent_status")
        .select("agent_id,status,task,updated_at");
      if (cancelled) return;
      if (data) {
        const next: StatusMap = {};
        for (const row of data as Row[]) next[row.agent_id] = rowToEntry(row);
        setStatuses(next);
      }
      setLoading(false);
    })();

    const channel = supabase
      .channel("agent-status-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agent_status" },
        (payload) => {
          const row = (payload.new ?? payload.old) as Row | undefined;
          if (!row?.agent_id) return;
          setStatuses((prev) => {
            if (payload.eventType === "DELETE") {
              const { [row.agent_id]: _, ...rest } = prev;
              return rest;
            }
            return { ...prev, [row.agent_id]: rowToEntry(row) };
          });
        }
      )
      .subscribe();

    // Re-derive "recent" every 30s so stale rows decay to idle without a db write.
    const timer = setInterval(() => {
      setStatuses((prev) => {
        let changed = false;
        const next: StatusMap = { ...prev };
        for (const id of Object.keys(prev)) {
          const cur = prev[id];
          const nextDisplay = deriveDisplay(cur.status, cur.updatedAt);
          if (nextDisplay !== cur.displayStatus) {
            next[id] = { ...cur, displayStatus: nextDisplay };
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 30_000);

    return () => {
      cancelled = true;
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  return { statuses, loading };
}
