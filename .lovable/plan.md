
# ALIGN Canvas Builder Enhancement Plan

## Implementation Status

### Phase 1 (Critical - Immediate) ✅ COMPLETED
1. ✅ Free node movement (disable auto-snapping) - DONE
2. ✅ Multi-connection support - DONE  
3. ✅ Reorder questions (process first, math last) - DONE

## Summary of Changes

### Current Behavior
Nodes are automatically positioned based on their type using `calculateFunnelPositions()`. When you drag a node, it saves the new position, but the `positionedNodes` calculation overwrites it.

### Proposed Solution
- **Preserve manual positions**: If a node has been manually positioned (dragged), respect that position instead of auto-calculating
- **Add `isManuallyPositioned` flag** to `SessionNode` type
- **Update funnel layout logic** to skip nodes that have been manually positioned

### Files to Modify
| File | Changes |
|------|---------|
| `src/types/session.ts` | Add `isManuallyPositioned?: boolean` to `SessionNode` |
| `src/utils/funnelLayout.ts` | Skip manually positioned nodes in `calculateFunnelPositions()` |
| `src/pages/Canvas.tsx` | Set `isManuallyPositioned: true` when dragging ends |

---

## 2. Connect Multiple Nodes (Multi-Connection Support)

### Current Behavior
When you select multiple options in a multi-select question (e.g., 4 intake methods), nodes are created but connections aren't automatically made between all appropriate nodes.

### Proposed Solution
- **Enhance Connect Mode**: Already exists but needs to be more prominent
- **Auto-connect logic**: When creating intake nodes, automatically connect them to ALL selected lead sources (not just one)
- **Batch connection UI**: Add ability to select multiple target nodes when in connect mode

### Technical Changes

**Auto-connect intake to all lead sources:**
```typescript
// When intake nodes are created, connect to all lead sources
leadSourceNodes.forEach(source => {
  intakeNode.connections.push(source.id);
});
```

### Files to Modify
| File | Changes |
|------|---------|
| `src/components/canvas/QuestionPanel.tsx` | Auto-connect intake nodes to all lead source nodes |
| `src/pages/Canvas.tsx` | Enhance connect mode to support multi-selection |

---

## 3. Reorder Question Flow (Process First, Math Last)

### Current Behavior
Questions mix qualitative (process mapping) and quantitative (metrics/percentages) questions throughout the flow.

### Proposed Solution
Reorganize questions into two phases:
1. **Phase 1 - Process Mapping** (qualitative)
   - Goals & context
   - Lead sources (which ones, not volume yet)
   - Intake methods
   - Qualification criteria
   - What happens when qualified/disqualified
   - Conversion events (types, not rates)
   - Fulfillment steps
   - Reviews/referrals

2. **Phase 2 - Metrics Collection** (quantitative)
   - Volume per lead source
   - Spend per paid source
   - Conversion percentages
   - Close rates
   - Review/referral percentages

### Files to Modify
| File | Changes |
|------|---------|
| `src/types/questions.ts` | Reorganize QUESTIONS array, move volume/spend/percentage questions to end |
| `src/hooks/useQuestionFlow.tsx` | Support two-phase flow |

---

## 4. Custom Workflow Nodes Between Stages

### Current Behavior
Only 8 node types exist: lead-source, intake, decision, conversion, close, fulfillment, review, custom

### Proposed Solution
- **Add new node types** for intermediate workflow steps:
  - `workflow` - General workflow step (between any stages)
  - `handoff` - Handoff to another person/system
  - `verification` - Verification step (insurance, documents, etc.)
  
- **Allow custom positioning** in funnel levels (not locked to type)
- **Add level property** to nodes so users can place them at any funnel level

### New Node Types for Mental Health Workflow
| Stage | Examples |
|-------|----------|
| Between Intake → Qualification | Insurance verification, Eligibility check |
| Between Qualification → Conversion | Scheduling, Therapist matching |
| Between Conversion → Close | First consultation, Treatment plan review |
| Between Close → Fulfillment | Ongoing appointments, Progress tracking |

### Files to Modify
| File | Changes |
|------|---------|
| `src/types/session.ts` | Add `workflow`, `handoff`, `verification` node types; add `funnelLevel?: number` |
| `src/utils/funnelLayout.ts` | Update NODE_LEVELS to handle new types; respect custom `funnelLevel` |
| `src/components/canvas/AddNodeModal.tsx` | Add new node type options |
| `src/components/canvas/CanvasNode.tsx` | Add colors/icons for new types |

---

## 5. Website Import Feature (Firecrawl Integration)

### Proposed Solution
At session creation, allow user to enter prospect's website URL and scrape it to:
1. Extract business name, services, team info
2. Pre-populate industry-specific context
3. Generate tailored questions based on business type

### Implementation Approach
1. **Create Firecrawl edge function** to scrape website
2. **Add website URL field** to session creation modal on Dashboard
3. **Parse website content** to extract:
   - Business name
   - Services offered
   - Team members/roles
   - Contact methods
4. **Use extracted data** to pre-fill session and suggest relevant questions

### Files to Create/Modify
| File | Changes |
|------|---------|
| `supabase/functions/firecrawl-scrape/index.ts` | Create edge function |
| `src/lib/api/firecrawl.ts` | Create API client |
| `src/pages/Dashboard.tsx` | Add website URL field to session creation |
| `src/components/WebsiteImportModal.tsx` | New component for import flow |

---

## 6. Qualified/Disqualified Path Mapping

### Current Behavior
Qualification is a single yes/no question with criteria selection.

### Proposed Solution
Add branching path questions:
1. "What happens when a lead is **qualified**?" → Next steps workflow
2. "What happens when a lead is **disqualified**?" → Disqualification handling
3. Create separate node paths for each outcome

### Visual Representation
```
                    ┌──────────────┐
                    │ Qualification │
                    │   Decision   │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
    ┌─────────────────┐       ┌─────────────────┐
    │   QUALIFIED     │       │  DISQUALIFIED   │
    │   Next Steps    │       │    Handling     │
    └─────────────────┘       └─────────────────┘
```

### Files to Modify
| File | Changes |
|------|---------|
| `src/types/questions.ts` | Add qualified/disqualified path questions |
| `src/components/canvas/QuestionPanel.tsx` | Handle branching node creation |

---

## Implementation Priority

### Phase 1 (Critical - Immediate)
1. ✅ Free node movement (disable auto-snapping)
2. ✅ Multi-connection support
3. ✅ Reorder questions (process first, math last)

### Phase 2 (Important - Next Sprint)
4. Custom workflow nodes between stages
5. Qualified/disqualified path mapping

### Phase 3 (Enhancement - Future)
6. Website import feature (requires Firecrawl connector)

---

## Technical Implementation Details

### 1. Free Node Movement

**src/types/session.ts:**
```typescript
export interface SessionNode {
  // ... existing fields
  isManuallyPositioned?: boolean; // NEW: Respect manual position
  funnelLevel?: number;           // NEW: Override funnel level
}
```

**src/utils/funnelLayout.ts:**
```typescript
export function calculateFunnelPositions(
  nodes: SessionNode[],
  canvasCenterX: number = CANVAS_CENTER_X
): SessionNode[] {
  // Separate manually positioned vs auto-positioned nodes
  const manualNodes = nodes.filter(n => n.isManuallyPositioned);
  const autoNodes = nodes.filter(n => !n.isManuallyPositioned);
  
  // Only auto-position non-manual nodes
  const positioned = autoPositionNodes(autoNodes, canvasCenterX);
  
  // Return both, preserving manual positions
  return [...positioned, ...manualNodes];
}
```

**src/pages/Canvas.tsx:**
```typescript
const handleNodeDragEnd = useCallback((nodeId: string, position: { x: number; y: number }) => {
  updateNode(nodeId, { 
    position,
    isManuallyPositioned: true // Mark as manually positioned
  });
}, [updateNode]);
```

### 2. Auto-Connect Intake to Lead Sources

**src/components/canvas/QuestionPanel.tsx:**
```typescript
// When intake nodes are created, auto-connect to all lead sources
if (currentQuestion.id === 'q_intake_methods' && onNodeCreate) {
  // Get all existing lead source node IDs
  const leadSourceNodes = currentSession.nodes.filter(n => n.type === 'lead-source');
  
  multiSelectValue.forEach((intakeValue) => {
    const option = currentQuestion.options?.find(o => o.value === intakeValue);
    const label = option?.label || intakeValue;
    
    // Create intake node connected to ALL lead sources
    onNodeCreate('intake', {
      sourceId: intakeValue,
      label: label,
      connectTo: leadSourceNodes.map(n => n.id), // NEW: Connect to all sources
    });
  });
}
```

### 3. Reordered Question Flow

**New question order:**
```typescript
// PHASE 1: PROCESS MAPPING (Qualitative)
q1: "What are you trying to grow?"
q2: "Target annual revenue?"
q3: "Biggest bottleneck?"
q4: "Where do leads come from?" (multi-select, no volume yet)
q_intake: "How do leads reach you?"
q_response: "How quickly do you respond?"
q_followup: "What happens if they don't answer?"
q_qualify_yn: "Do you qualify leads?"
q_qualify_criteria: "What criteria?"
q_qualified_path: "What happens when QUALIFIED?"    // NEW
q_disqualified_path: "What happens when DISQUALIFIED?" // NEW
q_conversion_type: "What conversion events happen?"
q_fulfillment: "What happens post-sale?"
q_review: "Do you ask for reviews/referrals?"

// PHASE 2: METRICS (Quantitative) - Moved to end
q_volume_{source}: "How many leads from {source}?"
q_spend_{source}: "Monthly spend on {source}?"
q_qual_rate: "What % meet qualification?"
q_schedule_rate: "What % schedule?"
q_show_rate: "What % show up?"
q_close_rate: "What's your close rate?"
q_review_rate: "What % leave reviews?"
```

---

## Expected Outcome

After implementation:
1. Reps can freely drag nodes anywhere on canvas
2. Connecting nodes works manually via Connect Mode
3. Multi-select creates properly connected nodes
4. Questions flow naturally: draw process first, add metrics at end
5. Custom workflow steps can be added between any stages
6. (Future) Website import auto-populates session context

---

## Testing Checklist

- [ ] Drag a node → it stays where you put it (doesn't snap back)
- [ ] Create multiple intake methods → all connect to all lead sources
- [ ] Go through questions → process questions first, metrics at end
- [ ] Add custom "Workflow" node → can place it between Qualification and Conversion
- [ ] Mental health flow: map insurance verification, therapist matching, ongoing appointments
- [ ] Export PDF → shows full custom flow accurately
