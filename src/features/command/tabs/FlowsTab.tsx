import { useEffect, useMemo, useRef, useState } from "react";
import { WORKFLOWS, type Workflow } from "../data/workflows";
import { getAgent } from "../data/agents";
import { PixelIcon } from "../PixelIcon";
import { Play, Pause, RotateCcw } from "lucide-react";

type Node = {
  id: string;
  kind: "agent" | "skill";
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  data?: Workflow["skills"][number];
};

type Edge = { source: string; target: string };

const AGENT_RADIUS = 32;
const SKILL_RADIUS = 14;

export function FlowsTab() {
  const [selectedId, setSelectedId] = useState<string>(WORKFLOWS[0].id);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [playStep, setPlayStep] = useState<number>(-1); // -1 = not playing; 0..n-1 = current
  const [playing, setPlaying] = useState(false);

  const workflow = useMemo(() => WORKFLOWS.find((w) => w.id === selectedId)!, [selectedId]);
  const agent = getAgent(workflow.agent);
  const color = agent?.color ?? "#14E0E0";

  // Reset selection when workflow changes
  useEffect(() => {
    setSelectedSkill(null);
    setPlayStep(-1);
    setPlaying(false);
  }, [selectedId]);

  // Play-mode driver: walk through skills at a fixed interval
  useEffect(() => {
    if (!playing) return;
    if (playStep >= workflow.skills.length - 1) {
      // reached the end — pause so Reset can be shown
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setPlayStep((s) => s + 1), 1400);
    return () => clearTimeout(t);
  }, [playing, playStep, workflow.skills.length]);

  const togglePlay = () => {
    if (playStep >= workflow.skills.length - 1) {
      // was complete — restart from 0
      setPlayStep(0);
      setPlaying(true);
      return;
    }
    if (!playing && playStep === -1) {
      setPlayStep(0);
    }
    setPlaying((p) => !p);
  };

  const reset = () => {
    setPlayStep(-1);
    setPlaying(false);
  };

  return (
    <div className="flex h-full min-h-[640px]">
      {/* Workflow list */}
      <aside className="w-60 flex-shrink-0 border-r border-slate-200 dark:border-white/5 overflow-y-auto">
        <div className="p-4 text-[10px] uppercase tracking-widest text-slate-500">
          Workflows
        </div>
        <div className="space-y-0.5 px-2 pb-4">
          {WORKFLOWS.map((wf) => {
            const a = getAgent(wf.agent);
            const active = wf.id === selectedId;
            return (
              <button
                key={wf.id}
                onClick={() => setSelectedId(wf.id)}
                className={[
                  "w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-start gap-2.5",
                  active
                    ? "bg-slate-100 dark:bg-white/[0.06]"
                    : "hover:bg-slate-50 dark:bg-white/[0.03]",
                ].join(" ")}
                style={
                  active
                    ? { borderLeft: `2px solid ${a?.color ?? "#14E0E0"}`, paddingLeft: "10px" }
                    : { borderLeft: "2px solid transparent", paddingLeft: "10px" }
                }
              >
                {a && <PixelIcon name={a.icon} color={a.color} size={16} className="mt-0.5 flex-shrink-0" />}
                <div className="min-w-0">
                  <div className={"text-[12px] font-medium " + (active ? "text-white" : "text-slate-300")}>
                    {wf.name}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">{a?.name ?? wf.agent}</div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Canvas + overlays */}
      <div className="flex-1 relative overflow-hidden">
        <FlowCanvas
          workflow={workflow}
          color={color}
          hoveredSkill={null}
          activeSkillIndex={playStep}
          selectedSkillId={selectedSkill}
          onSelectSkill={setSelectedSkill}
        />

        {/* Header (overlay) */}
        <div className="absolute top-4 left-5 right-5 flex items-start justify-between gap-4 pointer-events-none">
          <div className="pointer-events-auto max-w-md">
            <div className="flex items-center gap-2 mb-1">
              {agent && <PixelIcon name={agent.icon} color={agent.color} size={16} />}
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
                {agent?.name ?? workflow.agent}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white leading-tight">{workflow.name}</h3>
            <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">{workflow.description}</p>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all"
              style={{
                background: `linear-gradient(90deg, ${color}33, ${color}11)`,
                border: `1px solid ${color}66`,
                color: "#fff",
                boxShadow: playing ? `0 0 14px ${color}66` : "none",
              }}
            >
              {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {playStep >= workflow.skills.length - 1 && !playing ? "Replay" : playing ? "Pause" : playStep === -1 ? "Play" : "Resume"}
            </button>
            <button
              onClick={reset}
              disabled={playStep === -1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] text-slate-300 hover:text-white border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:bg-white/[0.06] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {playStep >= 0 && (
          <div className="absolute top-20 left-5 right-5 pointer-events-none">
            <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full transition-[width] duration-700 ease-out"
                style={{
                  width: `${Math.min(100, ((playStep + 1) / workflow.skills.length) * 100)}%`,
                  background: `linear-gradient(90deg, #14E0E0, #4A82E8, #7E5BDC)`,
                }}
              />
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              step {Math.min(playStep + 1, workflow.skills.length)} / {workflow.skills.length}
              {" · "}
              {workflow.skills[playStep]?.name ?? "complete"}
            </div>
          </div>
        )}

        {/* Skill detail panel */}
        {selectedSkill && (
          <SkillDetail
            skill={workflow.skills.find((s) => s.id === selectedSkill)!}
            color={color}
            onClose={() => setSelectedSkill(null)}
          />
        )}
      </div>
    </div>
  );
}

function SkillDetail({
  skill,
  color,
  onClose,
}: {
  skill: Workflow["skills"][number];
  color: string;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute top-4 right-5 w-72 rounded-2xl p-4 backdrop-blur-md"
      style={{
        background: "rgba(16,16,28,0.85)",
        border: `1px solid ${color}55`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${color}22`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest font-mono mb-1" style={{ color }}>
            Skill
          </div>
          <h4 className="text-white font-semibold text-sm">{skill.name}</h4>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white text-lg leading-none">
          ×
        </button>
      </div>
      <p className="text-[12px] text-slate-300 leading-relaxed mt-2">{skill.description}</p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Canvas: force-directed layout + node/edge rendering
// ────────────────────────────────────────────────────────────────────

function FlowCanvas({
  workflow,
  color,
  activeSkillIndex,
  selectedSkillId,
  onSelectSkill,
}: {
  workflow: Workflow;
  color: string;
  hoveredSkill: string | null;
  activeSkillIndex: number;
  selectedSkillId: string | null;
  onSelectSkill: (id: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const sizeRef = useRef({ w: 800, h: 600 });
  const activeIdxRef = useRef<number>(activeSkillIndex);
  const selectedRef = useRef<string | null>(selectedSkillId);
  const hoverRef = useRef<string | null>(null);
  const [hoveredSkillLocal, setHoveredSkillLocal] = useState<string | null>(null);

  // Keep refs in sync with props (canvas loop reads refs)
  useEffect(() => {
    activeIdxRef.current = activeSkillIndex;
  }, [activeSkillIndex]);
  useEffect(() => {
    selectedRef.current = selectedSkillId;
  }, [selectedSkillId]);

  // Build graph when workflow changes
  useEffect(() => {
    const { w, h } = sizeRef.current;
    const cx = w / 2;
    const cy = h / 2;
    const agentNode: Node = {
      id: "agent",
      kind: "agent",
      label: workflow.agentName,
      x: cx,
      y: cy,
      vx: 0,
      vy: 0,
      r: AGENT_RADIUS,
    };
    const n = workflow.skills.length;
    const skillNodes: Node[] = workflow.skills.map((s, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const dist = 160;
      return {
        id: "skill:" + s.id,
        kind: "skill",
        label: s.name,
        x: cx + Math.cos(angle) * dist + (Math.random() - 0.5) * 8,
        y: cy + Math.sin(angle) * dist + (Math.random() - 0.5) * 8,
        vx: 0,
        vy: 0,
        r: SKILL_RADIUS,
        data: s,
      };
    });
    nodesRef.current = [agentNode, ...skillNodes];
    edgesRef.current = skillNodes.map((s) => ({ source: "agent", target: s.id }));
    settle();
  }, [workflow]);

  // Resize observer
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width, height } = e.contentRect;
        sizeRef.current = { w: width, h: height };
        const c = canvasRef.current;
        if (c) {
          const dpr = window.devicePixelRatio || 1;
          c.width = width * dpr;
          c.height = height * dpr;
          c.style.width = width + "px";
          c.style.height = height + "px";
          const ctx = c.getContext("2d");
          ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        // Re-center
        const nodes = nodesRef.current;
        if (nodes[0]) {
          nodes[0].x = width / 2;
          nodes[0].y = height / 2;
          settle();
        }
      }
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // Render loop
  useEffect(() => {
    let raf = 0;
    let dash = 0;
    const render = () => {
      const c = canvasRef.current;
      const ctx = c?.getContext("2d");
      if (!c || !ctx) {
        raf = requestAnimationFrame(render);
        return;
      }
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
      dash = (dash + 0.6) % 16;

      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const byId = new Map(nodes.map((n) => [n.id, n]));
      const activeIdx = activeIdxRef.current;

      // Edges
      edges.forEach((e) => {
        const s = byId.get(e.source);
        const t = byId.get(e.target);
        if (!s || !t) return;
        const idx = workflow.skills.findIndex((sk) => "skill:" + sk.id === t.id);
        const isCurrent = idx === activeIdx;
        const isDone = idx >= 0 && activeIdx > idx;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        if (isCurrent) {
          ctx.setLineDash([6, 4]);
          ctx.lineDashOffset = -dash;
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.shadowBlur = 12;
          ctx.shadowColor = color;
        } else if (isDone) {
          ctx.setLineDash([]);
          ctx.strokeStyle = hexA(color, 0.55);
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 0;
        } else {
          ctx.setLineDash([]);
          ctx.strokeStyle = "rgba(255,255,255,0.08)";
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
      });

      // Nodes
      nodes.forEach((n) => {
        if (n.kind === "agent") {
          // Outer glow
          const grad = ctx.createRadialGradient(n.x, n.y, n.r * 0.4, n.x, n.y, n.r * 2.2);
          grad.addColorStop(0, hexA(color, 0.45));
          grad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 2.2, 0, Math.PI * 2);
          ctx.fill();
          // Core
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = hexA(color, 0.18);
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();
          // Label
          ctx.fillStyle = "#fff";
          ctx.font = "600 12px Inter, system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(n.label, n.x, n.y);
        } else {
          const idx = workflow.skills.findIndex((sk) => "skill:" + sk.id === n.id);
          const isCurrent = idx === activeIdx;
          const isDone = idx >= 0 && activeIdx > idx;
          const isHovered = hoverRef.current === n.id;
          const isSelected = selectedRef.current === n.data?.id;

          // Halo
          if (isCurrent || isSelected || isHovered) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r + (isCurrent ? 12 : 8), 0, Math.PI * 2);
            ctx.fillStyle = hexA(color, isCurrent ? 0.35 : 0.2);
            ctx.fill();
          }

          // Core circle
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          if (isCurrent) {
            ctx.fillStyle = color;
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
          } else if (isDone) {
            ctx.fillStyle = hexA(color, 0.75);
            ctx.strokeStyle = hexA(color, 0.9);
            ctx.lineWidth = 1.5;
          } else {
            ctx.fillStyle = "rgba(16,16,28,0.9)";
            ctx.strokeStyle = hexA(color, 0.55);
            ctx.lineWidth = 1.5;
          }
          ctx.fill();
          ctx.stroke();

          // Label (below node)
          ctx.fillStyle = isCurrent || isSelected ? "#fff" : "rgba(255,255,255,0.65)";
          ctx.font = "500 11px Inter, system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          wrapFillText(ctx, n.label, n.x, n.y + n.r + 6, 110, 13);
        }
      });

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [workflow, color]);

  // Hit test for hover + click
  const getNodeAt = (mx: number, my: number): Node | null => {
    const nodes = nodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dx = mx - n.x;
      const dy = my - n.y;
      if (dx * dx + dy * dy <= n.r * n.r) return n;
    }
    return null;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const hit = getNodeAt(e.clientX - rect.left, e.clientY - rect.top);
    const nextHover = hit && hit.kind === "skill" ? hit.id : null;
    if (nextHover !== hoverRef.current) {
      hoverRef.current = nextHover;
      setHoveredSkillLocal(nextHover ? hit!.data?.id ?? null : null);
    }
    if (canvasRef.current) canvasRef.current.style.cursor = hit ? "pointer" : "default";
  };

  const handleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const hit = getNodeAt(e.clientX - rect.left, e.clientY - rect.top);
    if (hit && hit.kind === "skill" && hit.data) onSelectSkill(hit.data.id);
  };

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} onMouseMove={handleMouseMove} onClick={handleClick} />
      {/* Simple tooltip */}
      {hoveredSkillLocal && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/70 border border-slate-300 dark:border-white/10 text-[11px] text-white/90 font-mono pointer-events-none">
          {workflow.skills.find((s) => s.id === hoveredSkillLocal)?.name}
        </div>
      )}
    </div>
  );

  // --- local helpers ---
  function settle() {
    // Quick spring-embedder: repulsion between skills + attraction from agent.
    const nodes = nodesRef.current;
    const { w, h } = sizeRef.current;
    const cx = w / 2;
    const cy = h / 2;
    const agent = nodes[0];
    if (!agent) return;
    const skills = nodes.slice(1);
    const targetDist = Math.min(170, Math.min(w, h) * 0.34);

    for (let iter = 0; iter < 180; iter++) {
      // Spring to agent at targetDist
      for (const s of skills) {
        const dx = s.x - agent.x;
        const dy = s.y - agent.y;
        const d = Math.hypot(dx, dy) || 0.01;
        const diff = (d - targetDist) / d;
        s.x -= dx * 0.04 * diff;
        s.y -= dy * 0.04 * diff;
      }
      // Repulsion between skills
      for (let i = 0; i < skills.length; i++) {
        for (let j = i + 1; j < skills.length; j++) {
          const a = skills[i];
          const b = skills[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          let d = Math.hypot(dx, dy) || 0.01;
          const minDist = 64;
          if (d < minDist) {
            const push = ((minDist - d) / d) * 0.6;
            dx *= push;
            dy *= push;
            a.x += dx;
            a.y += dy;
            b.x -= dx;
            b.y -= dy;
          }
        }
      }
      // Clamp within bounds
      for (const s of skills) {
        s.x = Math.max(40, Math.min(w - 40, s.x));
        s.y = Math.max(60, Math.min(h - 40, s.y));
      }
      agent.x = cx;
      agent.y = cy;
    }
  }
}

// ────────────────────────────────────────────────────────────────────
// utilities
// ────────────────────────────────────────────────────────────────────

function hexA(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function wrapFillText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let cy = y;
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + " " + words[i] : words[i];
    const w = ctx.measureText(test).width;
    if (w > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = words[i];
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
}
