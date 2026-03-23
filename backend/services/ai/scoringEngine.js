'use strict';

/**
 * AI Scoring Engine
 *
 * Rule-based contact scoring, churn prediction, and lifetime value estimation.
 * No external AI APIs - uses statistical methods and weighted heuristics.
 */

const SCORE_WEIGHTS = {
  engagement: 0.30,
  profileCompleteness: 0.15,
  recency: 0.25,
  purchaseHistory: 0.30
};

const ENGAGEMENT_EVENT_SCORES = {
  email_open: 2,
  email_click: 5,
  page_view: 1,
  form_submit: 10,
  product_view: 3,
  add_to_cart: 7,
  checkout: 15,
  purchase: 20,
  campaign_interaction: 4,
  login: 1,
  signup: 10,
  support_ticket: 2,
  custom: 1
};

const PROFILE_FIELDS = [
  'firstName', 'lastName', 'email', 'phone', 'company',
  'title', 'source', 'address', 'tags', 'lifecycle'
];

/**
 * Calculate a composite score (0-100) for a contact.
 * @param {Object} contact - Contact document
 * @param {Array} events - Array of event documents for this contact
 * @returns {Object} { score, breakdown }
 */
function calculateContactScore(contact, events = []) {
  if (!contact) {
    throw new Error('Contact is required for scoring');
  }

  const engagementScore = _calculateEngagementScore(events);
  const completenessScore = _calculateProfileCompleteness(contact);
  const recencyScore = _calculateRecencyScore(contact, events);
  const purchaseScore = _calculatePurchaseScore(events);

  const rawScore =
    engagementScore * SCORE_WEIGHTS.engagement +
    completenessScore * SCORE_WEIGHTS.profileCompleteness +
    recencyScore * SCORE_WEIGHTS.recency +
    purchaseScore * SCORE_WEIGHTS.purchaseHistory;

  const score = Math.round(Math.min(100, Math.max(0, rawScore)));

  return {
    score,
    breakdown: {
      engagement: Math.round(engagementScore),
      profileCompleteness: Math.round(completenessScore),
      recency: Math.round(recencyScore),
      purchaseHistory: Math.round(purchaseScore)
    },
    calculatedAt: new Date().toISOString()
  };
}

/**
 * Predict churn risk for a contact (0 = no risk, 1 = certain churn).
 * @param {Object} contact - Contact document
 * @param {Array} events - Array of event documents
 * @returns {Object} { risk, factors }
 */
function predictChurnRisk(contact, events = []) {
  if (!contact) {
    throw new Error('Contact is required for churn prediction');
  }

  const factors = {};

  // Factor 1: Days since last activity (0-1, higher = riskier)
  const lastActivityDate = contact.lastActivity
    ? new Date(contact.lastActivity)
    : _getLastEventDate(events);
  const daysSinceLastActivity = lastActivityDate
    ? (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
    : 365;
  factors.inactivityRisk = Math.min(1, daysSinceLastActivity / 90);

  // Factor 2: Declining engagement trend (0-1)
  factors.engagementDecline = _calculateEngagementTrend(events);

  // Factor 3: Support ticket frequency (0-1)
  const supportTickets = events.filter(e => e.type === 'support_ticket');
  const recentTickets = supportTickets.filter(
    e => (Date.now() - new Date(e.timestamp).getTime()) < 30 * 24 * 60 * 60 * 1000
  );
  factors.supportTicketRisk = Math.min(1, recentTickets.length / 5);

  // Factor 4: Lifecycle stage comparison
  const lifecycleOrder = ['subscriber', 'lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist'];
  const stageIndex = lifecycleOrder.indexOf(contact.lifecycle || 'subscriber');
  const customerAge = contact.createdAt
    ? (Date.now() - new Date(contact.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    : 0;
  const expectedStage = Math.min(lifecycleOrder.length - 1, Math.floor(customerAge / 60));
  factors.lifecycleLag = stageIndex < expectedStage ? Math.min(1, (expectedStage - stageIndex) / 3) : 0;

  // Weighted combination
  const risk =
    factors.inactivityRisk * 0.35 +
    factors.engagementDecline * 0.30 +
    factors.supportTicketRisk * 0.15 +
    factors.lifecycleLag * 0.20;

  return {
    risk: Math.round(risk * 100) / 100,
    factors,
    level: risk > 0.7 ? 'high' : risk > 0.4 ? 'medium' : 'low',
    calculatedAt: new Date().toISOString()
  };
}

/**
 * Predict customer lifetime value.
 * @param {Object} contact - Contact document
 * @param {Array} events - Array of event documents
 * @returns {Object} { ltv, confidence, breakdown }
 */
function predictLTV(contact, events = []) {
  if (!contact) {
    throw new Error('Contact is required for LTV prediction');
  }

  const purchases = events.filter(e => e.type === 'purchase' && e.revenue);

  // Average order value
  const totalRevenue = purchases.reduce((sum, e) => sum + (e.revenue || 0), 0);
  const avgOrderValue = purchases.length > 0 ? totalRevenue / purchases.length : 0;

  // Purchase frequency (purchases per month)
  const customerAgeDays = contact.createdAt
    ? (Date.now() - new Date(contact.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    : 30;
  const customerAgeMonths = Math.max(1, customerAgeDays / 30);
  const purchaseFrequency = purchases.length / customerAgeMonths;

  // Engagement multiplier (1.0 - 1.5)
  const engagementScore = _calculateEngagementScore(events);
  const engagementMultiplier = 1 + (engagementScore / 100) * 0.5;

  // Predict 24-month LTV
  const projectionMonths = 24;
  const churn = predictChurnRisk(contact, events);
  const retentionRate = 1 - churn.risk;
  const monthlyValue = avgOrderValue * purchaseFrequency;
  let ltv = 0;
  for (let m = 1; m <= projectionMonths; m++) {
    ltv += monthlyValue * Math.pow(retentionRate, m);
  }
  ltv *= engagementMultiplier;

  // Confidence based on data availability
  const confidence = Math.min(1, purchases.length / 5) * 0.5 +
    Math.min(1, customerAgeDays / 180) * 0.3 +
    (events.length > 10 ? 0.2 : events.length * 0.02);

  return {
    ltv: Math.round(ltv * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    breakdown: {
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      purchaseFrequency: Math.round(purchaseFrequency * 100) / 100,
      retentionRate: Math.round(retentionRate * 100) / 100,
      engagementMultiplier: Math.round(engagementMultiplier * 100) / 100,
      projectionMonths
    },
    calculatedAt: new Date().toISOString()
  };
}

/**
 * Score multiple contacts in batch.
 * @param {Array} contacts - Array of contact documents
 * @param {Object} eventsMap - Map of contactId -> events array
 * @returns {Array} Array of { contactId, score, churnRisk, ltv }
 */
function batchScoreContacts(contacts, eventsMap = {}) {
  if (!Array.isArray(contacts)) {
    throw new Error('Contacts must be an array');
  }

  return contacts.map(contact => {
    const contactId = contact._id ? contact._id.toString() : contact.id;
    const events = eventsMap[contactId] || [];

    try {
      const scoreResult = calculateContactScore(contact, events);
      const churnResult = predictChurnRisk(contact, events);
      const ltvResult = predictLTV(contact, events);

      return {
        contactId,
        score: scoreResult.score,
        scoreBreakdown: scoreResult.breakdown,
        churnRisk: churnResult.risk,
        churnLevel: churnResult.level,
        ltv: ltvResult.ltv,
        ltvConfidence: ltvResult.confidence,
        calculatedAt: new Date().toISOString()
      };
    } catch (err) {
      return {
        contactId,
        error: err.message,
        score: 0,
        churnRisk: 0,
        ltv: 0
      };
    }
  });
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function _calculateEngagementScore(events) {
  if (!events || events.length === 0) return 0;

  const now = Date.now();
  let score = 0;

  for (const event of events) {
    const eventAge = (now - new Date(event.timestamp || event.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const baseScore = ENGAGEMENT_EVENT_SCORES[event.type] || 1;
    // Decay: events lose value over time
    const decayFactor = Math.max(0, 1 - eventAge / 180);
    score += baseScore * decayFactor;
  }

  // Normalize to 0-100
  return Math.min(100, score);
}

function _calculateProfileCompleteness(contact) {
  let filled = 0;
  for (const field of PROFILE_FIELDS) {
    const value = contact[field];
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value) && value.length === 0) continue;
      if (typeof value === 'object' && !Array.isArray(value)) {
        const hasValues = Object.values(value).some(v => v !== undefined && v !== null && v !== '');
        if (hasValues) filled++;
      } else {
        filled++;
      }
    }
  }
  return (filled / PROFILE_FIELDS.length) * 100;
}

function _calculateRecencyScore(contact, events) {
  const lastActivityDate = contact.lastActivity
    ? new Date(contact.lastActivity)
    : _getLastEventDate(events);

  if (!lastActivityDate) return 0;

  const daysSince = (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSince <= 1) return 100;
  if (daysSince <= 7) return 85;
  if (daysSince <= 14) return 70;
  if (daysSince <= 30) return 55;
  if (daysSince <= 60) return 35;
  if (daysSince <= 90) return 15;
  return 5;
}

function _calculatePurchaseScore(events) {
  const purchases = events.filter(e => e.type === 'purchase' && e.revenue);
  if (purchases.length === 0) return 0;

  const totalRevenue = purchases.reduce((sum, e) => sum + (e.revenue || 0), 0);
  const recentPurchases = purchases.filter(
    e => (Date.now() - new Date(e.timestamp).getTime()) < 90 * 24 * 60 * 60 * 1000
  );

  // Score based on total revenue + recency of purchases
  const revenueScore = Math.min(50, totalRevenue / 100);
  const frequencyScore = Math.min(30, purchases.length * 5);
  const recencyBonus = recentPurchases.length > 0 ? 20 : 0;

  return Math.min(100, revenueScore + frequencyScore + recencyBonus);
}

function _calculateEngagementTrend(events) {
  if (!events || events.length < 4) return 0.3; // Not enough data, default moderate

  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;

  const recentEvents = events.filter(e => new Date(e.timestamp).getTime() > thirtyDaysAgo);
  const olderEvents = events.filter(e => {
    const t = new Date(e.timestamp).getTime();
    return t > sixtyDaysAgo && t <= thirtyDaysAgo;
  });

  if (olderEvents.length === 0) return 0.1;

  const ratio = recentEvents.length / olderEvents.length;
  // ratio < 1 means declining engagement
  if (ratio >= 1) return 0;
  return Math.min(1, (1 - ratio));
}

function _getLastEventDate(events) {
  if (!events || events.length === 0) return null;
  const sorted = events
    .map(e => new Date(e.timestamp || e.createdAt))
    .filter(d => !isNaN(d.getTime()))
    .sort((a, b) => b - a);
  return sorted.length > 0 ? sorted[0] : null;
}

module.exports = {
  calculateContactScore,
  predictChurnRisk,
  predictLTV,
  batchScoreContacts
};
