// Pixel-art icon library from RUBRIC. Each icon is an 8x7 grid defined as
// 4-column half-rows (mirrored horizontally on render). `c` is the default tint.
// The DigitalDNA brand tints override per-agent color at render time.

export type PixelIconSpec = {
  c: string;
  p: number[][];
};

export const ICON_LIBRARY: Record<string, PixelIconSpec> = {
  Robo:     { c: "#FFFFFF", p: [[0,0,1,0],[1,1,1,1],[1,1,1,1],[1,0,1,1],[1,1,1,1],[1,1,1,1],[1,0,0,1],[0,0,0,0]] },
  Crown:    { c: "#14E0E0", p: [[1,0,1,0],[1,0,1,1],[1,1,1,1],[0,1,0,1],[0,1,1,1],[0,1,1,1],[0,1,0,1],[0,0,0,0]] },
  Sentinel: { c: "#14E0E0", p: [[0,1,1,0],[1,1,1,1],[1,1,1,1],[1,1,0,1],[0,1,1,1],[0,1,1,0],[0,1,1,0],[1,0,0,1]] },
  Fortress: { c: "#4A82E8", p: [[1,0,0,1],[1,1,1,1],[1,1,1,1],[1,1,0,1],[1,1,1,1],[1,1,1,1],[1,0,1,0],[0,0,0,0]] },
  Spark:    { c: "#14E0E0", p: [[0,0,0,1],[0,0,1,1],[0,1,1,1],[1,1,0,1],[1,1,1,1],[1,1,1,0],[0,1,0,0],[0,0,0,0]] },
  Apex:     { c: "#7E5BDC", p: [[0,0,1,0],[0,1,1,0],[0,1,1,1],[1,1,0,1],[1,1,1,1],[1,1,1,1],[0,1,1,0],[0,0,0,0]] },
  Drift:    { c: "#4A82E8", p: [[0,0,0,0],[0,1,0,1],[1,1,1,1],[1,1,0,1],[1,1,1,1],[0,1,1,0],[0,0,1,1],[0,0,0,0]] },
  Orb:      { c: "#14E0E0", p: [[0,0,1,1],[0,1,1,1],[1,1,1,1],[1,1,0,1],[1,1,1,1],[0,1,1,1],[0,0,1,1],[0,0,0,0]] },
  Rune:     { c: "#4A82E8", p: [[1,0,1,0],[0,1,1,1],[0,1,1,1],[1,1,0,1],[0,1,1,1],[0,1,1,1],[1,0,1,0],[0,0,0,0]] },
  Phantom:  { c: "#7E5BDC", p: [[0,0,1,1],[0,1,1,1],[1,1,0,1],[1,1,1,1],[0,1,1,1],[0,1,1,1],[0,1,0,0],[1,0,0,0]] },
};

export const ICON_NAMES = Object.keys(ICON_LIBRARY);

export function getIcon(name: string | undefined): PixelIconSpec {
  return (name && ICON_LIBRARY[name]) || ICON_LIBRARY.Robo;
}
