import { useState } from "react";
import { ICON_NAMES } from "../data/icons";
import { PixelIcon } from "../PixelIcon";

const TINTS = ["#14E0E0", "#4A82E8", "#7E5BDC", "#FFFFFF"];

export function IconsTab() {
  const [tint, setTint] = useState(TINTS[0]);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (name: string) => {
    navigator.clipboard?.writeText(name).catch(() => {});
    setCopied(name);
    setTimeout(() => setCopied(null), 1400);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">Icons</h2>
          <p className="text-sm text-slate-400">Pixel-art icon library for agents. Click to copy the name.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 mr-1">Tint</span>
          {TINTS.map((c) => (
            <button
              key={c}
              onClick={() => setTint(c)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                tint === c ? "border-white scale-110" : "border-white/10 hover:border-white/30"
              }`}
              style={{ background: c }}
              aria-label={`Tint ${c}`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {ICON_NAMES.map((name) => (
          <button
            key={name}
            onClick={() => copy(name)}
            className="group rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05] p-4 flex flex-col items-center gap-2 transition-all"
          >
            <PixelIcon name={name} color={tint} size={48} />
            <div className="text-[11px] text-slate-400 group-hover:text-white transition-colors font-mono">{name}</div>
            {copied === name && (
              <div className="text-[9px] uppercase tracking-widest text-[#14E0E0] -mt-1">copied</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
