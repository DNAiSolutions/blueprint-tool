
# Enhancement Plan: Delete Sessions + Full Funnel Node Creation

## Summary

This plan addresses two user requests:
1. **Delete sessions** - Add the ability to delete sessions from the Dashboard
2. **Full funnel node creation** - Ensure all funnel sections (Qualification, Conversion, Close, Fulfillment) create nodes like Lead Sources and Intake do

---

## Problem Analysis

### Issue 1: Cannot Delete Sessions

**Current State:**
- `useSession.tsx` has no `deleteSession` function
- Dashboard shows sessions but provides no delete option
- Sessions accumulate in localStorage with no way to remove them

### Issue 2: Inconsistent Node Creation Across Funnel

**Current State:**
- **Lead Sources (q4)**: Creates individual nodes for each selected source
- **Intake (q_intake_methods)**: Creates individual nodes for each selected method
- **Qualification (q11)**: Fixed - now creates a decision node with criteria
- **Qualified Path (q_qualified_path)**: Text input - no node created
- **Disqualified Path (q_disqualified_path)**: Text input - no node created  
- **Conversion (q_conversion_type)**: Text input - creates ONE conversion node
- **Fulfillment (q16)**: Text input - creates ONE fulfillment node
- **Reviews (q17)**: Yes/No - creates ONE review node

**Root Cause:**
The conversion, close, and fulfillment questions are text inputs that create generic single nodes, whereas lead sources and intake use multi-select to create individual nodes per selection.

---

## Solution

### Part 1: Add Delete Session Functionality

#### 1.1 Update `useSession.tsx` - Add deleteSession function

```typescript
// Add to SessionContextType interface
deleteSession: (sessionId: string) => void;

// Add deleteSession function
const deleteSession = useCallback((sessionId: string) => {
  setSessions(prev => {
    const filtered = prev.filter(s => s.id !== sessionId);
    return filtered;
  });
  
  // If deleting the current session, clear it
  if (currentSession?.id === sessionId) {
    setCurrentSession(null);
    setIsSessionReady(false);
  }
}, [currentSession?.id]);
```

#### 1.2 Update `Dashboard.tsx` - Add delete button to session cards

```typescript
// Import Trash2 icon
import { Trash2 } from 'lucide-react';

// Get deleteSession from hook
const { createSession, sessions, deleteSession } = useSession();

// Add delete button to each session card
<Button 
  variant="ghost" 
  size="icon"
  className="h-8 w-8 text-muted-foreground hover:text-destructive"
  onClick={(e) => {
    e.stopPropagation();
    if (window.confirm(`Delete session "${session.clientName}"?`)) {
      deleteSession(session.id);
      toast.success('Session deleted');
    }
  }}
>
  <Trash2 className="h-4 w-4" />
</Button>
```

---

### Part 2: Full Funnel Node Creation (Like Lead Sources)

#### 2.1 Convert Qualified/Disqualified Path Questions to Multi-Select

The qualified path question should offer common workflow steps that create nodes, similar to how intake methods work:

**New QUALIFIED_PATH_OPTIONS:**
```typescript
export const QUALIFIED_PATH_OPTIONS: SelectOption[] = [
  { value: 'schedule-consultation', label: 'Schedule Consultation', category: 'Scheduling' },
  { value: 'schedule-intake', label: 'Schedule Intake Session', category: 'Scheduling' },
  { value: 'send-intake-forms', label: 'Send Intake Forms', category: 'Documentation' },
  { value: 'insurance-verification', label: 'Verify Insurance', category: 'Verification' },
  { value: 'therapist-matching', label: 'Match with Therapist', category: 'Assignment' },
  { value: 'assign-to-staff', label: 'Assign to Staff Member', category: 'Assignment' },
  { value: 'send-welcome-packet', label: 'Send Welcome Packet', category: 'Communication' },
  { value: 'collect-payment', label: 'Collect Initial Payment', category: 'Financial' },
  { value: 'other', label: 'Other', category: 'Custom' },
];
```

**New DISQUALIFIED_PATH_OPTIONS:**
```typescript
export const DISQUALIFIED_PATH_OPTIONS: SelectOption[] = [
  { value: 'refer-out', label: 'Refer to Another Provider', category: 'Referral' },
  { value: 'add-to-nurture', label: 'Add to Nurture List', category: 'Future' },
  { value: 'politely-decline', label: 'Politely Decline', category: 'Close' },
  { value: 'waitlist', label: 'Add to Waitlist', category: 'Future' },
  { value: 'nothing', label: 'Nothing (DROP-OFF)', category: 'LEAK ALERT' },
];
```

#### 2.2 Update Question Definitions in `questions.ts`

```typescript
// Change q_qualified_path from text to multi-select
{
  id: 'q_qualified_path',
  section: 'qualification',
  sectionLabel: 'Qualification',
  question: 'What happens when a lead IS qualified? (Select all steps)',
  type: 'multi-select',
  options: QUALIFIED_PATH_OPTIONS,
  required: true,
  allowCustom: true,
  skipCondition: (answers) => answers['q10']?.value === false,
  nodeCreation: {
    type: 'workflow',  // New node type for intermediate steps
    createPerSelection: true,
  },
  coachingHint: "Select the steps that happen after qualification.",
},

// Change q_disqualified_path from text to multi-select
{
  id: 'q_disqualified_path',
  section: 'qualification',
  sectionLabel: 'Qualification',
  question: 'What happens when a lead is NOT qualified? (Select handling)',
  type: 'multi-select',
  options: DISQUALIFIED_PATH_OPTIONS,
  required: false,
  allowCustom: true,
  skipCondition: (answers) => answers['q10']?.value === false,
  nodeCreation: {
    type: 'workflow',
    createPerSelection: true,
  },
  coachingHint: "Select how you handle disqualified leads.",
},
```

#### 2.3 Add New Node Types for Intermediate Workflow Steps

**Update `src/types/session.ts`:**
```typescript
export type NodeType = 
  | 'lead-source'
  | 'intake'
  | 'decision'
  | 'conversion'
  | 'close'
  | 'fulfillment'
  | 'review'
  | 'workflow'     // NEW: Intermediate workflow step
  | 'handoff'      // NEW: Handoff to person/system
  | 'verification' // NEW: Verification step
  | 'custom';
```

#### 2.4 Update Funnel Layout to Handle New Types

**Update `src/utils/funnelLayout.ts`:**
```typescript
export const NODE_LEVELS: Record<NodeType, number> = {
  'lead-source': 0,
  'intake': 1,
  'decision': 2,
  'conversion': 3,
  'workflow': 3,      // Same level as conversion (intermediate)
  'handoff': 3,       // Same level as conversion
  'verification': 2,  // Same level as qualification
  'close': 4,
  'fulfillment': 5,
  'review': 5,
  'custom': 3,
};
```

#### 2.5 Update CanvasNode to Display New Node Types

**Update `src/components/canvas/CanvasNode.tsx`:**
```typescript
// Add colors for new node types
const NODE_COLORS: Record<string, { border: string; bg: string }> = {
  // ... existing colors
  'workflow': { border: 'hsl(45, 70%, 50%)', bg: 'hsl(45, 70%, 50%)' },      // Gold
  'handoff': { border: 'hsl(200, 60%, 50%)', bg: 'hsl(200, 60%, 50%)' },     // Light Blue
  'verification': { border: 'hsl(280, 60%, 55%)', bg: 'hsl(280, 60%, 55%)' }, // Purple
};

// Add icons for new types
const icons: Record<string, string> = {
  // ... existing icons
  'workflow': '⚙️',
  'handoff': '🔄',
  'verification': '✔️',
};
```

#### 2.6 Update AddNodeModal with New Node Types

**Update `src/components/canvas/AddNodeModal.tsx`:**
Add workflow, handoff, and verification as options in the node type selector.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useSession.tsx` | Add `deleteSession` function |
| `src/pages/Dashboard.tsx` | Add delete button to session cards |
| `src/types/questions.ts` | Add QUALIFIED/DISQUALIFIED_PATH_OPTIONS, convert questions to multi-select |
| `src/types/session.ts` | Add `workflow`, `handoff`, `verification` node types |
| `src/utils/funnelLayout.ts` | Add levels for new node types |
| `src/components/canvas/CanvasNode.tsx` | Add colors/icons for new types |
| `src/components/canvas/AddNodeModal.tsx` | Add new node types to dropdown |

---

## Expected Results

### After Part 1 (Delete Sessions):
- Each session card in Dashboard has a trash icon
- Clicking trash shows confirmation dialog
- Session is removed from localStorage and UI

### After Part 2 (Full Funnel Nodes):
- Selecting qualified path options (e.g., "Schedule Consultation", "Verify Insurance") creates individual workflow nodes
- Nodes appear in the Conversion section of the funnel
- Disqualified path creates nodes in a separate branch
- All funnel sections now have proper node population like Lead Sources and Intake

---

## Visual Example

**Before:**
```
TOP OF FUNNEL:    [Facebook] [SEO] [Referrals]
INTAKE:           [Phone] [Online Booking] [Staff Calls]
QUALIFICATION:    [empty or single decision node]
CONVERSION:       [empty]
CLOSE:            [empty]
FULFILLMENT:      [empty]
```

**After:**
```
TOP OF FUNNEL:    [Facebook] [SEO] [Referrals]
INTAKE:           [Phone] [Online Booking] [Staff Calls]
QUALIFICATION:    [Qualification Criteria] [Insurance Verify]
CONVERSION:       [Schedule Consultation] [Therapist Match]
CLOSE:            [First Session] [Treatment Plan]
FULFILLMENT:      [Ongoing Appointments] [Reviews]
```

---

## Testing Checklist

- [ ] Delete a session from Dashboard - confirm it's removed
- [ ] Create new session - select qualified path steps - verify nodes appear in Conversion section
- [ ] Select disqualified path steps - verify separate nodes appear
- [ ] All new workflow nodes can be dragged, edited, connected like other nodes
- [ ] New node types have appropriate colors and icons
