'use strict';

/**
 * Database Seed Script
 *
 * Populates the database with realistic sample data for development and demos.
 *
 * Usage:
 *   cd backend && node seed.js
 *
 * Set MONGODB_URI in .env or it defaults to mongodb://localhost:27017/ai_crm
 */

const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
// Also try local .env
require('dotenv').config();

const Contact = require('./models/Contact');
const Campaign = require('./models/Campaign');
const Segment = require('./models/Segment');
const Automation = require('./models/Automation');
const Event = require('./models/Event');
const User = require('./models/User');

// ── Realistic data pools ────────────────────────────────────────────────────

const FIRST_NAMES = [
  'James', 'Mary', 'Robert', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth',
  'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah',
  'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty',
  'Anthony', 'Margaret', 'Mark', 'Sandra', 'Steven', 'Ashley', 'Paul', 'Dorothy',
  'Andrew', 'Kimberly', 'Joshua', 'Emily', 'Kenneth', 'Donna', 'Kevin', 'Michelle',
  'Brian', 'Carol', 'George', 'Amanda', 'Timothy', 'Melissa', 'Ronald', 'Deborah',
  'Edward', 'Stephanie'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts'
];

const COMPANIES = [
  'Acme Corp', 'Globex Industries', 'Initech Solutions', 'Hooli Technologies',
  'Pied Piper Inc', 'Stark Industries', 'Wayne Enterprises', 'Umbrella Corp',
  'Cyberdyne Systems', 'Soylent Corp', 'Massive Dynamic', 'Aperture Science',
  'Wonka Industries', 'Sterling Cooper', 'Dunder Mifflin', 'Prestige Worldwide',
  'TechNova Solutions', 'BrightPath Analytics', 'Quantum Leap Software',
  'NexGen Digital', 'CloudScale Inc', 'DataForge Systems', 'Pinnacle Labs',
  'Horizon Ventures', 'Atlas Engineering', 'Vertex AI'
];

const JOB_TITLES = [
  'CEO', 'CTO', 'VP of Marketing', 'VP of Sales', 'Director of Engineering',
  'Product Manager', 'Marketing Manager', 'Sales Representative', 'Software Engineer',
  'Data Analyst', 'Operations Manager', 'Account Executive', 'Business Analyst',
  'UX Designer', 'DevOps Engineer', 'Customer Success Manager', 'CFO',
  'Head of Growth', 'Content Strategist', 'Solutions Architect'
];

const CITIES = [
  { city: 'New York', state: 'NY', country: 'US', zipCode: '10001' },
  { city: 'San Francisco', state: 'CA', country: 'US', zipCode: '94105' },
  { city: 'Austin', state: 'TX', country: 'US', zipCode: '73301' },
  { city: 'Chicago', state: 'IL', country: 'US', zipCode: '60601' },
  { city: 'Seattle', state: 'WA', country: 'US', zipCode: '98101' },
  { city: 'Boston', state: 'MA', country: 'US', zipCode: '02101' },
  { city: 'Denver', state: 'CO', country: 'US', zipCode: '80201' },
  { city: 'London', state: '', country: 'UK', zipCode: 'EC1A 1BB' },
  { city: 'Toronto', state: 'ON', country: 'CA', zipCode: 'M5H 2N2' },
  { city: 'Berlin', state: '', country: 'DE', zipCode: '10115' },
  { city: 'Sydney', state: 'NSW', country: 'AU', zipCode: '2000' },
  { city: 'Singapore', state: '', country: 'SG', zipCode: '048583' }
];

const SOURCES = ['website', 'referral', 'social', 'email', 'ads', 'organic', 'direct', 'import'];
const STATUSES = ['lead', 'prospect', 'customer', 'churned'];
const LIFECYCLES = ['subscriber', 'lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist'];
const TAGS_POOL = [
  'enterprise', 'startup', 'saas', 'ecommerce', 'fintech', 'healthcare',
  'education', 'hot-lead', 'cold-lead', 'trial-user', 'power-user',
  'decision-maker', 'influencer', 'champion', 'vip', 'at-risk',
  'webinar-attendee', 'demo-requested', 'free-tier', 'paid-plan'
];

const EVENT_TYPES = [
  'page_view', 'click', 'purchase', 'email_open', 'email_click',
  'form_submit', 'login', 'signup', 'product_view', 'add_to_cart',
  'search', 'campaign_interaction'
];

const EVENT_NAMES = {
  page_view: ['Viewed Homepage', 'Viewed Pricing', 'Viewed Features', 'Viewed Blog Post', 'Viewed Docs'],
  click: ['Clicked CTA', 'Clicked Nav Link', 'Clicked Banner', 'Clicked Social Share'],
  purchase: ['Completed Purchase', 'Upgraded Plan', 'Renewed Subscription'],
  email_open: ['Opened Newsletter', 'Opened Welcome Email', 'Opened Promo Email'],
  email_click: ['Clicked Newsletter Link', 'Clicked Promo Link', 'Clicked Survey Link'],
  form_submit: ['Submitted Contact Form', 'Submitted Demo Request', 'Submitted Survey'],
  login: ['User Login'],
  signup: ['User Signup', 'Trial Signup'],
  product_view: ['Viewed Product Page', 'Viewed Feature Detail', 'Viewed Integration'],
  add_to_cart: ['Added Pro Plan', 'Added Enterprise Plan', 'Added Add-on'],
  search: ['Searched Documentation', 'Searched Knowledge Base', 'Searched Products'],
  campaign_interaction: ['Clicked Campaign Link', 'Viewed Campaign Landing Page']
};

const PAGES = [
  '/home', '/pricing', '/features', '/blog', '/docs', '/about',
  '/contact', '/demo', '/signup', '/login', '/dashboard', '/products',
  '/integrations', '/api-docs', '/changelog', '/careers'
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, min, max) {
  const n = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(startDays, endDays) {
  const now = Date.now();
  const start = now - startDays * 86400000;
  const end = now - endDays * 86400000;
  return new Date(start + Math.random() * (end - start));
}

function emailFromName(first, last, company) {
  const domain = company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
  return `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`;
}

// ── Seed functions ───────────────────────────────────────────────────────────

async function seedUsers() {
  console.log('  Seeding users...');
  const user = await User.create({
    name: 'Admin User',
    email: 'admin@crm.io',
    password: 'Admin123!@#',
    role: 'admin',
    isActive: true,
    lastLogin: new Date()
  });
  console.log(`    Created admin user: admin@crm.io`);
  return user;
}

async function seedContacts(ownerId) {
  console.log('  Seeding contacts...');
  const contacts = [];

  for (let i = 0; i < 50; i++) {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const company = pick(COMPANIES);
    const location = pick(CITIES);
    const status = pick(STATUSES);
    const lifecycle = pick(LIFECYCLES);
    const aiScore = randInt(5, 98);
    const churnRisk = status === 'churned' ? randInt(70, 100) : randInt(0, 60);

    contacts.push({
      firstName,
      lastName,
      email: emailFromName(firstName, lastName, company) + (i > 0 ? i : ''),
      phone: `+1${randInt(200, 999)}${randInt(100, 999)}${randInt(1000, 9999)}`,
      company,
      jobTitle: pick(JOB_TITLES),
      address: {
        city: location.city,
        state: location.state,
        country: location.country,
        zipCode: location.zipCode
      },
      social: {
        linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${randInt(1000, 9999)}`,
        twitter: Math.random() > 0.4 ? `@${firstName.toLowerCase()}${lastName.toLowerCase().substring(0, 3)}` : undefined
      },
      status,
      source: pick(SOURCES),
      tags: pickN(TAGS_POOL, 1, 4),
      lifecycleStage: lifecycle,
      aiScore,
      churnRisk,
      predictedLTV: randFloat(500, 50000),
      sentimentScore: randFloat(-0.5, 1.0),
      emailEngagementScore: randInt(10, 95),
      subscribed: Math.random() > 0.1,
      emailOptIn: Math.random() > 0.3,
      smsOptIn: Math.random() > 0.7,
      firstSeen: randomDate(365, 30),
      lastSeen: randomDate(30, 0),
      totalEvents: randInt(5, 200),
      dealValue: status === 'customer' ? randFloat(1000, 100000) : randFloat(0, 20000),
      wonDeals: status === 'customer' ? randInt(1, 5) : 0,
      lostDeals: randInt(0, 3),
      nextBestAction: pick([
        'Send case study', 'Schedule demo', 'Offer discount', 'Send whitepaper',
        'Invite to webinar', 'Follow up call', 'Renewal reminder', null
      ]),
      owner: ownerId
    });
  }

  const created = await Contact.insertMany(contacts);
  console.log(`    Created ${created.length} contacts`);
  return created;
}

async function seedCampaigns(userId, segmentIds) {
  console.log('  Seeding campaigns...');

  const campaignData = [
    {
      name: 'Spring Product Launch',
      description: 'Announce our new AI-powered features to existing customers',
      type: 'email',
      status: 'completed',
      content: { subject: 'Introducing AI-Powered CRM Features', htmlBody: '<h1>New Features</h1>', textBody: 'New features available' },
      metrics: { sent: 2500, delivered: 2430, opened: 850, clicked: 210, bounced: 70, unsubscribed: 12, converted: 45, revenue: 15000 },
      budget: 500, actualSpend: 480, tags: ['product-launch', 'email']
    },
    {
      name: 'Customer Onboarding Drip',
      description: 'Welcome sequence for new signups with best practices',
      type: 'email',
      status: 'active',
      content: { subject: 'Welcome to AI CRM - Get Started', htmlBody: '<h1>Welcome!</h1>', textBody: 'Welcome to AI CRM' },
      metrics: { sent: 1200, delivered: 1180, opened: 620, clicked: 180, bounced: 20, unsubscribed: 5, converted: 95, revenue: 8500 },
      budget: 200, actualSpend: 150, tags: ['onboarding', 'drip']
    },
    {
      name: 'Re-engagement Campaign',
      description: 'Win back inactive users who have not logged in for 30+ days',
      type: 'email',
      status: 'active',
      content: { subject: 'We miss you! Here is what is new', htmlBody: '<h1>Come Back</h1>', textBody: 'We miss you' },
      metrics: { sent: 800, delivered: 775, opened: 195, clicked: 48, bounced: 25, unsubscribed: 18, converted: 12, revenue: 2400 },
      budget: 300, actualSpend: 280, tags: ['re-engagement', 'win-back']
    },
    {
      name: 'Enterprise Webinar Series',
      description: 'Monthly webinar targeting enterprise decision-makers',
      type: 'multi-channel',
      status: 'scheduled',
      content: { subject: 'Join Our Enterprise Webinar', htmlBody: '<h1>Webinar Invite</h1>', textBody: 'Join our webinar' },
      schedule: { scheduledAt: new Date(Date.now() + 7 * 86400000), timezone: 'America/New_York', frequency: 'monthly' },
      metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, converted: 0, revenue: 0 },
      budget: 1000, tags: ['webinar', 'enterprise']
    },
    {
      name: 'Holiday Season Promo',
      description: 'End of year discount campaign for upgrades',
      type: 'email',
      status: 'completed',
      content: { subject: '25% Off Annual Plans - Limited Time', htmlBody: '<h1>Holiday Sale</h1>', textBody: '25% off' },
      metrics: { sent: 5000, delivered: 4850, opened: 1940, clicked: 580, bounced: 150, unsubscribed: 35, converted: 120, revenue: 48000 },
      budget: 800, actualSpend: 750, roi: 6300, tags: ['promo', 'seasonal']
    },
    {
      name: 'NPS Survey Campaign',
      description: 'Quarterly NPS survey to measure customer satisfaction',
      type: 'email',
      status: 'completed',
      content: { subject: 'How are we doing? Quick 2-min survey', htmlBody: '<h1>Survey</h1>', textBody: 'Take our survey' },
      metrics: { sent: 3000, delivered: 2920, opened: 1050, clicked: 420, bounced: 80, unsubscribed: 8, converted: 380, revenue: 0 },
      budget: 100, actualSpend: 95, tags: ['survey', 'nps']
    },
    {
      name: 'Partner Referral Program',
      description: 'Promote referral bonuses to existing partners and customers',
      type: 'email',
      status: 'active',
      content: { subject: 'Earn $100 for Every Referral', htmlBody: '<h1>Referral Program</h1>', textBody: 'Refer and earn' },
      metrics: { sent: 600, delivered: 585, opened: 234, clicked: 78, bounced: 15, unsubscribed: 3, converted: 22, revenue: 6600 },
      budget: 2000, actualSpend: 1200, tags: ['referral', 'partner']
    },
    {
      name: 'Product Tips Weekly Digest',
      description: 'Weekly tips and tricks to help users get more from the platform',
      type: 'email',
      status: 'active',
      content: { subject: 'This Week in AI CRM - Tips & Tricks', htmlBody: '<h1>Weekly Tips</h1>', textBody: 'Weekly tips' },
      schedule: { frequency: 'weekly' },
      metrics: { sent: 4200, delivered: 4100, opened: 1845, clicked: 615, bounced: 100, unsubscribed: 20, converted: 55, revenue: 3200 },
      budget: 50, actualSpend: 45, tags: ['newsletter', 'weekly']
    },
    {
      name: 'Competitive Switch Offer',
      description: 'Special migration pricing for users of competing platforms',
      type: 'email',
      status: 'draft',
      content: { subject: 'Switch to AI CRM - 50% Off First Year', htmlBody: '<h1>Switch Offer</h1>', textBody: 'Switch and save' },
      metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, converted: 0, revenue: 0 },
      budget: 1500, tags: ['competitive', 'acquisition']
    },
    {
      name: 'Annual User Conference Invite',
      description: 'Invitation to our annual user conference and networking event',
      type: 'multi-channel',
      status: 'scheduled',
      content: { subject: 'You are Invited: CRM Connect 2026', htmlBody: '<h1>Conference</h1>', textBody: 'Join CRM Connect 2026' },
      schedule: { scheduledAt: new Date(Date.now() + 30 * 86400000), timezone: 'America/Los_Angeles' },
      metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, converted: 0, revenue: 0 },
      budget: 5000, tags: ['event', 'conference']
    }
  ];

  const campaigns = campaignData.map((c, i) => ({
    ...c,
    segment: segmentIds[i % segmentIds.length] || undefined,
    createdBy: userId
  }));

  const created = await Campaign.insertMany(campaigns);
  console.log(`    Created ${created.length} campaigns`);
  return created;
}

async function seedSegments(userId) {
  console.log('  Seeding segments...');

  const segmentData = [
    {
      name: 'High-Value Customers',
      description: 'Customers with deal value over $10,000 and high engagement',
      type: 'dynamic',
      rules: { conditions: [{ field: 'dealValue', operator: 'gte', value: 10000 }, { field: 'status', operator: 'equals', value: 'customer' }], logic: 'and' },
      contactCount: 12, tags: ['high-value']
    },
    {
      name: 'At-Risk Accounts',
      description: 'Contacts with churn risk above 60%',
      type: 'ai-predicted',
      rules: { conditions: [{ field: 'churnRisk', operator: 'gt', value: 60 }], logic: 'and' },
      aiCriteria: { model: 'churn-prediction-v2', threshold: 0.6, features: ['lastSeen', 'totalEvents', 'emailEngagementScore'], accuracy: 0.87 },
      contactCount: 8, tags: ['at-risk', 'ai']
    },
    {
      name: 'Enterprise Leads',
      description: 'Decision-makers at companies with 200+ employees',
      type: 'dynamic',
      rules: { conditions: [{ field: 'tags', operator: 'contains', value: 'enterprise' }, { field: 'tags', operator: 'contains', value: 'decision-maker' }], logic: 'or' },
      contactCount: 15, tags: ['enterprise', 'leads']
    },
    {
      name: 'Marketing Qualified Leads',
      description: 'Leads with AI score above 70 in MQL lifecycle stage',
      type: 'dynamic',
      rules: { conditions: [{ field: 'aiScore', operator: 'gte', value: 70 }, { field: 'lifecycleStage', operator: 'equals', value: 'mql' }], logic: 'and' },
      contactCount: 10, tags: ['mql']
    },
    {
      name: 'Newsletter Subscribers',
      description: 'All contacts who have opted in to email communications',
      type: 'dynamic',
      rules: { conditions: [{ field: 'emailOptIn', operator: 'equals', value: true }, { field: 'subscribed', operator: 'equals', value: true }], logic: 'and' },
      contactCount: 35, tags: ['newsletter']
    },
    {
      name: 'Recent Signups (30d)',
      description: 'Contacts created in the last 30 days',
      type: 'dynamic',
      rules: { conditions: [{ field: 'firstSeen', operator: 'gte', value: new Date(Date.now() - 30 * 86400000).toISOString() }], logic: 'and' },
      contactCount: 18, tags: ['new-users']
    },
    {
      name: 'Inactive Users',
      description: 'Users who have not been seen in over 60 days',
      type: 'dynamic',
      rules: { conditions: [{ field: 'lastSeen', operator: 'lte', value: new Date(Date.now() - 60 * 86400000).toISOString() }], logic: 'and' },
      contactCount: 6, tags: ['inactive', 'win-back']
    },
    {
      name: 'Top Engagers',
      description: 'Contacts with email engagement score above 80',
      type: 'ai-predicted',
      rules: { conditions: [{ field: 'emailEngagementScore', operator: 'gte', value: 80 }], logic: 'and' },
      aiCriteria: { model: 'engagement-scoring-v1', threshold: 0.8, features: ['emailEngagementScore', 'totalEvents', 'lastEmailClicked'], accuracy: 0.91 },
      contactCount: 14, tags: ['engaged', 'ai']
    }
  ];

  const segments = segmentData.map(s => ({
    ...s,
    autoUpdate: true,
    lastUpdated: new Date(),
    createdBy: userId
  }));

  const created = await Segment.insertMany(segments);
  console.log(`    Created ${created.length} segments`);
  return created;
}

async function seedAutomations(userId, segmentIds) {
  console.log('  Seeding automations...');

  const automationData = [
    {
      name: 'Welcome Email Sequence',
      description: 'Send a 3-part welcome series to new signups',
      status: 'active',
      trigger: { type: 'event', config: { eventType: 'signup' } },
      steps: [
        { id: 'step_1', type: 'email', config: { template: 'welcome-1', subject: 'Welcome to AI CRM!' }, nextSteps: ['step_2'] },
        { id: 'step_2', type: 'wait', config: { duration: 2, unit: 'days' }, nextSteps: ['step_3'] },
        { id: 'step_3', type: 'email', config: { template: 'welcome-2', subject: 'Getting started with your CRM' }, nextSteps: ['step_4'] },
        { id: 'step_4', type: 'wait', config: { duration: 3, unit: 'days' }, nextSteps: ['step_5'] },
        { id: 'step_5', type: 'email', config: { template: 'welcome-3', subject: 'Pro tips for your first week' }, nextSteps: [] }
      ],
      metrics: { entered: 320, completed: 280, active: 25, converted: 85, errors: 3 },
      aiPowered: false, tags: ['welcome', 'onboarding']
    },
    {
      name: 'Lead Scoring & Qualification',
      description: 'Automatically score and route leads based on engagement',
      status: 'active',
      trigger: { type: 'score_change', config: { threshold: 70 } },
      steps: [
        { id: 'step_1', type: 'ai_decision', config: { decisionType: 'score_based', threshold: 70 }, nextSteps: ['step_2', 'step_4'] },
        { id: 'step_2', type: 'add_tag', config: { tags: ['mql', 'hot-lead'] }, nextSteps: ['step_3'] },
        { id: 'step_3', type: 'email', config: { template: 'hot-lead-notify', subject: 'New qualified lead!' }, nextSteps: [] },
        { id: 'step_4', type: 'email', config: { template: 'nurture-1', subject: 'Resources to help you decide' }, nextSteps: [] }
      ],
      metrics: { entered: 150, completed: 142, active: 8, converted: 38, errors: 0 },
      aiPowered: true, aiModel: 'lead-scoring-v2', tags: ['scoring', 'ai']
    },
    {
      name: 'Churn Prevention',
      description: 'Engage at-risk customers before they churn',
      status: 'active',
      trigger: { type: 'segment_enter', config: { segmentName: 'At-Risk Accounts' } },
      steps: [
        { id: 'step_1', type: 'email', config: { template: 'churn-check-in', subject: 'We noticed you have been away' }, nextSteps: ['step_2'] },
        { id: 'step_2', type: 'wait', config: { duration: 3, unit: 'days' }, nextSteps: ['step_3'] },
        { id: 'step_3', type: 'condition', config: { field: 'lastSeen', operator: 'after', value: new Date(Date.now() - 3 * 86400000).toISOString() }, nextSteps: ['step_5', 'step_4'] },
        { id: 'step_4', type: 'email', config: { template: 'churn-offer', subject: 'A special offer just for you' }, nextSteps: ['step_5'] },
        { id: 'step_5', type: 'add_tag', config: { tags: ['churn-prevention-contacted'] }, nextSteps: [] }
      ],
      metrics: { entered: 45, completed: 38, active: 7, converted: 12, errors: 0 },
      aiPowered: true, aiModel: 'churn-prediction-v2', tags: ['churn', 'retention', 'ai']
    },
    {
      name: 'Post-Purchase Follow-up',
      description: 'Thank customers after purchase and request a review',
      status: 'active',
      trigger: { type: 'event', config: { eventType: 'purchase' } },
      steps: [
        { id: 'step_1', type: 'email', config: { template: 'purchase-thanks', subject: 'Thank you for your purchase!' }, nextSteps: ['step_2'] },
        { id: 'step_2', type: 'wait', config: { duration: 7, unit: 'days' }, nextSteps: ['step_3'] },
        { id: 'step_3', type: 'email', config: { template: 'review-request', subject: 'How was your experience?' }, nextSteps: ['step_4'] },
        { id: 'step_4', type: 'add_tag', config: { tags: ['review-requested'] }, nextSteps: [] }
      ],
      metrics: { entered: 200, completed: 190, active: 10, converted: 65, errors: 1 },
      aiPowered: false, tags: ['post-purchase', 'reviews']
    },
    {
      name: 'Enterprise Demo Booking',
      description: 'Nurture enterprise leads toward booking a demo',
      status: 'draft',
      trigger: { type: 'segment_enter', config: { segmentName: 'Enterprise Leads' } },
      steps: [
        { id: 'step_1', type: 'email', config: { template: 'enterprise-intro', subject: 'Tailored solutions for your team' }, nextSteps: ['step_2'] },
        { id: 'step_2', type: 'wait', config: { duration: 2, unit: 'days' }, nextSteps: ['step_3'] },
        { id: 'step_3', type: 'condition', config: { field: 'tags', operator: 'contains', value: 'demo-requested' }, nextSteps: ['step_5', 'step_4'] },
        { id: 'step_4', type: 'email', config: { template: 'demo-cta', subject: 'Book a personalized demo' }, nextSteps: ['step_5'] },
        { id: 'step_5', type: 'webhook', config: { url: 'https://hooks.example.com/new-enterprise-lead', method: 'POST' }, nextSteps: [] }
      ],
      metrics: { entered: 0, completed: 0, active: 0, converted: 0, errors: 0 },
      aiPowered: false, tags: ['enterprise', 'demo']
    }
  ];

  const automations = automationData.map((a, i) => ({
    ...a,
    enrollmentRules: {
      segment: segmentIds[i % segmentIds.length] || undefined,
      reEnrollment: false,
      maxEnrollments: 1000
    },
    createdBy: userId
  }));

  const created = await Automation.insertMany(automations);
  console.log(`    Created ${created.length} automations`);
  return created;
}

async function seedEvents(contactIds, campaignIds) {
  console.log('  Seeding events...');
  const events = [];
  const eventSources = ['website', 'mobile', 'email', 'api', 'system'];

  for (let i = 0; i < 200; i++) {
    const eventType = pick(EVENT_TYPES);
    const names = EVENT_NAMES[eventType] || ['Unknown Event'];
    const page = pick(PAGES);
    const isPurchase = eventType === 'purchase';

    events.push({
      contact: pick(contactIds),
      eventType,
      eventName: pick(names),
      properties: {
        page,
        duration: randInt(5, 300),
        value: isPurchase ? randFloat(50, 5000) : undefined,
        plan: isPurchase ? pick(['starter', 'professional', 'enterprise']) : undefined
      },
      context: {
        ip: `${randInt(10, 200)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`,
        userAgent: pick([
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
          'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36'
        ]),
        page,
        referrer: pick(['https://google.com', 'https://twitter.com', 'https://linkedin.com', '', 'direct']),
        campaign: Math.random() > 0.7 ? { name: `campaign_${randInt(1, 10)}`, source: pick(['google', 'facebook', 'linkedin', 'email']), medium: pick(['cpc', 'social', 'email', 'organic']) } : undefined
      },
      source: pick(eventSources),
      sessionId: `sess_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: randomDate(90, 0),
      revenue: isPurchase ? randFloat(50, 5000) : undefined,
      currency: 'USD',
      campaign: Math.random() > 0.6 && campaignIds.length > 0 ? pick(campaignIds) : undefined
    });
  }

  const created = await Event.insertMany(events);
  console.log(`    Created ${created.length} events`);
  return created;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_crm';
  console.log(`\nConnecting to MongoDB: ${mongoUri}\n`);

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB\n');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Contact.deleteMany({}),
      Campaign.deleteMany({}),
      Segment.deleteMany({}),
      Automation.deleteMany({}),
      Event.deleteMany({})
    ]);
    console.log('  Done\n');

    console.log('Seeding database...');

    // 1. Create admin user
    const adminUser = await seedUsers();
    const userId = adminUser._id;

    // 2. Create contacts
    const contacts = await seedContacts(userId);
    const contactIds = contacts.map(c => c._id);

    // 3. Create segments
    const segments = await seedSegments(userId);
    const segmentIds = segments.map(s => s._id);

    // 4. Create campaigns (references segments)
    const campaigns = await seedCampaigns(userId, segmentIds);
    const campaignIds = campaigns.map(c => c._id);

    // 5. Create automations (references segments)
    await seedAutomations(userId, segmentIds);

    // 6. Create events (references contacts and campaigns)
    await seedEvents(contactIds, campaignIds);

    console.log('\nSeed completed successfully!');
    console.log('─'.repeat(40));
    console.log(`  Users:       1`);
    console.log(`  Contacts:    ${contacts.length}`);
    console.log(`  Segments:    ${segments.length}`);
    console.log(`  Campaigns:   ${campaigns.length}`);
    console.log(`  Automations: 5`);
    console.log(`  Events:      200`);
    console.log('─'.repeat(40));
    console.log(`\nAdmin login: admin@crm.io / Admin123!@#\n`);
  } catch (err) {
    console.error('Seed failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
