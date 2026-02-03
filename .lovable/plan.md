
# Fix: Qualification Criteria Not Creating Nodes

## Problem Identified

When you select qualification criteria (like "Patient Commitment Level"), no node appears in the Qualification section of the funnel.

### Root Cause

The node creation logic in `QuestionPanel.tsx` only handles multi-select questions when `createPerSelection === true`. The qualification question (q11) has `createPerSelection: false` (designed to create ONE decision node with all criteria), but **this code path was never implemented**.

**Current code (line 101):**
```typescript
if (currentQuestion.nodeCreation?.createPerSelection && onNodeCreate) {
  // Only runs when createPerSelection is TRUE
  // Qualification question has createPerSelection: FALSE, so this never runs
}
```

### What Should Happen

When you select 4 qualification criteria:
1. Create **one** "Qualification" decision node
2. Store all selected criteria as metadata in that node
3. Display the criteria inside the node (e.g., "4 criteria")

---

## Solution

### Change 1: Add handling for `createPerSelection: false` in multi-select questions

**File:** `src/components/canvas/QuestionPanel.tsx`

After the existing `createPerSelection === true` block, add:

```typescript
// Handle single node with all selections (e.g., qualification criteria)
if (currentQuestion.nodeCreation && !currentQuestion.nodeCreation.createPerSelection && onNodeCreate) {
  const labels = multiSelectValue.map(value => {
    const option = currentQuestion.options?.find(o => o.value === value);
    return option?.label || value;
  });
  
  onNodeCreate(currentQuestion.nodeCreation.type, {
    label: `Qualification (${multiSelectValue.length} criteria)`,
    criteria: multiSelectValue,  // Store all selected values
    criteriaLabels: labels,      // Store human-readable labels
    questionId: currentQuestion.id,
  });
}
```

### Change 2: Update Canvas.tsx to handle qualification node creation

**File:** `src/pages/Canvas.tsx`

The `handleNodeCreate` function needs to handle the new `criteria` field:

```typescript
addNode({
  type: nodeType as any,
  label: data.label || getNodeLabel(nodeType, data),
  volume: data.volume || 0,
  conversionRate: data.conversionRate || 0,
  value: data.value || 0,
  position: { x: 0, y: 0 },
  connections: [],
  // NEW: Store qualification criteria
  criteria: data.criteria,
  criteriaLabels: data.criteriaLabels,
});
```

### Change 3: Update SessionNode type to include criteria

**File:** `src/types/session.ts`

Add criteria fields to the SessionNode interface:

```typescript
export interface SessionNode {
  // ... existing fields
  criteria?: string[];        // Array of qualification criteria IDs
  criteriaLabels?: string[];  // Human-readable labels for display
}
```

### Change 4: Display criteria in CanvasNode

**File:** `src/components/canvas/CanvasNode.tsx`

Show criteria count or list inside the decision node:

```typescript
{node.type === 'decision' && node.criteriaLabels && (
  <div className="text-xs text-muted-foreground mt-1">
    {node.criteriaLabels.length} criteria
  </div>
)}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/canvas/QuestionPanel.tsx` | Add handling for `createPerSelection: false` in multi-select |
| `src/pages/Canvas.tsx` | Pass criteria data to addNode |
| `src/types/session.ts` | Add `criteria` and `criteriaLabels` to SessionNode |
| `src/components/canvas/CanvasNode.tsx` | Display criteria in decision nodes |

---

## Expected Result

**Before (Current):**
- Select 4 qualification criteria → Nothing happens
- Qualification section remains empty

**After (Fixed):**
- Select 4 qualification criteria → Creates "Qualification" node
- Node shows "4 criteria" badge
- Clicking node shows full list of criteria

---

## Visual Example

```
┌──────────────────────────────┐
│ ✅ DECISION                  │
├──────────────────────────────┤
│ Qualification                │
│ ┌─────────────────────────┐  │
│ │ 4 criteria              │  │
│ └─────────────────────────┘  │
│ • Patient Commitment Level   │
│ • Insurance Verification     │
│ • Treatment Timeline         │
│ • Prior Authorization        │
└──────────────────────────────┘
```

---

## Testing Checklist

- [ ] Select qualification criteria → Node appears in Qualification section
- [ ] Add more criteria → Node updates with correct count
- [ ] Click on qualification node → See all criteria in detail
- [ ] Export PDF → Qualification criteria are included
