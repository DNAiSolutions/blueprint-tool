
# Fix: Connect Lead Sources to Specific Intake Methods After Mapping Question

## Summary

Currently, all lead sources automatically connect to all intake methods when intake nodes are created. Instead, connections should only be drawn AFTER the user answers "Which intake methods apply to [Lead Source]?" and should only connect THAT lead source to the SELECTED intake methods.

---

## Root Cause

In `QuestionPanel.tsx` (line 113-114), when intake nodes are created, they have `autoConnectToLeadSources: true` which immediately connects every intake to every lead source.

The mapping questions (`q_intake_map_*`) do run after, but they:
1. Come too late - connections are already drawn
2. Use the wrong connection direction (intake → source instead of source → intake)

---

## Solution

### Step 1: Remove Auto-Connect from Intake Node Creation

**File:** `src/components/canvas/QuestionPanel.tsx`

Change the intake node creation to NOT auto-connect:

```typescript
// BEFORE (line 114):
autoConnectToLeadSources: isIntakeQuestion,

// AFTER:
autoConnectToLeadSources: false, // Connections are made via mapping questions
```

### Step 2: Fix Connection Direction in Mapping Question Handler

**File:** `src/components/canvas/QuestionPanel.tsx`

The current handler creates connections FROM intake TO source:
```typescript
onNodeCreate('intake-connection', {
  intakeId: intakeId,
  leadSourceId: leadSourceId,
});
```

Change it to create connections FROM source TO intake:
```typescript
onNodeCreate('source-to-intake-connection', {
  leadSourceId: leadSourceId,
  intakeId: intakeId,
});
```

### Step 3: Update Canvas.tsx to Handle New Connection Type

**File:** `src/pages/Canvas.tsx`

Add a new handler for `source-to-intake-connection` that adds the intake node ID to the lead source's `connections` array:

```typescript
if (nodeType === 'source-to-intake-connection') {
  const leadSourceNode = currentSession.nodes.find(
    n => n.sourceId === data.leadSourceId
  );
  const intakeNode = currentSession.nodes.find(
    n => n.sourceId === data.intakeId
  );
  
  if (leadSourceNode && intakeNode && updateNode) {
    const existingConnections = leadSourceNode.connections || [];
    if (!existingConnections.includes(intakeNode.id)) {
      updateNode(leadSourceNode.id, {
        connections: [...existingConnections, intakeNode.id],
      });
    }
  }
  return;
}
```

### Step 4: Remove `sourceConnections` Rendering

**File:** `src/components/canvas/CanvasConnector.tsx`

Since we're now using regular `connections` for lead source → intake, we can simplify or remove the `sourceConnections` handling in `ConnectorsSVG`. However, keeping it as a backup for backward compatibility is fine.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/canvas/QuestionPanel.tsx` | Remove `autoConnectToLeadSources: true` from intake creation; change `intake-connection` to `source-to-intake-connection` |
| `src/pages/Canvas.tsx` | Add handler for `source-to-intake-connection` that connects lead source → intake |

---

## Connection Flow Diagram

```text
BEFORE (Incorrect):
┌──────────────────┐
│ Select Intakes   │──→ ALL intakes connect to ALL sources immediately
└──────────────────┘

AFTER (Correct):
┌──────────────────┐
│ Select Intakes   │──→ Creates intake nodes (no connections)
└──────────────────┘
         ↓
┌──────────────────────────────────────┐
│ "Which intakes apply to Google Ads?" │──→ Connects Google Ads → [selected intakes]
└──────────────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ "Which intakes apply to SEO?"        │──→ Connects SEO → [selected intakes]
└──────────────────────────────────────┘
```

---

## Expected Result

After this fix:
1. Lead Sources appear (no connections yet)
2. Intake Methods appear (no connections yet)
3. For EACH lead source, user is asked "Which intake methods apply?"
4. ONLY the selected intakes get connected to that specific lead source
5. Canvas shows targeted arrows: `[Google Ads] → [Phone Calls]` instead of every source to every intake

---

## Testing Checklist

- [ ] Select 4 lead sources → 4 nodes appear, NO connections
- [ ] Select 3 intake methods → 3 nodes appear, NO connections
- [ ] Answer "Which intakes apply to Google Ads?" → Select 2 → ONLY 2 connections drawn from Google Ads
- [ ] Answer next mapping question → Connections drawn only from that specific source
- [ ] Final canvas shows targeted connections, not a web of all-to-all lines
