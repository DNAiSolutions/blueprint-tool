// Mock video projects — matches the skill's 3-stage pipeline.
// Will be replaced with Supabase-backed data in Phase 2.

import type { VideoProject, TranscriptWord, Chapter, GraphicEvent, QACheck, ZoomCue, CutEvent } from './types';

// Synthesize a word-level transcript with keyword highlights.
function makeTranscript(sentences: { text: string; start: number }[]): TranscriptWord[] {
  const words: TranscriptWord[] = [];
  for (const { text, start } of sentences) {
    const tokens = text.split(/\s+/);
    const perWord = 0.32;
    tokens.forEach((token, i) => {
      const s = start + i * perWord;
      // Highlight: every 3rd word OR ≥6 letters OR money/percent/multiplier
      const len = token.replace(/[^A-Za-z]/g, '').length;
      const isMoney = /\$[\d,]+|\d+%|\d+x/i.test(token);
      const highlight = isMoney || len >= 6 || i % 3 === 0;
      words.push({
        word: token,
        start: s,
        end: s + perWord - 0.02,
        highlight,
      });
    });
  }
  return words;
}

// GHL project (longform, mid-pipeline — fully processed through QA)
const ghlTranscript = makeTranscript([
  { text: 'GoHighLevel just made AI completely free', start: 0.4 },
  { text: "I've run a $400K per month agency for three years and this changes everything", start: 8.2 },
  { text: 'Here is what you actually get', start: 24.0 },
  { text: 'Every sub-account gets the AI employee plan at no cost', start: 28.0 },
  { text: 'That is four hundred dollars a month saved per agent', start: 144.2 },
]);

const ghlProject: VideoProject = {
  id: 'vp-1',
  slug: 'ghl-ai-announcement',
  title: 'BREAKING: GoHighLevel Just Made AI FREE',
  clientName: 'DigitalDNA',
  clientTag: 'internal',
  format: 'longform',
  status: 'approved',
  createdAt: '2026-04-22T09:00:00Z',
  updatedAt: '2026-04-23T11:45:00Z',
  durationSeconds: 624,
  width: 1920,
  height: 1080,
  fps: 30,
  sources: [
    { id: 's1', filename: 'cam_a.mp4', role: 'cam_a', duration: 1124, sizeMB: 2140 },
    { id: 's2', filename: 'cam_b.mp4', role: 'cam_b', duration: 1124, sizeMB: 2086 },
    { id: 's3', filename: 'screen_ghl_demo.mp4', role: 'screen', duration: 382, sizeMB: 612 },
  ],
  directives: {
    targetDuration: '10-12 min',
    fillerWords: ['basically', 'at the end of the day', 'kind of', 'sort of', 'essentially'],
    skipRanges: [
      { source: 'cam_a.mp4', from: '00:00:00', to: '00:00:22', reason: 'mic check + settling' },
      { source: 'cam_a.mp4', from: '00:14:03', to: '00:14:41', reason: 'restarted hook twice — use 3rd take' },
    ],
    chapters: [
      'What GoHighLevel Just Made Free',
      'Inside the AI Employee Plan',
      'The Real Cost Breakdown',
      "Live Demo with Maddie's Mobile Makeovers",
      'Bottom Line — Who Should Upgrade',
    ],
    preserve: [
      { phrase: 'GoHighLevel just made AI completely free', reason: 'Opening hook' },
      { phrase: 'That is $400 a month saved per agent', reason: 'Money shot' },
    ],
    credibilityAnchor: "I've run a $400K/mo agency for 3 years and I've been testing this for 72 hours.",
    midRollCta: { copy: 'Join the AI Business Blueprint community free' },
    bridge: {
      nextVideoTitle: 'I built a $10K/mo agency using just Claude',
      nextVideoThumb: '/thumbs/next-claude.jpg',
    },
  },
  transcript: ghlTranscript,
  cuts: [
    { type: 'filler_removed', atTime: 1.2, reason: '"basically" removed' },
    { type: 'silence_removed', atTime: 3.8, reason: '0.8s gap' },
    { type: 'angle_switch', atTime: 32.1, sourceFile: 'cam_b.mp4' },
    { type: 'b_roll_in', atTime: 144.0, sourceFile: 'screen_ghl_demo.mp4', reason: 'pricing demo' },
    { type: 'b_roll_out', atTime: 198.0, sourceFile: 'screen_ghl_demo.mp4' },
    { type: 'angle_switch', atTime: 250.0, sourceFile: 'cam_a.mp4' },
    { type: 'filler_removed', atTime: 274.4, reason: '"like" x3' },
    { type: 'b_roll_in', atTime: 301.0, sourceFile: 'screen_ghl_demo.mp4', reason: 'live demo' },
    { type: 'hard_cut', atTime: 470.0, reason: 'skip range 14:03-14:41' },
    { type: 'angle_switch', atTime: 552.0, sourceFile: 'cam_a.mp4' },
  ],
  chapters: [
    { num: 1, title: 'What GoHighLevel Just Made Free', startTime: 22, endTime: 130 },
    { num: 2, title: 'Inside the AI Employee Plan', startTime: 130, endTime: 238 },
    { num: 3, title: 'The Real Cost Breakdown', startTime: 238, endTime: 340 },
    { num: 4, title: "Live Demo with Maddie's Mobile Makeovers", startTime: 340, endTime: 510 },
    { num: 5, title: 'Bottom Line — Who Should Upgrade', startTime: 510, endTime: 619 },
  ],
  graphics: [
    { type: 'chapter_card', atTime: 22, duration: 2.5, props: { num: 1, title: 'What GoHighLevel Just Made Free' } },
    { type: 'chapter_card', atTime: 130, duration: 2.5, props: { num: 2, title: 'Inside the AI Employee Plan' } },
    { type: 'chapter_card', atTime: 238, duration: 2.5, props: { num: 3, title: 'The Real Cost Breakdown' } },
    { type: 'mid_roll_cta', atTime: 288, duration: 6, props: { copy: 'Join the AI Business Blueprint community free' } },
    { type: 'chapter_card', atTime: 340, duration: 2.5, props: { num: 4, title: "Live Demo with Maddie's Mobile Makeovers" } },
    { type: 'chapter_card', atTime: 510, duration: 2.5, props: { num: 5, title: 'Bottom Line — Who Should Upgrade' } },
    { type: 'bridge_end_card', atTime: 619, duration: 5, props: { nextVideoTitle: 'I built a $10K/mo agency using just Claude' } },
  ],
  zooms: [
    { atTime: 54.0, duration: 1.5, scale: 1.15, reason: 'tool reveal' },
    { atTime: 147.0, duration: 2.0, scale: 1.25, reason: 'money shot — $400/mo saved' },
    { atTime: 312.0, duration: 1.8, scale: 1.35, reason: 'demo reveal' },
    { atTime: 448.0, duration: 1.5, scale: 1.15, reason: 'result callout' },
  ],
  qaChecks: [
    { id: 'P0-1', label: 'Hook lands in ≤10s', priority: 'P0', status: 'pass', detail: 'Hook at 0:02' },
    { id: 'P0-2', label: 'Minimum 3 chapters', priority: 'P0', status: 'pass', detail: '5 chapters detected' },
    { id: 'P0-3', label: 'Mid-roll CTA 40-60% runtime', priority: 'P0', status: 'pass', detail: 'CTA at 4:48 (46%)' },
    { id: 'P0-4', label: 'Bridge end card present', priority: 'P0', status: 'pass', detail: 'at 10:19, 5s' },
    { id: 'P0-5', label: 'Caption coverage ≥98%', priority: 'P0', status: 'pass', detail: '99.2%' },
    { id: 'P0-6', label: 'Brand bug full duration', priority: 'P0', status: 'pass' },
    { id: 'P0-7', label: 'Audio in spec', priority: 'P0', status: 'pass', detail: '-16.2 LUFS, peak -2.1 dBTP' },
    { id: 'P0-8', label: 'video-use self-eval', priority: 'P0', status: 'pass' },
    { id: 'P1-1', label: 'Credibility anchor', priority: 'P1', status: 'pass', detail: '"$400K/mo agency" at 0:10' },
    { id: 'P1-2', label: 'Demo in a chapter', priority: 'P1', status: 'pass', detail: 'Chapter 4, 2:50 duration' },
    { id: 'P1-3', label: 'Shown economics', priority: 'P1', status: 'pass', detail: '8/9 money mentions have on-screen' },
    { id: 'P1-4', label: 'Zoom cadence 2-4/chapter', priority: 'P1', status: 'pass', detail: '1, 1, 1, 1 per chapter' },
    { id: 'P1-5', label: 'Multi-cam alternation', priority: 'P1', status: 'pass' },
    { id: 'P1-6', label: 'Bottom line phrase', priority: 'P1', status: 'warn', detail: 'No explicit "here\'s the bottom line" found', suggestedFix: 'add wrap-up line before bridge' },
    { id: 'P1-7', label: 'No back-to-back zooms', priority: 'P1', status: 'pass' },
    { id: 'P1-8', label: 'Meaningful chapter titles', priority: 'P1', status: 'pass' },
    { id: 'A-4', label: 'Hook strength', priority: 'advisory', status: 'pass', detail: 'Specific: "GoHighLevel", "AI", "free"' },
    { id: 'A-6', label: 'Runtime in 8-15 min range', priority: 'advisory', status: 'pass', detail: '10:24' },
  ],
  qaVerdict: 'ready',
  stages: [
    { id: 1, name: 'Cut & Clean', tool: 'video-use', status: 'complete', progress: 1, startedAt: '2026-04-23T10:00:00Z', completedAt: '2026-04-23T10:22:00Z' },
    { id: 2, name: 'Motion Graphics', tool: 'hyperframes', status: 'complete', progress: 1, startedAt: '2026-04-23T10:22:00Z', completedAt: '2026-04-23T10:58:00Z' },
    { id: 3, name: 'Style QA', tool: 'DigitalDNA QA', status: 'complete', progress: 1, startedAt: '2026-04-23T10:58:00Z', completedAt: '2026-04-23T11:02:00Z' },
  ],
  finalRenderPath: 'video-projects/ghl-ai-announcement/FINAL.mp4',
  thumbnailUrl: '/thumbs/ghl-hero.jpg',
};

// Acme project (shortform, stage 2 mid-run)
const acmeProject: VideoProject = {
  id: 'vp-2',
  slug: 'acme-pressure-washing-reel',
  title: 'I saved $3,200/mo in 3 clicks (Acme)',
  clientName: 'Acme Pressure Washing',
  clientTag: 'acme',
  format: 'shortform',
  status: 'processing',
  createdAt: '2026-04-23T08:00:00Z',
  updatedAt: '2026-04-23T12:10:00Z',
  durationSeconds: 58,
  width: 1080,
  height: 1920,
  fps: 30,
  sources: [
    { id: 's1', filename: 'cam_a.mp4', role: 'cam_a', duration: 124, sizeMB: 412 },
    { id: 's2', filename: 'screen_gbp.mp4', role: 'screen', duration: 62, sizeMB: 104 },
  ],
  directives: {
    targetDuration: '45-60s',
    fillerWords: ['basically', 'kind of', 'so basically'],
    skipRanges: [],
    chapters: [],
    preserve: [
      { phrase: 'I saved $3,200 a month in 3 clicks', reason: 'Hook' },
    ],
    credibilityAnchor: "I run a local pressure washing company.",
    midRollCta: { copy: 'Follow for more' },
  },
  transcript: makeTranscript([
    { text: 'I saved $3,200 a month in three clicks', start: 0.2 },
    { text: 'Here is exactly what I did', start: 3.4 },
  ]),
  cuts: [
    { type: 'filler_removed', atTime: 0.8, reason: '"basically"' },
    { type: 'silence_removed', atTime: 2.1 },
    { type: 'b_roll_in', atTime: 8.0, sourceFile: 'screen_gbp.mp4' },
  ],
  chapters: [],
  graphics: [
    { type: 'text_pop', atTime: 0.1, duration: 1.0, props: { text: 'I SAVED $3,200/MO' } },
    { type: 'text_pop', atTime: 10.0, duration: 1.0, props: { text: "HERE'S HOW" } },
  ],
  zooms: [
    { atTime: 2.1, duration: 1.2, scale: 1.35, reason: 'money callout' },
  ],
  qaVerdict: 'pending',
  stages: [
    { id: 1, name: 'Cut & Clean', tool: 'video-use', status: 'complete', progress: 1 },
    { id: 2, name: 'Motion Graphics', tool: 'hyperframes', status: 'running', progress: 0.62, logs: [
      '[hyperframes] Loaded composition.html',
      '[hyperframes] Registered 148 caption-word blocks',
      '[hyperframes] Capturing frame 1070/1740 (62%)',
    ] },
    { id: 3, name: 'Style QA', tool: 'DigitalDNA QA', status: 'pending' },
  ],
};

// NOLA project (draft — just created, no footage yet)
const nolaProject: VideoProject = {
  id: 'vp-3',
  slug: 'nola-gbp-50k',
  title: 'Your GBP is Costing You $50K/yr',
  clientName: 'NOLA Roofing Pros',
  clientTag: 'nola',
  format: 'longform',
  status: 'draft',
  createdAt: '2026-04-23T11:00:00Z',
  updatedAt: '2026-04-23T11:00:00Z',
  width: 1920,
  height: 1080,
  fps: 30,
  sources: [],
  directives: {
    fillerWords: [],
    skipRanges: [],
    chapters: [],
    preserve: [],
  },
  stages: [
    { id: 1, name: 'Cut & Clean', tool: 'video-use', status: 'pending' },
    { id: 2, name: 'Motion Graphics', tool: 'hyperframes', status: 'pending' },
    { id: 3, name: 'Style QA', tool: 'DigitalDNA QA', status: 'pending' },
  ],
};

// Bayou project (needs_fixes — P0 failure detected)
const bayouProject: VideoProject = {
  id: 'vp-4',
  slug: 'bayou-landscaping-invisible',
  title: 'Why Your Website is Invisible',
  clientName: 'Bayou Landscaping',
  clientTag: 'bayou',
  format: 'longform',
  status: 'needs_fixes',
  createdAt: '2026-04-21T09:00:00Z',
  updatedAt: '2026-04-22T15:30:00Z',
  durationSeconds: 532,
  width: 1920,
  height: 1080,
  fps: 30,
  sources: [
    { id: 's1', filename: 'cam_a.mp4', role: 'cam_a', duration: 842 },
  ],
  directives: {
    targetDuration: '8-10 min',
    fillerWords: ['basically'],
    skipRanges: [],
    chapters: ['What Makes a Website Invisible', 'The Fix'],
    preserve: [],
    credibilityAnchor: 'I run a local agency.',
  },
  transcript: makeTranscript([
    { text: 'Your website is invisible and here is why', start: 2.0 },
  ]),
  cuts: [],
  chapters: [
    { num: 1, title: 'What Makes a Website Invisible', startTime: 20, endTime: 280 },
    { num: 2, title: 'The Fix', startTime: 280, endTime: 525 },
  ],
  graphics: [
    { type: 'chapter_card', atTime: 20, duration: 2.5, props: { num: 1 } },
    { type: 'chapter_card', atTime: 280, duration: 2.5, props: { num: 2 } },
  ],
  zooms: [],
  qaChecks: [
    { id: 'P0-1', label: 'Hook lands in ≤10s', priority: 'P0', status: 'pass', detail: 'Hook at 0:02' },
    { id: 'P0-2', label: 'Minimum 3 chapters', priority: 'P0', status: 'fail', detail: 'Only 2 chapters', suggestedFix: 'Split "The Fix" chapter into "The Audit" + "The Fix"' },
    { id: 'P0-3', label: 'Mid-roll CTA 40-60% runtime', priority: 'P0', status: 'fail', detail: 'CTA missing', suggestedFix: 'Add mid-roll CTA at ~4:30' },
    { id: 'P0-4', label: 'Bridge end card present', priority: 'P0', status: 'fail', detail: 'Missing', suggestedFix: 'Add bridge target to directives.md' },
    { id: 'P0-5', label: 'Caption coverage ≥98%', priority: 'P0', status: 'pass', detail: '98.4%' },
    { id: 'P0-6', label: 'Brand bug full duration', priority: 'P0', status: 'pass' },
    { id: 'P0-7', label: 'Audio in spec', priority: 'P0', status: 'pass' },
    { id: 'P0-8', label: 'video-use self-eval', priority: 'P0', status: 'pass' },
  ],
  qaVerdict: 'blocked',
  stages: [
    { id: 1, name: 'Cut & Clean', tool: 'video-use', status: 'complete', progress: 1 },
    { id: 2, name: 'Motion Graphics', tool: 'hyperframes', status: 'complete', progress: 1 },
    { id: 3, name: 'Style QA', tool: 'DigitalDNA QA', status: 'complete', progress: 1 },
  ],
};

export const MOCK_PROJECTS: VideoProject[] = [
  ghlProject,
  acmeProject,
  nolaProject,
  bayouProject,
];
