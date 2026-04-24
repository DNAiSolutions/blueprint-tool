// AI Command — the DigitalDNA Command Center.
//
// Replaces the old IDE-style AICommand page with the full RUBRIC port:
// Welcome, Agents (live Supabase status), Flows (canvas workflow
// visualizer), Outputs (workflow artifact board), Skill Trees (force-
// directed agent×skill graph), Crons (weekly calendar), Team, Icons.
//
// Keeps the blueprint-tool originals as a second group in the same
// shell: Console (agent dispatch), Sprint (kanban), Memory, Docs.
//
// Runs full-screen (no AppLayout) per the clean-slate RUBRIC brand.

import { CommandShell } from "@/features/command/CommandShell";

export default function AICommand() {
  return <CommandShell />;
}
