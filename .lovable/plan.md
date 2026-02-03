
## What I understand you’re asking for (in plain English)

You have 3 connected problems you want fixed, without changing anything unrelated:

1) **The app must ask the intake-mapping question for *every* lead source you selected**  
   Example: If you selected 4 lead sources (Meta Ads, SEO, WebMD Directory, Patient Referrals), you should get 4 follow-up questions:
   - “Which intake methods apply to Meta Ads?”
   - “Which intake methods apply to SEO?”
   - “Which intake methods apply to WebMD Directory?”
   - “Which intake methods apply to Patient Referrals?”  
   Right now it’s only asking for some of them (skipping directory/referrals), which breaks the map.

2) **When you answer a mapping question, the connection should actually draw correctly (and consistently)**
   Example: You selected for SEO → “Email Intake” + “Phone Calls”, but the arrow(s) don’t show up (or only one shows). That means the “connect” updates are getting lost or overwritten.

3) **As a safety net, you must be able to manually connect nodes by dragging an arrow (not only the current click-to-connect toggle)**  
   Even if the question flow misses something, you should always be able to drag a connector from a Lead Source node to a specific Intake node.  
   (You also mentioned zoom—zoom controls already exist in the canvas action bar. We will not modify zoom unless needed for the drag-connector UI to work correctly with zoom.)

This is all specifically about:
- dynamic question generation (ensuring mapping questions appear for every selected lead source),
- reliable connection creation (ensuring arrows are saved properly),
- manual drag-to-connect as fallback.

No other features will be touched.

---

## Why the missing questions are happening (root cause)

### A) Mapping questions are being injected, but the “next question” logic is using the wrong list
In `src/hooks/useQuestionFlow.tsx`, the UI uses a combined list that correctly inserts **lead-handling dynamic questions** right after `q_intake_methods`.

But inside `answerQuestion`, the code that recalculates “what’s the next question” rebuilds a simplified list that:
- only accounts for **lead-sources dynamic questions**, not **lead-handling** ones,
- inserts dynamic questions at the wrong place,
- so the flow can jump forward and never present mapping questions for all lead sources.

Result: You selected 4 lead sources, but only 2 mapping questions show up.

---

## Why SEO → Email Intake isn’t connecting (root cause)

### B) Multiple rapid connection updates can overwrite each other
When you answer a mapping question and select multiple intakes, the code fires multiple “create connection” events back-to-back.

But `updateNode` in `src/hooks/useSession.tsx` currently depends on a potentially stale `currentSession` snapshot, so if two updates happen quickly, the last one can overwrite the previous one (lost connection).

Result: The UI may show the mapping answer (“Email Intake, Phone Calls”) but only one (or none) of those lines appears.

---

## Implementation plan (minimal, only what relates to this issue)

### 1) Fix dynamic question progression so mapping questions never get skipped
**File:** `src/hooks/useQuestionFlow.tsx`

**Change:**
- Refactor the “rebuild active questions” logic inside `answerQuestion` to mirror the same insertion rules used by `allQuestions`:
  - Insert `lead-handling` dynamic questions after `q_intake_methods`
  - Insert `metrics` dynamic questions at the start of the metrics section
  - Apply skip conditions based on the updated answers

**Also add:**
- Dynamic-question de-duping by `id` inside `injectDynamicQuestions` so we never double-inject and confuse indexes.

**Outcome:**
- If you select 4 lead sources, you will always get 4 mapping questions—no more missing WebMD/referrals questions.

---

### 2) Make node updates “safe under rapid-fire updates” (prevents lost connections)
**File:** `src/hooks/useSession.tsx`

**Change:**
- Rewrite `updateNode` to use a functional state update (`setCurrentSession(prev => ...)`) and update sessions inside that same functional path.  
This matches the reliability requirement you called out earlier: “don’t overwrite state during rapid successive operations.”

**Outcome:**
- When a mapping question creates multiple connections (SEO → Email Intake AND SEO → Phone Calls), both connections persist and render.

---

### 3) Ensure mapping connections are stored on the lead source node (and always render)
**Files:**  
- `src/pages/Canvas.tsx` (confirm / tighten connection handler)
- (Potentially) `src/components/canvas/CanvasConnector.tsx` (only if we find rendering is still relying on deprecated `sourceConnections`)

**Change (Canvas.tsx):**
- Keep the existing `source-to-intake-connection` handler, but make it robust:
  - Verify it can find both nodes reliably by `sourceId`
  - If not found, log a warning with the `leadSourceId`/`intakeId` (for debugging)
- Ensure it appends to `leadSourceNode.connections` without wiping existing ones (the functional `updateNode` fix in Step 2 is what makes this reliable).

**Outcome:**
- Connections are stored in one consistent place (`connections`) and render as expected.

---

### 4) Add “drag-to-connect” as a true fallback (no more “I can’t draw lines”)
Right now, manual connections require using the bottom “Connect” toggle and clicking two nodes. You specifically want drag-from-node-to-node.

**Files:**  
- `src/components/canvas/CanvasNode.tsx`
- `src/pages/Canvas.tsx`

**UI behavior:**
- Each node shows a small “connector handle” (e.g., a small circle on the right edge) on hover/selection.
- You can click-and-drag from that handle to another node.
- While dragging, a preview line follows your cursor.
- On mouse-up over a target node, we create the connection.

**Implementation details (kept minimal):**
- Add optional props to `CanvasNode`:
  - `onStartConnectionDrag(fromNodeId, startPoint)`
  - `onCompleteConnectionDrag(toNodeId)`
  - `isConnectionDragging` / highlight if it’s a valid drop target
- In `Canvas.tsx`, track:
  - `dragConnectingFromId`
  - `dragCursorPosition`
  - render an overlay SVG path for the preview line
- On drop:
  - call `updateNode(fromId, { connections: [...existing, toId] })` (same logic as Connect Mode)
- Respect zoom:
  - Convert mouse coordinates to canvas coordinates factoring `zoomLevel` and scroll offsets so the line lands where your cursor is.

**Outcome:**
- Even if questions fail or you need a custom mapping, you can always connect Lead Source → the correct Intake by dragging.

---

## Guardrails (your “don’t break anything else” requirement)
- No changes to auth, dashboard, metrics, PDF, AI readiness, or unrelated question sections.
- No new dependencies.
- Changes are limited to:
  - question flow indexing / dynamic insertion
  - safe session updates to prevent lost connections
  - connection UI fallback (drag-to-connect) implemented using existing patterns.

---

## Testing checklist (end-to-end)
1) **Dynamic mapping questions**
   - Start a fresh session
   - Select 4 lead sources (Meta Ads, SEO, WebMD Directory, Patient Referrals)
   - Select multiple intake methods (including Email Intake)
   - Confirm you are asked mapping questions for **all 4 lead sources**.

2) **Connection accuracy**
   - On “Which intake methods apply to SEO?” select **Email Intake** + **Phone Calls**
   - Confirm **two arrows** appear from SEO → Email Intake and SEO → Phone Calls (not just one).

3) **Manual fallback**
   - Without using question flow, drag from SEO node handle → Email Intake node
   - Confirm the arrow appears and persists after refresh.

4) **Zoom compatibility**
   - Zoom in/out
   - Drag-connect still drops correctly onto the intended node.

---

## Files expected to change
- `src/hooks/useQuestionFlow.tsx` (fix dynamic question progression + de-dupe)
- `src/hooks/useSession.tsx` (functional updateNode to prevent overwritten connections)
- `src/pages/Canvas.tsx` (coordinate-safe connection creation + drag-to-connect controller)
- `src/components/canvas/CanvasNode.tsx` (connector handle UI + drag events)

