
# Completed: Industry-Aware Mapping Questions + Canvas Zoom

## Summary

Fixed two issues:
1. **Missing intake mapping questions** - Lead sources using industry-specific options (like WebMD Directory, Patient Referrals for Healthcare) were being skipped because the generator functions used default Home Services options instead of industry-specific ones.
2. **Added canvas zoom** - Users can now zoom in/out of the canvas using controls in the action bar.

---

## Changes Made

### Fix 1: Industry-Aware Dynamic Question Generation

**Root Cause:**
- `generateIntakeMappingQuestions()` and `generateLeadSourceFollowUps()` in `questions.ts` used hardcoded `LEAD_SOURCE_OPTIONS` (Home Services default) instead of industry-specific options
- When a source like "webmd-directory" (Healthcare) wasn't found in the Home Services list, it was skipped with `if (!sourceOption) return;`

**Solution:**
- Updated both functions to accept an `industry` parameter
- Now uses `getLeadSourceOptionsForIndustry(industry)` and `getIntakeOptionsForIndustry(industry)` to find source/intake labels
- Updated `QuestionPanel.tsx` to pass the `industry` prop when calling these generators

**Files Modified:**
- `src/types/questions.ts` - Added industry parameter to generator functions, imported helper functions
- `src/components/canvas/QuestionPanel.tsx` - Pass industry when generating dynamic questions

### Fix 2: Canvas Zoom Controls

**Solution:**
- Added `zoomLevel` state (default 1, range 0.25 to 2)
- Added ZoomIn/ZoomOut buttons to the action bar with percentage display
- Wrapped canvas content (grid, labels, connectors, nodes) in a zoomable container with CSS transform
- Connect Mode indicator stays fixed (outside zoom container)

**Files Modified:**
- `src/pages/Canvas.tsx` - Added zoom state, controls, and zoomable wrapper

---

## Manual Connection (Already Works)

The user mentioned wanting to manually drag arrows between nodes. This already works via:
- **Connect Mode** - Toggle the "Connect" switch in the action bar
- Click a source node, then click a target node to create a connection
- Connections can be removed by clicking on them

---

## Testing Checklist

- [ ] Start new Healthcare session → Select 4 lead sources (Meta, SEO, WebMD, Patient Referrals)
- [ ] Select 3 intake methods → Verify 4 mapping questions appear (one per lead source)
- [ ] Each mapping question correctly names the lead source (not skipped)
- [ ] Connections are drawn only to selected intakes after answering mapping questions
- [ ] Zoom controls work: -/+ buttons adjust canvas scale from 25% to 200%
- [ ] Connect Mode still works to manually link nodes
