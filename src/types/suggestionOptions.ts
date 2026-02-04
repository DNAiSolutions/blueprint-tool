// ============================================
// ALIGN Suggestion Options
// Centralized options for all discovery questions
// Used by the question engine to provide AI-powered suggestions
// ============================================

import { SelectOption } from './questions';

// ============================================
// GROWTH GOAL OPTIONS
// ============================================
export const GROWTH_GOAL_OPTIONS: SelectOption[] = [
  { value: 'increase-revenue', label: 'Increase Revenue', category: 'Financial' },
  { value: 'more-clients', label: 'Get More Clients', category: 'Growth' },
  { value: 'build-capacity', label: 'Build Capacity (Hire More)', category: 'Operations' },
  { value: 'improve-efficiency', label: 'Improve Efficiency', category: 'Operations' },
  { value: 'better-margins', label: 'Better Profit Margins', category: 'Financial' },
  { value: 'reduce-churn', label: 'Reduce Client Churn', category: 'Retention' },
  { value: 'expand-services', label: 'Expand Service Offerings', category: 'Growth' },
  { value: 'geographic-expansion', label: 'Expand to New Areas', category: 'Growth' },
  { value: 'systemize-ops', label: 'Systemize Operations', category: 'Operations' },
  { value: 'reduce-costs', label: 'Reduce Operating Costs', category: 'Financial' },
];

// ============================================
// BOTTLENECK OPTIONS
// ============================================
export const BOTTLENECK_OPTIONS: SelectOption[] = [
  // Top of Funnel
  { value: 'not-enough-leads', label: 'Not Enough Leads', category: 'Top of Funnel' },
  { value: 'wrong-leads', label: 'Getting Wrong Type of Leads', category: 'Top of Funnel' },
  { value: 'high-ad-costs', label: 'High Advertising Costs', category: 'Top of Funnel' },
  
  // Lead Handling
  { value: 'leads-dont-respond', label: 'Leads Don\'t Respond', category: 'Lead Handling' },
  { value: 'slow-response', label: 'Slow Response Time', category: 'Lead Handling' },
  { value: 'no-follow-up', label: 'No Follow-Up System', category: 'Lead Handling' },
  
  // Sales
  { value: 'low-close-rate', label: 'Low Close Rate', category: 'Sales' },
  { value: 'no-shows', label: 'Appointments Don\'t Show Up', category: 'Sales' },
  { value: 'long-sales-cycle', label: 'Sales Cycle Too Long', category: 'Sales' },
  { value: 'price-objections', label: 'Price Objections', category: 'Sales' },
  
  // Operations
  { value: 'fulfillment-delays', label: 'Fulfillment Takes Too Long', category: 'Operations' },
  { value: 'capacity-limits', label: 'At Capacity / Can\'t Scale', category: 'Operations' },
  { value: 'quality-issues', label: 'Quality/Consistency Issues', category: 'Operations' },
  { value: 'staff-turnover', label: 'Staff Turnover', category: 'Operations' },
  
  // Retention
  { value: 'no-repeat-business', label: 'No Repeat Business', category: 'Retention' },
  { value: 'no-referrals', label: 'Few Referrals', category: 'Retention' },
  { value: 'bad-reviews', label: 'Negative Reviews', category: 'Retention' },
];

// ============================================
// CONVERSION EVENT OPTIONS
// ============================================
export const CONVERSION_EVENT_OPTIONS: SelectOption[] = [
  { value: 'free-consultation', label: 'Free Consultation Call', category: 'Virtual' },
  { value: 'discovery-call', label: 'Discovery Call', category: 'Virtual' },
  { value: 'demo', label: 'Product/Service Demo', category: 'Virtual' },
  { value: 'intake-session', label: 'Intake Session', category: 'In-Person' },
  { value: 'on-site-estimate', label: 'On-Site Estimate', category: 'In-Person' },
  { value: 'home-visit', label: 'Home Visit/Assessment', category: 'In-Person' },
  { value: 'office-visit', label: 'Office Visit', category: 'In-Person' },
  { value: 'trial-session', label: 'Trial Session', category: 'In-Person' },
  { value: 'proposal-presentation', label: 'Proposal Presentation', category: 'Virtual' },
  { value: 'online-booking', label: 'Online Self-Booking', category: 'Automated' },
  { value: 'quote-sent', label: 'Quote/Proposal Sent', category: 'Automated' },
];

// ============================================
// FULFILLMENT STEP OPTIONS
// ============================================
export const FULFILLMENT_STEP_OPTIONS: SelectOption[] = [
  // Scheduling
  { value: 'schedule-job', label: 'Schedule the Job/Appointment', category: 'Scheduling' },
  { value: 'confirm-booking', label: 'Send Booking Confirmation', category: 'Scheduling' },
  { value: 'send-reminders', label: 'Send Reminders (Day Before)', category: 'Scheduling' },
  
  // Preparation
  { value: 'collect-info', label: 'Collect Additional Information', category: 'Preparation' },
  { value: 'send-forms', label: 'Send Intake/Prep Forms', category: 'Preparation' },
  { value: 'order-materials', label: 'Order Materials/Supplies', category: 'Preparation' },
  { value: 'assign-team', label: 'Assign Team Member', category: 'Preparation' },
  
  // Execution
  { value: 'arrive-onsite', label: 'Arrive On-Site', category: 'Execution' },
  { value: 'perform-service', label: 'Perform the Service', category: 'Execution' },
  { value: 'quality-check', label: 'Quality Check', category: 'Execution' },
  { value: 'client-walkthrough', label: 'Client Walkthrough/Review', category: 'Execution' },
  
  // Completion
  { value: 'collect-payment', label: 'Collect Payment', category: 'Completion' },
  { value: 'send-invoice', label: 'Send Invoice', category: 'Completion' },
  { value: 'send-receipt', label: 'Send Receipt/Confirmation', category: 'Completion' },
  { value: 'follow-up-call', label: 'Follow-Up Call', category: 'Completion' },
  
  // Post-Service
  { value: 'ask-review', label: 'Ask for Review', category: 'Post-Service' },
  { value: 'ask-referral', label: 'Ask for Referral', category: 'Post-Service' },
  { value: 'schedule-maintenance', label: 'Schedule Maintenance/Follow-Up', category: 'Post-Service' },
  { value: 'add-to-newsletter', label: 'Add to Newsletter/Email List', category: 'Post-Service' },
];

// ============================================
// REVIEW & REFERRAL OPTIONS
// ============================================
export const REVIEW_METHOD_OPTIONS: SelectOption[] = [
  { value: 'verbal-ask', label: 'Verbally Ask at End of Service', category: 'In-Person' },
  { value: 'text-link', label: 'Text with Review Link', category: 'Digital' },
  { value: 'email-request', label: 'Email Request', category: 'Digital' },
  { value: 'automated-sequence', label: 'Automated Email/Text Sequence', category: 'Automated' },
  { value: 'qr-code', label: 'QR Code on Receipt/Card', category: 'Physical' },
  { value: 'follow-up-call', label: 'Follow-Up Call', category: 'In-Person' },
  { value: 'incentive-program', label: 'Incentive/Reward Program', category: 'Incentivized' },
  { value: 'no-system', label: 'No Formal System', category: 'None' },
];

export const REFERRAL_PROGRAM_OPTIONS: SelectOption[] = [
  { value: 'discount-both', label: 'Discount for Both Parties', category: 'Incentivized' },
  { value: 'cash-reward', label: 'Cash/Gift Card Reward', category: 'Incentivized' },
  { value: 'free-service', label: 'Free Service/Add-On', category: 'Incentivized' },
  { value: 'verbal-ask', label: 'Just Ask Verbally', category: 'Basic' },
  { value: 'referral-cards', label: 'Referral Cards to Hand Out', category: 'Physical' },
  { value: 'affiliate-program', label: 'Formal Affiliate Program', category: 'Structured' },
  { value: 'no-program', label: 'No Referral Program', category: 'None' },
];

// ============================================
// DYNAMIC FULFILLMENT "WHAT'S NEXT" OPTIONS
// Used by AI to suggest next steps in the fulfillment chain
// ============================================
export const FULFILLMENT_CHAIN_OPTIONS: SelectOption[] = [
  // Communication
  { value: 'send-confirmation', label: 'Send Confirmation to Customer', category: 'Communication' },
  { value: 'send-instructions', label: 'Send Prep Instructions', category: 'Communication' },
  { value: 'call-customer', label: 'Call Customer', category: 'Communication' },
  { value: 'text-update', label: 'Text Status Update', category: 'Communication' },
  
  // Assignment
  { value: 'assign-technician', label: 'Assign Technician/Staff', category: 'Assignment' },
  { value: 'assign-project-manager', label: 'Assign Project Manager', category: 'Assignment' },
  { value: 'team-briefing', label: 'Team Briefing/Handoff', category: 'Assignment' },
  
  // Preparation
  { value: 'order-materials', label: 'Order Materials/Parts', category: 'Preparation' },
  { value: 'prepare-equipment', label: 'Prepare Equipment', category: 'Preparation' },
  { value: 'review-paperwork', label: 'Review Paperwork/Files', category: 'Preparation' },
  { value: 'pre-job-checklist', label: 'Complete Pre-Job Checklist', category: 'Preparation' },
  
  // Verification
  { value: 'verify-address', label: 'Verify Address/Access', category: 'Verification' },
  { value: 'verify-payment', label: 'Verify Payment Method', category: 'Verification' },
  { value: 'confirm-appointment', label: 'Confirm Appointment (Day Before)', category: 'Verification' },
  
  // Execution
  { value: 'travel-to-site', label: 'Travel to Site', category: 'Execution' },
  { value: 'perform-work', label: 'Perform the Work/Service', category: 'Execution' },
  { value: 'client-approval', label: 'Get Client Approval', category: 'Execution' },
  { value: 'take-photos', label: 'Take Before/After Photos', category: 'Execution' },
  
  // Completion
  { value: 'cleanup', label: 'Clean Up / Pack Up', category: 'Completion' },
  { value: 'final-walkthrough', label: 'Final Walkthrough with Client', category: 'Completion' },
  { value: 'collect-signature', label: 'Collect Signature', category: 'Completion' },
  { value: 'process-payment', label: 'Process Payment', category: 'Completion' },
  
  // Special
  { value: 'final-step', label: '✓ This is the final step', category: 'Done' },
];

// ============================================
// HELPER: Get options by category
// ============================================
export function getOptionsByCategory(options: SelectOption[]): Record<string, SelectOption[]> {
  return options.reduce((acc, option) => {
    const category = option.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(option);
    return acc;
  }, {} as Record<string, SelectOption[]>);
}

// ============================================
// HELPER: Get industry-specific suggestions
// ============================================
export function getIndustrySuggestions(
  industry: string | undefined,
  questionType: 'growth' | 'bottleneck' | 'conversion' | 'fulfillment'
): SelectOption[] {
  // For now, return the general options
  // In the future, this can filter or prioritize based on industry
  switch (questionType) {
    case 'growth':
      return GROWTH_GOAL_OPTIONS;
    case 'bottleneck':
      return BOTTLENECK_OPTIONS;
    case 'conversion':
      return CONVERSION_EVENT_OPTIONS;
    case 'fulfillment':
      return FULFILLMENT_STEP_OPTIONS;
    default:
      return [];
  }
}
