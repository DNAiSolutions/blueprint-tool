// ============================================
// ALIGN Question Flow Types
// ============================================

export type QuestionType = 'text' | 'number' | 'percentage' | 'currency' | 'select' | 'yes-no' | 'multi-select';

export type QuestionSection = 
  | 'goals-context'
  | 'lead-sources'
  | 'lead-handling'
  | 'qualification'
  | 'conversion-events'
  | 'fulfillment';

export interface SelectOption {
  value: string;
  label: string;
  category?: string; // For grouping options
  isPaid?: boolean;  // For lead sources that have ad spend
}

export interface Question {
  id: string;
  section: QuestionSection;
  sectionLabel: string;
  question: string;
  type: QuestionType;
  placeholder?: string;
  required: boolean;
  options?: SelectOption[];
  minValue?: number;
  maxValue?: number;
  skipCondition?: (answers: QuestionAnswers) => boolean;
  coachingHint?: string;
  nodeCreation?: {
    type: 'lead-source' | 'intake' | 'decision' | 'conversion' | 'close' | 'fulfillment' | 'review';
    field?: string;
    createPerSelection?: boolean; // Create individual nodes per multi-select choice
  };
  allowCustom?: boolean; // Allow custom text input for multi-select
  dynamicFollowUp?: boolean; // Generates follow-up questions dynamically
}

export interface QuestionAnswer {
  questionId: string;
  value: string | number | boolean | string[];
  answeredAt: Date;
}

export type QuestionAnswers = Record<string, QuestionAnswer>;

export interface QuestionFlowState {
  currentQuestionIndex: number;
  answers: QuestionAnswers;
  completedSections: QuestionSection[];
  isComplete: boolean;
  lastSavedAt?: Date;
  dynamicQuestions?: Question[]; // Dynamically generated follow-up questions
  selectedLeadSources?: string[]; // Track selected lead sources for follow-ups
  selectedIntakeMethods?: string[]; // Track selected intake methods
}

// ============================================
// Lead Source Options (Comprehensive)
// ============================================
export const LEAD_SOURCE_OPTIONS: SelectOption[] = [
  // Paid Ads
  { value: 'google-ads', label: 'Google Ads', category: 'Paid Ads', isPaid: true },
  { value: 'facebook-meta', label: 'Facebook/Meta Ads', category: 'Paid Ads', isPaid: true },
  { value: 'tiktok-ads', label: 'TikTok Ads', category: 'Paid Ads', isPaid: true },
  { value: 'youtube-ads', label: 'YouTube Ads', category: 'Paid Ads', isPaid: true },
  { value: 'bing-ads', label: 'Bing/Microsoft Ads', category: 'Paid Ads', isPaid: true },
  { value: 'nextdoor-ads', label: 'Nextdoor Ads', category: 'Paid Ads', isPaid: true },
  { value: 'linkedin-ads', label: 'LinkedIn Ads', category: 'Paid Ads', isPaid: true },
  
  // Organic
  { value: 'seo-website', label: 'SEO/Website', category: 'Organic' },
  { value: 'google-my-business', label: 'Google My Business/Maps', category: 'Organic' },
  { value: 'facebook-groups', label: 'Facebook Groups/Organic', category: 'Organic' },
  { value: 'content-blog', label: 'Content/Blog', category: 'Organic' },
  { value: 'youtube-organic', label: 'YouTube (Organic)', category: 'Organic' },
  { value: 'instagram-organic', label: 'Instagram (Organic)', category: 'Organic' },
  
  // Referrals
  { value: 'customer-referrals', label: 'Customer Referrals', category: 'Referrals' },
  { value: 'partner-referrals', label: 'Partner/Contractor Referrals', category: 'Referrals' },
  { value: 'realtor-referrals', label: 'Realtor Referrals', category: 'Referrals' },
  { value: 'insurance-referrals', label: 'Insurance Agent Referrals', category: 'Referrals' },
  
  // Direct
  { value: 'yard-signs', label: 'Yard Signs', category: 'Direct' },
  { value: 'door-knocking', label: 'Door Knocking', category: 'Direct' },
  { value: 'cold-calling', label: 'Cold Calling', category: 'Direct' },
  { value: 'radio-tv', label: 'Radio/TV', category: 'Direct', isPaid: true },
  { value: 'mailers-flyers', label: 'Mailers/Flyers', category: 'Direct', isPaid: true },
  { value: 'billboards', label: 'Billboards', category: 'Direct', isPaid: true },
  { value: 'vehicle-wraps', label: 'Vehicle Wraps', category: 'Direct' },
  
  // Events
  { value: 'networking', label: 'Networking Events', category: 'Events' },
  { value: 'trade-shows', label: 'Trade Shows', category: 'Events' },
  { value: 'home-shows', label: 'Home Shows', category: 'Events' },
  
  // Lead Services
  { value: 'angi-leads', label: 'Angi Leads', category: 'Lead Services', isPaid: true },
  { value: 'homeadvisor', label: 'HomeAdvisor', category: 'Lead Services', isPaid: true },
  { value: 'thumbtack', label: 'Thumbtack', category: 'Lead Services', isPaid: true },
  { value: 'yelp-ads', label: 'Yelp Ads', category: 'Lead Services', isPaid: true },
];

// ============================================
// Intake Method Options
// ============================================
export const INTAKE_METHOD_OPTIONS: SelectOption[] = [
  { value: 'lead-forms', label: 'Lead Forms (website/landing page)', category: 'Digital' },
  { value: 'phone-inbound', label: 'Phone Calls (inbound)', category: 'Phone' },
  { value: 'phone-outbound', label: 'Phone Calls (VA/team calls them)', category: 'Phone' },
  { value: 'text-sms', label: 'Text/SMS', category: 'Digital' },
  { value: 'email', label: 'Email', category: 'Digital' },
  { value: 'live-chat', label: 'Live Chat/Chatbot', category: 'Digital' },
  { value: 'in-person', label: 'In-Person (walk-in, event)', category: 'In-Person' },
  { value: 'social-dm', label: 'Social Media DM', category: 'Digital' },
  { value: 'booking-calendar', label: 'Booking/Calendar Link', category: 'Digital' },
];

// ============================================
// Qualification Criteria Options
// ============================================
export const QUALIFICATION_OPTIONS: SelectOption[] = [
  { value: 'budget-confirmed', label: 'Budget/Affordability Confirmed', category: 'Financial' },
  { value: 'decision-maker', label: 'Decision Maker Present', category: 'Authority' },
  { value: 'timeline-urgency', label: 'Timeline/Urgency Established', category: 'Timing' },
  { value: 'clear-need', label: 'Clear Need Identified', category: 'Need' },
  { value: 'service-area', label: 'In Service Area/Territory', category: 'Location' },
  { value: 'property-type', label: 'Property Type Qualified', category: 'Property' },
  { value: 'home-age', label: 'Home Age/Condition Met', category: 'Property' },
  { value: 'insurance-claim', label: 'Insurance Involved (Y/N)', category: 'Financial' },
  { value: 'financing-needed', label: 'Financing Needed (Y/N)', category: 'Financial' },
  { value: 'homeowner-verified', label: 'Homeowner Verified', category: 'Authority' },
];

// ============================================
// Response Time Options
// ============================================
export const RESPONSE_TIME_OPTIONS: SelectOption[] = [
  { value: 'under-1min', label: 'Under 1 minute', category: 'Speed to Lead Champion!' },
  { value: '1-5min', label: '1-5 minutes', category: 'Great response time' },
  { value: '5-30min', label: '5-30 minutes', category: 'Room for improvement' },
  { value: '30min-1hr', label: '30 min - 1 hour', category: 'Leads are cooling' },
  { value: 'same-day', label: 'Same day', category: 'Many leads lost by now' },
  { value: 'next-day', label: 'Next day or longer', category: 'Critical leak point' },
];

// ============================================
// Follow-Up Options
// ============================================
export const FOLLOW_UP_OPTIONS: SelectOption[] = [
  { value: 'call-5min', label: 'Call back within 5 minutes', category: 'Immediate' },
  { value: 'call-1hr', label: 'Call back within 1 hour', category: 'Same Day' },
  { value: 'call-same-day', label: 'Call back same day', category: 'Same Day' },
  { value: 'text-message', label: 'Text message', category: 'Digital' },
  { value: 'email-follow-up', label: 'Email follow-up', category: 'Digital' },
  { value: 'voicemail-text', label: 'Voicemail + text combo', category: 'Combined' },
  { value: 'automated-sequence', label: 'Automated follow-up sequence', category: 'Automated' },
  { value: 'nothing', label: 'Nothing (DROP-OFF)', category: 'LEAK ALERT' },
];

// ============================================
// Question Definitions
// ============================================

export const QUESTIONS: Question[] = [
  // ─────────────────────────────────────────────
  // SECTION 1: Goals & Context
  // ─────────────────────────────────────────────
  {
    id: 'q1',
    section: 'goals-context',
    sectionLabel: 'Goals & Context',
    question: 'What are you trying to grow? (Revenue, clients, capacity, etc.)',
    type: 'text',
    placeholder: 'e.g., We want to grow revenue by hiring more techs',
    required: true,
    coachingHint: "Start broad - understand their primary growth goal.",
  },
  {
    id: 'q2',
    section: 'goals-context',
    sectionLabel: 'Goals & Context',
    question: "What's your target annual revenue?",
    type: 'currency',
    placeholder: 'e.g., 500000',
    required: true,
    coachingHint: "This helps frame the scale of opportunity.",
  },
  {
    id: 'q3',
    section: 'goals-context',
    sectionLabel: 'Goals & Context',
    question: "What's your biggest bottleneck right now?",
    type: 'text',
    placeholder: 'e.g., We can\'t get enough leads / Can\'t close enough deals',
    required: true,
    coachingHint: "Great. Let's map where your leads come from.",
  },

  // ─────────────────────────────────────────────
  // SECTION 2: Lead Sources (MULTI-SELECT)
  // ─────────────────────────────────────────────
  {
    id: 'q4',
    section: 'lead-sources',
    sectionLabel: 'Lead Sources',
    question: 'Where do your leads come from? (Select all that apply)',
    type: 'multi-select',
    options: LEAD_SOURCE_OPTIONS,
    required: true,
    allowCustom: true,
    dynamicFollowUp: true, // Triggers dynamic follow-up questions
    nodeCreation: {
      type: 'lead-source',
      createPerSelection: true, // Create one node per selected source
    },
    coachingHint: "Select all sources - we'll dig into each one.",
  },
  // Dynamic questions for each lead source will be generated at runtime
  // Template: "How many leads per month from {source}?" (number)
  // Template: "What's your monthly spend on {source}?" (currency, if isPaid)

  // ─────────────────────────────────────────────
  // SECTION 3: Lead Handling (MULTI-SELECT)
  // ─────────────────────────────────────────────
  {
    id: 'q_intake_methods',
    section: 'lead-handling',
    sectionLabel: 'Lead Handling',
    question: 'How do leads reach you? (Select all that apply)',
    type: 'multi-select',
    options: INTAKE_METHOD_OPTIONS,
    required: true,
    allowCustom: true,
    dynamicFollowUp: true,
    nodeCreation: {
      type: 'intake',
      createPerSelection: true,
    },
    coachingHint: "Select all intake methods used across your lead sources.",
  },
  // Dynamic: "Which intake methods apply to {lead source}?" (checkboxes)
  
  {
    id: 'q8',
    section: 'lead-handling',
    sectionLabel: 'Lead Handling',
    question: 'How quickly do you respond to new leads?',
    type: 'select',
    options: RESPONSE_TIME_OPTIONS,
    required: true,
    coachingHint: "Speed to lead is critical for conversion.",
  },
  {
    id: 'q9',
    section: 'lead-handling',
    sectionLabel: 'Lead Handling',
    question: "What happens if they don't answer on the first try?",
    type: 'multi-select',
    options: FOLLOW_UP_OPTIONS,
    required: true,
    allowCustom: true,
    coachingHint: "Do prospects who don't answer get a second chance?",
  },

  // ─────────────────────────────────────────────
  // SECTION 4: Qualification (MULTI-SELECT)
  // ─────────────────────────────────────────────
  {
    id: 'q10',
    section: 'qualification',
    sectionLabel: 'Qualification',
    question: 'Do you qualify leads before booking a call or appointment?',
    type: 'yes-no',
    required: true,
    coachingHint: "Understanding if there's a filter before conversion events.",
  },
  {
    id: 'q11',
    section: 'qualification',
    sectionLabel: 'Qualification',
    question: 'What criteria do you use to qualify leads? (Select all that apply)',
    type: 'multi-select',
    options: QUALIFICATION_OPTIONS,
    required: true,
    allowCustom: true,
    skipCondition: (answers) => answers['q10']?.value === false,
    nodeCreation: {
      type: 'decision',
      createPerSelection: false, // Single decision node with all criteria
    },
    coachingHint: "This helps identify what makes someone a 'good fit'.",
  },
  {
    id: 'q12',
    section: 'qualification',
    sectionLabel: 'Qualification',
    question: 'Roughly what % of leads meet your qualification criteria?',
    type: 'percentage',
    placeholder: 'e.g., 50',
    required: true,
    minValue: 0,
    maxValue: 100,
    skipCondition: (answers) => answers['q10']?.value === false,
    coachingHint: "This is a key conversion point in your funnel.",
  },

  // ─────────────────────────────────────────────
  // SECTION 5: Conversion Events
  // ─────────────────────────────────────────────
  {
    id: 'q13',
    section: 'conversion-events',
    sectionLabel: 'Conversion Events',
    question: 'Of qualified leads (or all leads if no qualification), how many schedule a call/appointment?',
    type: 'percentage',
    placeholder: 'e.g., 28',
    required: true,
    minValue: 0,
    maxValue: 100,
    nodeCreation: {
      type: 'conversion',
      field: 'conversionRate',
    },
    coachingHint: "This measures booking rate.",
  },
  {
    id: 'q14',
    section: 'conversion-events',
    sectionLabel: 'Conversion Events',
    question: 'Of scheduled calls/appointments, how many actually happen (show rate)?',
    type: 'percentage',
    placeholder: 'e.g., 80',
    required: true,
    minValue: 0,
    maxValue: 100,
    coachingHint: "No-shows are a common leak point.",
  },
  {
    id: 'q15',
    section: 'conversion-events',
    sectionLabel: 'Conversion Events',
    question: "What's your close rate on calls/appointments that happen?",
    type: 'percentage',
    placeholder: 'e.g., 71',
    required: true,
    minValue: 0,
    maxValue: 100,
    nodeCreation: {
      type: 'close',
      field: 'conversionRate',
    },
    coachingHint: "Your close rate shows sales process effectiveness.",
  },

  // ─────────────────────────────────────────────
  // SECTION 6: Fulfillment
  // ─────────────────────────────────────────────
  {
    id: 'q16',
    section: 'fulfillment',
    sectionLabel: 'Fulfillment',
    question: 'What happens after closing a deal? (Delivery, installation, service, etc.)',
    type: 'text',
    placeholder: 'e.g., We schedule the job within 2 weeks and complete it',
    required: false,
    nodeCreation: {
      type: 'fulfillment',
    },
    coachingHint: "Let's map what happens post-sale.",
  },
  {
    id: 'q17',
    section: 'fulfillment',
    sectionLabel: 'Fulfillment',
    question: 'Do you intentionally ask for reviews or referrals?',
    type: 'yes-no',
    required: true,
    nodeCreation: {
      type: 'review',
    },
    coachingHint: "Reviews and referrals close the loop.",
  },
  {
    id: 'q18',
    section: 'fulfillment',
    sectionLabel: 'Fulfillment',
    question: 'What % of clients leave a review or send a referral?',
    type: 'percentage',
    placeholder: 'e.g., 20',
    required: false,
    minValue: 0,
    maxValue: 100,
    skipCondition: (answers) => answers['q17']?.value === false,
    coachingHint: "You've mapped your entire process! Ready to see insights?",
  },
];

// Section metadata for display
export const SECTION_META: Record<QuestionSection, { label: string; icon: string }> = {
  'goals-context': { label: 'Goals & Context', icon: '🎯' },
  'lead-sources': { label: 'Lead Sources', icon: '📣' },
  'lead-handling': { label: 'Lead Handling', icon: '📞' },
  'qualification': { label: 'Qualification', icon: '✅' },
  'conversion-events': { label: 'Conversion Events', icon: '📈' },
  'fulfillment': { label: 'Fulfillment', icon: '🏁' },
};

// Get questions for a specific section
export function getQuestionsForSection(section: QuestionSection): Question[] {
  return QUESTIONS.filter(q => q.section === section);
}

// Get unique sections in order
export function getSections(): QuestionSection[] {
  const seen = new Set<QuestionSection>();
  const sections: QuestionSection[] = [];
  
  for (const q of QUESTIONS) {
    if (!seen.has(q.section)) {
      seen.add(q.section);
      sections.push(q.section);
    }
  }
  
  return sections;
}

// Generate dynamic follow-up questions for selected lead sources
export function generateLeadSourceFollowUps(selectedSources: string[]): Question[] {
  const questions: Question[] = [];
  
  selectedSources.forEach((sourceValue, index) => {
    const sourceOption = LEAD_SOURCE_OPTIONS.find(o => o.value === sourceValue);
    if (!sourceOption) return;
    
    const sourceLabel = sourceOption.label;
    
    // Volume question for each source
    questions.push({
      id: `q_volume_${sourceValue}`,
      section: 'lead-sources',
      sectionLabel: 'Lead Sources',
      question: `How many leads per month from ${sourceLabel}?`,
      type: 'number',
      placeholder: 'e.g., 50',
      required: true,
      minValue: 0,
      coachingHint: `This helps us understand the volume from ${sourceLabel}.`,
    });
    
    // Spend question for paid sources
    if (sourceOption.isPaid) {
      questions.push({
        id: `q_spend_${sourceValue}`,
        section: 'lead-sources',
        sectionLabel: 'Lead Sources',
        question: `What's your monthly spend on ${sourceLabel}?`,
        type: 'currency',
        placeholder: 'e.g., 1500',
        required: false,
        coachingHint: `This helps calculate cost per lead for ${sourceLabel}.`,
      });
    }
  });
  
  return questions;
}

// Generate intake-to-source mapping questions
export function generateIntakeMappingQuestions(
  selectedSources: string[],
  selectedIntakes: string[]
): Question[] {
  const questions: Question[] = [];
  
  selectedSources.forEach((sourceValue) => {
    const sourceOption = LEAD_SOURCE_OPTIONS.find(o => o.value === sourceValue);
    if (!sourceOption) return;
    
    // Create a mapping question for each lead source
    questions.push({
      id: `q_intake_map_${sourceValue}`,
      section: 'lead-handling',
      sectionLabel: 'Lead Handling',
      question: `Which intake methods apply to ${sourceOption.label}?`,
      type: 'multi-select',
      options: selectedIntakes.map(intake => {
        const intakeOption = INTAKE_METHOD_OPTIONS.find(o => o.value === intake);
        return {
          value: intake,
          label: intakeOption?.label || intake,
        };
      }),
      required: true,
      coachingHint: `Select all ways leads from ${sourceOption.label} reach you.`,
    });
  });
  
  return questions;
}
