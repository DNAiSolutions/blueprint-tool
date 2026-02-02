

# Refine Industry Options - Implementation Plan

## Overview
Restructure the industry selector from a flat list of blue-collar trades into **organized categories** that broaden the range of service businesses ALIGN can support. This prepares the system for future AI-powered industry research and template generation.

## Current State
- 8 individual blue-collar options (Roofing, Pest Control, HVAC, Plumbing, Landscaping, Cleaning, Other, Custom)
- No organization or grouping
- Limited to home services

## Proposed Industry Structure

### New Categories (7 main categories + Custom)

| Category | Description | Examples |
|----------|-------------|----------|
| **Home Services** | Blue-collar trades & home repair | Roofing, HVAC, Plumbing, Electrical, Pest Control, Landscaping, Cleaning, Painting, Flooring |
| **Healthcare & Wellness** | Medical, mental health, wellness | Mental Health Practice, Therapy/Counseling, Chiropractic, Dental, Med Spa, Physical Therapy |
| **Childcare & Education** | Youth services & learning | Daycare/Childcare, Tutoring, Private School, After-School Programs |
| **Professional Services** | B2B consulting & expertise | Business Consulting, Marketing Agency, Legal Services, Accounting/Bookkeeping, IT Services |
| **Transportation & Logistics** | Moving, shipping, freight | Freight/Trucking, Moving Company, Courier/Delivery, Auto Transport |
| **Automotive** | Vehicle-related services | Auto Repair, Detailing, Tire Shop, Body Shop, Towing |
| **Personal Services** | Consumer-facing lifestyle | Salon/Barbershop, Photography, Event Planning, Pet Services, Fitness/Personal Training |
| **Custom** | User specifies their industry | AI will research and adapt |

## Technical Changes

### File 1: `src/types/session.ts`
- Replace the flat `Industry` type with a new structure
- Add `IndustryCategory` type for the parent categories
- Add `INDUSTRY_CATEGORIES` constant with grouped options
- Each category has: `value`, `label`, `description`, and `examples` array
- Keep backward compatibility with existing sessions

### File 2: `src/pages/Dashboard.tsx`
- Update the industry selector to show categories with grouped options
- Use `SelectGroup` and `SelectLabel` from Radix to create visual groupings
- Show category name as the group header
- List 2-3 example industries under each category
- Add a subtle description explaining AI will customize based on selection

## Data Structure

```typescript
type IndustryCategory = 
  | 'home-services'
  | 'healthcare-wellness'
  | 'childcare-education'
  | 'professional-services'
  | 'transportation-logistics'
  | 'automotive'
  | 'personal-services'
  | 'custom';

interface IndustryCategoryOption {
  value: IndustryCategory;
  label: string;
  description: string;
  examples: string[];
}
```

## UI Preview

The dropdown will display:

```
Select an industry...
─────────────────────────
🏠 Home Services
   Roofing, HVAC, Plumbing, Landscaping...
─────────────────────────
🩺 Healthcare & Wellness
   Mental Health, Therapy, Dental...
─────────────────────────
👶 Childcare & Education
   Daycare, Tutoring, After-School...
─────────────────────────
💼 Professional Services
   Consulting, Marketing, Legal...
─────────────────────────
🚚 Transportation & Logistics
   Freight/Trucking, Moving, Delivery...
─────────────────────────
🚗 Automotive
   Auto Repair, Detailing, Body Shop...
─────────────────────────
✂️ Personal Services
   Salon, Photography, Pet Services...
─────────────────────────
⚙️ Custom (I'll describe it)
```

## Future AI Integration Notes
- The `examples` array within each category will help AI understand the industry context
- When AI is integrated, it can use the category + session data to:
  - Research typical lead flows for that industry
  - Pre-populate common node types
  - Suggest industry-specific questions
  - Generate benchmarks (e.g., "Average roofing close rate is 35%")

## Files Modified
1. `src/types/session.ts` - New category types and options
2. `src/pages/Dashboard.tsx` - Updated industry selector UI

## No Breaking Changes
- Existing sessions with old industry values will still work
- The new `Industry` type is a superset (keeps backward compatibility)
- No changes to Canvas, session hooks, or other components

