// @ts-nocheck
// useVideoProjects — Supabase-backed data layer for the Video Studio.
// Matches the pattern of useDesignProjects.ts.
//
// Surfaces:
//   - list of video projects (optionally scoped to a client project_id)
//   - CRUD (create, update, delete)
//   - realtime subscription for stage progress updates while the pipeline runs
//   - convenience: seedMocks() to insert the demo projects for first-time users

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database, Json } from '@/integrations/supabase/types';
import type { VideoProject, RawSource, Stage, VideoFormat, ProjectStatus } from './types';
import { STAGES_DEFAULT } from './types';
import { MOCK_PROJECTS } from './mock-data';

type DbVideoProject = Database['public']['Tables']['video_projects']['Row'];
type DbVideoSource = Database['public']['Tables']['video_sources']['Row'];

/* ---------- db → domain mappers ---------- */

function dbSourceToRawSource(row: DbVideoSource): RawSource {
  return {
    id: row.id,
    filename: row.filename,
    role: row.role as RawSource['role'],
    duration: row.duration_seconds ?? undefined,
    sizeMB: row.size_mb ?? undefined,
    uploadedAt: row.uploaded_at,
  };
}

function dbProjectToVideoProject(row: DbVideoProject, sources: RawSource[] = []): VideoProject {
  const directives = (row.directives as Record<string, unknown>) ?? {};
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    clientName: row.client_name ?? 'Unknown',
    clientTag: row.client_tag ?? 'internal',
    format: row.format as VideoFormat,
    status: row.status as ProjectStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    durationSeconds: row.duration_seconds ?? undefined,
    width: row.width,
    height: row.height,
    fps: row.fps,
    sources,
    directives: {
      targetDuration: directives.targetDuration as string | undefined,
      fillerWords: (directives.fillerWords as string[]) ?? [],
      skipRanges: (directives.skipRanges as VideoProject['directives']['skipRanges']) ?? [],
      chapters: (directives.chapters as string[]) ?? [],
      preserve: (directives.preserve as VideoProject['directives']['preserve']) ?? [],
      credibilityAnchor: directives.credibilityAnchor as string | undefined,
      midRollCta: directives.midRollCta as VideoProject['directives']['midRollCta'],
      bridge: directives.bridge as VideoProject['directives']['bridge'],
    },
    transcript: row.transcript ? (row.transcript as VideoProject['transcript']) : undefined,
    cuts: row.cuts ? (row.cuts as VideoProject['cuts']) : undefined,
    chapters: row.chapters ? (row.chapters as VideoProject['chapters']) : undefined,
    graphics: row.graphics ? (row.graphics as VideoProject['graphics']) : undefined,
    zooms: row.zooms ? (row.zooms as VideoProject['zooms']) : undefined,
    qaChecks: row.qa_checks ? (row.qa_checks as VideoProject['qaChecks']) : undefined,
    qaVerdict: row.qa_verdict as VideoProject['qaVerdict'],
    stages: ((row.stages as Stage[]) ?? STAGES_DEFAULT) as Stage[],
    thumbnailUrl: row.thumbnail_url ?? undefined,
    finalRenderPath: row.final_render_url ?? undefined,
  };
}

/* ---------- hook ---------- */

export function useVideoProjects(projectId?: string) {
  const qc = useQueryClient();

  // ---------- LIST ----------
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['video_projects', projectId ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('video_projects')
        .select('*')
        .order('updated_at', { ascending: false });
      if (projectId) query = query.eq('project_id', projectId);

      const { data: projRows, error: projErr } = await query;
      if (projErr) throw projErr;
      const rows = projRows ?? [];
      if (rows.length === 0) return [];

      // Batch-fetch sources for all projects in one round-trip
      const ids = rows.map((r) => r.id);
      const { data: sourceRows } = await supabase
        .from('video_sources')
        .select('*')
        .in('video_project_id', ids);

      const sourcesByProject = new Map<string, RawSource[]>();
      (sourceRows ?? []).forEach((s) => {
        const bucket = sourcesByProject.get(s.video_project_id) ?? [];
        bucket.push(dbSourceToRawSource(s));
        sourcesByProject.set(s.video_project_id, bucket);
      });

      return rows.map((r) => dbProjectToVideoProject(r, sourcesByProject.get(r.id) ?? []));
    },
  });

  // ---------- REALTIME: stream stage progress updates ----------
  useEffect(() => {
    const channel = supabase
      .channel('video_projects_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'video_projects' },
        () => {
          qc.invalidateQueries({ queryKey: ['video_projects'] });
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'video_sources' },
        () => {
          qc.invalidateQueries({ queryKey: ['video_projects'] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  // ---------- CREATE ----------
  const createProject = useMutation({
    mutationFn: async (project: VideoProject) => {
      const isLocalId = project.id.startsWith('vp-') || project.id.startsWith('draft-') || project.id.startsWith('local-');

      const row: Record<string, unknown> = {
        project_id: null,  // client project link — optional
        slug: project.slug,
        title: project.title,
        client_name: project.clientName,
        client_tag: project.clientTag,
        format: project.format,
        status: project.status,
        width: project.width,
        height: project.height,
        fps: project.fps,
        duration_seconds: project.durationSeconds ?? null,
        directives: project.directives as unknown as Json,
        stages: project.stages as unknown as Json,
        thumbnail_url: project.thumbnailUrl ?? null,
      };

      if (!isLocalId) row.id = project.id;

      const { data, error } = await supabase
        .from('video_projects')
        .insert(row)
        .select()
        .single();
      if (error) throw error;

      // If mock data included sources, insert them too
      if (project.sources.length > 0) {
        const sourceRows = project.sources.map((s) => ({
          video_project_id: data.id,
          filename: s.filename,
          storage_path: `seed/${s.filename}`,
          role: s.role,
          duration_seconds: s.duration ?? null,
          size_mb: s.sizeMB ?? null,
        }));
        await supabase.from('video_sources').insert(sourceRows);
      }

      return dbProjectToVideoProject(data, project.sources);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['video_projects'] }),
  });

  // ---------- UPDATE ----------
  const updateProject = useMutation({
    mutationFn: async (project: VideoProject) => {
      const { data, error } = await supabase
        .from('video_projects')
        .update({
          title: project.title,
          status: project.status,
          duration_seconds: project.durationSeconds ?? null,
          directives: project.directives as unknown as Json,
          transcript: (project.transcript ?? null) as unknown as Json,
          cuts: (project.cuts ?? null) as unknown as Json,
          chapters: (project.chapters ?? null) as unknown as Json,
          graphics: (project.graphics ?? null) as unknown as Json,
          zooms: (project.zooms ?? null) as unknown as Json,
          qa_checks: (project.qaChecks ?? null) as unknown as Json,
          qa_verdict: project.qaVerdict ?? null,
          stages: project.stages as unknown as Json,
          thumbnail_url: project.thumbnailUrl ?? null,
          final_render_url: project.finalRenderPath ?? null,
        })
        .eq('id', project.id)
        .select()
        .single();
      if (error) throw error;
      return dbProjectToVideoProject(data, project.sources);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['video_projects'] }),
  });

  // ---------- DELETE ----------
  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('video_projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['video_projects'] }),
  });

  // ---------- ADD SOURCE ----------
  const addSource = useMutation({
    mutationFn: async (args: { projectId: string; source: Omit<RawSource, 'id' | 'uploadedAt'> & { storagePath: string } }) => {
      const { data, error } = await supabase
        .from('video_sources')
        .insert({
          video_project_id: args.projectId,
          filename: args.source.filename,
          storage_path: args.source.storagePath,
          role: args.source.role,
          duration_seconds: args.source.duration ?? null,
          size_mb: args.source.sizeMB ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return dbSourceToRawSource(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['video_projects'] }),
  });

  // ---------- SEED DEMO DATA ----------
  // One-shot: inserts the 4 mock projects so the UI isn't empty on first load.
  // Safe to call multiple times — uses the (user_id, slug) unique index to
  // prevent duplicates via upsert.
  const seedMocks = useMutation({
    mutationFn: async () => {
      for (const mock of MOCK_PROJECTS) {
        const row = {
          slug: mock.slug,
          title: mock.title,
          client_name: mock.clientName,
          client_tag: mock.clientTag,
          format: mock.format,
          status: mock.status,
          width: mock.width,
          height: mock.height,
          fps: mock.fps,
          duration_seconds: mock.durationSeconds ?? null,
          directives: mock.directives as unknown as Json,
          transcript: (mock.transcript ?? null) as unknown as Json,
          cuts: (mock.cuts ?? null) as unknown as Json,
          chapters: (mock.chapters ?? null) as unknown as Json,
          graphics: (mock.graphics ?? null) as unknown as Json,
          zooms: (mock.zooms ?? null) as unknown as Json,
          qa_checks: (mock.qaChecks ?? null) as unknown as Json,
          qa_verdict: mock.qaVerdict ?? null,
          stages: mock.stages as unknown as Json,
          thumbnail_url: mock.thumbnailUrl ?? null,
          final_render_url: mock.finalRenderPath ?? null,
        };
        const { data, error } = await supabase
          .from('video_projects')
          .upsert(row, { onConflict: 'user_id,slug' })
          .select()
          .single();
        if (error) throw error;

        // Sources
        if (mock.sources.length > 0) {
          const sourceRows = mock.sources.map((s) => ({
            video_project_id: data.id,
            filename: s.filename,
            storage_path: `seed/${s.filename}`,
            role: s.role,
            duration_seconds: s.duration ?? null,
            size_mb: s.sizeMB ?? null,
          }));
          // Best-effort — ignore duplicates silently
          await supabase.from('video_sources').insert(sourceRows).select();
        }
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['video_projects'] }),
  });

  return {
    projects,
    loading: isLoading,
    error,
    createProject: createProject.mutateAsync,
    updateProject: updateProject.mutateAsync,
    deleteProject: deleteProject.mutateAsync,
    addSource: addSource.mutateAsync,
    seedMocks: seedMocks.mutateAsync,
    seeding: seedMocks.isPending,
  };
}
