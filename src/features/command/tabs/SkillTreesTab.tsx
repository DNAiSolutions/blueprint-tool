import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_AGENTS } from "../data/agents";
import { PixelIcon } from "../PixelIcon";

// Build an agent × skill graph from the seeded agent roster. Each agent's
// skills[] is treated as labels, and skills that share a normalized key
// across agents become "shared" nodes connecting to multiple agents.

type Node = {
  id: string;
  kind: "agent" | "skill";
  label: string;
  color: string;
  icon?: string;
  agentIds?: string[];    // for shared skills
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  description?: string;
};

type Edge = { source: string; target: string; color: string };

const AGENT_RADIUS = 28;
const SKILL_RADIUS = 9;

function normalizeSkillKey(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
}

function buildGraph() {
  // Map skill-key → { label, agents[] }
  const skillMap = new Map<string, { label: string; agents: string[] }>();
  for (const a of ALL_AGENTS) {
    for (const s of a.skills) {
      const k = normalizeSkillKey(s);
      const prev = skillMap.get(k);
      if (prev) {
        if (!prev.agents.includes(a.id)) prev.agents.push(a.id);
      } else {
        skillMap.set(k, { label: s, agents: [a.id] });
      }
    }
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Agent nodes first
  for (const a of ALL_AGENTS) {
    nodes.push({
      id: "agent:" + a.id,
      kind: "agent",
      label: a.name,
      color: a.color,
      icon: a.icon,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      r: AGENT_RADIUS,
    });
  }

  // Skill nodes
  for (const [k, v] of skillMap.entries()) {
    // Blend colors for shared skills
    const agentColors = v.agents
      .map((id) => ALL_AGENTS.find((a) => a.id === id)?.color)
      .filter(Boolean) as string[];
    const color =
      agentColors.length === 1
        ? agentColors[0]
        : mixColors(agentColors);
    nodes.push({
      id: "skill:" + k,
      kind: "skill",
      label: v.label,
      color,
      agentIds: v.agents,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      r: SKILL_RADIUS + Math.min(6, v.agents.length - 1) * 2,
    });
    for (const aid of v.agents) {
      const owner = ALL_AGENTS.find((a) => a.id === aid);
      edges.push({
        source: "agent:" + aid,
        target: "skill:" + k,
        color: owner?.color ?? "#14E0E0",
      });
    }
  }

  return { nodes, edges };
}

export function SkillTreesTab() {
  const { nodes: initialNodes, edges } = useMemo(buildGraph, []);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex h-full min-h-[640px]">
      {/* Legend / filter sidebar */}
      <aside className="w-60 flex-shrink-0 border-r border-slate-200 dark:border-white/5 overflow-y-auto">
        <div className="p-4 text-[10px] uppercase tracking-widest text-slate-500">Agents</div>
        <div className="space-y-0.5 px-2 pb-4">
          {ALL_AGENTS.map((a) => (
            <button
              key={a.id}
              onClick={() =>
                setSelected((s) => (s === "agent:" + a.id ? null : "agent:" + a.id))
              }
              onMouseEnter={() => setHovered("agent:" + a.id)}
              onMouseLeave={() => setHovered(null)}
              className={[
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all",
                selected === "agent:" + a.id
                  ? "bg-slate-100 dark:bg-white/[0.06]"
                  : "hover:bg-slate-50 dark:bg-white/[0.03]",
              ].join(" ")}
              style={{ borderLeft: `2px solid ${a.color}` }}
            >
              <PixelIcon name={a.icon} color={a.color} size={14} />
              <span className="text-[12px] text-white/90 truncate">{a.name}</span>
              <span className="ml-auto text-[10px] text-slate-500 font-mono">{a.skills.length}</span>
            </button>
          ))}
        </div>
        <div className="p-4 pt-2">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Legend</div>
          <div className="space-y-1 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#14E0E0]" /> single-agent skill
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "linear-gradient(135deg, #14E0E0, #7E5BDC)" }} />
              shared skill (larger)
            </div>
          </div>
        </div>
      </aside>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <SkillCanvas
          initialNodes={initialNodes}
          edges={edges}
          selected={selected}
          setSelected={setSelected}
          hovered={hovered}
          setHovered={setHovered}
        />
      </div>
    </div>
  );
}

function SkillCanvas({
  initialNodes,
  edges,
  selected,
  setSelected,
  hovered,
  setHovered,
}: {
  initialNodes: Node[];
  edges: Edge[];
  selected: string | null;
  setSelected: (id: string | null) => void;
  hovered: string | null;
  setHovered: (id: string | null) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>(initialNodes);
  const sizeRef = useRef({ w: 900, h: 640 });
  const hoverRef = useRef<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const edgesRef = useRef<Edge[]>(edges);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  useEffect(() => {
    hoverRef.current = hovered;
  }, [hovered]);

  // Layout: put agents in a circle, skills settle around their owners.
  useEffect(() => {
    const { w, h } = sizeRef.current;
    settleLayout(nodesRef.current, edgesRef.current, w, h);
  }, []);

  // Resize
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
          c.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        settleLayout(nodesRef.current, edgesRef.current, width, height);
      }
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // Render loop
  useEffect(() => {
    let raf = 0;
    const render = () => {
      const c = canvasRef.current;
      const ctx = c?.getContext("2d");
      if (!c || !ctx) {
        raf = requestAnimationFrame(render);
        return;
      }
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
      const nodes = nodesRef.current;
      const edgesLocal = edgesRef.current;
      const byId = new Map(nodes.map((n) => [n.id, n]));
      const sel = selectedRef.current;
      const hov = hoverRef.current;

      const isConnectedTo = (id: string): boolean => {
        if (!sel && !hov) return true;
        const focus = hov ?? sel;
        if (!focus) return true;
        if (id === focus) return true;
        return edgesLocal.some(
          (e) =>
            (e.source === focus && e.target === id) || (e.target === focus && e.source === id)
        );
      };

      // Edges
      edgesLocal.forEach((e) => {
        const s = byId.get(e.source);
        const t = byId.get(e.target);
        if (!s || !t) return;
        const connected = isConnectedTo(e.source) && isConnectedTo(e.target);
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = connected ? hexA(e.color, 0.5) : "rgba(255,255,255,0.04)";
        ctx.lineWidth = connected ? 1.1 : 0.8;
        ctx.stroke();
      });

      // Nodes
      nodes.forEach((n) => {
        const connected = isConnectedTo(n.id);
        const isFocus = sel === n.id || hov === n.id;
        const alpha = connected ? 1 : 0.22;

        if (n.kind === "agent") {
          // Radial glow
          if (isFocus || connected) {
            const grad = ctx.createRadialGradient(n.x, n.y, n.r * 0.4, n.x, n.y, n.r * 1.9);
            grad.addColorStop(0, hexA(n.color, isFocus ? 0.55 : 0.28));
            grad.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r * 1.9, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = hexA(n.color, 0.18);
          ctx.fill();
          ctx.lineWidth = isFocus ? 2.5 : 1.8;
          ctx.strokeStyle = n.color;
          ctx.stroke();
          // Label below
          ctx.fillStyle = connected ? "#fff" : "rgba(255,255,255,0.35)";
          ctx.font = "600 11px Inter, system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          wrapFillText(ctx, n.label, n.x, n.y + n.r + 5, 110, 13);
          ctx.globalAlpha = 1;
        } else {
          ctx.globalAlpha = alpha;
          if (isFocus) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r + 6, 0, Math.PI * 2);
            ctx.fillStyle = hexA(n.color, 0.35);
            ctx.fill();
          }
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = hexA(n.color, 0.85);
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = "rgba(255,255,255,0.2)";
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, []);

  const getNodeAt = (mx: number, my: number): Node | null => {
    const nodes = nodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dx = mx - n.x;
      const dy = my - n.y;
      if (dx * dx + dy * dy <= (n.r + 3) * (n.r + 3)) return n;
    }
    return null;
  };

  const handleMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const hit = getNodeAt(e.clientX - rect.left, e.clientY - rect.top);
    const nextId = hit?.id ?? null;
    if (nextId !== hoverRef.current) {
      hoverRef.current = nextId;
      setHovered(nextId);
    }
    if (canvasRef.current) canvasRef.current.style.cursor = hit ? "pointer" : "default";
  };

  const handleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const hit = getNodeAt(e.clientX - rect.left, e.clientY - rect.top);
    if (!hit) {
      setSelected(null);
      return;
    }
    setSelected(hit.id === selectedRef.current ? null : hit.id);
  };

  const selectedNode = selected ? nodesRef.current.find((n) => n.id === selected) ?? null : null;

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} onMouseMove={handleMove} onClick={handleClick} />

      {/* Heading overlay */}
      <div className="absolute top-4 left-5 pointer-events-none">
        <h2 className="text-lg font-semibold text-white mb-1">Skill Trees</h2>
        <p className="text-[12px] text-slate-400 max-w-md">
          Every agent and every skill they have. Shared skills bridge multiple agents — hover or click to
          isolate connections.
        </p>
      </div>

      {/* Tooltip */}
      {hovered && !selected && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/70 border border-slate-300 dark:border-white/10 text-[11px] text-white/90 font-mono pointer-events-none max-w-sm truncate">
          {nodesRef.current.find((n) => n.id === hovered)?.label}
        </div>
      )}

      {/* Selected detail */}
      {selectedNode && (
        <SelectedDetail node={selectedNode} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function SelectedDetail({ node, onClose }: { node: Node; onClose: () => void }) {
  const linkedAgents =
    node.kind === "skill"
      ? (node.agentIds ?? []).map((id) => ALL_AGENTS.find((a) => a.id === id)!).filter(Boolean)
      : [];
  const agent = node.kind === "agent" ? ALL_AGENTS.find((a) => "agent:" + a.id === node.id) : null;
  return (
    <div
      className="absolute top-4 right-5 w-80 rounded-2xl p-4 backdrop-blur-md"
      style={{
        background: "rgba(16,16,28,0.88)",
        border: `1px solid ${node.color}55`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${node.color}22`,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest font-mono" style={{ color: node.color }}>
            {node.kind === "agent" ? "Agent" : linkedAgents.length > 1 ? "Shared Skill" : "Skill"}
          </div>
          <h4 className="text-white font-semibold text-sm mt-0.5">{node.label}</h4>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white text-lg leading-none">
          ×
        </button>
      </div>
      {agent && (
        <>
          <p className="text-[12px] text-slate-300 leading-relaxed mb-3">{agent.description}</p>
          <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">Skills</div>
          <div className="flex flex-wrap gap-1">
            {agent.skills.map((s) => (
              <span
                key={s}
                className="text-[10px] px-2 py-0.5 rounded-full border border-slate-300 dark:border-white/10 bg-white/5 text-slate-300"
              >
                {s}
              </span>
            ))}
          </div>
        </>
      )}
      {node.kind === "skill" && (
        <>
          <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">
            Held by {linkedAgents.length > 1 ? "agents" : "agent"}
          </div>
          <div className="space-y-1.5">
            {linkedAgents.map((a) => (
              <div key={a.id} className="flex items-center gap-2">
                <PixelIcon name={a.icon} color={a.color} size={14} />
                <span className="text-[12px] text-white/90">{a.name}</span>
                <span className="text-[10px] text-slate-500 ml-auto">{a.role}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Layout: agents on a big ring, skills settle around their owners via
// a short spring-embedder pass.
// ────────────────────────────────────────────────────────────────────

function settleLayout(nodes: Node[], edges: Edge[], w: number, h: number) {
  const cx = w / 2;
  const cy = h / 2;
  const agents = nodes.filter((n) => n.kind === "agent");
  const skills = nodes.filter((n) => n.kind === "skill");

  // Agents evenly spaced on a ring
  const ringR = Math.min(w, h) * 0.32;
  agents.forEach((a, i) => {
    const angle = (i / agents.length) * Math.PI * 2 - Math.PI / 2;
    a.x = cx + Math.cos(angle) * ringR;
    a.y = cy + Math.sin(angle) * ringR;
  });

  // Seed skills at the centroid of their linked agents
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const neighborsOf = (id: string): Node[] => {
    const out: Node[] = [];
    for (const e of edges) {
      if (e.source === id) {
        const n = byId.get(e.target);
        if (n) out.push(n);
      } else if (e.target === id) {
        const n = byId.get(e.source);
        if (n) out.push(n);
      }
    }
    return out;
  };

  for (const s of skills) {
    const linked = neighborsOf(s.id).filter((n) => n.kind === "agent");
    if (linked.length === 0) continue;
    let sx = 0;
    let sy = 0;
    for (const a of linked) {
      sx += a.x;
      sy += a.y;
    }
    s.x = sx / linked.length + (Math.random() - 0.5) * 20;
    s.y = sy / linked.length + (Math.random() - 0.5) * 20;
  }

  // Relaxation: pull skills toward their agents, repel all skills
  for (let iter = 0; iter < 140; iter++) {
    for (const s of skills) {
      const linked = neighborsOf(s.id).filter((n) => n.kind === "agent");
      for (const a of linked) {
        const dx = s.x - a.x;
        const dy = s.y - a.y;
        const d = Math.hypot(dx, dy) || 0.01;
        const target = 80;
        const diff = (d - target) / d;
        s.x -= dx * 0.04 * diff;
        s.y -= dy * 0.04 * diff;
      }
    }
    for (let i = 0; i < skills.length; i++) {
      for (let j = i + 1; j < skills.length; j++) {
        const a = skills[i];
        const b = skills[j];
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let d = Math.hypot(dx, dy) || 0.01;
        const minDist = 28;
        if (d < minDist) {
          const push = ((minDist - d) / d) * 0.5;
          a.x += dx * push;
          a.y += dy * push;
          b.x -= dx * push;
          b.y -= dy * push;
        }
      }
    }
    // Clamp
    for (const s of skills) {
      s.x = Math.max(20, Math.min(w - 20, s.x));
      s.y = Math.max(80, Math.min(h - 20, s.y));
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

function mixColors(colors: string[]): string {
  let r = 0,
    g = 0,
    b = 0;
  for (const c of colors) {
    const h = c.replace("#", "");
    r += parseInt(h.slice(0, 2), 16);
    g += parseInt(h.slice(2, 4), 16);
    b += parseInt(h.slice(4, 6), 16);
  }
  const n = colors.length;
  r = Math.round(r / n);
  g = Math.round(g / n);
  b = Math.round(b / n);
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function wrapFillText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let cy = y;
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + " " + words[i] : words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = words[i];
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
}
