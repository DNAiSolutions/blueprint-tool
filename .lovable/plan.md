# ALIGN Automation Builder - Implementation Plan

## Current Phase: Canvas & Question Engine Enhancements

### Overview
This plan addresses three critical improvements:
1. **Zoom Alignment Stability** - Fix zoom so nodes/connectors stay aligned at any zoom level
2. **Sidebar Label Accuracy** - Correct funnel level names to reflect actual stages
3. **AI-Driven Dynamic Questions** - Implement intelligent question flow for fulfillment mapping

---

## Task 1: Zoom Alignment Stability

### Problem
Current `transform: scale()` with `transform-origin: top left` causes content to drift during zoom. Nodes and connectors become misaligned.

### Solution
Switch to center-based viewport scaling with proper offset calculations.

### Implementation Steps

#### 1.1 Create `useCanvasViewport` Hook (NEW FILE)
**File:** `src/hooks/useCanvasViewport.tsx`

```typescript
interface ViewportState {
  zoom: number;           // 0.25 to 2.0
  offset: { x: number; y: number };  // pan offset
}

// Exports:
// - zoom, offset state
// - zoomIn(), zoomOut(), resetView(), fitToContent(nodes)
// - handleWheel(e) - zoom toward cursor
// - handlePanStart/Move/End - background drag
// - screenToCanvas(point) - convert screen coords to canvas coords
// - canvasToScreen(point) - convert canvas coords to screen coords
```

#### 1.2 Refactor Canvas Zoom Logic
**File:** `src/pages/Canvas.tsx`

- [ ] Replace inline zoom/pan state with `useCanvasViewport` hook
- [ ] Update transform: `transform: scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`
- [ ] Use `transform-origin: center center` for stable scaling
- [ ] Update wheel handler to zoom toward cursor position
- [ ] Add smooth CSS transitions: `transition: transform 0.1s ease-out`

#### 1.3 Update Zoom Controls UI
- [ ] Display zoom percentage (e.g., "100%")
- [ ] Add "Fit to Content" button - auto-zoom to show all nodes
- [ ] Add "Reset View" button (100% zoom, centered)
- [ ] Keyboard shortcuts: Ctrl+0 = reset, Ctrl+= zoom in, Ctrl+- zoom out

#### 1.4 Verify Connector Paths
**File:** `src/components/canvas/CanvasConnector.tsx`

- [ ] Ensure paths are calculated in canvas space (scale-independent)
- [ ] Connectors inherit parent transform, no manual scaling needed

### Success Criteria
- [ ] Zooming keeps viewport center stable
- [ ] Connectors scale correctly with nodes
- [ ] Zoom controls show current percentage
- [ ] "Fit to Content" shows all nodes in view

---

## Task 2: Sidebar Label Accuracy

### Problem
`FUNNEL_LEVELS` in `funnelLayout.ts` duplicates "conversion" for levels 3, 4, 5. Sidebar shows wrong stage names.

### Solution
Update level names to reflect the actual 8-level funnel structure.

### Implementation Steps

#### 2.1 Update Funnel Level Definitions
**File:** `src/utils/funnelLayout.ts`

Current → Fixed:
| Level | Current Name | New Name |
|-------|--------------|----------|
| 0 | top-of-funnel | lead-sources |
| 1 | intake | intake |
| 2 | qualification | qualification |
| 3 | conversion | qualified-paths |
| 4 | conversion | handoffs |
| 5 | conversion | conversion-events |
| 6 | close | close |
| 7 | fulfillment | fulfillment |

#### 2.2 Update `getLevelName()` Function
```typescript
export function getLevelName(level: number): string {
  const names: Record<number, string> = {
    0: 'Lead Sources',
    1: 'Lead Intake',
    2: 'Qualification',
    3: 'Qualified Paths',
    4: 'Handoffs',
    5: 'Conversion Events',
    6: 'Close',
    7: 'Fulfillment & Reviews',
  };
  return names[level] || 'Custom';
}
```

### Success Criteria
- [ ] Each funnel level has a unique, descriptive name
- [ ] Sidebar reflects actual workflow stages
- [ ] No duplicate labels in UI

---

## Task 3: AI-Driven Dynamic Questions for Fulfillment

### Problem
Current question flow is static. Fulfillment requires context-aware follow-up questions based on what the business actually does after closing a sale.

### Solution
Implement a hybrid system:
- **Rule-based core flow** for standard funnel stages
- **AI-generated questions** for fulfillment stage based on previous answers

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Question Engine                          │
├─────────────────────────────────────────────────────────────┤
│  Static Questions (existing QUESTIONS array)                │
│  ├─ Goals & Context                                         │
│  ├─ Lead Sources                                            │
│  ├─ Lead Handling                                           │
│  ├─ Qualification                                           │
│  ├─ Conversion Events                                       │
│  └─ Close                                                   │
├─────────────────────────────────────────────────────────────┤
│  AI Injection Point (after Close stage)                     │
│  ├─ Trigger: User completes close-related questions         │
│  ├─ Input: Industry + all previous answers + existing nodes │
│  ├─ AI Prompt: "What happens after the sale closes?"        │
│  └─ Output: 2-4 contextual fulfillment questions            │
├─────────────────────────────────────────────────────────────┤
│  Dynamic Question Injection                                  │
│  └─ injectDynamicQuestions() adds AI questions to flow      │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Steps

#### 3.1 Create Edge Function for AI Question Generation
**File:** `supabase/functions/generate-questions/index.ts`

**Endpoint:** POST `/generate-questions`

**Request:**
```typescript
{
  industry: string;
  currentStage: 'fulfillment' | 'review' | 'custom';
  previousAnswers: Record<string, { value: any }>;
  existingNodes: { type: string; label: string }[];
}
```

**Response:**
```typescript
{
  questions: Array<{
    id: string;          // e.g., "ai_fulfill_1"
    question: string;
    type: 'text' | 'select' | 'multi-select' | 'number';
    options?: string[];
    section: 'fulfillment';
    hint?: string;
    followUpNodeType?: NodeType;
  }>;
}
```

**AI Prompt Template:**
```
You are helping map a {industry} business's fulfillment process.

The business has this workflow so far:
- Lead sources: {leadSources}
- Intake methods: {intakeMethods}
- Qualification criteria: {qualificationCriteria}
- Close process: {closeProcess}

Generate 2-4 questions to understand what happens AFTER the sale closes.
Focus on:
1. Delivery/fulfillment steps (who does what, in what order)
2. Handoffs between people/systems
3. Customer communication touchpoints
4. Quality checks or follow-up procedures

Return JSON array of questions. Each question should have:
- id: unique string starting with "ai_fulfill_"
- question: the question text
- type: "text", "select", "multi-select", or "number"
- options: array of choices (for select/multi-select)
- hint: optional helper text
- followUpNodeType: suggested node type for canvas
```

#### 3.2 Create `useAIQuestions` Hook
**File:** `src/hooks/useAIQuestions.tsx`

```typescript
export function useAIQuestions() {
  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Generate questions for fulfillment stage
  const generateFulfillmentQuestions = async (context: AIQuestionContext) => {
    // Call edge function
    // Cache results by session
    // Return questions
  };

  // Check if we should trigger AI generation
  const shouldGenerateAI = (currentQuestionId: string, answers: QuestionAnswers) => {
    // Return true when user completes close-stage questions
  };

  return {
    isGenerating,
    generatedQuestions,
    error,
    generateFulfillmentQuestions,
    shouldGenerateAI,
  };
}
```

#### 3.3 Update Question Types
**File:** `src/types/questions.ts`

Add to `Question` interface:
```typescript
interface Question {
  id: string;
  section: QuestionSection;
  question: string;
  type: 'text' | 'select' | 'multi-select' | 'number' | 'boolean';
  options?: string[];
  required?: boolean;
  hint?: string;
  skipCondition?: (answers: QuestionAnswers) => boolean;
  optionKey?: keyof IndustryOptions;
  isAIGenerated?: boolean;
  aiContext?: string;
}
```

#### 3.4 Integrate with Question Flow
**File:** `src/hooks/useQuestionFlow.tsx`

- [ ] Import and use `useAIQuestions` hook
- [ ] After close-stage questions complete, call `generateFulfillmentQuestions()`
- [ ] Inject generated questions via `injectDynamicQuestions()`
- [ ] Show loading state while AI generates

#### 3.5 Update Question Panel UI
**File:** `src/components/canvas/QuestionPanel.tsx`

- [ ] Show "Analyzing your workflow..." loading state during AI generation
- [ ] Style AI-generated questions with subtle indicator (sparkle icon)
- [ ] Add "Generate more questions" button for manual AI trigger
- [ ] Graceful error handling if AI fails

#### 3.6 Update Config
**File:** `supabase/config.toml`

```toml
[functions.generate-questions]
verify_jwt = false
```

### Fallback Behavior
If AI generation fails:
1. Show error toast
2. Fall back to generic fulfillment questions:
   - "What happens immediately after the sale closes?"
   - "Who is responsible for delivering the service?"
   - "How do you communicate with the customer post-sale?"
   - "Do you have a formal handoff process?"

### Success Criteria
- [ ] After close questions, AI generates 2-4 contextual fulfillment questions
- [ ] Questions are relevant to the industry and previous answers
- [ ] Loading state shows while AI generates
- [ ] Graceful fallback if AI fails
- [ ] Generated questions integrate into normal flow

---

## Implementation Order

### Phase 1: Quick Wins (Do First)
1. **Task 2: Sidebar Labels** - 15 min, improves clarity immediately
2. **Task 1: Zoom Alignment** - 1-2 hours, critical for usability

### Phase 2: Intelligence (Do Second)
3. **Task 3: AI Questions** - 2-3 hours, requires edge function + hook + UI

---

## Files Summary

### New Files
- `src/hooks/useCanvasViewport.tsx` - Viewport zoom/pan state management
- `src/hooks/useAIQuestions.tsx` - AI question generation hook
- `supabase/functions/generate-questions/index.ts` - AI question edge function

### Modified Files
- `src/utils/funnelLayout.ts` - Fix level names
- `src/pages/Canvas.tsx` - Use viewport hook, update zoom UI
- `src/types/questions.ts` - Add `isAIGenerated` field
- `src/hooks/useQuestionFlow.tsx` - Integrate AI questions
- `src/components/canvas/QuestionPanel.tsx` - Loading states, AI indicators
- `supabase/config.toml` - Register new function

---

## Technical Notes

### Zoom Math (Center-Based)
```typescript
// Zoom toward cursor position
const zoomToPoint = (
  cursorPos: { x: number; y: number },
  newZoom: number,
  currentZoom: number,
  currentOffset: { x: number; y: number }
) => {
  const zoomRatio = newZoom / currentZoom;
  return {
    x: cursorPos.x - (cursorPos.x - currentOffset.x) * zoomRatio,
    y: cursorPos.y - (cursorPos.y - currentOffset.y) * zoomRatio,
  };
};
```

### Coordinate Conversion
```typescript
// Screen coords → Canvas coords (for drag-drop, connections)
const screenToCanvas = (screenX: number, screenY: number) => ({
  x: (screenX - offset.x) / zoom,
  y: (screenY - offset.y) / zoom,
});

// Canvas coords → Screen coords (for rendering)
const canvasToScreen = (canvasX: number, canvasY: number) => ({
  x: canvasX * zoom + offset.x,
  y: canvasY * zoom + offset.y,
});
```

---

## Status Tracking

- [ ] Task 1: Zoom Alignment - NOT STARTED
- [ ] Task 2: Sidebar Labels - NOT STARTED
- [ ] Task 3: AI Dynamic Questions - NOT STARTED

---

## Previous Plan (Completed)
<details>
<summary>Click to expand previous plan</summary>

### Completed Tasks
- ✅ Dynamic mapping questions for lead sources
- ✅ Connection accuracy (functional updateNode)
- ✅ Connect mode toggle for manual connections
- ✅ Qualification fan-out pattern
- ✅ Canvas navigation (zoom, pan)

</details>

---

Last Updated: 2026-02-04
