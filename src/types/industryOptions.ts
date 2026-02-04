// ============================================
// Industry-Specific Option Sets for ALIGN
// ============================================

import { SelectOption } from './questions';
import { Industry } from './session';

// ============================================
// LEAD SOURCE OPTIONS BY INDUSTRY
// ============================================

export const LEAD_SOURCE_OPTIONS_HOME_SERVICES: SelectOption[] = [
  // Paid Ads
  { value: 'google-ads', label: 'Google Ads', category: 'Paid Ads', isPaid: true },
  { value: 'facebook-meta', label: 'Facebook/Meta Ads', category: 'Paid Ads', isPaid: true },
  { value: 'tiktok-ads', label: 'TikTok Ads', category: 'Paid Ads', isPaid: true },
  { value: 'youtube-ads', label: 'YouTube Ads', category: 'Paid Ads', isPaid: true },
  { value: 'bing-ads', label: 'Bing/Microsoft Ads', category: 'Paid Ads', isPaid: true },
  { value: 'nextdoor-ads', label: 'Nextdoor Ads', category: 'Paid Ads', isPaid: true },
  
  // Organic
  { value: 'seo-website', label: 'SEO/Website', category: 'Organic' },
  { value: 'google-my-business', label: 'Google My Business/Maps', category: 'Organic' },
  { value: 'facebook-groups', label: 'Facebook Groups/Organic', category: 'Organic' },
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

export const LEAD_SOURCE_OPTIONS_HEALTHCARE: SelectOption[] = [
  // Paid Ads
  { value: 'google-ads', label: 'Google Ads', category: 'Paid Ads', isPaid: true },
  { value: 'facebook-meta', label: 'Facebook/Meta Ads', category: 'Paid Ads', isPaid: true },
  { value: 'bing-ads', label: 'Bing/Microsoft Ads', category: 'Paid Ads', isPaid: true },
  
  // Organic/Directories
  { value: 'seo-website', label: 'SEO/Website', category: 'Organic' },
  { value: 'google-my-business', label: 'Google My Business/Maps', category: 'Organic' },
  { value: 'psychology-today', label: 'Psychology Today', category: 'Directories' },
  { value: 'zocdoc', label: 'Zocdoc', category: 'Directories' },
  { value: 'healthgrades', label: 'Healthgrades', category: 'Directories' },
  { value: 'vitals', label: 'Vitals', category: 'Directories' },
  { value: 'webmd', label: 'WebMD Directory', category: 'Directories' },
  
  // Referrals
  { value: 'patient-referrals', label: 'Patient Referrals', category: 'Referrals' },
  { value: 'physician-referrals', label: 'Physician Referrals', category: 'Referrals' },
  { value: 'insurance-networks', label: 'Insurance Network Referrals', category: 'Referrals' },
  { value: 'hospital-referrals', label: 'Hospital/Clinic Referrals', category: 'Referrals' },
  { value: 'specialist-referrals', label: 'Specialist Referrals', category: 'Referrals' },
  
  // Community
  { value: 'community-events', label: 'Community Health Events', category: 'Community' },
  { value: 'wellness-programs', label: 'Employer Wellness Programs', category: 'Community' },
  { value: 'support-groups', label: 'Support Groups', category: 'Community' },
  { value: 'health-fairs', label: 'Health Fairs', category: 'Community' },
  
  // Content
  { value: 'content-blog', label: 'Content/Blog', category: 'Content' },
  { value: 'youtube-organic', label: 'YouTube (Organic)', category: 'Content' },
  { value: 'podcast', label: 'Podcast', category: 'Content' },
  { value: 'instagram-organic', label: 'Instagram (Organic)', category: 'Content' },
];

export const LEAD_SOURCE_OPTIONS_PROFESSIONAL: SelectOption[] = [
  // Paid Ads
  { value: 'google-ads', label: 'Google Ads', category: 'Paid Ads', isPaid: true },
  { value: 'linkedin-ads', label: 'LinkedIn Ads', category: 'Paid Ads', isPaid: true },
  { value: 'facebook-meta', label: 'Facebook/Meta Ads', category: 'Paid Ads', isPaid: true },
  { value: 'bing-ads', label: 'Bing/Microsoft Ads', category: 'Paid Ads', isPaid: true },
  
  // Organic
  { value: 'seo-website', label: 'SEO/Website', category: 'Organic' },
  { value: 'linkedin-organic', label: 'LinkedIn (Organic)', category: 'Organic' },
  { value: 'content-blog', label: 'Content/Blog', category: 'Organic' },
  { value: 'youtube-organic', label: 'YouTube (Organic)', category: 'Organic' },
  
  // Events & Speaking
  { value: 'speaking-engagements', label: 'Speaking Engagements', category: 'Events' },
  { value: 'webinars', label: 'Webinars/Online Events', category: 'Events' },
  { value: 'podcasts', label: 'Podcast Appearances', category: 'Events' },
  { value: 'conferences', label: 'Industry Conferences', category: 'Events' },
  { value: 'workshops', label: 'Workshops/Training', category: 'Events' },
  
  // Referrals & Partnerships
  { value: 'client-referrals', label: 'Client Referrals', category: 'Referrals' },
  { value: 'strategic-partners', label: 'Strategic Partnerships', category: 'Referrals' },
  { value: 'professional-networks', label: 'Professional Networks', category: 'Referrals' },
  { value: 'alumni-network', label: 'Alumni Network', category: 'Referrals' },
  
  // Outbound
  { value: 'cold-email', label: 'Cold Email', category: 'Outbound' },
  { value: 'cold-calling', label: 'Cold Calling', category: 'Outbound' },
  { value: 'linkedin-outreach', label: 'LinkedIn Outreach', category: 'Outbound' },
];

export const LEAD_SOURCE_OPTIONS_CHILDCARE: SelectOption[] = [
  // Paid Ads
  { value: 'google-ads', label: 'Google Ads', category: 'Paid Ads', isPaid: true },
  { value: 'facebook-meta', label: 'Facebook/Meta Ads', category: 'Paid Ads', isPaid: true },
  { value: 'instagram-ads', label: 'Instagram Ads', category: 'Paid Ads', isPaid: true },
  
  // Organic
  { value: 'seo-website', label: 'SEO/Website', category: 'Organic' },
  { value: 'google-my-business', label: 'Google My Business/Maps', category: 'Organic' },
  { value: 'facebook-groups', label: 'Local Parent Facebook Groups', category: 'Organic' },
  { value: 'nextdoor', label: 'Nextdoor', category: 'Organic' },
  
  // Directories
  { value: 'childcare-finder', label: 'Childcare Finder Sites', category: 'Directories' },
  { value: 'care-com', label: 'Care.com', category: 'Directories', isPaid: true },
  { value: 'yelp', label: 'Yelp', category: 'Directories' },
  { value: 'school-directories', label: 'School Directories', category: 'Directories' },
  
  // Referrals
  { value: 'parent-referrals', label: 'Parent Referrals', category: 'Referrals' },
  { value: 'school-referrals', label: 'School Referrals', category: 'Referrals' },
  { value: 'pediatrician-referrals', label: 'Pediatrician Referrals', category: 'Referrals' },
  
  // Community
  { value: 'community-events', label: 'Community Events', category: 'Community' },
  { value: 'school-events', label: 'School Events', category: 'Community' },
  { value: 'open-houses', label: 'Open Houses/Tours', category: 'Community' },
  { value: 'partnerships', label: 'Business Partnerships', category: 'Community' },
];

export const LEAD_SOURCE_OPTIONS_GENERIC: SelectOption[] = [
  // Paid Ads
  { value: 'google-ads', label: 'Google Ads', category: 'Paid Ads', isPaid: true },
  { value: 'facebook-meta', label: 'Facebook/Meta Ads', category: 'Paid Ads', isPaid: true },
  { value: 'instagram-ads', label: 'Instagram Ads', category: 'Paid Ads', isPaid: true },
  { value: 'linkedin-ads', label: 'LinkedIn Ads', category: 'Paid Ads', isPaid: true },
  
  // Organic
  { value: 'seo-website', label: 'SEO/Website', category: 'Organic' },
  { value: 'google-my-business', label: 'Google My Business/Maps', category: 'Organic' },
  { value: 'social-media', label: 'Social Media (Organic)', category: 'Organic' },
  { value: 'content-blog', label: 'Content/Blog', category: 'Organic' },
  
  // Referrals
  { value: 'customer-referrals', label: 'Customer/Client Referrals', category: 'Referrals' },
  { value: 'partner-referrals', label: 'Partner Referrals', category: 'Referrals' },
  { value: 'word-of-mouth', label: 'Word of Mouth', category: 'Referrals' },
  
  // Direct
  { value: 'networking', label: 'Networking Events', category: 'Direct' },
  { value: 'cold-outreach', label: 'Cold Outreach', category: 'Direct' },
  { value: 'trade-shows', label: 'Trade Shows/Events', category: 'Direct' },
];

// ============================================
// QUALIFICATION OPTIONS BY INDUSTRY
// ============================================

export const QUALIFICATION_OPTIONS_HOME_SERVICES: SelectOption[] = [
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

export const QUALIFICATION_OPTIONS_HEALTHCARE: SelectOption[] = [
  { value: 'insurance-verified', label: 'Insurance/Payment Method Verified', category: 'Financial' },
  { value: 'condition-fit', label: 'Condition/Treatment Fit', category: 'Clinical' },
  { value: 'referral-source', label: 'Patient Referral Source Identified', category: 'Source' },
  { value: 'consultation-completed', label: 'Consultation/Assessment Completed', category: 'Process' },
  { value: 'treatment-timeline', label: 'Treatment Timeline Established', category: 'Timing' },
  { value: 'in-network', label: 'In-Network or Self-Pay Confirmed', category: 'Financial' },
  { value: 'medical-history', label: 'Medical History Reviewed', category: 'Clinical' },
  { value: 'patient-commitment', label: 'Patient Commitment Level', category: 'Readiness' },
  { value: 'prior-authorization', label: 'Prior Authorization (if needed)', category: 'Administrative' },
  { value: 'location-accessible', label: 'Location/Telehealth Accessible', category: 'Access' },
];

export const QUALIFICATION_OPTIONS_PROFESSIONAL: SelectOption[] = [
  { value: 'budget-confirmed', label: 'Budget/Investment Confirmed', category: 'Financial' },
  { value: 'decision-maker', label: 'Decision Maker Present', category: 'Authority' },
  { value: 'project-scope', label: 'Project Scope Defined', category: 'Scope' },
  { value: 'timeline-urgency', label: 'Timeline/Urgency Established', category: 'Timing' },
  { value: 'contract-authority', label: 'Contract Authority Verified', category: 'Authority' },
  { value: 'business-size', label: 'Business Size/Type Qualified', category: 'Fit' },
  { value: 'pain-point', label: 'Clear Pain Point Identified', category: 'Need' },
  { value: 'stakeholder-buy-in', label: 'Stakeholder Buy-In', category: 'Authority' },
  { value: 'previous-experience', label: 'Previous Experience with Similar Services', category: 'Context' },
  { value: 'success-criteria', label: 'Success Criteria Defined', category: 'Scope' },
];

export const QUALIFICATION_OPTIONS_CHILDCARE: SelectOption[] = [
  { value: 'age-group', label: 'Age Group Match', category: 'Fit' },
  { value: 'schedule-fit', label: 'Schedule Availability Fit', category: 'Timing' },
  { value: 'location-proximity', label: 'Location/Transportation Verified', category: 'Access' },
  { value: 'payment-method', label: 'Payment Method Confirmed', category: 'Financial' },
  { value: 'special-needs', label: 'Special Needs Assessment (if applicable)', category: 'Fit' },
  { value: 'enrollment-capacity', label: 'Enrollment Capacity Available', category: 'Availability' },
  { value: 'start-date', label: 'Start Date Established', category: 'Timing' },
  { value: 'parent-expectations', label: 'Parent Expectations Aligned', category: 'Fit' },
  { value: 'subsidy-eligibility', label: 'Subsidy/Assistance Eligibility', category: 'Financial' },
  { value: 'tour-completed', label: 'Tour/Visit Completed', category: 'Process' },
];

export const QUALIFICATION_OPTIONS_GENERIC: SelectOption[] = [
  { value: 'budget-confirmed', label: 'Budget Confirmed', category: 'Financial' },
  { value: 'decision-maker', label: 'Decision Maker Present', category: 'Authority' },
  { value: 'timeline-urgency', label: 'Timeline Established', category: 'Timing' },
  { value: 'clear-need', label: 'Clear Need Identified', category: 'Need' },
  { value: 'service-area', label: 'Service Area Confirmed', category: 'Location' },
  { value: 'good-fit', label: 'Good Fit for Services', category: 'Fit' },
  { value: 'ready-to-start', label: 'Ready to Start', category: 'Readiness' },
];

// ============================================
// INTAKE METHOD OPTIONS BY INDUSTRY
// ============================================

export const INTAKE_OPTIONS_HOME_SERVICES: SelectOption[] = [
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

export const INTAKE_OPTIONS_HEALTHCARE: SelectOption[] = [
  { value: 'patient-portal', label: 'Patient Portal/Online Intake', category: 'Digital' },
  { value: 'phone-inbound', label: 'Phone Calls (inbound)', category: 'Phone' },
  { value: 'phone-scheduling', label: 'Phone Scheduling (staff calls)', category: 'Phone' },
  { value: 'online-booking', label: 'Online Appointment Booking', category: 'Digital' },
  { value: 'email-intake', label: 'Email Intake', category: 'Digital' },
  { value: 'referral-fax', label: 'Referral Fax/Electronic', category: 'Referral' },
  { value: 'walk-in', label: 'Walk-In', category: 'In-Person' },
  { value: 'telehealth-request', label: 'Telehealth Request', category: 'Digital' },
  { value: 'text-sms', label: 'Text/SMS', category: 'Digital' },
  { value: 'insurance-portal', label: 'Insurance Portal Referral', category: 'Referral' },
];

export const INTAKE_OPTIONS_PROFESSIONAL: SelectOption[] = [
  { value: 'discovery-call', label: 'Discovery Call Request', category: 'Digital' },
  { value: 'contact-form', label: 'Contact Form', category: 'Digital' },
  { value: 'email-inquiry', label: 'Email Inquiry', category: 'Digital' },
  { value: 'phone-inbound', label: 'Phone Calls (inbound)', category: 'Phone' },
  { value: 'linkedin-message', label: 'LinkedIn Message', category: 'Digital' },
  { value: 'calendar-booking', label: 'Calendar/Scheduling Link', category: 'Digital' },
  { value: 'live-chat', label: 'Live Chat/Chatbot', category: 'Digital' },
  { value: 'referral-intro', label: 'Referral Introduction', category: 'Referral' },
  { value: 'event-follow-up', label: 'Event/Webinar Follow-Up', category: 'Events' },
];

export const INTAKE_OPTIONS_CHILDCARE: SelectOption[] = [
  { value: 'tour-request', label: 'Tour/Visit Request', category: 'Digital' },
  { value: 'enrollment-form', label: 'Enrollment Form', category: 'Digital' },
  { value: 'phone-inbound', label: 'Phone Calls (inbound)', category: 'Phone' },
  { value: 'email-inquiry', label: 'Email Inquiry', category: 'Digital' },
  { value: 'walk-in', label: 'Walk-In Visit', category: 'In-Person' },
  { value: 'referral', label: 'Referral from Parent/School', category: 'Referral' },
  { value: 'open-house', label: 'Open House Registration', category: 'Events' },
  { value: 'waitlist-form', label: 'Waitlist Form', category: 'Digital' },
];

export const INTAKE_OPTIONS_GENERIC: SelectOption[] = [
  { value: 'lead-forms', label: 'Lead Forms (website)', category: 'Digital' },
  { value: 'phone-inbound', label: 'Phone Calls (inbound)', category: 'Phone' },
  { value: 'phone-outbound', label: 'Phone Calls (outbound)', category: 'Phone' },
  { value: 'text-sms', label: 'Text/SMS', category: 'Digital' },
  { value: 'email', label: 'Email', category: 'Digital' },
  { value: 'live-chat', label: 'Live Chat/Chatbot', category: 'Digital' },
  { value: 'in-person', label: 'In-Person', category: 'In-Person' },
  { value: 'social-dm', label: 'Social Media DM', category: 'Digital' },
  { value: 'booking-calendar', label: 'Booking/Calendar Link', category: 'Digital' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get lead source options based on industry
 */
export function getLeadSourceOptionsForIndustry(industry?: Industry | string): SelectOption[] {
  switch (industry) {
    case 'home-services':
    case 'roofing':
    case 'pest-control':
    case 'hvac':
    case 'plumbing':
    case 'landscaping':
    case 'cleaning':
    case 'other-service':
      return LEAD_SOURCE_OPTIONS_HOME_SERVICES;
    case 'healthcare-wellness':
      return LEAD_SOURCE_OPTIONS_HEALTHCARE;
    case 'professional-services':
      return LEAD_SOURCE_OPTIONS_PROFESSIONAL;
    case 'childcare-education':
      return LEAD_SOURCE_OPTIONS_CHILDCARE;
    case 'transportation-logistics':
    case 'automotive':
    case 'personal-services':
    case 'custom':
    default:
      return LEAD_SOURCE_OPTIONS_GENERIC;
  }
}

/**
 * Get qualification options based on industry
 */
export function getQualificationOptionsForIndustry(industry?: Industry | string): SelectOption[] {
  switch (industry) {
    case 'home-services':
    case 'roofing':
    case 'pest-control':
    case 'hvac':
    case 'plumbing':
    case 'landscaping':
    case 'cleaning':
    case 'other-service':
      return QUALIFICATION_OPTIONS_HOME_SERVICES;
    case 'healthcare-wellness':
      return QUALIFICATION_OPTIONS_HEALTHCARE;
    case 'professional-services':
      return QUALIFICATION_OPTIONS_PROFESSIONAL;
    case 'childcare-education':
      return QUALIFICATION_OPTIONS_CHILDCARE;
    case 'transportation-logistics':
    case 'automotive':
    case 'personal-services':
    case 'custom':
    default:
      return QUALIFICATION_OPTIONS_GENERIC;
  }
}

/**
 * Get intake method options based on industry
 */
export function getIntakeOptionsForIndustry(industry?: Industry | string): SelectOption[] {
  switch (industry) {
    case 'home-services':
    case 'roofing':
    case 'pest-control':
    case 'hvac':
    case 'plumbing':
    case 'landscaping':
    case 'cleaning':
    case 'other-service':
      return INTAKE_OPTIONS_HOME_SERVICES;
    case 'healthcare-wellness':
      return INTAKE_OPTIONS_HEALTHCARE;
    case 'professional-services':
      return INTAKE_OPTIONS_PROFESSIONAL;
    case 'childcare-education':
      return INTAKE_OPTIONS_CHILDCARE;
    case 'transportation-logistics':
    case 'automotive':
    case 'personal-services':
    case 'custom':
    default:
      return INTAKE_OPTIONS_GENERIC;
  }
}

/**
 * Get all options resolved for a specific industry
 */
export function getIndustryOptions(industry?: Industry | string) {
  return {
    leadSources: getLeadSourceOptionsForIndustry(industry),
    qualificationCriteria: getQualificationOptionsForIndustry(industry),
    intakeMethods: getIntakeOptionsForIndustry(industry),
    conversionEvents: getConversionOptionsForIndustry(industry),
  };
}

// ============================================
// CONVERSION EVENT OPTIONS BY INDUSTRY
// ============================================

export const CONVERSION_OPTIONS_HOME_SERVICES: SelectOption[] = [
  { value: 'on-site-estimate', label: 'On-Site Estimate', category: 'In-Person' },
  { value: 'home-visit', label: 'Home Visit/Assessment', category: 'In-Person' },
  { value: 'product-demo', label: 'Product/Service Demo', category: 'In-Person' },
  { value: 'virtual-estimate', label: 'Virtual Estimate (Video Call)', category: 'Virtual' },
  { value: 'phone-quote', label: 'Phone Quote', category: 'Virtual' },
  { value: 'inspection', label: 'Inspection/Walk-Through', category: 'In-Person' },
  { value: 'consultation', label: 'Consultation Call', category: 'Virtual' },
];

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

export const CONVERSION_OPTIONS_PROFESSIONAL: SelectOption[] = [
  { value: 'discovery-call', label: 'Discovery Call', category: 'Virtual' },
  { value: 'strategy-session', label: 'Strategy Session', category: 'Virtual' },
  { value: 'proposal-presentation', label: 'Proposal Presentation', category: 'Virtual' },
  { value: 'demo', label: 'Product/Service Demo', category: 'Virtual' },
  { value: 'needs-assessment', label: 'Needs Assessment', category: 'Virtual' },
  { value: 'audit-review', label: 'Audit/Review Meeting', category: 'In-Person' },
  { value: 'scoping-call', label: 'Scoping Call', category: 'Virtual' },
];

export const CONVERSION_OPTIONS_CHILDCARE: SelectOption[] = [
  { value: 'facility-tour', label: 'Facility Tour', category: 'In-Person' },
  { value: 'meet-teachers', label: 'Meet the Teachers', category: 'In-Person' },
  { value: 'enrollment-meeting', label: 'Enrollment Meeting', category: 'In-Person' },
  { value: 'trial-day', label: 'Trial Day/Visit', category: 'In-Person' },
  { value: 'parent-interview', label: 'Parent Interview', category: 'In-Person' },
  { value: 'open-house', label: 'Open House Event', category: 'In-Person' },
  { value: 'virtual-tour', label: 'Virtual Tour', category: 'Virtual' },
];

export const CONVERSION_OPTIONS_GENERIC: SelectOption[] = [
  { value: 'consultation', label: 'Consultation Call', category: 'Virtual' },
  { value: 'demo', label: 'Product/Service Demo', category: 'Virtual' },
  { value: 'discovery-call', label: 'Discovery Call', category: 'Virtual' },
  { value: 'in-person-meeting', label: 'In-Person Meeting', category: 'In-Person' },
  { value: 'proposal', label: 'Proposal Review', category: 'Virtual' },
  { value: 'trial', label: 'Trial/Pilot', category: 'In-Person' },
];

/**
 * Get conversion event options based on industry
 */
export function getConversionOptionsForIndustry(industry?: Industry | string): SelectOption[] {
  switch (industry) {
    case 'home-services':
    case 'roofing':
    case 'pest-control':
    case 'hvac':
    case 'plumbing':
    case 'landscaping':
    case 'cleaning':
    case 'other-service':
      return CONVERSION_OPTIONS_HOME_SERVICES;
    case 'healthcare-wellness':
      return CONVERSION_OPTIONS_HEALTHCARE;
    case 'professional-services':
      return CONVERSION_OPTIONS_PROFESSIONAL;
    case 'childcare-education':
      return CONVERSION_OPTIONS_CHILDCARE;
    case 'transportation-logistics':
    case 'automotive':
    case 'personal-services':
    case 'custom':
    default:
      return CONVERSION_OPTIONS_GENERIC;
  }
}
