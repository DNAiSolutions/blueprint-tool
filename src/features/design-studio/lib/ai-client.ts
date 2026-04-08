// Design Studio AI client — typed wrapper over the Phase 2 Supabase edge
// functions. Every call goes through supabase.functions.invoke so auth is
// handled automatically.
//
// All methods throw on failure so callers can surface errors via toast.

import { supabase } from '@/integrations/supabase/client';
import type { Card } from '../types';
import type { CopilotPatch } from '../store';

// Re-export so feature code can import CopilotPatch from either place
export type { CopilotPatch } from '../store';

// ---------- Shared types ----------
export type Aspect = '1:1' | '9:16' | '4:5' | '16:9';
export type ImageModel = 'nano-banana' | 'flux' | 'ideogram';
export type Platform = 'instagram' | 'tiktok' | 'linkedin' | 'facebook';

export interface GeneratedImage {
  url: string;
  width: number;
  height: number;
}

export interface GeneratedVideo {
  url: string;
  duration: number;
}

export interface ImageAnalysis {
  palette: string[];
  mood: string;
  layout: string;
  fonts: string;
  notes: string;
}

export interface CopilotResult {
  patches: CopilotPatch[];
  explanation: string;
}

export interface QualityFix {
  priority: 'high' | 'medium' | 'low';
  issue: string;
  suggestion: string;
}

export interface QualityReport {
  score: number;
  verdict: 'ship' | 'revise' | 'rebuild';
  strengths: string[];
  fixes: QualityFix[];
  autoPatches?: CopilotPatch[];
}

// ---------- Invoke helper ----------
async function invoke<T>(
  fn: string,
  body: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) throw new Error(error.message ?? `${fn} failed`);
  if (!data) throw new Error(`${fn} returned no data`);
  if ((data as { error?: string }).error) {
    throw new Error((data as { error: string }).error);
  }
  return data as T;
}

// ---------- Image generation ----------
export interface GenerateImageInput {
  prompt: string;
  model?: ImageModel;
  aspect?: Aspect;
  numImages?: number;
  negativePrompt?: string;
  seed?: number;
  imageUrl?: string;
}

export async function generateImage(
  input: GenerateImageInput,
): Promise<{ images: GeneratedImage[]; model: ImageModel }> {
  return invoke('generate-image', input as unknown as Record<string, unknown>);
}

// ---------- Video generation (Kling 3.0) ----------
export interface GenerateVideoInput {
  imageUrl: string;
  prompt?: string;
  duration?: 5 | 10;
  aspect?: Aspect;
}

export async function generateVideo(
  input: GenerateVideoInput,
): Promise<{ video: GeneratedVideo }> {
  return invoke('generate-video', input as unknown as Record<string, unknown>);
}

// ---------- Background removal ----------
export async function removeBackground(
  imageUrl: string,
): Promise<{ image: { url: string } }> {
  return invoke('remove-background', { imageUrl });
}

// ---------- Inspiration analysis ----------
export async function analyzeImage(
  imageUrl: string,
  purpose: 'palette' | 'layout' | 'full' = 'full',
): Promise<{ analysis: ImageAnalysis }> {
  return invoke('analyze-image', { imageUrl, purpose });
}

// ---------- Copilot natural-language edit ----------
export interface CopilotEditInput {
  instruction: string;
  card: Card;
  selectedLayerId?: string;
  brandColors?: Record<string, string>;
}

export async function copilotEdit(
  input: CopilotEditInput,
): Promise<CopilotResult> {
  return invoke('copilot-edit', input as unknown as Record<string, unknown>);
}

// ---------- Quality review ----------
export interface QualityReviewInput {
  card: Card;
  imageUrl?: string;
  imageBase64?: string;
  mediaType?: string;
  audience?: string;
  platform?: Platform;
}

export async function qualityReview(
  input: QualityReviewInput,
): Promise<QualityReport> {
  return invoke('quality-review', input as unknown as Record<string, unknown>);
}
