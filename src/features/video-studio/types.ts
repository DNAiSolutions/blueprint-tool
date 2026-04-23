// Video Studio — types
// Represents the full state of the 3-stage DigitalDNA video editing pipeline:
//   Stage 1: video-use (cut + clean)
//   Stage 2: hyperframes (motion graphics)
//   Stage 3: DigitalDNA QA (brand enforcement)

export type VideoFormat = 'longform' | 'shortform';

export type StageStatus = 'pending' | 'running' | 'complete' | 'error' | 'skipped';

export type ProjectStatus =
  | 'draft'        // created, footage not uploaded
  | 'ready'        // footage uploaded, directives set, ready to run
  | 'processing'   // one of the 3 stages is active
  | 'qa_review'    // pipeline done, awaiting QA review
  | 'needs_fixes'  // QA found P0 fails
  | 'approved'     // QA passed
  | 'published';   // distributed

export interface RawSource {
  id: string;
  filename: string;
  role: 'cam_a' | 'cam_b' | 'screen' | 'b_roll' | 'audio';
  duration?: number;       // seconds
  sizeMB?: number;
  uploadedAt?: string;
}

export interface Chapter {
  num: number;
  title: string;
  startFrame?: number;
  endFrame?: number;
  startTime?: number;      // seconds
  endTime?: number;
}

export interface TranscriptWord {
  word: string;
  start: number;           // seconds
  end: number;
  highlight: boolean;      // cyan keyword treatment
  speaker?: string;
}

export interface CutEvent {
  type: 'hard_cut' | 'angle_switch' | 'b_roll_in' | 'b_roll_out' | 'filler_removed' | 'silence_removed';
  atTime: number;          // seconds into the final cut
  sourceFile?: string;
  reason?: string;
}

export interface ZoomCue {
  atTime: number;
  duration: number;
  scale: number;           // 1.15, 1.25, 1.35
  reason?: string;
}

export interface GraphicEvent {
  type: 'chapter_card' | 'mid_roll_cta' | 'bridge_end_card' | 'text_pop' | 'caption_word';
  atTime: number;
  duration: number;
  props?: Record<string, unknown>;
}

export type QAPriority = 'P0' | 'P1' | 'advisory';

export interface QACheck {
  id: string;              // e.g. "P0-1"
  label: string;           // e.g. "Hook lands in ≤10s"
  priority: QAPriority;
  status: 'pass' | 'fail' | 'warn' | 'skip';
  detail?: string;
  suggestedFix?: string;
}

export interface Stage {
  id: 1 | 2 | 3;
  name: string;
  tool: string;            // "video-use" | "hyperframes" | "DigitalDNA QA"
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
  progress?: number;       // 0..1
  logs?: string[];
  output?: string;         // path to output file
}

export interface VideoProject {
  id: string;
  slug: string;
  title: string;
  clientName: string;
  clientTag: string;
  format: VideoFormat;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;

  // Runtime metadata
  durationSeconds?: number;
  width: number;
  height: number;
  fps: number;

  // Inputs
  sources: RawSource[];
  directives: {
    targetDuration?: string;
    fillerWords: string[];
    skipRanges: { source: string; from: string; to: string; reason: string }[];
    chapters: string[];
    preserve: { phrase: string; reason: string }[];
    credibilityAnchor?: string;
    midRollCta?: { copy: string; url?: string };
    bridge?: { nextVideoTitle: string; nextVideoThumb?: string };
  };

  // Stage 1 output (video-use)
  transcript?: TranscriptWord[];
  cuts?: CutEvent[];
  chapters?: Chapter[];

  // Stage 2 output (hyperframes)
  graphics?: GraphicEvent[];
  zooms?: ZoomCue[];

  // Stage 3 output (QA)
  qaChecks?: QACheck[];
  qaVerdict?: 'ready' | 'blocked' | 'pending';

  // Pipeline state
  stages: Stage[];
  finalRenderPath?: string;
  thumbnailUrl?: string;
}

export const STAGES_DEFAULT: Stage[] = [
  { id: 1, name: 'Cut & Clean', tool: 'video-use', status: 'pending' },
  { id: 2, name: 'Motion Graphics', tool: 'hyperframes', status: 'pending' },
  { id: 3, name: 'Style QA', tool: 'DigitalDNA QA', status: 'pending' },
];

// Helpers

export function formatDuration(seconds?: number): string {
  if (!seconds || seconds < 0) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function progressOverall(stages: Stage[]): number {
  if (stages.length === 0) return 0;
  const weights = { pending: 0, running: 0.5, complete: 1, error: 0, skipped: 1 };
  const total = stages.reduce((acc, s) => acc + weights[s.status], 0);
  return total / stages.length;
}
