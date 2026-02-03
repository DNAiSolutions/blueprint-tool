
# Fix: Display Volume Numbers on Nodes

## Problem Identified

Volume numbers ARE being displayed on nodes (the component already has this feature), but there are two issues:

1. **Volume not being set correctly**: The `lead-source-update` flow in `QuestionPanel.tsx` uses the wrong options list (`LEAD_SOURCE_OPTIONS` instead of industry-specific options) to look up labels
2. **Label is being overwritten unnecessarily**: The update includes `label: "${source} - ${volume}/mo"` which overwrites the clean label with volume embedded in text. This is redundant since `CanvasNode` already displays volume in a separate badge.

## Current State

**CanvasNode.tsx already displays volume** (lines 191-196):
```typescript
{node.volume > 0 && (
  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50">
    <span className="text-[10px] text-muted-foreground">📊</span>
    <span className="text-xs font-medium text-foreground">{node.volume}/mo</span>
  </div>
)}
```

So volume WILL show up - the issue is that volume isn't being set properly on the node.

## Root Cause in QuestionPanel.tsx (lines 150-158)

```typescript
if (volumeMatch) {
  const sourceId = volumeMatch[1];
  const sourceOption = LEAD_SOURCE_OPTIONS.find(o => o.value === sourceId);  // ❌ WRONG LIST
  onNodeCreate('lead-source-update', {
    sourceId: sourceId,
    volume: parsedValue,
    label: `${sourceOption?.label || sourceId} - ${parsedValue}/mo`,  // ❌ UNNECESSARY
  });
}
```

## Solution

### Change 1: Remove unnecessary label override

When updating volume, just update the volume - don't touch the label:

```typescript
if (volumeMatch) {
  const sourceId = volumeMatch[1];
  onNodeCreate('lead-source-update', {
    sourceId: sourceId,
    volume: parsedValue,
    // Don't override label - it's already set correctly
  });
}
```

### Change 2: Same for spend updates

```typescript
if (spendMatch) {
  const sourceId = spendMatch[1];
  onNodeCreate('lead-source-update', {
    sourceId: sourceId,
    spend: parsedValue,
    // Don't override label
  });
}
```

### Change 3: Canvas.tsx - Only update label if provided

Update the handler to not touch label if not in data:

```typescript
if (nodeType === 'lead-source-update') {
  const existingNode = currentSession.nodes.find(n => 
    n.sourceId === data.sourceId
  );
  if (existingNode && updateNode) {
    const updates: Partial<SessionNode> = {};
    if (data.volume !== undefined) updates.volume = data.volume;
    if (data.spend !== undefined) updates.spend = data.spend;
    if (data.label) updates.label = data.label;  // Only if explicitly provided
    updateNode(existingNode.id, updates);
  }
  return;
}
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/canvas/QuestionPanel.tsx` | Remove label override from volume/spend updates |
| `src/pages/Canvas.tsx` | Update handler to only modify fields that are explicitly passed |

## Expected Result

After fix:
1. Select "Facebook/Meta Ads" → Node shows label "Facebook/Meta Ads"
2. Answer volume "65" → Node now displays:
   - Label: "Facebook/Meta Ads" (unchanged)
   - Volume badge: "📊 65/mo" (shown below label)
3. Answer spend "$500" → Node now displays:
   - Label: "Facebook/Meta Ads" (unchanged)
   - Volume badge: "📊 65/mo"
   - Spend badge: "💵 $500"

## Visual Example

```
┌──────────────────────────┐
│ 📣 LEAD SOURCE           │
├──────────────────────────┤
│ Facebook/Meta Ads        │
│ ┌─────────┐ ┌─────────┐  │
│ │📊 65/mo │ │💵 $500  │  │
│ └─────────┘ └─────────┘  │
└──────────────────────────┘
```

## Testing Checklist

- [ ] Select 3 lead sources → all nodes show correct labels
- [ ] Answer volume for each → volume badges appear on nodes
- [ ] Answer spend for paid sources → spend badges appear
- [ ] Labels remain clean (no "- 65/mo" appended to them)
- [ ] Edit a node → see volume in edit form
- [ ] Save/reload page → volume persists
