'use strict';

/**
 * Recommendation Engine
 *
 * Next-best-action suggestions, campaign recommendations, send-time optimization,
 * subject line variant generation, and campaign performance prediction.
 */

const scoringEngine = require('./scoringEngine');

const LIFECYCLE_ORDER = ['subscriber', 'lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist'];

const ACTION_CATALOG = {
  send_welcome: { label: 'Send Welcome Email', channel: 'email', category: 'onboarding' },
  send_nurture: { label: 'Send Nurture Email', channel: 'email', category: 'nurture' },
  send_reengagement: { label: 'Send Re-engagement Campaign', channel: 'email', category: 'reengagement' },
  schedule_call: { label: 'Schedule Sales Call', channel: 'phone', category: 'sales' },
  send_promotion: { label: 'Send Promotional Offer', channel: 'email', category: 'promotion' },
  request_review: { label: 'Request Product Review', channel: 'email', category: 'advocacy' },
  upsell_offer: { label: 'Send Upsell Recommendation', channel: 'email', category: 'upsell' },
  assign_to_sales: { label: 'Assign to Sales Rep', channel: 'internal', category: 'sales' },
  send_survey: { label: 'Send Satisfaction Survey', channel: 'email', category: 'feedback' },
  create_deal: { label: 'Create Deal', channel: 'internal', category: 'sales' },
  send_case_study: { label: 'Send Relevant Case Study', channel: 'email', category: 'nurture' }
};

const CAMPAIGN_TYPES = {
  drip_nurture: { label: 'Drip Nurture', suitableFor: ['subscriber', 'lead'] },
  product_education: { label: 'Product Education', suitableFor: ['mql', 'sql'] },
  promotional: { label: 'Promotional Offer', suitableFor: ['customer'] },
  reengagement: { label: 'Re-engagement', suitableFor: ['churned', 'inactive'] },
  upsell_cross_sell: { label: 'Upsell / Cross-sell', suitableFor: ['customer', 'evangelist'] },
  referral: { label: 'Referral Program', suitableFor: ['evangelist', 'customer'] },
  onboarding: { label: 'Onboarding Sequence', suitableFor: ['subscriber', 'lead'] },
  event_invitation: { label: 'Event Invitation', suitableFor: ['mql', 'sql', 'opportunity'] }
};

const SUBJECT_TEMPLATES = {
  urgency: [
    'Last chance: {{topic}}',
    'Don\'t miss out on {{topic}}',
    '{{topic}} - ending soon',
    'Final reminder: {{topic}}'
  ],
  question: [
    'Are you ready for {{topic}}?',
    'What if you could {{topic}}?',
    'Struggling with {{topic}}?',
    'Have you tried {{topic}}?'
  ],
  personal: [
    '{{firstName}}, check this out',
    'A quick note for you, {{firstName}}',
    '{{firstName}}, we thought of you',
    'Just for you: {{topic}}'
  ],
  benefit: [
    'How to {{topic}} in half the time',
    'The secret to {{topic}}',
    '3 ways to improve your {{topic}}',
    'Unlock better {{topic}} today'
  ],
  social_proof: [
    'See why 1,000+ teams love {{topic}}',
    'How top companies handle {{topic}}',
    'Join industry leaders in {{topic}}'
  ]
};

/**
 * Recommend the next best action for a contact.
 *
 * @param {Object} contact - Contact document
 * @param {Array} [events] - Recent events for context
 * @returns {Object} { action, priority, reasoning, alternatives }
 */
function getNextBestAction(contact, events = []) {
  if (!contact) {
    throw new Error('Contact is required');
  }

  const lifecycle = contact.lifecycle || 'subscriber';
  const lifecycleIndex = LIFECYCLE_ORDER.indexOf(lifecycle);
  const status = contact.status || 'lead';

  let scoreResult, churnResult;
  try {
    scoreResult = scoringEngine.calculateContactScore(contact, events);
    churnResult = scoringEngine.predictChurnRisk(contact, events);
  } catch (_err) {
    scoreResult = { score: contact.aiScore || 0 };
    churnResult = { risk: (contact.churnRisk || 0) / 100 };
  }

  const score = scoreResult.score;
  const churnRisk = churnResult.risk;
  const daysSinceActivity = contact.lastActivity
    ? (Date.now() - new Date(contact.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    : 999;

  const actions = [];

  // New subscriber -> welcome
  if (lifecycleIndex === 0 && daysSinceActivity < 7) {
    actions.push({ key: 'send_welcome', priority: 90, reasoning: 'New subscriber needs a welcome email to start engagement.' });
  }

  // Inactive contact -> re-engagement
  if (daysSinceActivity > 60 && status !== 'churned') {
    actions.push({ key: 'send_reengagement', priority: 85, reasoning: `No activity in ${Math.round(daysSinceActivity)} days. Re-engagement campaign needed.` });
  }

  // High score lead not yet in sales -> assign
  if (score >= 60 && lifecycleIndex <= 2) {
    actions.push({ key: 'assign_to_sales', priority: 80, reasoning: 'High engagement score suggests sales-readiness. Assign to rep.' });
  }

  // SQL/Opportunity without a deal -> create deal
  if ((lifecycle === 'sql' || lifecycle === 'opportunity') && score >= 50) {
    actions.push({ key: 'create_deal', priority: 75, reasoning: 'Sales-qualified contact. A deal should be created to track pipeline.' });
  }

  // Nurture leads
  if (lifecycleIndex >= 1 && lifecycleIndex <= 3 && daysSinceActivity < 30) {
    actions.push({ key: 'send_nurture', priority: 60, reasoning: 'Contact is in nurture stage. Continue education and engagement.' });
  }

  // At-risk customer -> survey
  if (churnRisk > 0.5 && lifecycleIndex >= 5) {
    actions.push({ key: 'send_survey', priority: 80, reasoning: 'High churn risk detected. Gather feedback to prevent churn.' });
  }

  // Happy customer -> upsell
  if (churnRisk < 0.2 && lifecycleIndex >= 5 && score >= 70) {
    actions.push({ key: 'upsell_offer', priority: 65, reasoning: 'Loyal, engaged customer. Good candidate for upsell.' });
  }

  // Evangelist -> referral
  if (lifecycle === 'evangelist') {
    actions.push({ key: 'request_review', priority: 55, reasoning: 'Evangelist contacts can drive advocacy and referrals.' });
  }

  // MQL/SQL -> case study
  if ((lifecycle === 'mql' || lifecycle === 'sql') && score >= 40) {
    actions.push({ key: 'send_case_study', priority: 50, reasoning: 'Case studies help move prospects further in the funnel.' });
  }

  // High-engagement opportunity -> schedule call
  if (lifecycle === 'opportunity' && score >= 60) {
    actions.push({ key: 'schedule_call', priority: 85, reasoning: 'High-engagement opportunity should receive direct sales outreach.' });
  }

  // Promotional for active customers
  if (lifecycleIndex >= 5 && daysSinceActivity < 14) {
    actions.push({ key: 'send_promotion', priority: 45, reasoning: 'Active customer may respond well to a targeted promotion.' });
  }

  // Sort by priority
  actions.sort((a, b) => b.priority - a.priority);

  if (actions.length === 0) {
    actions.push({ key: 'send_nurture', priority: 30, reasoning: 'Default action: continue nurturing the contact.' });
  }

  const primary = actions[0];

  return {
    action: {
      ...ACTION_CATALOG[primary.key],
      key: primary.key
    },
    priority: primary.priority,
    reasoning: primary.reasoning,
    alternatives: actions.slice(1, 4).map(a => ({
      ...ACTION_CATALOG[a.key],
      key: a.key,
      priority: a.priority,
      reasoning: a.reasoning
    })),
    contactScore: score,
    churnRisk,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Recommend the best campaign type for a contact.
 *
 * @param {Object} contact - Contact document
 * @returns {Object} { recommended, reasoning, alternatives }
 */
function recommendCampaign(contact) {
  if (!contact) {
    throw new Error('Contact is required');
  }

  const lifecycle = contact.lifecycle || 'subscriber';
  const status = contact.status || 'lead';

  const scored = [];

  for (const [key, def] of Object.entries(CAMPAIGN_TYPES)) {
    let score = 0;

    if (def.suitableFor.includes(lifecycle)) score += 50;
    if (def.suitableFor.includes(status)) score += 20;

    // Boost re-engagement for inactive
    if (key === 'reengagement' && (status === 'inactive' || status === 'churned')) score += 30;

    // Boost onboarding for new
    const ageDays = contact.createdAt
      ? (Date.now() - new Date(contact.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      : 999;
    if (key === 'onboarding' && ageDays < 14) score += 25;

    // Boost upsell for engaged customers
    if (key === 'upsell_cross_sell' && (contact.engagementScore || 0) > 60) score += 20;

    scored.push({ key, ...def, score });
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored[0];

  return {
    recommended: {
      type: top.key,
      label: top.label,
      score: top.score
    },
    reasoning: `Based on lifecycle stage (${lifecycle}) and status (${status}), ${top.label} is the most appropriate campaign type.`,
    alternatives: scored.slice(1, 3).map(s => ({ type: s.key, label: s.label, score: s.score })),
    generatedAt: new Date().toISOString()
  };
}

/**
 * Find the optimal email send time for a contact by analyzing past engagement.
 *
 * @param {Object} contact - Contact document
 * @param {Array} events - Past events (especially email_open, email_click)
 * @returns {Object} { bestHour, bestDay, confidence, heatmap }
 */
function optimizeSendTime(contact, events = []) {
  if (!contact) {
    throw new Error('Contact is required');
  }

  const engagementEvents = events.filter(
    e => e.type === 'email_open' || e.type === 'email_click' || e.type === 'page_view'
  );

  // Build hour and day histograms
  const hourCounts = new Array(24).fill(0);
  const dayCounts = new Array(7).fill(0);

  for (const event of engagementEvents) {
    const date = new Date(event.timestamp);
    if (isNaN(date.getTime())) continue;
    hourCounts[date.getHours()]++;
    dayCounts[date.getDay()]++;
  }

  // Find best hour and day
  let bestHour = 10; // default
  let maxHourCount = 0;
  for (let h = 0; h < 24; h++) {
    if (hourCounts[h] > maxHourCount) {
      maxHourCount = hourCounts[h];
      bestHour = h;
    }
  }

  let bestDay = 2; // default Tuesday
  let maxDayCount = 0;
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  for (let d = 0; d < 7; d++) {
    if (dayCounts[d] > maxDayCount) {
      maxDayCount = dayCounts[d];
      bestDay = d;
    }
  }

  const totalEvents = engagementEvents.length;
  const confidence = Math.min(1, totalEvents / 20);

  return {
    bestHour,
    bestHourFormatted: `${bestHour.toString().padStart(2, '0')}:00`,
    bestDay,
    bestDayName: dayNames[bestDay],
    confidence: Math.round(confidence * 100) / 100,
    heatmap: {
      hours: hourCounts,
      days: dayCounts
    },
    recommendation: confidence >= 0.5
      ? `Send emails on ${dayNames[bestDay]} around ${bestHour.toString().padStart(2, '0')}:00 for best engagement.`
      : 'Not enough data for reliable optimization. Using industry defaults (Tuesday 10:00).',
    generatedAt: new Date().toISOString()
  };
}

/**
 * Generate A/B test subject line variants from an original subject.
 *
 * @param {string} originalSubject - The original email subject line
 * @param {Object} [options] - { firstName, count }
 * @returns {Object} { original, variants }
 */
function generateSubjectVariants(originalSubject, options = {}) {
  if (!originalSubject || typeof originalSubject !== 'string') {
    throw new Error('Original subject is required');
  }

  const { firstName = '', count = 4 } = options;

  // Extract main topic from original subject
  const topic = originalSubject
    .replace(/^(re:|fwd:|fw:)\s*/i, '')
    .replace(/[!?.]+$/, '')
    .trim();

  const variants = [];
  const usedCategories = new Set();

  for (const [category, templates] of Object.entries(SUBJECT_TEMPLATES)) {
    if (variants.length >= count) break;

    const template = templates[Math.floor(Math.random() * templates.length)];
    let variant = template
      .replace(/\{\{topic\}\}/g, topic)
      .replace(/\{\{firstName\}\}/g, firstName || 'there');

    // Skip if too similar to original or already generated
    if (variant.toLowerCase() === originalSubject.toLowerCase()) continue;
    if (usedCategories.has(category)) continue;

    usedCategories.add(category);
    variants.push({
      subject: variant,
      category,
      estimatedLift: _estimateSubjectLift(category)
    });
  }

  // Add an emoji variant
  if (variants.length < count) {
    const emojis = ['\u{1F680}', '\u{2B50}', '\u{1F525}', '\u{1F4A1}', '\u{1F3AF}', '\u{1F389}'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    variants.push({
      subject: `${emoji} ${originalSubject}`,
      category: 'emoji',
      estimatedLift: '5-15%'
    });
  }

  // Add a shorter variant
  if (variants.length < count && originalSubject.length > 30) {
    const words = topic.split(' ');
    const shortSubject = words.slice(0, Math.ceil(words.length / 2)).join(' ');
    variants.push({
      subject: shortSubject,
      category: 'concise',
      estimatedLift: '3-10%'
    });
  }

  return {
    original: originalSubject,
    variants: variants.slice(0, count),
    generatedAt: new Date().toISOString()
  };
}

/**
 * Predict campaign performance metrics.
 *
 * @param {Object} campaign - Campaign document
 * @param {Object} segment - Segment info with member data
 * @returns {Object} { openRate, clickRate, conversionRate, estimatedRevenue, confidence }
 */
function predictCampaignPerformance(campaign, segment) {
  if (!campaign) {
    throw new Error('Campaign is required');
  }

  // Industry benchmarks by campaign type
  const benchmarks = {
    email: { openRate: 21.5, clickRate: 2.3, conversionRate: 1.0 },
    sms: { openRate: 98, clickRate: 19, conversionRate: 5.0 },
    push: { openRate: 50, clickRate: 7, conversionRate: 2.0 },
    social: { openRate: 30, clickRate: 3, conversionRate: 1.5 },
    multi_channel: { openRate: 35, clickRate: 5, conversionRate: 2.5 }
  };

  const base = benchmarks[campaign.type] || benchmarks.email;

  // Adjustments based on campaign characteristics
  let openMultiplier = 1.0;
  let clickMultiplier = 1.0;
  let conversionMultiplier = 1.0;

  // AB testing boost
  if (campaign.abTest && campaign.abTest.enabled) {
    openMultiplier += 0.10;
    clickMultiplier += 0.08;
  }

  // AI optimization boost
  if (campaign.aiOptimized) {
    openMultiplier += 0.15;
    clickMultiplier += 0.12;
    conversionMultiplier += 0.10;
  }

  // Send time optimization boost
  if (campaign.aiSendTimeOptimization) {
    openMultiplier += 0.08;
  }

  // Subject line length factor
  if (campaign.subject) {
    const len = campaign.subject.length;
    if (len >= 30 && len <= 50) openMultiplier += 0.05; // optimal length
    if (len > 80) openMultiplier -= 0.10;
  }

  // Segment quality factor
  const memberCount = segment ? (segment.memberCount || (segment.members ? segment.members.length : 0)) : 100;
  if (segment && segment.type === 'dynamic') {
    clickMultiplier += 0.05;
    conversionMultiplier += 0.05;
  }
  if (segment && segment.aiGenerated) {
    clickMultiplier += 0.10;
    conversionMultiplier += 0.08;
  }

  const openRate = Math.round(base.openRate * openMultiplier * 100) / 100;
  const clickRate = Math.round(base.clickRate * clickMultiplier * 100) / 100;
  const conversionRate = Math.round(base.conversionRate * conversionMultiplier * 100) / 100;

  const estimatedOpens = Math.round(memberCount * openRate / 100);
  const estimatedClicks = Math.round(memberCount * clickRate / 100);
  const estimatedConversions = Math.round(memberCount * conversionRate / 100);

  // Confidence based on historical data
  const hasHistoricalData = campaign.metrics && campaign.metrics.sent > 0;
  const confidence = hasHistoricalData ? 0.75 : 0.45;

  return {
    openRate,
    clickRate,
    conversionRate,
    estimatedOpens,
    estimatedClicks,
    estimatedConversions,
    audienceSize: memberCount,
    confidence,
    generatedAt: new Date().toISOString()
  };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function _estimateSubjectLift(category) {
  const lifts = {
    urgency: '10-25%',
    question: '8-20%',
    personal: '15-30%',
    benefit: '10-20%',
    social_proof: '5-15%'
  };
  return lifts[category] || '5-10%';
}

module.exports = {
  getNextBestAction,
  recommendCampaign,
  optimizeSendTime,
  generateSubjectVariants,
  predictCampaignPerformance
};
