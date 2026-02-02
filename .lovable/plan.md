
# Implementation Plan: Complete Canvas/Automation Builder Features

## Overview
This plan adds the missing interactive features from the scaffolding document to make the Canvas fully functional for live sales calls. We focus **only** on Canvas-area functionality—no color/design changes.

---

## Phase 1: Node Dragging & Positioning

**Goal**: Make nodes draggable so reps can customize the layout during calls.

### Changes

**1. Add Drag State to CanvasNode**
- Track `isDragging` state
- Track mouse offset for smooth drag
- Update node position on mouse move

**2. Update Canvas.tsx**
- Add drag handlers (`onMouseDown`, `onMouseMove`, `onMouseUp`)
- Call `updateNode` with new position when drag ends
- Connectors already follow (they read from `node.position`)

**3. Cursor Feedback**
- Default: `cursor-pointer`
- Dragging: `cursor-grabbing`
- Hover: `cursor-grab`

---

## Phase 2: Node Edit & Delete Operations

**Goal**: Enable editing and deleting nodes via double-click and context menu.

### Changes

**1. Create NodeEditModal Component** (`src/components/canvas/NodeEditModal.tsx`)
- Modal with form fields: Label, Volume, Conversion Rate, Notes
- Pre-populated with current node data
- Save button updates node via `updateNode`
- Delete button with confirmation

**2. Add Context Menu** (using Radix ContextMenu or simple right-click handler)
- Options: [Edit] [Delete] [Duplicate]
- On Edit: Open NodeEditModal
- On Delete: Confirm + remove node + clean up connections
- On Duplicate: Clone node, offset position slightly

**3. Double-Click Handler**
- On double-click: Open NodeEditModal directly

**4. Update useSession**
- Ensure `deleteNode` cleans up all references in other nodes' `connections` array
- Add `duplicateNode` function

---

## Phase 3: Add Node Button + Modal

**Goal**: Let reps add nodes manually (not just via question flow).

### Changes

**1. Add Sticky [+] Button** in QuestionPanel
- Position: Bottom of sidebar, sticky
- Style: Full width, prominent
- Label: "+ Add Node"

**2. Create AddNodeModal** (`src/components/canvas/AddNodeModal.tsx`)
- Step 1: Select node type (radio buttons with icons + descriptions)
- Step 2: Form fields based on type:
  - Label (text)
  - Volume (number)
  - Conversion Rate (percentage)
  - Cost (currency, optional for lead-source)
- Submit: Create node via `addNode`, auto-position based on type level

---

## Phase 4: Real-Time Metrics Calculations

**Goal**: Calculate and display funnel metrics live as data is entered.

### Changes

**1. Create useMetricsCalculator Hook** (`src/hooks/useMetricsCalculator.tsx`)
```
Input: nodes[]
Output:
  - conversionByStage: { [nodeId]: % }
  - dropoffByStage: { [nodeId]: count }
  - revenueLeakByStage: { [nodeId]: $ }
  - totalRevenueAtRisk: $
  - biggestLeak: { stageId, stageName, reason, impact }
```

**2. Calculation Logic**
- For each node, calculate: `dropoff = previousVolume - currentVolume`
- Revenue leak = `dropoff × avgDealValue` (avgDealValue from session or default)
- Flag leak if `conversionRate < 25%`

**3. Update Metrics Panel in Canvas.tsx**
- Display calculated metrics instead of placeholders
- Highlight Top Leak with pulsing animation
- Show Revenue at Risk prominently

---

## Phase 5: Connector Labels + Interactions

**Goal**: Show drop-off data on connectors and allow deletion.

### Changes

**1. Update ConnectorsSVG**
- Add text element at midpoint of each connector path
- Display: "{dropoff}% drop ({count} lost)"
- Style: Small gray background, readable text

**2. Add Connector Click Handler**
- Make connector paths interactive (`pointer-events: stroke`)
- On click/right-click: Show option to delete connection
- On delete: Update source node's `connections` array

---

## Phase 6: Keyboard Shortcuts

**Goal**: Enable keyboard navigation for power users.

### Changes

**1. Add Keyboard Event Listener** in Canvas.tsx
- `Tab`: Cycle through nodes (update selectedNodeId)
- `Enter`: Open edit modal for selected node
- `Delete/Backspace`: Delete selected node (with confirmation)
- `Escape`: Deselect node, exit connect mode

**2. Focus Management**
- Ensure canvas container is focusable
- Visual focus indicator on selected node

---

## Phase 7: Auto-Save + Toast Feedback

**Goal**: Auto-save session and show confirmation.

### Changes

**1. Add Auto-Save Timer**
- In useSession or Canvas.tsx
- Every 30 seconds, persist to localStorage (already happening)
- Optional: If backend available, sync to database

**2. Add Save Toast**
- Show subtle "Saved" toast using Sonner
- Duration: 2 seconds
- Position: Bottom right

**3. Manual Save Button**
- Currently shows but does nothing
- Wire up to trigger immediate save + toast

---

## Files to Create/Modify

### New Files
- `src/components/canvas/NodeEditModal.tsx` — Edit/delete modal
- `src/components/canvas/AddNodeModal.tsx` — Add new node modal
- `src/hooks/useMetricsCalculator.tsx` — Real-time metrics calculations

### Modified Files
- `src/components/canvas/CanvasNode.tsx` — Add drag handlers, double-click
- `src/components/canvas/CanvasConnector.tsx` — Add labels, click handlers
- `src/components/canvas/QuestionPanel.tsx` — Add sticky "+ Add Node" button
- `src/pages/Canvas.tsx` — Keyboard shortcuts, context menu, auto-save
- `src/hooks/useSession.tsx` — Add duplicateNode, improve deleteNode

---

## Implementation Order

1. **Phase 1**: Node Dragging (foundational interactivity)
2. **Phase 2**: Node Edit/Delete (essential for corrections)
3. **Phase 3**: Add Node Button + Modal (manual node creation)
4. **Phase 4**: Metrics Calculations (core value prop)
5. **Phase 5**: Connector Labels (visual clarity)
6. **Phase 6**: Keyboard Shortcuts (power user flow)
7. **Phase 7**: Auto-Save (polish)

---

## Testing Checklist

After implementation:
- [ ] Drag a node → connectors follow
- [ ] Double-click node → edit modal opens with data
- [ ] Right-click node → context menu with Edit/Delete/Duplicate
- [ ] Delete node → removed from canvas + connections cleaned
- [ ] Click "+ Add Node" → modal opens, select type, fill form, node appears
- [ ] Metrics panel updates as nodes are created/edited
- [ ] Top Leak shows with pulsing animation when conversion < 25%
- [ ] Tab/Enter/Delete/Escape keyboard shortcuts work
- [ ] "Saved" toast appears periodically

---

## What This Does NOT Change
- No color palette changes
- No design token modifications  
- No changes to existing question flow logic
- No changes to session data structure (only additions)
- Keeps all existing functionality intact
