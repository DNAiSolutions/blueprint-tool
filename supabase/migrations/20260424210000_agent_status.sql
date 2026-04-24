-- Command Center: live agent status.
--
-- A single row per agent. The edge function (agent-status) upserts on POST
-- from hooks (Claude Code SessionStart / PreToolUse / PostToolUse / Stop)
-- or from any other agent framework. Frontend subscribes via realtime.

create table if not exists public.agent_status (
  agent_id   text primary key,
  status     text not null default 'idle'
             check (status in ('active','waiting','recent','idle','offline')),
  task       text not null default '',
  updated_at timestamptz not null default now()
);

-- Fast-read index for the Command sidebar poll fallback.
create index if not exists agent_status_updated_at_idx
  on public.agent_status (updated_at desc);

-- Enable realtime so the frontend sees dot color changes live.
alter publication supabase_realtime add table public.agent_status;

-- RLS: anyone (including anon) can read agent status. Writes come from the
-- edge function which uses the service-role key and bypasses RLS anyway.
alter table public.agent_status enable row level security;

drop policy if exists "anyone can read agent status" on public.agent_status;
create policy "anyone can read agent status"
  on public.agent_status for select
  using (true);

-- Seed the 9 DigitalDNA agents at idle so the UI has rows to subscribe to
-- even before any hook has fired. Agents not in this seed list still work
-- — the edge function will insert them on first POST.
insert into public.agent_status (agent_id, status, task) values
  ('ceo',                  'idle', ''),
  ('content-producer',     'idle', ''),
  ('content-repurposer',   'idle', ''),
  ('head-of-design',       'idle', ''),
  ('social-media-manager', 'idle', ''),
  ('social-media-designer','idle', ''),
  ('short-video-creator',  'idle', ''),
  ('doc-writer',           'idle', ''),
  ('custom-software-dev',  'idle', '')
on conflict (agent_id) do nothing;
