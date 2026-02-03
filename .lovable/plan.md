
# Fix: Industry-Specific Questions Not Aligned

## Problem Summary

You selected **Health & Wellness** as the industry, but the qualification criteria question shows options like "Homeowner Verified" and "Property Type Qualified" which only apply to home services businesses.

The question system is hardcoded for blue-collar/home services and doesn't adapt to the selected industry.

---

## Root Cause

1. **Industry stored but not used**: The session correctly stores `industry: 'healthcare-wellness'` but this value is never passed to the question flow
2. **Static option arrays**: All SelectOption arrays in `src/types/questions.ts` are hardcoded for home services
3. **No filtering logic**: No mechanism exists to swap or filter options based on industry

---

## Solution Architecture

### 1. Create Industry-Specific Option Sets

Define qualification criteria, lead sources, and intake methods that make sense for each industry category:

```text
┌─────────────────────────────────────────────────────────────────────┐
│  Industry Selection                                                  │
│     ↓                                                               │
│  Session.industry = 'healthcare-wellness'                           │
│     ↓                                                               │
│  QuestionPanel receives industry                                    │
│     ↓                                                               │
│  getQualificationOptionsForIndustry('healthcare-wellness')          │
│     ↓                                                               │
│  Returns: Patient Insurance, Referral Source, Treatment Fit, etc.   │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. Industry-Specific Qualification Criteria

| Industry | Relevant Qualification Criteria |
|----------|--------------------------------|
| **Home Services** | Homeowner Verified, Property Type, Service Area, Budget Confirmed, Insurance Involved |
| **Healthcare & Wellness** | Insurance/Payment Verified, Patient Fit (condition match), Referral Source, Consultation Completed, Treatment Timeline |
| **Professional Services** | Budget Confirmed, Decision Maker Present, Project Scope Clear, Timeline Established |
| **Childcare & Education** | Age Group Match, Schedule Fit, Location Proximity, Payment Method |
| **Generic/Custom** | Budget Confirmed, Decision Maker Present, Timeline Established, Clear Need Identified |

---

## Implementation Plan

### Phase 1: Define Industry-Specific Options

**File: `src/types/questions.ts`**

Add new option sets for each industry:

- `QUALIFICATION_OPTIONS_HOME_SERVICES` (current options)
- `QUALIFICATION_OPTIONS_HEALTHCARE` (new)
- `QUALIFICATION_OPTIONS_PROFESSIONAL` (new)
- `QUALIFICATION_OPTIONS_CHILDCARE` (new)
- `QUALIFICATION_OPTIONS_GENERIC` (fallback)

Create a helper function:
```typescript
export function getQualificationOptionsForIndustry(industry?: string): SelectOption[]
```

### Phase 2: Update Lead Source Options

Some lead sources are industry-specific too:
- **Home Services**: Angi, HomeAdvisor, Thumbtack, Yard Signs, Door Knocking
- **Healthcare**: Psychology Today, Zocdoc, Health Insurance Networks, Physician Referrals
- **Professional**: LinkedIn, Referrals, Speaking Events, Webinars

Add:
```typescript
export function getLeadSourceOptionsForIndustry(industry?: string): SelectOption[]
```

### Phase 3: Pass Industry to Question Flow

**File: `src/components/canvas/QuestionPanel.tsx`**

- Add `industry` prop to `QuestionPanelProps`
- Use industry when rendering multi-select options

**File: `src/pages/Canvas.tsx`**

- Pass `currentSession.industry` to `<QuestionPanel>`

### Phase 4: Dynamic Question Option Resolution

**File: `src/hooks/useQuestionFlow.tsx`**

- Accept `industry` parameter
- Override question options at runtime based on industry

---

## Files to Create/Modify

| File | Changes |
|------|---------|
| `src/types/questions.ts` | Add industry-specific option sets + helper functions |
| `src/components/canvas/QuestionPanel.tsx` | Accept and use `industry` prop |
| `src/pages/Canvas.tsx` | Pass `industry` to QuestionPanel |
| `src/hooks/useQuestionFlow.tsx` | Accept `industry` parameter for dynamic filtering |

---

## New Qualification Options by Industry

### Healthcare & Wellness
- Insurance/Payment Method Verified
- Condition/Treatment Fit
- Patient Referral Source Identified
- Consultation/Assessment Completed
- Treatment Timeline Established
- In-Network or Self-Pay Confirmed
- Medical History Reviewed

### Professional Services
- Budget/Investment Confirmed
- Decision Maker Present
- Project Scope Defined
- Timeline/Urgency Established
- Contract Authority Verified
- Business Size/Type Qualified

### Childcare & Education
- Age Group Match
- Schedule Availability Fit
- Location/Transportation Verified
- Payment Method Confirmed
- Special Needs Assessment (if applicable)
- Enrollment Capacity Available

### Generic (Fallback)
- Budget Confirmed
- Decision Maker Present
- Timeline Established
- Clear Need Identified
- Service Area Confirmed

---

## New Lead Source Options by Industry

### Healthcare & Wellness
- Google Ads (kept)
- Facebook/Meta Ads (kept)
- Psychology Today
- Zocdoc
- Healthgrades
- Insurance Network Referrals
- Physician Referrals
- Community Health Events
- Employer Wellness Programs

### Professional Services
- Google Ads (kept)
- LinkedIn Ads (kept)
- Speaking Engagements
- Webinars/Online Events
- Podcast Appearances
- Industry Conferences
- Strategic Partnerships
- Content Marketing/Blog

---

## Expected Outcome

After this fix:
1. Select "Health & Wellness" on Dashboard
2. Create session and go to Canvas
3. Reach qualification question
4. See relevant options: "Insurance Verified", "Patient Fit", "Treatment Timeline" etc.
5. No more "Homeowner Verified" for non-home-services industries

---

## Testing Checklist

- [x] Create session with "Home Services" → see home-specific qualification options
- [x] Create session with "Healthcare & Wellness" → see health-specific options
- [x] Create session with "Professional Services" → see B2B-appropriate options
- [x] Create session with no industry (blank) → see generic options
- [x] Lead source options also adapt appropriately
- [x] Existing home services flows still work correctly

## Implementation Complete ✅

Industry-specific options are now defined in `src/types/industryOptions.ts` and resolved dynamically based on session industry.
