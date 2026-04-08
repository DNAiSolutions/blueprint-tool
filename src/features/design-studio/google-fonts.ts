// Curated Google Fonts list + dynamic stylesheet loader.
// We pre-seed the list with popular display + body fonts. Picking one injects
// a <link> tag (once per font) so it's available to text layers immediately.

export interface GoogleFont {
  name: string;
  category: 'display' | 'sans' | 'serif' | 'mono' | 'handwriting';
  weights: number[];
}

export const GOOGLE_FONTS: GoogleFont[] = [
  // ---------- Display ----------
  { name: 'Playfair Display', category: 'display', weights: [400, 700, 900] },
  { name: 'Bebas Neue', category: 'display', weights: [400] },
  { name: 'Anton', category: 'display', weights: [400] },
  { name: 'Abril Fatface', category: 'display', weights: [400] },
  { name: 'Archivo Black', category: 'display', weights: [900] },
  { name: 'Bungee', category: 'display', weights: [400] },
  { name: 'Bowlby One', category: 'display', weights: [400] },
  { name: 'Chivo', category: 'display', weights: [400, 700, 900] },
  { name: 'Fjalla One', category: 'display', weights: [400] },
  { name: 'Righteous', category: 'display', weights: [400] },

  // ---------- Sans ----------
  { name: 'Inter', category: 'sans', weights: [300, 400, 500, 600, 700, 800, 900] },
  { name: 'Manrope', category: 'sans', weights: [400, 600, 700, 800] },
  { name: 'Poppins', category: 'sans', weights: [400, 500, 600, 700, 900] },
  { name: 'Work Sans', category: 'sans', weights: [400, 500, 700, 900] },
  { name: 'DM Sans', category: 'sans', weights: [400, 500, 700] },
  { name: 'Plus Jakarta Sans', category: 'sans', weights: [400, 500, 700, 800] },
  { name: 'Outfit', category: 'sans', weights: [300, 400, 500, 700, 900] },
  { name: 'Space Grotesk', category: 'sans', weights: [400, 500, 700] },
  { name: 'Montserrat', category: 'sans', weights: [400, 500, 700, 900] },

  // ---------- Serif ----------
  { name: 'Lora', category: 'serif', weights: [400, 500, 700] },
  { name: 'Cormorant Garamond', category: 'serif', weights: [400, 500, 700] },
  { name: 'Fraunces', category: 'serif', weights: [400, 500, 700, 900] },
  { name: 'DM Serif Display', category: 'serif', weights: [400] },
  { name: 'Libre Baskerville', category: 'serif', weights: [400, 700] },

  // ---------- Mono ----------
  { name: 'JetBrains Mono', category: 'mono', weights: [400, 700] },
  { name: 'Space Mono', category: 'mono', weights: [400, 700] },
  { name: 'IBM Plex Mono', category: 'mono', weights: [400, 500, 700] },

  // ---------- Handwriting ----------
  { name: 'Caveat', category: 'handwriting', weights: [400, 700] },
  { name: 'Permanent Marker', category: 'handwriting', weights: [400] },
  { name: 'Dancing Script', category: 'handwriting', weights: [400, 700] },
];

const LOADED_FONTS = new Set<string>();

export function loadGoogleFont(font: GoogleFont): void {
  if (LOADED_FONTS.has(font.name)) return;

  const familyParam = font.name.replace(/\s+/g, '+');
  const weightsParam = font.weights.join(';');
  const href = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weightsParam}&display=swap`;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.googleFont = font.name;
  document.head.appendChild(link);

  LOADED_FONTS.add(font.name);
}

/** Ensure a font is loaded by name (lookup in GOOGLE_FONTS). */
export function ensureFontLoaded(name: string): void {
  const font = GOOGLE_FONTS.find((f) => f.name === name);
  if (font) loadGoogleFont(font);
}
