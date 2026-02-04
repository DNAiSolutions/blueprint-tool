

# Implementation Plan: Bold Connectors + Industry-Specific Questions

## Overview

This plan fixes two critical issues:
1. **Visual**: Connector lines are thin/dashed - need bold, solid lines
2. **Data**: Conversion event questions show home services options for healthcare industry

---

## Issue 1: Make Connector Lines Bold and Solid

### Root Cause
In `src/components/canvas/CanvasConnector.tsx`:
- Default stroke width is only 2px (too thin)
- When `isLeak` is true, lines become dashed with `strokeDasharray = '8 4'`
- The `isLeak` flag is being set on connections, causing them to appear as dashes

### Solution

**File**: `src/components/canvas/CanvasConnector.tsx`

| Property | Current | New |
|----------|---------|-----|
| Default `strokeWidth` | 2 | 3 |
| Selected `strokeWidth` | 3 | 4 |
| Leak `strokeDasharray` | `'8 4'` | `'none'` (solid, just use red color) |
| Arrow head size | 6 | 8 |

**Changes**:
```typescript
// Line 28: Increase base stroke width
let strokeWidth = 3; // was 2

// Lines 31-35: Remove dashed styling for leaks
if (isLeak) {
  strokeColor = 'hsl(0, 70%, 55%)'; // Keep red
  strokeWidth = 3; // Bold but solid
  // REMOVE strokeDasharray line - keep solid
} else if (isSelected) {
  strokeColor = 'hsl(170, 65%, 45%)';
  strokeWidth = 4; // was 3
}

// Line 148: Increase arrow head size
const arrowSize = 8; // was 6
```

---

## Issue 2: Add Industry-Specific Conversion Events

### Root Cause
The conversion event question (`q_conversion_type`) in `questions.ts` has hardcoded options that apply to home services:
- "On-Site Estimate"
- "Home Visit/Assessment"
- "Product/Service Demo"

These are inappropriate for healthcare/wellness businesses.

### Solution

**Step 2.1: Add Industry-Specific Conversion Options**

**File**: `src/types/industryOptions.ts`

Add new option sets:

```typescript
// Healthcare-Specific Conversion Events
export const CONVERSION_OPTIONS_HEALTHCARE: SelectOption[] = [
  { value: 'initial-consultation', label: 'Initial Consultation', category: 'In-Person' },
  { value: 'phone-screening', label: 'Phone Screening Call', category: 'Virtual' },
  { value: 'intake-assessment', label: 'Intake Assessment', category: 'In-Person' },
  { value: 'new-patient-exam', label: 'New Patient Exam', category: 'In-Person' },
  { value: 'telehealth-consult', label: 'Telehealth Consultation', category: 'Virtual' },
  { value: 'free-consultation', label: 'Free Consultation', category: 'Virtual' },
  { value: 'discovery-session', label: 'Discovery Session', category: 'Virtual' },
  { value: 'wellness-evaluation', label: 'Wellness Evaluation', category: 'In-Person' },
  { value: 'treatment-planning', label: 'Treatment Planning Session', category: 'In-Person' },
  { value: 'insurance-verification', label: 'Insurance Verification Complete', category: 'Administrative' },
];

// Professional Services Conversion Events
export const CONVERSION_OPTIONS_PROFESSIONAL: SelectOption[] = [
  { value: 'discovery-call', label: 'Discovery Call', category: 'Virtual' },
  { value: 'strategy-session', label: 'Strategy Session', category: 'Virtual' },
  { value: 'proposal-presentation', label: 'Proposal Presentation', category: 'Virtual' },
  { value: 'demo', label: 'Product/Service Demo', category: 'Virtual' },
  { value: 'needs-assessment', label: 'Needs Assessment', category: 'Virtual' },
  { value: 'audit-review', label: 'Audit/Review Meeting', category: 'In-Person' },
  { value: 'scoping-call', label: 'Scoping Call', category: 'Virtual' },
];

// Add similar for Childcare, etc.
```

**Step 2.2: Add Conversion Options Helper**

**File**: `src/types/industryOptions.ts`

```typescript
export function getConversionOptionsForIndustry(industry?: Industry | string): SelectOption[] {
  switch (industry) {
    case 'healthcare-wellness':
      return CONVERSION_OPTIONS_HEALTHCARE;
    case 'professional-services':
      return CONVERSION_OPTIONS_PROFESSIONAL;
    case 'childcare-education':
      return CONVERSION_OPTIONS_CHILDCARE;
    case 'home-services':
    case 'roofing':
    case 'pest-control':
    case 'hvac':
    case 'plumbing':
    case 'landscaping':
    case 'cleaning':
    default:
      return CONVERSION_OPTIONS_HOME_SERVICES;
  }
}
```

**Step 2.3: Update getIndustryOptions**

**File**: `src/types/industryOptions.ts`

```typescript
export function getIndustryOptions(industry?: Industry | string) {
  return {
    leadSources: getLeadSourceOptionsForIndustry(industry),
    qualificationCriteria: getQualificationOptionsForIndustry(industry),
    intakeMethods: getIntakeOptionsForIndustry(industry),
    conversionEvents: getConversionOptionsForIndustry(industry), // ADD THIS
  };
}
```

**Step 2.4: Update Question Resolution**

**File**: `src/hooks/useQuestionFlow.tsx`

Add conversion event resolution to the `allQuestions` memo:

```typescript
// Around line 51-59, add:
if (q.id === 'q_conversion_type') {
  return { ...q, options: industryOptions.conversionEvents };
}
```

**Step 2.5: Update Edge Function for Industry Context**

**File**: `supabase/functions/generate-questions/index.ts`

Enhance the AI prompt to generate industry-specific fulfillment chain options:

```typescript
// Update chain mode prompt (around line 81-97)
const chainSystemPrompt = `You are a business process expert helping map a ${industry} business's fulfillment workflow.

IMPORTANT: This is a ${industry} business. Generate options that are specific and relevant to this industry.

For healthcare/wellness businesses, focus on:
- Patient communication and care coordination
- Treatment delivery and follow-up
- Documentation and compliance
- Insurance and billing processes

For home services businesses, focus on:
- Scheduling and dispatch
- On-site service delivery
- Quality control and sign-off
- Payment collection
...
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/canvas/CanvasConnector.tsx` | Bold solid lines, remove dash pattern |
| `src/types/industryOptions.ts` | Add conversion event options per industry |
| `src/hooks/useQuestionFlow.tsx` | Resolve conversion options by industry |
| `supabase/functions/generate-questions/index.ts` | Industry-aware fulfillment chain |

---

## Success Criteria

1. **Visual**: Connector lines are solid and bold (3px+) between all nodes
2. **Healthcare Questions**: When industry is healthcare/wellness, conversion events show:
   - Initial Consultation
   - Intake Assessment
   - Telehealth Consultation
   - Treatment Planning Session
   - (No "On-Site Estimate" or "Home Visit")
3. **AI Chain**: Fulfillment "what happens next" questions generate healthcare-specific options

---

## Implementation Order

1. Fix connector visuals (immediate visual impact)
2. Add industry conversion options to `industryOptions.ts`
3. Update `useQuestionFlow` to use industry conversion options
4. Enhance edge function for industry-aware AI generation
5. Deploy and test with healthcare industry selection

