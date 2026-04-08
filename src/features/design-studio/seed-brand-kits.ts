// Seed brand kits — shown on first load if no brand kits exist in Supabase
import type { BrandKit } from './types';

export const SEED_BRAND_KITS: BrandKit[] = [
  {
    id: 'cfa-laplace',
    clientId: null,
    name: 'Chick-fil-A LaPlace',
    colors: {
      red: '#E51636',
      deepRed: '#B0122B',
      cream: '#F5F1E8',
      warmWhite: '#FAFAFA',
      neutral: '#F2F2F2',
      ink: '#1A1A1A',
      yellow: '#FFD447',
    },
    fonts: { display: 'Playfair Display', body: 'Inter' },
    logos: [],
    isDefault: true,
  },
  {
    id: 'digitaldna',
    clientId: null,
    name: 'DigitalDNA',
    colors: {
      black: '#0A0A0A',
      white: '#FAFAFA',
      accent: '#E51636',
      cream: '#F5F1E8',
    },
    fonts: { display: 'Playfair Display', body: 'Inter' },
    logos: [],
  },
];
