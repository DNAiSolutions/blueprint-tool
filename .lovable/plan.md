

# Fix: Multi-Select Lead Sources Not Creating All Nodes

## Problem Identified

When selecting multiple lead sources (e.g., 3 sources), only ONE node appears on the canvas. The issue is a **React state batching bug** in the `addNode` function.

## Root Cause

In `src/hooks/useSession.tsx`, the `addNode` function:

```typescript
const addNode = useCallback((node: Omit<SessionNode, 'id'>) => {
  if (!currentSession) return;
  const newNode: SessionNode = { ...node, id: generateId() };
  const updatedNodes = [...currentSession.nodes, newNode];  // BUG: uses stale closure
  updateSession({ nodes: updatedNodes, status: 'in-progress' });
}, [currentSession, updateSession]);
```

When `forEach` calls `addNode` 3 times in rapid succession:
1. Call 1: reads `nodes = []`, adds node A → `[A]`
2. Call 2: reads `nodes = []` (stale!), adds node B → `[B]` (overwrites!)
3. Call 3: reads `nodes = []` (stale!), adds node C → `[C]` (overwrites!)

Only the LAST node survives because each call reads the stale `currentSession.nodes` before state updates.

## Solution

Modify `addNode` to use a **functional state update** pattern that receives the previous state, ensuring each call builds on the actual current nodes:

### Change 1: Update `addNode` in `useSession.tsx`

**Before:**
```typescript
const addNode = useCallback((node: Omit<SessionNode, 'id'>) => {
  if (!currentSession) return;
  const newNode: SessionNode = { ...node, id: generateId() };
  const updatedNodes = [...currentSession.nodes, newNode];
  updateSession({ nodes: updatedNodes, status: 'in-progress' });
}, [currentSession, updateSession]);
```

**After:**
```typescript
const addNode = useCallback((node: Omit<SessionNode, 'id'>) => {
  setCurrentSession(prev => {
    if (!prev) return prev;
    
    const newNode: SessionNode = { ...node, id: generateId() };
    const updated = {
      ...prev,
      nodes: [...prev.nodes, newNode],
      status: 'in-progress' as const,
      updatedAt: new Date(),
    };
    
    // Also update sessions array
    setSessions(sessions => sessions.map(s => s.id === updated.id ? updated : s));
    return updated;
  });
}, []);
```

This uses the functional form of `setState` which guarantees access to the **current** state, not a stale closure.

### Change 2: Also fix `updateSession` for consistency

Apply the same pattern to `updateSession` to prevent similar issues:

```typescript
const updateSession = useCallback((updates: Partial<AlignSession>) => {
  setCurrentSession(prev => {
    if (!prev) return prev;
    
    const updated = {
      ...prev,
      ...updates,
      updatedAt: new Date(),
    };
    
    setSessions(sessions => sessions.map(s => s.id === updated.id ? updated : s));
    return updated;
  });
}, []);
```

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useSession.tsx` | Update `addNode` and `updateSession` to use functional state updates |

## Expected Outcome

After this fix:
1. Select 3 lead sources (e.g., Google My Business, Mailers/Flyers, Networking Events)
2. Click "Answer & Continue"
3. **All 3 nodes appear** on the canvas, spread horizontally at the top of the funnel
4. Follow-up volume questions are generated for each source
5. As you answer volume questions, each node is updated with its volume

## Testing Checklist

- [ ] Select 3+ lead sources → all appear as separate nodes
- [ ] Select 3+ intake methods → all appear as separate nodes
- [ ] Nodes are positioned horizontally at their correct funnel level
- [ ] Volume data updates the correct node when answered
- [ ] Page refresh preserves all nodes (localStorage persistence)

