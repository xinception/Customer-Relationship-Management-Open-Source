// ---------------------------------------------------------------------------
// Contact statuses
// ---------------------------------------------------------------------------
const CONTACT_STATUSES = {
  LEAD: 'lead',
  PROSPECT: 'prospect',
  CUSTOMER: 'customer',
  CHURNED: 'churned',
};

// ---------------------------------------------------------------------------
// Campaign types & statuses
// ---------------------------------------------------------------------------
const CAMPAIGN_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  SOCIAL: 'social',
  MULTI_CHANNEL: 'multi-channel',
};

const CAMPAIGN_STATUSES = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
};

// ---------------------------------------------------------------------------
// Event types tracked by the CDP
// ---------------------------------------------------------------------------
const EVENT_TYPES = {
  PAGE_VIEW: 'page_view',
  EMAIL_OPEN: 'email_open',
  EMAIL_CLICK: 'email_click',
  FORM_SUBMIT: 'form_submit',
  PURCHASE: 'purchase',
  LOGIN: 'login',
  SIGNUP: 'signup',
  PRODUCT_VIEW: 'product_view',
  ADD_TO_CART: 'add_to_cart',
  CHECKOUT: 'checkout',
  CAMPAIGN_INTERACTION: 'campaign_interaction',
  SUPPORT_TICKET: 'support_ticket',
  CUSTOM: 'custom',
};

// ---------------------------------------------------------------------------
// Automation workflow step types
// ---------------------------------------------------------------------------
const AUTOMATION_STEP_TYPES = {
  SEND_EMAIL: 'send_email',
  SEND_SMS: 'send_sms',
  WAIT: 'wait',
  CONDITION: 'condition',
  SPLIT: 'split',
  UPDATE_CONTACT: 'update_contact',
  ADD_TAG: 'add_tag',
  REMOVE_TAG: 'remove_tag',
  WEBHOOK: 'webhook',
  AI_DECISION: 'ai_decision',
  SCORE_LEAD: 'score_lead',
  ASSIGN_OWNER: 'assign_owner',
  CREATE_DEAL: 'create_deal',
  MOVE_STAGE: 'move_stage',
};

// ---------------------------------------------------------------------------
// AI scoring ranges
// ---------------------------------------------------------------------------
const SCORE_RANGES = {
  COLD:    { min: 0,  max: 20,  label: 'Cold' },
  WARM:    { min: 21, max: 40,  label: 'Warm' },
  HOT:     { min: 41, max: 60,  label: 'Hot' },
  VERY_HOT:{ min: 61, max: 80,  label: 'Very Hot' },
  ON_FIRE: { min: 81, max: 100, label: 'On Fire' },
};

// ---------------------------------------------------------------------------
// Churn risk levels
// ---------------------------------------------------------------------------
const CHURN_RISK_LEVELS = {
  LOW:      { min: 0,  max: 25,  label: 'Low Risk',      color: '#22c55e' },
  MODERATE: { min: 26, max: 50,  label: 'Moderate Risk',  color: '#eab308' },
  HIGH:     { min: 51, max: 75,  label: 'High Risk',      color: '#f97316' },
  CRITICAL: { min: 76, max: 100, label: 'Critical Risk',  color: '#ef4444' },
};

// ---------------------------------------------------------------------------
// Contact lifecycle stages
// ---------------------------------------------------------------------------
const LIFECYCLE_STAGES = {
  SUBSCRIBER: 'subscriber',
  LEAD: 'lead',
  MQL: 'mql',
  SQL: 'sql',
  OPPORTUNITY: 'opportunity',
  CUSTOMER: 'customer',
  EVANGELIST: 'evangelist',
};

// ---------------------------------------------------------------------------
// Built-in email template identifiers
// ---------------------------------------------------------------------------
const EMAIL_TEMPLATES = {
  WELCOME: {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to {{companyName}}!',
    description: 'Sent to new subscribers immediately after sign-up.',
  },
  ONBOARDING: {
    id: 'onboarding',
    name: 'Onboarding Series',
    subject: 'Getting started with {{companyName}}',
    description: 'Multi-step onboarding drip campaign.',
  },
  NEWSLETTER: {
    id: 'newsletter',
    name: 'Monthly Newsletter',
    subject: '{{companyName}} Monthly Update - {{month}}',
    description: 'Recurring monthly newsletter template.',
  },
  PROMOTION: {
    id: 'promotion',
    name: 'Promotional Offer',
    subject: 'Exclusive offer just for you, {{firstName}}!',
    description: 'Time-limited promotional campaign.',
  },
  RE_ENGAGEMENT: {
    id: 're_engagement',
    name: 'Re-engagement',
    subject: 'We miss you, {{firstName}}!',
    description: 'Win-back campaign for inactive contacts.',
  },
  ABANDONED_CART: {
    id: 'abandoned_cart',
    name: 'Abandoned Cart',
    subject: 'You left something behind!',
    description: 'Triggered when a contact abandons their shopping cart.',
  },
  FEEDBACK_REQUEST: {
    id: 'feedback_request',
    name: 'Feedback Request',
    subject: 'How was your experience with {{companyName}}?',
    description: 'Post-purchase or post-interaction feedback survey.',
  },
  EVENT_INVITATION: {
    id: 'event_invitation',
    name: 'Event Invitation',
    subject: 'You\'re invited: {{eventName}}',
    description: 'Invitation to webinars, conferences, or product launches.',
  },
};

module.exports = {
  CONTACT_STATUSES,
  CAMPAIGN_TYPES,
  CAMPAIGN_STATUSES,
  EVENT_TYPES,
  AUTOMATION_STEP_TYPES,
  SCORE_RANGES,
  CHURN_RISK_LEVELS,
  LIFECYCLE_STAGES,
  EMAIL_TEMPLATES,
};
