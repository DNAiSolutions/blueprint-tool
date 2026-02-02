
# ALIGN Automation Builder - Question Flow & Canvas Overhaul

## Overview
Complete rebuild of the question flow system and canvas mapping logic to create a robust, real-time automation builder that:
- Supports **multi-selection** for lead sources, intake methods, and qualification criteria
- Creates **individual nodes per selection** with proper labels
- Builds a **vertical funnel layout** (wide at top, narrow at bottom)
- Connects nodes **logically** (each intake method to its specific lead source)
- Provides **preset options + custom inputs** for all major questions

## Implementation Phases

We will implement this in **6 focused phases**, testing each before moving to the next.

---

## Phase 1: Lead Sources Overhaul (Multi-Select + Individual Nodes)

**Goal**: Transform "How do you get leads?" from single-select to multi-checkbox, creating one node per selected source.

### Changes

**1. Update Question Types (`src/types/questions.ts`)**
- Add new type: `'multi-select'` to `QuestionType`
- Create comprehensive lead source options:
  ```
  - Paid Ads: Google Ads
  - Paid Ads: Facebook/Meta
  - Paid Ads: TikTok
  - Paid Ads: YouTube
  - Organic: SEO/Website
  - Organic: Google My Business
  - Organic: Facebook Groups
  - Organic: Content/Blog
  - Referrals: Customer Referrals
  - Referrals: Partner/Contractor
  - Direct: Yard Signs
  - Direct: Door Knocking
  - Direct: Cold Calling
  - Direct: Radio/TV
  - Direct: Mailers/Flyers
  - Events: Networking
  - Events: Trade Shows
  - Custom (with text input)
  ```

**2. Create Multi-Select Question Component**
- Checkbox list with all options
- "Select All" / "Clear All" buttons
- Custom input field at bottom
- Shows count of selected items

**3. Update Question Flow Logic (`src/hooks/useQuestionFlow.tsx`)**
- After multi-select is answered, generate follow-up questions for EACH selected source
- Example: If user selects "Meta Ads" + "Referrals" + "Yard Signs":
  - Q: "How many leads per month from Meta Ads?"
  - Q: "What's your monthly spend on Meta Ads?"
  - Q: "How many leads per month from Referrals?"
  - Q: "How many leads per month from Yard Signs?"

**4. Update Node Creation**
- Create one `lead-source` node per selected source
- Node label = actual source name (e.g., "Meta Ads - 150/mo")
- Nodes positioned horizontally at TOP of canvas

### Testing Checkpoint
- [ ] Can select multiple lead sources via checkboxes
- [ ] Selecting sources generates follow-up questions for each
- [ ] Each source creates its own labeled node
- [ ] Nodes appear spread horizontally at top of canvas

---

## Phase 2: Vertical Funnel Layout (Top-to-Bottom Flow)

**Goal**: Restructure node positioning to create a proper vertical funnel shape.

### Changes

**1. Create Funnel Position Calculator (`src/utils/funnelLayout.ts`)**
```typescript
interface FunnelLevel {
  level: 0 | 1 | 2 | 3 | 4 | 5;
  name: 'top-of-funnel' | 'intake' | 'qualification' | 'conversion' | 'close' | 'fulfillment';
}

// Position nodes based on their type and count at each level
// Level 0 (top): Lead Sources - spread wide horizontally
// Level 1: Intake methods - slightly narrower
// Level 2: Qualification - narrower still
// Level 3: Conversion events - narrower
// Level 4: Close - narrow
// Level 5: Fulfillment/Reviews - narrowest
```

**2. Update Canvas Rendering**
- Calculate canvas center for each level
- Distribute nodes evenly across their level
- Connect nodes vertically with smooth bezier curves

**3. Node Type to Level Mapping**
```typescript
const NODE_LEVELS: Record<NodeType, number> = {
  'lead-source': 0,    // Top of funnel
  'intake': 1,         // Second row
  'decision': 2,       // Qualification level
  'conversion': 3,     // Appointments/Calls
  'close': 4,          // Close level
  'fulfillment': 5,    // Bottom
  'review': 5,         // Bottom
};
```

### Testing Checkpoint
- [ ] Lead sources appear in a horizontal row at top
- [ ] Subsequent node types appear in rows below
- [ ] Each row is progressively narrower (funnel shape)
- [ ] Connectors draw vertically between levels

---

## Phase 3: Lead Handling/Intake Overhaul (Options + Source Connections)

**Goal**: Transform intake question to multi-select options, connecting each intake method to its relevant lead source.

### Changes

**1. Create Intake Options**
```
- Lead Forms (website/landing page)
- Phone Calls (inbound)
- Phone Calls (outbound - VA/team calls them)
- Text/SMS
- Email
- Live Chat/Chatbot
- In-Person (walk-in, event)
- Social Media DM
- Booking/Calendar Link
- Custom
```

**2. Add Source-to-Intake Mapping Question**
After selecting intake methods, ask:
- "Which intake methods apply to Meta Ads?" (checkboxes of selected intakes)
- "Which intake methods apply to Referrals?" (checkboxes of selected intakes)
- etc.

**3. Update Node Creation**
- Create intake nodes with specific labels (e.g., "Lead Form", "Phone Call")
- Automatically connect each intake node to its mapped lead sources

**4. Update Session Data Model**
```typescript
interface SessionNode {
  // ...existing fields
  sourceConnections?: string[];  // IDs of lead sources this intake is connected to
  intakeConnections?: string[];  // IDs of intake methods this node connects to
}
```

### Testing Checkpoint
- [ ] Can select multiple intake methods
- [ ] Can map which intakes apply to which sources
- [ ] Intake nodes appear in second row
- [ ] Connectors link sources to their specific intakes

---

## Phase 4: Qualification Criteria (Preset Options + Custom + Decision Nodes)

**Goal**: Provide preset qualification criteria options with ability to add custom, creating decision nodes.

### Changes

**1. Create Qualification Criteria Options**
```
- Budget/Affordability Confirmed
- Decision Maker Present
- Timeline/Urgency Established
- Clear Need Identified
- In Service Area/Territory
- Property Type Qualified
- Home Age/Condition Met
- Insurance Involved (Y/N)
- Financing Needed (Y/N)
- Custom Criteria
```

**2. Update Question Flow**
- Q: "What criteria do you use to qualify leads?" (multi-select)
- Q: "What percentage meet your qualification criteria?" (slider)
- For each criteria: "What happens if they DON'T meet this?" (creates decision branch)

**3. Decision Node Creation**
- Each qualification criteria can create a decision node with two paths:
  - Qualified → continues down funnel
  - Not Qualified → separate path (nurture, disqualify, etc.)

### Testing Checkpoint
- [ ] Can select multiple qualification criteria
- [ ] Percentage slider works and stores value
- [ ] Decision nodes created for major qualifiers
- [ ] Two paths visible from decision nodes

---

## Phase 5: Response Time & Follow-Up Logic (Decision Branches)

**Goal**: Create proper branching for "No Answer" and follow-up scenarios.

### Changes

**1. Add Response Time Question with Impact Messaging**
```
Options:
- Under 1 minute (Speed to Lead Champion!)
- 1-5 minutes (Great response time)
- 5-30 minutes (Room for improvement)
- 30 min - 1 hour (Leads are cooling)
- Same day (Many leads lost by now)
- Next day or longer (Critical leak point)
```

**2. Add Follow-Up Sequence Questions**
```
Q: "What happens if they don't answer on first try?"
Options:
- Call back within 5 minutes
- Call back within 1 hour
- Call back same day
- Text message
- Email follow-up
- Voicemail + text
- Nothing (DROP-OFF ALERT)
- Custom sequence
```

**3. Create No-Answer Branch**
- When user selects follow-up method, create a branch node
- "No Answer" → Follow-up sequence → Return to main flow
- If "Nothing" selected → LEAK ALERT (red highlight, revenue impact calculation)

### Testing Checkpoint
- [ ] Response time shows contextual messaging
- [ ] Follow-up options create proper branch nodes
- [ ] "Nothing" selection triggers leak alert
- [ ] Branch nodes connect back to main flow

---

## Phase 6: Enhanced Node Rendering & Styling

**Goal**: Make nodes display their actual content, not just type labels.

### Changes

**1. Update Node Component**
- Primary label: Actual name (e.g., "Meta Ads", "Phone Calls", "Budget Check")
- Secondary label: Type icon + volume if applicable
- Conversion badge: Shows % (color-coded)
- Leak indicator: Pulsing red if major drop-off

**2. Node Styling by Type**
```css
Lead Source: Blue (#3498DB) border
Intake: Purple (#9B59B6) border
Decision: Orange (#E67E22) border
Conversion: Teal (#1ABC9C) border
Close: Green (#27AE60) border
Fulfillment: Dark Gray (#34495E) border
Leak: Red (#E74C3C) border, pulsing animation
```

**3. Connector Styling**
- Default: Gray, curved bezier
- Selected: Teal, thicker
- Leak path: Red, dashed

### Testing Checkpoint
- [ ] Nodes show actual content labels
- [ ] Color coding matches node types
- [ ] Conversion badges visible
- [ ] Leak indicators pulsing on problem areas

---

## Files to be Modified

### Core Type Updates
- `src/types/questions.ts` - Add multi-select type, expand options
- `src/types/session.ts` - Add sourceConnections, intakeConnections fields

### Hook Updates
- `src/hooks/useQuestionFlow.tsx` - Handle multi-select, dynamic follow-ups
- `src/hooks/useSession.tsx` - Handle node connections

### Component Updates
- `src/components/canvas/QuestionPanel.tsx` - Multi-select UI, dynamic questions
- `src/pages/Canvas.tsx` - Vertical layout, enhanced node rendering

### New Files
- `src/utils/funnelLayout.ts` - Funnel positioning calculations
- `src/components/canvas/CanvasNode.tsx` - Enhanced node component
- `src/components/canvas/CanvasConnector.tsx` - Connector rendering
- `src/components/ui/multi-select.tsx` - Reusable multi-select component

---

## Technical Notes

### Node Connection Logic
- Each node stores IDs of nodes it connects TO
- Layout algorithm reads connections to draw lines
- When node deleted, all references cleaned up

### Dynamic Question Generation
```typescript
// After multi-select answer, generate follow-up questions
function generateFollowUpQuestions(selectedSources: string[]): Question[] {
  return selectedSources.flatMap(source => [
    {
      id: `volume-${source}`,
      question: `How many leads per month from ${source}?`,
      type: 'number',
      // ...
    },
    // Additional source-specific questions
  ]);
}
```

### Funnel Width Calculation
```typescript
function calculateLevelWidth(level: number, nodeCount: number): number {
  const maxWidth = 900;  // Canvas width
  const minWidth = 200;  // Narrowest point
  const reductionPerLevel = (maxWidth - minWidth) / 5;
  return maxWidth - (level * reductionPerLevel);
}
```

---

## Success Criteria

After all 6 phases:
1. Multi-select lead sources → individual nodes spread horizontally at top
2. Multi-select intake methods → connected to their specific sources
3. Qualification criteria → preset options with decision branches
4. Vertical funnel layout → wide at top, narrow at bottom
5. Response/follow-up → creates proper branching with leak alerts
6. Nodes display actual content → "Meta Ads - 150/mo" not just "Lead Source"

## Implementation Order

1. **Phase 1**: Lead Sources Multi-Select (foundational)
2. **Phase 2**: Vertical Funnel Layout (visual foundation)
3. **Phase 3**: Intake Methods + Source Connections
4. **Phase 4**: Qualification Criteria + Decision Nodes
5. **Phase 5**: Response Time & Follow-Up Branches
6. **Phase 6**: Enhanced Node Styling

Each phase will be fully tested before moving to the next.
