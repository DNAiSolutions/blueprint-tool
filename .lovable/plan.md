
# ALIGN Automation Builder - Question Flow & Canvas Overhaul

## Overview
Complete rebuild of the question flow system and canvas mapping logic to create a robust, real-time automation builder that:
- Supports **multi-selection** for lead sources, intake methods, and qualification criteria
- Creates **individual nodes per selection** with proper labels
- Builds a **vertical funnel layout** (wide at top, narrow at bottom)
- Connects nodes **logically** (each intake method to its specific lead source)
- Provides **preset options + custom inputs** for all major questions

## Implementation Status

### ✅ Phase 1: Lead Sources Overhaul - COMPLETE
- [x] `multi-select` type added to QuestionType
- [x] Comprehensive lead source options (30+ across 7 categories)
- [x] Multi-select checkbox component with Select All/Clear All
- [x] Custom input field for adding custom sources
- [x] Dynamic follow-up questions for each source (volume + spend)
- [x] One node per selected source with actual labels

### ✅ Phase 2: Vertical Funnel Layout - COMPLETE
- [x] `src/utils/funnelLayout.ts` created with positioning logic
- [x] NODE_LEVELS mapping (0-5 levels)
- [x] Nodes positioned horizontally within each level
- [x] Funnel narrows from top to bottom
- [x] Bezier curve connectors between levels

### ✅ Phase 3: Lead Handling/Intake Overhaul - COMPLETE
- [x] INTAKE_METHOD_OPTIONS defined (9 options)
- [x] Multi-select for intake methods
- [x] `generateIntakeMappingQuestions()` creates source-to-intake mapping questions
- [x] `sourceConnections` and `intakeConnections` added to SessionNode
- [x] Intake nodes connected to their lead sources

### ✅ Phase 4: Qualification Criteria - COMPLETE
- [x] QUALIFICATION_OPTIONS defined (10 options)
- [x] Multi-select for qualification criteria
- [x] Percentage slider for qualification rate
- [x] Decision node creation for qualifiers

### ✅ Phase 5: Response Time & Follow-Up Logic - COMPLETE
- [x] RESPONSE_TIME_OPTIONS with impact messaging
- [x] FOLLOW_UP_OPTIONS with multi-select
- [x] "Nothing" selection triggers leak alert
- [x] Leak detection creates flagged nodes

### ✅ Phase 6: Enhanced Node Rendering - COMPLETE
- [x] `src/components/canvas/CanvasNode.tsx` created
- [x] `src/components/canvas/CanvasConnector.tsx` created
- [x] Nodes show actual content labels
- [x] Type-based color coding (Blue, Purple, Orange, Teal, Green, Gray)
- [x] Volume and spend badges
- [x] Conversion rate badges with color coding
- [x] Pulsing leak indicator with red border
- [x] Dashed red connectors for leak paths

## Files Modified/Created

### Core Types
- `src/types/questions.ts` - Multi-select type, all option arrays, dynamic question generators
- `src/types/session.ts` - sourceConnections, intakeConnections, isLeak, leakReason, sourceId, spend

### Hooks
- `src/hooks/useQuestionFlow.tsx` - Dynamic question injection, section-aware insertion

### Components
- `src/components/canvas/QuestionPanel.tsx` - Multi-select UI, leak detection, dynamic follow-ups
- `src/components/canvas/CanvasNode.tsx` - NEW - Enhanced node rendering
- `src/components/canvas/CanvasConnector.tsx` - NEW - Connector SVG with leak styling
- `src/components/ui/multi-select-checkbox.tsx` - NEW - Reusable multi-select

### Utils
- `src/utils/funnelLayout.ts` - NEW - Funnel positioning calculations

### Pages
- `src/pages/Canvas.tsx` - Uses new components, node selection, connector rendering

## Success Criteria - ALL MET ✅

1. ✅ Multi-select lead sources → individual nodes spread horizontally at top
2. ✅ Multi-select intake methods → connected to their specific sources
3. ✅ Qualification criteria → preset options with decision branches
4. ✅ Vertical funnel layout → wide at top, narrow at bottom
5. ✅ Response/follow-up → creates proper branching with leak alerts
6. ✅ Nodes display actual content → "Meta Ads - 150/mo" not just "Lead Source"

## Testing Instructions

1. Create a new session from Dashboard
2. Answer Goals & Context questions (3 questions)
3. Select multiple lead sources - verify nodes appear at top of canvas
4. Answer volume/spend follow-ups for each source
5. Select intake methods - verify nodes appear in second row
6. Answer source-to-intake mapping questions
7. Select "Nothing" in follow-up options - verify leak alert node appears
8. Complete remaining questions - verify funnel fills out

## Known Behaviors

- Nodes reposition dynamically as new ones are added
- Selecting a node highlights its connections
- Leak nodes pulse with red border
- Custom options persist for the session
